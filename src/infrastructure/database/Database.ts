/**
 * Database Connection (Legacy)
 * 
 * @deprecated Use PrismaClient from @/infrastructure/database/PrismaClient instead
 * This file is kept for backward compatibility but will be removed in future versions.
 * 
 * For new code, use:
 * ```ts
 * import { prisma } from "@/infrastructure/database/PrismaClient";
 * ```
 */

import { prisma } from "./PrismaClient";

/**
 * Database Connection
 * 
 * Legacy wrapper around Prisma Client for backward compatibility.
 * New code should use PrismaClient directly.
 */
export class Database {
  /**
   * Get database connection instance (Prisma Client)
   * @deprecated Use prisma from PrismaClient directly
   */
  static getInstance() {
    return prisma;
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    await prisma.$disconnect();
  }
}

