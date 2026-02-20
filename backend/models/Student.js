const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    stage: { type: Number, default: 1 }, // 1: Belajar, 2: Latihan, 3: Asesmen
    lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
