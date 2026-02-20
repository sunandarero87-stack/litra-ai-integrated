// ============================================
// SERVER.JS - Backend Litra-AI
// Integrated with OpenAI-compatible AI API
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const chatController = require('./controllers/chatController');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend files (frontend directory)
app.use(express.static(path.join(__dirname, '../frontend')));

// ---- Database Connection ----
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Terhubung ke MongoDB'))
    .catch(err => console.error('❌ Gagal terhubung ke MongoDB:', err));

// ---- API Routes ----

// POST /api/chat - Send message to Litra-AI
app.post('/api/chat', chatController.handleChat);

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Litra-AI Backend',
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ---- Start Server ----
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   🤖 Litra-AI Backend Server (AI-INTEGRATED)║');
    console.log('║   Sistem Pembelajaran Berbasis Chatbot AI    ║');
    console.log('║   SMP Negeri 1 Balikpapan                    ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║   🌐 http://localhost:${PORT}                    ║`);
    console.log(`║   📡 API: http://localhost:${PORT}/api/chat      ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    if (!process.env.AI_API_KEY || process.env.AI_API_KEY === 'YOUR_API_KEY') {
        console.log('⚠️  PERHATIAN: AI_API_KEY belum dikonfigurasi!');
        console.log('   Edit file backend/.env dan masukkan API Key kamu.');
        console.log('');
    } else {
        console.log('✅ AI Service terkonfigurasi');
        console.log(`✅ Model: ${process.env.AI_MODEL}`);
        console.log('');
    }
});
