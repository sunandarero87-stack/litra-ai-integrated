const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'guru', 'siswa'], required: true },
    kelas: { type: String },
    mustChangePassword: { type: Boolean, default: true },
    photo: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
