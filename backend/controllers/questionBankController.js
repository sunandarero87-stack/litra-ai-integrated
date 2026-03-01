const xlsx = require('xlsx');
const path = require('path');
const QuestionBank = require('../models/QuestionBank');

exports.getQuestions = async (req, res) => {
    try {
        const questions = await QuestionBank.find().sort({ createdAt: -1 });
        res.json({ success: true, questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const { question, options, correct, explanation, type, topic, grade, curriculum, difficulty } = req.body;

        if (!question || !options || options.length !== 4 || correct === undefined || !explanation) {
            return res.status(400).json({ error: 'Data soal tidak lengkap. Pastikan soal, 4 opsi, kunci jawaban, dan pembahasan terisi.' });
        }

        const newQ = new QuestionBank({ question, options, correct, explanation, type, topic, grade, curriculum, difficulty });
        await newQ.save();

        res.json({ success: true, question: newQ });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await QuestionBank.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file Excel yang diunggah.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawData.length === 0) {
            return res.status(400).json({ error: 'File Excel kosong atau format tidak sesuai.' });
        }

        const questionsToInsert = [];
        let errorCount = 0;

        rawData.forEach((row, index) => {
            // Mapping kolom (support huruf kapital/kecil)
            const getVal = (key) => {
                const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
                return foundKey ? row[foundKey] : undefined;
            };

            const questionText = getVal('Soal');
            const optA = getVal('Opsi A') || getVal('A');
            const optB = getVal('Opsi B') || getVal('B');
            const optC = getVal('Opsi C') || getVal('C');
            const optD = getVal('Opsi D') || getVal('D');
            let correctVal = getVal('Kunci Jawaban') || getVal('Kunci');
            const explanation = getVal('Pembahasan');
            const typeVal = getVal('Tipe') || 'literasi';

            if (!questionText || !optA || !optB || !optC || !optD || correctVal === undefined) {
                errorCount++;
                return; // Skip invalid row
            }

            // Parse Correct Index (A=0, B=1, C=2, D=3) or number
            let correctIndex = -1;
            if (typeof correctVal === 'string') {
                const k = correctVal.trim().toUpperCase();
                if (k === 'A') correctIndex = 0;
                else if (k === 'B') correctIndex = 1;
                else if (k === 'C') correctIndex = 2;
                else if (k === 'D') correctIndex = 3;
                else correctIndex = parseInt(correctVal);
            } else {
                correctIndex = parseInt(correctVal);
            }

            if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
                errorCount++;
                return;
            }

            questionsToInsert.push({
                question: String(questionText).trim(),
                options: [String(optA).trim(), String(optB).trim(), String(optC).trim(), String(optD).trim()],
                correct: correctIndex,
                explanation: String(explanation || 'Jawaban benar adalah opsi ' + (['A', 'B', 'C', 'D'][correctIndex])).trim(),
                type: String(typeVal).toLowerCase().includes('num') ? 'numerasi' : 'literasi',
                topic: getVal('Topik') || 'Analisis Data',
                grade: '7 SMP',
                curriculum: 'Fase D',
                difficulty: 'HOTS'
            });
        });

        if (questionsToInsert.length > 0) {
            await QuestionBank.insertMany(questionsToInsert);
        }

        res.json({
            success: true,
            inserted: questionsToInsert.length,
            failed: errorCount,
            message: `Berhasil mengimpor ${questionsToInsert.length} soal. (Gagal/Dilewati: ${errorCount} baris)`
        });

    } catch (err) {
        console.error("Excel Upload Error:", err);
        res.status(500).json({ error: 'Gagal memproses file Excel: ' + err.message });
    }
};

exports.downloadTemplate = (req, res) => {
    // Create an empty excel file with headers
    const ws_data = [
        ['Soal', 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Kunci (A/B/C/D)', 'Pembahasan', 'Tipe (literasi/numerasi)', 'Topik'],
        // Contoh Data
        [
            'Sebuah kelas memiliki 30 siswa, 15 suka matematika, 10 suka fisika. Berapa peluang terpanggilnya siswa penyuka fisika?',
            '1/2', '1/3', '1/5', '1/4',
            'B',
            'Peluang = Titik sampel / Ruang sampel = 10/30 = 1/3.',
            'numerasi',
            'Analisis Data'
        ]
    ];

    const ws = xlsx.utils.aoa_to_sheet(ws_data);

    // Set column widths
    ws['!cols'] = [
        { wch: 50 }, // Soal
        { wch: 20 }, // A
        { wch: 20 }, // B
        { wch: 20 }, // C
        { wch: 20 }, // D
        { wch: 15 }, // Kunci
        { wch: 40 }, // Pembahasan
        { wch: 25 }, // Tipe
        { wch: 20 }  // Topik
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Template Bank Soal");

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Template_Bank_Soal.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
};
