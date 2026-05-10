const axios = require('axios');
const ChatLog = require('../models/ChatLog');

// Configuration
// Memungkinkan banyak API key dipisahkan dengan koma di Railway (contoh: key1,key2,key3)
const RAW_API_KEYS = (process.env.AI_API_KEYS || process.env.AI_API_KEY || "").trim();
const API_KEYS = RAW_API_KEYS.split(',').map(k => k.trim()).filter(k => k.length > 0);

const AI_MODEL = (process.env.AI_MODEL || "llama-3.3-70b-versatile").trim();
const API_URL = (process.env.AI_BASE_URL || "https://api.groq.com/openai/v1/chat/completions").trim();

let currentKeyIndex = 0;

// Daftar fallback model jika model utama gagal atau rate-limited
const FALLBACK_MODELS = [
    AI_MODEL,
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768"
].filter((v, i, a) => v && a.indexOf(v) === i); // Unik dan tidak kosong

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
    // Header tambahan khusus OpenRouter (diabaikan oleh Google AI Studio)
    if (API_URL.includes('openrouter')) {
        headers["HTTP-Referer"] = "https://litra-ai.railway.app";
        headers["X-Title"] = "Litra-AI";
    }
    return headers;
}

// Helper: request dengan fallback model otomatis
async function requestWithFallback(payload, retryDelay = 2000) {
    let lastError;
    for (const model of FALLBACK_MODELS) {
        try {
            const res = await axios.post(API_URL, { ...payload, model }, { headers: getHeaders(), timeout: 60000 });
            if (res.data.choices && res.data.choices[0]) return res;
        } catch (e) {
            const status = e.response?.status;
            const errorDetail = e.response?.data?.error?.message || e.response?.data?.error || e.message;
            console.warn(`[AI] Model "${model}" gagal (${status || 'Err'}): ${JSON.stringify(errorDetail)}`);
            
            // Jika 400 (Bad Request), kemungkinan payload/prompt bermasalah, jangan lanjut fallback jika sama
            if (status === 400) {
                lastError = new Error(`AI Bad Request (400): ${JSON.stringify(errorDetail)}`);
                continue; // Coba model lain tetap, siapa tahu model lain lebih toleran
            }
            
            lastError = e;
            if (status === 429) await new Promise(r => setTimeout(r, retryDelay));
        }
    }
    const finalErrorMsg = lastError.response?.data?.error?.message || lastError.message;
    throw new Error(finalErrorMsg);
}

/**
 * Generate AI Response menggunakan OpenRouter Endpoint
 */
async function generateResponse(username, question, stage, materialContext, chatHistory, selectedMaterial = '', teacherName = 'Guru', studentName = '') {
    try {
        const systemInstructionText = `Kamu adalah NARA-AI, Asisten ${teacherName}. Tugasmu adalah membantu siswa membahas materi: "${selectedMaterial}".
Jika ada siswa yang menanyakan kenapa namamu NARA-AI, kamu harus menjawab bahwa Pak Nandar terinspirasi dengan NARA GEMILANG Siswa SMP Negeri 1 Balikpapan.

PENTING: Gunakan teks yang ada di bagian "KONTEKS" di bawah ini sebagai sumber utama informasi. Kamu harus memahami setiap detail dari materi tersebut agar bisa menjawab pertanyaan siswa dengan akurat berdasarkan materi yang mereka buka.
Jika siswa bertanya atau memancing diskusi di luar konteks materi terpilih ("${selectedMaterial}") atau materi pendukungnya, kamu WAJIB menjawab HANYA dengan kalimat ini: "Maaf saya ditugaskan pak nandar membahas sesuai materi yang kamu buka, Sekarang Tanyakan yang berkaitan dengan materi ${selectedMaterial}" Agar bisa lanjut ke tahap Berikutnya
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
- KECUALI: Jika siswa memintanya secara eksplisit atau mengklik tombol "Sudah Paham" (konfirmasi pemahaman), kamu WAJIB memberikan SATU pertanyaan uji pemahaman yang kritis dan menantang berkaitan langsung dengan materi "${selectedMaterial}" (dari bagian KONTEKS) serta berdasarkan penjelasan terakhir yang baru saja kamu berikan.
- CATATAN: Jika siswa mengirimkan pesan yang diawali dengan "Saya Sudah Siap diuji...", anggap itu sebagai tanda bahwa siswa sudah siap diuji. Kamu harus LANGSUNG memberikan soal tersebut TANPA kalimat pengantar seperti "Baik, mari kita uji" atau "Saya siap diuji". Langsung tuliskan pertanyaannya.
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
                { role: "system", content: "Kamu adalah AI Pakar Pedagogi yang merumuskan pertanyaan refleksi personal. Gunakan BAHASA INDONESIA BAKU (EYD) yang ramah dan suportif." },
                {
                    role: "user", content: `Analisis riwayat chat antara NARA-AI dan siswa berikut ini. 
Berdasarkan topik yang mereka diskusikan, buatlah 5 pertanyaan refleksi yang dipersonalisasi:
1. Tanyakan apa poin terpenting yang siswa tangkap dari diskusi tersebut.
2. Tanyakan bagian materi spesifik yang paling menarik baginya (sebutkan topiknya jika ada dalam chat).
3. Tanyakan bagian yang masih membuatnya ragu atau ingin dipelajari lebih lanjut.
4. Tanyakan bagaimana ia akan menerapkan ilmu tersebut.
5. Tanyakan satu pertanyaan kritis yang menantang pemahamannya terhadap materi yang dibahas.

FORMAT JAWABAN: WAJIB JSON array murni ["q1", "q2", "q3", "q4", "q5"]. Jangan ada teks pendahuluan.

RIWAYAT CHAT:
${historyText}`
                }
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
                { role: "user", content: `Analisislah kesiapan siswa (hanya return format JSON object murni {ready: boolean, score: number, analysis: string, recommendation: string}): ${JSON.stringify(reflectionAnswers)}` }
            ]
        };
        const response = await requestWithFallback(payload);
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Readiness Gen Error:", e.message);
        return { ready: true, score: 70, analysis: "Gagal analisis", recommendation: "Cek manual" };
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

async function generateBankSoal(objectivesArray, amount = 10, indicatorType = '', indicatorValue = '', penalaranLogis = 3) {
    const indicatorContext = indicatorType && indicatorValue ? `\n- Fokus Tipe Soal adalah ${indicatorType.toUpperCase()}\n- WAJIB menerapkan Indikator Soal: ${indicatorValue}` : '';
    const penalaranContext = `\n- WAJIB memiliki Tingkat Penalaran Logis: Level ${penalaranLogis} dari 5 (Keterangan: Level 1 = Logika Sederhana/Fakta Eksplisit, Level 2 = Sebab-Akibat/Pemahaman, Level 3 = Analisis Pola/Struktur, Level 4 = Evaluasi Kritis/HOTS, Level 5 = Logika Kompleks/Sintesis Tinggi/Pemecahan Teka-Teki).`;
    
    const payload = {
        messages: [
            { role: "system", content: "Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berstandar HOTS (Higher Order Thinking Skills). Semua soal harus dirancang untuk menguji analisis, evaluasi, dan logika kritis (C4-C6), bukan ingatan hafalan belaka. OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD). HINDARI KATA-KATA SULIT/TERJEMAHAN KAKU." },
            { role: "user", content: `Buat TEPAT ${amount} buah soal pilihan ganda berdasarkan daftar Tujuan Pembelajaran berikut ini:\n\n${JSON.stringify(objectivesArray)}\n\nSyarat Tambahan Soal:${indicatorContext}${penalaranContext}\n\nFormat output WAJIB berbentuk JSON array of objects dengan struktur berikut:\n[\n  {\n    "question": "[STIMULUS BERUPA STUDI KASUS/CERITA] [PERTANYAAN UTAMA]",\n    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],\n    "correct": 0,\n    "explanation": "Penjelasan mengapa jawaban tersebut benar",\n    "type": "literasi atau numerasi"\n  }\n]\n\nATURAN KETAT DAN MUTLAK:\n1. JUMLAH SOAL HARUS TEPAT ${amount} OBJEK DALAM ARRAY.\n2. PENTING: Setiap soal WAJIB diawali dengan "Stimulus" berupa studi kasus sederhana, cerita, atau fakta pendukung yang relevan sebelum masuk ke pertanyaan inti. Gabungkan stimulus dan pertanyaan ke dalam field "question".\n3. Nilai "correct" adalah INDEX (0 untuk A, 1 untuk B, 2 untuk C, 3 untuk D).\n4. Gunakan Bahasa Indonesia baku yang natural dan mudah dipahami siswa.\n5. Jangan tulis kata pengantar atau penjelasan di luar JSON. Langsung berikan JSON array.` }
        ],
        max_tokens: 4096,
        temperature: 0.6
    };

    let retries = 3;
    let delayMs = 3000;

    while (retries > 0) {
        try {
            const response = await requestWithFallback(payload);
            const resultText = response.data.choices[0].message.content;
            const cleanText = cleanJson(resultText);
            const parsedQuestions = JSON.parse(cleanText);

            if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                throw new Error("AI tidak menghasilkan array soal yang valid.");
            }

            return parsedQuestions.map(q => ({
                question: q.question || "Pertanyaan kosong",
                options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"],
                correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3 ? q.correct : 0,
                explanation: q.explanation || "Pembahasan belum tersedia.",
                type: String(q.type || "").toLowerCase().includes('num') ? 'numerasi' : 'literasi'
            }));
        } catch (e) {
            if (retries > 1) {
                console.warn(`[Retry] Bank Soal Gen error: ${e.message}. Retrying in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                delayMs *= 2;
                retries--;
            } else {
                console.error("Generate Bank Soal Error:", e.message);
                throw new Error("Gagal membuat soal dari AI: " + e.message);
            }
        }
    }
}

async function generateBankSoalFromMaterial(materialContent, amount = 10, indicatorType = '', indicatorValue = '', penalaranLogis = 3) {
    const indicatorContext = indicatorType && indicatorValue ? `\n- Fokus Tipe Soal adalah ${indicatorType.toUpperCase()}\n- WAJIB menerapkan Indikator Soal: ${indicatorValue}` : '';
    const penalaranContext = `\n- WAJIB memiliki Tingkat Penalaran Logis: Level ${penalaranLogis} dari 5 (Keterangan: Level 1 = Logika Sederhana/Fakta Eksplisit, Level 2 = Sebab-Akibat/Pemahaman, Level 3 = Analisis Pola/Struktur, Level 4 = Evaluasi Kritis/HOTS, Level 5 = Logika Kompleks/Sintesis Tinggi/Pemecahan Teka-Teki).`;
    const safeContent = materialContent ? materialContent.substring(0, 30000) : "";
    const safeAmount = Math.min(parseInt(amount) || 10, 20); // Batasi maks 20 soal per AI call agar tidak 400/timeout
    
    const payload = {
        messages: [
            { role: "system", content: "Kamu adalah AI pembuat lembar soal objektif (Pilihan Ganda) berdasarkan materi pembelajaran berstandar HOTS (Higher Order Thinking Skills). Semua soal harus dirancang untuk menguji analisis, evaluasi, dan logika kritis (C4-C6), bukan ingatan hafalan belaka. OUTPUT WAJIB BERUPA JSON ARRAY YANG VALID. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU DENGAN EJAAN YANG DISEMPURNAKAN (EYD). HINDARI KATA-KATA SULIT/TERJEMAHAN KAKU." },
            { role: "user", content: `Buat TEPAT ${safeAmount} buah soal pilihan ganda berdasarkan materi berikut ini:\n\n${safeContent}\n\nSyarat Tambahan Soal:${indicatorContext}${penalaranContext}\n\nFormat output WAJIB berbentuk JSON array of objects dengan struktur berikut:\n[\n  {\n    "question": "[STIMULUS BERUPA STUDI KASUS/CERITA] [PERTANYAAN UTAMA]",\n    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],\n    "correct": 0,\n    "explanation": "Penjelasan mengapa jawaban tersebut benar",\n    "type": "literasi atau numerasi"\n  }\n]\n\nATURAN KETAT DAN MUTLAK:\n1. JUMLAH SOAL HARUS TEPAT ${safeAmount} OBJEK DALAM ARRAY.\n2. PENTING: Setiap soal WAJIB diawali dengan "Stimulus" berupa studi kasus sederhana, cerita, atau fakta pendukung yang relevan dari materi. Gabungkan stimulus dan pertanyaan ke dalam field "question".\n3. Nilai "correct" adalah INDEX (0 untuk A, 1 untuk B, 2 untuk C, 3 untuk D).\n4. Gunakan Bahasa Indonesia baku yang natural dan mudah dipahami siswa.\n5. Jangan tulis kata pengantar atau penjelasan di luar JSON. Langsung berikan JSON array.` }
        ],
        max_tokens: 4000,
        temperature: 0.6
    };

    let retries = 3;
    let delayMs = 3000;

    while (retries > 0) {
        try {
            const response = await requestWithFallback(payload);
            const resultText = response.data.choices[0].message.content;
            const cleanText = cleanJson(resultText);
            const parsedQuestions = JSON.parse(cleanText);

            if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                throw new Error("AI tidak menghasilkan array soal yang valid.");
            }

            return parsedQuestions.map(q => ({
                question: q.question || "Pertanyaan kosong",
                options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"],
                correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3 ? q.correct : 0,
                explanation: q.explanation || "Pembahasan belum tersedia.",
                type: String(q.type || "").toLowerCase().includes('num') ? 'numerasi' : 'literasi'
            }));
        } catch (e) {
            if (retries > 1) {
                console.warn(`[Retry] Bank Soal Gen from Material error: ${e.message}. Retrying in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                delayMs *= 2;
                retries--;
            } else {
                console.error("Generate Bank Soal from Material Error:", e.message);
                throw new Error("Gagal membuat soal dari AI: " + e.message);
            }
        }
    }
}

/**
 * Analyze student's comprehension answer and return a score 0-100
 * The AI returns a plain text response with [SKOR: X] at the end.
 */
async function analyzeUnderstanding(username, originalExplanation, studentAnswer) {
    try {
        const payload = {
            messages: [
                {
                    role: "system",
                    content: "Kamu adalah evaluator pemahaman siswa yang adil dan teliti. Tugasmu hanya menilai jawaban siswa terhadap pertanyaan uji pemahaman. WAJIB MENGGUNAKAN BAHASA INDONESIA BAKU (EYD) yang ramah dan suportif."
                },
                {
                    role: "user",
                    content: `Konteks penjelasan sebelumnya dari NARA-AI:\n"${originalExplanation}"\n\nJawaban siswa atas pertanyaan uji pemahaman:\n"${studentAnswer}"\n\nBerikan feedback singkat yang suportif (2-3 kalimat) terhadap jawaban siswa tersebut, lalu nilai pemahamannya dari 0 hingga 100. Akhiri responmu HANYA dengan satu baris berformat tepat: [SKOR: X] (ganti X dengan angka).`
                }
            ],
            temperature: 0.3,
            max_tokens: 512
        };
        const response = await requestWithFallback(payload);
        return response.data.choices[0].message.content;
    } catch (e) {
        console.error("analyzeUnderstanding Error:", e.message);
        return "Terima kasih atas jawabanmu! Terus semangat belajar ya. [SKOR: 50]";
    }
}

async function generateLearningMaterial(tujuanPembelajaran, kelas, sumberGambar = 'AI', jumlahTujuan = 3, jumlahHalaman = 3, judul = '') {
    const minWords = (parseInt(jumlahHalaman) || 1) * 600;
    const sectionCount = (parseInt(jumlahHalaman) || 1) * 2 + 1;
    const prompt = `Kamu adalah AI Pakar Pedagogi dan Guru Kreatif Kurikulum Merdeka yang ahli dalam merancang materi pembelajaran berkualitas tinggi, interaktif, dan premium.
Tugasmu adalah menyusun materi pembelajaran lengkap, sangat mendalam, komprehensif, dan menarik yang cocok untuk siswa tingkat/kelas: "${kelas}".

Materi harus disusun berdasarkan indikator:
- Judul Materi Pembelajaran: "${judul}" (Wajib gunakan judul ini sebagai tajuk utama/heading 1 materi Anda)
- Tujuan Pembelajaran Utama: "${tujuanPembelajaran}"
- Jumlah Rincian Tujuan Pembelajaran: ${jumlahTujuan} (Harap pecah dan rumuskan tepat ${jumlahTujuan} tujuan pembelajaran khusus yang terperinci di dalam materi)
- Target Panjang Materi: Setara dengan tepat ${jumlahHalaman} Halaman cetak A4.
- ATURAN KETAT PANJANG KONTEN: Karena target panjang materi adalah ${jumlahHalaman} halaman cetak A4, maka materi tersebut wajib memiliki minimal ${sectionCount} sub-bab/sub-heading pembahasan materi yang diuraikan secara sangat lengkap, detail, dan mendalam. Jumlah kata keseluruhan materi HARUS mencapai MINIMAL ${minWords} kata! Jangan membuat materi yang pendek, singkat, ringkas, atau dirangkum. Tulis paragraf yang panjang, teoretis, kaya informasi, serta dilengkapi contoh studi kasus konkret untuk setiap sub-heading.
- Sumber Gambar: "${sumberGambar}"

PENTING - Gaya Penulisan Konten:
1. Materi harus sangat lengkap, berbobot, terperinci, terstruktur dengan sub-heading yang jelas, mudah dipahami siswa, serta memikat secara visual. Jangan buat materi yang singkat atau malas. Berikan materi yang kaya informasi dan penjelasannya detail.
2. Gunakan Bahasa Indonesia baku sesuai Ejaan Yang Disempurnakan (EYD) yang santun dan menarik bagi siswa.
3. Struktur materi wajib meliputi:
   - Judul Materi (menarik & edukatif)
   - Pendahuluan (motivasi, apa relevansi materi ini dalam kehidupan sehari-hari)
   - Pembahasan Utama (jelaskan konsep-konsep kunci dengan contoh nyata dan analogi yang seru)
   - Bagian Penting (gunakan info box atau sorotan teks)
   - Ringkasan / Kesimpulan

PENTING - Desain Visual HTML (Gaya Premium):
- Tulis materi dalam bentuk kode HTML murni yang rapi (TANPA menyertakan tag <html>, <head>, atau <body> utama, cukup elemen-elemen kontennya saja yang dibungkus dalam sebuah <div style="...">).
- Gunakan style inline untuk mempercantik tampilan elemen:
  - Gunakan card bergaya modern, glassmorphism, atau border tipis yang estetik: <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
  - Gunakan warna-warna harmonis seperti biru cerah, hijau segar, atau orange hangat untuk header (contoh: <h3 style="color: var(--primary); margin-top: 1.5rem; margin-bottom: 0.75rem;">).
  - Gunakan blockquote menarik untuk highlight: <blockquote style="border-left: 4px solid var(--primary); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: var(--text-secondary);">

Penyisipan Gambar (Sesuai Isi & Kontekstual):
- JANGAN menumpuk atau mengelompokkan semua gambar di satu tempat (misalnya di awal atau akhir saja).
- Sisipkan tepat 2 atau 3 gambar secara menyebar dan berurutan, langsung diletakkan TEPAT di bawah paragraf, sub-heading, atau kalimat spesifik yang sedang membahas topik gambar tersebut.
- Gunakan tag <img> dengan style inline yang rapi:
  <img src="URL_GAMBAR" style="display: block; margin: 1.5rem auto; max-width: 100%; width: 600px; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" alt="Deskripsi Gambar">
  <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); font-style: italic; margin-top: -1rem; margin-bottom: 1.5rem;">[Deskripsi/Caption Gambar Relevan yang menjelaskan isi paragraf di atasnya]</p>
- Aturan URL_GAMBAR berdasarkan Sumber Gambar ("${sumberGambar}"):
  - Jika sumberGambar adalah "AI" atau "Kedua-duanya", gunakan generator gambar Pollinations AI dengan prompt bahasa Inggris yang sangat detail, artistik, dan relevan dengan paragraf tersebut (contoh: jika membahas stomata, gunakan: https://image.pollinations.ai/prompt/detailed_botany_illustration_of_leaf_stomata_microscopic_view?model=flux&enhance=true&width=800&height=500&nologo=true)
  - Jika sumberGambar adalah "Internet" atau "Kedua-duanya", gunakan URL pencari gambar LoremFlickr dengan kata kunci bahasa Inggris yang sangat spesifik dan relevan dengan bahasan paragraf tersebut (contoh: jika membahas kloroplas, gunakan: https://loremflickr.com/800/500/chloroplast atau jika membahas sel tumbuhan gunakan: https://loremflickr.com/800/500/plant_cell)
  - JANGAN gunakan kata kunci umum atau source.unsplash.com karena domain tersebut sudah mati. Gunakan loremflickr.com untuk gambar internet yang andal.

Penyisipan Video Pendukung (YouTube Embedded):
- Sisipkan tepat 1 buah video edukasi YouTube yang sangat relevan dengan materi ini di bagian tengah atau menjelang akhir materi.
- Agar video DIJAMIN selalu aktif, dapat diputar, dan diizinkan oleh YouTube untuk di-embed (tidak menampilkan error "This video is unavailable"), pilih salah satu ID video dari pemetaan resmi di bawah ini yang paling relevan dengan materi Anda:
  1. Kategori SAINS / IPA (Fisika, Biologi, Kimia, Fotosintesis, Sel, dsb.): Gunakan ID "pS1f9R7qMOM" (contoh URL: https://www.youtube.com/embed/pS1f9R7qMOM)
  2. Kategori MATEMATIKA / ALJABAR (Angka, Rumus, Numerasi, Geometri, dsb.): Gunakan ID "M3C_xM7-4rY" (contoh URL: https://www.youtube.com/embed/M3C_xM7-4rY)
  3. Kategori BAHASA INDONESIA / LITERASI (Cerita, Puisi, Menulis, dsb.): Gunakan ID "3W_vX4_8oU8" (contoh URL: https://www.youtube.com/embed/3W_vX4_8oU8)
  4. Kategori IPS / SEJARAH / GEOGRAFI (Budaya, Bumi, Sosial, dsb.): Gunakan ID "8C6sUu1_Gf0" (contoh URL: https://www.youtube.com/embed/8C6sUu1_Gf0)
  5. Kategori BAHASA INGGRIS (Grammar, Vocabulary, dsb.): Gunakan ID "Kz_sX7T8U1k" (contoh URL: https://www.youtube.com/embed/Kz_sX7T8U1k)
  6. Kategori UMUM / MOTIVASI / METODE BELAJAR (Lain-lain): Gunakan ID "b_F8M8h_vGk" (contoh URL: https://www.youtube.com/embed/b_F8M8h_vGk)
- JANGAN PERNAH menebak ID video secara acak di luar daftar di atas. Pilih kategori yang paling mendekati materi Anda dan gunakan URL persis di atas untuk dimasukkan ke dalam tag iframe berikut:
  <iframe src="URL_EMBED_YOUTUBE" style="display: block; margin: 1.5rem auto; width: 100%; max-width: 700px; height: 400px; border-radius: 12px; border: none; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" allowfullscreen></iframe>
  <p style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); font-style: italic; margin-top: -1rem; margin-bottom: 2rem;">[Video Pendukung: Tonton video edukatif ini untuk memperdalam pemahaman materi]</p>

Keluaran (Output) WAJIB berupa teks HTML murni dari elemen terluarnya. Jangan menyertakan tanda kutip markdown \`\`\`html di awal dan di akhir, cukup teks HTML murni.`;

    const safeMaxTokens = Math.min(3000 + (parseInt(jumlahHalaman) || 1) * 1200, 8000);
    const payload = {
        messages: [
            { role: "system", content: "Kamu adalah AI asisten pembuat materi pembelajaran HTML interaktif dan estetik yang selalu menulis materi sangat panjang, detail, mendalam, dan lengkap sesuai dengan jumlah halaman yang ditargetkan." },
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: safeMaxTokens
    };

    const response = await requestWithFallback(payload);
    let htmlContent = response.data.choices[0].message.content;
    
    // Clean if AI wrapped it in markdown code block anyway
    if (htmlContent.startsWith("```")) {
        htmlContent = htmlContent.replace(/^```html\s*/i, "").replace(/```$/, "").trim();
    }
    
    return htmlContent;
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
    requestWithFallback,
    cleanJson
};
