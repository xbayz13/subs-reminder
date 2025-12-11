import type { ISubscriptionRepository } from "@/domain/subscriptions/repositories/ISubscriptionRepository";
import { Subscription, SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { Database } from "../database/Database";

/**
 * PostgreSQL Implementation of Subscription Repository
 */
export class PostgresSubscriptionRepository implements ISubscriptionRepository {
  private db = Database.getInstance();

  async findById(uuid: string): Promise<Subscription | null> {
    const result = await this.db`
      SELECT * FROM subscriptions WHERE uuid = ${uuid}
    `;
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const result = await this.db`
      SELECT * FROM subscriptions WHERE user_id = ${userId} ORDER BY created_at DESC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    const now = new Date();
    const result = await this.db`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId} 
      AND (lastday IS NULL OR lastday >= ${now})
      ORDER BY created_at DESC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async create(subscription: Subscription): Promise<Subscription> {
    const result = await this.db`
      INSERT INTO subscriptions (
        uuid, user_id, name, description, day, month, price, type, 
        reminder_start, lastday, created_at, updated_at
      ) VALUES (
        ${subscription.uuid}, ${subscription.userId}, ${subscription.name}, 
        ${subscription.description}, ${subscription.day}, ${subscription.month}, 
        ${subscription.price}, ${subscription.type}, ${subscription.reminderStart}, 
        ${subscription.lastday}, ${subscription.createdAt}, ${subscription.updatedAt}
      ) RETURNING *
    `;
    
    return this.mapToEntity(result[0]);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const result = await this.db`
      UPDATE subscriptions SET
        name = ${subscription.name},
        description = ${subscription.description},
        day = ${subscription.day},
        month = ${subscription.month},
        price = ${subscription.price},
        type = ${subscription.type},
        reminder_start = ${subscription.reminderStart},
        lastday = ${subscription.lastday},
        updated_at = ${subscription.updatedAt}
      WHERE uuid = ${subscription.uuid}
      RETURNING *
    `;
    
    return this.mapToEntity(result[0]);
  }

  async delete(uuid: string): Promise<void> {
    await this.db`DELETE FROM subscriptions WHERE uuid = ${uuid}`;
  }

  async findUpcomingPayments(userId: string, days: number): Promise<Subscription[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    const result = await this.db`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId}
      AND (lastday IS NULL OR lastday >= ${today})
      ORDER BY created_at ASC
    `;
    
    // Filter subscriptions that have upcoming payments
    const subscriptions = result.map(row => this.mapToEntity(row));
    return subscriptions.filter(sub => {
      const nextPayment = sub.getNextPaymentDate();
      return nextPayment >= today && nextPayment <= futureDate;
    });
  }

  async findTopByPrice(userId: string, limit: number): Promise<Subscription[]> {
    const result = await this.db`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId}
      AND (lastday IS NULL OR lastday >= NOW())
      ORDER BY price DESC
      LIMIT ${limit}
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  private mapToEntity(row: any): Subscription {
    return new Subscription(
      row.uuid,
      row.user_id,
      row.name,
      row.description,
      row.day,
      row.month,
      parseFloat(row.price),
      row.type as SubscriptionType,
      row.reminder_start as ReminderStart,
      row.lastday ? new Date(row.lastday) : null,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

