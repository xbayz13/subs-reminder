**Ide Aplikasi: Subscription Reminder & Payment Tracker**

### 1. **Tujuan Aplikasi:**

Aplikasi ini dirancang untuk membantu pengguna mengelola langganan mereka secara efisien dengan mengingatkan pembayaran dan memastikan bahwa tagihan langganan dibayar tepat waktu. Fitur utama aplikasi adalah integrasi dengan Google Calendar untuk pengingat, serta pelacakan status pembayaran langganan melalui event yang bisa dikonfirmasi di calendar.

### 2. **Modularisasi Aplikasi:**

**Users Module:**

* **Login dengan Google:** Pengguna hanya dapat login menggunakan Google Account. Fungsinya untuk memanfaatkan data Google Calendar sebagai pengingat pembayaran langganan dan memberikan kemudahan login tanpa harus mengingat password.
* **Data Pengguna:**

  * **Uuid**: Identifikasi unik pengguna.
  * **Name, Email, Avatar, Country, Currency**: Informasi dasar pengguna untuk personalisasi aplikasi.
  * **Birthdate**: Menghitung umur pengguna untuk menyesuaikan dengan zona waktu atau peraturan lokal terkait langganan (misalnya diskon usia).

**Subscriptions Module:**

* **Uuid**: ID unik untuk setiap langganan.
* **Name**: Nama langganan (Netflix, Spotify, dll).
* **Description**: Deskripsi langganan (opsional).
* **Date**: Tanggal pembayaran (bulanan atau tahunan).
* **Price**: Harga langganan yang harus dibayar.
* **Type Enums**: Tipe langganan (bulanan atau tahunan).
* **Reminder_start Enums**: Pilihan pengingat untuk pembayaran langganan (misalnya, D-1 artinya pengingat sehari sebelum pembayaran).
* **Lastday**: Tanggal terakhir langganan (opsional, jika kosong berarti langganan tidak memiliki batas waktu).

**Installments Module:**

* **Uuid**: ID unik untuk tiap pembayaran atau tagihan langganan.
* **Subscriptions_Id**: ID langganan yang terkait.
* **Date**: Tanggal pembayaran aktual.
* **Link**: Tautan ke event Google Calendar untuk konfirmasi pembayaran.
* **Paid**: Status apakah pembayaran telah dilakukan (boolean).

### 3. **Arsitektur Aplikasi (DDD & SOLID Principles)**

**Arsitektur DDD (Domain-Driven Design):**
Aplikasi ini dibangun menggunakan **DDD** yang fokus pada pemisahan domain dan tanggung jawab. Domain utama adalah **Pengelolaan Langganan**, dan semua fungsionalitas dipecah ke dalam subdomain-subdomain spesifik.

* **Domain Models:** Mengelola dan memvalidasi data terkait langganan, pembayaran, dan pengingat.
* **Ubiquitous Language:** Pengguna, Langganan, Pembayaran, Pengingat adalah istilah umum di seluruh kode dan dokumentasi aplikasi.
* **Aggregates:** Model Langganan dan Pembayaran adalah aggregate roots untuk mengelola status dan transaksi langganan.

**Penerapan Prinsip SOLID:**

* **Single Responsibility Principle (SRP):** Setiap kelas di aplikasi hanya memiliki satu tanggung jawab. Misalnya, kelas untuk mengelola langganan hanya akan menangani CRUD langganan, bukan hal lainnya.
* **Open/Closed Principle (OCP):** Kode aplikasi terbuka untuk ekspansi (menambahkan fitur baru) namun tertutup untuk modifikasi. Contohnya, fitur pengingat bisa ditambahkan tanpa memodifikasi fungsi pembayaran yang sudah ada.
* **Liskov Substitution Principle (LSP):** Kelas turunan bisa menggantikan kelas induk tanpa merusak fungsionalitas aplikasi.
* **Interface Segregation Principle (ISP):** Pengguna hanya diberikan interface yang sesuai dengan fungsionalitas yang mereka butuhkan. Misalnya, pengguna hanya melihat dan mengubah langganan mereka melalui dashboard tanpa terganggu dengan fitur lain.
* **Dependency Inversion Principle (DIP):** Komponen yang lebih tinggi (misalnya, pengingat langganan) tidak bergantung pada komponen yang lebih rendah (misalnya, implementasi penyimpanan data). Dependency diatur dengan interface atau abstraksi.

### 4. **Fitur Aplikasi:**

#### **Dashboard:**

Halaman utama yang memberikan gambaran umum tentang status langganan pengguna.

* **Next Payment**: Menampilkan tanggal pembayaran langganan yang akan datang dengan pengingat.
* **Big Payment (Top 5 leaderboard)**: Menampilkan lima langganan termahal berdasarkan harga yang harus dibayar.
* **Report**: Laporan statistik pembayaran, pembayaran yang tertunda, pembayaran yang sudah dilakukan, dan riwayat langganan.

#### **Subscription CRUD:**

* Pengguna dapat membuat, membaca, memperbarui, atau menghapus langganan yang terdaftar di aplikasi.
* Saat membuat langganan baru, pengguna akan diminta untuk memilih frekuensi pembayaran (bulanan/tahunan), harga, dan pengaturan pengingat.

#### **Calendar:**

* Aplikasi mengintegrasikan dengan Google Calendar untuk menampilkan pengingat pembayaran langganan.
* Setiap pembayaran yang harus dilakukan akan dikonversi menjadi event di Google Calendar yang terhubung dengan aplikasi.
* Pengguna dapat mengklik event di kalender untuk mengonfirmasi apakah pembayaran telah dilakukan, dan aplikasi akan memperbarui status pembayaran (Paid/Unpaid).

### 5. **Fungsi Google Calendar:**

* **Integrasi Event**: Setiap langganan yang terdaftar akan membuat event otomatis di Google Calendar, berisi detail seperti nama langganan, harga, tanggal pembayaran, dan link untuk konfirmasi pembayaran.
* **Reminder**: Pengingat langganan akan dikirimkan sesuai pengaturan "Reminder_start" yang dipilih pengguna (misalnya D-1 atau D-3).

### 6. **User Experience (UX):**

* **“Reminder Me” Login**: Fitur ini memungkinkan pengguna untuk tetap login tanpa perlu memasukkan password setiap kali. Cukup dengan login menggunakan akun Google sekali, aplikasi akan mengingatkan mereka tentang pembayaran langganan di setiap waktu yang ditentukan.
* **Notifications**: Selain pengingat kalender, aplikasi bisa memberikan notifikasi untuk pembayaran yang akan datang.
* **Visual Design**: Dashboard yang bersih dan user-friendly, dengan fitur filter untuk memudahkan pengguna dalam melihat pembayaran yang terlewat atau yang akan datang.

### 7. **Teknologi yang Digunakan:**

* **Database**: PostgreSQL untuk penyimpanan data langganan, pembayaran, dan pengguna.
* **Google API**: Menggunakan Google Calendar API untuk membuat event pengingat.
* **Authentication**: OAuth 2.0 untuk autentikasi Google.

### 8. **Keamanan dan Privasi:**

* **OAuth 2.0**: Menggunakan sistem login dari Google untuk menghindari penyimpanan password.
* **Enkripsi Data**: Semua data sensitif seperti harga dan informasi pengguna dienkripsi.
* **Konfirmasi Pembayaran**: Link yang dikirimkan melalui event Google Calendar memastikan bahwa pembayaran dapat dikonfirmasi dan dilacak dengan jelas.

Dengan struktur modular yang terorganisir, penggunaan DDD dan prinsip SOLID, serta integrasi yang cerdas dengan Google Calendar, aplikasi ini akan sangat membantu pengguna dalam mengelola langganan mereka, memastikan pembayaran dilakukan tepat waktu, dan mengurangi risiko keterlambatan pembayaran langganan.
