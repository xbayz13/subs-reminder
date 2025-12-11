# Google OAuth 2.0 Setup Guide

Panduan lengkap untuk setup Google OAuth 2.0 untuk aplikasi Subscription Reminder.

## 🚨 Common Errors & Quick Fixes

- **`redirect_uri_mismatch` error?** → See [QUICK_FIX_REDIRECT_URI.md](./QUICK_FIX_REDIRECT_URI.md)
- **`access_denied` (403) error?** → See [QUICK_FIX_ACCESS_DENIED.md](./QUICK_FIX_ACCESS_DENIED.md)
- **"You've been given access to an app that's currently being tested" warning?** → See [QUICK_FIX_TESTING_WARNING.md](./QUICK_FIX_TESTING_WARNING.md) - **This is normal!**

## 📋 Prerequisites

1. Akun Google (Gmail account)
2. Akses ke [Google Cloud Console](https://console.cloud.google.com/)
3. Aplikasi sudah running di `http://localhost:3000` (untuk development)

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **"Select a project"** di bagian atas
3. Klik **"New Project"**
4. Isi:
   - **Project name**: `Subscription Reminder` (atau nama lain)
   - **Organization**: (opsional)
   - **Location**: (opsional)
5. Klik **"Create"**
6. Tunggu beberapa detik hingga project dibuat
7. Pastikan project yang baru dibuat sudah ter-select

### Step 2: Enable Required APIs

1. Di Google Cloud Console, buka **"APIs & Services"** → **"Library"**
2. Cari dan enable API berikut:
   - **Google Calendar API** ⭐ (Required untuk calendar integration)
   - **Google+ API** (opsional, untuk user info)

#### Enable Google Calendar API:
1. Cari "Google Calendar API"
2. Klik pada hasil
3. Klik tombol **"Enable"**
4. Tunggu hingga enabled

### Step 3: Configure OAuth Consent Screen

1. Buka **"APIs & Services"** → **"OAuth consent screen"**
2. Pilih **"External"** (untuk development) atau **"Internal"** (jika menggunakan Google Workspace)
3. Klik **"Create"**
4. Isi form:
   - **App name**: `Subscription Reminder`
   - **User support email**: Pilih email Anda
   - **Developer contact information**: Masukkan email Anda
5. Klik **"Save and Continue"**
6. **Scopes** (Step 2):
   - Klik **"Add or Remove Scopes"**
   - Pilih scopes berikut:
     - `openid` (OpenID Connect)
     - `email` (See your primary Google Account email address)
     - `profile` (See your personal info, including any personal info you've made publicly available)
     - `https://www.googleapis.com/auth/calendar` (See, edit, share, and permanently delete all the calendars you can access using Google Calendar)
   - Klik **"Update"**
   - Klik **"Save and Continue"**
7. **Test users** (Step 3) ⚠️ **IMPORTANT - Required untuk development**:
   - Untuk development, **WAJIB** tambahkan email Google Anda sebagai test user
   - Klik **"Add Users"** atau **"+"**
   - Masukkan email Google Anda yang akan digunakan untuk login
     - Contoh: `your-email@gmail.com`
     - Bisa tambahkan multiple emails (satu per baris)
   - Klik **"Add"**
   - **Pastikan email Anda muncul di list test users**
   - Klik **"Save and Continue"**
   
   ⚠️ **Note**: Tanpa menambahkan test user, Anda akan mendapat error `403: access_denied`
8. **Summary** (Step 4):
   - Review semua konfigurasi
   - Klik **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Jika diminta, pilih **"Web application"** sebagai Application type
4. Isi form:
   - **Name**: `Subscription Reminder - Development` (atau nama lain)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback`
5. Klik **"Create"**
6. **IMPORTANT**: Copy credentials yang muncul:
   - **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`
   - ⚠️ **Jangan share credentials ini!**

### Step 5: Configure Environment Variables

1. Buka file `.env` di root project
2. Update values berikut:

```env
GOOGLE_CLIENT_ID=your_client_id_from_step_4
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_4
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_CALENDAR_ID=primary
```

3. Save file

### Step 6: Test OAuth Configuration

1. Start development server:
   ```bash
   bun dev
   ```

2. Buka browser dan akses:
   ```
   http://localhost:3000/auth/google
   ```

3. Anda akan di-redirect ke Google OAuth consent screen
4. Login dengan Google account yang sudah ditambahkan sebagai test user
5. **Anda mungkin melihat warning**: "You've been given access to an app that's currently being tested"
   - ⚠️ **Ini normal!** Klik "Continue" saja
   - Lihat [QUICK_FIX_TESTING_WARNING.md](./QUICK_FIX_TESTING_WARNING.md) untuk detail
6. Berikan consent untuk permissions yang diminta
7. Anda akan di-redirect kembali ke aplikasi
8. Check browser console dan network tab untuk melihat apakah session sudah dibuat

## 🔍 Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
  - [ ] App name diisi
  - [ ] Support email diisi
  - [ ] Scopes ditambahkan (openid, email, profile, calendar)
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized redirect URI: `http://localhost:3000/auth/google/callback`
- [ ] Environment variables di-set di `.env`
- [ ] **Test user ditambahkan (WAJIB untuk development)** ⚠️
  - [ ] Email Anda sudah ditambahkan di "Test users" section
  - [ ] Email yang digunakan untuk login sama dengan test user
- [ ] OAuth flow berhasil (redirect ke Google dan kembali ke app)

## 🧪 Testing OAuth Flow

### Manual Testing

1. **Test OAuth Initiation**:
   ```bash
   curl http://localhost:3000/auth/google -v
   ```
   Should redirect to Google OAuth page

2. **Test OAuth Callback** (setelah login):
   - Login melalui browser
   - Check apakah session cookie sudah di-set
   - Check apakah user sudah ter-create di database

3. **Test Protected Routes**:
   ```bash
   # Without session (should fail)
   curl http://localhost:3000/auth/me
   
   # With session cookie (should succeed)
   curl http://localhost:3000/auth/me -H "Cookie: session=..."
   ```

### Automated Testing

Run integration tests:
```bash
bun test src/presentation/api/routes/__tests__/auth.routes.test.ts
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch" ⚠️ MOST COMMON ERROR

**Problem**: Redirect URI tidak match dengan yang di-set di Google Cloud Console

**Quick Fix**:
```bash
# Run debug script to see exact redirect URI
bun scripts/debug-oauth-redirect.ts
```

**Detailed Solution**:

1. **Check current redirect URI**:
   ```bash
   cat .env | grep GOOGLE_REDIRECT_URI
   ```
   Should show: `GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback`

2. **Verify in Google Cloud Console**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your OAuth 2.0 Client ID
   - Scroll to "Authorized redirect URIs"
   - **MUST have EXACTLY**: `http://localhost:3000/auth/google/callback`
   
3. **Common mistakes**:
   - ❌ `http://localhost:3000/auth/google/callback/` (trailing slash)
   - ❌ `https://localhost:3000/auth/google/callback` (https instead of http)
   - ❌ `http://127.0.0.1:3000/auth/google/callback` (127.0.0.1 instead of localhost)
   - ❌ `http://localhost/auth/google/callback` (missing port)
   - ❌ `http://localhost:3000/auth/google` (missing /callback)
   - ✅ `http://localhost:3000/auth/google/callback` (CORRECT)

4. **If redirect URI is missing in Google Cloud Console**:
   - Click "ADD URI" button
   - Paste: `http://localhost:3000/auth/google/callback`
   - Click "SAVE"
   - **Wait 1-2 minutes** for changes to propagate

5. **If you changed PORT in .env**:
   - Update both `.env` and Google Cloud Console
   - Example: If `PORT=8080`, then redirect URI should be:
     - `.env`: `GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback`
     - Google Cloud Console: `http://localhost:8080/auth/google/callback`

6. **After fixing, test again**:
   ```bash
   bun dev
   # Then open: http://localhost:3000/auth/google
   ```

### Error: "access_denied" (403) ⚠️ COMMON ERROR

**Problem**: User tidak ada di test users list atau OAuth consent screen belum di-configure

**Quick Fix**:
```bash
# See detailed guide
cat QUICK_FIX_ACCESS_DENIED.md
```

**Detailed Solution**:

1. **Check Test Users**:
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Scroll to "Test users" section (Step 3)
   - Pastikan email Anda ada di list
   
2. **Jika Email Tidak Ada**:
   - Klik "ADD USERS" atau "+"
   - Masukkan email Google Anda yang akan digunakan untuk login
   - Klik "ADD"
   - Klik "SAVE" (jika ada)
   - **Tunggu 1-2 menit** untuk perubahan terpropagasi

3. **Pastikan Email Match**:
   - Email yang digunakan untuk login di Google **HARUS SAMA** dengan email yang ditambahkan sebagai test user
   - Contoh: Jika test user adalah `john@gmail.com`, maka login harus dengan `john@gmail.com`

4. **Check OAuth Consent Screen**:
   - Pastikan sudah di-configure dengan benar
   - App name sudah diisi
   - Support email sudah diisi
   - Scopes sudah ditambahkan (openid, email, profile, calendar)

5. **Clear Browser Cache**:
   - Clear cache dan cookies
   - Logout dari semua Google accounts
   - Login lagi dengan email yang sudah ditambahkan sebagai test user

6. **Test Lagi**:
   ```bash
   bun dev
   # Buka: http://localhost:3000/auth/google
   ```

### Error: "invalid_client"

**Problem**: Client ID atau Client Secret salah

**Solution**:
1. Double-check `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` di `.env`
2. Pastikan tidak ada spasi atau karakter tambahan
3. Copy-paste langsung dari Google Cloud Console

### Error: "invalid_grant"

**Problem**: Authorization code sudah expired atau digunakan

**Solution**:
1. Coba login ulang
2. Pastikan tidak ada delay terlalu lama antara redirect dan token exchange

### Session tidak terbuat setelah login

**Problem**: OAuth berhasil tapi session tidak ter-set

**Solution**:
1. Check browser console untuk errors
2. Check network tab untuk melihat response dari `/auth/google/callback`
3. Pastikan cookies enabled di browser
4. Check `SESSION_SECRET` di `.env` sudah di-set

### Google Calendar API tidak enabled

**Problem**: Error saat create calendar event

**Solution**:
1. Pastikan Google Calendar API sudah enabled di Google Cloud Console
2. Check di **"APIs & Services"** → **"Enabled APIs"**
3. Jika belum, enable Google Calendar API

## 🔐 Security Best Practices

1. **Never commit `.env` file**:
   - File sudah di `.gitignore`
   - Jangan share credentials via chat/email

2. **Use different credentials for production**:
   - Buat OAuth Client ID terpisah untuk production
   - Update `GOOGLE_REDIRECT_URI` untuk production domain
   - Use strong `SESSION_SECRET` di production

3. **Rotate credentials periodically**:
   - Generate new Client Secret setiap 6-12 bulan
   - Update di `.env` dan restart aplikasi

4. **Limit OAuth scopes**:
   - Hanya request scopes yang benar-benar diperlukan
   - Review permissions yang diminta

## 📝 Production Setup

Untuk production, lakukan perubahan berikut:

1. **Update OAuth Consent Screen**:
   - Ubah dari "Testing" ke "In Production"
   - Submit untuk verification (jika perlu)

2. **Create Production OAuth Client**:
   - Buat OAuth Client ID baru untuk production
   - Set authorized redirect URI: `https://yourdomain.com/auth/google/callback`

3. **Update Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=production_client_id
   GOOGLE_CLIENT_SECRET=production_client_secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   API_URL=https://yourdomain.com
   NODE_ENV=production
   ```

4. **Update Google Cloud Console**:
   - Tambahkan production redirect URI
   - Update authorized JavaScript origins jika perlu

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) - Untuk testing OAuth flow

## ✅ Quick Verification

Setelah setup, verifikasi dengan:

```bash
# 1. Check environment variables
bun run -e "console.log(process.env.GOOGLE_CLIENT_ID ? '✅ GOOGLE_CLIENT_ID set' : '❌ GOOGLE_CLIENT_ID missing')"

# 2. Start server (should not error)
bun dev

# 3. Test OAuth redirect
curl -I http://localhost:3000/auth/google
# Should return 302 redirect to Google
```

---

**Last Updated**: December 11, 2024

