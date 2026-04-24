global.DOMMatrix = class {};
const mongoose = require('mongoose');
const Material = require('../models/Material');
const pdf = require('pdf-parse');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const materials = await Material.find({ type: 'pdf', content: { $exists: false } });
        console.log(`🔍 Found ${materials.length} PDF materials to process`);

        for (const mat of materials) {
            if (mat.contentDataUrl) {
                try {
                    console.log(`📄 Processing: ${mat.name}...`);
                    const base64Data = mat.contentDataUrl.split(',')[1];
                    if (base64Data) {
                        const buffer = Buffer.from(base64Data, 'base64');
                        const data = await pdf(buffer);
                        mat.content = data.text;
                        await mat.save();
                        console.log(`✅ Extracted ${data.numpages} pages for ${mat.name}`);
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
