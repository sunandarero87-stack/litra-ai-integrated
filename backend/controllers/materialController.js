global.DOMMatrix = class {};
global.DOMPoint = class {};
global.DOMRect = class {};
const Material = require('../models/Material');
const mammoth = require('mammoth');

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
