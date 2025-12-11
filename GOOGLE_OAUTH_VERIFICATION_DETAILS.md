# Google OAuth Verification - Additional Details

Template untuk mengisi bagian "Share any final details about your app" dalam form verifikasi Google OAuth.

---

## Template untuk Form Verification

Copy dan paste teks berikut ke dalam form verifikasi Google OAuth:

---

### Application Overview

**Subscription Reminder** is a web application designed to help users manage their recurring subscriptions and track payment due dates. The application provides a centralized platform for users to:

- Track multiple subscription services (e.g., Netflix, Spotify, Adobe Creative Cloud)
- Monitor payment installments and due dates
- Receive automatic reminders through Google Calendar integration
- View statistics and reports about subscription spending
- Manage subscription data with full CRUD operations

### OAuth Scopes Usage

The application requests the following OAuth scopes for the following purposes:

1. **`openid`** - Used for user authentication and identification
   - Purpose: Authenticate users securely using OpenID Connect
   - Usage: Required for establishing user sessions and identifying logged-in users

2. **`email`** - Used to retrieve user's primary email address
   - Purpose: Display user email in the application and use as unique identifier
   - Usage: Shown in user profile and used for account identification

3. **`profile`** - Used to retrieve user's basic profile information
   - Purpose: Display user name and profile picture in the application
   - Usage: Shown in navigation bar and user profile page

4. **`https://www.googleapis.com/auth/calendar`** - Used for Google Calendar integration
   - Purpose: Create, update, and delete calendar events for subscription payment reminders
   - Usage: 
     - Automatically creates calendar events when users add new subscriptions
     - Updates events when subscription details are modified
     - Deletes events when subscriptions are deleted or payments are marked as paid
     - Provides users with reminders about upcoming payment due dates

### Data Collection and Usage

The application collects and uses the following data:

- **User Information**: Email address, name, and profile picture (from Google OAuth)
- **Subscription Data**: Names, descriptions, prices, payment dates, and subscription types (user-provided)
- **Payment Tracking**: Payment installments, due dates, and payment status (user-provided)
- **Calendar Events**: Creates reminder events in user's Google Calendar (with user's explicit consent)

All data is stored securely in a PostgreSQL database and is only accessible to the authenticated user. Users have full control over their data and can delete it at any time.

### Privacy and Security

- **Privacy Policy**: Available at `https://yourdomain.com/privacy-policy`
- **Terms of Service**: Available at `https://yourdomain.com/terms-of-service`
- All data transmission is encrypted using HTTPS
- Session tokens are securely signed and stored
- Users can revoke Google Calendar access at any time through their Google Account settings

### Test User Credentials (if applicable)

If you need test user credentials for verification, please contact us at: **ikhsanpahdian@gmail.com**

We can provide:
- Test user email addresses that have been added to the OAuth consent screen
- Screenshots or video demonstrations of the application
- Access to a staging environment for testing

### Project Information

- **Application Type**: Web Application
- **User Base**: Individual users managing personal subscriptions
- **Access Type**: Public (anyone with a Google account can use the application)
- **Domain**: [Your production domain here, e.g., `subs-reminder.app`]

### Additional Information

- The application is a personal finance management tool focused on subscription tracking
- All Google Calendar events are created in the user's primary calendar with their explicit consent
- Users are informed about calendar integration during the OAuth consent process
- The application does not access or modify any calendar data beyond creating/updating/deleting reminder events
- All calendar events are clearly labeled as subscription payment reminders
- Users can manage (edit/delete) these calendar events directly from their Google Calendar if needed

### Compliance

- The application complies with Google's API Services User Data Policy
- We follow Google's OAuth 2.0 best practices
- All scopes are necessary for the core functionality of the application
- Users are provided with clear information about data usage in our Privacy Policy

### Contact Information

For any questions or concerns regarding this application or the verification process, please contact:

- **Developer Email**: ikhsanpahdian@gmail.com
- **Support Email**: ikhsanpahdian@gmail.com

---

## Catatan Penting

1. **Ganti placeholder**: Ganti `https://yourdomain.com` dengan domain production Anda yang sebenarnya
2. **Test user credentials**: Jika Google meminta test user credentials, siapkan beberapa email test user yang sudah ditambahkan di OAuth consent screen
3. **Screenshots**: Siapkan screenshots aplikasi yang menunjukkan:
   - Halaman login dengan Google OAuth
   - Dashboard dengan subscription list
   - Calendar integration (event yang dibuat di Google Calendar)
   - Privacy Policy dan Terms of Service pages
4. **Video demo** (opsional): Buat video singkat yang menunjukkan:
   - Flow OAuth login
   - Membuat subscription baru
   - Calendar event yang terbuat otomatis
   - Mark payment as paid dan event yang terhapus

## Tips untuk Verifikasi

1. **Jelaskan dengan jelas**: Jelaskan setiap scope dan mengapa diperlukan
2. **Sertakan screenshots**: Screenshots membantu Google memahami penggunaan aplikasi
3. **Responsif**: Jika Google meminta informasi tambahan, respon dengan cepat dan lengkap
4. **Jujur**: Jelaskan penggunaan data dengan jujur dan transparan
5. **Privacy Policy lengkap**: Pastikan Privacy Policy sudah lengkap dan accessible

## Checklist Sebelum Submit

- [ ] Privacy Policy URL sudah accessible dan lengkap
- [ ] Terms of Service URL sudah accessible (jika ada)
- [ ] Domain sudah terverifikasi (jika menggunakan custom domain)
- [ ] Test users sudah ditambahkan (jika masih dalam mode testing)
- [ ] Screenshots sudah disiapkan
- [ ] Semua informasi di form sudah diisi dengan lengkap
- [ ] Email support sudah aktif dan bisa diakses

---

**Good luck dengan verifikasi!** 🚀

