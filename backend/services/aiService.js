const axios = require('axios');
const ChatLog = require('../models/ChatLog');

const AI_API_KEY = process.env.AI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL;
const AI_MODEL = process.env.AI_MODEL;

const SYSTEM_PROMPT = `Kamu adalah Litra-AI, asisten chatbot yang bebas menjawab semua pertanyaan siswa dengan sopan.`;

/**
 * Generate AI Response with context
 */
async function generateResponse(username, question, stage, materialContext, chatHistory) {
    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: `KONTEKS MATERI:\n${materialContext}` },
            { role: 'system', content: `TAHAP SISWA: Tahap ${stage}` }
        ];

        chatHistory.slice(-5).forEach(msg => {
            messages.push({
                role: msg.role === 'bot' ? 'assistant' : 'user',
                content: msg.content
            });
        });

        messages.push({ role: 'user', content: question });

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

        // Save to Database (logging only, assuming model exists)
        try {
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
            await ChatLog.create({ username, role: 'user', content: question, metadata: { stage } });
        } catch (e) {
            console.warn('Logging failed but responding anyway');
        }

        return aiReply;

    } catch (error) {
        const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('--- AI SERVICE ERROR ---');
        console.error('URL:', AI_BASE_URL);
        console.error('Model:', AI_MODEL);
        console.error('Detail:', errorDetail);
        console.error('------------------------');
        throw new Error(`AI Error: ${errorDetail}`);
    }
}

/**
 * Generate 5 reflection questions based on chat history
 */
async function generateReflections(username, chatHistory) {
    try {
        const historyText = chatHistory.map(m => `${m.role}: ${m.content || m.text}`).join('\n');
        const prompt = `Berdasarkan riwayat percakapan antara siswa dan AI berikut, buatlah 5 pertanyaan refleksi essay yang mendalam. 
Pertanyaan harus membantu siswa merenungkan apa yang telah mereka pelajari, kesulitan yang dihadapi, dan bagaimana mereka akan menerapkan ilmu tersebut. 
Hubungkan juga dengan salah satu dari 7 Kebiasaan Anak Hebat Indonesia jika memungkinkan.

RIWAYAT PERCAKAPAN:
${historyText}

Format Output (JSON Array of strings):
["Pertanyaan 1", "Pertanyaan 2", "Pertanyaan 3", "Pertanyaan 4", "Pertanyaan 5"]`;

        const response = await axios.post(AI_BASE_URL, {
            model: AI_MODEL,
            messages: [
                { role: 'system', content: 'Kamu adalah pakar pendidikan yang membuat soal refleksi.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;
        // The AI might return { "questions": [...] } or just the array if we are lucky, 
        // but with response_format: json_object it needs a key.
        const parsed = JSON.parse(content);
        return parsed.questions || parsed.reflections || Object.values(parsed)[0];
    } catch (error) {
        console.error('Reflection Generation Error:', error.message);
        return [
            "Apa hal terpenting yang kamu pelajari hari ini tentang Analisis Data?",
            "Bagian mana dari Microsoft Excel yang menurutmu paling menantang?",
            "Bagaimana kamu akan menggunakan rumus Excel yang baru kamu pelajari untuk membantu tugas sekolahmu?",
            "Apakah kamu sudah mempraktikkan kebiasaan 'Gemar Belajar' dengan bertanya aktif hari ini? Jelaskan.",
            "Apa targetmu selanjutnya setelah memahami materi ini?"
        ];
    }
}

/**
 * Generate Assessment Questions based on Reflection Analysis
 */
async function generateAssessment(username, reflectionAnswers) {
    try {
        const reflectionText = reflectionAnswers.map((r, i) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
        const prompt = `Berdasarkan hasil refleksi siswa berikut, buatkan 5 soal asesmen (pilihan ganda) yang sesuai dengan tingkat kesiapan siswa. 
Jika siswa terlihat sudah mahir, berikan soal yang lebih sulit (HOTS). Jika siswa masih ragu, berikan soal penguatan konsep.
Sertakan kunci jawaban dan penjelasan singkat.

HASIL REFLEKSI SISWA:
${reflectionText}

Format Output (JSON Array of objects):
[
  {
    "question": "teks soal",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "penjelasan"
  },
  ...
]`;

        const response = await axios.post(AI_BASE_URL, {
            model: AI_MODEL,
            messages: [
                { role: 'system', content: 'Kamu adalah pembuat soal ujian profesional Informatika.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);
        return parsed.questions || parsed.assessment || Object.values(parsed)[0];
    } catch (error) {
        console.error('Assessment Generation Error:', error.message);
        return []; // Fallback to default questions if this fails
    }
}

/**
 * Analyze Reflections to provide recommendations for Teacher
 */
async function analyzeReadiness(username, reflectionAnswers) {
    try {
        const reflectionText = reflectionAnswers.map((r, i) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
        const prompt = `Analisislah jawaban refleksi siswa berikut. Apakah siswa ini sudah SIAP untuk mengikuti asesmen? Berikan alasan singkat dan rekomendasi untuk guru.

HASIL REFLEKSI SISWA:
${reflectionText}

Format Output (JSON Object):
{
  "ready": true/false,
  "analysis": "alasan kesiapan",
  "recommendation": "rekomendasi untuk guru"
}`;

        const response = await axios.post(AI_BASE_URL, {
            model: AI_MODEL,
            messages: [
                { role: 'system', content: 'Kamu adalah asisten guru yang menganalisis perkembangan siswa.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        return { ready: true, analysis: "Analisis otomatis gagal, namun siswa telah menyelesaikan refleksi.", recommendation: "Periksa jawaban refleksi secara manual." };
    }
}

module.exports = {
    generateResponse,
    generateReflections,
    generateAssessment,
    analyzeReadiness
};

