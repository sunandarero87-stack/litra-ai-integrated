require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

const initialMaterials = [
    {
        title: 'Pengantar Analisis Data Kelas 7',
        content: `Analisis data adalah proses mengolah data untuk menemukan informasi yang berguna.
        Dalam Informatika SMP Kelas 7, kita fokus pada data angka dan teks.
        Kegunaan analisis data:
        1. Mengambil keputusan yang benar.
        2. Melihat tren (misalnya kenaikan harga barang).
        3. Membantu penelitian.
        Tahapan: Pengumpulan -> Pembersihan -> Pengolahan -> Visualisasi.`
    },
    {
        title: 'Dasar Microsoft Excel',
        content: `Microsoft Excel adalah aplikasi spreadsheet yang sangat populer.
        Istilah penting:
        - Cell: Kotak pertemuan baris dan kolom (contoh: A1).
        - Range: Kumpulan beberapa cell (contoh: A1:C5).
        - Rumus SUM: Untuk menjumlahkan data. Contoh: =SUM(A1:A10)
        - Rumus AVERAGE: Untuk merata-rata data. Contoh: =AVERAGE(B1:B10)`
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing
        await Material.deleteMany({});
        console.log('Cleared old materials.');

        // Insert materials
        await Material.insertMany(initialMaterials);
        console.log('Inserted sample materials.');

        // Create a test student if not exists
        const testUser = 'siswa_teladan';
        const existingStudent = await Student.findOne({ username: testUser });
        if (!existingStudent) {
            await Student.create({ username: testUser, stage: 1 });
            console.log(`Created test student: ${testUser}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
