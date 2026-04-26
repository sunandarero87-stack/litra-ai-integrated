const Progress = require('../models/Progress');
const Setting = require('../models/Setting');
const Violation = require('../models/Violation');

// Get all progress data to sync to the client
exports.syncAll = async (req, res) => {
    try {
        const progresses = await Progress.find({});
        const settingsDoc = await Setting.findOne({ key: 'assessmentSettings' });

        let studentProgress = {};
        let assessmentResults = {};
        let assessmentApprovals = {};

        progresses.forEach(p => {
            studentProgress[p.username] = {
                tahap: p.tahap,
                tahap1Complete: p.tahap1Complete,
                tahap2Complete: p.tahap2Complete,
                tahap3Complete: p.tahap3Complete,
                tahap4Complete: p.tahap4Complete,
                tahap2Score: p.tahap2Score,
                tahap4Score: p.tahap4Score,
                tahap4Analysis: p.tahap4Analysis,
                tahap4Details: p.tahap4Details,
                aiReadiness: p.aiReadiness,
                isReady: p.isReady,
                generatedAssessment: p.generatedAssessment
            };
            if (p.assessmentResult && p.assessmentResult.date) {
                assessmentResults[p.username] = p.assessmentResult;
            }
            if (p.approvedForAssessment) {
                assessmentApprovals[p.username] = {
                    date: p.approvalDate,
                    approvedBy: p.approvedBy
                };
            }
        });

        res.json({
            success: true,
            studentProgress,
            assessmentResults,
            assessmentApprovals,
            assessmentSettings: settingsDoc ? settingsDoc.value : { duration: 90 }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { username, progressData } = req.body;
        let p = await Progress.findOne({ username });
        if (!p) {
            p = new Progress({ username });
        }

        // Ensure aiReadiness is a string to prevent Mongoose CastError if frontend sends an object
        if (progressData.aiReadiness && typeof progressData.aiReadiness === 'object') {
            const originalObj = progressData.aiReadiness;
            progressData.aiReadiness = originalObj.analysis || JSON.stringify(originalObj);
            if (progressData.isReady === undefined) {
                progressData.isReady = originalObj.ready || false;
            }
        }

        Object.assign(p, progressData);
        p.markModified('generatedAssessment');
        p.markModified('reflectionAnswers');
        p.markModified('tahap4Details');
        await p.save();
        res.json({ success: true, progress: p });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveResult = async (req, res) => {
    try {
        const { username, resultData } = req.body;
        await Progress.findOneAndUpdate({ username }, { assessmentResult: resultData }, { upsert: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveApproval = async (req, res) => {
    try {
        const { username, approvalData } = req.body;
        if (approvalData) {
            await Progress.findOneAndUpdate({ username }, {
                approvedForAssessment: true,
                approvedBy: approvalData.approvedBy,
                approvalDate: approvalData.date || new Date()
            }, { upsert: true });
        } else {
            // clear approval when failed assessment
            await Progress.findOneAndUpdate({ username }, {
                approvedForAssessment: false,
                approvedBy: null,
                approvalDate: null
            }, { upsert: true });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveSettings = async (req, res) => {
    try {
        const { settingsData } = req.body;
        await Setting.findOneAndUpdate({ key: 'assessmentSettings' }, { value: settingsData }, { upsert: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetProgress = async (req, res) => {
    try {
        const { usernames } = req.body;
        if (!usernames || !Array.isArray(usernames)) {
            return res.status(400).json({ error: 'Usernames array is required' });
        }

        const updateData = {
            tahap: 1,
            tahap1Complete: false,
            tahap2Complete: false,
            tahap3Complete: false,
            tahap4Complete: false,
            tahap2Score: 0,
            tahap4Score: 0,
            tahap4Analysis: null,
            tahap4Details: [],
            reflectionAnswers: [],
            aiReadiness: '',
            isReady: false,
            generatedAssessment: [],
            assessmentResult: null,
            approvedForAssessment: false,
            approvedBy: null,
            approvalDate: null
        };

        const result = await Progress.updateMany(
            { username: { $in: usernames } },
            { $set: updateData }
        );

        res.json({ success: true, message: `Berhasil mereset ${result.modifiedCount} siswa` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const User = require('../models/User');

exports.simulateData = async (req, res) => {
    try {
        const students = await User.find({ role: 'siswa' });
        const passCount = Math.round(students.length * 0.82);

        for (let i = 0; i < students.length; i++) {
            const s = students[i];
            const willPass = i < passCount;
            const litTotal = 5, numTotal = 5, total = 10;
            
            let lit, num;
            if (willPass) {
                lit = Math.floor(Math.random() * 2) + 4; // 4-5
                num = Math.floor(Math.random() * 2) + 4; // 4-5
            } else {
                lit = Math.floor(Math.random() * 3) + 1; // 1-3
                num = Math.floor(Math.random() * 3) + 1; // 1-3
            }
            
            const score = lit + num;
            const pct = Math.round((score / total) * 100);

            await Progress.findOneAndUpdate({ username: s.username }, {
                tahap: 4,
                tahap1Complete: true,
                tahap2Complete: true,
                tahap3Complete: true,
                tahap4Complete: true,
                tahap2Score: Math.floor(Math.random() * 21) + 80,
                tahap4Score: Math.floor(Math.random() * 21) + 80,
                assessmentResult: {
                    score, total, literasi: lit, numerasi: num, litTotal, numTotal, pct, pass: willPass,
                    date: new Date(), violations: 0
                },
                approvedForAssessment: true,
                approvalDate: new Date(),
                approvedBy: 'Simulation AI'
            }, { upsert: true });
        }
        res.json({ success: true, message: 'Simulasi berhasil' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetStage2All = async (req, res) => {
    try {
        const { usernames } = req.body;
        const query = usernames && Array.isArray(usernames) ? { username: { $in: usernames } } : {};
        
        const result = await Progress.updateMany(query, {
            $set: {
                tahap2Complete: false,
                reflectionAnswers: [],
                tahap2Score: 0,
                isReady: false,
                aiReadiness: ''
            }
        });
        res.json({ success: true, message: 'Berhasil mereset Tahap 2 untuk ' + result.modifiedCount + ' siswa' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.recordViolation = async (req, res) => {
    try {
        const { username, name, kelas, stage, type, details } = req.body;
        const newViolation = new Violation({ username, name, kelas, stage, type, details });
        await newViolation.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getViolations = async (req, res) => {
    try {
        const violations = await Violation.find().sort({ timestamp: -1 });
        res.json({ success: true, violations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearViolations = async (req, res) => {
    try {
        await Violation.deleteMany({});
        res.json({ success: true, message: 'Semua data pelanggaran berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
