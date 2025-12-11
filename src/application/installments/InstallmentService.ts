import type { IInstallmentRepository } from "@/domain/installments/repositories/IInstallmentRepository";
import type { ISubscriptionRepository } from "@/domain/subscriptions/repositories/ISubscriptionRepository";
import type { IUserRepository } from "@/domain/users/repositories/IUserRepository";
import type { Installment } from "@/domain/installments/entities/Installment";
import { GoogleCalendarService } from "@/infrastructure/google/GoogleCalendarService";

/**
 * Installment Application Service
 * 
 * Handles use cases related to installment/payment management.
 */
export class InstallmentService {
  private calendarService: GoogleCalendarService;

  constructor(
    private readonly installmentRepository: IInstallmentRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly userRepository: IUserRepository
  ) {
    this.calendarService = new GoogleCalendarService();
  }

  /**
   * Get all installments for a user
   */
  async getUserInstallments(userId: string): Promise<Installment[]> {
    return await this.installmentRepository.findByUserId(userId);
  }

  /**
   * Get upcoming installments
   */
  async getUpcomingInstallments(userId: string, days: number = 30): Promise<Installment[]> {
    return await this.installmentRepository.findUpcomingByUserId(userId, days);
  }

  /**
   * Get overdue installments
   */
  async getOverdueInstallments(userId: string): Promise<Installment[]> {
    return await this.installmentRepository.findOverdueByUserId(userId);
  }

  /**
   * Get paid installments
   */
  async getPaidInstallments(userId: string): Promise<Installment[]> {
    return await this.installmentRepository.findPaidByUserId(userId);
  }

  /**
   * Extract event ID from Google Calendar link
   * 
   * Link format can be:
   * 1. Combined format: "htmlLink|eventId" (new format, stores both)
   * 2. Old format: Just htmlLink URL
   * 
   * For combined format, extract eventId after the pipe
   * For old format, try to extract from URL eid parameter
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
            console.log("[InstallmentService] Extracted eventId from combined format:", eventId);
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
                console.log("[InstallmentService] Extracted eventId from decoded eid:", eventId);
                return eventId;
              }
            }
            const eventId = decoded.split('@')[0];
            return eventId || null;
          } catch (decodeError) {
            console.warn("[InstallmentService] Could not decode eid, trying direct use:", eid);
            return eid;
          }
        }
      } catch (urlError) {
        // Not a valid URL
      }
      
      // Try regex patterns
      const patterns = [
        /[?&]eid=([^&"'\s]+)/,
        /event\?eid=([^&"'\s]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match && match[1]) {
          const eid = decodeURIComponent(match[1]);
          try {
            const decoded = Buffer.from(eid.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
            const parts = decoded.split('_');
            if (parts.length > 1) {
              const eventId = parts[parts.length - 1]?.split('@')[0];
              return eventId || null;
            }
            const eventId = decoded.split('@')[0];
            return eventId || null;
          } catch {
            return eid;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting event ID from link:", error);
      return null;
    }
  }

  /**
   * Get htmlLink from stored link (handles both combined and old format)
   */
  private getHtmlLinkFromStoredLink(link: string | null): string | null {
    if (!link) return null;
    
    // If combined format, return the htmlLink part (before |)
    if (link.includes("|")) {
      const htmlLink = link.split("|")[0];
      return htmlLink || null;
    }
    
    // Otherwise return as is (old format)
    return link;
  }

  /**
   * Mark installment as paid and delete calendar event if exists
   */
  async markAsPaid(uuid: string, userId?: string): Promise<Installment> {
    const installment = await this.installmentRepository.findById(uuid);
    if (!installment) {
      throw new Error("Installment not found");
    }
    
    // Delete calendar event if link exists
    if (installment.link && userId) {
      try {
        const user = await this.userRepository.findById(userId);
        if (user && user.accessToken) {
          const eventId = this.extractEventIdFromLink(installment.link);
          if (eventId) {
            console.log("[InstallmentService] Deleting calendar event:", eventId);
            await this.calendarService.deletePaymentEvent({
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              eventId: eventId,
            });
            console.log("[InstallmentService] ✅ Calendar event deleted successfully");
            
            // Clear the calendar link from installment
            installment.updateCalendarLink(null);
          } else {
            console.warn("[InstallmentService] Could not extract event ID from link:", installment.link);
          }
        } else {
          console.warn("[InstallmentService] User not found or no access token available");
        }
      } catch (error) {
        // Log error but don't fail the payment marking
        console.error("[InstallmentService] Error deleting calendar event:", error);
        console.warn("[InstallmentService] Continuing with marking as paid despite calendar deletion error");
      }
    }
    
    installment.markAsPaid();
    return await this.installmentRepository.update(installment);
  }

  /**
   * Confirm payment from Google Calendar link
   */
  async confirmPaymentFromCalendarLink(link: string): Promise<Installment> {
    // Find installment by link (repository handles both htmlLink and combined format)
    const installment = await this.installmentRepository.findByCalendarLink(link);
    if (!installment) {
      throw new Error("Installment not found");
    }
    
    // Get subscription to get userId
    const subscription = await this.subscriptionRepository.findById(installment.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    
    // Delete calendar event if link exists
    if (installment.link) {
      try {
        const user = await this.userRepository.findById(subscription.userId);
        if (user && user.accessToken) {
          const eventId = this.extractEventIdFromLink(installment.link);
          if (eventId) {
            console.log("[InstallmentService] Deleting calendar event on confirm:", eventId);
            await this.calendarService.deletePaymentEvent({
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              eventId: eventId,
            });
            console.log("[InstallmentService] ✅ Calendar event deleted successfully on confirm");
            
            // Clear the calendar link from installment
            installment.updateCalendarLink(null);
          }
        }
      } catch (error) {
        // Log error but don't fail the payment confirmation
        console.error("[InstallmentService] Error deleting calendar event on confirm:", error);
      }
    }
    
    installment.markAsPaid();
    return await this.installmentRepository.update(installment);
  }

  /**
   * Update calendar link for installment
   */
  async updateCalendarLink(uuid: string, link: string): Promise<Installment> {
    const installment = await this.installmentRepository.findById(uuid);
    if (!installment) {
      throw new Error("Installment not found");
    }
    
    installment.updateCalendarLink(link);
    return await this.installmentRepository.update(installment);
  }
}

