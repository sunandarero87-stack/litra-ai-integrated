// ============================================
// DATA - Soal Latihan & Soal Asesmen
// ============================================

// 20 Soal Latihan (Tahap 2) - Analisis Data & Microsoft Excel
const PRACTICE_QUESTIONS = [
    {
        id: 1,
        question: "Apa yang dimaksud dengan analisis data?",
        options: [
            "Proses mengumpulkan data saja",
            "Proses memeriksa, membersihkan, dan memodelkan data untuk menemukan informasi yang berguna",
            "Proses menghapus semua data",
            "Proses mencetak data ke kertas"
        ],
        correct: 1
    },
    {
        id: 2,
        question: "Manakah yang BUKAN merupakan kegunaan analisis data dalam kehidupan sehari-hari?",
        options: [
            "Mengetahui tren penjualan di toko",
            "Membantu pengambilan keputusan",
            "Menghapus semua informasi penting",
            "Memahami pola cuaca"
        ],
        correct: 2
    },
    {
        id: 3,
        question: "Microsoft Excel adalah aplikasi yang termasuk dalam kategori...",
        options: [
            "Pengolah kata",
            "Pengolah angka (spreadsheet)",
            "Pengolah gambar",
            "Pengolah video"
        ],
        correct: 1
    },
    {
        id: 4,
        question: "Rumus Excel yang digunakan untuk menjumlahkan data adalah...",
        options: [
            "=AVERAGE()",
            "=MAX()",
            "=SUM()",
            "=MIN()"
        ],
        correct: 2
    },
    {
        id: 5,
        question: "Fungsi =AVERAGE(A1:A10) digunakan untuk...",
        options: [
            "Mencari nilai terbesar dari A1 sampai A10",
            "Menjumlahkan nilai A1 sampai A10",
            "Menghitung rata-rata nilai A1 sampai A10",
            "Menghitung jumlah sel yang berisi data"
        ],
        correct: 2
    },
    {
        id: 6,
        question: "Fungsi =MAX(B1:B20) akan menghasilkan...",
        options: [
            "Nilai terkecil dari range B1 sampai B20",
            "Nilai rata-rata dari range B1 sampai B20",
            "Jumlah seluruh nilai B1 sampai B20",
            "Nilai terbesar dari range B1 sampai B20"
        ],
        correct: 3
    },
    {
        id: 7,
        question: "Untuk mencari nilai terendah dari sekumpulan data, rumus yang digunakan adalah...",
        options: [
            "=SUM()",
            "=MIN()",
            "=MAX()",
            "=COUNT()"
        ],
        correct: 1
    },
    {
        id: 8,
        question: "Apa fungsi dari rumus =IF() di Excel?",
        options: [
            "Mengurutkan data secara otomatis",
            "Membuat keputusan berdasarkan kondisi tertentu",
            "Menghitung total data",
            "Membuat grafik otomatis"
        ],
        correct: 1
    },
    {
        id: 9,
        question: "Contoh penulisan rumus IF yang benar adalah...",
        options: [
            '=IF(A1>70,"Lulus","Tidak Lulus")',
            '=IF A1>70 "Lulus" "Tidak Lulus"',
            '=IF(A1>70;Lulus;Tidak Lulus)',
            '=IF[A1>70,"Lulus","Tidak Lulus"]'
        ],
        correct: 0
    },
    {
        id: 10,
        question: "Dalam Excel, sel (cell) adalah...",
        options: [
            "Kumpulan beberapa lembar kerja",
            "Pertemuan antara baris dan kolom",
            "Nama file Excel",
            "Menu utama Excel"
        ],
        correct: 1
    },
    {
        id: 11,
        question: "Fitur Excel yang digunakan untuk membuat grafik/diagram adalah...",
        options: [
            "Mail Merge",
            "Chart/Grafik",
            "Spell Check",
            "Print Preview"
        ],
        correct: 1
    },
    {
        id: 12,
        question: "Fitur Sort & Filter pada Excel berguna untuk...",
        options: [
            "Menghapus data yang salah",
            "Mengurutkan dan menyaring data sesuai kriteria",
            "Mengubah warna teks",
            "Menambahkan gambar"
        ],
        correct: 1
    },
    {
        id: 13,
        question: "Apa itu range dalam Excel?",
        options: [
            "Satu sel tunggal",
            "Kumpulan sel yang berdekatan",
            "Nama lembar kerja",
            "Jenis grafik"
        ],
        correct: 1
    },
    {
        id: 14,
        question: "Langkah pertama dalam analisis data adalah...",
        options: [
            "Membuat kesimpulan",
            "Mengumpulkan data",
            "Mempresentasikan hasil",
            "Menghapus data lama"
        ],
        correct: 1
    },
    {
        id: 15,
        question: "Jenis grafik yang paling cocok untuk menunjukkan perbandingan data adalah...",
        options: [
            "Grafik garis (Line Chart)",
            "Grafik batang (Bar Chart)",
            "Grafik lingkaran (Pie Chart)",
            "Grafik area"
        ],
        correct: 1
    },
    {
        id: 16,
        question: "=COUNTIF(A1:A20,\">70\") akan menghitung...",
        options: [
            "Jumlah total nilai di atas 70",
            "Rata-rata nilai di atas 70",
            "Banyaknya sel yang nilainya lebih dari 70",
            "Nilai terbesar yang lebih dari 70"
        ],
        correct: 2
    },
    {
        id: 17,
        question: "Data kuantitatif adalah data yang...",
        options: [
            "Berupa kata-kata atau deskripsi",
            "Berupa angka dan dapat dihitung",
            "Hanya berupa gambar",
            "Tidak bisa dianalisis"
        ],
        correct: 1
    },
    {
        id: 18,
        question: "Pivot Table pada Excel berfungsi untuk...",
        options: [
            "Menulis surat",
            "Merangkum, menganalisis, dan menyajikan data dalam tabel ringkasan",
            "Mengedit foto",
            "Membuat animasi"
        ],
        correct: 1
    },
    {
        id: 19,
        question: "Conditional Formatting digunakan untuk...",
        options: [
            "Menghapus sel kosong",
            "Memberikan format otomatis berdasarkan kondisi nilai tertentu",
            "Menambahkan kolom baru",
            "Mengunci lembar kerja"
        ],
        correct: 1
    },
    {
        id: 20,
        question: "Manfaat visualisasi data menggunakan grafik adalah...",
        options: [
            "Membuat data lebih sulit dipahami",
            "Menampilkan data mentah saja",
            "Memudahkan pemahaman pola dan tren data",
            "Menghapus data yang tidak penting"
        ],
        correct: 2
    }
];

// 50 Soal Asesmen (Tahap 3) - Format ANBK (Literasi + Numerasi)
const ASSESSMENT_QUESTIONS = [
    // ===== LITERASI (25 soal) =====
    {
        id: 1, type: "literasi",
        question: "Bacalah paragraf berikut:\n\"Analisis data adalah proses memeriksa, membersihkan, mengubah, dan memodelkan data untuk menemukan informasi yang berguna, mendukung pengambilan keputusan, dan menyimpulkan hasil.\"\n\nBerdasarkan teks di atas, tujuan utama analisis data adalah...",
        options: [
            "Menghapus semua data yang ada",
            "Menemukan informasi berguna dan mendukung pengambilan keputusan",
            "Menyimpan data tanpa diolah",
            "Mengubah data menjadi gambar"
        ],
        correct: 1
    },
    {
        id: 2, type: "literasi",
        question: "Perhatikan informasi berikut:\n\"Sebuah toko mencatat penjualan selama satu minggu. Dengan menggunakan analisis data, pemilik toko dapat mengetahui hari apa penjualan tertinggi terjadi.\"\n\nKesimpulan yang tepat dari informasi tersebut adalah...",
        options: [
            "Analisis data tidak berguna untuk bisnis",
            "Analisis data hanya digunakan di sekolah",
            "Analisis data membantu pemilik toko memahami pola penjualan",
            "Penjualan selalu sama setiap hari"
        ],
        correct: 2
    },
    {
        id: 3, type: "literasi",
        question: "\"Microsoft Excel merupakan perangkat lunak pengolah angka yang dikembangkan oleh Microsoft. Excel menyediakan berbagai fitur untuk mengolah data seperti rumus, grafik, dan tabel pivot.\"\n\nInformasi utama dari teks di atas adalah...",
        options: [
            "Excel hanya bisa membuat grafik",
            "Excel adalah perangkat lunak pengolah angka dengan berbagai fitur pengolahan data",
            "Excel dikembangkan oleh Google",
            "Excel tidak memiliki fitur rumus"
        ],
        correct: 1
    },
    {
        id: 4, type: "literasi",
        question: "Perhatikan langkah-langkah berikut:\n1. Mengumpulkan data\n2. Membersihkan data\n3. Menganalisis data\n4. Menyajikan hasil\n\nUrutan langkah di atas merupakan...",
        options: [
            "Langkah membuat presentasi",
            "Tahapan dalam proses analisis data",
            "Cara menghapus file",
            "Langkah menginstal software"
        ],
        correct: 1
    },
    {
        id: 5, type: "literasi",
        question: "\"Seorang guru mencatat nilai ulangan 30 siswa dalam tabel Excel. Guru tersebut menggunakan fungsi AVERAGE untuk mengetahui rata-rata kelas, dan fungsi IF untuk menentukan status kelulusan setiap siswa.\"\n\nFungsi IF dalam konteks ini digunakan untuk...",
        options: [
            "Menghitung rata-rata nilai",
            "Menentukan apakah siswa lulus atau tidak berdasarkan nilai",
            "Mengurutkan nama siswa",
            "Membuat grafik nilai"
        ],
        correct: 1
    },
    {
        id: 6, type: "literasi",
        question: "Bacalah teks berikut:\n\"Data kuantitatif adalah data yang dapat dinyatakan dalam bentuk angka. Contohnya adalah tinggi badan, berat badan, dan nilai ujian. Sementara data kualitatif adalah data yang bersifat deskriptif seperti warna, jenis kelamin, dan pendapat.\"\n\nManakah yang termasuk data kuantitatif?",
        options: [
            "Warna favorit siswa",
            "Pendapat tentang sekolah",
            "Nilai ujian matematika",
            "Jenis kelamin siswa"
        ],
        correct: 2
    },
    {
        id: 7, type: "literasi",
        question: "\"Grafik batang sangat efektif untuk membandingkan nilai antar kategori. Misalnya, membandingkan jumlah siswa di setiap kelas atau membandingkan penjualan bulanan.\"\n\nGrafik batang paling tepat digunakan ketika kita ingin...",
        options: [
            "Menunjukkan persentase dari keseluruhan",
            "Membandingkan data antar kategori yang berbeda",
            "Menampilkan data dalam bentuk teks",
            "Menghapus data yang tidak valid"
        ],
        correct: 1
    },
    {
        id: 8, type: "literasi",
        question: "Perhatikan dialog berikut:\nGuru: \"Coba kamu buat rumus untuk menjumlahkan nilai dari sel A1 sampai A10.\"\nSiswa: \"Baik, Pak. Saya ketik =SUM(A1:A10)\"\n\nApakah jawaban siswa tersebut sudah benar?",
        options: [
            "Salah, karena seharusnya menggunakan AVERAGE",
            "Benar, rumus SUM digunakan untuk menjumlahkan",
            "Salah, karena titik dua (:) tidak boleh digunakan",
            "Salah, karena harus menggunakan tanda plus (+)"
        ],
        correct: 1
    },
    {
        id: 9, type: "literasi",
        question: "\"Spreadsheet terdiri dari kolom (ditandai huruf A, B, C, dst) dan baris (ditandai angka 1, 2, 3, dst). Pertemuan kolom dan baris disebut sel.\"\n\nBerdasarkan teks, sel B3 berarti...",
        options: [
            "Baris B kolom 3",
            "Kolom B baris 3",
            "Sel pertama di lembar kerja",
            "Nama file spreadsheet"
        ],
        correct: 1
    },
    {
        id: 10, type: "literasi",
        question: "\"Pak Nandar memberikan tugas kepada siswa kelas 7 untuk menganalisis data suhu harian selama satu bulan. Siswa diminta menggunakan Excel untuk mencari suhu rata-rata, suhu tertinggi, dan suhu terendah.\"\n\nRumus Excel yang dibutuhkan siswa untuk menyelesaikan tugas ini adalah...",
        options: [
            "SUM, COUNT, dan IF",
            "AVERAGE, MAX, dan MIN",
            "VLOOKUP, HLOOKUP, dan INDEX",
            "LEFT, RIGHT, dan MID"
        ],
        correct: 1
    },
    {
        id: 11, type: "literasi",
        question: "Bacalah informasi berikut:\n\"Conditional Formatting adalah fitur Excel yang memungkinkan pengguna memberikan format (warna, ikon) secara otomatis berdasarkan nilai dalam sel.\"\n\nContoh penggunaan Conditional Formatting yang tepat adalah...",
        options: [
            "Membuat sel yang nilainya di bawah 70 berwarna merah secara otomatis",
            "Menghapus semua data di bawah 70",
            "Mencetak semua data ke printer",
            "Menyimpan file dalam format PDF"
        ],
        correct: 0
    },
    {
        id: 12, type: "literasi",
        question: "\"Dalam era digital, kemampuan menganalisis data menjadi keterampilan yang sangat penting. Data ada di mana-mana — dari media sosial, hasil ujian, hingga data cuaca.\"\n\nPernyataan yang sesuai dengan teks di atas adalah...",
        options: [
            "Analisis data hanya penting untuk ilmuwan",
            "Data hanya ditemukan di laboratorium",
            "Kemampuan analisis data penting karena data ada di berbagai aspek kehidupan",
            "Analisis data tidak relevan di era digital"
        ],
        correct: 2
    },
    {
        id: 13, type: "literasi",
        question: "\"Sort dalam Excel berfungsi untuk mengurutkan data, bisa dari yang terkecil ke terbesar (ascending) atau sebaliknya (descending). Filter berfungsi untuk menampilkan data tertentu saja berdasarkan kriteria.\"\n\nJika guru ingin hanya menampilkan siswa yang nilainya di atas 80, fitur yang digunakan adalah...",
        options: [
            "Sort Ascending",
            "Sort Descending",
            "Filter",
            "Find & Replace"
        ],
        correct: 2
    },
    {
        id: 14, type: "literasi",
        question: "Perhatikan informasi:\n\"Tabel pivot membantu merangkum data dalam jumlah besar menjadi lebih ringkas dan mudah dipahami.\"\n\nManfaat utama tabel pivot adalah...",
        options: [
            "Menghapus data duplikat",
            "Merangkum data besar menjadi informasi yang mudah dipahami",
            "Mengubah format file",
            "Menambahkan password pada file"
        ],
        correct: 1
    },
    {
        id: 15, type: "literasi",
        question: "\"Grafik lingkaran (pie chart) cocok digunakan untuk menunjukkan proporsi atau persentase dari keseluruhan data. Misalnya, persentase siswa yang menyukai setiap jenis olahraga.\"\n\nGrafik lingkaran TIDAK cocok digunakan untuk...",
        options: [
            "Menunjukkan persentase komposisi pengeluaran",
            "Membandingkan proporsi jenis kelamin dalam kelas",
            "Menunjukkan tren perubahan nilai dari waktu ke waktu",
            "Menampilkan distribusi nilai siswa per kategori"
        ],
        correct: 2
    },
    {
        id: 16, type: "literasi",
        question: "\"Sebelum menganalisis data, penting untuk memastikan data bersih dan akurat. Data yang kotor (dirty data) dapat menghasilkan kesimpulan yang salah.\"\n\nApa yang dimaksud dengan 'data kotor'?",
        options: [
            "Data yang ditulis dengan tangan",
            "Data yang mengandung kesalahan, duplikasi, atau ketidakkonsistenan",
            "Data yang disimpan di komputer",
            "Data yang berjumlah sedikit"
        ],
        correct: 1
    },
    {
        id: 17, type: "literasi",
        question: "\"Seorang siswa diminta membuat laporan analisis data penjualan kantin sekolah. Ia menggunakan Excel untuk menghitung total penjualan setiap jenis makanan dan membuat grafik perbandingan.\"\n\nTahap terakhir yang harus dilakukan siswa adalah...",
        options: [
            "Mengumpulkan data penjualan",
            "Membersihkan data",
            "Menyajikan hasil analisis dan membuat kesimpulan",
            "Memasukkan data ke Excel"
        ],
        correct: 2
    },
    {
        id: 18, type: "literasi",
        question: "\"Operator aritmatika dasar di Excel: + (penjumlahan), - (pengurangan), * (perkalian), / (pembagian)\"\n\nJika di sel A1 tertulis =10+5*2, hasil yang akan muncul adalah...",
        options: [
            "30",
            "20",
            "25",
            "15"
        ],
        correct: 1
    },
    {
        id: 19, type: "literasi",
        question: "\"Freeze Panes adalah fitur Excel yang memungkinkan pengguna mengunci baris atau kolom tertentu agar tetap terlihat saat menggulir (scroll) ke bawah atau ke samping.\"\n\nFreeze Panes berguna ketika...",
        options: [
            "Data hanya memiliki satu baris",
            "Kita bekerja dengan data yang sangat banyak dan perlu melihat header saat scrolling",
            "Kita ingin menghapus baris tertentu",
            "Kita ingin mencetak data"
        ],
        correct: 1
    },
    {
        id: 20, type: "literasi",
        question: "\"Dalam Kurikulum Merdeka Fase D, siswa diharapkan mampu mengolah dan menganalisis data menggunakan perangkat lunak spreadsheet untuk menyelesaikan permasalahan dalam kehidupan sehari-hari.\"\n\nTujuan pembelajaran analisis data dalam Kurikulum Merdeka Fase D adalah...",
        options: [
            "Hanya menghafal rumus Excel",
            "Mampu menyelesaikan permasalahan sehari-hari melalui pengolahan dan analisis data",
            "Belajar pemrograman komputer tingkat lanjut",
            "Mendesain website profesional"
        ],
        correct: 1
    },
    {
        id: 21, type: "literasi",
        question: "Seorang siswa menemukan bahwa dari 40 siswa di kelasnya, 25 siswa menyukai pelajaran Informatika. Ia ingin menyajikan data ini dalam bentuk visual.\n\nJenis visualisasi yang paling tepat adalah...",
        options: [
            "Tabel saja tanpa grafik",
            "Grafik lingkaran untuk menunjukkan proporsi",
            "Grafik garis untuk menunjukkan tren",
            "Peta lokasi"
        ],
        correct: 1
    },
    {
        id: 22, type: "literasi",
        question: "\"Validasi data (Data Validation) adalah fitur di Excel yang membatasi jenis data yang dapat dimasukkan ke dalam sel.\"\n\nContoh penggunaan validasi data adalah...",
        options: [
            "Membatasi input nilai hanya angka 0-100 pada kolom nilai ujian",
            "Menghapus semua data di kolom",
            "Mengubah font teks",
            "Menyimpan file Excel"
        ],
        correct: 0
    },
    {
        id: 23, type: "literasi",
        question: "Perhatikan kalimat:\n\"Rata-rata nilai ulangan kelas 7A adalah 78,5. Nilai tertinggi 95 dan nilai terendah 45.\"\n\nKesimpulan yang tepat dari data tersebut adalah...",
        options: [
            "Semua siswa mendapat nilai di atas 70",
            "Terdapat rentang nilai yang cukup besar (50 poin) antara nilai tertinggi dan terendah",
            "Rata-rata kelas sangat rendah",
            "Tidak ada siswa yang mendapat nilai sempurna"
        ],
        correct: 1
    },
    {
        id: 24, type: "literasi",
        question: "\"Absolute reference ($A$1) digunakan ketika kita tidak ingin referensi sel berubah saat rumus disalin ke sel lain. Sedangkan relative reference (A1) akan berubah secara otomatis.\"\n\nKapan sebaiknya menggunakan absolute reference?",
        options: [
            "Ketika kita hanya punya satu data",
            "Ketika sel yang dirujuk harus tetap sama meskipun rumus disalin",
            "Ketika kita ingin menghapus data",
            "Ketika membuat grafik"
        ],
        correct: 1
    },
    {
        id: 25, type: "literasi",
        question: "\"Dalam analisis data, outlier adalah nilai data yang jauh berbeda dari nilai data lainnya. Outlier dapat mempengaruhi hasil analisis seperti rata-rata.\"\n\nBagaimana outlier mempengaruhi nilai rata-rata?",
        options: [
            "Outlier tidak mempengaruhi rata-rata sama sekali",
            "Outlier membuat rata-rata menjadi lebih akurat",
            "Outlier dapat membuat rata-rata menjadi terlalu tinggi atau terlalu rendah",
            "Outlier hanya mempengaruhi nilai median"
        ],
        correct: 2
    },

    // ===== NUMERASI (25 soal) =====
    {
        id: 26, type: "numerasi",
        question: "Perhatikan data nilai berikut: 80, 75, 90, 85, 70\n\nBerapakah rata-rata dari data tersebut?",
        options: [
            "78",
            "80",
            "82",
            "75"
        ],
        correct: 1
    },
    {
        id: 27, type: "numerasi",
        question: "Data tinggi badan (cm): 150, 155, 160, 145, 170, 165, 155, 148\n\nSelisih antara nilai tertinggi dan terendah (range) dari data tersebut adalah...",
        options: [
            "20 cm",
            "15 cm",
            "25 cm",
            "30 cm"
        ],
        correct: 2
    },
    {
        id: 28, type: "numerasi",
        question: "Seorang guru memiliki data nilai 5 siswa: 60, 70, 80, 90, 100\nJika menggunakan rumus =SUM(A1:A5), hasilnya adalah...",
        options: [
            "400",
            "80",
            "500",
            "100"
        ],
        correct: 0
    },
    {
        id: 29, type: "numerasi",
        question: "Di Excel, sel A1 berisi 10, A2 berisi 20, dan A3 berisi 30.\nRumus =AVERAGE(A1:A3) akan menghasilkan...",
        options: [
            "60",
            "30",
            "20",
            "10"
        ],
        correct: 2
    },
    {
        id: 30, type: "numerasi",
        question: "Dari data: 45, 67, 89, 34, 56, 78, 91, 23\nNilai =MAX() dari data tersebut adalah...",
        options: [
            "89",
            "91",
            "78",
            "23"
        ],
        correct: 1
    },
    {
        id: 31, type: "numerasi",
        question: "Nilai ujian 10 siswa: 75, 80, 65, 90, 70, 85, 60, 95, 75, 80\nBerapa banyak siswa yang nilainya di atas 75?",
        options: [
            "4 siswa",
            "5 siswa",
            "6 siswa",
            "3 siswa"
        ],
        correct: 0
    },
    {
        id: 32, type: "numerasi",
        question: "Jika rumus =IF(B1>=70,\"Lulus\",\"Tidak Lulus\") dan B1 berisi 65, maka hasilnya adalah...",
        options: [
            "Lulus",
            "Tidak Lulus",
            "65",
            "Error"
        ],
        correct: 1
    },
    {
        id: 33, type: "numerasi",
        question: "Penjualan harian sebuah toko selama 5 hari: Rp150.000, Rp200.000, Rp175.000, Rp225.000, Rp250.000\nTotal penjualan selama 5 hari adalah...",
        options: [
            "Rp900.000",
            "Rp1.000.000",
            "Rp950.000",
            "Rp850.000"
        ],
        correct: 1
    },
    {
        id: 34, type: "numerasi",
        question: "Diagram lingkaran menunjukkan 40% siswa menyukai Matematika. Jika total siswa 50 orang, berapa siswa yang menyukai Matematika?",
        options: [
            "15 siswa",
            "25 siswa",
            "20 siswa",
            "30 siswa"
        ],
        correct: 2
    },
    {
        id: 35, type: "numerasi",
        question: "Data suhu harian (°C): 28, 30, 32, 29, 31, 27, 33\nBerapa rata-rata suhu harian?",
        options: [
            "29°C",
            "30°C",
            "31°C",
            "32°C"
        ],
        correct: 1
    },
    {
        id: 36, type: "numerasi",
        question: "Seorang siswa mendapat nilai: Tugas 80, UTS 75, UAS 85\nJika bobot: Tugas 30%, UTS 30%, UAS 40%, berapa nilai akhirnya?",
        options: [
            "80,5",
            "79,0",
            "80,0",
            "80,5"
        ],
        correct: 0
    },
    {
        id: 37, type: "numerasi",
        question: "Data penjualan buku selama 4 minggu: 120, 150, 130, 200\nPersentase kenaikan dari minggu ke-3 ke minggu ke-4 adalah...",
        options: [
            "Sekitar 54%",
            "Sekitar 35%",
            "Sekitar 70%",
            "Sekitar 45%"
        ],
        correct: 0
    },
    {
        id: 38, type: "numerasi",
        question: "Di kelas 7B terdapat 36 siswa. Hasil ujian Informatika:\n- Nilai A: 8 siswa\n- Nilai B: 12 siswa  \n- Nilai C: 10 siswa\n- Nilai D: 6 siswa\n\nPersentase siswa yang mendapat nilai A adalah...",
        options: [
            "Sekitar 22%",
            "Sekitar 25%",
            "Sekitar 20%",
            "Sekitar 18%"
        ],
        correct: 0
    },
    {
        id: 39, type: "numerasi",
        question: "Rumus =COUNTIF(A1:A20,\">80\") menghasilkan 7.\nArtinya...",
        options: [
            "Total nilai yang lebih dari 80 adalah 7",
            "Ada 7 sel yang berisi nilai di atas 80",
            "Rata-rata nilai adalah 7",
            "Nilai tertinggi ada di baris ke-7"
        ],
        correct: 1
    },
    {
        id: 40, type: "numerasi",
        question: "Di sel C1 terdapat rumus =(A1+B1)/2. Jika A1=80 dan B1=90, maka C1 berisi...",
        options: [
            "170",
            "85",
            "45",
            "80"
        ],
        correct: 1
    },
    {
        id: 41, type: "numerasi",
        question: "Sebuah survei menunjukkan bahwa dari 200 siswa:\n- 60 siswa suka membaca buku\n- 80 siswa suka bermain game\n- 40 siswa suka olahraga\n- 20 siswa suka menggambar\n\nBerapa persen siswa yang suka olahraga?",
        options: [
            "25%",
            "30%",
            "20%",
            "15%"
        ],
        correct: 2
    },
    {
        id: 42, type: "numerasi",
        question: "Data jumlah pengunjung perpustakaan per hari:\nSenin: 45, Selasa: 38, Rabu: 52, Kamis: 41, Jumat: 34\n\nHari dengan pengunjung paling sedikit adalah...",
        options: [
            "Selasa",
            "Kamis",
            "Jumat",
            "Senin"
        ],
        correct: 2
    },
    {
        id: 43, type: "numerasi",
        question: "Jika di Excel kita menulis =5+3*2-1, hasilnya adalah...",
        options: [
            "15",
            "10",
            "12",
            "16"
        ],
        correct: 1
    },
    {
        id: 44, type: "numerasi",
        question: "Data pengeluaran bulanan (ribuan rupiah): 500, 450, 600, 550, 700, 650\nBerapa total pengeluaran selama 6 bulan?",
        options: [
            "Rp3.250.000",
            "Rp3.450.000",
            "Rp3.500.000",
            "Rp3.350.000"
        ],
        correct: 1
    },
    {
        id: 45, type: "numerasi",
        question: "Grafik garis menunjukkan nilai ujian siswa dari bulan Januari sampai Juni:\nJan: 65, Feb: 70, Mar: 68, Apr: 75, Mei: 80, Jun: 85\n\nTren yang terlihat dari data tersebut adalah...",
        options: [
            "Nilai cenderung menurun",
            "Nilai tetap stabil",
            "Nilai cenderung naik",
            "Tidak ada pola yang jelas"
        ],
        correct: 2
    },
    {
        id: 46, type: "numerasi",
        question: "Sebuah tabel di Excel memiliki data di kolom A baris 1-100.\nRumus =COUNT(A1:A100) menghasilkan 95.\nArtinya...",
        options: [
            "Total semua nilai adalah 95",
            "Ada 95 sel yang berisi data angka",
            "Rata-rata nilai adalah 95",
            "Nilai tertinggi adalah 95"
        ],
        correct: 1
    },
    {
        id: 47, type: "numerasi",
        question: "Nilai ulangan 8 siswa: 78, 82, 75, 90, 88, 72, 85, 80\nMedian dari data tersebut (setelah diurutkan) adalah...",
        options: [
            "80",
            "81",
            "82",
            "79"
        ],
        correct: 1
    },
    {
        id: 48, type: "numerasi",
        question: "Sebuah kelas memiliki 40 siswa. Setelah ujian:\n- 28 siswa lulus (nilai ≥ 70)\n- 12 siswa tidak lulus\n\nPersentase kelulusan kelas tersebut adalah...",
        options: [
            "60%",
            "65%",
            "70%",
            "75%"
        ],
        correct: 2
    },
    {
        id: 49, type: "numerasi",
        question: "Jika =SUMIF(B1:B10,\">50\",C1:C10) menghasilkan 450, artinya...",
        options: [
            "Ada 450 data yang lebih dari 50",
            "Total nilai di kolom C untuk baris yang memiliki nilai >50 di kolom B adalah 450",
            "Rata-rata nilai yang lebih dari 50 adalah 450",
            "Jumlah sel yang lebih dari 50 adalah 450"
        ],
        correct: 1
    },
    {
        id: 50, type: "numerasi",
        question: "Sebuah toko mencatat penjualan 4 produk:\n- Produk A: 150 unit, harga Rp5.000\n- Produk B: 200 unit, harga Rp3.000\n- Produk C: 100 unit, harga Rp8.000\n- Produk D: 75 unit, harga Rp10.000\n\nProduk mana yang menghasilkan pendapatan terbesar?",
        options: [
            "Produk A (Rp750.000)",
            "Produk B (Rp600.000)",
            "Produk C (Rp800.000)",
            "Produk D (Rp750.000)"
        ],
        correct: 2
    }
];

// Default Admin Account
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin',
    mustChangePassword: true,
    photo: null,
    createdAt: new Date().toISOString()
};

// Default Teacher Account
const DEFAULT_TEACHER = {
    username: 'guru',
    password: 'guru123',
    name: 'Pak Nandar',
    role: 'guru',
    kelas: 'Semua Kelas',
    mustChangePassword: true,
    photo: null,
    createdAt: new Date().toISOString()
};
