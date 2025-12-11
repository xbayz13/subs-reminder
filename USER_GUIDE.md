# User Guide: Subscription Reminder & Payment Tracker

## 📖 Overview

Subscription Reminder & Payment Tracker adalah aplikasi web yang membantu Anda mengelola subscription dan melacak pembayaran berulang. Aplikasi ini terintegrasi dengan Google Calendar untuk mengirimkan reminder otomatis sebelum tanggal pembayaran.

## 🚀 Getting Started

### 1. Login dengan Google

1. Buka aplikasi di browser Anda
2. Klik tombol **"Login with Google"**
3. Pilih akun Google yang ingin digunakan
4. Berikan izin untuk akses:
   - **Email**: Untuk identifikasi akun
   - **Profile**: Untuk nama dan foto profil
   - **Google Calendar**: Untuk membuat reminder otomatis

### 2. Setup Profil (Opsional)

Setelah login, Anda dapat mengupdate profil Anda:

- **Nama**: Nama yang akan ditampilkan di aplikasi
- **Negara**: Untuk format currency yang sesuai
- **Currency**: Mata uang yang digunakan (USD, IDR, dll)
- **Tanggal Lahir**: Untuk perhitungan usia (opsional)

## 📝 Managing Subscriptions

### Membuat Subscription Baru

1. Klik **"Subscriptions"** di menu navigasi
2. Klik tombol **"Add New Subscription"**
3. Isi form:
   - **Nama**: Nama subscription (contoh: "Netflix", "Spotify Premium")
   - **Deskripsi**: Deskripsi opsional
   - **Tanggal Pembayaran**: Tanggal pertama pembayaran (akan digunakan untuk menghitung tanggal berikutnya)
   - **Harga**: Harga per periode
   - **Tipe**: 
     - **MONTHLY**: Pembayaran bulanan
     - **YEARLY**: Pembayaran tahunan
   - **Reminder**: Kapan reminder dikirim
     - **D_0**: Hari yang sama
     - **D_1**: 1 hari sebelum
     - **D_3**: 3 hari sebelum
     - **D_7**: 7 hari sebelum
     - **D_14**: 14 hari sebelum
   - **Tanggal Berakhir**: Opsional, jika subscription memiliki tanggal akhir
4. Klik **"Save"**

**Catatan**: Jika Anda sudah memberikan izin akses Google Calendar, reminder akan otomatis dibuat di Google Calendar Anda.

### Melihat Daftar Subscriptions

1. Klik **"Subscriptions"** di menu navigasi
2. Anda akan melihat daftar semua subscriptions Anda
3. Gunakan filter **"Active Only"** untuk hanya melihat subscription yang masih aktif

### Mengedit Subscription

1. Di halaman Subscriptions, klik subscription yang ingin diedit
2. Ubah informasi yang diperlukan
3. Klik **"Save"**

### Menghapus Subscription

1. Di halaman Subscriptions, klik subscription yang ingin dihapus
2. Klik tombol **"Delete"**
3. Konfirmasi penghapusan

**Peringatan**: Menghapus subscription juga akan menghapus semua installment/pembayaran yang terkait.

## 💳 Managing Payments

### Melihat Installments

1. Klik **"Subscriptions"** di menu navigasi
2. Pilih subscription yang ingin dilihat installments-nya
3. Installments akan ditampilkan di bawah detail subscription

### Menandai Pembayaran sebagai Paid

1. Di daftar installments, klik installment yang sudah dibayar
2. Klik tombol **"Mark as Paid"**
3. Status akan berubah menjadi "Paid"

### Konfirmasi Pembayaran dari Google Calendar

Jika Anda menerima reminder dari Google Calendar:

1. Buka event di Google Calendar
2. Klik link konfirmasi di deskripsi event
3. Anda akan diarahkan ke halaman konfirmasi pembayaran
4. Klik **"Confirm Payment"**
5. Status pembayaran akan otomatis diupdate

## 📊 Dashboard

Dashboard memberikan overview dari semua subscriptions dan pembayaran Anda:

### Next Payments

Menampilkan 5 pembayaran terdekat yang akan datang, diurutkan berdasarkan tanggal.

### Top Subscriptions

Menampilkan 5 subscription dengan harga tertinggi.

### Statistics

- **Total Active Subscriptions**: Jumlah subscription yang masih aktif
- **Total Monthly Cost**: Total biaya bulanan (untuk monthly subscriptions)
- **Total Yearly Cost**: Total biaya tahunan (untuk yearly subscriptions)
- **Upcoming Payments (7 days)**: Jumlah pembayaran yang akan datang dalam 7 hari
- **Overdue Payments**: Jumlah pembayaran yang sudah lewat tanggal tapi belum dibayar

## 🔔 Reminder System

### Cara Kerja

1. Saat Anda membuat subscription baru, sistem akan:
   - Membuat installment untuk setiap periode pembayaran
   - Membuat event di Google Calendar (jika izin diberikan)
   - Event akan muncul di Google Calendar sesuai dengan pengaturan reminder

2. Reminder akan dikirim sesuai dengan pengaturan **Reminder Start**:
   - Jika Anda memilih **D_1**, reminder akan muncul 1 hari sebelum tanggal pembayaran
   - Jika Anda memilih **D_7**, reminder akan muncul 7 hari sebelum tanggal pembayaran

3. Setiap event di Google Calendar berisi:
   - Nama subscription
   - Tanggal pembayaran
   - Harga
   - Link untuk konfirmasi pembayaran

### Mengatur Reminder

Anda dapat mengatur reminder saat membuat atau mengedit subscription:

- **D_0**: Hari yang sama dengan tanggal pembayaran
- **D_1**: 1 hari sebelum (disarankan)
- **D_3**: 3 hari sebelum
- **D_7**: 7 hari sebelum
- **D_14**: 14 hari sebelum

**Tips**: Pilih **D_1** atau **D_3** untuk reminder yang tidak terlalu jauh tapi masih memberikan waktu untuk persiapan.

## 🔐 Security & Privacy

### Data yang Disimpan

Aplikasi menyimpan:
- Informasi profil Google (nama, email, foto)
- OAuth tokens untuk akses Google Calendar (dienkripsi)
- Data subscription dan pembayaran

### Data yang TIDAK Disimpan

- Password Google (tidak pernah diakses)
- Data pribadi lainnya dari Google
- Informasi kartu kredit atau metode pembayaran

### Keamanan

- Semua komunikasi menggunakan HTTPS
- Session cookies dienkripsi dengan HMAC
- OAuth tokens disimpan dengan aman
- Tidak ada data sensitif yang dibagikan dengan pihak ketiga

## ❓ FAQ

### Q: Apakah aplikasi ini gratis?

A: Ya, aplikasi ini gratis untuk digunakan.

### Q: Apakah saya harus memberikan izin Google Calendar?

A: Tidak wajib, tapi sangat disarankan. Tanpa izin Google Calendar, reminder tidak akan otomatis dibuat di calendar Anda.

### Q: Bagaimana cara menghapus reminder dari Google Calendar?

A: Anda dapat menghapus event langsung dari Google Calendar. Menghapus subscription di aplikasi juga akan menghapus semua event terkait (jika fitur ini sudah diimplementasikan).

### Q: Apakah data saya aman?

A: Ya, semua data dienkripsi dan hanya Anda yang dapat mengaksesnya. Kami tidak membagikan data dengan pihak ketiga.

### Q: Bagaimana cara logout?

A: Klik tombol **"Logout"** di menu navigasi.

### Q: Apakah saya bisa menggunakan lebih dari satu akun Google?

A: Setiap akun Google adalah akun terpisah. Jika Anda ingin menggunakan akun lain, logout terlebih dahulu dan login dengan akun yang berbeda.

### Q: Bagaimana cara mengubah currency?

A: Pergi ke halaman profil (klik nama Anda di navbar) dan ubah currency yang diinginkan.

## 🐛 Troubleshooting

### Reminder tidak muncul di Google Calendar

1. Pastikan Anda sudah memberikan izin akses Google Calendar saat login
2. Cek apakah event sudah dibuat di Google Calendar
3. Pastikan subscription masih aktif (belum melewati tanggal berakhir)

### Tidak bisa login

1. Pastikan Anda menggunakan browser yang mendukung cookies
2. Cek koneksi internet
3. Coba clear cache dan cookies browser
4. Pastikan pop-up blocker tidak memblokir halaman OAuth

### Data tidak tersimpan

1. Pastikan koneksi internet stabil
2. Refresh halaman
3. Coba logout dan login kembali

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Cek FAQ di atas
2. Cek dokumentasi teknis di `README.md`
3. Buat issue di repository GitHub (jika open source)

## 🎯 Tips & Best Practices

1. **Gunakan reminder yang tepat**: Pilih **D_1** atau **D_3** untuk reminder yang efektif
2. **Update status pembayaran**: Selalu tandai pembayaran sebagai "Paid" setelah membayar
3. **Review secara berkala**: Cek dashboard secara berkala untuk melihat subscription yang sudah tidak digunakan
4. **Hapus subscription yang tidak aktif**: Hapus subscription yang sudah tidak digunakan untuk menjaga data tetap rapi
5. **Gunakan deskripsi**: Tambahkan deskripsi untuk subscription yang kompleks untuk membantu mengingat detail penting

---

**Last Updated**: December 11, 2024

