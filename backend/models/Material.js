const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, default: Date.now },
    size: { type: Number },
    contentDataUrl: { type: String, required: true },
    content: { type: String }, // Field to store extracted text
    kelas: { type: String, default: 'Semua Kelas' }
});

module.exports = mongoose.model('Material', materialSchema);
