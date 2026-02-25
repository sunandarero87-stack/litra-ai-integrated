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
