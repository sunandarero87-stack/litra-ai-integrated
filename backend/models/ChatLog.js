const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    username: { type: String, required: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    content: { type: String, required: true },
    model: { type: String },
    tokens: {
        prompt_tokens: { type: Number },
        completion_tokens: { type: Number },
        total_tokens: { type: Number }
    },
    metadata: {
        stage: { type: Number },
        selectedMaterial: { type: String },
        violations: { type: Boolean, default: false }
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
