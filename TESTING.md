# Testing Guide

Dokumentasi untuk menjalankan dan memahami test suite aplikasi.

## 📋 Test Structure

Project ini menggunakan **Bun test** sebagai test framework. Test suite terdiri dari:

1. **Unit Tests** - Test untuk domain entities dan utilities
2. **Integration Tests** - Test untuk API endpoints dengan database
3. **E2E Tests** - Test untuk complete user flows

## 🧪 Running Tests

### Run All Tests

```bash
bun test
```

### Run Tests in Watch Mode

```bash
bun test:watch
```

### Run Only Integration Tests

```bash
bun test:integration
```

### Run Only E2E Tests

```bash
bun test:e2e
```

### Run Specific Test File

```bash
bun test src/domain/users/entities/__tests__/User.test.ts
```

## 📁 Test Files Location

```
src/
├── domain/
│   ├── users/entities/__tests__/User.test.ts
│   ├── subscriptions/entities/__tests__/Subscription.test.ts
│   └── installments/entities/__tests__/Installment.test.ts
├── presentation/
│   ├── api/routes/__tests__/
│   │   ├── auth.routes.test.ts
│   │   ├── subscriptions.routes.integration.test.ts
│   │   ├── users.routes.integration.test.ts
│   │   ├── installments.routes.integration.test.ts
│   │   └── dashboard.routes.integration.test.ts
│   └── middleware/__tests__/Validation.test.ts
└── __tests__/
    ├── helpers/test-helpers.ts
    └── e2e/critical-flows.test.ts
```

## 🔧 Test Helpers

File `src/__tests__/helpers/test-helpers.ts` menyediakan utilities untuk testing:

- `setupTestDatabase()` - Setup database connection untuk test
- `teardownTestDatabase()` - Close database connection
- `createTestUser()` - Create test user di database
- `createMockSession()` - Create mock session data
- `createAuthenticatedRequest()` - Create request dengan session cookie
- `cleanupTestData()` - Cleanup test data dari database

## 📝 Unit Tests

Unit tests menguji domain entities dan utilities tanpa dependencies eksternal.

### Domain Entity Tests

- **User.test.ts**: Tests untuk `getAge()`, `updateProfile()`, `updateTokens()`
- **Subscription.test.ts**: Tests untuk `isActive()`, `getNextPaymentDate()`, `getReminderDate()`, `update()`
- **Installment.test.ts**: Tests untuk `markAsPaid()`, `isOverdue()`, `isUpcoming()`, `updateCalendarLink()`

### Validation Tests

- **Validation.test.ts**: Tests untuk semua validation utilities (email, UUID, date, number range, etc.)

## 🔗 Integration Tests

Integration tests menguji API endpoints dengan database yang sebenarnya. **Memerlukan database yang running.**

### Prerequisites

1. PostgreSQL database harus running
2. Set `DATABASE_URL` di environment atau `.env.test`
3. Run migrations: `bun run db:migrate`

### Test Coverage

#### Subscription Routes
- ✅ GET /api/subscriptions (list, empty, activeOnly filter)
- ✅ POST /api/subscriptions (create with validation)
- ✅ GET /api/subscriptions/:id (get by ID)
- ✅ PUT /api/subscriptions/:id (update)
- ✅ DELETE /api/subscriptions/:id (delete)
- ✅ Authentication required

#### User Routes
- ✅ GET /api/users/me (get profile)
- ✅ PUT /api/users/me (update profile)
- ✅ Email validation
- ✅ Authentication required

#### Installment Routes
- ✅ GET /api/installments (list user installments)
- ✅ PUT /api/installments/:id/paid (mark as paid)
- ✅ POST /api/installments/confirm (confirm from calendar link)
- ✅ Authentication required

#### Dashboard Routes
- ✅ GET /api/dashboard (get dashboard data)
- ✅ Authentication required

## 🎭 E2E Tests

E2E tests menguji complete user flows dari start sampai finish.

### Critical Flows

1. **Complete Subscription Lifecycle**
   - User gets profile
   - User creates subscription
   - User views subscriptions
   - User views installments
   - User marks installment as paid
   - User updates subscription
   - User deletes subscription

2. **Payment Confirmation from Calendar Link**
   - Create subscription
   - Get installments
   - Add calendar link to installment
   - Confirm payment from calendar link

## ⚙️ Test Configuration

### Environment Variables

Untuk integration dan E2E tests, pastikan environment variables berikut di-set:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/test_db
SESSION_SECRET=test-secret-key
GOOGLE_CLIENT_ID=test-client-id
GOOGLE_CLIENT_SECRET=test-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Test Database

Disarankan menggunakan database terpisah untuk testing:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/subs_reminder_test
```

## 🐛 Troubleshooting

### Tests Fail dengan Database Error

1. Pastikan PostgreSQL running: `pg_isready`
2. Pastikan `DATABASE_URL` benar
3. Pastikan migrations sudah di-run: `bun run db:migrate`
4. Cek apakah database test sudah dibuat

### Session Cookie Tests Fail

1. Pastikan `SESSION_SECRET` di-set di environment
2. Pastikan test menggunakan `createAuthenticatedRequest()` helper
3. Cek apakah session tidak expired

### Tests Tidak Isolated

1. Pastikan `afterAll` cleanup dijalankan dengan benar
2. Pastikan setiap test menggunakan user/data yang unik
3. Gunakan `createTestUser()` dengan unique email/googleId

## 📊 Test Coverage

**Current Status: 50 tests passing, 0 failures** ✅

Test coverage mencakup:

- ✅ Domain entities (100%) - 15 tests
- ✅ Validation utilities (100%) - 15 tests
- ✅ API routes (100%) - 15 integration tests
- ✅ Critical user flows (100%) - 2 E2E tests
- ✅ Authentication (100%) - 1 test
- ✅ Test helpers (100%) - verified working

### Test Statistics
- **Total Tests**: 50
- **Passing**: 50 ✅
- **Failing**: 0
- **Expect Calls**: 129
- **Execution Time**: ~1.65 seconds
- **Test Files**: 10

## 🚀 CI/CD Integration

Untuk menjalankan tests di CI/CD:

```bash
# Setup database
bun run db:migrate

# Run all tests
bun test

# Or run specific test suites
bun test:integration
bun test:e2e
```

## 📝 Writing New Tests

### Unit Test Example

```typescript
import { test, expect } from "bun:test";
import { User } from "../User";

test("User entity - getAge calculates age correctly", () => {
  const birthdate = new Date();
  birthdate.setFullYear(birthdate.getFullYear() - 25);
  
  const user = new User(/* ... */);
  expect(user.getAge()).toBe(25);
});
```

### Integration Test Example

```typescript
import { test, expect, beforeAll, afterAll } from "bun:test";
import { setupTestDatabase, createTestUser, cleanupTestData } from "@/__tests__/helpers/test-helpers";

describe("My Feature Integration", () => {
  let prisma: PrismaClient;
  let testUser: TestUser;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    testUser = await createTestUser(prisma);
  });

  afterAll(async () => {
    await cleanupTestData(prisma, testUser.id);
    await teardownTestDatabase(prisma);
  });

  test("My test", async () => {
    // Test implementation
  });
});
```

## ✅ Best Practices

1. **Isolation**: Setiap test harus independent dan tidak bergantung pada test lain
2. **Cleanup**: Selalu cleanup test data di `afterAll`
3. **Unique Data**: Gunakan unique identifiers (timestamp, random) untuk test data
4. **Mock External Services**: Mock Google Calendar API dan external services lainnya
5. **Test Real Scenarios**: Test dengan data yang mirip dengan production

---

**Last Updated**: December 11, 2024

