const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatLog = require('../models/ChatLog');

// Configuration - Kita bersihkan semuanya dari spasi atau karakter aneh
const AI_API_KEY = (process.env.AI_API_KEY || "").replace(/\s/g, "");
const AI_MODEL = (process.env.AI_MODEL || "gemini-1.5-flash").replace(/\s/g, "");

const genAI = new GoogleGenerativeAI(AI_API_KEY);

const SYSTEM_PROMPT = `Kamu adalah Litra-AI, asisten chatbot yang bebas menjawab semua pertanyaan siswa dengan sopan.`;

/**
 * Generate AI Response
 */
async function generateResponse(username, question, stage, materialContext, chatHistory) {
    try {
        // Gunakan model tanpa systemInstruction dulu krn terkadang versi v1beta di bbrp region bermasalah
        const model = genAI.getGenerativeModel({ model: AI_MODEL });

        // Gabungkan sistem prompt ke instruksi awal
        const fullSystemInstruction = `${SYSTEM_PROMPT}\n\nKONTEKS MATERI:\n${materialContext}\n\nTAHAP SISWA: Tahap ${stage}`;

        // Konversi history ke format Google Gemini
        const history = chatHistory.slice(-5).map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        // Tambahkan instruksi sistem di awal history jika kosong, atau selipkan di pesan
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Halo, tolong ikuti instruksi ini: " + fullSystemInstruction }] },
                { role: "model", parts: [{ text: "Baik, saya adalah Litra-AI. Saya siap membantu sesuai instruksi tersebut." }] },
                ...history
            ]
        });

        const result = await chat.sendMessage(question);
        const aiReply = result.response.text();

        // Logging sederhana
        try {
            await ChatLog.create({
                username, role: 'bot', content: aiReply, model: AI_MODEL,
                metadata: { stage }
            });
            await ChatLog.create({ username, role: 'user', content: question, metadata: { stage } });
        } catch (e) {
            console.warn('Logging failed');
        }

        return aiReply;

    } catch (error) {
        console.error('--- AI SERVICE ERROR ---');
        console.error('Model used:', AI_MODEL);
        console.error('Error Detail:', error.message);

        // Jika 404, mungkin model gemini-1.5-flash benar-benar tidak ada di region tersebut
        if (error.message.includes("404") && AI_MODEL !== "gemini-pro") {
            console.warn("⚠️ Flash model not found, trying fallback to gemini-pro...");
            process.env.AI_MODEL = "gemini-pro"; // Temporary fallback
            return generateResponse(username, question, stage, materialContext, chatHistory);
        }

        throw new Error(`AI Error: ${error.message}`);
    }
}

/**
 * Generate 5 reflection questions
 */
async function generateReflections(username, chatHistory) {
    try {
        const model = genAI.getGenerativeModel({ model: AI_MODEL });
        const historyText = chatHistory.map(m => `${m.role}: ${m.content || m.text}`).join('\n');
        const prompt = `Kamu adalah pakar pendidikan. Buatlah 5 pertanyaan refleksi berdasarkan chat ini dalam format JSON array: ["q1", "q2", "q3", "q4", "q5"].\n\nCHAT:\n${historyText}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Bersihkan markdown jika ada
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        return ["Apa yang kamu pelajari?", "Apa yang sulit?", "Bagaimana perasaanmu?", "Apa targetmu?", "Ada pertanyaan lain?"];
    }
}

async function generateAssessment(username, reflectionAnswers) {
    try {
        const model = genAI.getGenerativeModel({ model: AI_MODEL });
        const reflectionText = reflectionAnswers.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n');
        const prompt = `Buat 5 soal pilihan ganda berdasarkan refleksi ini dalam format JSON array of objects. \n\nREFLEKSI:\n${reflectionText}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (e) { return []; }
}

async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const model = genAI.getGenerativeModel({ model: AI_MODEL });
        const prompt = `Analisislah apakah siswa siap asesmen (JSON format {ready:bool, analysis:string, recommendation:string}): ${JSON.stringify(reflectionAnswers)}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (e) { return { ready: true, analysis: "Analisis gagal", recommendation: "Cek manual" }; }
}

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness
};
