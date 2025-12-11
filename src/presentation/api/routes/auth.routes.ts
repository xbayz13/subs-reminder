import type { UserService } from "@/application/users/UserService";
import { env } from "@/config/env";
import { SessionManager } from "@/infrastructure/auth/SessionManager";
import { requireAuth } from "@/infrastructure/auth/AuthMiddleware";
import type { CookieMap } from "bun";

/**
 * Authentication Routes
 * 
 * Handles Google OAuth authentication flow
 */
export function createAuthRoutes(userService: UserService) {
  return {
    /**
     * Initiate Google OAuth login
     */
    "/auth/google": {
      GET: async (req: Request) => {
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
        authUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", "openid email profile https://www.googleapis.com/auth/calendar");
        authUrl.searchParams.set("access_type", "offline");
        authUrl.searchParams.set("prompt", "consent");

        return Response.redirect(authUrl.toString());
      },
    },

    /**
     * Google OAuth callback
     */
    "/auth/google/callback": {
      GET: async (req: Request) => {
        console.log("[OAUTH] Callback received");
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        console.log("[OAUTH] Callback params:", {
          hasCode: !!code,
          hasError: !!error,
          error: error,
        });

        if (error) {
          console.error("[OAUTH] ❌ OAuth error:", error);
          return Response.json({ error }, { status: 400 });
        }

        if (!code) {
          console.error("[OAUTH] ❌ No authorization code provided");
          return Response.json({ error: "Authorization code not provided" }, { status: 400 });
        }

        try {
          console.log("[OAUTH] Exchanging code for tokens...");
          // Exchange code for tokens
          const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code,
              client_id: env.GOOGLE_CLIENT_ID,
              client_secret: env.GOOGLE_CLIENT_SECRET,
              redirect_uri: env.GOOGLE_REDIRECT_URI,
              grant_type: "authorization_code",
            }),
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("[OAUTH] ❌ Token exchange failed:", errorText);
            throw new Error("Failed to exchange code for tokens");
          }

          const tokens = await tokenResponse.json();
          console.log("[OAUTH] ✅ Tokens received (has access_token:", !!tokens.access_token, ", has refresh_token:", !!tokens.refresh_token, ")");

          // Get user info from Google
          const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text();
            console.error("[OAUTH] ❌ Failed to fetch user info:", errorText);
            throw new Error("Failed to fetch user info");
          }

          const userInfo = await userInfoResponse.json();
          console.log("[OAUTH] ✅ User info received:", {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
          });

          // Login or register user
          console.log("[OAUTH] Creating/updating user in database...");
          const user = await userService.loginWithGoogle({
            googleId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
          });
          console.log("[OAUTH] ✅ User created/updated:", {
            uuid: user.uuid,
            email: user.email,
            name: user.name,
          });

          // Create session
          console.log("[OAUTH] Creating session...");
          const session = SessionManager.createSession({
            userId: user.uuid,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            googleId: user.googleId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
          });
          console.log("[OAUTH] ✅ Session created:", {
            userId: session.userId,
            email: session.email,
            expiresAt: new Date(session.expiresAt).toISOString(),
          });

          // Get cookies from request (Bun automatically provides this in Bun.serve())
          // Type assertion needed because Request type doesn't include cookies
          const cookies = (req as any).cookies as CookieMap | undefined;
          
          const frontendUrl = new URL("/", req.url);
          frontendUrl.searchParams.set("login", "success");
          
          // Create redirect response first
          const response = Response.redirect(frontendUrl.toString(), 302);
          
          if (cookies) {
            // Use Bun's CookieMap API (preferred method)
            console.log("[OAUTH] Using Bun CookieMap API for cookies");
            
            // Clear old session cookie first
            console.log("[OAUTH] Clearing old session cookie...");
            await SessionManager.clearSession(cookies);

            // Set new session cookie using Bun's CookieMap API
            console.log("[OAUTH] Setting new session cookie via Bun CookieMap...");
            await SessionManager.setSessionCookie(cookies, session);
            
            // Bun automatically applies cookie changes from cookies.set() to the response
            console.log("[OAUTH] ✅ Cookie set via Bun CookieMap, redirecting to frontend");
          } else {
            // Fallback: Use manual Set-Cookie header if CookieMap not available
            console.log("[OAUTH] CookieMap not available, using manual Set-Cookie header");
            SessionManager.setSessionCookieLegacy(response, session);
            console.log("[OAUTH] ✅ Cookie set via manual header, redirecting to frontend");
          }
          
          console.log("[OAUTH] Redirecting to:", frontendUrl.toString());
          
          return response;
        } catch (error) {
          console.error("[OAUTH] ❌ OAuth callback error:", error);
          console.error("[OAUTH] Error stack:", error instanceof Error ? error.stack : "No stack trace");
          return Response.json(
            { error: "Authentication failed", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      },
    },

    /**
     * Get current user
     */
    "/auth/me": {
      GET: requireAuth(async (req) => {
        console.log("[AUTH] /auth/me called");
        const session = req.session;
        
        if (!session) {
          console.log("[AUTH] ❌ No session found");
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        console.log("[AUTH] ✅ Session found:", {
          userId: session.userId,
          email: session.email,
          name: session.name,
          expiresAt: new Date(session.expiresAt).toISOString(),
          isExpired: Date.now() > session.expiresAt,
        });
        
        return Response.json({
          data: {
            uuid: session.userId,
            email: session.email,
            name: session.name,
            avatar: session.avatar,
            googleId: session.googleId,
          },
        });
      }),
    },

    /**
     * Logout
     */
    "/auth/logout": {
      POST: async (req: Request) => {
        // Get cookies from request (Bun automatically provides this in Bun.serve())
        const cookies = (req as any).cookies as CookieMap | undefined;
        if (cookies) {
          await SessionManager.clearSession(cookies);
        } else {
          // Fallback: clear cookie via response header
          const response = Response.json({ message: "Logged out successfully" });
          SessionManager.clearSessionLegacy(response);
          return response;
        }
        return Response.json({ message: "Logged out successfully" });
      },
    },
  };
}

