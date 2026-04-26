const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    username: { type: String, required: true },
    name: { type: String },
    status: { type: String, enum: ['hadir', 'sakit', 'izin', 'alpha'], required: true },
    kelas: { type: String }
}, { timestamps: true });

// Ensure one record per student per day
attendanceSchema.index({ date: 1, username: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
