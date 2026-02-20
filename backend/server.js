// ============================================
// SERVER.JS - Backend Litra-AI
// Google Gemini API Integration
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend files (frontend directory)
app.use(express.static(path.join(__dirname, '../frontend')));

// ---- Gemini AI Setup ----
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instruction untuk Litra-AI
const SYSTEM_INSTRUCTION = `Kamu adalah Litra-AI, asisten virtual cerdas yang ditugaskan oleh Pak Nandar (guru Informatika) untuk membantu siswa SMP Negeri 1 Balikpapan belajar mata pelajaran Informatika.

IDENTITAS:
- Nama: Litra-AI
- Peran: Asisten Pembelajaran AI Pak Nandar
- Sekolah: SMP Negeri 1 Balikpapan
- Mata Pelajaran: Informatika
- Kurikulum: Kurikulum Merdeka - Fase D - Kelas 7

TOPIK UTAMA YANG KAMU KUASAI:
1. Analisis Data:
   - Pengertian analisis data
   - Kegunaan analisis data dalam kehidupan sehari-hari
   - Tahapan analisis data (pengumpulan, pembersihan, pengolahan, visualisasi, interpretasi)
   - Jenis data (kuantitatif dan kualitatif)

2. Microsoft Excel:
   - Pengertian dan fungsi Microsoft Excel
   - Komponen Excel (Workbook, Worksheet, Cell, Range)
   - Rumus-rumus Excel:
     * SUM (penjumlahan)
     * AVERAGE (rata-rata)
     * MAX (nilai terbesar)
     * MIN (nilai terkecil)
     * IF (kondisi logika)
     * COUNT & COUNTIF (menghitung jumlah data)
     * SUMIF (penjumlahan bersyarat)
   - Fitur Excel:
     * Chart/Grafik (Bar, Line, Pie Chart)
     * Sort & Filter
     * Pivot Table
     * Conditional Formatting
     * Freeze Panes
     * Data Validation
     * Absolute & Relative Reference

ATURAN PENTING:
1. Gunakan bahasa Indonesia yang edukatif, ramah, dan sesuai tingkat SMP kelas 7
2. Gunakan emoji untuk membuat penjelasan lebih menarik 📊📚💡
3. Berikan contoh yang relevan dengan kehidupan sehari-hari siswa SMP
4. Jika siswa bertanya di luar topik, arahkan kembali ke materi Analisis Data & Excel dengan sopan
5. Jangan pernah memberikan jawaban asesmen atau ujian secara langsung
6. Dorong siswa untuk berpikir kritis dan berlatih
7. Selalu sebut dirimu sebagai "Litra-AI, asisten Pak Nandar"
8. Gunakan format yang rapi dengan bullet points dan numbering
9. Jika menjelaskan rumus Excel, selalu sertakan contoh penulisan rumus dan contoh kasus
10. Bersikap sabar dan supportif, pujilah usaha siswa

CONTOH SAPAAN:
"Halo! 👋 Saya Litra-AI, asisten Pak Nandar. Ada yang ingin kamu pelajari tentang Analisis Data atau Microsoft Excel hari ini?"

CONTOH RESPONS SAAT DI LUAR TOPIK:
"Pertanyaan menarik! 😊 Tapi saat ini saya fokus membantu kamu belajar tentang Analisis Data dan Microsoft Excel sesuai materi Informatika kelas 7. Yuk, ada yang ingin kamu tanyakan tentang topik itu?"`;

// Store chat sessions in memory (per user)
const chatSessions = {};

// ---- API Routes ----

// POST /api/chat - Send message to Litra-AI
app.post('/api/chat', async (req, res) => {
    try {
        const { message, username, history } = req.body;

        if (!message || !username) {
            return res.status(400).json({ error: 'Message dan username wajib diisi' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY') {
            return res.status(500).json({
                error: 'API Key belum dikonfigurasi',
                fallback: true
            });
        }

        // Get or create model
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ]
        });

        // Build chat history for context
        const chatHistory = [];
        if (history && Array.isArray(history)) {
            // Take last 20 messages for context
            const recentHistory = history.slice(-20);
            for (const msg of recentHistory) {
                chatHistory.push({
                    role: msg.role === 'bot' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                });
            }
        }

        // Start chat with history
        const chat = model.startChat({
            history: chatHistory,
        });

        // Send message
        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        res.json({
            success: true,
            reply: text,
            model: "gemini-1.5-flash"
        });

    } catch (error) {
        console.error('Gemini API Error:', error);

        // Handle specific errors
        if (error.message?.includes('API_KEY')) {
            return res.status(401).json({ error: 'API Key tidak valid. Periksa konfigurasi .env' });
        }
        if (error.message?.includes('quota') || error.message?.includes('429')) {
            return res.status(429).json({ error: 'Kuota API habis. Coba lagi nanti.' });
        }

        res.status(500).json({
            error: 'Gagal menghubungi AI. ' + (error.message || ''),
            fallback: true
        });
    }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Litra-AI Backend',
        geminiConfigured: process.env.GEMINI_API_KEY !== 'YOUR_API_KEY',
        timestamp: new Date().toISOString()
    });
});

// ---- Start Server ----
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   🤖 Litra-AI Backend Server                ║');
    console.log('║   Sistem Pembelajaran Berbasis Chatbot AI    ║');
    console.log('║   SMP Negeri 1 Balikpapan                    ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║   🌐 http://localhost:${PORT}                    ║`);
    console.log(`║   📡 API: http://localhost:${PORT}/api/chat      ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY') {
        console.log('⚠️  PERHATIAN: API Key Gemini belum dikonfigurasi!');
        console.log('   Edit file backend/.env dan masukkan API Key kamu.');
        console.log('   Dapatkan di: https://aistudio.google.com/apikey');
        console.log('');
    } else {
        console.log('✅ Gemini API Key terkonfigurasi');
        console.log('✅ Model: gemini-1.5-flash');
        console.log('');
    }
});
