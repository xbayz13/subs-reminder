# Google OAuth Verification untuk Production

## 🚨 Masalah: "Google hasn't verified this app"

Saat aplikasi di-deploy ke production, pengguna akan melihat warning:
> "Google hasn't verified this app. The app is requesting access to sensitive info in your Google Account."

Ini terjadi karena aplikasi masih dalam status **"Testing"** di Google Cloud Console.

## ✅ Solusi

Ada 2 opsi untuk mengatasi masalah ini:

### Opsi 1: Tambahkan Test Users (Cepat - untuk Development/Testing)

**Cocok untuk:** Aplikasi yang masih dalam tahap development atau testing dengan pengguna terbatas.

**Langkah-langkah:**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Buka **"APIs & Services"** → **"OAuth consent screen"**
4. Scroll ke bagian **"Test users"**
5. Klik **"Add Users"** atau **"+"**
6. Tambahkan email Google dari semua pengguna yang akan menggunakan aplikasi:
   - Masukkan satu email per baris
   - Contoh: `user1@gmail.com`, `user2@gmail.com`
   - **Tambahkan email Anda sendiri juga** (`ikhsanpahdian@gmail.com`)
7. Klik **"Add"**
8. Pastikan semua email muncul di list test users
9. **Save** perubahan

**Hasil:**
- Pengguna yang terdaftar sebagai test users tidak akan melihat warning
- Pengguna lain yang tidak terdaftar akan tetap melihat warning dan tidak bisa login

**Limitasi:**
- Maksimal 100 test users
- Tidak cocok untuk aplikasi publik dengan banyak pengguna

---

### Opsi 2: Verifikasi Aplikasi dengan Google (Permanen - untuk Production)

**Cocok untuk:** Aplikasi production yang akan digunakan oleh banyak pengguna atau publik.

**Persyaratan:**

1. **Domain Verification** (jika menggunakan custom domain)
   - Verifikasi ownership domain di [Google Search Console](https://search.google.com/search-console)
   - Atau gunakan domain yang sudah terverifikasi di Google Workspace

2. **Privacy Policy URL** (WAJIB)
   - Buat halaman Privacy Policy yang menjelaskan:
     - Data apa yang dikumpulkan
     - Bagaimana data digunakan
     - Bagaimana data disimpan dan dilindungi
   - URL harus accessible dari internet
   - Contoh: `https://yourdomain.com/privacy-policy`

3. **Terms of Service URL** (Sangat Direkomendasikan)
   - Buat halaman Terms of Service
   - URL harus accessible dari internet
   - Contoh: `https://yourdomain.com/terms-of-service`

4. **App Information Lengkap**
   - App name yang jelas
   - App logo (jika ada)
   - Support email yang valid
   - Developer contact information

**Langkah-langkah Verifikasi:**

#### Step 1: Siapkan Privacy Policy & Terms of Service

✅ **Halaman sudah dibuat!** Privacy Policy dan Terms of Service sudah tersedia di aplikasi.

**URL yang tersedia:**
- **Privacy Policy**: 
  - `https://yourdomain.com/privacy-policy` (via pathname)
  - `https://yourdomain.com/#privacy-policy` (via hash)
- **Terms of Service**: 
  - `https://yourdomain.com/terms-of-service` (via pathname)
  - `https://yourdomain.com/#terms-of-service` (via hash)

**Catatan:**
- Halaman ini adalah **public pages** (tidak memerlukan authentication)
- Konten sudah lengkap dan sesuai dengan penggunaan aplikasi
- Pastikan URL ini accessible dari internet setelah deploy ke production
- Gunakan URL dengan pathname (tanpa hash) untuk Google OAuth verification

#### Step 2: Update OAuth Consent Screen

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Buka **"APIs & Services"** → **"OAuth consent screen"**
4. Klik **"Edit App"**

5. **App Information:**
   - **App name**: Nama aplikasi yang jelas (contoh: "Subscription Reminder")
   - **User support email**: Email support Anda (`ikhsanpahdian@gmail.com`)
   - **App logo**: Upload logo aplikasi (opsional)
   - **Application home page**: URL homepage aplikasi (contoh: `https://yourdomain.com`)
   - **Application privacy policy link**: **WAJIB** - URL Privacy Policy
     - Contoh: `https://yourdomain.com/privacy-policy`
   - **Application terms of service link**: URL Terms of Service (jika ada)
   - **Authorized domains**: Tambahkan domain Anda (contoh: `yourdomain.com`)
   - **Developer contact information**: Email Anda (`ikhsanpahdian@gmail.com`)

6. **Scopes:**
   - Pastikan hanya scopes yang diperlukan:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar`
   - **Jangan tambahkan scope yang tidak digunakan**

7. **Save and Continue**

#### Step 3: Submit untuk Verifikasi

1. Di halaman OAuth consent screen, scroll ke bawah
2. Klik **"PUBLISH APP"** (jika masih dalam mode Testing)
3. Atau klik **"Submit for verification"** (jika sudah Published)

4. **Isi form verifikasi:**
   - **OAuth scopes**: Pilih scopes yang digunakan
   - **App domain**: Domain aplikasi Anda
   - **Authorized domains**: Domain yang sudah diverifikasi
   - **Privacy Policy URL**: URL Privacy Policy
   - **Terms of Service URL**: URL Terms of Service (jika ada)
   - **Support email**: Email support
   - **Additional information**: Jelaskan penggunaan aplikasi dan scopes

5. **Submit** form

6. **Tunggu review dari Google:**
   - Proses review biasanya memakan waktu **1-2 minggu**
   - Google akan mengirim email ke developer contact email
   - Jika ada pertanyaan, Google akan menghubungi via email

#### Step 4: Setelah Verifikasi

1. Setelah aplikasi diverifikasi, status akan berubah menjadi **"Published"**
2. Semua pengguna bisa login tanpa melihat warning
3. Tidak perlu menambahkan test users lagi

---

## 🔧 Quick Fix untuk Development (Sementara)

Jika Anda perlu menguji aplikasi di production sambil menunggu verifikasi:

1. **Tambahkan semua email pengguna sebagai test users** (Opsi 1)
2. **Atau** buat akun Google khusus untuk testing
3. **Atau** gunakan domain yang sudah terverifikasi (jika menggunakan Google Workspace)

---

## 📝 Checklist Verifikasi

Sebelum submit untuk verifikasi, pastikan:

- [ ] Privacy Policy URL sudah dibuat dan accessible
- [ ] Terms of Service URL sudah dibuat (direkomendasikan)
- [ ] App name sudah jelas dan deskriptif
- [ ] Support email sudah diisi
- [ ] Developer contact information sudah diisi
- [ ] App logo sudah diupload (opsional tapi direkomendasikan)
- [ ] Application home page URL sudah diisi
- [ ] Authorized domains sudah ditambahkan
- [ ] Hanya scopes yang diperlukan yang digunakan
- [ ] OAuth consent screen sudah di-review dan lengkap

---

## 🆘 Troubleshooting

### "Verification failed" atau "More information needed"

- **Cek email dari Google** - Biasanya ada detail tentang apa yang kurang
- **Pastikan Privacy Policy accessible** - Coba akses URL di browser incognito
- **Pastikan domain terverifikasi** - Jika menggunakan custom domain
- **Review scopes** - Pastikan hanya scopes yang benar-benar digunakan

### "App is still in testing mode"

- Pastikan sudah klik **"PUBLISH APP"** atau **"Submit for verification"**
- Tunggu review dari Google (bisa 1-2 minggu)
- Cek email untuk update dari Google

### Pengguna masih melihat warning setelah verifikasi

- Pastikan status aplikasi sudah **"Published"** (bukan "Testing")
- Clear cache browser pengguna
- Pastikan pengguna login dengan akun yang sama

---

## 📚 Referensi

- [Google OAuth Verification Guide](https://support.google.com/cloud/answer/9110914)
- [OAuth Consent Screen Documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect#appsetup)
- [Privacy Policy Requirements](https://support.google.com/cloud/answer/9110914#privacy)

## 📝 Template untuk Form Verification

Lihat **[GOOGLE_OAUTH_VERIFICATION_DETAILS.md](./GOOGLE_OAUTH_VERIFICATION_DETAILS.md)** untuk template lengkap yang bisa digunakan untuk mengisi bagian "Share any final details about your app" dalam form verifikasi Google OAuth.

Template tersebut mencakup:
- Application overview
- OAuth scopes usage explanation
- Data collection and usage
- Privacy and security information
- Test user credentials (jika diperlukan)
- Contact information

---

## 💡 Tips

1. **Mulai proses verifikasi lebih awal** - Proses bisa memakan waktu 1-2 minggu
2. **Gunakan Privacy Policy generator** - Banyak tools online yang bisa membantu
3. **Test dengan test users dulu** - Sebelum submit verifikasi, test dengan test users
4. **Monitor email** - Google akan mengirim update via email
5. **Siapkan dokumentasi** - Jika Google meminta informasi tambahan, siapkan dokumentasi tentang penggunaan aplikasi

