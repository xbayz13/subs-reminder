import type { IInstallmentRepository } from "@/domain/installments/repositories/IInstallmentRepository";
import type { ISubscriptionRepository } from "@/domain/subscriptions/repositories/ISubscriptionRepository";

/**
 * Installment Application Service
 * 
 * Handles use cases related to installment/payment management.
 */
export class InstallmentService {
  constructor(
    private readonly installmentRepository: IInstallmentRepository,
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  /**
   * Get all installments for a user
   */
  async getUserInstallments(userId: string): Promise<import("@/domain/installments/entities/Installment")[]> {
    return await this.installmentRepository.findByUserId(userId);
  }

  /**
   * Get upcoming installments
   */
  async getUpcomingInstallments(userId: string, days: number = 30): Promise<import("@/domain/installments/entities/Installment")[]> {
    return await this.installmentRepository.findUpcomingByUserId(userId, days);
  }

  /**
   * Get overdue installments
   */
  async getOverdueInstallments(userId: string): Promise<import("@/domain/installments/entities/Installment")[]> {
    return await this.installmentRepository.findOverdueByUserId(userId);
  }

  /**
   * Get paid installments
   */
  async getPaidInstallments(userId: string): Promise<import("@/domain/installments/entities/Installment")[]> {
    return await this.installmentRepository.findPaidByUserId(userId);
  }

  /**
   * Mark installment as paid
   */
  async markAsPaid(uuid: string): Promise<import("@/domain/installments/entities/Installment")> {
    const installment = await this.installmentRepository.findById(uuid);
    if (!installment) {
      throw new Error("Installment not found");
    }
    
    installment.markAsPaid();
    return await this.installmentRepository.update(installment);
  }

  /**
   * Confirm payment from Google Calendar link
   */
  async confirmPaymentFromCalendarLink(link: string): Promise<import("@/domain/installments/entities/Installment")> {
    const installment = await this.installmentRepository.findByCalendarLink(link);
    if (!installment) {
      throw new Error("Installment not found");
    }
    
    installment.markAsPaid();
    return await this.installmentRepository.update(installment);
  }

  /**
   * Update calendar link for installment
   */
  async updateCalendarLink(uuid: string, link: string): Promise<import("@/domain/installments/entities/Installment")> {
    const installment = await this.installmentRepository.findById(uuid);
    if (!installment) {
      throw new Error("Installment not found");
    }
    
    installment.updateCalendarLink(link);
    return await this.installmentRepository.update(installment);
  }
}

