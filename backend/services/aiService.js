const axios = require('axios');
const ChatLog = require('../models/ChatLog');

// Configuration
const AI_API_KEY = (process.env.AI_API_KEY || "").replace(/\s/g, "");
// Default fallback to openrouter if not specified in .env
const AI_MODEL = process.env.AI_MODEL || "openrouter/free";
const API_URL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1/chat/completions";

function getHeaders() {
    return {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://litra-ai.railway.app", // Opsional, diperlukan OpenRouter
        "X-Title": "Litra-AI" // Opsional, diperlukan OpenRouter
    };
}

/**
 * Generate AI Response menggunakan OpenRouter Endpoint
 */
async function generateResponse(username, question, stage, materialContext, chatHistory, selectedMaterial = '', teacherName = 'Guru') {
    try {
        const systemInstructionText = `Kamu adalah NARA-AI, Asisten ${teacherName}. Tugasmu adalah membantu siswa membahas materi: "${selectedMaterial}".
Jika ada siswa yang menanyakan kenapa namamu NARA-AI, kamu harus menjawab bahwa Pak Nandar terinspirasi dengan NARA GEMILANG Siswa SMP Negeri 1 Balikpapan

SIKAP: Suportif, jangan beri jawaban langsung, pandu siswa berpikir. Gunakan analogi-analogi yang mudah dipahami oleh siswa.
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
            model: AI_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024,
        };

        const response = await axios.post(API_URL, payload, { headers: getHeaders() });

        // Validasi response path
        if (!response.data.choices || !response.data.choices[0]) {
            throw new Error("AI tidak memberikan jawaban.");
        }

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
            model: AI_MODEL,
            messages: [
                { role: "system", content: "Kamu adalah AI yang merumuskan pertanyaan refleksi siswa. WAJIB MENGGUNAKAN BAHASA INDONESIA YANG BAIK, BENGAR, SEDERHANA, DAN SANGAT MUDAH DIMENGERTI OLEH SISWA SMP." },
                { role: "user", content: `Buat 5 pertanyaan refleksi berdasarkan chat ini dalam format JSON array: ["q1", "q2", "q3", "q4", "q5"].\n\nPastikan bahasanya komunikatif, tidak kaku, dan tidak menggunakan istilah bahasa Inggris yang rumit.\n\nCHAT:\n${historyText}` }
            ]
        };

        const response = await axios.post(API_URL, payload, { headers: getHeaders() });
        const text = response.data.choices[0].message.content;
        return JSON.parse(cleanJson(text));
    } catch (error) {
        console.error("Reflection Gen Error:", error.message);
        return ["Apa yang kamu pelajari?", "Apa yang sulit?", "Bagaimana perasaanmu?", "Apa targetmu?", "Ada pertanyaan lain?"];
    }
}

// Fungsi lainnya menggunakan pola yang sama
async function generateAssessment(username, reflectionAnswers, materialContext) {
    try {
        const payload = {
            model: AI_MODEL,
            messages: [
                { role: "system", content: "Kamu adalah AI spesialis pembuatan soal asesmen berformat ANBK (PISA-like). OUTPUT WAJIB BERUPA PURE JSON ARRAY YANG VALID BERISI TEPAT 20 SOAL. JANGAN LEBIH DARI 20 SOAL.\nWAJIB MENGGUNAKAN BAHASA INDONESIA YANG BAIK, BENAR, DAN MUDAH DIMENGERTI OLEH SISWA TINGKAT SMP. HINDARI KATA-KATA SULIT/TERJEMAHAN KAKU." },
                { role: "user", content: `Buat TEPAT 20 soal pilihan ganda berdasarkan refleksi siswa dan utamanya berdasarkan materi berikut:\n\nMATERI:\n${materialContext}\n\nREFLEKSI:\n${JSON.stringify(reflectionAnswers)}\n\nFormat output WAJIB berbentuk JSON array of objects murni seperti ini:\n[{"question": "Pertanyaan", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Penjelasan", "type": "literasi"}]\n\nATURAN KETAT:\n1. JUMLAH SOAL HARUS TEPAT 20 (Dua Puluh).\n2. Soal, opsi jawaban, dan penjelasan WAJIB menggunakan Bahasa Indonesia yang natural, mudah dipahami siswa, dan tidak terlihat seperti hasil terjemahan mesin kaku.\n3. WAJIB GUNAKAN KUTIP GANDA (") UNTUK SETIAP KEY DAN VALUE STRING dalam JSON.\n4. Jangan tulis kata pengantar (markdown) apapun, langsung JSON array mulai dari [` }
            ],
            max_tokens: 4096,
            temperature: 0.4
        };
        const response = await axios.post(API_URL, payload, { headers: getHeaders() });
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Assessment Gen Error:", e.message);
        return [];
    }
}

async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const payload = {
            model: AI_MODEL,
            messages: [
                { role: "system", content: "Kamu adalah sistem analis evaluasi siswa." },
                { role: "user", content: `Analisislah kesiapan siswa (hanya return format JSON object murni {ready: boolean, analysis: string, recommendation: string}): ${JSON.stringify(reflectionAnswers)}` }
            ]
        };
        const response = await axios.post(API_URL, payload, { headers: getHeaders() });
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Readiness Gen Error:", e.message);
        return { ready: true, analysis: "Gagal analisis", recommendation: "Cek manual" };
    }
}

async function analyzeHabits(username, habitAnswers) {
    try {
        const payload = {
            model: AI_MODEL,
            messages: [
                { role: "system", content: "Kamu adalah sistem analis perilaku siswa. Misi kamu adalah memonitor penerapan 7 Kebiasaan Hebat Anak Indonesia: bangun pagi, beribadah, berolahraga, makan sehat dan bergizi, gemar belajar, bermasyarakat, dan tidur cepat." },
                { role: "user", content: `Analisislah jawaban esai siswa berikut yang berkorespondensi dengan 7 Kebiasaan tersebut dan tentukan seberapa baik penerapannya (kembalikan format JSON object murni {score: number_1_to_100, analysis: string_feedback, details: [array_of_strings_per_habit_feedback]}): ${JSON.stringify(habitAnswers)}` }
            ]
        };
        const response = await axios.post(API_URL, payload, { headers: getHeaders() });
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Habit Analysis Error:", e.message);
        return { score: 0, analysis: "Gagal memproses analisis", details: [] };
    }
}

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness,
    analyzeHabits
};
