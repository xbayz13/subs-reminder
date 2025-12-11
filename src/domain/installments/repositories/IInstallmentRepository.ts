import type { Installment } from "../entities/Installment";

/**
 * Installment Repository Interface
 * 
 * Defines the contract for installment data persistence.
 * Implementation will be in infrastructure layer.
 */
export interface IInstallmentRepository {
  /**
   * Find installment by UUID
   */
  findById(uuid: string): Promise<Installment | null>;

  /**
   * Find installment by Google Calendar link
   */
  findByCalendarLink(link: string): Promise<Installment | null>;

  /**
   * Find all installments for a subscription
   */
  findBySubscriptionId(subscriptionId: string): Promise<Installment[]>;

  /**
   * Find all installments for a user (through subscriptions)
   */
  findByUserId(userId: string): Promise<Installment[]>;

  /**
   * Find upcoming installments for a user
   */
  findUpcomingByUserId(userId: string, days: number): Promise<Installment[]>;

  /**
   * Find overdue installments for a user
   */
  findOverdueByUserId(userId: string): Promise<Installment[]>;

  /**
   * Find paid installments for a user
   */
  findPaidByUserId(userId: string): Promise<Installment[]>;

  /**
   * Create a new installment
   */
  create(installment: Installment): Promise<Installment>;

  /**
   * Create multiple installments
   */
  createMany(installments: Installment[]): Promise<Installment[]>;

  /**
   * Update existing installment
   */
  update(installment: Installment): Promise<Installment>;

  /**
   * Delete installment by UUID
   */
  delete(uuid: string): Promise<void>;

  /**
   * Delete all installments for a subscription
   */
  deleteBySubscriptionId(subscriptionId: string): Promise<void>;
}

