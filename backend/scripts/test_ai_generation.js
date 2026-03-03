require('dotenv').config();
const aiService = require('../services/aiService');

async function testGeneration() {
    try {
        console.log("Menguji pembuatan 2 soal dengan format delimiter |||...");

        const objectives = ["Memahami pengertian sel tumbuhan", "Memahami fungsi kloroplas"];

        const generated = await aiService.generateBankSoal(objectives, 2);

        console.log("HASIL PARSING:\n", JSON.stringify(generated, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testGeneration();
