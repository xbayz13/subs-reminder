/**
 * Dependency Injection Container
 * 
 * Manages service dependencies and provides singleton instances
 */

import { UserService } from "@/application/users/UserService";
import { SubscriptionService } from "@/application/subscriptions/SubscriptionService";
import { InstallmentService } from "@/application/installments/InstallmentService";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { PrismaSubscriptionRepository } from "@/infrastructure/repositories/PrismaSubscriptionRepository";
import { PrismaInstallmentRepository } from "@/infrastructure/repositories/PrismaInstallmentRepository";

// Repository instances (using Prisma)
const userRepository = new PrismaUserRepository();
const subscriptionRepository = new PrismaSubscriptionRepository();
const installmentRepository = new PrismaInstallmentRepository();

// Service instances
export const userService = new UserService(userRepository);
export const subscriptionService = new SubscriptionService(
  subscriptionRepository,
  installmentRepository,
  userRepository
);
export const installmentService = new InstallmentService(
  installmentRepository,
  subscriptionRepository,
  userRepository
);

