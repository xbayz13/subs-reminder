# Subscription Reminder & Payment Tracker

Aplikasi web untuk mengelola subscription dan melacak pembayaran berulang dengan integrasi Google Calendar untuk reminder otomatis.

## 🚀 Features

- ✅ **Google OAuth Authentication** - Login dengan akun Google
- ✅ **Subscription Management** - CRUD operations untuk subscription
- ✅ **Payment Tracking** - Lacak pembayaran dan installment
- ✅ **Google Calendar Integration** - Reminder otomatis di Google Calendar
- ✅ **Dashboard** - Overview subscriptions, upcoming payments, dan statistics
- ✅ **Modern UI** - Built with React 19, Tailwind CSS v4, dan shadcn/ui

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Bun.serve() dengan TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Google OAuth 2.0
- **Calendar**: Google Calendar API

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.3.4 or higher
- PostgreSQL database
- Google Cloud Project dengan OAuth 2.0 credentials

## 🔧 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd subs-reminder
bun install
```

### 2. Setup Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env file dengan konfigurasi Anda
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/subs_reminder

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_CALENDAR_ID=primary

# Security
SESSION_SECRET=your_random_secret_key_here

# Application
API_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Google OAuth

1. **Buka [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create/Select Project**
3. **Enable APIs:**
   - Google Calendar API
4. **Configure OAuth Consent Screen:**
   - Pilih "External" untuk development
   - Isi App name, User support email
   - Add test users (email Anda)
5. **Create OAuth 2.0 Credentials:**
   - Go to "Credentials" → "Create OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
   - Copy Client ID dan Client Secret ke `.env`

**Troubleshooting:**
- **`redirect_uri_mismatch`**: Pastikan redirect URI di Google Console sama dengan `GOOGLE_REDIRECT_URI` di `.env`
- **`access_denied` (403)**: Tambahkan email Anda sebagai test user di OAuth Consent Screen
- **"App is being tested" warning**: Normal untuk development, lanjutkan saja

### 4. Setup Database

```bash
# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate

# (Optional) Seed database
bun run db:seed
```

### 5. Start Development Server

```bash
bun dev
```

Server akan berjalan di `http://localhost:3000`

## 📚 Available Scripts

```bash
# Development
bun dev              # Start development server
bun test             # Run all tests
bun test:watch       # Run tests in watch mode

# Database
bun run db:generate  # Generate Prisma Client
bun run db:migrate   # Create and apply migration
bun run db:push      # Push schema to database (no migration)
bun run db:studio    # Open Prisma Studio
bun run db:seed      # Seed database

# OAuth
bun run verify:oauth # Verify OAuth configuration
bun run debug:oauth  # Debug OAuth redirect URI
```

## 🏗️ Project Structure

```
subs-reminder/
├── src/
│   ├── domain/              # Domain layer (DDD)
│   │   ├── users/
│   │   ├── subscriptions/
│   │   └── installments/
│   ├── application/         # Application layer (Use Cases)
│   │   ├── users/
│   │   ├── subscriptions/
│   │   └── installments/
│   ├── infrastructure/      # Infrastructure layer
│   │   ├── database/
│   │   ├── repositories/
│   │   ├── google/
│   │   └── auth/
│   ├── presentation/        # Presentation layer
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── swagger/
│   │   └── middleware/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── subscriptions/
│   ├── hooks/               # React hooks
│   ├── lib/                 # Utilities
│   └── config/              # Configuration
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed script
└── scripts/                 # Utility scripts
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test src/domain/subscriptions/entities/__tests__/Subscription.test.ts

# Run tests in watch mode
bun test:watch
```

**Test Coverage:**
- ✅ Unit Tests - Domain entities dan utilities
- ✅ Integration Tests - API endpoints dengan database
- ✅ E2E Tests - Complete user flows

## 📖 API Documentation

Setelah server berjalan, akses Swagger UI di:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs/json`

## 🔐 Security

- Session cookies dienkripsi dengan HMAC
- OAuth tokens disimpan dengan aman
- Input validation untuk semua API endpoints
- Protected routes dengan authentication middleware

## 🚢 Deployment

### Production Build

```bash
# Build for production
bun run build

# Start production server
NODE_ENV=production bun start
```

### Production Environment Variables

Pastikan semua environment variables sudah di-set:
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (update dengan production URL)
- `GOOGLE_CALENDAR_ID`
- `SESSION_SECRET` (gunakan secret yang berbeda dari development)
- `API_URL` (production URL)
- `PORT`
- `NODE_ENV=production`

### Database Migrations (Production)

```bash
# Deploy migrations
bun run db:migrate:deploy
```

## 📝 Development Notes

### Architecture

Project ini menggunakan **Domain-Driven Design (DDD)** dan **SOLID principles**:

- **Domain Layer**: Business logic dan entities
- **Application Layer**: Use cases dan services
- **Infrastructure Layer**: Database, external APIs, repositories
- **Presentation Layer**: API routes, middleware, React components

### Database Schema

Subscription menggunakan `day` (1-31) dan `month` (1-12, nullable):
- **MONTHLY**: Hanya perlu `day` (tanggal setiap bulan)
- **YEARLY**: Perlu `day` dan `month` (tanggal dan bulan setiap tahun)

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Generate Prisma Client: `bun run db:generate`
3. Create migration: `bun run db:migrate`

## 📚 Additional Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Panduan lengkap untuk end users
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Setup Google OAuth 2.0 (detailed guide)
- **[PRODUCTION_OAUTH_VERIFICATION.md](./PRODUCTION_OAUTH_VERIFICATION.md)** - Panduan verifikasi OAuth untuk production (mengatasi warning "Google hasn't verified this app")
- **[PRISMA_SETUP.md](./PRISMA_SETUP.md)** - Setup database dengan Prisma (detailed guide)
- **[TESTING.md](./TESTING.md)** - Testing guide dan documentation
- **[PROGRESS.md](./PROGRESS.md)** - Progress tracking dan development notes
- **[subs-reminder.md](./subs-reminder.md)** - Ide dan requirements awal

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - Fast JavaScript runtime
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Prisma](https://www.prisma.io) - Database toolkit

---

**Last Updated**: December 11, 2024
