const Progress = require('../models/Progress');
const Setting = require('../models/Setting');
const Violation = require('../models/Violation');
const ChatLog = require('../models/ChatLog');
const aiService = require('../services/aiService');

// Get all progress data to sync to the client
exports.syncAll = async (req, res) => {
    try {
        const { username } = req.query;
        const query = username ? { username } : {};

        // Pilih field yang dibutuhkan saja — jangan load generatedAssessment (besar!) untuk sync semua siswa
        const selectFields = username
            ? '' // Kalau sync individual, ambil semua termasuk generatedAssessment
            : '-generatedAssessment -tahap4Details -reflectionAnswers'; // Sync global: skip field besar

        const progresses = await Progress.find(query).select(selectFields).lean();
        const settingsDoc = await Setting.findOne({ key: 'assessmentSettings' }).lean();

        const studentProgress = {};
        const assessmentResults = {};
        const assessmentApprovals = {};

        for (const p of progresses) {
            studentProgress[p.username] = {
                tahap: p.tahap,
                tahap1Complete: p.tahap1Complete,
                tahap1Score: p.tahap1Score, // Added missing field
                tahap2Complete: p.tahap2Complete,
                tahap3Complete: p.tahap3Complete,
                tahap4Complete: p.tahap4Complete,
                tahap2Score: p.tahap2Score,
                tahap4Score: p.tahap4Score,
                tahap4Analysis: p.tahap4Analysis,
                tahap4Details: p.tahap4Details,
                aiReadiness: p.aiReadiness,
                isReady: p.isReady,
                reflectionAnswers: p.reflectionAnswers || [], // Added
                // Only send generatedAssessment for individual student sync to keep payload small
                generatedAssessment: username ? p.generatedAssessment : []
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
        }

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
            // If it's the new structured analysis, store the whole thing as JSON string
            if (originalObj.analysis && typeof originalObj.analysis === 'object') {
                progressData.aiReadiness = JSON.stringify(originalObj);
            } else {
                progressData.aiReadiness = originalObj.analysis || JSON.stringify(originalObj);
            }
            
            if (progressData.isReady === undefined) {
                progressData.isReady = originalObj.ready || false;
            }
        }

        Object.assign(p, progressData);
        p.markModified('generatedAssessment');
        p.markModified('reflectionAnswers');
        p.markModified('tahap4Details');

        // Jika tahap 1 selesai atau tahap berubah, bebaskan antrian chat
        if (progressData.tahap1Complete || progressData.tahap > 1) {
            p.isChatting = false;
        }

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
            approvalDate: null,
            isChatting: false,
            lastChatActivity: null
        };

        const result = await Progress.updateMany(
            { username: { $in: usernames } },
            { $set: updateData }
        );

        // Clear chat history for the reset students
        await ChatLog.deleteMany({ username: { $in: usernames } });


        res.json({ success: true, message: `Berhasil mereset ${result.modifiedCount} siswa` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const User = require('../models/User');

exports.simulateData = async (req, res) => {
    try {
        const { usernames, specificRange } = req.body || {};
        let query = { role: 'siswa' };
        if (usernames && Array.isArray(usernames) && usernames.length > 0) {
            query.username = { $in: usernames };
        }
        
        const students = await User.find(query).select('username').lean();
        const passCount = specificRange ? students.length : Math.round(students.length * 0.82);

        // Buat semua operasi update sekaligus dengan bulkWrite — jauh lebih cepat dari sequential await
        const bulkOps = students.map((s) => {
            const litTotal = 5, numTotal = 5, total = 10;
            const targetAvgLit = Math.floor(Math.random() * 18) + 65;
            const targetAvgNum = Math.floor(Math.random() * 18) + 65;
            const lit = targetAvgLit < 70 ? 3 : 4;
            const tahap1LitScore = (targetAvgLit * 2) - (lit * 20);
            const num = targetAvgNum < 70 ? 3 : 4;
            const tahap1NumScore = (targetAvgNum * 2) - (num * 20);
            const score = lit + num;
            const pct = Math.round((score / total) * 100);

            return {
                updateOne: {
                    filter: { username: s.username },
                    update: {
                        $set: {
                            tahap: 4,
                            tahap1Complete: true,
                            tahap2Complete: true,
                            tahap3Complete: true,
                            tahap4Complete: true,
                            tahap1Score: Math.round((tahap1LitScore + tahap1NumScore) / 2),
                            tahap1LiterasiScore: tahap1LitScore,
                            tahap1NumerasiScore: tahap1NumScore,
                            tahap2Score: Math.floor(Math.random() * 21) + 65,
                            tahap4Score: Math.floor(Math.random() * 21) + 65,
                            assessmentResult: {
                                score, total, literasi: lit, numerasi: num, litTotal, numTotal, pct,
                                pass: pct >= 70, date: new Date(), violations: 0
                            },
                            approvedForAssessment: true,
                            approvalDate: new Date(),
                            approvedBy: 'Simulation AI'
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await Progress.bulkWrite(bulkOps, { ordered: false });
        }

        res.json({ success: true, message: `Simulasi berhasil untuk ${students.length} siswa` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetStage3Selected = async (req, res) => {
    try {
        const { usernames } = req.body;
        const query = usernames && Array.isArray(usernames) && usernames.length > 0
            ? { username: { $in: usernames } }
            : {};

        const result = await Progress.updateMany(query, {
            $set: {
                tahap3Complete: false,
                assessmentResult: null,
                approvedForAssessment: false,
                approvedBy: null,
                approvalDate: null,
                generatedAssessment: []
            }
        });
        res.json({ success: true, message: `Berhasil mereset Tahap 3 untuk ${result.modifiedCount} siswa` });
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

        // Clear chat history for Stage 2 reset if specific usernames are provided
        if (usernames && Array.isArray(usernames) && usernames.length > 0) {
            await ChatLog.deleteMany({ username: { $in: usernames } });
        } else if (!usernames) {
            // If no usernames provided (reset all), clear all chat logs
            await ChatLog.deleteMany({});
        }

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

exports.analyzeStudentCompetency = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username diperlukan' });

        const p = await Progress.findOne({ username });
        if (!p) return res.status(404).json({ error: 'Data progres siswa tidak ditemukan' });

        let avgLit = 0, avgNum = 0, totalSkor = 0, lulus = false;
        
        let litT1 = p.tahap1LiterasiScore || 0;
        let numT1 = p.tahap1NumerasiScore || 0;

        if (p.assessmentResult) {
            let litT3 = Math.round((p.assessmentResult.literasi / p.assessmentResult.litTotal) * 100);
            let numT3 = Math.round((p.assessmentResult.numerasi / p.assessmentResult.numTotal) * 100);
            
            avgLit = Math.round((litT1 + litT3) / 2);
            avgNum = Math.round((numT1 + numT3) / 2);
            totalSkor = Math.round((p.assessmentResult.score / p.assessmentResult.total) * 100);
            lulus = p.assessmentResult.pass;
        } else {
            avgLit = litT1;
            avgNum = numT1;
        }

        const dataToAnalyze = {
            username: p.username,
            tahap1_Membaca: p.tahap1Complete ? "Selesai" : "Belum",
            tahap2_Refleksi_Socratic: {
                selesai: p.tahap2Complete,
                nilai: p.tahap2Score || 0,
                siapUji: p.isReady
            },
            tahap3_Uji_Pemahaman: p.assessmentResult ? {
                total_skor: totalSkor,
                literasi_skor: avgLit,
                numerasi_skor: avgNum,
                lulus: lulus
            } : "Belum Asesmen"
        };

        const analysis = await aiService.analyzeCompetency(dataToAnalyze);
        
        res.json({
            success: true,
            data: dataToAnalyze,
            analysis: analysis
        });
    } catch (err) {
        console.error('Error analyzeStudentCompetency:', err);
        res.status(500).json({ error: err.message });
    }
};
