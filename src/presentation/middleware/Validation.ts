/**
 * Validation Middleware
 * 
 * Input validation utilities for API requests
 */

import { AppError } from "./ErrorHandler";

export { AppError };

/**
 * Validate required fields in request body
 */
export function validateRequired(body: any, fields: string[]): void {
  const missing: string[] = [];

  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(", ")}`,
      400
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate number range
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate subscription type
 */
export function validateSubscriptionType(type: string): type is "MONTHLY" | "YEARLY" {
  return type === "MONTHLY" || type === "YEARLY";
}

/**
 * Validate reminder start
 */
export function validateReminderStart(reminder: string): reminder is "D_0" | "D_1" | "D_3" | "D_7" | "D_14" {
  return ["D_0", "D_1", "D_3", "D_7", "D_14"].includes(reminder);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().slice(0, maxLength);
}

