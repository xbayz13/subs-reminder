import type { InstallmentService } from "@/application/installments/InstallmentService";
import type { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { requireAuth } from "@/infrastructure/auth/AuthMiddleware";

/**
 * Installments Routes
 * 
 * Handles installment/payment operations
 */
export function createInstallmentRoutes(
  installmentService: InstallmentService,
  subscriptionService: SubscriptionService
) {
  return {
    /**
     * Get all installments for current user
     */
    "/api/installments": {
      GET: requireAuth(async (req) => {
        try {
          const userId = req.session.userId;

          // Ensure installments exist for all subscriptions (auto-generate if running low)
          const subscriptions = await subscriptionService.getUserSubscriptions(userId);
          await Promise.all(
            subscriptions.map(sub => subscriptionService.ensureInstallmentsForSubscription(sub.uuid))
          );

          const installments = await installmentService.getUserInstallments(userId);
          
          return Response.json({
            data: installments.map(inst => {
              // Extract htmlLink from stored link (handles both combined and old format)
              let htmlLink: string | null = inst.link;
              if (inst.link && inst.link.includes("|")) {
                const parts = inst.link.split("|");
                htmlLink = parts[0] || null;
              }
              
              return {
                uuid: inst.uuid,
                subscriptionId: inst.subscriptionId,
                date: inst.date.toISOString(),
                link: htmlLink, // Return only htmlLink for frontend
                paid: inst.paid,
                createdAt: inst.createdAt.toISOString(),
                updatedAt: inst.updatedAt.toISOString(),
              };
            }),
          });
        } catch (error) {
          console.error("Get installments error:", error);
          return Response.json(
            { error: "Failed to fetch installments", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),
    },

    /**
     * Get installment by ID
     */
    "/api/installments/:id": {
      GET: async (req: Request) => {
        try {
          const url = new URL(req.url);
          const id = url.pathname.split("/").pop();

          if (!id) {
            return Response.json({ error: "Installment ID required" }, { status: 400 });
          }

          // TODO: Get from repository directly or add method to service
          return Response.json({ error: "Not implemented" }, { status: 501 });
        } catch (error) {
          console.error("Get installment error:", error);
          return Response.json(
            { error: "Failed to fetch installment", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      },
    },

    /**
     * Mark installment as paid
     */
    "/api/installments/:id/paid": {
      PUT: requireAuth(async (req) => {
        try {
          const url = new URL(req.url);
          // For /api/installments/:id/paid, we need the second-to-last segment (the ID)
          const pathParts = url.pathname.split("/").filter(p => p);
          const id = pathParts[pathParts.length - 2]; // Second to last (before "paid")

          if (!id) {
            return Response.json({ error: "Installment ID required" }, { status: 400 });
          }

          const userId = req.session.userId;
          const installment = await installmentService.markAsPaid(id, userId);

          return Response.json({
            data: {
              uuid: installment.uuid,
              subscriptionId: installment.subscriptionId,
              date: installment.date.toISOString(),
              link: installment.link,
              paid: installment.paid,
              createdAt: installment.createdAt.toISOString(),
              updatedAt: installment.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error("Mark as paid error:", error);
          return Response.json(
            { error: "Failed to mark as paid", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),
    },

    /**
     * Confirm payment from Google Calendar link
     */
    "/api/installments/confirm": {
      POST: async (req: Request) => {
        try {
          const body = await req.json();
          const link = body.link;

          if (!link) {
            return Response.json({ error: "Calendar link required" }, { status: 400 });
          }

          const installment = await installmentService.confirmPaymentFromCalendarLink(link);

          // Extract htmlLink from stored link for response
          let htmlLink: string | null = installment.link;
          if (installment.link && installment.link.includes("|")) {
            const parts = installment.link.split("|");
            htmlLink = parts[0] || null;
          }

          return Response.json({
            data: {
              uuid: installment.uuid,
              subscriptionId: installment.subscriptionId,
              date: installment.date.toISOString(),
              link: htmlLink, // Return only htmlLink for frontend
              paid: installment.paid,
              createdAt: installment.createdAt.toISOString(),
              updatedAt: installment.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error("Confirm payment error:", error);
          return Response.json(
            { error: "Failed to confirm payment", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      },
    },
  };
}

