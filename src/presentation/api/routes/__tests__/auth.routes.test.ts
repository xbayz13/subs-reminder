import { test, expect, describe, mock } from "bun:test";
import { createAuthRoutes } from "../auth.routes";
import type { UserService } from "@/application/users/UserService";
import { User } from "@/domain/users/entities/User";

describe("Auth Routes", () => {
  const mockUserService = {
    loginWithGoogle: mock(() => Promise.resolve(new User(
      "user-uuid",
      "Test User",
      "test@example.com",
      null,
      "US",
      "USD",
      null,
      "google-123",
      "access-token",
      "refresh-token",
      new Date(),
      new Date()
    ))),
  } as unknown as UserService;

  test("GET /auth/google redirects to Google OAuth", async () => {
    const routes = createAuthRoutes(mockUserService);
    const handler = routes["/auth/google"]?.GET;
    
    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = new Request("http://localhost:3000/auth/google");
    const response = await handler(req);

    expect(response.status).toBe(302); // Redirect
    expect(response.headers.get("Location")).toContain("accounts.google.com");
  });

  // Note: OAuth callback test would require mocking fetch, which is complex
  // Integration tests would be better for this
});

