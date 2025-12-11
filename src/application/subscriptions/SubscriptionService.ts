import type { ISubscriptionRepository } from "@/domain/subscriptions/repositories/ISubscriptionRepository";
import type { IInstallmentRepository } from "@/domain/installments/repositories/IInstallmentRepository";
import type { IUserRepository } from "@/domain/users/repositories/IUserRepository";
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
    private readonly installmentRepository: IInstallmentRepository,
    private readonly userRepository: IUserRepository
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
    // Get subscription to get userId
    const subscription = await this.subscriptionRepository.findById(uuid);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Get all installments for this subscription
    const installments = await this.installmentRepository.findBySubscriptionId(uuid);
    
    // Delete all calendar events associated with these installments
    if (installments.length > 0) {
      // Get user to access tokens
      const user = await this.userRepository.findById(subscription.userId);
      
      if (user && user.accessToken) {
        // Delete calendar events for each installment that has a link
        for (const installment of installments) {
          if (installment.link) {
            try {
              const eventId = this.extractEventIdFromLink(installment.link);
              if (eventId) {
                console.log("[SubscriptionService] Deleting calendar event for subscription deletion:", eventId);
                await this.calendarService.deletePaymentEvent({
                  accessToken: user.accessToken,
                  refreshToken: user.refreshToken,
                  eventId: eventId,
                });
                console.log("[SubscriptionService] ✅ Calendar event deleted successfully");
              } else {
                console.warn("[SubscriptionService] Could not extract event ID from link:", installment.link);
              }
            } catch (error) {
              console.error("[SubscriptionService] Failed to delete calendar event:", error);
              // Continue with deletion even if calendar event deletion fails
            }
          }
        }
      }
    }

    // Delete all related installments
    await this.installmentRepository.deleteBySubscriptionId(uuid);
    
    // Delete subscription
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
   * Ensure installments exist for a subscription
   * Automatically generates new installments if existing ones are running out (less than 3 months ahead)
   * This method should be called periodically or when fetching installments
   */
  async ensureInstallmentsForSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      return; // Subscription not found, skip
    }

    // Check if subscription has lastday and if it's already passed
    if (subscription.lastday && new Date(subscription.lastday) < new Date()) {
      return; // Subscription has expired, no need to generate more installments
    }

    // Get existing installments for this subscription
    const existingInstallments = await this.installmentRepository.findBySubscriptionId(subscriptionId);
    
    if (existingInstallments.length === 0) {
      // No installments exist, generate initial ones
      const user = await this.userRepository.findById(subscription.userId);
      await this.generateInstallments(
        subscription,
        user?.accessToken || undefined,
        user?.refreshToken || undefined
      );
      return;
    }

    // Find the latest installment date
    if (existingInstallments.length === 0) {
      return; // No installments to check
    }
    
    const firstInstallment = existingInstallments[0];
    if (!firstInstallment) {
      return; // Safety check
    }
    
    const latestInstallment = existingInstallments.reduce((latest, inst) => {
      if (!latest) return inst;
      return inst.date > latest.date ? inst : latest;
    }, firstInstallment);

    if (!latestInstallment) {
      return; // Should not happen, but TypeScript safety check
    }

    const latestDate = new Date(latestInstallment.date);
    const now = new Date();
    
    // Calculate how many months ahead the latest installment is
    const monthsAhead = (latestDate.getFullYear() - now.getFullYear()) * 12 + 
                       (latestDate.getMonth() - now.getMonth());
    
    // If less than 3 months ahead, generate more installments
    if (monthsAhead < 3) {
      console.log(`[SubscriptionService] Installments running low (${monthsAhead} months ahead), generating more for subscription ${subscriptionId}`);
      
      // Get user for access tokens
      const user = await this.userRepository.findById(subscription.userId);
      
      // Generate installments starting from after the latest installment
      await this.generateInstallmentsFromDate(
        subscription,
        latestDate,
        user?.accessToken || undefined,
        user?.refreshToken || undefined
      );
    }
  }

  /**
   * Generate installments starting from a specific date
   * Used to extend existing installments
   */
  private async generateInstallmentsFromDate(
    subscription: Subscription,
    startDate: Date,
    accessToken?: string,
    refreshToken?: string | null
  ): Promise<void> {
    const installments: Installment[] = [];
    const endDate = subscription.lastday || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year ahead
    let currentDate = new Date(startDate);
    const now = new Date();

    // Move to the next payment date after startDate
    if (subscription.type === SubscriptionType.MONTHLY) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    // Generate up to 12 more installments
    let count = 0;
    while (currentDate <= endDate && count < 12) {
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
            // Store both htmlLink and eventId in the link field
            calendarLink = `${event.htmlLink}|${event.eventId}`;
          } catch (error) {
            console.error("Failed to create calendar event:", error);
            // Continue without calendar link if creation fails
          }
        }

        installments.push(
          new Installment(
            randomUUID(),
            subscription.uuid,
            new Date(currentDate),
            calendarLink,
            false,
            now,
            now
          )
        );
        count++;
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
      console.log(`[SubscriptionService] ✅ Generated ${installments.length} new installments for subscription ${subscription.uuid}`);
    }
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
            // Store both htmlLink and eventId in the link field
            // Format: htmlLink|eventId so we can extract eventId later for deletion
            calendarLink = `${event.htmlLink}|${event.eventId}`;
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

  /**
   * Extract event ID from calendar link
   * Supports both combined format (htmlLink|eventId) and URL format
   */
  private extractEventIdFromLink(link: string | null): string | null {
    if (!link) return null;
    
    try {
      // Check if link is in combined format: "htmlLink|eventId"
      if (link.includes("|")) {
        const parts = link.split("|");
        if (parts.length >= 2) {
          const eventId = parts[parts.length - 1]; // Last part is eventId
          if (eventId) {
            console.log("[SubscriptionService] Extracted eventId from combined format:", eventId);
            return eventId;
          }
        }
      }
      
      // Old format: Try to extract from URL
      try {
        const url = new URL(link);
        const eid = url.searchParams.get("eid");
        if (eid) {
          // The eid in htmlLink is base64url encoded
          // Try to decode it
          try {
            // Base64url decode
            const decoded = Buffer.from(eid.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
            // Format is usually: calendarId_eventId@google.com
            const parts = decoded.split('_');
            if (parts.length > 1) {
              const eventId = parts[parts.length - 1]?.split('@')[0];
              if (eventId) {
                console.log("[SubscriptionService] Extracted eventId from decoded eid:", eventId);
                return eventId;
              }
            }
          } catch (decodeError) {
            console.warn("[SubscriptionService] Failed to decode eid:", decodeError);
          }
        }
      } catch (urlError) {
        console.warn("[SubscriptionService] Invalid URL format:", urlError);
      }
      
      return null;
    } catch (error) {
      console.error("[SubscriptionService] Error extracting event ID:", error);
      return null;
    }
  }
}

