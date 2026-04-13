const axios = require('axios');
const ChatLog = require('../models/ChatLog');

// Configuration
const AI_API_KEY = (process.env.AI_API_KEY || "").replace(/\s/g, "");
const AI_MODEL = process.env.AI_MODEL || "google/gemma-3-27b-it:free";
const API_URL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1/chat/completions";

// Daftar fallback model jika model utama gagal atau rate-limited
const FALLBACK_MODELS = [
    AI_MODEL,
    "google/gemma-4-31b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openrouter/free"
];

function getHeaders() {
    return {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://litra-ai.railway.app",
        "X-Title": "Litra-AI"
    };
}

// Helper: request dengan fallback model otomatis
async function requestWithFallback(payload, retryDelay = 3000) {
    let lastError;
    for (const model of FALLBACK_MODELS) {
        try {
            const res = await axios.post(API_URL, { ...payload, model }, { headers: getHeaders(), timeout: 30000 });
            if (res.data.choices && res.data.choices[0]) return res;
        } catch (e) {
            const status = e.response?.status;
            const errMsg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
            console.warn(`[AI] Model "${model}" gagal (${status || e.code}): ${errMsg}`);
            lastError = e;
            // Jika rate limit, tunggu sebentar sebelum coba model berikutnya
            if (status === 429) await new Promise(r => setTimeout(r, retryDelay));
        }
    }
    throw lastError || new Error("Semua model AI tidak dapat dijangkau.");
}

/**
 * Generate AI Response menggunakan OpenRouter Endpoint
 */
async function generateResponse(username, question, stage, materialContext, chatHistory, selectedMaterial = '', teacherName = 'Guru') {
    try {
        const systemInstructionText = `Kamu adalah NARA-AI, Asisten ${teacherName}. Tugasmu adalah membantu siswa membahas materi: "${selectedMaterial}".
Jika ada siswa yang menanyakan kenapa namamu NARA-AI, kamu harus menjawab bahwa Pak Nandar terinspirasi dengan NARA GEMILANG Siswa SMP Negeri 1 Balikpapan.

PENTING: Jika siswa bertanya atau memancing diskusi di luar konteks materi terpilih ("${selectedMaterial}") atau materi pendukungnya, kamu WAJIB menjawab HANYA dengan kalimat ini: "Maaf saya dimarahin pak nandar jika membahas tidak sesuai materi."
Jangan menambahkan kalimat lain jika konteksnya sudah keluar dari materi.
Kamu masih boleh merespons ramah terhadap sapaan awal (misal: "Halo", "Selamat pagi"), tetapi jika obrolan berlanjut ke topik di luar materi, gunakan HANYA kalimat penolakan tersebut.

SIKAP: Suportif, jangan beri jawaban langsung, pandu siswa berpikir. Gunakan analogi-analogi yang mudah dipahami oleh siswa.
WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD) SEHINGGA MUDAH DIMENGERTI OLEH SISWA INDONESIA.
KONTEKS: ${materialContext}
TAHAP: ${stage}`;

        // Format pesan standar OpenAI yang juga digunakan oleh OpenRouter
        let messages = [
            { role: "system", content: systemInstructionText }
        ];

        // Format history dengan benar (role: assistant atau user)
        const formattedHistory = chatHistory.slice(-6).map(msg => ({
            role: (msg.role === 'bot' || msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
            content: msg.content || ""
        }));

        messages = messages.concat(formattedHistory);

        // Tambahkan pesan user terbaru
        messages.push({
            role: 'user',
            content: question
        });

        const payload = {
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024,
        };

        const response = await requestWithFallback(payload);
        const aiReply = response.data.choices[0].message.content;

        // Logging (Tetap sama)
        try {
            await ChatLog.create({ username, role: 'bot', content: aiReply, model: AI_MODEL, metadata: { stage, selectedMaterial } });
            await ChatLog.create({ username, role: 'user', content: question, metadata: { stage, selectedMaterial } });
        } catch (e) { console.warn('Logging failed'); }

        return aiReply;

    } catch (error) {
        const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('--- AI SERVICE ERROR ---');
        console.error('Detail:', detail);
        throw new Error(`AI Error: ${detail}`);
    }
}

/**
 * Helper untuk format JSON dari AI
 */
function cleanJson(text) {
    if (!text) return "";
    let str = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Attempt to extract from markdown first
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let extracted = str;
    if (match) {
        extracted = match[1].trim();
    } else {
        // Fallback: finding first bracket or brace
        const startObj = str.indexOf('{');
        const startArr = str.indexOf('[');

        if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
            const endObj = str.lastIndexOf('}');
            if (endObj !== -1) extracted = str.substring(startObj, endObj + 1);
        } else if (startArr !== -1) {
            const endArr = str.lastIndexOf(']');
            if (endArr !== -1) extracted = str.substring(startArr, endArr + 1);
        } else {
            extracted = str.replace(/```json/gi, "").replace(/```/g, "").trim();
        }
    }

    // Perbaikan darurat jika AI menggunakan kutip tunggal di luar standar JSON murni
    if (extracted.startsWith("['") || extracted.includes("':") || extracted.includes(", '") || extracted.includes("{'")) {
        try {
            // Mencoba me-replace kutip tunggal yang membungkus key/value agar menjadi kutip ganda
            // Warning: ini regex kasar, tapi darurat untuk format AI
            const fixedStr = extracted
                .replace(/'([^']*)'\s*:/g, '"$1":') // Fix keys: 'key': -> "key":
                .replace(/:\s*'([^']*)'/g, ': "$1"') // Fix values: : 'value' -> : "value"
                .replace(/\[\s*'([^']*)'/g, '["$1"') // Fix array start: ['value' -> ["value"
                .replace(/,\s*'([^']*)'/g, ', "$1"') // Fix array next: , 'value' -> , "value"
                .replace(/'\s*\]/g, '"]');           // Fix array end: ' ] -> "]

            // Cek apakah string hasil sudah valid JSON
            JSON.parse(fixedStr);
            return fixedStr;
        } catch (e) {
            // Jika regex gagal parse, kembalikan versi aslinya
        }
    }

    return extracted;
}

/**
 * Generate 5 reflection questions
 */
async function generateReflections(username, chatHistory) {
    try {
        const historyText = chatHistory.map(m => `${m.role}: ${m.content || m.text}`).join('\n');

        const payload = {
            messages: [
                { role: "system", content: "Kamu adalah AI yang merumuskan pertanyaan refleksi siswa. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD) SEHINGGA MUDAH DIMENGERTI OLEH SISWA INDONESIA." },
                { role: "user", content: `Buat 5 pertanyaan refleksi berdasarkan chat ini dalam format JSON array: ["q1", "q2", "q3", "q4", "q5"].\n\nPastikan bahasanya komunikatif, tidak kaku, dan tidak menggunakan istilah bahasa Inggris yang rumit.\n\nCHAT:\n${historyText}` }
            ]
        };

        const response = await requestWithFallback(payload);
        const text = response.data.choices[0].message.content;
        return JSON.parse(cleanJson(text));
    } catch (error) {
        console.error("Reflection Gen Error:", error.message);
        return ["Apa yang kamu pelajari?", "Apa yang sulit?", "Bagaimana perasaanmu?", "Apa targetmu?", "Ada pertanyaan lain?"];
    }
}

// Fungsi lainnya menggunakan pola yang sama
async function generateAssessment(username, reflectionAnswers, materialContext) {
    const payload = {
        model: AI_MODEL,
        messages: [
            { role: "system", content: "Kamu adalah AI spesialis pembuatan soal asesmen berformat ANBK (PISA-like). OUTPUT WAJIB BERUPA PURE JSON ARRAY YANG VALID BERISI TEPAT 20 SOAL. JANGAN LEBIH DARI 20 SOAL.\nWAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD) SEHINGGA MUDAH DIMENGERTI OLEH SISWA INDONESIA. HINDARI KATA-KATA SULIT/TERJEMAHAN KAKU." },
            { role: "user", content: `Buat TEPAT 20 soal pilihan ganda berdasarkan refleksi siswa dan utamanya berdasarkan materi berikut:\n\nMATERI:\n${materialContext}\n\nREFLEKSI:\n${JSON.stringify(reflectionAnswers)}\n\nFormat output WAJIB berbentuk JSON array of objects murni seperti ini:\n[{"question": "Pertanyaan", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Penjelasan", "type": "literasi"}]\n\nATURAN KETAT:\n1. JUMLAH SOAL HARUS TEPAT 20 (Dua Puluh).\n2. Soal, opsi jawaban, dan penjelasan WAJIB menggunakan Bahasa Indonesia baku dengan Ejaan Yang Disempurnakan (EYD) yang natural, mudah dipahami siswa Indonesia, dan tidak terlihat seperti hasil terjemahan mesin kaku.\n3. WAJIB GUNAKAN KUTIP GANDA (") UNTUK SETIAP KEY DAN VALUE STRING dalam JSON.\n4. Jangan tulis kata pengantar (markdown) apapun, langsung JSON array mulai dari [` }
        ],
        max_tokens: 4096,
        temperature: 0.4
    };

    let retries = 3;
    let delayMs = 4000;

    while (retries > 0) {
        try {
            const response = await requestWithFallback(payload);
            return JSON.parse(cleanJson(response.data.choices[0].message.content));
        } catch (e) {
            if (e.response && e.response.status === 429 && retries > 1) {
                console.warn(`[429 Rate Limit] Retrying Assessment Gen in ${delayMs}ms... (${retries - 1} attempts left)`);
                await new Promise(r => setTimeout(r, delayMs));
                delayMs *= 2; // Exponential backoff
                retries--;
            } else {
                console.error("Assessment Gen Error:", e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
                throw new Error("Gagal meracik soal karena kendala server AI (Error: " + (e.response ? e.response.status : e.message) + "). Silakan coba lagi nanti.");
            }
        }
    }
}

async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const payload = {
            messages: [
                { role: "system", content: "Kamu adalah sistem analis evaluasi siswa. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD) SEHINGGA MUDAH DIMENGERTI OLEH SISWA INDONESIA." },
                { role: "user", content: `Analisislah kesiapan siswa (hanya return format JSON object murni {ready: boolean, analysis: string, recommendation: string}): ${JSON.stringify(reflectionAnswers)}` }
            ]
        };
        const response = await requestWithFallback(payload);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Readiness Gen Error:", e.message);
        return { ready: true, analysis: "Gagal analisis", recommendation: "Cek manual" };
    }
}

async function analyzeHabits(username, habitAnswers) {
    try {
        const payload = {
            messages: [
                { role: "system", content: "Kamu adalah sistem analis perilaku siswa. Misi kamu adalah memonitor penerapan 7 Kebiasaan Hebat Anak Indonesia: bangun pagi, beribadah, berolahraga, makan sehat dan bergizi, gemar belajar, bermasyarakat, dan tidur cepat. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD) SEHINGGA MUDAH DIMENGERTI OLEH SISWA INDONESIA." },
                { role: "user", content: `Analisislah jawaban esai siswa berikut yang berkorespondensi dengan 7 Kebiasaan tersebut dan tentukan seberapa baik penerapannya (kembalikan format JSON object murni {score: number_1_to_100, analysis: string_feedback, details: [array_of_strings_per_habit_feedback]}): ${JSON.stringify(habitAnswers)}` }
            ]
        };
        const response = await requestWithFallback(payload);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Habit Analysis Error:", e.message);
        return { score: 0, analysis: "Gagal memproses analisis", details: [] };
    }
}

async function generateBankSoal(objectivesArray, amount = 10, indicatorType = '', indicatorValue = '') {
    const indicatorContext = indicatorType && indicatorValue ? `\n\nSyarat Tambahan Soal:\n- Fokus Tipe Soal adalah ${indicatorType.toUpperCase()}\n- WAJIB menerapkan Indikator Soal: ${indicatorValue}` : '';
    const payload = {
        messages: [
            { role: "system", content: "Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda). OUTPUT WAJIB BERUPA TEKS DENGAN DELIMITER ||| (TIGA GARIS LURUS). JANGAN GUNAKAN JSON ATAU MARKDOWN TABLE.\nWAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD) SEHINGGA MUDAH DIMENGERTI OLEH SISWA INDONESIA. HINDARI KATA-KATA SULIT/TERJEMAHAN KAKU." },
            { role: "user", content: `Buat TEPAT ${amount} buah soal pilihan ganda berdasarkan daftar Tujuan Pembelajaran berikut ini:\n\n${JSON.stringify(objectivesArray)}${indicatorContext}\n\nFormat output WAJIB berupa teks biasa, di mana SETIAP BARIS menyajikan tepat SATU soal utuh beserta 8 bagiannya yang dipisahkan oleh ||| seperti format berikut:\n[PERTANYAAN STIMULUS] Spasi [PERTANYAAN UTAMA] ||| Opsi A ||| Opsi B ||| Opsi C ||| Opsi D ||| Kunci_Jawaban (Hanya huruf A, B, C, atau D) ||| Pembahasan ||| Tipe (literasi atau numerasi)\n\nATURAN KETAT DAN MUTLAK:\n1. JUMLAH SOAL HARUS TEPAT ${amount} BARIS TEKS. Jika jumlah Tujuan Pembelajaran yang diberikan lebih sedikit dari ${amount}, kamu WAJIB MENDISTRIBUSIKAN PEMBUATAN SOAL sehingga total hasil akhir tetap berjumlah persis ${amount} soal! Jangan pernah menghasilkan kurang dari ${amount} soal.\n2. PENTING: Setiap soal WAJIB diawali dengan "Pertanyaan Stimulus" BERUPA STUDI KASUS SEDERHANA (seperti cerita pendek aplikatif, masalah kehidupan nyata sederhana, atau fakta pendukung). "Pertanyaan Stimulus" INI HARUS DIGABUNG DAN BERADA DI DALAM KOLOM SOAL YANG SAMA DENGAN PERTANYAAN UTAMA (sebelum tanda ||| pertama).\n3. Jangan gunakan enter/garis baru di dalam kalimat soal atau di dalam kalimat pembahasan. Satu baris mewakili 1 nomor soal secara penuh! Gunakan spasi untuk memisahkan stimulus dengan pertanyaan utama.\n4. Jangan tulis kata pengantar, header tulisan apapun, atau format tabel markdown. Output harus 100% langsung dimulai dari baris soal ke-1 yang dipisahkan |||.\n5. Kunci_Jawaban WAJIB HANYA 1 HURUF KAPITAL tanpa tanda baca: A, B, C, atau D.` }
        ],
        max_tokens: 4096,
        temperature: 0.5
    };

    let retries = 3;
    let delayMs = 3000;

    while (retries > 0) {
        try {
            const response = await requestWithFallback(payload);
            const resultText = response.data.choices[0].message.content;

            const lines = resultText.split('\n').map(l => l.trim()).filter(l => l.length > 10 && l.includes('|||'));
            const parsedQuestions = [];

            for (const line of lines) {
                const parts = line.split('|||').map(p => p.trim());
                if (parts.length >= 8) {
                    let correctIndex = 0;
                    const ans = parts[5].toUpperCase();
                    if (ans === 'B') correctIndex = 1;
                    else if (ans === 'C') correctIndex = 2;
                    else if (ans === 'D') correctIndex = 3;

                    parsedQuestions.push({
                        question: parts[0],
                        options: [parts[1], parts[2], parts[3], parts[4]],
                        correct: correctIndex,
                        explanation: parts[6],
                        type: parts[7].toLowerCase().includes('num') ? 'numerasi' : 'literasi'
                    });
                }
            }

            if (parsedQuestions.length === 0) {
                throw new Error("Format output AI tidak dapat diparsing menggunakan delimiter |||");
            }

            return parsedQuestions;
        } catch (e) {
            if (retries > 1) {
                console.warn(`[Retry] Bank Soal Gen error: ${e.message}. Retrying in ${delayMs}ms... (${retries - 1} attempts left)`);
                await new Promise(r => setTimeout(r, delayMs));
                if (e.response && e.response.status === 429) delayMs *= 2;
                retries--;
            } else {
                console.error("Generate Bank Soal Error:", e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
                throw new Error("Gagal membuat soal dari AI: " + (e.response ? e.response.status : e.message));
            }
        }
    }
}

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness,
    analyzeHabits,
    generateBankSoal
};
