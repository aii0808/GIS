# 🌐 Portal Praktikum Sistem Informasi Geografis (SIG)

Aplikasi manajemen penilaian dan pemantauan praktikum Sistem Informasi Geografis (SIG) berbasis Web modern, responsif, dan terintegrasi dengan database cloud **Supabase**.

---

## 🚀 Fitur Unggulan

1. **Autentikasi Aman & Manajemen User (Dosen & Asisten)**:
   - Tidak membocorkan username/password di form login.
   - Manajemen akun: Admin, Dosen Pengampu, dan Asisten Lab.
   - Sinkronisasi instan ke cloud Supabase (`sig_users`).

2. **Dukungan Data Real & Tanpa Dummy**:
   - Sistem bersih tanpa data dummy bawaan.
   - Data mahasiswa (`sig_students`), pertemuan praktikum P1–P16 (`sig_meetings`), dan nilai 4 kriteria (`sig_scores`) disimpan dinamis.

3. **Audio Modern (Web Audio API)**:
   - Sintesis audio modern tanpa file audio eksternal (Micro-ticks, Pop, Harmonic Chime, Alert, Error, Cloud Sync).

4. **Visual Premium & Ikon 3D**:
   - Ikon 3D Microsoft Fluent Emoji via CDN online.
   - Tampilan responsif untuk desktop dan layar smartphone.

5. **Cloud Synchronization & Offline Fallback**:
   - Penyimpanan lokal (LocalStorage) dengan sinkronisasi otomatis dua arah ke Supabase Cloud.

---

## 🛠️ Langkah Wajib: Mengaktifkan Tabel di Supabase

Supabase menggunakan PostgreSQL sehingga tabel harus dibuat terlebih dahulu menggunakan SQL Editor.

1. Buka dashboard Supabase proyek Anda:
   👉 **[Supabase SQL Editor](https://supabase.com/dashboard/project/iqxwmjihohiypethbmqe/sql)**
2. Buka file [`supabase_schema.sql`](./supabase_schema.sql) di aplikasi ini, lalu **Salin / Copy seluruh isinya**.
3. Tempel (**Paste**) kode SQL tersebut ke SQL Editor Supabase.
4. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. Selesai! Keempat tabel (`sig_students`, `sig_meetings`, `sig_scores`, `sig_users`) langsung aktif dan data mahasiswa yang Anda masukkan akan langsung tersimpan di database cloud Supabase.

---

## 📱 Cara Menjalankan di Handphone

### Opsi 1: Online Permanen lewat GitHub & Vercel (Rekomendasi Terbaik)
Agar dosen dan asisten bisa membuka aplikasi dari mana saja tanpa menyalakan laptop:
1. Inisialisasi Git dan simpan perubahan:
   ```bash
   git init
   git add .
   git commit -m "feat: portal praktikum sig cloud"
   ```
2. Buat repository baru di [GitHub](https://github.com/new).
3. Hubungkan dan upload:
   ```bash
   git remote add origin https://github.com/<username-anda>/<nama-repo>.git
   git branch -M main
   git push -u origin main
   ```
4. Buka [Vercel.com](https://vercel.com) -> **Add New Project** -> Pilih repository GitHub Anda.
5. Masukkan Environment Variable (opsional, sudah ada fallback otomatis):
   - `VITE_SUPABASE_URL` = `https://iqxwmjihohiypethbmqe.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_FvqvIwB8eXUudnDIvIzJEg__tb8fu2T`
6. Klik **Deploy**! Anda akan mendapatkan link HTTPS (misal: `https://portal-sig.vercel.app`) yang bisa langsung dibuka di HP dosen kapan saja.

---

### Opsi 2: Menggunakan Wi-Fi Lokal (Saat Pengembangan)
Jika laptop dan HP terhubung ke Wi-Fi / Hotspot yang sama:
1. Pastikan server dev aktif (`npm run dev`).
2. Buka browser di HP Anda dan masukkan alamat Network IP:
   👉 `http://192.168.43.128:5173`
3. Aplikasi akan langsung tampil di HP dengan tampilan mobile responsif.
