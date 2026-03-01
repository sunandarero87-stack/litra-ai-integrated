const Progress = require('../models/Progress');
const Setting = require('../models/Setting');

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
