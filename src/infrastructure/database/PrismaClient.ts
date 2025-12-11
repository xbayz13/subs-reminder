import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

/**
 * Prisma Client Singleton
 * 
 * Provides a single instance of PrismaClient for the application.
 * Prisma Client is automatically generated from schema.prisma
 */
class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  /**
   * Get Prisma Client instance
   */
  static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
          db: {
            url: env.DATABASE_URL,
          },
        },
      });
    }

    return PrismaClientSingleton.instance;
  }

  /**
   * Disconnect Prisma Client
   */
  static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
    }
  }
}

export const prisma = PrismaClientSingleton.getInstance();

// Export for convenience
export default prisma;

