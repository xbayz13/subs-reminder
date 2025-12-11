import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { createSubscriptionRoutes } from "../subscriptions.routes";
import { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { PrismaSubscriptionRepository } from "@/infrastructure/repositories/PrismaSubscriptionRepository";
import { PrismaInstallmentRepository } from "@/infrastructure/repositories/PrismaInstallmentRepository";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import {
  setupTestDatabase,
  teardownTestDatabase,
  createTestUser,
  createMockSession,
  createAuthenticatedRequest,
  cleanupTestData,
} from "@/__tests__/helpers/test-helpers";

/**
 * Integration tests for Subscription Routes
 * 
 * Note: These tests require a running database.
 * Set DATABASE_URL in .env.test or skip these tests if database is not available.
 */
describe("Subscription Routes Integration", () => {
  let prisma: Awaited<ReturnType<typeof setupTestDatabase>>;
  let subscriptionService: SubscriptionService;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let session: ReturnType<typeof createMockSession>;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    testUser = await createTestUser(prisma);
    session = createMockSession(testUser.id, testUser.email);

    // Setup services
    const userRepo = new PrismaUserRepository();
    const subscriptionRepo = new PrismaSubscriptionRepository();
    const installmentRepo = new PrismaInstallmentRepository();

    subscriptionService = new SubscriptionService(
      subscriptionRepo,
      installmentRepo,
      userRepo
    );
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(prisma, testUser.id);
    }
    await teardownTestDatabase(prisma);
  });

  test("GET /api/subscriptions returns empty array for new user", async () => {
    const routes = createSubscriptionRoutes(subscriptionService);
    const handler = routes["/api/subscriptions"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/subscriptions?activeOnly=false",
      {},
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  test("POST /api/subscriptions creates subscription", async () => {
    const routes = createSubscriptionRoutes(subscriptionService);
    const handler = routes["/api/subscriptions"]?.POST;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const subscriptionData = {
      name: "Test Subscription",
      day: 15,
      month: null,
      price: 9.99,
      type: SubscriptionType.MONTHLY,
      reminderStart: ReminderStart.D_1,
    };

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/subscriptions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      },
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).toBeDefined();
    expect(data.data.name).toBe(subscriptionData.name);
    expect(data.data.price).toBe(subscriptionData.price);
    expect(data.data.type).toBe(subscriptionData.type);
  });

  test("GET /api/subscriptions/:id returns subscription", async () => {
    const routes = createSubscriptionRoutes(subscriptionService);
    
    // First create a subscription
    const createHandler = routes["/api/subscriptions"]?.POST;
    if (!createHandler) throw new Error("Create handler not found");

    const subscriptionData = {
      name: "Test Subscription 2",
      day: 15,
      month: 6, // June
      price: 14.99,
      type: "YEARLY",
      reminderStart: ReminderStart.D_7,
    };

    const createReq = createAuthenticatedRequest(
      "http://localhost:3000/api/subscriptions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      },
      session
    );

    const createResponse = await createHandler(createReq);
    const createData = await createResponse.json();
    const subscriptionId = createData.data.uuid;

    // Then get it
    const getHandler = routes["/api/subscriptions/:id"]?.GET;
    if (!getHandler) throw new Error("Get handler not found");

    const getReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {},
      session
    );

    const getResponse = await getHandler(getReq);
    const getData = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(getData.data.uuid).toBe(subscriptionId);
    expect(getData.data.name).toBe(subscriptionData.name);
  });

  test("PUT /api/subscriptions/:id updates subscription", async () => {
    const routes = createSubscriptionRoutes(subscriptionService);
    
    // Create subscription first
    const createHandler = routes["/api/subscriptions"]?.POST;
    if (!createHandler) throw new Error("Create handler not found");

    const createReq = createAuthenticatedRequest(
      "http://localhost:3000/api/subscriptions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Original Name",
          day: 10,
          month: null,
          price: 9.99,
          type: "MONTHLY",
          reminderStart: "D_1",
        }),
      },
      session
    );

    const createResponse = await createHandler(createReq);
    const createData = await createResponse.json();
    const subscriptionId = createData.data.uuid;

    // Update it
    const updateHandler = routes["/api/subscriptions/:id"]?.PUT;
    if (!updateHandler) throw new Error("Update handler not found");

    const updateReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Name",
          price: 19.99,
        }),
      },
      session
    );

    const updateResponse = await updateHandler(updateReq);
    const updateData = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateData.data.name).toBe("Updated Name");
    expect(updateData.data.price).toBe(19.99);
  });

  test("DELETE /api/subscriptions/:id deletes subscription", async () => {
    const routes = createSubscriptionRoutes(subscriptionService);
    
    // Create subscription first
    const createHandler = routes["/api/subscriptions"]?.POST;
    if (!createHandler) throw new Error("Create handler not found");

    const createReq = createAuthenticatedRequest(
      "http://localhost:3000/api/subscriptions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "To Delete",
          day: 5,
          month: null,
          price: 9.99,
          type: "MONTHLY",
          reminderStart: "D_1",
        }),
      },
      session
    );

    const createResponse = await createHandler(createReq);
    const createData = await createResponse.json();
    const subscriptionId = createData.data.uuid;

    // Delete it
    const deleteHandler = routes["/api/subscriptions/:id"]?.DELETE;
    if (!deleteHandler) throw new Error("Delete handler not found");

    const deleteReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      { method: "DELETE" },
      session
    );

    const deleteResponse = await deleteHandler(deleteReq);
    const deleteData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deleteData.message).toContain("deleted");

    // Verify it's deleted
    const getHandler = routes["/api/subscriptions/:id"]?.GET;
    if (!getHandler) throw new Error("Get handler not found");

    const getReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {},
      session
    );

    const getResponse = await getHandler(getReq);
    expect(getResponse.status).toBe(404);
  });

  test("GET /api/subscriptions requires authentication", async () => {
    const routes = createSubscriptionRoutes(subscriptionService);
    const handler = routes["/api/subscriptions"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = new Request("http://localhost:3000/api/subscriptions");

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

