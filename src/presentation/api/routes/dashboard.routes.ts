import type { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import type { InstallmentService } from "@/application/installments/InstallmentService";
import { requireAuth } from "@/infrastructure/auth/AuthMiddleware";

/**
 * Dashboard Routes
 * 
 * Handles dashboard data aggregation
 */
export function createDashboardRoutes(
  subscriptionService: SubscriptionService,
  installmentService: InstallmentService
) {
  return {
    /**
     * Get dashboard data
     */
    "/api/dashboard": {
      GET: requireAuth(async (req) => {
        try {
          const userId = req.session.userId;

          // Get upcoming payments
          const upcomingSubscriptions = await subscriptionService.getUpcomingPayments(userId, 30);
          const nextPayments = upcomingSubscriptions
            .map(sub => ({
              subscription: {
                uuid: sub.uuid,
                name: sub.name,
                price: sub.price,
              },
              nextPaymentDate: sub.getNextPaymentDate().toISOString(),
              reminderDate: sub.getReminderDate().toISOString(),
            }))
            .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
            .slice(0, 10); // Top 10 upcoming

          // Get top 5 subscriptions by price
          const topSubscriptions = await subscriptionService.getTopSubscriptionsByPrice(userId, 5);

          // Get installments statistics
          const allInstallments = await installmentService.getUserInstallments(userId);
          const overdue = await installmentService.getOverdueInstallments(userId);
          const paid = await installmentService.getPaidInstallments(userId);
          const upcoming = await installmentService.getUpcomingInstallments(userId, 30);

          // Calculate total statistics
          const totalPaid = paid.reduce((sum, inst) => sum + 1, 0);
          const totalOverdue = overdue.reduce((sum, inst) => sum + 1, 0);
          const totalUpcoming = upcoming.reduce((sum, inst) => sum + 1, 0);

          return Response.json({
            data: {
              nextPayments,
              topSubscriptions: topSubscriptions.map(sub => ({
                uuid: sub.uuid,
                name: sub.name,
                price: sub.price,
                type: sub.type,
              })),
              statistics: {
                totalPaid,
                totalOverdue,
                totalUpcoming,
                totalInstallments: allInstallments.length,
              },
            },
          });
        } catch (error) {
          console.error("Get dashboard error:", error);
          return Response.json(
            { error: "Failed to fetch dashboard data", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),
    },
  };
}

