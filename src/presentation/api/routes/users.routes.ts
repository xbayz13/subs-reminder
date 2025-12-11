import type { UserService } from "@/application/users/UserService";
import { requireAuth } from "@/infrastructure/auth/AuthMiddleware";
import { validateEmail, validateDate, AppError } from "@/presentation/middleware/Validation";

/**
 * Users Routes
 * 
 * Handles user profile operations
 */
export function createUserRoutes(userService: UserService) {
  return {
    /**
     * Get current user profile
     */
    "/api/users/me": {
      GET: requireAuth(async (req) => {
        try {
          const userId = req.session.userId;
          const user = await userService.getUserById(userId);

          if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          return Response.json({
            data: {
              uuid: user.uuid,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              country: user.country,
              currency: user.currency,
              birthdate: user.birthdate?.toISOString() || null,
              age: user.getAge(),
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error("Get user error:", error);
          return Response.json(
            { error: "Failed to fetch user", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),

      /**
       * Update current user profile
       */
      PUT: requireAuth(async (req) => {
        try {
          const userId = req.session.userId;
          const body = await req.json();

          // Validate optional fields if provided
          if (body.email && !validateEmail(body.email)) {
            throw new AppError("Invalid email format", 400);
          }

          if (body.birthdate && !validateDate(body.birthdate)) {
            throw new AppError("Invalid birthdate format", 400);
          }

          const updateData: {
            name?: string;
            avatar?: string | null;
            country?: string | null;
            currency?: string;
            birthdate?: Date | null;
          } = {};

          if (body.name !== undefined) updateData.name = body.name.trim();
          if (body.avatar !== undefined) updateData.avatar = body.avatar;
          if (body.country !== undefined) updateData.country = body.country?.trim() || null;
          if (body.currency !== undefined) updateData.currency = body.currency;
          if (body.birthdate !== undefined) {
            updateData.birthdate = body.birthdate ? new Date(body.birthdate) : null;
          }

          const user = await userService.updateProfile(userId, updateData);

          return Response.json({
            data: {
              uuid: user.uuid,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              country: user.country,
              currency: user.currency,
              birthdate: user.birthdate?.toISOString() || null,
              age: user.getAge(),
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          // Don't log AppError (expected validation errors)
          if (error instanceof AppError) {
            return Response.json(
              { error: error.message, details: error.details },
              { status: error.statusCode }
            );
          }
          // Only log unexpected errors
          console.error("Update user error:", error);
          return Response.json(
            { error: "Failed to update user", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      }),
    },
  };
}

