import { env } from "@/config/env";

/**
 * Swagger Configuration
 * 
 * OpenAPI 3.0 specification for Subscription Reminder API
 */
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Subscription Reminder API",
    version: "1.0.0",
    description: "API untuk aplikasi Subscription Reminder & Payment Tracker",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: env.API_URL,
      description: env.NODE_ENV === "production" ? "Production server" : "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      oauth2: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenUrl: "https://oauth2.googleapis.com/token",
            scopes: {
              "openid": "OpenID Connect",
              "email": "Email access",
              "profile": "Profile access",
              "https://www.googleapis.com/auth/calendar": "Google Calendar access",
            },
          },
        },
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          uuid: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
          country: { type: "string", nullable: true },
          currency: { type: "string", default: "USD" },
          birthdate: { type: "string", format: "date", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Subscription: {
        type: "object",
        properties: {
          uuid: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          date: { type: "string", format: "date" },
          price: { type: "number", format: "float" },
          type: { type: "string", enum: ["MONTHLY", "YEARLY"] },
          reminderStart: { type: "string", enum: ["D_0", "D_1", "D_3", "D_7", "D_14"] },
          lastday: { type: "string", format: "date", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Installment: {
        type: "object",
        properties: {
          uuid: { type: "string", format: "uuid" },
          subscriptionId: { type: "string", format: "uuid" },
          date: { type: "string", format: "date" },
          link: { type: "string", nullable: true },
          paid: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "string", nullable: true },
        },
      },
    },
  },
  tags: [
    { name: "Authentication", description: "Google OAuth authentication endpoints" },
    { name: "Users", description: "User profile management endpoints" },
    { name: "Subscriptions", description: "Subscription management endpoints" },
    { name: "Installments", description: "Payment installment endpoints" },
    { name: "Dashboard", description: "Dashboard data endpoints" },
  ],
  paths: {
    "/auth/google": {
      get: {
        tags: ["Authentication"],
        summary: "Initiate Google OAuth login",
        description: "Redirects to Google OAuth consent screen",
        responses: {
          "302": {
            description: "Redirect to Google OAuth",
          },
        },
      },
    },
    "/auth/google/callback": {
      get: {
        tags: ["Authentication"],
        summary: "Google OAuth callback",
        description: "Handles OAuth callback and creates/updates user",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Authentication successful",
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        description: "Returns the authenticated user's profile information",
        security: [{ oauth2: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update current user profile",
        description: "Updates the authenticated user's profile information",
        security: [{ oauth2: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  avatar: { type: "string", nullable: true },
                  country: { type: "string", nullable: true },
                  currency: { type: "string" },
                  birthdate: { type: "string", format: "date", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User profile updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/subscriptions": {
      get: {
        tags: ["Subscriptions"],
        summary: "Get all subscriptions",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "activeOnly",
            in: "query",
            schema: { type: "boolean", default: false },
          },
        ],
        responses: {
          "200": {
            description: "List of subscriptions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Subscription" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Subscriptions"],
        summary: "Create new subscription",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "date", "price", "type"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date" },
                  price: { type: "number" },
                  type: { type: "string", enum: ["MONTHLY", "YEARLY"] },
                  reminderStart: { type: "string", enum: ["D_0", "D_1", "D_3", "D_7", "D_14"] },
                  lastday: { type: "string", format: "date", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Subscription created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Subscription" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard data",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Dashboard data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        nextPayments: { type: "array" },
                        topSubscriptions: { type: "array" },
                        statistics: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

