require('dotenv').config();
const aiService = require('./services/aiService');

const mockReflection = [
    { question: "Apa yang dipelajari?", answer: "Saya belajar tentang analisis data." },
    { question: "Apa yang sulit?", answer: "Tidak ada yang sulit." }
];

const mockMaterial = "Analisis data adalah proses penting dalam mengambil keputusan dari sekumpulan data mentah.";

async function run() {
    console.log("Mulai meracik soal percobaan...");
    console.time("RacikWaktu");
    try {
        const result = await aiService.generateAssessment("siswa_test", mockReflection, mockMaterial);
        console.log("Berhasil diracik:", result.length, "soal");
        if (result.length > 0) {
            console.log(result[0]);
        }
    } catch (e) {
        console.error("Gagal Total:", e);
    }
    console.timeEnd("RacikWaktu");
}

run();
