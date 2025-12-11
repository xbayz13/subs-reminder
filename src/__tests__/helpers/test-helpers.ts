import { PrismaClient } from "@prisma/client";
import { SessionManager, type SessionData } from "@/infrastructure/auth/SessionManager";
import { createHmac } from "crypto";
import { env } from "@/config/env";

/**
 * Test Helpers
 * 
 * Utilities for integration and E2E tests
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  googleId: string;
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides?: Partial<{
    name: string;
    email: string;
    googleId: string;
    currency: string;
  }>
): Promise<TestUser> {
  const user = await prisma.user.create({
    data: {
      name: overrides?.name || "Test User",
      email: overrides?.email || `test-${Date.now()}@example.com`,
      googleId: overrides?.googleId || `test-google-${Date.now()}`,
      currency: overrides?.currency || "USD",
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    googleId: user.googleId,
  };
}

/**
 * Create a mock session for testing
 */
export function createMockSession(userId: string, email: string = "test@example.com"): SessionData {
  return SessionManager.createSession({
    userId,
    email,
    name: "Test User",
    googleId: "test-google-id",
  });
}

/**
 * Sign a cookie value (replicates SessionManager's private signCookie method)
 * 
 * This must match exactly how SessionManager.signCookie works internally.
 * Note: The signature is appended with a dot, and verifyCookie splits on the LAST dot.
 */
function signCookie(value: string): string {
  // Use the same SESSION_SECRET as SessionManager
  const hmac = createHmac("sha256", env.SESSION_SECRET);
  hmac.update(value);
  const signature = hmac.digest("base64url");
  // Append signature with dot - verifyCookie will split on LAST dot
  return `${value}.${signature}`;
}

/**
 * Verify that a signed cookie can be read by SessionManager
 * (for debugging test issues)
 */
export function verifyTestCookie(session: SessionData): boolean {
  const sessionJson = JSON.stringify(session);
  const signedCookie = signCookie(sessionJson);
  
  // Create a mock request to test if SessionManager can read it
  const testReq = new Request("http://localhost:3000/test", {
    headers: {
      Cookie: `session=${signedCookie}`,
    },
  });
  
  const readSession = SessionManager.getSession(testReq);
  return readSession !== null && readSession.userId === session.userId;
}

/**
 * Create a request with session cookie
 * 
 * Note: This creates a properly signed cookie that SessionManager can read.
 * The cookie format must match exactly what SessionManager expects.
 */
export function createAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  session: SessionData
): Request & { session?: SessionData; cookies?: Map<string, string> } {
  const sessionJson = JSON.stringify(session);
  const signedCookie = signCookie(sessionJson);

  const headers = new Headers(options.headers);
  // Ensure cookie format matches SessionManager's expectation
  headers.set("Cookie", `session=${signedCookie}`);

  const req = new Request(url, {
    ...options,
    headers,
  }) as Request & { session?: SessionData; cookies?: Map<string, string> };
  
  // Mock Bun's CookieMap for tests
  // In real Bun.serve(), this is automatically provided
  const cookies = new Map<string, string>();
  cookies.set("session", signedCookie);
  req.cookies = cookies;
  
  // Also attach session directly to request for middleware that might need it
  req.session = session;
  
  return req;
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(prisma: PrismaClient, userId: string): Promise<void> {
  // Delete in correct order (due to foreign keys)
  await prisma.installment.deleteMany({
    where: { subscription: { userId } },
  });
  await prisma.subscription.deleteMany({
    where: { userId },
  });
  await prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * Setup test database connection
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  const prisma = new PrismaClient();
  return prisma;
}

/**
 * Teardown test database connection
 */
export async function teardownTestDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$disconnect();
}

