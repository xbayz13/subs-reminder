import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { UserService } from "@/application/users/UserService";
import { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { InstallmentService } from "@/application/installments/InstallmentService";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { PrismaSubscriptionRepository } from "@/infrastructure/repositories/PrismaSubscriptionRepository";
import { PrismaInstallmentRepository } from "@/infrastructure/repositories/PrismaInstallmentRepository";
import { SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { SessionManager } from "@/infrastructure/auth/SessionManager";
import {
  setupTestDatabase,
  teardownTestDatabase,
  createTestUser,
  createMockSession,
  createAuthenticatedRequest,
  cleanupTestData,
} from "@/__tests__/helpers/test-helpers";
import { createAuthRoutes } from "@/presentation/api/routes/auth.routes";
import { createSubscriptionRoutes } from "@/presentation/api/routes/subscriptions.routes";
import { createInstallmentRoutes } from "@/presentation/api/routes/installments.routes";
import { createUserRoutes } from "@/presentation/api/routes/users.routes";

/**
 * E2E Tests for Critical Flows
 * 
 * Tests complete user journeys from start to finish.
 */
describe("E2E: Critical Flows", () => {
  let prisma: Awaited<ReturnType<typeof setupTestDatabase>>;
  let userService: UserService;
  let subscriptionService: SubscriptionService;
  let installmentService: InstallmentService;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    testUser = await createTestUser(prisma);

    const userRepo = new PrismaUserRepository();
    const subscriptionRepo = new PrismaSubscriptionRepository();
    const installmentRepo = new PrismaInstallmentRepository();

    userService = new UserService(userRepo);
    subscriptionService = new SubscriptionService(
      subscriptionRepo,
      installmentRepo,
      userRepo
    );
    installmentService = new InstallmentService(installmentRepo, subscriptionRepo, userRepo);
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(prisma, testUser.id);
    }
    await teardownTestDatabase(prisma);
  });

  test("E2E: Complete subscription lifecycle", async () => {
    // 1. User gets their profile
    const userRoutes = createUserRoutes(userService);
    const getProfileHandler = userRoutes["/api/users/me"]?.GET;
    if (!getProfileHandler) throw new Error("Handler not found");

    const session = createMockSession(testUser.id, testUser.email);
    const profileReq = createAuthenticatedRequest(
      "http://localhost:3000/api/users/me",
      {},
      session
    );

    const profileResponse = await getProfileHandler(profileReq);
    const profileData = await profileResponse.json();
    expect(profileResponse.status).toBe(200);
    expect(profileData.data.uuid).toBe(testUser.id);

    // 2. User creates a subscription
    const subscriptionRoutes = createSubscriptionRoutes(subscriptionService);
    const createHandler = subscriptionRoutes["/api/subscriptions"]?.POST;
    if (!createHandler) throw new Error("Handler not found");

    const subscriptionData = {
      name: "E2E Test Subscription",
      day: 15,
      month: null,
      price: 19.99,
      type: SubscriptionType.MONTHLY,
      reminderStart: ReminderStart.D_1,
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
    expect(createResponse.status).toBe(201);
    expect(createData.data.name).toBe(subscriptionData.name);
    const subscriptionId = createData.data.uuid;

    // 3. User views their subscriptions
    const listHandler = subscriptionRoutes["/api/subscriptions"]?.GET;
    if (!listHandler) throw new Error("Handler not found");

    const listReq = createAuthenticatedRequest(
      "http://localhost:3000/api/subscriptions",
      {},
      session
    );

    const listResponse = await listHandler(listReq);
    const listData = await listResponse.json();
    expect(listResponse.status).toBe(200);
    expect(listData.data.length).toBeGreaterThan(0);
    expect(listData.data.some((sub: any) => sub.uuid === subscriptionId)).toBe(true);

    // 4. User views installments
    const installmentRoutes = createInstallmentRoutes(installmentService, subscriptionService);
    const getInstallmentsHandler = installmentRoutes["/api/installments"]?.GET;
    if (!getInstallmentsHandler) throw new Error("Handler not found");

    const installmentsReq = createAuthenticatedRequest(
      "http://localhost:3000/api/installments",
      {},
      session
    );

    const installmentsResponse = await getInstallmentsHandler(installmentsReq);
    const installmentsData = await installmentsResponse.json();
    expect(installmentsResponse.status).toBe(200);
    expect(installmentsData.data.length).toBeGreaterThan(0);

    // 5. User marks an installment as paid
    const installmentId = installmentsData.data[0].uuid;
    const markPaidHandler = installmentRoutes["/api/installments/:id/paid"]?.PUT;
    if (!markPaidHandler) throw new Error("Handler not found");

    const markPaidReq = createAuthenticatedRequest(
      `http://localhost:3000/api/installments/${installmentId}/paid`,
      { method: "PUT" },
      session
    );

    const markPaidResponse = await markPaidHandler(markPaidReq);
    const markPaidData = await markPaidResponse.json();
    expect(markPaidResponse.status).toBe(200);
    expect(markPaidData.data.paid).toBe(true);

    // 6. User updates subscription
    const updateHandler = subscriptionRoutes["/api/subscriptions/:id"]?.PUT;
    if (!updateHandler) throw new Error("Handler not found");

    const updateReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated E2E Subscription" }),
      },
      session
    );

    const updateResponse = await updateHandler(updateReq);
    const updateData = await updateResponse.json();
    expect(updateResponse.status).toBe(200);
    expect(updateData.data.name).toBe("Updated E2E Subscription");

    // 7. User deletes subscription
    const deleteHandler = subscriptionRoutes["/api/subscriptions/:id"]?.DELETE;
    if (!deleteHandler) throw new Error("Handler not found");

    const deleteReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      { method: "DELETE" },
      session
    );

    const deleteResponse = await deleteHandler(deleteReq);
    expect(deleteResponse.status).toBe(200);

    // Verify deletion
    const verifyReq = createAuthenticatedRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {},
      session
    );
    const verifyResponse = await listHandler(verifyReq);
    const verifyData = await verifyResponse.json();
    expect(verifyData.data.some((sub: any) => sub.uuid === subscriptionId)).toBe(false);
  });

  test("E2E: Payment confirmation from calendar link", async () => {
    // 1. Create subscription
    const subscription = await subscriptionService.createSubscription(
      testUser.id,
      {
        name: "Calendar Test Subscription",
        description: null,
        day: 10,
        month: null,
        price: 9.99,
        type: SubscriptionType.MONTHLY,
        reminderStart: ReminderStart.D_1,
        lastday: undefined,
      },
      undefined,
      undefined
    );

    // 2. Get installments
    const installments = await installmentService.getUserInstallments(testUser.id);
    const installment = installments.find(inst => inst.subscriptionId === subscription.uuid);
    expect(installment).toBeDefined();

    if (installment) {
      // 3. Add a calendar link to the installment
      const testLink = "https://calendar.google.com/event?eid=test123";
      await prisma.installment.update({
        where: { id: installment.uuid },
        data: { link: testLink },
      });

      // 4. Confirm payment from calendar link
      const installmentRoutes = createInstallmentRoutes(installmentService, subscriptionService);
      const confirmHandler = installmentRoutes["/api/installments/confirm"]?.POST;
      if (!confirmHandler) throw new Error("Handler not found");

      const confirmReq = new Request("http://localhost:3000/api/installments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: testLink }),
      });

      const confirmResponse = await confirmHandler(confirmReq);
      const confirmData = await confirmResponse.json();
      expect(confirmResponse.status).toBe(200);
      expect(confirmData.data.paid).toBe(true);
    }
  });
});

