import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { createDashboardRoutes } from "../dashboard.routes";
import { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { InstallmentService } from "@/application/installments/InstallmentService";
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
 * Integration tests for Dashboard Routes
 */
describe("Dashboard Routes Integration", () => {
  let prisma: Awaited<ReturnType<typeof setupTestDatabase>>;
  let subscriptionService: SubscriptionService;
  let installmentService: InstallmentService;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let session: ReturnType<typeof createMockSession>;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    testUser = await createTestUser(prisma);
    session = createMockSession(testUser.id, testUser.email);

    const userRepo = new PrismaUserRepository();
    const subscriptionRepo = new PrismaSubscriptionRepository();
    const installmentRepo = new PrismaInstallmentRepository();

    subscriptionService = new SubscriptionService(
      subscriptionRepo,
      installmentRepo,
      userRepo
    );

    installmentService = new InstallmentService(installmentRepo, subscriptionRepo, userRepo);

    // Create test subscriptions
    await subscriptionService.createSubscription(
      testUser.id,
      {
        name: "Netflix",
        description: null,
        day: 15,
        month: null,
        price: 9.99,
        type: SubscriptionType.MONTHLY,
        reminderStart: ReminderStart.D_1,
        lastday: undefined,
      },
      undefined,
      undefined
    );

    await subscriptionService.createSubscription(
      testUser.id,
      {
        name: "Spotify",
        description: null,
        day: 20,
        month: null,
        price: 14.99,
        type: SubscriptionType.MONTHLY,
        reminderStart: ReminderStart.D_3,
        lastday: undefined,
      },
      undefined,
      undefined
    );
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(prisma, testUser.id);
    }
    await teardownTestDatabase(prisma);
  });

  test("GET /api/dashboard returns dashboard data", async () => {
    const routes = createDashboardRoutes(subscriptionService, installmentService);
    const handler = routes["/api/dashboard"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/dashboard",
      {},
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.nextPayments).toBeDefined();
    expect(data.data.topSubscriptions).toBeDefined();
    expect(data.data.statistics).toBeDefined();
    expect(Array.isArray(data.data.nextPayments)).toBe(true);
    expect(Array.isArray(data.data.topSubscriptions)).toBe(true);
    expect(typeof data.data.statistics).toBe("object");
  });

  test("GET /api/dashboard requires authentication", async () => {
    const routes = createDashboardRoutes(subscriptionService, installmentService);
    const handler = routes["/api/dashboard"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = new Request("http://localhost:3000/api/dashboard");

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

