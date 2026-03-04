const QuestionBank = require('../models/QuestionBank');

exports.generateFromBank = async (req, res) => {
    try {
        const amount = parseInt(req.body.amount) || 20;

        // Mongoose aggregasi: Group by question agar tidak ada soal duplikat, lalu replaceRoot & sample acak
        const questions = await QuestionBank.aggregate([
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            { $sample: { size: amount } }
        ]);

        // Jika bank soal masih kosong/kurang
        if (questions.length === 0) {
            return res.status(404).json({ error: 'Bank Soal masih kosong. Harap tambahkan soal terlebih dahulu.' });
        }

        res.json({ success: true, questions });
    } catch (error) {
        console.error('Generate From Bank Error:', error);
        res.status(500).json({ error: error.message });
    }
};
