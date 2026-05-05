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
                    
                    if (!materialData.content || !materialData.content.trim()) {
                        console.log(`[Material] Teks PDF kosong, mencoba OCR menggunakan Tesseract untuk ${materialData.name}...`);
                        try {
                            const pdf2img = require('pdf-img-convert');
                            const Tesseract = require('tesseract.js');
                            
                            const totalPages = data.numpages || 1;
                            const pagesToConvert = [];
                            for(let i = 1; i <= Math.min(totalPages, 3); i++) {
                                pagesToConvert.push(i);
                            }
                            
                            const pdfArray = await pdf2img.convert(buffer, { width: 1200, page_numbers: pagesToConvert });
                            let ocrText = "";
                            for (let i = 0; i < pdfArray.length; i++) {
                                const { data: { text: pageText } } = await Tesseract.recognize(Buffer.from(pdfArray[i]), 'ind');
                                ocrText += pageText + "\n";
                            }
                            materialData.content = ocrText;
                            console.log(`[Material] OCR berhasil mengekstrak teks untuk ${materialData.name}`);
                        } catch (ocrErr) {
                            console.warn(`[Material] OCR gagal untuk ${materialData.name}:`, ocrErr.message);
                        }
                    }
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
            return res.status(400).json({ error: 'Gagal membaca teks dari dokumen. Format file terlalu kompleks atau hasil scan tidak terbaca oleh sistem OCR kami.' });
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
