/**
 * Subscription Entity - Domain Model
 * 
 * Represents a subscription service that user subscribes to.
 * This is an aggregate root for the Subscriptions bounded context.
 */

export enum SubscriptionType {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum ReminderStart {
  D_0 = "D_0", // Same day
  D_1 = "D_1", // 1 day before
  D_3 = "D_3", // 3 days before
  D_7 = "D_7", // 7 days before
  D_14 = "D_14", // 14 days before
}

export class Subscription {
  constructor(
    public readonly uuid: string,
    public readonly userId: string,
    public name: string,
    public description: string | null,
    public day: number, // Day of month (1-31) for payment date
    public month: number | null, // Month (1-12) for yearly subscriptions, null for monthly
    public price: number,
    public type: SubscriptionType,
    public reminderStart: ReminderStart,
    public lastday: Date | null, // End date (null means no expiration)
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Check if subscription is still active
   */
  isActive(): boolean {
    if (!this.lastday) return true;
    return new Date() <= this.lastday;
  }

  /**
   * Calculate next payment date
   */
  getNextPaymentDate(baseDate?: Date): Date {
    const referenceDate = baseDate || new Date();
    const paymentDate = new Date(referenceDate);
    
    if (this.type === SubscriptionType.MONTHLY) {
      // Set to the day of month specified
      paymentDate.setDate(this.day);
      
      // If the date has passed this month, move to next month
      if (paymentDate < referenceDate) {
        paymentDate.setMonth(paymentDate.getMonth() + 1);
        paymentDate.setDate(this.day);
      }
    } else {
      // YEARLY - use month and day
      if (this.month === null) {
        throw new Error("Yearly subscription must have month specified");
      }
      paymentDate.setMonth(this.month - 1); // JavaScript months are 0-indexed
      paymentDate.setDate(this.day);
      
      // If the date has passed this year, move to next year
      if (paymentDate < referenceDate) {
        paymentDate.setFullYear(paymentDate.getFullYear() + 1);
        paymentDate.setMonth(this.month - 1);
        paymentDate.setDate(this.day);
      }
    }
    
    return paymentDate;
  }

  /**
   * Calculate reminder date based on reminderStart setting
   */
  getReminderDate(baseDate?: Date): Date {
    const nextPayment = this.getNextPaymentDate(baseDate);
    const reminderDate = new Date(nextPayment);
    
    const daysBefore = this.getReminderDays();
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    
    return reminderDate;
  }

  /**
   * Get number of days before payment for reminder
   */
  private getReminderDays(): number {
    switch (this.reminderStart) {
      case ReminderStart.D_0:
        return 0;
      case ReminderStart.D_1:
        return 1;
      case ReminderStart.D_3:
        return 3;
      case ReminderStart.D_7:
        return 7;
      case ReminderStart.D_14:
        return 14;
      default:
        return 1;
    }
  }

  /**
   * Update subscription details
   */
  update(data: {
    name?: string;
    description?: string | null;
    day?: number;
    month?: number | null;
    price?: number;
    type?: SubscriptionType;
    reminderStart?: ReminderStart;
    lastday?: Date | null;
  }): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.day !== undefined) this.day = data.day;
    if (data.month !== undefined) this.month = data.month;
    if (data.price !== undefined) this.price = data.price;
    if (data.type !== undefined) this.type = data.type;
    if (data.reminderStart !== undefined) this.reminderStart = data.reminderStart;
    if (data.lastday !== undefined) this.lastday = data.lastday;
    this.updatedAt = new Date();
  }
}

