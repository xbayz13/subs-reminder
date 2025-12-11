import type { Subscription } from "../entities/Subscription";

/**
 * Subscription Repository Interface
 * 
 * Defines the contract for subscription data persistence.
 * Implementation will be in infrastructure layer.
 */
export interface ISubscriptionRepository {
  /**
   * Find subscription by UUID
   */
  findById(uuid: string): Promise<Subscription | null>;

  /**
   * Find all subscriptions for a user
   */
  findByUserId(userId: string): Promise<Subscription[]>;

  /**
   * Find active subscriptions for a user
   */
  findActiveByUserId(userId: string): Promise<Subscription[]>;

  /**
   * Create a new subscription
   */
  create(subscription: Subscription): Promise<Subscription>;

  /**
   * Update existing subscription
   */
  update(subscription: Subscription): Promise<Subscription>;

  /**
   * Delete subscription by UUID
   */
  delete(uuid: string): Promise<void>;

  /**
   * Find subscriptions with upcoming payments
   */
  findUpcomingPayments(userId: string, days: number): Promise<Subscription[]>;

  /**
   * Find top N subscriptions by price for a user
   */
  findTopByPrice(userId: string, limit: number): Promise<Subscription[]>;
}

