import type { ISubscriptionRepository } from "@/domain/subscriptions/repositories/ISubscriptionRepository";
import type { IInstallmentRepository } from "@/domain/installments/repositories/IInstallmentRepository";
import { Subscription, SubscriptionType, ReminderStart } from "@/domain/subscriptions/entities/Subscription";
import { Installment } from "@/domain/installments/entities/Installment";
import { GoogleCalendarService } from "@/infrastructure/google/GoogleCalendarService";
import { randomUUID } from "crypto";

/**
 * Subscription Application Service
 * 
 * Handles use cases related to subscription management.
 */
export class SubscriptionService {
  private calendarService: GoogleCalendarService;

  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly installmentRepository: IInstallmentRepository
  ) {
    this.calendarService = new GoogleCalendarService();
  }

  /**
   * Create a new subscription and generate initial installments
   */
  async createSubscription(
    userId: string,
    data: {
      name: string;
      description?: string | null;
      day: number;
      month: number | null;
      price: number;
      type: SubscriptionType;
      reminderStart: ReminderStart;
      lastday?: Date | null;
    },
    accessToken?: string,
    refreshToken?: string | null
  ): Promise<Subscription> {
    const now = new Date();
    const subscription = new Subscription(
      randomUUID(),
      userId,
      data.name,
      data.description || null,
      data.day,
      data.month,
      data.price,
      data.type,
      data.reminderStart,
      data.lastday || null,
      now,
      now
    );

    const created = await this.subscriptionRepository.create(subscription);
    
    // Generate initial installments for the next 12 months (or until lastday)
    // Include Google Calendar integration if access token is provided
    await this.generateInstallments(created, accessToken, refreshToken);
    
    return created;
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string, activeOnly: boolean = false): Promise<Subscription[]> {
    if (activeOnly) {
      return await this.subscriptionRepository.findActiveByUserId(userId);
    }
    return await this.subscriptionRepository.findByUserId(userId);
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(uuid: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.findById(uuid);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    uuid: string,
    data: {
      name?: string;
      description?: string | null;
      day?: number;
      month?: number | null;
      price?: number;
      type?: SubscriptionType;
      reminderStart?: ReminderStart;
      lastday?: Date | null;
    }
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(uuid);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    
    subscription.update(data);
    return await this.subscriptionRepository.update(subscription);
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(uuid: string): Promise<void> {
    // Delete all related installments first
    await this.installmentRepository.deleteBySubscriptionId(uuid);
    await this.subscriptionRepository.delete(uuid);
  }

  /**
   * Get upcoming payments
   */
  async getUpcomingPayments(userId: string, days: number = 30): Promise<Subscription[]> {
    return await this.subscriptionRepository.findUpcomingPayments(userId, days);
  }

  /**
   * Get top subscriptions by price
   */
  async getTopSubscriptionsByPrice(userId: string, limit: number = 5): Promise<Subscription[]> {
    return await this.subscriptionRepository.findTopByPrice(userId, limit);
  }

  /**
   * Generate installments for a subscription
   */
  private async generateInstallments(
    subscription: Subscription,
    accessToken?: string,
    refreshToken?: string | null
  ): Promise<void> {
    const installments: Installment[] = [];
    const endDate = subscription.lastday || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year ahead
    let currentDate = subscription.getNextPaymentDate();
    const now = new Date();

    while (currentDate <= endDate && installments.length < 12) {
      if (currentDate >= now) {
        let calendarLink: string | null = null;

        // Create Google Calendar event if access token is provided
        if (accessToken) {
          try {
            const reminderMinutes = this.getReminderMinutes(subscription.reminderStart);
            const confirmUrl = `${process.env.API_URL || "http://localhost:3000"}/api/installments/confirm?link={CALENDAR_LINK}`;
            
            const event = await this.calendarService.createPaymentEvent({
              accessToken,
              refreshToken,
              title: `Payment: ${subscription.name}`,
              description: `Subscription payment for ${subscription.name}\nAmount: $${subscription.price.toFixed(2)}\nType: ${subscription.type}\n\nConfirm payment: ${confirmUrl}`,
              startDate: currentDate,
              reminderMinutes,
            });
            calendarLink = event.htmlLink;
          } catch (error) {
            console.error("Failed to create calendar event:", error);
            // Continue without calendar link if creation fails
          }
        }

        installments.push(
          new Installment(
            randomUUID(),
            subscription.uuid,
            currentDate,
            calendarLink,
            false,
            now,
            now
          )
        );
      }

      // Calculate next payment date
      if (subscription.type === SubscriptionType.MONTHLY) {
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate = new Date(currentDate);
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    if (installments.length > 0) {
      await this.installmentRepository.createMany(installments);
    }
  }

  /**
   * Get reminder minutes from ReminderStart enum
   */
  private getReminderMinutes(reminderStart: ReminderStart): number {
    switch (reminderStart) {
      case ReminderStart.D_0:
        return 0;
      case ReminderStart.D_1:
        return 24 * 60; // 1 day in minutes
      case ReminderStart.D_3:
        return 3 * 24 * 60; // 3 days in minutes
      case ReminderStart.D_7:
        return 7 * 24 * 60; // 7 days in minutes
      case ReminderStart.D_14:
        return 14 * 24 * 60; // 14 days in minutes
      default:
        return 24 * 60;
    }
  }
}

