const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    tahap: { type: Number, default: 1 },
    tahap1Complete: { type: Boolean, default: false },
    tahap1Score: { type: Number, default: 0 },
    tahap1LiterasiScore: { type: Number, default: 0 },
    tahap1NumerasiScore: { type: Number, default: 0 },
    tahap2Complete: { type: Boolean, default: false },
    tahap3Complete: { type: Boolean, default: false },
    tahap4Complete: { type: Boolean, default: false },
    tahap2Score: { type: Number, default: 0 },
    tahap4Score: { type: Number, default: 0 },
    tahap4Analysis: { type: Object, default: null },
    tahap4Details: { type: Array, default: [] },
    reflectionAnswers: { type: Array, default: [] },
    aiReadiness: { type: String },
    isReady: { type: Boolean, default: false },
    generatedAssessment: { type: Array, default: [] },
    // Assessment Results
    assessmentResult: {
        score: Number,
        total: Number,
        literasi: Number,
        numerasi: Number,
        litTotal: Number,
        numTotal: Number,
        pct: Number,
        pass: Boolean,
        date: Date,
        violations: Number
    },
    // Assessment Approvals
    approvedForAssessment: { type: Boolean, default: false },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    isChatting: { type: Boolean, default: false },
    lastChatActivity: { type: Date }
});

// Indexes untuk mempercepat query
progressSchema.index({ username: 1 }); // Sudah unique, tapi eksplisit agar optimal
progressSchema.index({ isChatting: 1, lastChatActivity: 1 }); // Untuk checkQueue & timeout cleanup
progressSchema.index({ username: 1, isChatting: 1 }); // Untuk find + count aktif

module.exports = mongoose.model('Progress', progressSchema);
