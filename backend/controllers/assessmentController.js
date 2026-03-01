const QuestionBank = require('../models/QuestionBank');

exports.generateFromBank = async (req, res) => {
    try {
        const amount = parseInt(req.body.amount) || 20;

        // Mongoose $sample fetches N random documents efficiently
        const questions = await QuestionBank.aggregate([{ $sample: { size: amount } }]);

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
