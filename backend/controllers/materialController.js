const Material = require('../models/Material');

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
        const newMaterial = new Material(req.body);
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
