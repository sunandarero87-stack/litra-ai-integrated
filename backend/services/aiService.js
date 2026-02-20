const axios = require('axios');
const ChatLog = require('../models/ChatLog');

const AI_API_KEY = process.env.AI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL;
const AI_MODEL = process.env.AI_MODEL;

const SYSTEM_PROMPT = `Kamu adalah Litra-AI, asisten Pak Nandar untuk mata pelajaran Informatika SMP. 
Tugasmu membantu siswa kelas 7 memahami Analisis Data, kegunaannya dalam kehidupan sehari-hari, serta penggunaan Microsoft Excel (rumus dan fitur). 
Gunakan bahasa sederhana, edukatif, dan bertahap. 
Jangan membahas topik di luar Informatika SMP. 
Jika siswa menjawab salah, arahkan dengan petunjuk, bukan langsung memberi jawaban.`;

/**
 * Generate AI Response with context
 * @param {string} username - Student username
 * @param {string} question - Student question
 * @param {number} stage - Student stage (1: Belajar, 2: Latihan, 3: Asesmen)
 * @param {string} materialContext - Text from teacher materials
 * @param {Array} chatHistory - Last 5 messages [{role: 'user'|'bot', content: ''}]
 */
async function generateResponse(username, question, stage, materialContext, chatHistory) {
    try {
        // Validation for Stage 3 (Assessment)
        if (stage === 3) {
            const forbiddenKeywords = ['jawaban', 'bocoran', 'cara mengerjakan', 'apa isi', 'nomor', 'soal'];
            const lowerQuestion = question.toLowerCase();

            const isAskingForAnswer = forbiddenKeywords.some(keyword => lowerQuestion.includes(keyword));

            if (isAskingForAnswer) {
                // Log violation
                await ChatLog.create({
                    username,
                    role: 'user',
                    content: question,
                    metadata: { stage, violations: true }
                });

                return "Silakan kerjakan soal secara mandiri.";
            }
        }

        // Prepare Messages
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: `KONTEKS MATERI:\n${materialContext}` },
            { role: 'system', content: `TAHAP SISWA: Tahap ${stage}` }
        ];

        // Add history (max 5)
        chatHistory.slice(-5).forEach(msg => {
            messages.push({
                role: msg.role === 'bot' ? 'assistant' : 'user',
                content: msg.content
            });
        });

        // Add current question
        messages.push({ role: 'user', content: question });

        // Call AI API
        const response = await axios.post(AI_BASE_URL, {
            model: AI_MODEL,
            messages: messages,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiReply = response.data.choices[0].message.content;
        const usage = response.data.usage;

        // Save to Database
        await ChatLog.create({
            username,
            role: 'bot',
            content: aiReply,
            model: AI_MODEL,
            tokens: {
                prompt_tokens: usage.prompt_tokens,
                completion_tokens: usage.completion_tokens,
                total_tokens: usage.total_tokens
            },
            metadata: { stage }
        });

        // Also save user message to history
        await ChatLog.create({
            username,
            role: 'user',
            content: question,
            metadata: { stage }
        });

        return aiReply;

    } catch (error) {
        console.error('AI Service Error:', error.response?.data || error.message);
        throw new Error('Gagal mendapatkan respons dari AI.');
    }
}

module.exports = {
    generateResponse
};
