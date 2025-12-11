import { test, expect } from "bun:test";
import { Subscription, SubscriptionType, ReminderStart } from "../Subscription";

test("Subscription entity - isActive returns true if no lastday", () => {
  const subscription = new Subscription(
    "test-uuid",
    "user-uuid",
    "Netflix",
    null,
    15, // day
    null, // month (null for monthly)
    9.99,
    SubscriptionType.MONTHLY,
    ReminderStart.D_1,
    null,
    new Date(),
    new Date()
  );

  expect(subscription.isActive()).toBe(true);
});

test("Subscription entity - isActive returns false if past lastday", () => {
  const lastday = new Date();
  lastday.setFullYear(lastday.getFullYear() - 1);

  const subscription = new Subscription(
    "test-uuid",
    "user-uuid",
    "Netflix",
    null,
    15, // day
    null, // month (null for monthly)
    9.99,
    SubscriptionType.MONTHLY,
    ReminderStart.D_1,
    lastday,
    new Date(),
    new Date()
  );

  expect(subscription.isActive()).toBe(false);
});

test("Subscription entity - getNextPaymentDate for monthly subscription", () => {
  const today = new Date();
  const paymentDay = 15; // 15th of each month

  const subscription = new Subscription(
    "test-uuid",
    "user-uuid",
    "Netflix",
    null,
    paymentDay, // day
    null, // month (null for monthly)
    9.99,
    SubscriptionType.MONTHLY,
    ReminderStart.D_1,
    null,
    new Date(),
    new Date()
  );

  const nextPayment = subscription.getNextPaymentDate();
  
  // Should be in current or next month
  expect(nextPayment.getDate()).toBe(paymentDay);
  expect(nextPayment >= today).toBe(true);
});

test("Subscription entity - getReminderDate calculates correctly", () => {
  const today = new Date();
  const paymentDay = today.getDate() + 10; // 10 days from now

  const subscription = new Subscription(
    "test-uuid",
    "user-uuid",
    "Netflix",
    null,
    paymentDay, // day
    null, // month (null for monthly)
    9.99,
    SubscriptionType.MONTHLY,
    ReminderStart.D_3,
    null,
    new Date(),
    new Date()
  );

  const reminderDate = subscription.getReminderDate();
  const nextPayment = subscription.getNextPaymentDate();
  
  // Reminder should be 3 days before payment
  const expectedReminder = new Date(nextPayment);
  expectedReminder.setDate(expectedReminder.getDate() - 3);
  
  expect(reminderDate.getDate()).toBe(expectedReminder.getDate());
});

test("Subscription entity - update modifies fields correctly", () => {
  const subscription = new Subscription(
    "test-uuid",
    "user-uuid",
    "Netflix",
    null,
    15, // day
    null, // month (null for monthly)
    9.99,
    SubscriptionType.MONTHLY,
    ReminderStart.D_1,
    null,
    new Date(),
    new Date()
  );

  const beforeUpdate = subscription.updatedAt;
  Bun.sleepSync(10);

  subscription.update({
    name: "Spotify",
    price: 14.99,
    reminderStart: ReminderStart.D_7,
    day: 20,
  });

  expect(subscription.name).toBe("Spotify");
  expect(subscription.price).toBe(14.99);
  expect(subscription.reminderStart).toBe(ReminderStart.D_7);
  expect(subscription.day).toBe(20);
  expect(subscription.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
});

