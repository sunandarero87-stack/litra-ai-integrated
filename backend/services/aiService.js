const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatLog = require('../models/ChatLog');

// Configuration
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(AI_API_KEY);

const SYSTEM_PROMPT = `Kamu adalah Litra-AI, asisten chatbot yang bebas menjawab semua pertanyaan siswa dengan sopan.`;

/**
 * Generate AI Response with context using Native SDK
 */
async function generateResponse(username, question, stage, materialContext, chatHistory) {
    try {
        const model = genAI.getGenerativeModel({
            model: AI_MODEL,
            systemInstruction: `${SYSTEM_PROMPT}\n\nKONTEKS MATERI:\n${materialContext}\n\nTAHAP SISWA: Tahap ${stage}`
        });

        // Convert history to Google Gemini format
        const history = chatHistory.slice(-5).map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(question);
        const aiReply = result.response.text();

        // Save to Database (logging)
        try {
            await ChatLog.create({
                username,
                role: 'bot',
                content: aiReply,
                model: AI_MODEL,
                tokens: {
                    prompt_tokens: 0, // SDK doesn't return this as easily as OpenAI/Axios
                    completion_tokens: 0,
                    total_tokens: 0
                },
                metadata: { stage }
            });
            await ChatLog.create({ username, role: 'user', content: question, metadata: { stage } });
        } catch (e) {
            console.warn('Logging failed but responding anyway');
        }

        return aiReply;

    } catch (error) {
        console.error('--- AI SERVICE ERROR ---');
        console.error('Error:', error.message);
        throw new Error(`AI Error: ${error.message}`);
    }
}

/**
 * Generate 5 reflection questions based on chat history
 */
async function generateReflections(username, chatHistory) {
    try {
        const model = genAI.getGenerativeModel({
            model: AI_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        const historyText = chatHistory.map(m => `${m.role}: ${m.content || m.text}`).join('\n');
        const prompt = `Kamu adalah pakar pendidikan yang membuat soal refleksi.
Berdasarkan riwayat percakapan antara siswa dan AI berikut, buatlah 5 pertanyaan refleksi essay yang mendalam. 
Pertanyaan harus membantu siswa merenungkan apa yang telah mereka pelajari, kesulitan yang dihadapi, dan bagaimana mereka akan menerapkan ilmu tersebut. 

RIWAYAT PERCAKAPAN:
${historyText}

Format Output (JSON):
{
  "questions": ["Pertanyaan 1", "Pertanyaan 2", "Pertanyaan 3", "Pertanyaan 4", "Pertanyaan 5"]
}`;

        const result = await model.generateContent(prompt);
        const content = result.response.text();
        const parsed = JSON.parse(content);

        return parsed.questions || Object.values(parsed)[0];
    } catch (error) {
        console.error('Reflection Generation Error:', error.message);
        return [
            "Apa hal terpenting yang kamu pelajari hari ini?",
            "Bagian mana yang menurutmu paling menantang?",
            "Bagaimana kamu akan menggunakan ilmu baru ini?",
            "Apakah kamu sudah mempraktikkan kebiasaan 'Gemar Belajar'?",
            "Apa targetmu selanjutnya?"
        ];
    }
}

/**
 * Generate Assessment Questions based on Reflection Analysis
 */
async function generateAssessment(username, reflectionAnswers) {
    try {
        const model = genAI.getGenerativeModel({
            model: AI_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        const reflectionText = reflectionAnswers.map((r, i) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
        const prompt = `Kamu adalah pembuat soal ujian profesional Informatika.
Berdasarkan hasil refleksi siswa berikut, buatkan 5 soal asesmen (pilihan ganda) yang sesuai dengan tingkat kesiapan siswa. 
Jika siswa terlihat sudah mahir, berikan soal yang lebih sulit (HOTS). Jika siswa masih ragu, berikan soal penguatan konsep.
Sertakan kunci jawaban dan penjelasan singkat.

HASIL REFLEKSI SISWA:
${reflectionText}

Format Output (JSON):
{
  "questions": [
    {
      "question": "teks soal",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "correct": 0,
      "explanation": "penjelasan"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const content = result.response.text();
        const parsed = JSON.parse(content);

        return parsed.questions || Object.values(parsed)[0];
    } catch (error) {
        console.error('Assessment Generation Error:', error.message);
        return [];
    }
}

/**
 * Analyze Reflections to provide recommendations for Teacher
 */
async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const model = genAI.getGenerativeModel({
            model: AI_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        const reflectionText = reflectionAnswers.map((r, i) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
        const prompt = `Analisislah jawaban refleksi siswa berikut. Apakah siswa ini sudah SIAP untuk mengikuti asesmen? Berikan alasan singkat dan rekomendasi untuk guru.

HASIL REFLEKSI SISWA:
${reflectionText}

Format Output (JSON):
{
  "ready": true,
  "analysis": "alasan kesiapan",
  "recommendation": "rekomendasi untuk guru"
}`;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        return parsed;
    } catch (error) {
        return {
            ready: true,
            analysis: "Analisis otomatis gagal.",
            recommendation: "Periksa secara manual."
        };
    }
}

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness
};
