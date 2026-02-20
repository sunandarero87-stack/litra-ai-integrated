const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'Informatika' },
    active: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
