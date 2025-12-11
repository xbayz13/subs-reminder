import { test, expect } from "bun:test";
import { User } from "../User";

test("User entity - getAge calculates age correctly", () => {
  const birthdate = new Date();
  birthdate.setFullYear(birthdate.getFullYear() - 25);
  
  const user = new User(
    "test-uuid",
    "Test User",
    "test@example.com",
    null,
    "US",
    "USD",
    birthdate,
    "google-123",
    null,
    null,
    new Date(),
    new Date()
  );

  const age = user.getAge();
  expect(age).toBe(25);
});

test("User entity - getAge returns null if no birthdate", () => {
  const user = new User(
    "test-uuid",
    "Test User",
    "test@example.com",
    null,
    "US",
    "USD",
    null,
    "google-123",
    null,
    null,
    new Date(),
    new Date()
  );

  expect(user.getAge()).toBeNull();
});

test("User entity - updateProfile updates fields correctly", () => {
  const user = new User(
    "test-uuid",
    "Test User",
    "test@example.com",
    null,
    "US",
    "USD",
    null,
    "google-123",
    null,
    null,
    new Date(),
    new Date()
  );

  const beforeUpdate = user.updatedAt;
  
  // Wait a bit to ensure updatedAt changes
  Bun.sleepSync(10);
  
  user.updateProfile({
    name: "Updated Name",
    country: "ID",
    currency: "IDR",
  });

  expect(user.name).toBe("Updated Name");
  expect(user.country).toBe("ID");
  expect(user.currency).toBe("IDR");
  expect(user.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
});

test("User entity - updateTokens updates tokens correctly", () => {
  const user = new User(
    "test-uuid",
    "Test User",
    "test@example.com",
    null,
    "US",
    "USD",
    null,
    "google-123",
    "old-token",
    "old-refresh",
    new Date(),
    new Date()
  );

  const beforeUpdate = user.updatedAt;
  Bun.sleepSync(10);

  user.updateTokens("new-token", "new-refresh");

  expect(user.accessToken).toBe("new-token");
  expect(user.refreshToken).toBe("new-refresh");
  expect(user.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
});

