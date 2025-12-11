/**
 * Environment Configuration
 * 
 * Validates and exports environment variables with type safety
 * Bun automatically loads .env file, so we just need to validate
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;
  
  // Server
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  API_URL: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  
  // Google Calendar
  GOOGLE_CALENDAR_ID: string;
  
  // Security
  SESSION_SECRET: string;
  
  // Optional
  LOG_LEVEL?: string;
  CORS_ORIGINS?: string;
}

/**
 * Validate required environment variables
 */
function validateEnv(): EnvConfig {
  const required = [
    "DATABASE_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "SESSION_SECRET",
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Please copy .env.example to .env and fill in the values.`
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
    API_URL: process.env.API_URL || process.env.PORT 
      ? `http://localhost:${process.env.PORT || 3000}` 
      : "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || "primary",
    SESSION_SECRET: process.env.SESSION_SECRET!,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
  };
}

/**
 * Exported environment configuration
 * Throws error if required variables are missing
 */
export const env = validateEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === "test";

