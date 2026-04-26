const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String },
    kelas: { type: String },
    stage: { type: String },
    type: { type: String, default: 'Tab Switching' },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Violation', violationSchema);
