import { env } from "@/config/env";
import { createHmac } from "crypto";
import type { CookieMap } from "bun";
import { prisma } from "@/infrastructure/database/PrismaClient";

/**
 * Session Data Interface
 */
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  avatar?: string | null;
  googleId: string;
  accessToken?: string;
  refreshToken?: string | null;
  createdAt: number;
  expiresAt: number;
}

/**
 * Session Manager
 * 
 * Manages user sessions using signed cookies.
 * Uses HMAC for cookie signing to prevent tampering.
 * Uses Bun's built-in CookieMap API for reliable cookie handling.
 */
export class SessionManager {
  private static readonly COOKIE_NAME = "session";
  private static readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly MAX_AGE_SECONDS = Math.floor(this.MAX_AGE / 1000);
  private static readonly SESSION_SECRET = env.SESSION_SECRET;

  /**
   * Create a signed session cookie
   */
  private static signCookie(value: string): string {
    const hmac = createHmac("sha256", this.SESSION_SECRET);
    hmac.update(value);
    return `${value}.${hmac.digest("base64url")}`;
  }

  /**
   * Verify and extract value from signed cookie
   * 
   * Note: We split on the LAST dot to separate value and signature,
   * because the value (JSON) may contain dots (e.g., in email addresses).
   */
  private static verifyCookie(signedValue: string): string | null {
    const lastDotIndex = signedValue.lastIndexOf(".");
    if (lastDotIndex === -1) return null;
    
    const value = signedValue.substring(0, lastDotIndex);
    const signature = signedValue.substring(lastDotIndex + 1);
    
    if (!value || !signature) return null;

    const expectedSignature = createHmac("sha256", this.SESSION_SECRET)
      .update(value)
      .digest("base64url");

    if (signature !== expectedSignature) return null;
    return value;
  }

  /**
   * Create session from user data
   */
  static createSession(data: {
    userId: string;
    email: string;
    name: string;
    avatar?: string | null;
    googleId: string;
    accessToken?: string;
    refreshToken?: string | null;
  }): SessionData {
    const now = Date.now();
    return {
      ...data,
      createdAt: now,
      expiresAt: now + this.MAX_AGE,
    };
  }

  /**
   * Set session cookie using Bun's CookieMap API
   * Also saves session to database for tracking and debugging
   */
  static async setSessionCookie(cookies: CookieMap, session: SessionData): Promise<void> {
    const sessionJson = JSON.stringify(session);
    const signedCookie = this.signCookie(sessionJson);
    
    // Use Bun's CookieMap API - automatically handles Set-Cookie header
    cookies.set(this.COOKIE_NAME, signedCookie, {
      path: "/",
      httpOnly: true,
      sameSite: "lax", // Allows cookies on top-level navigations (OAuth redirects)
      maxAge: this.MAX_AGE_SECONDS,
      secure: env.NODE_ENV === "production",
    });
    
    // Save session to database
    try {
      // Delete old sessions for this user first
      await prisma.session.deleteMany({
        where: {
          userId: session.userId,
        },
      });
      
      // Create new session in database
      await prisma.session.create({
        data: {
          userId: session.userId,
          token: signedCookie,
          expiresAt: new Date(session.expiresAt),
        },
      });
      
      console.log("[SESSION] ✅ Cookie set via Bun CookieMap API and saved to database");
      console.log("[SESSION] Token length:", signedCookie.length, "characters");
    } catch (error) {
      console.error("[SESSION] ❌ Error saving session to database:", error);
      if (error instanceof Error) {
        console.error("[SESSION] Error message:", error.message);
        console.error("[SESSION] Error stack:", error.stack);
      }
      // Don't fail if database save fails - cookie is still set
      console.log("[SESSION] ⚠️ Cookie set but database save failed");
    }
  }
  
  /**
   * Set session cookie in response (legacy method for compatibility)
   * @deprecated Use setSessionCookie(cookies, session) instead
   */
  static setSessionCookieLegacy(response: Response, session: SessionData): void {
    const sessionJson = JSON.stringify(session);
    const signedCookie = this.signCookie(sessionJson);
    
    const cookieValue = `${this.COOKIE_NAME}=${signedCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${this.MAX_AGE_SECONDS}${env.NODE_ENV === "production" ? "; Secure" : ""}`;
    response.headers.set("Set-Cookie", cookieValue);
  }

  /**
   * Get session from Bun's CookieMap API
   * Also verifies session exists in database
   */
  static async getSession(cookies: CookieMap): Promise<SessionData | null> {
    console.log("[SESSION] Getting session from Bun CookieMap");
    
    const signedValue = cookies.get(this.COOKIE_NAME);
    
    if (!signedValue) {
      console.log("[SESSION] ❌ No session cookie found in CookieMap");
      return null;
    }

    console.log("[SESSION] Session cookie found, verifying signature...");
    const sessionJson = this.verifyCookie(signedValue);
    if (!sessionJson) {
      console.log("[SESSION] ❌ Cookie verification failed");
      return null;
    }

    try {
      const session: SessionData = JSON.parse(sessionJson);
      
      // Check if session is expired
      const isExpired = Date.now() > session.expiresAt;
      console.log("[SESSION] Session parsed:", {
        userId: session.userId,
        email: session.email,
        expiresAt: new Date(session.expiresAt).toISOString(),
        isExpired: isExpired,
      });
      
      if (isExpired) {
        console.log("[SESSION] ❌ Session expired");
        // Clean up expired session from database
        await this.cleanupExpiredSession(session.userId, signedValue);
        return null;
      }

      // Verify session exists in database
      try {
        const dbSession = await prisma.session.findUnique({
          where: {
            token: signedValue,
          },
        });
        
        if (!dbSession) {
          console.log("[SESSION] ⚠️ Session not found in database (may be from before DB migration)");
          // Don't fail - allow session to work if it's valid but not in DB yet
        } else if (dbSession.userId !== session.userId) {
          console.log("[SESSION] ❌ Session userId mismatch with database");
          return null;
        } else {
          console.log("[SESSION] ✅ Session verified in database");
        }
      } catch (error) {
        console.error("[SESSION] ❌ Error checking database session:", error);
        // Don't fail if database check fails - allow session to work
      }

      console.log("[SESSION] ✅ Valid session found");
      return session;
    } catch (error) {
      console.error("[SESSION] ❌ Error parsing session:", error);
      return null;
    }
  }
  
  /**
   * Get session from request (legacy method for compatibility)
   * @deprecated Use getSession(cookies) instead
   */
  static getSessionLegacy(request: Request): SessionData | null {
    const cookieHeader = request.headers.get("Cookie");
    console.log("[SESSION] Getting session from Cookie header");
    console.log("[SESSION] Cookie header:", cookieHeader ? "Present (length: " + cookieHeader.length + ")" : "Missing");
    
    if (!cookieHeader) {
      console.log("[SESSION] ❌ No cookies in request");
      return null;
    }

    const cookiePairs = cookieHeader.split(";").map(c => c.trim());
    const sessionCookie = cookiePairs.find(c => c.startsWith(`${this.COOKIE_NAME}=`));
    
    if (!sessionCookie) {
      console.log("[SESSION] ❌ No session cookie found");
      return null;
    }

    const signedValue = sessionCookie.split("=")[1];
    if (!signedValue) {
      console.log("[SESSION] ❌ No signed value in session cookie");
      return null;
    }

    console.log("[SESSION] Verifying cookie signature...");
    const sessionJson = this.verifyCookie(signedValue);
    if (!sessionJson) {
      console.log("[SESSION] ❌ Cookie verification failed");
      return null;
    }

    try {
      const session: SessionData = JSON.parse(sessionJson);
      
      const isExpired = Date.now() > session.expiresAt;
      if (isExpired) {
        console.log("[SESSION] ❌ Session expired");
        return null;
      }

      console.log("[SESSION] ✅ Valid session found");
      return session;
    } catch (error) {
      console.error("[SESSION] ❌ Error parsing session:", error);
      return null;
    }
  }

  /**
   * Clear session cookie using Bun's CookieMap API
   * Also removes session from database
   */
  static async clearSession(cookies: CookieMap): Promise<void> {
    const signedValue = cookies.get(this.COOKIE_NAME);
    
    // Delete from database first
    if (signedValue) {
      try {
        await prisma.session.deleteMany({
          where: {
            token: signedValue,
          },
        });
        console.log("[SESSION] ✅ Session deleted from database");
      } catch (error) {
        console.error("[SESSION] ❌ Error deleting session from database:", error);
        // Don't fail if database delete fails
      }
    }
    
    // Clear cookie
    cookies.delete(this.COOKIE_NAME, {
      path: "/",
    });
    console.log("[SESSION] ✅ Session cookie cleared");
  }
  
  /**
   * Clean up expired session from database
   */
  private static async cleanupExpiredSession(userId: string, token: string): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: {
          OR: [
            { userId },
            { token },
          ],
        },
      });
      console.log("[SESSION] ✅ Expired session cleaned up from database");
    } catch (error) {
      console.error("[SESSION] ❌ Error cleaning up expired session:", error);
    }
  }
  
  /**
   * Clean up all expired sessions (can be called periodically)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`[SESSION] ✅ Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      console.error("[SESSION] ❌ Error cleaning up expired sessions:", error);
      return 0;
    }
  }
  
  /**
   * Clear session cookie in response (legacy method for compatibility)
   * @deprecated Use clearSession(cookies) instead
   */
  static clearSessionLegacy(response: Response): void {
    const cookieValue = `${this.COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${env.NODE_ENV === "production" ? "Secure;" : ""}`;
    response.headers.set("Set-Cookie", cookieValue);
  }

  /**
   * Check if session is valid
   */
  static isValidSession(session: SessionData | null): boolean {
    if (!session) return false;
    return Date.now() < session.expiresAt;
  }
}

