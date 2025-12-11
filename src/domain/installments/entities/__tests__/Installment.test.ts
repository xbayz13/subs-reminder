import { test, expect } from "bun:test";
import { Installment } from "../Installment";

test("Installment entity - markAsPaid sets paid to true", () => {
  const installment = new Installment(
    "test-uuid",
    "subscription-uuid",
    new Date(),
    null,
    false,
    new Date(),
    new Date()
  );

  const beforeUpdate = installment.updatedAt;
  Bun.sleepSync(10);

  installment.markAsPaid();

  expect(installment.paid).toBe(true);
  expect(installment.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
});

test("Installment entity - isOverdue returns true for past unpaid", () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const installment = new Installment(
    "test-uuid",
    "subscription-uuid",
    pastDate,
    null,
    false,
    new Date(),
    new Date()
  );

  expect(installment.isOverdue()).toBe(true);
});

test("Installment entity - isOverdue returns false for paid", () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const installment = new Installment(
    "test-uuid",
    "subscription-uuid",
    pastDate,
    null,
    true, // paid
    new Date(),
    new Date()
  );

  expect(installment.isOverdue()).toBe(false);
});

test("Installment entity - isUpcoming returns true for future unpaid", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  const installment = new Installment(
    "test-uuid",
    "subscription-uuid",
    futureDate,
    null,
    false,
    new Date(),
    new Date()
  );

  expect(installment.isUpcoming(7)).toBe(true);
});

test("Installment entity - isUpcoming returns false for paid", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  const installment = new Installment(
    "test-uuid",
    "subscription-uuid",
    futureDate,
    null,
    true, // paid
    new Date(),
    new Date()
  );

  expect(installment.isUpcoming(7)).toBe(false);
});

test("Installment entity - updateCalendarLink updates link", () => {
  const installment = new Installment(
    "test-uuid",
    "subscription-uuid",
    new Date(),
    null,
    false,
    new Date(),
    new Date()
  );

  const beforeUpdate = installment.updatedAt;
  Bun.sleepSync(10);

  installment.updateCalendarLink("https://calendar.google.com/event?eid=test");

  expect(installment.link).toBe("https://calendar.google.com/event?eid=test");
  expect(installment.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
});

