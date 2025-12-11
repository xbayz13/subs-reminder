import { serve } from "bun";
import index from "./index.html";
import { env, isDevelopment } from "./config/env";
import { userService, subscriptionService, installmentService } from "./infrastructure/di/container";
import { createAuthRoutes } from "./presentation/api/routes/auth.routes";
import { createUserRoutes } from "./presentation/api/routes/users.routes";
import { createSubscriptionRoutes } from "./presentation/api/routes/subscriptions.routes";
import { createInstallmentRoutes } from "./presentation/api/routes/installments.routes";
import { createDashboardRoutes } from "./presentation/api/routes/dashboard.routes";
import { createSwaggerRoutes } from "./presentation/api/routes/swagger.routes";

// Initialize routes
const authRoutes = createAuthRoutes(userService);
const userRoutes = createUserRoutes(userService);
const subscriptionRoutes = createSubscriptionRoutes(subscriptionService);
const installmentRoutes = createInstallmentRoutes(installmentService);
const dashboardRoutes = createDashboardRoutes(subscriptionService, installmentService);
const swaggerRoutes = createSwaggerRoutes();

const server = serve({
  port: env.PORT,
  routes: {
    // Serve index.html for all unmatched routes (SPA fallback)
    "/*": index,

    // Authentication routes
    ...authRoutes,

    // User routes
    ...userRoutes,

    // Subscription routes
    ...subscriptionRoutes,

    // Installment routes
    ...installmentRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Swagger documentation
    ...swaggerRoutes,

    // Health check
    "/api/health": {
      GET: async () => {
        return Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
        });
      },
    },
  },

  development: isDevelopment && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
console.log(`📊 Environment: ${env.NODE_ENV}`);
console.log(`🔗 API URL: ${env.API_URL}`);
