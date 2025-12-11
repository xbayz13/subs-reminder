#!/usr/bin/env bun
/**
 * Debug OAuth Redirect URI Mismatch
 * 
 * Helps diagnose redirect_uri_mismatch errors by showing:
 * - Current redirect URI from .env
 * - What should be configured in Google Cloud Console
 * - Common mistakes to check
 * 
 * Usage: bun scripts/debug-oauth-redirect.ts
 */

import { env } from "../src/config/env";

console.log("🔍 OAuth Redirect URI Debug Tool\n");
console.log("=".repeat(60));

// Show current configuration
console.log("\n📋 Current Configuration:\n");
console.log(`Redirect URI: ${env.GOOGLE_REDIRECT_URI}`);
console.log(`Port: ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);

// Parse and validate
try {
  const redirectUrl = new URL(env.GOOGLE_REDIRECT_URI);
  
  console.log("\n✅ Redirect URI Format Analysis:\n");
  console.log(`Protocol: ${redirectUrl.protocol}`);
  console.log(`Host: ${redirectUrl.host}`);
  console.log(`Port: ${redirectUrl.port || 'default (80/443)'}`);
  console.log(`Path: ${redirectUrl.pathname}`);
  
  // Check for common issues
  console.log("\n⚠️  Common Issues to Check:\n");
  
  const issues: string[] = [];
  
  // Check protocol
  if (env.NODE_ENV === "development" && redirectUrl.protocol !== "http:") {
    issues.push("❌ Development should use http:// not https://");
  }
  
  // Check port
  const expectedPort = env.PORT || 3000;
  const actualPort = redirectUrl.port ? parseInt(redirectUrl.port) : (redirectUrl.protocol === "https:" ? 443 : 80);
  if (actualPort !== expectedPort) {
    issues.push(`❌ Port mismatch: URI uses port ${actualPort}, but server runs on ${expectedPort}`);
  }
  
  // Check path
  if (!redirectUrl.pathname.endsWith("/auth/google/callback")) {
    issues.push("❌ Path should end with /auth/google/callback");
  }
  
  // Check for trailing slash
  if (env.GOOGLE_REDIRECT_URI.endsWith("/") && !env.GOOGLE_REDIRECT_URI.endsWith("/callback")) {
    issues.push("❌ Should not have trailing slash (except after /callback)");
  }
  
  if (issues.length === 0) {
    console.log("✅ No obvious format issues found in redirect URI");
  } else {
    issues.forEach(issue => console.log(issue));
  }
  
} catch (error) {
  console.log("\n❌ Invalid redirect URI format!");
  console.log(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
}

console.log("\n" + "=".repeat(60));
console.log("\n📝 Google Cloud Console Configuration:\n");
console.log("The redirect URI in Google Cloud Console MUST match EXACTLY:");
console.log(`\n   ${env.GOOGLE_REDIRECT_URI}\n`);
console.log("(Copy this EXACT value, including http://, port, and path)\n");

console.log("🔧 Steps to Fix:\n");
console.log("1. Go to: https://console.cloud.google.com/apis/credentials");
console.log("2. Click on your OAuth 2.0 Client ID");
console.log("3. Under 'Authorized redirect URIs', check if you have:");
console.log(`   ${env.GOOGLE_REDIRECT_URI}`);
console.log("\n4. If it's NOT there, click 'ADD URI' and paste:");
console.log(`   ${env.GOOGLE_REDIRECT_URI}`);
console.log("\n5. Click 'SAVE'");
console.log("\n6. Wait 1-2 minutes for changes to propagate");
console.log("\n7. Try logging in again");

console.log("\n" + "=".repeat(60));
console.log("\n💡 Important Notes:\n");
console.log("• The redirect URI is case-sensitive");
console.log("• No trailing slash (unless it's part of the path)");
console.log("• Must match EXACTLY (including http:// vs https://)");
console.log("• Changes in Google Cloud Console can take 1-2 minutes to propagate");
console.log("• Clear browser cache if issue persists");

console.log("\n" + "=".repeat(60));
console.log("\n🧪 Test the redirect URI:\n");
console.log(`1. Start server: bun dev`);
console.log(`2. Open: http://localhost:${env.PORT}/auth/google`);
console.log(`3. Check the redirect URL in browser address bar`);
console.log(`4. It should redirect to Google with redirect_uri parameter`);
console.log(`5. Check browser console for any errors\n`);

