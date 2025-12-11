import type { IInstallmentRepository } from "@/domain/installments/repositories/IInstallmentRepository";
import { Installment } from "@/domain/installments/entities/Installment";
import { Database } from "../database/Database";

/**
 * PostgreSQL Implementation of Installment Repository
 */
export class PostgresInstallmentRepository implements IInstallmentRepository {
  private db = Database.getInstance();

  async findById(uuid: string): Promise<Installment | null> {
    const result = await this.db`
      SELECT * FROM installments WHERE uuid = ${uuid}
    `;
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findByCalendarLink(link: string): Promise<Installment | null> {
    // Try exact match first
    let result = await this.db`
      SELECT * FROM installments WHERE link = ${link}
    `;
    
    if (result.length > 0) {
      return this.mapToEntity(result[0]);
    }

    // If not found, try to find by htmlLink part (for combined format: "htmlLink|eventId")
    result = await this.db`
      SELECT * FROM installments WHERE link LIKE ${link + '%'}
    `;
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Installment[]> {
    const result = await this.db`
      SELECT * FROM installments 
      WHERE subscription_id = ${subscriptionId} 
      ORDER BY date ASC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async findByUserId(userId: string): Promise<Installment[]> {
    const result = await this.db`
      SELECT i.* FROM installments i
      INNER JOIN subscriptions s ON i.subscription_id = s.uuid
      WHERE s.user_id = ${userId}
      ORDER BY i.date DESC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async findUpcomingByUserId(userId: string, days: number): Promise<Installment[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    const result = await this.db`
      SELECT i.* FROM installments i
      INNER JOIN subscriptions s ON i.subscription_id = s.uuid
      WHERE s.user_id = ${userId}
      AND i.date >= ${today}
      AND i.date <= ${futureDate}
      AND i.paid = false
      ORDER BY i.date ASC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async findOverdueByUserId(userId: string): Promise<Installment[]> {
    const today = new Date();
    const result = await this.db`
      SELECT i.* FROM installments i
      INNER JOIN subscriptions s ON i.subscription_id = s.uuid
      WHERE s.user_id = ${userId}
      AND i.date < ${today}
      AND i.paid = false
      ORDER BY i.date ASC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async findPaidByUserId(userId: string): Promise<Installment[]> {
    const result = await this.db`
      SELECT i.* FROM installments i
      INNER JOIN subscriptions s ON i.subscription_id = s.uuid
      WHERE s.user_id = ${userId}
      AND i.paid = true
      ORDER BY i.date DESC
    `;
    
    return result.map(row => this.mapToEntity(row));
  }

  async create(installment: Installment): Promise<Installment> {
    const result = await this.db`
      INSERT INTO installments (
        uuid, subscription_id, date, link, paid, created_at, updated_at
      ) VALUES (
        ${installment.uuid}, ${installment.subscriptionId}, ${installment.date}, 
        ${installment.link}, ${installment.paid}, ${installment.createdAt}, ${installment.updatedAt}
      ) RETURNING *
    `;
    
    return this.mapToEntity(result[0]);
  }

  async createMany(installments: Installment[]): Promise<Installment[]> {
    if (installments.length === 0) return [];
    
    // Insert one by one (postgres library doesn't support bulk insert easily)
    const results: Installment[] = [];
    for (const inst of installments) {
      const result = await this.create(inst);
      results.push(result);
    }
    
    return results;
  }

  async update(installment: Installment): Promise<Installment> {
    const result = await this.db`
      UPDATE installments SET
        date = ${installment.date},
        link = ${installment.link},
        paid = ${installment.paid},
        updated_at = ${installment.updatedAt}
      WHERE uuid = ${installment.uuid}
      RETURNING *
    `;
    
    return this.mapToEntity(result[0]);
  }

  async delete(uuid: string): Promise<void> {
    await this.db`DELETE FROM installments WHERE uuid = ${uuid}`;
  }

  async deleteBySubscriptionId(subscriptionId: string): Promise<void> {
    await this.db`DELETE FROM installments WHERE subscription_id = ${subscriptionId}`;
  }

  private mapToEntity(row: any): Installment {
    return new Installment(
      row.uuid,
      row.subscription_id,
      new Date(row.date),
      row.link,
      row.paid,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

