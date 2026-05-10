global.DOMMatrix = class {};
global.DOMPoint = class {};
global.DOMRect = class {};
const Material = require('../models/Material');
const mammoth = require('mammoth');
const aiService = require('../services/aiService');

// pdf-parse v2 helper
async function parsePdfBuffer(buffer) {
    const pdfModule = require('pdf-parse');
    if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({});
        await parser.load(buffer);
        const text = parser.getText();
        const info = parser.getInfo();
        return { text: text || '', numpages: info.pages || 1 };
    }
    if (typeof pdfModule === 'function') {
        const data = await pdfModule(buffer);
        return { text: data.text || '', numpages: data.numpages || 1 };
    }
    throw new Error('pdf-parse module format not recognized');
}

exports.getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({}, { contentDataUrl: 0 }).sort({ date: -1 });
        res.json({ success: true, materials });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMaterialById = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ error: 'Material not found' });
        
        // Hot-fix old deprecated source.unsplash.com links
        if (material.type === 'html' && material.contentDataUrl && material.contentDataUrl.includes('source.unsplash.com')) {
            const matches = material.contentDataUrl.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];
                let html = Buffer.from(base64Data, 'base64').toString('utf8');
                html = html.replace(/source\.unsplash\.com\/featured\/800x500\/\?([a-zA-Z0-9,_]+)/gi, 'loremflickr.com/800/500/$1');
                html = html.replace(/source\.unsplash\.com/gi, 'loremflickr.com');
                const newBase64 = Buffer.from(html).toString('base64');
                material.contentDataUrl = `data:${contentType};base64,${newBase64}`;
            }
        }

        res.json({ success: true, material });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMaterialContent = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material || !material.contentDataUrl) {
            return res.status(404).json({ error: 'Material not found' });
        }
        
        let dataUrl = material.contentDataUrl;

        // Hot-fix old deprecated source.unsplash.com links
        if (material.type === 'html' && dataUrl.includes('source.unsplash.com')) {
            const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];
                let html = Buffer.from(base64Data, 'base64').toString('utf8');
                html = html.replace(/source\.unsplash\.com\/featured\/800x500\/\?([a-zA-Z0-9,_]+)/gi, 'loremflickr.com/800/500/$1');
                html = html.replace(/source\.unsplash\.com/gi, 'loremflickr.com');
                const newBase64 = Buffer.from(html).toString('base64');
                dataUrl = `data:${contentType};base64,${newBase64}`;
            }
        }

        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            res.set('Content-Type', contentType);
            res.set('Content-Disposition', `inline; filename="${material.name}"`);
            res.send(buffer);
        } else {
            res.status(400).json({ error: 'Invalid data URL format' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMaterial = async (req, res) => {
    try {
        const materialData = req.body;
        
        // Extract text content if it's a PDF
        if (materialData.type === 'pdf' && materialData.contentDataUrl) {
            try {
                const base64Data = materialData.contentDataUrl.split(',')[1];
                if (base64Data) {
                    const buffer = Buffer.from(base64Data, 'base64');
                    const data = await parsePdfBuffer(buffer);
                    materialData.content = data.text;
                    console.log(`[Material] Extracted text from PDF: ${materialData.name} (${data.numpages} pages, ${(materialData.content || '').length} chars)`);
                }
            } catch (parseErr) {
                console.warn(`[Material] Failed to parse PDF text for ${materialData.name}:`, parseErr.message);
                materialData.content = '';
            }
        } 
        // Extract text content if it's a DOCX or DOC
        else if ((materialData.type === 'docx' || materialData.type === 'doc') && materialData.contentDataUrl) {
            try {
                const base64Data = materialData.contentDataUrl.split(',')[1];
                if (base64Data) {
                    const buffer = Buffer.from(base64Data, 'base64');
                    const result = await mammoth.extractRawText({ buffer: buffer });
                    materialData.content = result.value;
                    console.log(`[Material] Extracted text from DOCX/DOC: ${materialData.name}`);
                }
            } catch (parseErr) {
                console.warn(`[Material] Failed to parse DOCX text for ${materialData.name}:`, parseErr.message);
                materialData.content = '';
            }
        }

        const newMaterial = new Material(materialData);
        await newMaterial.save();
        res.json({ success: true, material: newMaterial });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        await Material.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateMaterialFromAI = async (req, res) => {
    try {
        const { judul, tujuanPembelajaran, kelas, sumberGambar, jumlahTujuan, jumlahHalaman } = req.body;
        if (!judul || !tujuanPembelajaran || !kelas) {
            return res.status(400).json({ error: 'Judul, Tujuan Pembelajaran, dan Kelas wajib diisi.' });
        }

        console.log(`[AI Material] Generating material: "${judul}" for Class: ${kelas}, Objective: ${tujuanPembelajaran}, Image Source: ${sumberGambar}, Objectives Count: ${jumlahTujuan}, Pages Count: ${jumlahHalaman}`);
        
        // Call AI Service to generate HTML content
        const htmlContent = await aiService.generateLearningMaterial(tujuanPembelajaran, kelas, sumberGambar, jumlahTujuan, jumlahHalaman, judul);

        // Strip HTML tags to get clean plain text content for search / chatbot context
        const plainTextContent = htmlContent
            .replace(/<style([\s\S]*?)<\/style>/gi, '')
            .replace(/<script([\s\S]*?)<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Create Mongoose Document
        const materialName = judul;
        
        // Base64 encode htmlContent to satisfy contentDataUrl requirement
        const base64Content = Buffer.from(htmlContent).toString('base64');
        const contentDataUrl = `data:text/html;base64,${base64Content}`;

        const newMaterial = new Material({
            name: materialName,
            type: 'html', // save as html type
            date: new Date(),
            size: Buffer.byteLength(htmlContent),
            contentDataUrl: contentDataUrl,
            content: plainTextContent, // store full text for chatbot/search context
            kelas: kelas,
            mapel: req.body.mapel || '' // Save provided mapel
        });

        await newMaterial.save();
        console.log(`[AI Material] Successfully generated and saved: ${materialName}`);

        res.json({ success: true, material: newMaterial });
    } catch (err) {
        console.error('[AI Material] Error generating material:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { htmlContent, name } = req.body;

        const material = await Material.findById(id);
        if (!material) return res.status(404).json({ error: 'Material not found' });

        if (name) material.name = name;

        if (htmlContent) {
            // Base64 encode htmlContent to satisfy contentDataUrl requirement
            const base64Content = Buffer.from(htmlContent).toString('base64');
            material.contentDataUrl = `data:text/html;base64,${base64Content}`;

            // Strip HTML tags to get clean plain text content for search / chatbot context
            const plainTextContent = htmlContent
                .replace(/<style([\s\S]*?)<\/style>/gi, '')
                .replace(/<script([\s\S]*?)<\/script>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            material.content = plainTextContent;
            material.size = Buffer.byteLength(htmlContent);
        }

        await material.save();
        res.json({ success: true, material });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
