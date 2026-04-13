require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Progress = require('./models/Progress');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

async function updateData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const students = await User.find({ role: 'siswa' });
        console.log(`Found ${students.length} students.`);

        if (students.length === 0) {
            console.log('No students found to update.');
            process.exit(0);
        }

        const passCount = Math.round(students.length * 0.82);
        console.log(`Setting ${passCount} students to pass.`);

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const willPass = i < passCount;

            // Generate scores above 80% average
            // Lit & Num total usually 5 each for 10 total
            const litTotal = 5;
            const numTotal = 5;
            const total = 10;

            let literasi, numerasi;
            if (willPass) {
                // Pass students: 4-5 correct each
                literasi = Math.floor(Math.random() * 2) + 4; // 4 or 5
                numerasi = Math.floor(Math.random() * 2) + 4; // 4 or 5
            } else {
                // Fail students: 0-3 correct each
                literasi = Math.floor(Math.random() * 3) + 1; // 1 to 3
                numerasi = Math.floor(Math.random() * 3) + 1; // 1 to 3
            }

            const score = literasi + numerasi;
            const pct = Math.round((score / total) * 100);

            const updateData = {
                tahap: 4,
                tahap1Complete: true,
                tahap2Complete: true,
                tahap3Complete: true,
                tahap4Complete: true,
                tahap2Score: Math.floor(Math.random() * 21) + 80, // 80-100
                tahap4Score: Math.floor(Math.random() * 21) + 80, // 80-100
                assessmentResult: {
                    score: score,
                    total: total,
                    literasi: literasi,
                    numerasi: numerasi,
                    litTotal: litTotal,
                    numTotal: numTotal,
                    pct: pct,
                    pass: willPass,
                    date: new Date(),
                    violations: 0
                },
                approvedForAssessment: true,
                approvalDate: new Date(),
                approvedBy: 'guru_nandar'
            };

            await Progress.findOneAndUpdate(
                { username: student.username },
                { $set: updateData },
                { upsert: true }
            );
        }

        console.log('✅ All student data updated successfully with simulated high-performance values.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating data:', err);
        process.exit(1);
    }
}

updateData();
