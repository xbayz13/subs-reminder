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

          // Ensure installments exist for all subscriptions (auto-generate if running low)
          const subscriptions = await subscriptionService.getUserSubscriptions(userId);
          await Promise.all(
            subscriptions.map(sub => subscriptionService.ensureInstallmentsForSubscription(sub.uuid))
          );

          // Get unpaid installments for current month
          const allInstallments = await installmentService.getUserInstallments(userId);
          const today = new Date();
          const currentMonth = today.getMonth(); // 0-11
          const currentYear = today.getFullYear();
          
          // Filter: unpaid installments in current month
          const unpaidCurrentMonthInstallments = allInstallments.filter(inst => {
            // Explicitly check paid status - must be false
            if (inst.paid === true) {
              return false;
            }
            
            const paymentDate = new Date(inst.date);
            const paymentMonth = paymentDate.getMonth();
            const paymentYear = paymentDate.getFullYear();
            
            // Only current month and year
            return paymentMonth === currentMonth && paymentYear === currentYear;
          });
          
          // Get subscription info for all installments
          const subscriptionIds = [...new Set(unpaidCurrentMonthInstallments.map(inst => inst.subscriptionId))];
          const subscriptions = await Promise.all(
            subscriptionIds.map(id => subscriptionService.getSubscriptionById(id))
          );
          
          // Create a map for quick lookup
          const subscriptionMap = new Map(
            subscriptions
              .filter((sub): sub is NonNullable<typeof sub> => sub !== null)
              .map(sub => [sub.uuid, sub])
          );
          
          // Map installments to next payments format
          const nextPayments = unpaidCurrentMonthInstallments
            .map(inst => {
              const subscription = subscriptionMap.get(inst.subscriptionId);
              if (!subscription) return null;
              
              return {
                subscription: {
                  uuid: subscription.uuid,
                  name: subscription.name,
                  price: subscription.price,
                },
                nextPaymentDate: inst.date.toISOString(),
                reminderDate: inst.date.toISOString(), // Use installment date as reminder date
              };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
            .slice(0, 10); // Top 10 upcoming

          // Get top 5 subscriptions by price
          const topSubscriptions = await subscriptionService.getTopSubscriptionsByPrice(userId, 5);

          // Get installments statistics
          const allUserInstallments = await installmentService.getUserInstallments(userId);
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
                totalInstallments: allUserInstallments.length,
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

