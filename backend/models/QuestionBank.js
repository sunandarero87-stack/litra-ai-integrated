const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [v => v.length === 4, 'Opsi jawaban harus berjumlah 4']
    },
    correct: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    explanation: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['literasi', 'numerasi'],
        default: 'literasi'
    },
    topic: {
        type: String,
        default: 'Analisis Data'
    },
    grade: {
        type: String,
        default: '7 SMP'
    },
    curriculum: {
        type: String,
        default: 'Fase D'
    },
    difficulty: {
        type: String,
        enum: ['LOTS', 'MOTS', 'HOTS'],
        default: 'HOTS'
    }
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
