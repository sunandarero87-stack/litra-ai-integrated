const QuestionBank = require('../models/QuestionBank');
const aiService = require('../services/aiService');
const ChatLog = require('../models/ChatLog');
const Material = require('../models/Material');

exports.generateFromBank = async (req, res) => {
    try {
        const amount = parseInt(req.body.amount) || 50;
        const username = req.body.username;

        // Fetch student to get their class
        let studentKelas = null;
        if (username) {
            const Student = require('../models/Student');
            const student = await Student.findOne({ username });
            if (student && student.kelas) {
                studentKelas = student.kelas;
            }
        }

        // Ambil soal secara proporsional: Setengah Literasi, Setengah Numerasi
        const queryLit = Math.ceil(amount / 2);
        const queryNum = amount - queryLit;

        // Match condition based on class
        const matchConditionLit = { type: 'literasi' };
        const matchConditionNum = { type: 'numerasi' };
        
        if (studentKelas) {
            let classFilter = { $or: [{ kelas: studentKelas }, { kelas: 'Semua Kelas' }, { kelas: { $exists: false } }] };
            
            const match = studentKelas.match(/^\d+/);
            if (match) {
                const grade = match[0];
                classFilter.$or.push({ kelas: { $regex: new RegExp(`^${grade}(\\.|$)`) } });
            }
            
            matchConditionLit.$or = classFilter.$or;
            matchConditionNum.$or = classFilter.$or;
        }

        const literasiQuestions = await QuestionBank.aggregate([
            { $match: matchConditionLit },
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);

        const numerasiQuestions = await QuestionBank.aggregate([
            { $match: matchConditionNum },
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);

        // Acak urutan sebelum dipilih
        literasiQuestions.sort(() => Math.random() - 0.5);
        numerasiQuestions.sort(() => Math.random() - 0.5);

        let litTake = Math.min(queryLit, literasiQuestions.length);
        let numTake = Math.min(queryNum, numerasiQuestions.length);

        // Jika salah satu tipe kurang dari target, pinjam kuota dari tipe yang lain
        if (litTake < queryLit) {
            numTake = Math.min(numerasiQuestions.length, numTake + (queryLit - litTake));
        } else if (numTake < queryNum) {
            litTake = Math.min(literasiQuestions.length, litTake + (queryNum - numTake));
        }

        let questions = [
            ...literasiQuestions.slice(0, litTake),
            ...numerasiQuestions.slice(0, numTake)
        ];

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

exports.generateAITahap3 = async (req, res) => {
    try {
        const { username, amount = 10 } = req.body;
        
        // Count existing questions in QuestionBank
        const bankCount = await QuestionBank.countDocuments();
        
        if (bankCount < 50) {
            let materialContext = "";

            // Find the last selected material from chat logs
            const lastChat = await ChatLog.findOne({ username, 'metadata.selectedMaterial': { $exists: true, $ne: null } }).sort({ timestamp: -1 });

            if (lastChat && lastChat.metadata && lastChat.metadata.selectedMaterial) {
                const material = await Material.findOne({ name: lastChat.metadata.selectedMaterial });
                if (material) {
                    materialContext = `Judul Materi: ${material.name}\nInti Materi: ${material.content || material.description || ""}`;
                } else {
                    materialContext = `Judul Materi: ${lastChat.metadata.selectedMaterial}`;
                }
            }

            // Fallback if no specific material context is found
            if (!materialContext) {
                const materials = await Material.find({ active: true });
                materialContext = materials.map(m => `Judul Materi ${m.name}:\n${m.content || m.description || ""}`).join('\n\n');
            }

            // Generate questions using AI
            const generatedQuestions = await aiService.generateStage3Assessment(materialContext);
            
            // Format and save to QuestionBank
            let questionsToSave = generatedQuestions.map(q => ({
                question: q.question,
                options: q.options,
                correct: q.correct,
                type: q.type || 'literasi',
                explanation: q.explanation || '',
                kelas: 'Semua Kelas',
                topic: 'Asesmen Tahap 3 (AI Generated)',
                difficulty: 'Sedang'
            }));
            
            // Limit to max 50 total in the database
            const remainingSlots = 50 - bankCount;
            if (questionsToSave.length > remainingSlots) {
                questionsToSave = questionsToSave.slice(0, remainingSlots);
            }
            
            if (questionsToSave.length > 0) {
                await QuestionBank.insertMany(questionsToSave);
            }
        }

        // After ensuring we have questions, fetch randomly from Bank Soal
        const queryLit = Math.ceil(amount / 2);
        const queryNum = amount - queryLit;

        const literasiQuestions = await QuestionBank.aggregate([
            { $match: { type: 'literasi' } },
            { $sample: { size: queryLit + 5 } },
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);

        const numerasiQuestions = await QuestionBank.aggregate([
            { $match: { type: 'numerasi' } },
            { $sample: { size: queryNum + 5 } },
            { $group: { _id: "$question", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);
        
        literasiQuestions.sort(() => Math.random() - 0.5);
        numerasiQuestions.sort(() => Math.random() - 0.5);

        let litTake = Math.min(queryLit, literasiQuestions.length);
        let numTake = Math.min(queryNum, numerasiQuestions.length);

        if (litTake < queryLit) numTake = Math.min(numerasiQuestions.length, numTake + (queryLit - litTake));
        else if (numTake < queryNum) litTake = Math.min(literasiQuestions.length, litTake + (queryNum - numTake));

        let selectedQuestions = [
            ...literasiQuestions.slice(0, litTake),
            ...numerasiQuestions.slice(0, numTake)
        ];
        
        if (selectedQuestions.length === 0) {
            return res.status(500).json({ error: 'Sistem gagal mengambil atau membuat soal. Silakan coba lagi nanti.' });
        }
        
        selectedQuestions.sort(() => Math.random() - 0.5);

        // Map to format for student and shuffle options
        const finalQuestions = selectedQuestions.map(q => {
            const originalCorrectText = q.options[q.correct];
            const shuffledOptions = [...q.options];
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
            return {
                id: q._id.toString(),
                question: q.question,
                options: shuffledOptions,
                correct: shuffledOptions.indexOf(originalCorrectText),
                type: q.type,
                explanation: q.explanation,
                image: q.image
            };
        });

        res.json({ success: true, questions: finalQuestions });
    } catch (error) {
        console.error('Generate AI Tahap 3 Error:', error);
        res.status(500).json({ error: error.message });
    }
};
