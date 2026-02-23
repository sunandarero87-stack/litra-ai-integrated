const axios = require('axios');
const ChatLog = require('../models/ChatLog');

// Configuration
const AI_API_KEY = (process.env.AI_API_KEY || "").replace(/\s/g, "");
// Gunakan nama model lengkap untuk v1
const AI_MODEL = "gemini-1.5-flash";

/**
 * Generate AI Response menggunakan v1 Stable Endpoint
 */
async function generateResponse(username, question, stage, materialContext, chatHistory, selectedMaterial = '', teacherName = 'Guru') {
    try {
        // Menggunakan v1 dengan penulisan payload yang benar
        const URL = `https://generativelanguage.googleapis.com/v1/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;

        const systemInstruction = `Kamu adalah Asisten Chatbot ${teacherName}. Tugasmu adalah membantu siswa membahas dan mempelajari materi yang sedang mereka buka yaitu: "${selectedMaterial}".\n\nATURAN WAJIB (SANGAT PENTING): SEBELUM kamu membahas materi lebih jauh, pastikan kamu selalu menanyakan kepada siswa apakah mereka sudah menerapkan "7 Kebiasaan Hebat Anak Indonesia" hari ini (khususnya kebiasaan Gemar Belajar, Beribadah, atau Mandiri). Tanyakan dengan sopan dan ramah.\n\nSikapmu harus suportif, jangan memberikan jawaban langsung untuk tugas, tapi pandu siswa berpikir.\n\nATURAN MATERI: Jika Siswa bertanya tentang file yang diupload guru, chatbot harus menjawab dengan detail dengan jawaban yang memberikan pemahaman. Jika siswa belum paham, chatbot wajib menanyakan ulang bagian mana yang belum dipahami.\n\nKONTEKS BACAAN:\n${materialContext}\n\nMATERI SAAT INI: ${selectedMaterial}\n\nTAHAP SISWA: Tahap ${stage}`;

        // Format data untuk Google Gemini Native API
        const contents = chatHistory.slice(-5).map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Tambahkan pertanyaan terbaru
        contents.push({
            role: 'user',
            parts: [{ text: question }]
        });

        const response = await axios.post(URL, {
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        const aiReply = response.data.candidates[0].content.parts[0].text;

        // Logging
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
        const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('--- AI SERVICE ERROR (v1) ---');
        console.error('Detail:', detail);
        throw new Error(`AI Error: ${detail}`);
    }
}

/**
 * Helper untuk format JSON dari Gemini
 */
function cleanJson(text) {
    return text.replace(/```json|```/g, "").trim();
}

/**
 * Generate 5 reflection questions
 */
async function generateReflections(username, chatHistory) {
    try {
        const URL = `https://generativelanguage.googleapis.com/v1/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
        const historyText = chatHistory.map(m => `${m.role}: ${m.content || m.text}`).join('\n');

        const prompt = {
            contents: [{
                parts: [{ text: `Buat 5 pertanyaan refleksi berdasarkan chat ini dalam format JSON array: ["q1", "q2", "q3", "q4", "q5"].\n\nCHAT:\n${historyText}` }]
            }]
        };

        const response = await axios.post(URL, prompt);
        const text = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(cleanJson(text));
    } catch (error) {
        return ["Apa yang kamu pelajari?", "Apa yang sulit?", "Bagaimana perasaanmu?", "Apa targetmu?", "Ada pertanyaan lain?"];
    }
}

// Fungsi lainnya menggunakan pola yang sama
async function generateAssessment(username, reflectionAnswers) {
    try {
        const URL = `https://generativelanguage.googleapis.com/v1/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
        const prompt = {
            contents: [{
                parts: [{ text: `Buat 5 soal pilihan ganda (array of objects {question, options, correct, explanation}) berdasarkan ini: ${JSON.stringify(reflectionAnswers)}` }]
            }]
        };
        const response = await axios.post(URL, prompt);
        return JSON.parse(cleanJson(response.data.candidates[0].content.parts[0].text));
    } catch (e) { return []; }
}

async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const URL = `https://generativelanguage.googleapis.com/v1/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
        const prompt = {
            contents: [{
                parts: [{ text: `Analisislah kesiapan siswa (JSON {ready, analysis, recommendation}): ${JSON.stringify(reflectionAnswers)}` }]
            }]
        };
        const response = await axios.post(URL, prompt);
        return JSON.parse(cleanJson(response.data.candidates[0].content.parts[0].text));
    } catch (e) { return { ready: true, analysis: "Gagal analisis", recommendation: "Cek manual" }; }
}

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness
};
