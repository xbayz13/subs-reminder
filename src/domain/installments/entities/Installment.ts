/**
 * Installment Entity - Domain Model
 * 
 * Represents a payment installment for a subscription.
 * This is part of the Subscriptions aggregate.
 */

export class Installment {
  constructor(
    public readonly uuid: string,
    public readonly subscriptionId: string,
    public date: Date,
    public link: string | null, // Google Calendar event link
    public paid: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Mark installment as paid
   */
  markAsPaid(): void {
    this.paid = true;
    this.updatedAt = new Date();
  }

  /**
   * Mark installment as unpaid
   */
  markAsUnpaid(): void {
    this.paid = false;
    this.updatedAt = new Date();
  }

  /**
   * Update Google Calendar link
   */
  updateCalendarLink(link: string | null): void {
    this.link = link;
    this.updatedAt = new Date();
  }

  /**
   * Check if payment is overdue
   */
  isOverdue(): boolean {
    return !this.paid && new Date() > this.date;
  }

  /**
   * Check if payment is upcoming
   */
  isUpcoming(days: number = 7): boolean {
    if (this.paid) return false;
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    return this.date >= today && this.date <= futureDate;
  }
}

