import { test, expect, describe } from "bun:test";
import {
  validateEmail,
  validateUUID,
  validateDate,
  validateNumberRange,
  validateSubscriptionType,
  validateReminderStart,
  sanitizeString,
  AppError,
} from "../Validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    test("returns true for valid email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
    });

    test("returns false for invalid email", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
    });
  });

  describe("validateUUID", () => {
    test("returns true for valid UUID", () => {
      expect(validateUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    test("returns false for invalid UUID", () => {
      expect(validateUUID("not-a-uuid")).toBe(false);
      expect(validateUUID("123")).toBe(false);
    });
  });

  describe("validateDate", () => {
    test("returns true for valid date string", () => {
      expect(validateDate("2024-12-11")).toBe(true);
      expect(validateDate(new Date().toISOString())).toBe(true);
    });

    test("returns false for invalid date", () => {
      expect(validateDate("invalid-date")).toBe(false);
      expect(validateDate("2024-13-45")).toBe(false);
    });
  });

  describe("validateNumberRange", () => {
    test("returns true for number in range", () => {
      expect(validateNumberRange(5, 1, 10)).toBe(true);
      expect(validateNumberRange(1, 1, 10)).toBe(true);
      expect(validateNumberRange(10, 1, 10)).toBe(true);
    });

    test("returns false for number outside range", () => {
      expect(validateNumberRange(0, 1, 10)).toBe(false);
      expect(validateNumberRange(11, 1, 10)).toBe(false);
    });
  });

  describe("validateSubscriptionType", () => {
    test("returns true for valid types", () => {
      expect(validateSubscriptionType("MONTHLY")).toBe(true);
      expect(validateSubscriptionType("YEARLY")).toBe(true);
    });

    test("returns false for invalid types", () => {
      expect(validateSubscriptionType("WEEKLY")).toBe(false);
      expect(validateSubscriptionType("invalid")).toBe(false);
    });
  });

  describe("validateReminderStart", () => {
    test("returns true for valid reminders", () => {
      expect(validateReminderStart("D_0")).toBe(true);
      expect(validateReminderStart("D_1")).toBe(true);
      expect(validateReminderStart("D_14")).toBe(true);
    });

    test("returns false for invalid reminders", () => {
      expect(validateReminderStart("D_2")).toBe(false);
      expect(validateReminderStart("invalid")).toBe(false);
    });
  });

  describe("sanitizeString", () => {
    test("trims whitespace", () => {
      expect(sanitizeString("  test  ")).toBe("test");
    });

    test("truncates to max length", () => {
      const longString = "a".repeat(300);
      expect(sanitizeString(longString, 255).length).toBe(255);
    });
  });

  describe("AppError", () => {
    test("creates error with message and status code", () => {
      const error = new AppError("Test error", 400);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("AppError");
    });

    test("includes details if provided", () => {
      const error = new AppError("Test error", 400, { field: "name" });
      expect(error.details).toEqual({ field: "name" });
    });
  });
});

