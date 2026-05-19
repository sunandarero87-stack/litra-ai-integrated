const axios = require('axios');
const ChatLog = require('../models/ChatLog');

// Configuration
const RAW_API_KEYS = (process.env.AI_API_KEYS || process.env.AI_API_KEY || "").trim();
const API_KEYS = RAW_API_KEYS.split(',').map(k => k.trim()).filter(k => k.length > 0);

const AI_MODEL = (process.env.AI_MODEL || "llama-3.3-70b-versatile").trim();
const API_URL = (process.env.AI_BASE_URL || "https://api.groq.com/openai/v1/chat/completions").trim();

// Definisi Model berdasarkan Beban Kerja
const MODEL_HEAVY = "llama-3.3-70b-versatile"; // Terbaik untuk Materi & Soal (128k context)
const MODEL_FAST = "llama-3.1-8b-instant";    // Terbaik untuk Chat sapaan
const MODEL_FALLBACK = "mixtral-8x7b-32768";  // Cadangan menengah

let currentKeyIndex = 0;

function getNextApiKey() {
    if (API_KEYS.length === 0) return "";
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

function getHeaders() {
    const apiKey = getNextApiKey();
    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };
    if (API_URL.includes('openrouter')) {
        headers["HTTP-Referer"] = "https://litra-ai.railway.app";
        headers["X-Title"] = "Litra-AI";
    }
    return headers;
}

async function requestWithFallback(payload, customModels = null, retryDelay = 2000) {
    const modelsToTry = customModels || [AI_MODEL, MODEL_FALLBACK, MODEL_FAST];
    let lastError;

    for (const model of modelsToTry) {
        try {
            const res = await axios.post(API_URL, { ...payload, model }, { headers: getHeaders(), timeout: 90000 });
            if (res.data.choices && res.data.choices[0]) return res;
        } catch (e) {
            const status = e.response?.status;
            const errorDetail = e.response?.data?.error?.message || e.response?.data?.error || e.message;
            console.warn(`[AI] Model "${model}" gagal (${status || 'Err'}): ${JSON.stringify(errorDetail)}`);

            lastError = e;
            if (status === 429) {
                await new Promise(r => setTimeout(r, retryDelay));
            }
            if (status === 413 || (typeof errorDetail === 'string' && errorDetail.includes('too large'))) {
                continue; 
            }
        }
    }

    const finalErrorMsg = lastError.response?.data?.error?.message || lastError.message;
    if (typeof finalErrorMsg === 'string' && (finalErrorMsg.includes('rate_limit') || finalErrorMsg.includes('tokens per minute'))) {
        throw new Error("Sistem AI sedang mencapai batas kuota (TPM). Mohon tunggu 1 menit atau coba materi yang lebih singkat.");
    }
    throw new Error(finalErrorMsg);
}

function cleanJson(text) {
    if (!text) return "";
    let str = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let extracted = match ? match[1].trim() : str;
    
    // Perbaikan kasar untuk format JSON
    if (extracted.includes("'{") || extracted.includes("':")) {
        extracted = extracted.replace(/'/g, '"');
    }
    return extracted;
}

async function generateResponse(username, question, stage, materialContext, chatHistory, selectedMaterial = '', teacherName = 'Guru', studentName = '') {
    try {
        const systemInstructionText = `Kamu adalah NARA-AI, teman belajar yang menyenangkan untuk siswa kelas SD/SMP berusia sekitar 10 tahun. Tugas utamamu adalah menguji pemahaman siswa tentang materi: "${selectedMaterial}" dengan cara yang ramah, santai, dan mudah dipahami.
Siswa tadi sudah membuka materi dan ditanya apakah siap diuji.
Jika ada siswa yang bertanya kenapa namamu NARA-AI, jawab bahwa Pak Nandar terinspirasi dari NARA GEMILANG, siswa berprestasi SMP Negeri 1 Balikpapan.

PENTING: Gunakan teks di bagian "KONTEKS" sebagai sumber utama.
Jika siswa bertanya di luar materi "${selectedMaterial}", jawab HANYA dengan: "Hehe, aku cuma boleh bahas materi yang kamu buka tadi ya! Yuk, tanyain yang berkaitan dengan ${selectedMaterial} aja 😊 Biar kita bisa lanjut ke tahap berikutnya!"
Langsung mulai uji pemahaman begitu siswa bilang siap (misalnya "Ya", "Siap", "Boleh", dll.).
Kamu masih boleh merespons sapaan awal dengan ramah, tapi jika percakapan berlanjut di luar materi, gunakan HANYA kalimat penolakan di atas.

SIKAP: Ramah seperti kakak atau sahabat, sabar, dan semangat! Gunakan bahasa sehari-hari yang mudah dimengerti anak usia 10 tahun. Kalau ada yang susah, kasih contoh dari kehidupan sehari-hari.
GUNAKAN BAHASA INDONESIA yang mudah, santai, tapi tetap sopan. Boleh pakai sedikit emoji agar lebih ceria.

ATURAN SAPAAN: Jika siswa hanya menyapa ("Halo", "Hai", "Selamat pagi", dll.) tanpa pertanyaan tentang materi, balas dengan sapaan hangat menyebut nama "${studentName || username}". Contoh: "Halo, ${studentName || username}! Seneng banget bisa belajar bareng kamu 😊 Ada yang mau ditanyain tentang **${selectedMaterial}**?" — Jangan jelaskan materi dulu kalau cuma sapaan.

FORMAT JAWABAN:
- Gunakan bahasa yang sederhana, hangat, dan menyenangkan seperti ngobrol dengan teman.
- Gunakan **cetak tebal** untuk kata-kata penting.
- Berikan contoh dari kehidupan nyata yang dekat dengan anak-anak.
- LARANGAN: Jangan tanya "Apa kamu paham?" atau "Ada lagi?" di akhir penjelasan rutin.
- WAJIB: Jika siswa menyatakan siap diuji ("Ya", "Siap", "Boleh", dll.), langsung berikan DUA soal uji pemahaman secara BERTAHAP:
  * Soal 1: **[UJI LITERASI]** - pertanyaan tentang pemahaman isi/konsep dari materi (mudah dipahami anak 10 tahun)
  * Soal 2: **[UJI NUMERASI]** - pertanyaan tentang angka, data, atau logika dari materi (mudah dipahami anak 10 tahun)
  Tandai dengan jelas setiap soal menggunakan label **[UJI LITERASI]** dan **[UJI NUMERASI]**.
- CATATAN: Kalau siswa bilang siap diuji, LANGSUNG kasih dua soal itu tanpa basa-basi panjang! Langsung tuliskan Soal 1 [UJI LITERASI] lalu Soal 2 [UJI NUMERASI].
KONTEKS: ${materialContext}
TAHAP: ${stage}`;

        let messages = [{ role: "system", content: systemInstructionText }];
        const formattedHistory = chatHistory.slice(-6).map(msg => ({
            role: (msg.role === 'bot' || msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
            content: msg.content || ""
        }));
        messages = messages.concat(formattedHistory);
        messages.push({ role: 'user', content: question });

        const payload = { messages, temperature: 0.7, max_tokens: 1024 };
        const response = await requestWithFallback(payload, [MODEL_FAST, AI_MODEL]);
        const aiReply = response.data.choices[0].message.content;

        try {
            await ChatLog.create({ username, role: 'bot', content: aiReply, model: AI_MODEL, metadata: { stage, selectedMaterial } });
            await ChatLog.create({ username, role: 'user', content: question, metadata: { stage, selectedMaterial } });
        } catch (e) {}

        return aiReply;
    } catch (error) {
        throw new Error(`AI Error: ${error.message}`);
    }
}

async function generateReflections(username, chatHistory) {
    try {
        // Cari pesan terakhir siswa yang merupakan jawaban uji pemahaman (berdasarkan metadata jika ada, atau pesan user terakhir)
        const understandingAnswer = [...chatHistory].reverse().find(m => m.metadata && m.metadata.type === 'understanding_test_answer') 
                                    || [...chatHistory].reverse().find(m => m.role === 'user');
        
        const contextText = understandingAnswer 
            ? `Jawaban Siswa pada Uji Pemahaman: "${understandingAnswer.content}"` 
            : `Ringkasan diskusi: ${chatHistory.slice(-5).map(m => m.content).join(' ')}`;

        const payload = {
            messages: [
                { 
                    role: "system", 
                    content: "Kamu adalah teman belajar NARA-AI yang ramah. Tugasmu adalah membuat 5 pertanyaan refleksi yang menyenangkan dan mudah dipahami oleh anak berusia 10 tahun, berdasarkan jawaban uji pemahaman siswa. Pertanyaan harus mengajak siswa berpikir tentang bagaimana mereka bisa menerapkan materi di kehidupan nyata. Gunakan BAHASA INDONESIA yang santai, ramah, dan menyenangkan seperti ngobrol sama teman." 
                },
                { 
                    role: "user", 
                    content: `Berdasarkan jawaban siswa berikut, buatlah 5 pertanyaan refleksi yang mudah dipahami anak 10 tahun (gunakan kalimat pendek, santai, dan menyenangkan). 
                    
KONTEKS JAWABAN SISWA: 
${contextText}

Output WAJIB dalam bentuk JSON array murni berisi STRING. Contoh: ["...", "...", ...]` 
                }
            ]
        };
        const response = await requestWithFallback(payload, [MODEL_FAST, MODEL_HEAVY]);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (error) {
        return [
            "Apa hal paling seru yang kamu pelajari tadi? Ceritain dong!",
            "Gimana caramu pakai ilmu yang baru kamu dapet ini di kehidupan sehari-hari?",
            "Bagian mana yang bikin kamu penasaran dan pengen tahu lebih banyak?",
            "Ada nggak bagian yang masih bikin bingung? Ceritain!",
            "Setelah belajar ini, kamu mau belajar apa lagi selanjutnya?"
        ];
    }
}

async function generateAssessment(username, reflectionAnswers, materialContext) {
    const payload = {
        messages: [
            { role: "system", content: "Kamu adalah AI spesialis pembuatan soal asesmen berformat ANBK (PISA-like). OUTPUT WAJIB BERUPA PURE JSON ARRAY YANG VALID BERISI TEPAT 20 SOAL. JANGAN LEBIH DARI 20 SOAL.\nWAJIB MENGGUNAKAN BAHASA INDONESIA BAKU (EYD)." },
            { role: "user", content: `Buat 20 soal pilihan ganda dari materi: ${materialContext}\n\nRefleksi: ${JSON.stringify(reflectionAnswers)}` }
        ],
        max_tokens: 4000,
        temperature: 0.4
    };
    const response = await requestWithFallback(payload, [MODEL_HEAVY, "llama-3.1-70b-versatile"]);
    return JSON.parse(cleanJson(response.data.choices[0].message.content));
}

async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const payload = {
            messages: [
                { 
                    role: "system", 
                    content: "Kamu adalah Pakar Pedagogi dan Ahli Bahasa NARA-AI. Tugasmu adalah menganalisis jawaban refleksi siswa secara mendalam. Berikan umpan balik yang konstruktif mencakup dua aspek utama: 1) Analisis Isi (kedalaman pemahaman, relevansi), dan 2) Analisis Penulisan (tata bahasa, tanda baca, kerapihan).\n\nWAJIB MENGGUNAKAN BAHASA INDONESIA BAKU (EYD) yang sangat ramah dan memotivasi." 
                },
                { 
                    role: "user", 
                    content: `Analisislah jawaban refleksi siswa berikut: ${JSON.stringify(reflectionAnswers)}
                    
OUTPUT WAJIB DALAM FORMAT JSON BERIKUT:
{
  "ready": boolean,
  "score": number (0-100),
  "analysis": {
    "isi": "Analisis detail tentang kelebihan dan kekurangan isi/konten jawaban...",
    "penulisan": "Analisis detail tentang kelebihan dan kekurangan cara penulisan (EYD)...",
    "umum": "Kesimpulan singkat..."
  },
  "recommendation": "Saran konkret untuk peningkatan..."
}` 
                }
            ]
        };
        const response = await requestWithFallback(payload, [MODEL_FAST, MODEL_HEAVY]);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("AI Analysis Error:", e);
        return { 
            ready: true, 
            score: 70, 
            analysis: {
                isi: "Jawabanmu sudah cukup baik namun perlu diperdalam.",
                penulisan: "Penulisan sudah cukup rapi.",
                umum: "Analisis default"
            }, 
            recommendation: "Terus tingkatkan pemahamanmu." 
        };
    }
}

async function analyzeHabits(username, habitAnswers) {
    try {
        const payload = {
            messages: [
                { 
                    role: "system", 
                    content: `Kamu adalah Pakar Karakter dan Motivator Siswa NARA-AI. Tugasmu adalah mengevaluasi penerapan "7 Kebiasaan Hebat Anak Indonesia" berdasarkan jawaban esai siswa.
                    
7 Kebiasaan Hebat tersebut adalah:
1. Bangun Pagi (Kedisiplinan waktu)
2. Beribadah (Ketaatan spiritual)
3. Berolahraga (Kesehatan fisik)
4. Makan Sehat dan Bergizi (Nutrisi tubuh)
5. Gemar Belajar (Pengembangan diri)
6. Bermasyarakat (Kepedulian sosial/gotong royong)
7. Tidur Cepat (Istirahat yang cukup)

INSTRUKSI PENTING:
1. **Verifikasi Relevansi**: Cek apakah jawaban siswa benar-benar menjawab pertanyaan tentang kebiasaan tersebut atau hanya asal-asalan/tidak relevan (misal: hanya ketikan acak, kata-kata kasar, atau curhat yang tidak nyambung).
2. **Jika Tidak Relevan**: Berikan skor rendah (10-30), namun berikan MOTIVASI yang sangat kuat, lembut, dan menyentuh hati agar siswa mau berubah dan serius melakukan refleksi diri. Jangan menghakimi, tapi rangkul mereka dengan kata-kata.
3. **Jika Relevan**: Berikan apresiasi yang tulus (Kelebihan), identifikasi apa yang masih bisa ditingkatkan (Kekurangan), dan berikan skor objektif (60-100).

WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU (EYD) yang sangat ramah, inspiratif, dan memotivasi.

OUTPUT WAJIB DALAM FORMAT JSON BERIKUT:
{
  "score": number (0-100),
  "isRelevant": boolean,
  "analysis": "Umpan balik utama yang berisi evaluasi dan motivasi mendalam...",
  "details": [
    "Saran/Pesan motivasi 1...",
    "Saran/Pesan motivasi 2...",
    "Saran/Pesan motivasi 3..."
  ]
}` 
                },
                { role: "user", content: `Analisislah jawaban esai refleksi karakter siswa berikut ini:\n${JSON.stringify(habitAnswers)}` }
            ]
        };
        const response = await requestWithFallback(payload, [MODEL_HEAVY, MODEL_FALLBACK]);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Habit Analysis Error:", e);
        return { 
            score: 70, 
            isRelevant: true,
            analysis: "Kamu memiliki potensi besar untuk menjadi anak yang hebat. Teruslah konsisten menjalankan 7 kebiasaan positif setiap hari.", 
            details: ["Disiplin adalah kunci kesuksesan.", "Jaga kesehatanmu karena itu investasi masa depan.", "Tetaplah menjadi anak yang baik dan gemar menolong."] 
        };
    }
}

async function generateBankSoal(objectivesArray, amount = 10, indicatorType = '', indicatorValue = '', penalaranLogis = 3) {
    const payload = {
        messages: [
            { 
                role: "system", 
                content: `Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berstandar HOTS (Higher Order Thinking Skills).
OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID.
Setiap objek soal dalam array HARUS memiliki format properti berikut persis:
{
  "question": "teks pertanyaan soal HOTS...",
  "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
  "correct": 0, // Indeks jawaban yang benar (0 untuk Opsi A, 1 untuk Opsi B, 2 untuk Opsi C, 3 untuk Opsi D)
  "explanation": "Pembahasan/penjelasan jawaban yang mendalam...",
  "type": "literasi" // atau "numerasi"
}
Jangan gunakan nama properti bahasa Indonesia seperti "soal", "opsi", "kunci", atau "pembahasan". Gunakan persis kunci bahasa Inggris di atas!`
            },
            { role: "user", content: `Buat TEPAT ${amount} buah soal pilihan ganda dari TP: ${JSON.stringify(objectivesArray)}. Pastikan tingkat penalaran logis adalah level ${penalaranLogis}.` }
        ],
        max_tokens: 4000,
        temperature: 0.6
    };
    const response = await requestWithFallback(payload, [MODEL_HEAVY, "llama-3.1-70b-versatile"]);
    return JSON.parse(cleanJson(response.data.choices[0].message.content));
}

async function generateBankSoalFromMaterial(materialContent, amount = 10, indicatorType = '', indicatorValue = '', penalaranLogis = 3) {
    const payload = {
        messages: [
            { 
                role: "system", 
                content: `Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berdasarkan materi pembelajaran berstandar HOTS (Higher Order Thinking Skills).
OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID.
Setiap objek soal dalam array HARUS memiliki format properti berikut persis:
{
  "question": "teks pertanyaan soal HOTS...",
  "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
  "correct": 0, // Indeks jawaban yang benar (0 untuk Opsi A, 1 untuk Opsi B, 2 untuk Opsi C, 3 untuk Opsi D)
  "explanation": "Pembahasan/penjelasan jawaban yang mendalam...",
  "type": "literasi" // atau "numerasi"
}
Jangan gunakan nama properti bahasa Indonesia seperti "soal", "opsi", "kunci", atau "pembahasan". Gunakan persis kunci bahasa Inggris di atas!`
            },
            { role: "user", content: `Buat TEPAT ${amount} buah soal pilihan ganda dari materi: ${materialContent.substring(0, 20000)}. Pastikan tingkat penalaran logis adalah level ${penalaranLogis}.` }
        ],
        max_tokens: 4000,
        temperature: 0.6
    };
    const response = await requestWithFallback(payload, [MODEL_HEAVY, "llama-3.1-70b-versatile"]);
    return JSON.parse(cleanJson(response.data.choices[0].message.content));
}

async function generateLearningMaterial(tujuanPembelajaran, kelas, sumberGambar = 'AI', jumlahTujuan = 3, jumlahHalaman = 3, judul = '') {
    const minWords = (parseInt(jumlahHalaman) || 1) * 600;
    const sectionCount = (parseInt(jumlahHalaman) || 1) * 2 + 1;
    const prompt = `Kamu adalah AI Pakar Pedagogi... (instruksi materi panjang)... 
Judul: ${judul}, TP: ${tujuanPembelajaran}, Kelas: ${kelas}, Halaman: ${jumlahHalaman}, Min Kata: ${minWords}, Sub-bab: ${sectionCount}.
Wajib sertakan gambar (Pollinations/LoremFlickr) dan Video Youtube (ID: pS1f9R7qMOM dll sesuai kategori).
Output HTML murni dalam div style.`;

    const safeMaxTokens = Math.min(3000 + (parseInt(jumlahHalaman) || 1) * 1200, 8000);
    const payload = {
        messages: [
            { role: "system", content: "AI asisten pembuat materi pembelajaran HTML interaktif dan estetik yang selalu menulis materi sangat panjang, detail, mendalam, dan lengkap." },
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: safeMaxTokens
    };

    const response = await requestWithFallback(payload, [MODEL_HEAVY, "llama-3.1-70b-versatile"]);
    let htmlContent = response.data.choices[0].message.content;
    if (htmlContent.startsWith("```")) {
        htmlContent = htmlContent.replace(/^```html\s*/i, "").replace(/```$/, "").trim();
    }
    return htmlContent;
}

async function analyzeUnderstanding(username, originalExplanation, studentAnswer) {
    try {
        const payload = {
            messages: [
                { role: "system", content: "Kamu adalah evaluator pemahaman siswa yang adil. Berikan umpan balik yang konstruktif. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU (EYD). Di akhir jawabanmu, wajib sertakan skor dalam format [SKOR: X] (skala 0-100)." },
                { role: "user", content: `Evaluasi jawaban siswa terhadap materi.\n\nPenjelasan Sebelumnya: ${originalExplanation}\nJawaban Siswa: ${studentAnswer}\n\nBerikan analisis singkat dan skor.` }
            ],
            temperature: 0.3,
            max_tokens: 512
        };
        const response = await requestWithFallback(payload, [MODEL_FAST, MODEL_HEAVY]);
        const aiReply = response.data.choices[0].message.content;

        // Log to Chat History so it can be used for reflections in Stage 2
        try {
            await ChatLog.create({ 
                username, 
                role: 'user', 
                content: studentAnswer, 
                metadata: { type: 'understanding_test_answer' } 
            });
            await ChatLog.create({ 
                username, 
                role: 'bot', 
                content: aiReply, 
                metadata: { type: 'understanding_test_feedback' } 
            });
        } catch (e) {
            console.error("Failed to log understanding test:", e);
        }

        return aiReply;
    } catch (e) {
        return "Terima kasih atas jawabanmu! [SKOR: 50]";
    }
}

async function analyzeCompetency(studentData) {
    try {
        const payload = {
            messages: [
                { role: "system", content: "Kamu adalah AI Analis Pedagogi ahli. Output WAJIB JSON {kekuatan, areaPeningkatan, rekomendasi}." },
                { role: "user", content: `Analisis data siswa berikut: ${JSON.stringify(studentData)}` }
            ],
            temperature: 0.5,
            max_tokens: 1024
        };
        const response = await requestWithFallback(payload, [MODEL_HEAVY, MODEL_FALLBACK]);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        return { kekuatan: "Siswa aktif.", areaPeningkatan: "Latihan lagi.", rekomendasi: "Terus semangat." };
    }
}

async function generateMathProblem(username, topic = 'Bilangan', materialContext = "") {
    try {
        let contentPrompt = `Buatkan 1 soal cerita matematika tentang topik **${topic}**.`;
        if (materialContext) {
            contentPrompt = `Siswa sebelumnya baru saja mempelajari materi Literasi berikut:\n"""\n${materialContext}\n"""\n\nBuatkan 1 soal cerita matematika tentang topik **${topic}** yang TEMANYA SANGAT BERKAITAN ERAT dengan materi di atas. Buat semenarik mungkin. Jika memerlukan representasi bangun datar, bangun ruang, denah, atau diagram visual, rancang kode SVG-nya secara akurat di field 'svg'. Dilarang menyisipkan gambar markdown di dalam pertanyaan. Buat 3 langkah hint bertahap yang sangat ramah dan mudah dimengerti anak 10 tahun, dan berikan jawaban akhirnya berupa angka.`;
        } else {
            contentPrompt = `Buatkan 1 soal cerita matematika tentang topik **${topic}**. Jika memerlukan representasi bangun datar, bangun ruang, denah, atau diagram visual, rancang kode SVG-nya secara akurat di field 'svg'. Dilarang menyisipkan gambar markdown di dalam pertanyaan. Buat 3 langkah hint bertahap yang sangat ramah dan mudah dimengerti anak 10 tahun, dan berikan jawaban akhirnya berupa angka.`;
        }

        const payload = {
            messages: [
                { 
                    role: "system", 
                    content: "Kamu adalah Guru Matematika AI yang ramah untuk siswa SD/SMP (usia 10-14 tahun). Tugasmu membuat 1 soal cerita matematika yang membutuhkan logika. OUTPUT WAJIB BERUPA JSON MURNI TANPA MARKDOWN DI LUAR JSON. Gunakan format persis ini: {\"question\": \"Isi pertanyaan dengan Markdown\", \"hints\": [\"Hint 1\", \"Hint 2\", \"Hint 3\"], \"answer\": 15, \"svg\": \"<svg>...</svg>\"} Pastikan 'answer' adalah angka/number.\n\nPENTING:\n1. Jika soal membahas tentang BANGUN DATAR (segitiga, persegi panjang, lingkaran, trapesium, dll), BANGUN RUANG (kubus, balok, tabung, prisma, dll), atau DENAH/RUTE/GRID koordinat, kamu WAJIB menghasilkan kode SVG yang bersih, indah, responsif, dan valid di field 'svg' untuk menggambarkan bangun atau diagram tersebut secara matematis. Berikan label ukuran/dimensi/huruf (misal: '12 cm', 'X', 'A', 'B') yang kontras dan sesuai persis dengan soal. Gunakan warna pengisi pastel lembut (misal: #3b82f6 atau #ef4444 dengan transparansi), garis tepi kontras, serta tag <text> untuk label agar mudah dibaca.\n2. Jika soal tidak berkaitan dengan bentuk visual geometris, biarkan field 'svg' berisi string kosong (\"\").\n3. DILARANG KERAS menyertakan link gambar atau format gambar Markdown apapun (seperti `![Ilustrasi](...)` dari Pollinations atau sumber lain) di dalam 'question' maupun 'hints'. Semua representasi visual WAJIB berupa kode SVG yang ditaruh di field 'svg'.\n4. Gunakan sintaks Markdown standar (seperti **tebal**, *miring*) dan Unicode/simbol matematika (seperti √, ², π, dll) di dalam 'question' agar teks mudah dibaca.\n5. HINT BERTAHAP UNTUK ANAK 10 TAHUN (SANGAT PENTING): Penjelasan petunjuk (Hint 1 sampai Hint 3) WAJIB ditulis dengan bahasa yang sangat sederhana, ramah, menyenangkan, dan mudah dicerna anak usia 10 tahun (SD kelas 4-6). DILARANG menggunakan istilah aljabar rumit seperti variabel 'X', 'Y', atau 'persamaan linear'. Gunakan analogi visual, pembagian logika sederhana, dan bimbing mereka langkah-demi-langkah:\n   - Hint 1: Jelaskan apa maksud soal dengan kata-kata sederhana atau gambar mental yang mudah dibayangkan.\n   - Hint 2: Tuntun langkah pertama cara menghitungnya tanpa rumus rumit.\n   - Hint 3: Berikan langkah akhir atau cara menghitung jawaban akhir (misal: 'Sekarang tinggal kamu kalikan angka A dengan angka B ya!') tanpa langsung membocorkan jawaban angka finalnya." 
                },
                { 
                    role: "user", 
                    content: contentPrompt 
                }
            ],
            temperature: 0.7,
            max_tokens: 1024
        };
        const response = await requestWithFallback(payload, [MODEL_FAST, MODEL_HEAVY]);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (error) {
        console.error("Math Generation Error:", error);
        return {
            question: "Sebuah lapangan berbentuk **persegi panjang** memiliki panjang 5 meter lebih dari lebarnya. Jika kelilingnya 50 meter, berapakah luasnya dalam meter persegi (m²)?",
            hints: [
                "Bayangkan keliling lapangan adalah 50 meter. Karena keliling itu memutari seluruh lapangan, berarti **1 kali Panjang ditambah 1 kali Lebar** besarnya adalah setengah dari keliling, yaitu **25 meter**! Coba dipahami dulu ya.",
                "Nah, soal bilang kalau **Panjang = Lebar + 5 meter**. Berarti jika kita kurangi 5 meter dari 25 meter tadi, sisanya adalah 20 meter. Jika 20 meter dibagi 2 untuk Panjang dan Lebar yang sama, maka **Lebarnya adalah 10 meter**, dan **Panjangnya adalah 10 + 5 = 15 meter**.",
                "Hebat! Sekarang kita sudah tahu Lebar = 10 meter dan Panjang = 15 meter. Rumus luas lapangan adalah **Panjang dikali Lebar**. Coba hitung berapa hasil dari **15 dikali 10**?"
            ],
            answer: 150,
            svg: `<svg viewBox="0 0 400 200" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="40" width="300" height="120" rx="8" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="3" />
                <!-- Labels -->
                <text x="200" y="30" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">Panjang = Lebar + 5 meter</text>
                <text x="200" y="110" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">Luas = ? m²</text>
                <text x="25" y="105" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" transform="rotate(-90 25 105)">Lebar</text>
                <text x="200" y="190" fill="#aaaaaa" font-size="14" text-anchor="middle">Keliling = 50 meter</text>
            </svg>`
        };
    }
}

async function generateStage3Assessment(materialContent) {
    const payload = {
        messages: [
            { 
                role: "system", 
                content: `Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berstandar HOTS (Higher Order Thinking Skills).
OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID YANG BERISI TEPAT 10 OBJEK SOAL.
5 SOAL PERTAMA WAJIB BENTUK LITERASI (membaca, memahami, menganalisis teks).
5 SOAL TERAKHIR WAJIB BENTUK NUMERASI (menghitung, logika matematika, pola, data yang berkaitan dengan teks).
Setiap objek soal dalam array HARUS memiliki format properti berikut persis:
{
  "question": "teks pertanyaan soal HOTS...",
  "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
  "correct": 0, // Indeks jawaban yang benar (0 untuk Opsi A, 1 untuk Opsi B, 2 untuk Opsi C, 3 untuk Opsi D)
  "explanation": "Pembahasan/penjelasan jawaban yang mendalam...",
  "type": "literasi" // atau "numerasi" sesuai jenis soalnya
}
Jangan gunakan nama properti bahasa Indonesia seperti "soal", "opsi", "kunci", atau "pembahasan". Gunakan persis kunci bahasa Inggris di atas!`
            },
            { role: "user", content: `Buat TEPAT 10 buah soal pilihan ganda (5 Literasi dan 5 Numerasi) dari materi berikut: ${materialContent.substring(0, 20000)}` }
        ],
        max_tokens: 4000,
        temperature: 0.6
    };
    const response = await requestWithFallback(payload, [MODEL_HEAVY, "llama-3.1-70b-versatile"]);
    return JSON.parse(cleanJson(response.data.choices[0].message.content));
}

module.exports = {
    generateMathProblem,
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness,
    analyzeHabits,
    generateBankSoal,
    generateBankSoalFromMaterial,
    generateStage3Assessment,
    analyzeUnderstanding,
    generateLearningMaterial,
    analyzeCompetency,
    requestWithFallback,
    cleanJson
};
