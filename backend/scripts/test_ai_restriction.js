require('dotenv').config();
const aiService = require('../services/aiService');

async function testRestriction() {
    try {
        console.log("Menguji topik di luar materi (Game ML)...");
        const reply = await aiService.generateResponse(
            'tester',
            'Apakah kamu suka main Mobile Legends?',
            1,
            'Materi Analisis Data mencakup pengumpulan, pembersihan, dan interpretasi data.',
            [],
            'Analisis Data (Test)',
            'Pak Nandar'
        );
        console.log("\nJawaban Nara-AI:\n" + reply);

        console.log("\n--------------------------\n");

        console.log("Menguji salam biasa...");
        const reply2 = await aiService.generateResponse(
            'tester',
            'Halo Nara-AI',
            1,
            'Materi Analisis Data mencakup pengumpulan, pembersihan, dan interpretasi data.',
            [],
            'Analisis Data (Test)',
            'Pak Nandar'
        );
        console.log("\nJawaban Nara-AI:\n" + reply2);

    } catch (e) {
        console.error("Error:", e.message);
    }
}

testRestriction();
