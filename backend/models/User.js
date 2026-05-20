const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'guru', 'siswa', 'orang_tua'], required: true },
    kelas: { type: String },
    mapel: { type: String }, // Tambahan field untuk guru: Mata Pelajaran
    linkedStudent: { type: String }, // Username of the linked student
    mustChangePassword: { type: Boolean, default: true },
    photo: { type: String },
    sessionId: { type: String },
    parentSessionId: { type: String }, // Added for simultaneous parent login
    createdAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now }
});

// Indexes untuk mempercepat query
userSchema.index({ role: 1 });          // Untuk filter User.find({ role: 'siswa' })
userSchema.index({ role: 1, kelas: 1 }); // Untuk filter per kelas

module.exports = mongoose.model('User', userSchema);
