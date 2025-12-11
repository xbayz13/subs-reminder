import type { IInstallmentRepository } from "@/domain/installments/repositories/IInstallmentRepository";
import { Installment } from "@/domain/installments/entities/Installment";
import { prisma } from "../database/PrismaClient";

/**
 * Prisma Implementation of Installment Repository
 */
export class PrismaInstallmentRepository implements IInstallmentRepository {
  async findById(uuid: string): Promise<Installment | null> {
    const result = await prisma.installment.findUnique({
      where: { id: uuid },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByCalendarLink(link: string): Promise<Installment | null> {
    // Try exact match first
    let result = await prisma.installment.findFirst({
      where: { link },
    });

    if (result) {
      return this.mapToEntity(result);
    }

    // If not found, try to find by htmlLink part (for combined format: "htmlLink|eventId")
    // Search for links that start with the provided link
    result = await prisma.installment.findFirst({
      where: {
        link: {
          startsWith: link,
        },
      },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Installment[]> {
    const results = await prisma.installment.findMany({
      where: { subscriptionId },
      orderBy: { date: "asc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async findByUserId(userId: string): Promise<Installment[]> {
    const results = await prisma.installment.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      orderBy: { date: "desc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async findUpcomingByUserId(userId: string, days: number): Promise<Installment[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const results = await prisma.installment.findMany({
      where: {
        subscription: {
          userId,
        },
        date: {
          gte: today,
          lte: futureDate,
        },
        paid: false,
      },
      orderBy: { date: "asc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async findOverdueByUserId(userId: string): Promise<Installment[]> {
    const today = new Date();
    const results = await prisma.installment.findMany({
      where: {
        subscription: {
          userId,
        },
        date: {
          lt: today,
        },
        paid: false,
      },
      orderBy: { date: "asc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async findPaidByUserId(userId: string): Promise<Installment[]> {
    const results = await prisma.installment.findMany({
      where: {
        subscription: {
          userId,
        },
        paid: true,
      },
      orderBy: { date: "desc" },
    });

    return results.map(row => this.mapToEntity(row));
  }

  async create(installment: Installment): Promise<Installment> {
    const result = await prisma.installment.create({
      data: {
        id: installment.uuid,
        subscriptionId: installment.subscriptionId,
        date: installment.date,
        link: installment.link,
        paid: installment.paid,
        createdAt: installment.createdAt,
        updatedAt: installment.updatedAt,
      },
    });

    return this.mapToEntity(result);
  }

  async createMany(installments: Installment[]): Promise<Installment[]> {
    if (installments.length === 0) return [];

    // Prisma doesn't have createManyAndReturn in all versions, so we'll create one by one
    // For better performance, you can use a transaction
    const results: Installment[] = [];
    for (const inst of installments) {
      const result = await this.create(inst);
      results.push(result);
    }

    return results;
  }

  async update(installment: Installment): Promise<Installment> {
    const result = await prisma.installment.update({
      where: { id: installment.uuid },
      data: {
        date: installment.date,
        link: installment.link,
        paid: installment.paid,
        updatedAt: installment.updatedAt,
      },
    });

    return this.mapToEntity(result);
  }

  async delete(uuid: string): Promise<void> {
    await prisma.installment.delete({
      where: { id: uuid },
    });
  }

  async deleteBySubscriptionId(subscriptionId: string): Promise<void> {
    await prisma.installment.deleteMany({
      where: { subscriptionId },
    });
  }

  private mapToEntity(row: any): Installment {
    return new Installment(
      row.id,
      row.subscriptionId,
      new Date(row.date),
      row.link,
      row.paid,
      new Date(row.createdAt),
      new Date(row.updatedAt)
    );
  }
}

