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
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
});

// Indexes untuk mempercepat query
chatLogSchema.index({ username: 1, timestamp: -1 }); // Paling sering dipakai: find by username, sort by time
chatLogSchema.index({ username: 1, 'metadata.selectedMaterial': 1 }); // Untuk query fallback material
chatLogSchema.index({ username: 1, 'metadata.type': 1 }); // Untuk query understanding test answer

module.exports = mongoose.model('ChatLog', chatLogSchema);
