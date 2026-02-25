---
description: Rangkuman Cara Kerja dan Alur (Workflow) Aplikasi Litra-AI
---

# 🚀 Workflow Aplikasi Litra-AI

Aplikasi Litra-AI adalah *platform* pembelajaran cerdas berbasis AI yang memadukan peran **Guru**, **Siswa**, dan **Sistem AI (DeepSeek)**. Pembelajaran dibagi ke dalam tiga tahap utama dengan pengawasan *fraud/anti-cheat*.

Berikut adalah tahapan dan cara kerja aplikasinya:

## 👨‍🏫 A. Alur Kerja Guru (Teacher Workflow)

1. **Manajemen Akun Siswa**: 
   - Guru atau Admin membuatkan akun siswa secara manual atau massal melalui fitur *Upload Excel*.
2. **Mengelola Materi (Tahap 1)**:
   - Guru mengunggah file materi berformat Dokumen (khususnya **PDF**).
   - File materi ini akan dibaca secara utuh (sebagai Data URL/Base64) sehingga nanti bisa langsung di-*render* (ditampilkan halamannya) di layar siswa.
3. **Pengaturan Asesmen (Tahap 3)**:
   - Guru mengatur batas waktu durasi pengerjaan soal asesmen (misal: 90 menit).
4. **Memberikan Persetujuan (Approval)**:
   - Guru memantau *Dashboard* untuk melihat hasil refleksi siswa dari Tahap 2.
   - AI akan memberikan *Report* analisis kesiapan tiap siswa. Berdasarkan report AI tersebut, Guru menekan tombol **Approve** agar siswa tersebut mendapatkan akses untuk mengerjakan Asesmen Utama (Tahap 3).
5. **Memantau Hasil Akhir**:
   - Guru melihat nilai akhir (Literasi dan Numerasi) dan status kelulusan siswa secara keseluruhan.

---

## 👨‍🎓 B. Alur Belajar Siswa (Student Workflow)

Siswa harus menyelesaikan pembelajaran secara berurutan. Jika tidak lulus, siklus akan mengulang secara otomatis.

### 📚 Tahap 1: Pembelajaran Materi & Interaksi AI
1. **Memilih Materi**: Siswa membuka *Dashboard*, masuk ke *Tahap 1*, lalu memilih materi PDF yang telah diunggah oleh guru melalui menu *Dropdown*.
2. **Membaca Viewer**: Siswa membaca halaman PDF secara langsung di dalam aplikasi (tanpa perlu mengunduh), dilengkapi fitur zoom dan scroll bawaan (native viewer).
3. **Diskusi dengan AI Chatbot (DeepSeek)**:
   - Chatbot akan muncul di pojok layaknya "Asisten Guru".
   - *Syarat AI Pertama*: Chatbot akan memaksa konfirmasi penerapan "7 Kebiasaan Hebat Anak Indonesia" (contoh: Gemar Belajar/Beribadah) sebelum melayani diskusi materi.
   - *Syarat AI Kedua*: Chatbot akan memandu secara detail jika ditanya materi, tetapi tidak akan memberikan jawaban instan atas pr yang diajukan. Jika siswa terlihat kebingungan, Chatbot akan merespons dengan bertanya kembali *"Bagian spesifik mana yang belum dipahami?"*.
4. **Penyelesaian**: Siswa menekan "Selesai Belajar" jika sudah paham, lanjut ke Tahap 2.

### 📝 Tahap 2: Latihan Refleksi Esai
1. **AI Generate Soal**: Sistem AI secara cerdas menganalisis **Riwayat Chat** siswa dari Tahap 1.
2. Berdasarkan obrolan tersebut, AI akan membuat **5 pertanyaan Refleksi bentuk Esai** yang sangat spesifik khusus untuk siswa bersangkutan.
3. **Submit Refleksi**: Siswa mengetik (tidak bisa dicontek/copy-paste) jawabannya.
4. **AI Analysis Readiness**: Saat jawaban dikirim, AI langsung menganalisis bobot jawaban siswa dan menentukan apakah siswa ini "SIAP" (Rekomendasi) atau "PERLU BIMBINGAN" (Belum siap). Output rekomendasi AI ini terkirim kepada Guru.
5. **Generator Soal Tahap 3**: Secara latar belakang (background process), jawaban refleksi dari siswa tersebut dijadikan landasan oleh AI untuk merakit 50 soal pilihan ganda spesifik bagi siswa ini nantinya di Tahap 3.
6. Siswa **Tertahan dan Menunggu** verifikasi setuju (Approve) secara manual dari Guru.

### 🎯 Tahap 3: Asesmen Utama (Mode Ujian Ujian ANBK)
1. Setelah Guru menekan tombol *Approve*, gembok modul Tahap 3 siswa terbuka.
2. Siswa akan disuguhkan **50 Soal (Literasi & Numerasi)** hasil buah karya dan *generate* dari AI pada akhir Tahap 2 tadi.
3. **Aturan Ujian & Anti-Cheat (Tab Violation)**:
   - Terdapat **Timer / Waktu Hitung Mundur** yang telah diatur oleh Guru.
   - Sistem **Anti-Cheat Deteksi Layar**: Jika siswa kedapatan berpindah tab browser/membuka google (*Alt-Tab*), peringatan bahaya akan menyala otomatis.
   - Segala isian jawaban akan hangus (ke-*reset*) jika tab violation ini dilanggar, hal ini memaksa integritas siswa.
4. **Hasil Akhir (Kelulusan)**:
   - Ketika siswa men-Submit atau Timer habis, sistem langsung memberikan rincian nilai KKM.
   - **LULUS (>= 70%)**: Proses belajar semester ini dinilai tuntas dengan skor detail numerasi dan literasinya.
   - **TIDAK LULUS (< 70%)**: Progress siswa dihancurkan kembali menjadi **Nol**, persetujuan guru dicabut, dan siswa **wajib MENGULANG pembelajaran dari Tahap 1**, berdiskusi ulang dengan materi guru dari awal, sebelum siklus ini ditempuh kembali.

---

## 🤖 C. Teknologi AI (Workflow API Integration)
1. Back-End aplikasi **Node.js** berfungsi sebagai penghubung (connector endpoint) API POST ke **OpenRouter**.
2. Berkomunikasi dalam payload standar format (role: *`system`, `user`, `assistant`*) kepada model pintar utama **`deepseek/deepseek-chat`**.
3. Diaktifkan secara *Serverless*, baik di dalam infrastruktur **Railway** (ataupun *Vercel*) dengan pembatasan model pengeluaran Token API per balasan (suhu intervensi 0.7 dan maksimal 1024 tokens) yang aman dan berorientasi edukasi pendamping.
