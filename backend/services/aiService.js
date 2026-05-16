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
        const systemInstructionText = `Kamu adalah NARA-AI, Asisten ${teacherName}. Tugas utama kamu adalah Menguji Pemahaman siswa terhadap materi: "${selectedMaterial}". 
Siswa saat ini baru saja membuka materi tersebut dan disapa dengan pertanyaan "Apakah kamu siap diuji?".
Jika ada siswa yang menanyakan kenapa namamu NARA-AI, kamu harus menjawab bahwa Pak Nandar terinspirasi dengan NARA GEMILANG Siswa SMP Negeri 1 Balikpapan.

PENTING: Gunakan teks yang ada di bagian "KONTEKS" di bawah ini sebagai sumber utama informasi. 
Jika siswa bertanya atau memancing diskusi di luar konteks materi terpilih ("${selectedMaterial}"), kamu WAJIB menjawab HANYA dengan kalimat ini: "Maaf saya ditugaskan pak nandar membahas sesuai materi yang kamu buka, Sekarang Tanyakan yang berkaitan dengan materi ${selectedMaterial}" Agar bisa lanjut ke tahap Berikutnya.
Kamu WAJIB langsung memulai Uji Pemahaman segera setelah siswa mengkonfirmasi kesiapannya (seperti menjawab "Ya", "Siap", "Boleh", dsb.).
Jangan menambahkan kalimat lain jika konteksnya sudah keluar dari materi.
Kamu masih boleh merespons ramah terhadap sapaan awal (misal: "Halo") tetapi jika obrolan berlanjut ke topik di luar materi, gunakan HANYA kalimat penolakan tersebut.

SIKAP: Suportif, berikan penjelasan yang jelas dan mudah dipahami, pandu siswa memahami konsep dengan sabar. Gunakan analogi yang relevan dengan dunia remaja dan sekolah.
WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU (EYD) yang santun namun tetap ramah.

ATURAN SAPAAN: Jika siswa hanya menyapa (contoh: "Halo", "Hai", "Selamat pagi", "Apa kabar", "Terima kasih", dll.) tanpa pertanyaan tentang materi, BALAS HANYA dengan sapaan hangat yang menyebut nama siswa yaitu "${studentName || username}". Contoh: "Halo, ${studentName || username}! Senang bisa belajar bersamamu. Ada yang ingin kamu tanyakan tentang materi **${selectedMaterial}**?" — Jangan jelaskan materi apapun jika hanya sapaan.

FORMAT JAWABAN: Kamu harus menyajikan jawaban dengan struktur "Dokumen Profesional" yang sangat rapi:
- Gunakan ### (Header 3) untuk membagi topik jika penjelasan panjang.
- Gunakan **Teks Tebal** untuk kata kunci atau istilah penting.
- Gunakan bullet points atau penomoran untuk langkah-langkah atau daftar.
- Berikan spasi antar paragraf agar tidak menumpuk.
- Pastikan ada alur: Sapaan Singkat -> Penjelasan Terstruktur -> SELESAI (Tanpa Pertanyaan).
- LARANGAN KERAS: Kamu DILARANG KERAS memberikan pertanyaan pemancing di akhir penjelasan rutin (seperti "Apa kamu paham?", "Ada lagi?"). Cukup berikan penjelasan saja.
- KECUALI: Jika siswa memintanya secara eksplisit atau memberikan konfirmasi kesiapan diuji (menjawab "Ya", "Siap", dll), kamu WAJIB memberikan SATU pertanyaan uji pemahaman yang kritis dan menantang berkaitan langsung dengan materi "${selectedMaterial}" (dari bagian KONTEKS) serta berdasarkan penjelasan terakhir yang baru saja kamu berikan.
- CATATAN: Jika siswa mengirimkan pesan yang mengandung unsur kesiapan diuji (seperti "Saya Sudah Siap diuji...", "Siap", "Ya"), anggap itu sebagai tanda mutlak bahwa siswa harus diuji. Kamu harus LANGSUNG memberikan soal tersebut TANPA kalimat pengantar yang bertele-tele. Langsung tuliskan pertanyaannya.
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
                    content: "Kamu adalah Pakar Pedagogi NARA-AI. Tugasmu adalah merumuskan 5 pertanyaan refleksi yang sangat personal dan mendalam berdasarkan JAWABAN UJI PEMAHAMAN siswa. Pertanyaan harus memicu pemikiran kritis tentang bagaimana siswa akan menerapkan materi tersebut dalam kehidupan nyata atau pandangan pribadinya. Gunakan BAHASA INDONESIA BAKU (EYD) yang sangat ramah, suportif, dan memotivasi." 
                },
                { 
                    role: "user", 
                    content: `Berdasarkan jawaban siswa berikut, buatlah 5 pertanyaan refleksi unik (essay) yang akan membantu siswa memproses pemahamannya lebih dalam. 
                    
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
            "Apa hal terpenting yang kamu pelajari dari materi ini?",
            "Bagaimana kamu akan menerapkan ilmu ini dalam kehidupan sehari-hari?",
            "Bagian mana yang menurutmu paling menarik untuk dipelajari lebih lanjut?",
            "Apa kesulitan yang kamu hadapi saat memahami materi ini?",
            "Apa target belajarmu selanjutnya setelah menguasai topik ini?"
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
            { role: "system", content: "Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berstandar HOTS (Higher Order Thinking Skills). OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID." },
            { role: "user", content: `Buat TEPAT ${amount} buah soal pilihan ganda dari TP: ${JSON.stringify(objectivesArray)}` }
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
            { role: "system", content: "Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berdasarkan materi pembelajaran berstandar HOTS. OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID." },
            { role: "user", content: `Buat TEPAT ${amount} buah soal pilihan ganda dari materi: ${materialContent.substring(0, 20000)}` }
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

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness,
    analyzeHabits,
    generateBankSoal,
    generateBankSoalFromMaterial,
    analyzeUnderstanding,
    generateLearningMaterial,
    analyzeCompetency,
    requestWithFallback,
    cleanJson
};
