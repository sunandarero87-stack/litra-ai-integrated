const aiService = require('../services/aiService');
const Student = require('../models/Student');
const Material = require('../models/Material');
const ChatLog = require('../models/ChatLog');

exports.handleChat = async (req, res) => {
    try {
        const { message, username, selectedMaterial, teacherName } = req.body;

        if (!message || !username) {
            return res.status(400).json({ error: 'Message dan username wajib diisi' });
        }

        let student = await Student.findOne({ username });
        if (!student) {
            student = await Student.create({ username, stage: 1 });
        }

        const materials = await Material.find({ active: true });
        const materialContext = materials.map(m => m.content).join('\n\n');

        const historyLogs = await ChatLog.find({ username })
            .sort({ timestamp: -1 })
            .limit(5);

        const history = historyLogs.reverse().map(log => ({
            role: log.role,
            content: log.content
        }));

        const reply = await aiService.generateResponse(
            username,
            message,
            student.stage,
            materialContext,
            history,
            selectedMaterial,
            teacherName || 'Guru'
        );

        res.json({
            success: true,
            reply: reply,
            stage: student.stage
        });

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({
            error: 'Gagal memproses pesan: ' + error.message
        });
    }
};

exports.handleReflections = async (req, res) => {
    try {
        const { username } = req.body;
        const historyLogs = await ChatLog.find({ username }).sort({ timestamp: -1 }).limit(10);
        const history = historyLogs.reverse().map(log => ({
            role: log.role,
            content: log.content
        }));

        const reflections = await aiService.generateReflections(username, history);
        res.json({ success: true, reflections });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleAssessmentGeneration = async (req, res) => {
    try {
        const { username, reflectionAnswers } = req.body;
        const questions = await aiService.generateAssessment(username, reflectionAnswers);
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleAnalysis = async (req, res) => {
    try {
        const { username, reflectionAnswers } = req.body;
        const analysis = await aiService.analyzeReadiness(username, reflectionAnswers);
        res.json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
