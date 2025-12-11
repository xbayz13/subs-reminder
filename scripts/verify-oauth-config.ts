#!/usr/bin/env bun
/**
 * Verify Google OAuth Configuration
 * 
 * Checks if all required OAuth environment variables are set correctly
 * 
 * Usage: bun scripts/verify-oauth-config.ts
 */

import { env } from "../src/config/env";

console.log("🔍 Verifying Google OAuth Configuration...\n");

// Check required variables
const checks = [
  {
    name: "GOOGLE_CLIENT_ID",
    value: env.GOOGLE_CLIENT_ID,
    valid: (val: string) => val && val.includes(".apps.googleusercontent.com"),
    message: "Should be in format: xxxxxx.apps.googleusercontent.com",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    value: env.GOOGLE_CLIENT_SECRET,
    valid: (val: string) => val && val.length > 10,
    message: "Should be a long string (GOCSPX-...)",
  },
  {
    name: "GOOGLE_REDIRECT_URI",
    value: env.GOOGLE_REDIRECT_URI,
    valid: (val: string) => val && val.includes("/auth/google/callback"),
    message: "Should end with /auth/google/callback",
  },
  {
    name: "GOOGLE_CALENDAR_ID",
    value: env.GOOGLE_CALENDAR_ID,
    valid: (val: string) => val && (val === "primary" || val.length > 0),
    message: "Should be 'primary' or a calendar ID",
  },
  {
    name: "SESSION_SECRET",
    value: env.SESSION_SECRET,
    valid: (val: string) => val && val.length >= 16,
    message: "Should be at least 16 characters long",
  },
];

let allValid = true;

for (const check of checks) {
  const isValid = check.value && check.valid(check.value);
  const icon = isValid ? "✅" : "❌";
  const status = isValid ? "OK" : "INVALID";
  
  console.log(`${icon} ${check.name}: ${status}`);
  
  if (check.value) {
    // Mask sensitive values
    if (check.name.includes("SECRET")) {
      console.log(`   Value: ${check.value.substring(0, 8)}... (hidden)`);
    } else {
      console.log(`   Value: ${check.value}`);
    }
  } else {
    console.log(`   Value: NOT SET`);
  }
  
  if (!isValid && check.message) {
    console.log(`   ⚠️  ${check.message}`);
  }
  
  console.log();
  
  if (!isValid) {
    allValid = false;
  }
}

// Additional checks
console.log("📋 Additional Checks:\n");

// Check redirect URI format
const redirectUri = env.GOOGLE_REDIRECT_URI;
if (redirectUri) {
  try {
    const url = new URL(redirectUri);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      console.log("❌ GOOGLE_REDIRECT_URI: Invalid protocol (should be http:// or https://)");
      allValid = false;
    } else {
      console.log("✅ GOOGLE_REDIRECT_URI: Valid URL format");
    }
  } catch {
    console.log("❌ GOOGLE_REDIRECT_URI: Invalid URL format");
    allValid = false;
  }
}

// Check if development vs production
console.log();
if (env.NODE_ENV === "development") {
  if (redirectUri?.includes("localhost")) {
    console.log("✅ Development mode: Using localhost redirect URI");
  } else {
    console.log("⚠️  Development mode: Redirect URI doesn't use localhost");
  }
} else if (env.NODE_ENV === "production") {
  if (redirectUri?.includes("https://")) {
    console.log("✅ Production mode: Using HTTPS redirect URI");
  } else {
    console.log("⚠️  Production mode: Redirect URI should use HTTPS");
    allValid = false;
  }
}

console.log("\n" + "=".repeat(50));
if (allValid) {
  console.log("✅ All OAuth configuration checks passed!");
  console.log("\n📝 Next steps:");
  console.log("1. Verify redirect URI in Google Cloud Console matches:");
  console.log(`   ${redirectUri}`);
  console.log("2. Ensure Google Calendar API is enabled");
  console.log("3. Test OAuth flow: bun dev → http://localhost:3000/auth/google");
  process.exit(0);
} else {
  console.log("❌ Some configuration issues found. Please fix them above.");
  console.log("\n📖 See GOOGLE_OAUTH_SETUP.md for detailed setup instructions.");
  process.exit(1);
}

