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
const authController = require('./controllers/authController');
const progressController = require('./controllers/progressController');
const materialController = require('./controllers/materialController');
const assessmentController = require('./controllers/assessmentController');
const questionBankController = require('./controllers/questionBankController');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Multer for Memory Storage (Excel uploads)
const upload = multer({ storage: multer.memoryStorage() });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger (untuk debug di Railway)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve frontend files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Explicit route for Root
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---- Database Connection ----
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // Tunggu 5 detik sebelum timeout
    socketTimeoutMS: 45000,
};

mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('✅ Terhubung ke MongoDB');
        authController.initDefaultUsers();
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke MongoDB:', err.message);
        console.log('💡 Tips: Pastikan MONGODB_URI di Railway Variables sudah benar.');
    });

// ---- API Routes ----

// POST /api/chat - Send message to Litra-AI
app.post('/api/chat', chatController.handleChat);

// New Routes for Stage 2 & 3
app.post('/api/reflections', chatController.handleReflections);
app.post('/api/assessment/generate-from-bank', assessmentController.generateFromBank);
app.post('/api/assessment/analyze', chatController.handleAnalysis);
app.post('/api/assessment/analyze-habits', chatController.handleHabitAnalysis);

// Question Bank Management Routes
app.get('/api/question-bank', questionBankController.getQuestions);
app.post('/api/question-bank', questionBankController.addQuestion);
app.delete('/api/question-bank/:id', questionBankController.deleteQuestion);
app.get('/api/question-bank/template', questionBankController.downloadTemplate);
app.post('/api/question-bank/upload', upload.single('file'), questionBankController.uploadExcel);

// Auth & Users
app.post('/api/auth/login', authController.login);
app.post('/api/auth/change-password', authController.changePassword);
app.get('/api/users', authController.getUsers);
app.post('/api/users', authController.createUsers);
app.delete('/api/users/:username', authController.deleteUser);
app.put('/api/users/profile', authController.updateProfile);

// Progress, Results, and Settings
app.get('/api/sync', progressController.syncAll);
app.post('/api/progress/update', progressController.updateProgress);
app.post('/api/progress/result', progressController.saveResult);
app.post('/api/progress/approval', progressController.saveApproval);
app.post('/api/progress/settings', progressController.saveSettings);

// Materials
app.get('/api/materials', materialController.getMaterials);
app.get('/api/materials/content/:id', materialController.getMaterialContent);
app.get('/api/materials/:id', materialController.getMaterialById);
app.post('/api/materials', materialController.addMaterial);
app.delete('/api/materials/:id', materialController.deleteMaterial);

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

