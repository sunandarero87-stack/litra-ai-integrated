const aiService = require('../services/aiService');
const Student = require('../models/Student');
const Material = require('../models/Material');
const ChatLog = require('../models/ChatLog');

exports.handleChat = async (req, res) => {
    try {
        const { message, username } = req.body;

        if (!message || !username) {
            return res.status(400).json({ error: 'Message dan username wajib diisi' });
        }

        // 1. Get Student Info (or create if not exists for demo purposes)
        let student = await Student.findOne({ username });
        if (!student) {
            student = await Student.create({ username, stage: 1 });
        }

        // 2. Get Active Materials
        const materials = await Material.find({ active: true });
        const materialContext = materials.map(m => m.content).join('\n\n');

        // 3. Get Last 5 Chat Logs for context
        const historyLogs = await ChatLog.find({ username })
            .sort({ timestamp: -1 })
            .limit(5);

        // Reverse to get chronological order
        const history = historyLogs.reverse().map(log => ({
            role: log.role,
            content: log.content
        }));

        // 4. Generate AI Response
        const reply = await aiService.generateResponse(
            username,
            message,
            student.stage,
            materialContext,
            history
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
