import type { ISubscriptionRepository } from "@/domain/subscriptions/repositories/ISubscriptionRepository";
import { Subscription, SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { prisma } from "../database/PrismaClient";

/**
 * Prisma Implementation of Subscription Repository
 */
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  async findById(uuid: string): Promise<Subscription | null> {
    const result = await prisma.subscription.findUnique({
      where: { id: uuid },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const results = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    const now = new Date();
    const results = await prisma.subscription.findMany({
      where: {
        userId,
        OR: [
          { lastday: null },
          { lastday: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async create(subscription: Subscription): Promise<Subscription> {
    const result = await prisma.subscription.create({
      data: {
        id: subscription.uuid,
        userId: subscription.userId,
        name: subscription.name,
        description: subscription.description,
        day: subscription.day,
        month: subscription.month,
        price: subscription.price,
        type: subscription.type,
        reminderStart: subscription.reminderStart,
        lastday: subscription.lastday,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    });

    return this.mapToEntity(result);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const result = await prisma.subscription.update({
      where: { id: subscription.uuid },
      data: {
        name: subscription.name,
        description: subscription.description,
        day: subscription.day,
        month: subscription.month,
        price: subscription.price,
        type: subscription.type,
        reminderStart: subscription.reminderStart,
        lastday: subscription.lastday,
        updatedAt: subscription.updatedAt,
      },
    });

    return this.mapToEntity(result);
  }

  async delete(uuid: string): Promise<void> {
    await prisma.subscription.delete({
      where: { id: uuid },
    });
  }

  async findUpcomingPayments(userId: string, days: number): Promise<Subscription[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const results = await prisma.subscription.findMany({
      where: {
        userId,
        OR: [
          { lastday: null },
          { lastday: { gte: today } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // Filter subscriptions that have upcoming payments
    return results
      .map(row => this.mapToEntity(row))
      .filter(sub => {
        const nextPayment = sub.getNextPaymentDate();
        return nextPayment >= today && nextPayment <= futureDate;
      });
  }

  async findTopByPrice(userId: string, limit: number): Promise<Subscription[]> {
    const now = new Date();
    const results = await prisma.subscription.findMany({
      where: {
        userId,
        OR: [
          { lastday: null },
          { lastday: { gte: now } },
        ],
      },
      orderBy: { price: "desc" },
      take: limit,
    });

    return results.map(row => this.mapToEntity(row));
  }

  private mapToEntity(row: any): Subscription {
    return new Subscription(
      row.id,
      row.userId,
      row.name,
      row.description,
      row.day,
      row.month,
      parseFloat(row.price.toString()),
      row.type as SubscriptionType,
      row.reminderStart as ReminderStart,
      row.lastday ? new Date(row.lastday) : null,
      new Date(row.createdAt),
      new Date(row.updatedAt)
    );
  }
}

