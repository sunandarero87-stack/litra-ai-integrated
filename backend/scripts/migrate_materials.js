global.DOMMatrix = class {}; // Mocks for pdf-parse in Node.js
global.DOMPoint = class {};
global.DOMRect = class {};
const mongoose = require('mongoose');
const Material = require('../models/Material');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const materials = await Material.find({ 
            $or: [
                { type: 'pdf', content: { $exists: false } },
                { type: 'docx', content: { $exists: false } }
            ]
        });
        console.log(`🔍 Found ${materials.length} materials to process (PDF/DOCX)`);

        for (const mat of materials) {
            if (mat.contentDataUrl) {
                try {
                    console.log(`📄 Processing: ${mat.name}...`);
                    const base64Data = mat.contentDataUrl.split(',')[1];
                    if (base64Data) {
                        const buffer = Buffer.from(base64Data, 'base64');
                        if (mat.type === 'pdf') {
                            const data = await pdf(buffer);
                            mat.content = data.text;
                            console.log(`✅ Extracted ${data.numpages} pages from PDF ${mat.name}`);
                        } else if (mat.type === 'docx') {
                            const result = await mammoth.extractRawText({ buffer: buffer });
                            mat.content = result.value;
                            console.log(`✅ Extracted text from DOCX ${mat.name}`);
                        }
                        await mat.save();
                    }
                } catch (err) {
                    console.error(`❌ Error parsing ${mat.name}:`, err.message);
                }
            }
        }

        console.log('🏁 Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
