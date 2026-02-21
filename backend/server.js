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
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // Tunggu 5 detik sebelum timeout
    socketTimeoutMS: 45000,
};

mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => console.log('✅ Terhubung ke MongoDB'))
    .catch(err => {
        console.error('❌ Gagal terhubung ke MongoDB:', err.message);
        console.log('💡 Tips: Pastikan MONGODB_URI di Railway Variables sudah benar.');
    });

// ---- API Routes ----

// POST /api/chat - Send message to Litra-AI
app.post('/api/chat', chatController.handleChat);

// New Routes for Stage 2 & 3
app.post('/api/reflections', chatController.handleReflections);
app.post('/api/assessment/generate', chatController.handleAssessmentGeneration);
app.post('/api/assessment/analyze', chatController.handleAnalysis);

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
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 Litra-AI Backend is running!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 URL: http://0.0.0.0:${PORT}`);

    // Safety check for critical config
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY === 'YOUR_API_KEY') {
        console.log('❌ FATAL: AI_API_KEY is not configured in Environment Variables!');
    }

    if (!process.env.MONGODB_URI) {
        console.log('⚠️  WARNING: MONGODB_URI is not set, using default localhost (this will fail on Railway)');
    } else {
        console.log('✅ Database URI is set.');
    }
});

