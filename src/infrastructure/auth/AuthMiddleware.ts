import { SessionManager, type SessionData } from "./SessionManager";
import type { CookieMap } from "bun";

/**
 * Request with session data
 * Note: cookies is readonly in Bun's Request, so we don't include it in the interface
 */
export interface AuthenticatedRequest extends Request {
  session: SessionData;
}

/**
 * Authentication Middleware
 * 
 * Validates session and attaches user session to request.
 * Returns 401 if session is invalid or missing.
 * Uses Bun's CookieMap API for reliable cookie handling.
 */
export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    // Get cookies from request (Bun automatically provides this in Bun.serve())
    // Type assertion needed because Request type doesn't include cookies
    const cookies = (req as any).cookies as CookieMap | undefined;
    
    if (!cookies) {
      console.log("[AUTH] ❌ No cookies object in request, trying legacy method");
      // Fallback to legacy method if CookieMap not available
      const session = SessionManager.getSessionLegacy(req);
      if (!session || !SessionManager.isValidSession(session)) {
        return Response.json(
          { error: "Unauthorized", message: "Please login to access this resource" },
          { status: 401 }
        );
      }
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.session = session;
      // Note: cookies is readonly, so we don't assign it
      return handler(authenticatedReq);
    }
    
    const session = await SessionManager.getSession(cookies);

    if (!session || !SessionManager.isValidSession(session)) {
      console.log("[AUTH] ❌ Invalid or missing session");
      return Response.json(
        { error: "Unauthorized", message: "Please login to access this resource" },
        { status: 401 }
      );
    }

    // Attach session to request
    // Note: cookies is readonly in Bun's Request, so we don't assign it
    // Handler can access cookies via (req as any).cookies if needed
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.session = session;

    return handler(authenticatedReq);
  };
}

/**
 * Optional Auth Middleware
 * 
 * Attaches session if available, but doesn't require it.
 * Uses Bun's CookieMap API for reliable cookie handling.
 */
export function optionalAuth(handler: (req: Request & { session?: SessionData }) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    // Get cookies from request (Bun automatically provides this in Bun.serve())
    const cookies = (req as any).cookies as CookieMap | undefined;
    
    let session: SessionData | null = null;
    if (cookies) {
      session = await SessionManager.getSession(cookies);
    } else {
      // Fallback to legacy method if CookieMap not available
      session = SessionManager.getSessionLegacy(req);
    }
    
    const reqWithSession = req as Request & { session?: SessionData };
    
    if (session && SessionManager.isValidSession(session)) {
      reqWithSession.session = session;
      // Note: cookies is readonly, so we don't assign it
      // Handler can access cookies via (req as any).cookies if needed
    }

    return handler(reqWithSession);
  };
}

