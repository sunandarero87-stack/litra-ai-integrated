global.DOMMatrix = class {}; // Mocks for pdf-parse in Node.js
global.DOMPoint = class {};
global.DOMRect = class {};
const Material = require('../models/Material');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

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
        const dataUrl = material.contentDataUrl;
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const ext = material.type || 'pdf';
            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            res.set('Content-Type', contentType);
            // using inline to render within iframe instead of attach
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
                    const data = await pdf(buffer);
                    materialData.content = data.text;
                    console.log(`[Material] Extracted text from PDF: ${materialData.name} (${data.numpages} pages)`);
                }
            } catch (parseErr) {
                console.warn(`[Material] Failed to parse PDF text for ${materialData.name}:`, parseErr.message);
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
            }
        }

        // Validasi konten: tolak jika kosong
        if (!materialData.content || !materialData.content.trim()) {
            return res.status(400).json({ error: 'Gagal membaca teks dari dokumen. Pastikan file (PDF/DOCX) berisi teks tulisan asli dan BUKAN berupa gambar hasil scan foto.' });
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
