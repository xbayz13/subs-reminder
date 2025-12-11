#!/usr/bin/env bun
/**
 * Create .env file from template
 * 
 * Usage: bun scripts/create-env.ts
 */

import { existsSync, writeFileSync } from "fs";
import { join } from "path";

const envTemplate = `# ============================================
# Subscription Reminder - Environment Variables
# ============================================
# Bun automatically loads .env file, no need for dotenv package

# ============================================
# Database Configuration
# ============================================
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/subs_reminder

# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000

# ============================================
# Google OAuth 2.0 Configuration
# ============================================
# Get these from Google Cloud Console:
# 1. Go to https://console.cloud.google.com/
# 2. Create/Select a project
# 3. Enable Google Calendar API
# 4. Go to Credentials → Create OAuth 2.0 Client ID
# 5. Add authorized redirect URI: http://localhost:3000/auth/google/callback

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# ============================================
# Google Calendar API Configuration
# ============================================
GOOGLE_CALENDAR_ID=primary

# ============================================
# Session & Security Configuration
# ============================================
# Generate a random string: openssl rand -base64 32
SESSION_SECRET=your_session_secret_here_change_in_production

# ============================================
# Optional: Logging Configuration
# ============================================
# LOG_LEVEL=info

# ============================================
# Optional: CORS Configuration
# ============================================
# CORS_ORIGINS=http://localhost:3000,http://localhost:5173
`;

const envPath = join(process.cwd(), ".env");

if (existsSync(envPath)) {
  console.log("⚠️  .env file already exists!");
  console.log("   If you want to recreate it, delete the existing file first.");
  process.exit(1);
}

try {
  writeFileSync(envPath, envTemplate, "utf-8");
  console.log("✅ Created .env file successfully!");
  console.log("📝 Please edit .env file and fill in your configuration values.");
  console.log("📖 See ENV_SETUP.md for detailed documentation.");
} catch (error) {
  console.error("❌ Failed to create .env file:", error);
  process.exit(1);
}

