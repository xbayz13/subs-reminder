import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { createUserRoutes } from "../users.routes";
import { UserService } from "@/application/users/UserService";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import {
  setupTestDatabase,
  teardownTestDatabase,
  createTestUser,
  createMockSession,
  createAuthenticatedRequest,
  cleanupTestData,
} from "@/__tests__/helpers/test-helpers";

/**
 * Integration tests for User Routes
 */
describe("User Routes Integration", () => {
  let prisma: Awaited<ReturnType<typeof setupTestDatabase>>;
  let userService: UserService;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let session: ReturnType<typeof createMockSession>;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    testUser = await createTestUser(prisma);
    session = createMockSession(testUser.id, testUser.email);

    const userRepo = new PrismaUserRepository(prisma);
    userService = new UserService(userRepo);
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(prisma, testUser.id);
    }
    await teardownTestDatabase(prisma);
  });

  test("GET /api/users/me returns user profile", async () => {
    const routes = createUserRoutes(userService);
    const handler = routes["/api/users/me"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/users/me",
      {},
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.uuid).toBe(testUser.id);
    expect(data.data.email).toBe(testUser.email);
  });

  test("PUT /api/users/me updates user profile", async () => {
    const routes = createUserRoutes(userService);
    const handler = routes["/api/users/me"]?.PUT;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const updateData = {
      name: "Updated Name",
      country: "ID",
      currency: "IDR",
    };

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/users/me",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      },
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.name).toBe(updateData.name);
    expect(data.data.country).toBe(updateData.country);
    expect(data.data.currency).toBe(updateData.currency);
  });

  test("PUT /api/users/me validates email format", async () => {
    const routes = createUserRoutes(userService);
    const handler = routes["/api/users/me"]?.PUT;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/users/me",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid-email" }),
      },
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid email");
  });

  test("GET /api/users/me requires authentication", async () => {
    const routes = createUserRoutes(userService);
    const handler = routes["/api/users/me"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = new Request("http://localhost:3000/api/users/me");

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

