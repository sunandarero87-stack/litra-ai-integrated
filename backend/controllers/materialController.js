global.DOMMatrix = class {};
global.DOMPoint = class {};
global.DOMRect = class {};
const axios = require('axios');
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


// Helper function to pre-download all dynamic external images and store them as Base64 inside HTML.
// This ensures that finalized materials never render new/different images after creation.
async function downloadAndInlineImages(html) {
    if (!html) return html;
    const imgSrcRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let match;
    let newHtml = html;
    const uniqueUrls = new Set();

    while ((match = imgSrcRegex.exec(html)) !== null) {
        const url = match[1];
        // We only need to fetch remote http/https images that aren't already embedded as Data URIs
        if (url && url.startsWith('http') && !url.startsWith('data:')) {
            uniqueUrls.add(url);
        }
    }

    for (const url of uniqueUrls) {
        try {
            console.log(`[Image Lock] Attempting to download and inline external image: ${url}`);
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 12000 // Give it enough time (12s) but prevent infinite hanging
            });
            const mimeType = response.headers['content-type'] || 'image/jpeg';
            const b64 = Buffer.from(response.data, 'binary').toString('base64');
            const dataUri = `data:${mimeType};base64,${b64}`;
            
            // Perform clean replacements across entire document
            newHtml = newHtml.split(url).join(dataUri);
            console.log(`[Image Lock] Successfully embedded image.`);
        } catch (e) {
            console.error(`[Image Lock] Warning: failed to pre-cache ${url} : ${e.message}`);
        }
    }
    return newHtml;
}

// Helper used on access to ensure hotfix propagates permanently back to database
async function ensurePersistentConsistency(material) {
    if (material.type !== 'html' || !material.contentDataUrl || !material.contentDataUrl.startsWith('data:text/html;base64,')) {
        return;
    }
    
    const base64Data = material.contentDataUrl.split(',')[1];
    let html = Buffer.from(base64Data, 'base64').toString('utf-8');
    
    // Check if contains dynamic sources that need embedding
    const needsEmbed = /<img[^>]+src\s*=\s*["']http(s?):\/\//gi.test(html) || html.includes('source.unsplash.com');
    
    if (!needsEmbed) return;

    console.log(`[Consistency Check] Material "${material.name}" has dynamic links. Migrating to persistent base64.`);
    
    // Apply fix for obsolete domain
    if (html.includes('source.unsplash.com')) {
        html = html.replace(/source\.unsplash\.com\/featured\/800x500\/\?([a-zA-Z0-9,_]+)/gi, 'loremflickr.com/800/500/$1');
        html = html.replace(/source\.unsplash\.com/gi, 'loremflickr.com');
    }

    const originalHtml = html;
    // Pull data down to embed locally
    html = await downloadAndInlineImages(html);
    
    if (html !== originalHtml) {
        const newBase64 = Buffer.from(html).toString('base64');
        material.contentDataUrl = `data:text/html;base64,${newBase64}`;
        material.size = Buffer.byteLength(html);
        // Update plain text cache
        material.content = html
            .replace(/<style([\s\S]*?)<\/style>/gi, '')
            .replace(/<script([\s\S]*?)<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
            
        await material.save();
        console.log(`[Consistency Check] Migration completed & saved permanently for "${material.name}".`);
    }
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
        
        // Guarantee full image persistence. If external dynamic images exist, download and commit them back to DB permanently.
        await ensurePersistentConsistency(material);

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
        
        // Apply consistency fix before serving
        await ensurePersistentConsistency(material);
        let dataUrl = material.contentDataUrl;

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
        let htmlContent = await aiService.generateLearningMaterial(tujuanPembelajaran, kelas, sumberGambar, jumlahTujuan, jumlahHalaman, judul);
        
        // Lock down generated content by converting ANY dynamic image tags into embedded base64 permanently
        console.log('[AI Material] Pre-loading generated dynamic images to ensure static consistency...');
        htmlContent = await downloadAndInlineImages(htmlContent);

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
            mapel: req.body.mapel || '', // Save provided mapel
            createdBy: req.body.createdBy || '' // Identify owner
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
            // Lock down and freeze images on edit to prevent dynamic changes
            const frozenHtml = await downloadAndInlineImages(htmlContent);

            // Base64 encode htmlContent to satisfy contentDataUrl requirement
            const base64Content = Buffer.from(frozenHtml).toString('base64');
            material.contentDataUrl = `data:text/html;base64,${base64Content}`;

            // Strip HTML tags to get clean plain text content for search / chatbot context
            const plainTextContent = frozenHtml
                .replace(/<style([\s\S]*?)<\/style>/gi, '')
                .replace(/<script([\s\S]*?)<\/script>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            material.content = plainTextContent;
            material.size = Buffer.byteLength(frozenHtml);
        }

        await material.save();
        res.json({ success: true, material });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
