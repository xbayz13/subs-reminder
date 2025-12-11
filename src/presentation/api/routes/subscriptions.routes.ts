import type { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { requireAuth } from "@/infrastructure/auth/AuthMiddleware";
import { validateRequired, validateSubscriptionType, validateReminderStart, validateDate, AppError } from "@/presentation/middleware/Validation";

/**
 * Subscriptions Routes
 * 
 * Handles subscription CRUD operations
 */
export function createSubscriptionRoutes(subscriptionService: SubscriptionService) {
  return {
    /**
     * Get all subscriptions for current user
     */
    "/api/subscriptions": {
      GET: requireAuth(async (req) => {
        try {
          const userId = req.session.userId;
          const url = new URL(req.url);
          const activeOnly = url.searchParams.get("activeOnly") === "true";

          const subscriptions = await subscriptionService.getUserSubscriptions(userId, activeOnly);
          
          return Response.json({
            data: subscriptions.map(sub => ({
              uuid: sub.uuid,
              name: sub.name,
              description: sub.description,
              day: sub.day,
              month: sub.month,
              price: sub.price,
              type: sub.type,
              reminderStart: sub.reminderStart,
              lastday: sub.lastday?.toISOString() || null,
              createdAt: sub.createdAt.toISOString(),
              updatedAt: sub.updatedAt.toISOString(),
            })),
          });
        } catch (error) {
          console.error("Get subscriptions error:", error);
          return Response.json(
            { error: "Failed to fetch subscriptions", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),

      /**
       * Create new subscription
       */
      POST: requireAuth(async (req) => {
        try {
          const body = await req.json();
          const userId = req.session.userId;

          // Validate required fields
          validateRequired(body, ["name", "day", "price", "type"]);

          // Validate types
          if (!validateSubscriptionType(body.type)) {
            throw new AppError("Invalid subscription type. Must be MONTHLY or YEARLY", 400);
          }

          // Validate day (1-31)
          const day = parseInt(body.day);
          if (isNaN(day) || day < 1 || day > 31) {
            throw new AppError("Day must be between 1 and 31", 400);
          }

          // Validate month (required for YEARLY, must be 1-12)
          const type = body.type as SubscriptionType;
          let month: number | null = null;
          if (type === SubscriptionType.YEARLY) {
            if (!body.month) {
              throw new AppError("Month is required for yearly subscriptions", 400);
            }
            month = parseInt(body.month);
            if (isNaN(month) || month < 1 || month > 12) {
              throw new AppError("Month must be between 1 and 12", 400);
            }
          }

          if (isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0) {
            throw new AppError("Price must be a positive number", 400);
          }

          const reminderStart = body.reminderStart || ReminderStart.D_1;
          if (!validateReminderStart(reminderStart)) {
            throw new AppError("Invalid reminder start value", 400);
          }

          // Get access token from session for Google Calendar integration
          const accessToken = req.session.accessToken;
          const refreshToken = req.session.refreshToken;

          const subscription = await subscriptionService.createSubscription(
            userId,
            {
              name: body.name.trim(),
              description: body.description?.trim() || null,
              day,
              month,
              price: parseFloat(body.price),
              type,
              reminderStart: reminderStart as ReminderStart,
              lastday: body.lastday && validateDate(body.lastday) ? new Date(body.lastday) : null,
            },
            accessToken,
            refreshToken
          );

          return Response.json({
            data: {
              uuid: subscription.uuid,
              name: subscription.name,
              description: subscription.description,
              day: subscription.day,
              month: subscription.month,
              price: subscription.price,
              type: subscription.type,
              reminderStart: subscription.reminderStart,
              lastday: subscription.lastday?.toISOString() || null,
              createdAt: subscription.createdAt.toISOString(),
              updatedAt: subscription.updatedAt.toISOString(),
            },
          }, { status: 201 });
        } catch (error) {
          console.error("Create subscription error:", error);
          return Response.json(
            { error: "Failed to create subscription", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),
    },

    /**
     * Get subscription by ID
     */
    "/api/subscriptions/:id": {
      GET: requireAuth(async (req) => {
        try {
          const url = new URL(req.url);
          const id = url.pathname.split("/").pop();

          if (!id) {
            return Response.json({ error: "Subscription ID required" }, { status: 400 });
          }

          const subscription = await subscriptionService.getSubscriptionById(id);

          if (!subscription) {
            return Response.json({ error: "Subscription not found" }, { status: 404 });
          }

          return Response.json({
            data: {
              uuid: subscription.uuid,
              name: subscription.name,
              description: subscription.description,
              day: subscription.day,
              month: subscription.month,
              price: subscription.price,
              type: subscription.type,
              reminderStart: subscription.reminderStart,
              lastday: subscription.lastday?.toISOString() || null,
              createdAt: subscription.createdAt.toISOString(),
              updatedAt: subscription.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error("Get subscription error:", error);
          return Response.json(
            { error: "Failed to fetch subscription", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),

      /**
       * Update subscription
       */
      PUT: requireAuth(async (req) => {
        try {
          const url = new URL(req.url);
          const id = url.pathname.split("/").pop();
          const body = await req.json();

          if (!id) {
            return Response.json({ error: "Subscription ID required" }, { status: 400 });
          }

          // Validate day if provided
          let day: number | undefined;
          if (body.day !== undefined) {
            day = parseInt(body.day);
            if (isNaN(day) || day < 1 || day > 31) {
              return Response.json({ error: "Day must be between 1 and 31" }, { status: 400 });
            }
          }

          // Validate month if provided or if type is YEARLY
          let month: number | null | undefined;
          if (body.month !== undefined) {
            month = body.month === null ? null : parseInt(body.month);
            if (month !== null && (isNaN(month) || month < 1 || month > 12)) {
              return Response.json({ error: "Month must be between 1 and 12" }, { status: 400 });
            }
          }

          const subscription = await subscriptionService.updateSubscription(id, {
            name: body.name,
            description: body.description,
            day,
            month,
            price: body.price ? parseFloat(body.price) : undefined,
            type: body.type as SubscriptionType,
            reminderStart: body.reminderStart as ReminderStart,
            lastday: body.lastday ? new Date(body.lastday) : null,
          });

          return Response.json({
            data: {
              uuid: subscription.uuid,
              name: subscription.name,
              description: subscription.description,
              day: subscription.day,
              month: subscription.month,
              price: subscription.price,
              type: subscription.type,
              reminderStart: subscription.reminderStart,
              lastday: subscription.lastday?.toISOString() || null,
              createdAt: subscription.createdAt.toISOString(),
              updatedAt: subscription.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error("Update subscription error:", error);
          return Response.json(
            { error: "Failed to update subscription", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),

      /**
       * Delete subscription
       */
      DELETE: requireAuth(async (req) => {
        try {
          const url = new URL(req.url);
          const id = url.pathname.split("/").pop();

          if (!id) {
            return Response.json({ error: "Subscription ID required" }, { status: 400 });
          }

          await subscriptionService.deleteSubscription(id);

          return Response.json({ message: "Subscription deleted successfully" });
        } catch (error) {
          console.error("Delete subscription error:", error);
          return Response.json(
            { error: "Failed to delete subscription", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),
    },
  };
}

