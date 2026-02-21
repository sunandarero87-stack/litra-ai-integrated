// ============================================
// CHATBOT ENGINE - Litra-AI
// Asisten Pak Nandar untuk Informatika
// ============================================

const ChatbotEngine = {
    botName: "Litra-AI",
    greeting: `Halo! 👋 Saya **Litra-AI**, asisten virtualmu. Silakan tanyakan apa saja, saya bebas menjawab semua pertanyaanmu dengan sopan. 😊`,


    // Knowledge base topics
    topics: {
        analisisData: {
            keywords: ['analisis data', 'data analytics', 'apa itu analisis', 'pengertian analisis', 'definisi analisis'],
            responses: [
                `📊 **Analisis Data** adalah proses memeriksa, membersihkan, mengubah, dan memodelkan data untuk menemukan informasi yang berguna.

**Tahapan Analisis Data:**
1. 📥 **Pengumpulan Data** – Mengumpulkan data dari berbagai sumber
2. 🧹 **Pembersihan Data** – Menghilangkan data yang salah atau duplikat
3. 🔍 **Pengolahan Data** – Mengolah data menggunakan rumus atau tools
4. 📊 **Visualisasi Data** – Menyajikan data dalam bentuk grafik/diagram
5. 💡 **Interpretasi** – Membuat kesimpulan dari hasil analisis

Analisis data sangat penting di era digital ini! Mau tahu lebih lanjut tentang bagian mana? 😊`,

                `📊 **Analisis data** secara sederhana adalah proses "membaca" data agar kita bisa mendapat informasi yang berguna.

Bayangkan kamu punya data nilai ulangan seluruh kelas. Dengan analisis data, kamu bisa tahu:
- 📈 Berapa rata-rata nilai kelas
- 🏆 Siapa yang nilainya tertinggi
- 📉 Berapa siswa yang perlu remedial

Jadi analisis data itu seperti **detektif** yang mencari informasi tersembunyi di balik angka-angka! 🕵️`
            ]
        },

        kegunaanAnalisis: {
            keywords: ['kegunaan analisis', 'manfaat analisis', 'fungsi analisis', 'untuk apa analisis', 'pentingnya analisis', 'kehidupan sehari'],
            responses: [
                `💡 **Kegunaan Analisis Data dalam Kehidupan Sehari-hari:**

1. 🏪 **Di Toko/Bisnis** – Mengetahui produk mana yang paling laku, kapan penjualan tertinggi
2. 🏫 **Di Sekolah** – Menganalisis nilai siswa, mengetahui mata pelajaran yang perlu ditingkatkan
3. 🏥 **Di Kesehatan** – Memantau perkembangan kesehatan, menganalisis data pasien
4. ⛅ **Cuaca** – Memprediksi cuaca berdasarkan data historis
5. 🎮 **Media Sosial** – Menganalisis tren yang sedang viral
6. 📱 **Aplikasi** – Spotify dan YouTube menganalisis data kesukaanmu untuk memberi rekomendasi!

Jadi, analisis data ada di mana-mana dalam kehidupan kita! 🌟`,

                `🌟 **Manfaat analisis data itu banyak banget, lho!**

Contoh nyata:
- 📋 Guru menganalisis nilai ulangan untuk tahu materi mana yang murid-murid belum paham
- 🛒 Toko online seperti Shopee menganalisis data pembelianmu untuk merekomendasikan produk
- 📊 Pemerintah menganalisis data penduduk untuk perencanaan pembangunan

Intinya, analisis data membantu kita **membuat keputusan yang lebih baik** berdasarkan fakta, bukan hanya perkiraan! 💪`
            ]
        },

        excel: {
            keywords: ['excel', 'microsoft excel', 'spreadsheet', 'lembar kerja', 'workbook'],
            responses: [
                `📗 **Microsoft Excel** adalah program pengolah angka (spreadsheet) yang dikembangkan oleh Microsoft.

**Komponen utama Excel:**
- 📄 **Workbook** – File Excel yang kita buka
- 📋 **Worksheet/Sheet** – Lembar kerja dalam workbook
- 🔲 **Cell (Sel)** – Pertemuan kolom dan baris (misal: A1, B2, C3)
- 📊 **Range** – Kumpulan sel (misal: A1:A10)

**Kenapa Excel penting untuk analisis data?**
✅ Bisa menghitung otomatis dengan rumus
✅ Bisa membuat grafik/diagram
✅ Bisa mengurutkan dan menyaring data
✅ Bisa menangani data dalam jumlah besar

Mau belajar tentang rumus-rumus Excel? Tanya saja! 😊`,

                `📗 **Microsoft Excel** itu seperti "kalkulator super canggih" yang bisa:

1. 📝 Menyimpan data dalam bentuk tabel
2. 🔢 Menghitung otomatis dengan rumus (SUM, AVERAGE, dll)
3. 📊 Membuat grafik dan diagram
4. 🔍 Mengurutkan dan memfilter data
5. 📈 Menganalisis data dengan Pivot Table

Excel sangat diperlukan di banyak pekerjaan, dari guru, akuntan, sampai data scientist! Kamu belajar Excel dari sekarang itu keren banget! 🚀`
            ]
        },

        rumusSUM: {
            keywords: ['sum', 'jumlah', 'menjumlahkan', 'total', 'penjumlahan'],
            responses: [
                `🔢 **Rumus SUM** digunakan untuk **menjumlahkan** nilai dalam range!

**Cara penulisan:**
\`=SUM(A1:A10)\` → Menjumlahkan nilai dari sel A1 sampai A10

**Contoh:**
| A |
|---|
| 10 |
| 20 |
| 30 |

\`=SUM(A1:A3)\` hasilnya = **60** (10+20+30)

**Tips:**
- Kamu juga bisa jumlahkan sel tertentu: \`=SUM(A1,A3,A5)\`
- SUM mengabaikan sel kosong dan teks 👍

Rumus ini adalah yang paling dasar dan paling sering digunakan! 💪`
            ]
        },

        rumusAVERAGE: {
            keywords: ['average', 'rata-rata', 'rata rata', 'mean', 'rerata'],
            responses: [
                `📊 **Rumus AVERAGE** digunakan untuk menghitung **rata-rata**!

**Cara penulisan:**
\`=AVERAGE(A1:A10)\` → Menghitung rata-rata dari A1 sampai A10

**Contoh:**
Nilai: 80, 90, 70, 85, 75
\`=AVERAGE(A1:A5)\` = **80** (400 ÷ 5)

**Rumus rata-rata:**
Rata-rata = Total nilai ÷ Jumlah data

**Kapan digunakan?**
- Menghitung rata-rata nilai ulangan kelas
- Menghitung rata-rata suhu harian
- Menghitung rata-rata pengeluaran bulanan

Mudah kan? 😊 Ada pertanyaan lain?`
            ]
        },

        rumusMAXMIN: {
            keywords: ['max', 'min', 'terbesar', 'terkecil', 'tertinggi', 'terendah', 'maksimum', 'minimum'],
            responses: [
                `📈📉 **Rumus MAX dan MIN:**

**MAX** → Mencari nilai **terbesar**
**MIN** → Mencari nilai **terkecil**

**Cara penulisan:**
\`=MAX(A1:A10)\` → Nilai terbesar dari A1-A10
\`=MIN(A1:A10)\` → Nilai terkecil dari A1-A10

**Contoh:**
Data: 75, 80, 95, 60, 85
- \`=MAX(A1:A5)\` = **95** ⬆️
- \`=MIN(A1:A5)\` = **60** ⬇️

**Kegunaan:**
- 🏆 Mencari nilai tertinggi di kelas
- 📉 Mencari suhu terendah dalam seminggu
- 💰 Mencari harga termahal atau termurah

Kamu juga bisa kombinasikan dengan rumus lain, lho! Misal untuk mencari Range: \`=MAX(A1:A10)-MIN(A1:A10)\` 🎯`
            ]
        },

        rumusIF: {
            keywords: ['if', 'kondisi', 'logika', 'jika', 'syarat', 'lulus tidak'],
            responses: [
                `🔀 **Rumus IF** digunakan untuk membuat **keputusan berdasarkan kondisi**!

**Cara penulisan:**
\`=IF(kondisi, nilai_jika_benar, nilai_jika_salah)\`

**Contoh 1 – Kelulusan:**
\`=IF(A1>=70,"Lulus","Tidak Lulus")\`
- Jika A1 ≥ 70 → hasilnya "Lulus"
- Jika A1 < 70 → hasilnya "Tidak Lulus"

**Contoh 2 – Nilai huruf:**
\`=IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","D")))\`
Ini namanya **IF bersarang (nested IF)** 🎯

**Dalam kehidupan, IF itu seperti:**
"JIKA hujan, MAKA bawa payung, KALAU TIDAK pakai topi"

Paham ya? Ada yang mau ditanyakan lagi? 😊`
            ]
        },

        rumusCOUNT: {
            keywords: ['count', 'countif', 'hitung', 'banyaknya', 'jumlah data'],
            responses: [
                `🔢 **Rumus COUNT & COUNTIF:**

**COUNT** → Menghitung **jumlah sel** yang berisi angka
\`=COUNT(A1:A20)\` → Berapa sel yang berisi angka

**COUNTIF** → Menghitung sel dengan **kriteria tertentu**
\`=COUNTIF(A1:A20,">70")\` → Berapa sel yang nilainya > 70

**Contoh:**
Data nilai: 80, 65, 90, 55, 75, 85, 70

\`=COUNT(A1:A7)\` = **7** (ada 7 data)
\`=COUNTIF(A1:A7,">=70")\` = **5** (ada 5 nilai ≥ 70)
\`=COUNTIF(A1:A7,"<70")\` = **2** (ada 2 nilai < 70)

Rumus ini sangat berguna untuk menganalisis data, misalnya menghitung berapa siswa yang lulus! 📊`
            ]
        },

        fiturExcel: {
            keywords: ['fitur', 'chart', 'grafik', 'diagram', 'sort', 'filter', 'pivot', 'conditional', 'format', 'freeze'],
            responses: [
                `🛠️ **Fitur-fitur Penting Excel untuk Analisis Data:**

1. 📊 **Chart/Grafik**
   - Bar Chart (grafik batang) → perbandingan
   - Line Chart (grafik garis) → tren waktu
   - Pie Chart (grafik lingkaran) → proporsi

2. 🔽 **Sort & Filter**
   - Sort: mengurutkan data (A-Z, kecil-besar)
   - Filter: menampilkan data sesuai kriteria

3. 📋 **Pivot Table**
   - Merangkum data besar jadi tabel ringkasan
   - Sangat powerful untuk analisis!

4. 🎨 **Conditional Formatting**
   - Memberi warna otomatis berdasarkan nilai
   - Misal: nilai di bawah 70 jadi merah 🔴

5. 🔒 **Freeze Panes**
   - Mengunci header saat scroll data banyak

6. ✅ **Data Validation**
   - Membatasi input data (misal: hanya angka 0-100)

Mau tahu detail tentang fitur tertentu? 😊`
            ]
        },

        sapaan: {
            keywords: ['halo', 'hai', 'hi', 'hey', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum'],
            responses: [
                `Halo! 😊 Senang bertemu denganmu!

Saya **Litra-AI**, asisten Pak Nandar untuk pelajaran Informatika.

Ada yang mau kamu tanyakan tentang **Analisis Data** atau **Microsoft Excel**? Saya siap membantu! 📊💡`,

                `Hai! 👋 Selamat datang di kelas Informatika!

Saya di sini untuk membantumu belajar tentang Analisis Data. Yuk mulai! Kamu bisa tanya apa saja tentang:
- 📊 Analisis Data
- 📗 Microsoft Excel
- 🔢 Rumus-rumus Excel

Apa yang ingin kamu pelajari hari ini? 😊`
            ]
        },

        terima_kasih: {
            keywords: ['terima kasih', 'makasih', 'thanks', 'thank you', 'trims'],
            responses: [
                `Sama-sama! 😊 Senang bisa membantu! 

Kalau ada pertanyaan lain tentang Analisis Data atau Excel, jangan ragu bertanya ya!

Semangat belajar! 💪📚`,

                `Dengan senang hati! 🌟 

Ingat, belajar itu proses. Terus berlatih dan jangan takut bertanya! Pak Nandar dan saya selalu siap membantu! 💪😊`
            ]
        },

        bantuan: {
            keywords: ['bantu', 'bantuan', 'help', 'bingung', 'ga ngerti', 'gak paham', 'tidak mengerti'],
            responses: [
                `Tenang, saya siap membantu! 😊

Berikut topik yang bisa kamu pelajari:

1️⃣ Ketik **"apa itu analisis data"** → Pengertian Analisis Data
2️⃣ Ketik **"kegunaan analisis data"** → Manfaat di kehidupan
3️⃣ Ketik **"excel"** → Tentang Microsoft Excel
4️⃣ Ketik **"rumus sum"** → Rumus penjumlahan
5️⃣ Ketik **"rumus average"** → Rumus rata-rata
6️⃣ Ketik **"rumus max min"** → Nilai terbesar/terkecil
7️⃣ Ketik **"rumus if"** → Rumus kondisi
8️⃣ Ketik **"fitur excel"** → Fitur-fitur Excel
9️⃣ Ketik **"rumus count"** → Menghitung jumlah data

Silakan pilih topik yang kamu mau! 📚`
            ]
        }
    },

    // Get response for user message
    getResponse(message) {
        const lowerMsg = message.toLowerCase().trim();

        // Check each topic
        for (const [topicKey, topic] of Object.entries(this.topics)) {
            for (const keyword of topic.keywords) {
                if (lowerMsg.includes(keyword)) {
                    const responses = topic.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }

        // Default response
        return this.getDefaultResponse(lowerMsg);
    },

    getDefaultResponse(message) {
        const defaults = [
            `Hmm, saya kurang memahami pertanyaanmu. 🤔

Coba tanyakan tentang topik berikut:
- 📊 **Analisis Data** (pengertian, kegunaan)
- 📗 **Microsoft Excel** (fitur, cara kerja)
- 🔢 **Rumus Excel** (SUM, AVERAGE, MAX, MIN, IF, COUNT)

Atau ketik **"bantuan"** untuk melihat daftar topik! 😊`,

            `Maaf, saya belum bisa menjawab pertanyaan itu. 😅

Saya fokus membantu kamu belajar tentang **Analisis Data** dan **Microsoft Excel** sesuai materi kelas 7.

Coba tanyakan hal-hal seperti:
- "Apa itu analisis data?"
- "Bagaimana cara menggunakan rumus SUM?"
- "Apa fungsi IF di Excel?"

Saya pasti bisa menjawabnya! 💡`,

            `Pertanyaan menarik! Tapi itu di luar materi yang saya kuasai saat ini. 😊

Saya spesialis di bidang **Analisis Data** & **Excel** untuk kelas 7.

Yuk, coba tanyakan tentang rumus-rumus Excel atau cara menganalisis data! Saya jamin kamu akan paham! 📊`
        ];

        return defaults[Math.floor(Math.random() * defaults.length)];
    },

    // Format message with markdown-like styling
    formatMessage(text) {
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        return text;
    },

    // Backend URL - leave blank for relative paths (same origin)
    backendUrl: '',
    useAPI: true, // Set to false to always use local engine

    // Get response from Gemini API via backend
    async getResponseFromAPI(message, username, history) {
        if (!this.useAPI) {
            return this.getResponse(message);
        }

        try {
            const response = await fetch(this.backendUrl + '/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, username, history })
            });

            const data = await response.json();

            if (data.success && data.reply) {
                return data.reply;
            }

            // If API returns fallback flag, use local engine
            if (data.fallback) {
                console.warn('Gemini API fallback, using local engine:', data.error);
                return this.getResponse(message);
            }

            // Other errors
            console.error('API Error:', data.error);
            return this.getResponse(message);

        } catch (error) {
            // Network error or backend not running - fallback to local
            console.warn('Backend unreachable, using local engine:', error.message);
            this.useAPI = false; // Disable API for this session
            return this.getResponse(message);
        }
    },

    // Check if backend is available
    async checkBackend() {
        try {
            const response = await fetch(this.backendUrl + '/api/health', {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            const data = await response.json();
            if (data.status === 'ok') {
                this.useAPI = true;
                console.log('✅ Litra-AI Backend connected | Gemini:', data.geminiConfigured ? 'Active' : 'Not configured');
                return true;
            }
        } catch (e) {
            this.useAPI = false;
            console.log('ℹ️ Backend offline — menggunakan chatbot lokal');
        }
        return false;
    }
};

// Auto-check backend on load
window.addEventListener('DOMContentLoaded', () => {
    ChatbotEngine.checkBackend();
});

