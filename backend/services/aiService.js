const axios = require('axios');
const ChatLog = require('../models/ChatLog');

// Configuration
const AI_API_KEY = (process.env.AI_API_KEY || "").replace(/\s/g, "");
// Menggunakan model Step 3.5 Flash (free) dengan fallback otomatis ke model gratis hebat lainnya di OpenRouter
const AI_MODELS = [
    "stepfun/step-3.5-flash:free",
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openrouter/free"
];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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
            models: AI_MODELS,
            route: "fallback",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024,
        };

        const response = await axios.post(OPENROUTER_URL, payload, { headers: getHeaders() });

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
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```json/gi, "").replace(/```/g, "").trim();
}

/**
 * Generate 5 reflection questions
 */
async function generateReflections(username, chatHistory) {
    try {
        const historyText = chatHistory.map(m => `${m.role}: ${m.content || m.text}`).join('\n');

        const payload = {
            models: AI_MODELS,
            route: "fallback",
            messages: [
                { role: "system", content: "Kamu adalah AI yang merumuskan pertanyaan refleksi siswa." },
                { role: "user", content: `Buat 5 pertanyaan refleksi berdasarkan chat ini dalam format JSON array: ["q1", "q2", "q3", "q4", "q5"].\n\nCHAT:\n${historyText}` }
            ]
        };

        const response = await axios.post(OPENROUTER_URL, payload, { headers: getHeaders() });
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
            models: AI_MODELS,
            route: "fallback",
            messages: [
                { role: "system", content: "Kamu adalah AI spesialis pembuatan soal asesmen berformat ANBK (PISA-like)." },
                { role: "user", content: `Buat 20 soal pilihan ganda (array of objects murni berformat JSON [{question, options:["A","B","C","D"], correct: 0, explanation, type:"literasi" atau "numerasi"}]) berdasarkan refleksi siswa dan utamanya berdasarkan materi berikut:\n\nMATERI:\n${materialContext}\n\nREFLEKSI:\n${JSON.stringify(reflectionAnswers)}\n\nPastikan berjumlah tepat 20 soal dan sesuai dengan materi yang dibahas.` }
            ]
        };
        const response = await axios.post(OPENROUTER_URL, payload, { headers: getHeaders() });
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Assessment Gen Error:", e.message);
        return [];
    }
}

async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const payload = {
            models: AI_MODELS,
            route: "fallback",
            messages: [
                { role: "system", content: "Kamu adalah sistem analis evaluasi siswa." },
                { role: "user", content: `Analisislah kesiapan siswa (hanya return format JSON object murni {ready: boolean, analysis: string, recommendation: string}): ${JSON.stringify(reflectionAnswers)}` }
            ]
        };
        const response = await axios.post(OPENROUTER_URL, payload, { headers: getHeaders() });
        return JSON.parse(cleanJson(response.data.choices[0].message.content));
    } catch (e) {
        console.error("Readiness Gen Error:", e.message);
        return { ready: true, analysis: "Gagal analisis", recommendation: "Cek manual" };
    }
}

async function analyzeHabits(username, habitAnswers) {
    try {
        const payload = {
            models: AI_MODELS,
            route: "fallback",
            messages: [
                { role: "system", content: "Kamu adalah sistem analis perilaku siswa. Misi kamu adalah memonitor penerapan 7 Kebiasaan Hebat Anak Indonesia: bangun pagi, beribadah, berolahraga, makan sehat dan bergizi, gemar belajar, bermasyarakat, dan tidur cepat." },
                { role: "user", content: `Analisislah jawaban esai siswa berikut yang berkorespondensi dengan 7 Kebiasaan tersebut dan tentukan seberapa baik penerapannya (kembalikan format JSON object murni {score: number_1_to_100, analysis: string_feedback, details: [array_of_strings_per_habit_feedback]}): ${JSON.stringify(habitAnswers)}` }
            ]
        };
        const response = await axios.post(OPENROUTER_URL, payload, { headers: getHeaders() });
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
