/**
 * Prisma Seed Script
 * 
 * Run with: bun prisma/seed.ts
 * Or: bun run db:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Example: Create a test user
  // const user = await prisma.user.create({
  //   data: {
  //     googleId: "test-google-id-123",
  //     name: "Test User",
  //     email: "test@example.com",
  //     currency: "USD",
  //   },
  // });

  // console.log("✅ Created test user:", user);

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

