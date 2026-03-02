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
        const errorDetails = [];

        rawData.forEach((row, index) => {
            const rowNumber = index + 2; // Data starts at row 2

            // Mapping kolom (support exact and fuzzy match)
            const findKeyExactOrIncludes = (exacts, includesKw) => {
                const foundKey = Object.keys(row).find(k => {
                    const cleanH = k.toLowerCase().trim();
                    if (exacts.map(e => e.toLowerCase()).includes(cleanH)) return true;
                    if (includesKw && cleanH.replace(/[^a-z0-9]/g, '').includes(includesKw.toLowerCase().replace(/[^a-z0-9]/g, ''))) return true;
                    return false;
                });
                return foundKey ? row[foundKey] : undefined;
            };

            const questionText = findKeyExactOrIncludes(['soal', 'pertanyaan'], 'soal');
            const optA = findKeyExactOrIncludes(['a', 'opsi a', 'pilihan a'], 'opsia');
            const optB = findKeyExactOrIncludes(['b', 'opsi b', 'pilihan b'], 'opsib');
            const optC = findKeyExactOrIncludes(['c', 'opsi c', 'pilihan c'], 'opsic');
            const optD = findKeyExactOrIncludes(['d', 'opsi d', 'pilihan d'], 'opsid');
            let correctVal = findKeyExactOrIncludes(['kunci', 'kunci jawaban', 'kunci (a/b/c/d)'], 'kunci');
            const explanation = findKeyExactOrIncludes(['pembahasan', 'penjelasan'], 'bahas');
            const typeVal = findKeyExactOrIncludes(['tipe', 'tipe (literasi/numerasi)', 'jenis'], 'tipe');
            const topicVal = findKeyExactOrIncludes(['topik', 'materi', 'bab'], 'topik');

            if (!questionText || !String(questionText).trim()) {
                // Ignore truly empty rows silently
                if (!optA && !optB && !optC && !optD && !correctVal) return;
                errorDetails.push(`Baris ${rowNumber}: Kolom Soal kosong.`);
                errorCount++;
                return;
            }

            if (!optA || !optB || !optC || !optD) {
                errorDetails.push(`Baris ${rowNumber}: Ada opsi (A/B/C/D) yang kosong.`);
                errorCount++;
                return;
            }

            if (correctVal === undefined || correctVal === null || correctVal === '') {
                errorDetails.push(`Baris ${rowNumber}: Kunci Jawaban kosong.`);
                errorCount++;
                return;
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
                errorDetails.push(`Baris ${rowNumber}: Kunci Jawaban "${correctVal}" tidak valid (harus A, B, C, atau D).`);
                errorCount++;
                return;
            }

            questionsToInsert.push({
                question: String(questionText).trim(),
                options: [String(optA).trim(), String(optB).trim(), String(optC).trim(), String(optD).trim()],
                correct: correctIndex,
                explanation: String(explanation || 'Jawaban benar adalah opsi ' + (['A', 'B', 'C', 'D'][correctIndex])).trim(),
                type: String(typeVal || '').toLowerCase().includes('num') ? 'numerasi' : 'literasi',
                topic: topicVal || 'Analisis Data',
                grade: '7 SMP',
                curriculum: 'Fase D',
                difficulty: 'HOTS'
            });
        });

        if (questionsToInsert.length > 0) {
            await QuestionBank.insertMany(questionsToInsert);
        }

        let message = `Berhasil mengimpor ${questionsToInsert.length} soal.`;
        if (errorCount > 0) {
            const previewErrors = errorDetails.slice(0, 3).join(' | ');
            message += `\n(Gagal/Dilewati: ${errorCount} baris)\nAlasan: ${previewErrors}${errorDetails.length > 3 ? ' ...' : ''}`;
        }

        res.json({
            success: true,
            inserted: questionsToInsert.length,
            failed: errorCount,
            message: message,
            errorDetails: errorDetails
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
