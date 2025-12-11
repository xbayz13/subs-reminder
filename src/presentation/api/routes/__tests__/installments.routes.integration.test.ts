import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { createInstallmentRoutes } from "../installments.routes";
import { InstallmentService } from "@/application/installments/InstallmentService";
import { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { PrismaInstallmentRepository } from "@/infrastructure/repositories/PrismaInstallmentRepository";
import { PrismaSubscriptionRepository } from "@/infrastructure/repositories/PrismaSubscriptionRepository";
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
 * Integration tests for Installment Routes
 */
describe("Installment Routes Integration", () => {
  let prisma: Awaited<ReturnType<typeof setupTestDatabase>>;
  let installmentService: InstallmentService;
  let subscriptionService: SubscriptionService;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let session: ReturnType<typeof createMockSession>;
  let subscriptionId: string;

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

    // Create a subscription with installments
    const subscription = await subscriptionService.createSubscription(
      testUser.id,
      {
        name: "Test Subscription",
        description: null,
        day: 5,
        month: null,
        price: 9.99,
        type: SubscriptionType.MONTHLY,
        reminderStart: ReminderStart.D_1,
        lastday: undefined,
      },
      undefined,
      undefined
    );

    subscriptionId = subscription.uuid;
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(prisma, testUser.id);
    }
    await teardownTestDatabase(prisma);
  });

  test("GET /api/installments returns user installments", async () => {
    const routes = createInstallmentRoutes(installmentService, subscriptionService);
    const handler = routes["/api/installments"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = createAuthenticatedRequest(
      "http://localhost:3000/api/installments",
      {},
      session
    );

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  test("PUT /api/installments/:id/paid marks installment as paid", async () => {
    const routes = createInstallmentRoutes(installmentService, subscriptionService);
    
    // Get an installment first
    const getHandler = routes["/api/installments"]?.GET;
    if (!getHandler) throw new Error("Get handler not found");

    const getReq = createAuthenticatedRequest(
      "http://localhost:3000/api/installments",
      {},
      session
    );

    const getResponse = await getHandler(getReq);
    const getData = await getResponse.json();
    
    // Ensure we have installments
    expect(getData.data.length).toBeGreaterThan(0);
    const installmentId = getData.data[0].uuid;

    // Mark as paid
    const paidHandler = routes["/api/installments/:id/paid"]?.PUT;
    if (!paidHandler) throw new Error("Paid handler not found");

    const paidReq = createAuthenticatedRequest(
      `http://localhost:3000/api/installments/${installmentId}/paid`,
      { method: "PUT" },
      session
    );

    const paidResponse = await paidHandler(paidReq);
    
    // Check if there was an error
    if (paidResponse.status !== 200) {
      const errorData = await paidResponse.json();
      console.error("Mark as paid error:", errorData);
    }
    
    const paidData = await paidResponse.json();

    expect(paidResponse.status).toBe(200);
    expect(paidData.data.paid).toBe(true);
  });

  test("POST /api/installments/confirm confirms payment from calendar link", async () => {
    const routes = createInstallmentRoutes(installmentService, subscriptionService);
    
    // Get an installment with a link
    const installments = await installmentService.getUserInstallments(testUser.id);
    const installmentWithLink = installments.find(inst => inst.link);

    if (!installmentWithLink) {
      // Create one with a link
      const allInstallments = await installmentService.getUserInstallments(testUser.id);
      if (allInstallments.length > 0 && allInstallments[0]) {
        const testLink = "https://calendar.google.com/event?eid=test123";
        await prisma.installment.update({
          where: { id: allInstallments[0].uuid },
          data: { link: testLink },
        });

        const handler = routes["/api/installments/confirm"]?.POST;
        if (!handler) throw new Error("Handler not found");

        const req = new Request("http://localhost:3000/api/installments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link: testLink }),
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.paid).toBe(true);
      }
    }
  });

  test("GET /api/installments requires authentication", async () => {
    const routes = createInstallmentRoutes(installmentService, subscriptionService);
    const handler = routes["/api/installments"]?.GET;

    if (!handler) {
      throw new Error("Handler not found");
    }

    const req = new Request("http://localhost:3000/api/installments");

    const response = await handler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

