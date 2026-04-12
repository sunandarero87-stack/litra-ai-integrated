const QuestionBank = require('../models/QuestionBank');

exports.generateFromBank = async (req, res) => {
    try {
        const amount = parseInt(req.body.amount) || 20;

        // Ambil soal secara proporsional: Setengah Literasi, Setengah Numerasi
        const queryLit = Math.ceil(amount / 2);
        const queryNum = amount - queryLit;

        const literasiQuestions = await QuestionBank.aggregate([
            { $match: { type: 'literasi' } },
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            { $sample: { size: queryLit } }
        ]);

        const numerasiQuestions = await QuestionBank.aggregate([
            { $match: { type: 'numerasi' } },
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            { $sample: { size: queryNum } }
        ]);

        let questions = [...literasiQuestions, ...numerasiQuestions];

        // Acak urutan gabungan agar posisinya random tiap siswa
        questions.sort(() => Math.random() - 0.5);

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
