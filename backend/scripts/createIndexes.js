/**
 * Script: createIndexes.js
 * Fungsi: Membuat semua index MongoDB yang diperlukan untuk performa optimal.
 * Cara pakai: node scripts/createIndexes.js
 *             (Cukup dijalankan SEKALI di Railway console / lokal)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/litra-ai';

async function createIndexes() {
    try {
        console.log('🔗 Menghubungkan ke MongoDB...');
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Terhubung!\n');

        const db = mongoose.connection.db;

        // ---- ChatLog Indexes ----
        console.log('📑 Membuat index untuk koleksi chatlogs...');
        const chatLogs = db.collection('chatlogs');
        await chatLogs.createIndex({ username: 1, timestamp: -1 }, { background: true, name: 'idx_username_timestamp' });
        await chatLogs.createIndex({ username: 1, 'metadata.selectedMaterial': 1 }, { background: true, name: 'idx_username_material' });
        await chatLogs.createIndex({ username: 1, 'metadata.type': 1 }, { background: true, name: 'idx_username_metatype' });
        console.log('  ✅ ChatLog indexes selesai');

        // ---- Progress Indexes ----
        console.log('📊 Membuat index untuk koleksi progresses...');
        const progresses = db.collection('progresses');
        await progresses.createIndex({ isChatting: 1, lastChatActivity: 1 }, { background: true, name: 'idx_chatting_activity' });
        await progresses.createIndex({ username: 1, isChatting: 1 }, { background: true, name: 'idx_username_chatting' });
        console.log('  ✅ Progress indexes selesai');

        // ---- User Indexes ----
        console.log('👤 Membuat index untuk koleksi users...');
        const users = db.collection('users');
        await users.createIndex({ role: 1 }, { background: true, name: 'idx_role' });
        await users.createIndex({ role: 1, kelas: 1 }, { background: true, name: 'idx_role_kelas' });
        console.log('  ✅ User indexes selesai');

        // ---- List semua index ----
        console.log('\n📋 Daftar index aktif:');
        const collections = ['chatlogs', 'progresses', 'users', 'materials'];
        for (const coll of collections) {
            const indexes = await db.collection(coll).indexes().catch(() => []);
            if (indexes.length > 0) {
                console.log(`\n  [${coll}]`);
                indexes.forEach(idx => {
                    console.log(`    - ${idx.name}: ${JSON.stringify(idx.key)}`);
                });
            }
        }

        console.log('\n🎉 Semua index berhasil dibuat! Aplikasi akan jauh lebih cepat.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createIndexes();
