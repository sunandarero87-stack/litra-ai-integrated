require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';
const BATCH_SIZE = 20;
const TOTAL_NEEDED = 500;
const TOTAL_BATCHES = Math.ceil(TOTAL_NEEDED / BATCH_SIZE);

async function seedQuestionBank() {
    try {
        console.log(`Menghubungkan ke MongoDB: ${MONGODB_URI}`);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Terhubung ke database.');

        const currentCount = await QuestionBank.countDocuments();
        console.log(`Saat ini ada ${currentCount} soal di Bank Soal.`);

        let remainingBatches = TOTAL_BATCHES - Math.floor(currentCount / BATCH_SIZE);
        if (remainingBatches <= 0) {
            console.log('🎉 Bank Soal sudah terisi penuh (>= 500 soal). Tidak perlu seeding lagi.');
            process.exit(0);
        }

        console.log(`🚀 Memulai pembuatan ${remainingBatches * BATCH_SIZE} soal baru dalam ${remainingBatches} batch (20 soal per batch)...`);

        for (let i = 1; i <= remainingBatches; i++) {
            console.log(`\n⏳ [Batch ${i}/${remainingBatches}] Meminta AI meracik 20 soal HOTS Fase D (Topik: Analisis Data)...`);
            console.time(`Batch ${i} Duration`);

            try {
                // We will add this function to aiService.js next
                const questions = await aiService.generateBankSoalBatch();

                if (questions && questions.length > 0) {
                    // Validasi dan set context
                    const formattedQuestions = questions.map(q => ({
                        question: q.question,
                        options: q.options,
                        correct: q.correct,
                        explanation: q.explanation,
                        type: q.type || (Math.random() > 0.5 ? 'literasi' : 'numerasi'), // fallback 
                        topic: 'Analisis Data',
                        grade: '7 SMP',
                        curriculum: 'Fase D',
                        difficulty: 'HOTS'
                    }));

                    await QuestionBank.insertMany(formattedQuestions);
                    console.log(`✅ Berhasil menyimpan ${formattedQuestions.length} soal ke database!`);
                } else {
                    console.log(`⚠️ AI merespons dengan array kosong pada Batch ${i}. Melewati...`);
                }
            } catch (err) {
                console.error(`❌ Gagal pada Batch ${i}:`, err.message);
                console.log("Menunggu 5 detik sebelum melanjutkan batch berikutnya untuk menghindari pemblokiran beruntun...");
                await new Promise(r => setTimeout(r, 5000));
            }

            console.timeEnd(`Batch ${i} Duration`);

            // Jeda antar batch untuk menghindari rate limit AI Provider
            if (i < remainingBatches) {
                console.log("Menunggu 10 detik sebelum batch berikutnya...");
                await new Promise(r => setTimeout(r, 10000));
            }
        }

        const finalCount = await QuestionBank.countDocuments();
        console.log(`\n🎉 SELESAI! Total soal di Bank Soal saat ini: ${finalCount}`);
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

seedQuestionBank();
