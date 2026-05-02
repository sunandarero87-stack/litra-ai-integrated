const User = require('../models/User');

const initDefaultUsers = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            await User.insertMany([
                {
                    username: 'admin',
                    password: 'admin123',
                    name: 'Administrator',
                    role: 'admin',
                    mustChangePassword: true
                },
                {
                    username: 'guru',
                    password: 'guru123',
                    name: 'Pak Nandar',
                    role: 'guru',
                    kelas: 'Semua Kelas',
                    mustChangePassword: true
                }
            ]);
            console.log('✅ Default users initialized.');
        }
    } catch (err) {
        console.error('Error initializing default users:', err);
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
        const user = await User.findOneAndUpdate(
            { username, password },
            { sessionId },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah!' });
        }
        res.json({ message: 'Login success', user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const user = await User.findOneAndUpdate(
            { username },
            { password: newPassword, mustChangePassword: false },
            { returnDocument: 'after' }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Password updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const user = await User.findOneAndUpdate(
            { username },
            { password: newPassword, mustChangePassword: true }, // Reset forces change on login
            { returnDocument: 'after' }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Password reset successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};


const updateProfile = async (req, res) => {
    try {
        const { username, name, photo } = req.body;
        const user = await User.findOneAndUpdate(
            { username },
            { name, photo },
            { returnDocument: 'after' }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createUsers = async (req, res) => {
    try {
        const usersToCreate = Array.isArray(req.body) ? req.body : [req.body];

        const existingUsers = await User.find({ username: { $in: usersToCreate.map(u => u.username) } });
        const existingUsernames = existingUsers.map(u => u.username);

        const newUsers = usersToCreate.filter(u => !existingUsernames.includes(u.username));
        if (newUsers.length > 0) {
            await User.insertMany(newUsers);
        }

        res.json({ message: `${newUsers.length} user(s) created.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { username } = req.params;
        await User.findOneAndDelete({ username });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File Excel tidak ditemukan dalam request!' });
        }

        const xlsx = require('xlsx');
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (rawData.length === 0) {
            return res.status(400).json({ error: 'File Excel kosong atau format tidak sesuai.' });
        }

        const usersToInsert = [];
        let errorCount = 0;

        rawData.forEach((row, index) => {
            // Mapping kolom case-insensitive
            const findKey = (kw) => {
                const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(kw.toLowerCase()));
                return foundKey ? row[foundKey] : undefined;
            };

            const username = findKey('username') || findKey('user');
            const name = findKey('nama') || findKey('name');
            const kelas = findKey('kelas') || '7A';
            const password = findKey('password') || 'siswa123';

            if (username && name) {
                const safeUsername = String(username).replace(/\s+/g, '').toLowerCase();
                usersToInsert.push({
                    username: safeUsername,
                    name: String(name).trim(),
                    kelas: String(kelas).trim(),
                    role: 'siswa',
                    password: String(password).trim() || 'siswa123',
                    mustChangePassword: true
                });
            } else {
                errorCount++;
            }
        });

        if (usersToInsert.length === 0) {
            return res.status(400).json({ error: 'Tidak ada data valid yang bisa disimpan. Pastikan judul kolom ada "Username" dan "Nama".' });
        }

        // Filter duplicates against existing DB
        const existingUsers = await User.find({ username: { $in: usersToInsert.map(u => u.username) } });
        const existingUsernames = existingUsers.map(u => u.username);
        const newUsers = usersToInsert.filter(u => !existingUsernames.includes(u.username));

        let importCount = 0;
        if (newUsers.length > 0) {
            await User.insertMany(newUsers);
            importCount = newUsers.length;
        }

        res.json({
            success: true,
            message: `Berhasil mengimpor ${importCount} akun siswa.${errorCount > 0 ? ` (Ada ${errorCount} baris bermasalah diabaikan).` : ''}${existingUsernames.length > 0 ? ` (${existingUsernames.length} akun terlewat karena username sudah ada).` : ''}`
        });

    } catch (err) {
        console.error('Error saat upload excel pengguna:', err);
        res.status(500).json({ error: 'Gagal membaca file Excel. Pastikan format file benar (.xlsx) dan tidak corrupt.' });
    }
};

const bulkDeleteUsers = async (req, res) => {
    try {
        const { usernames } = req.body;
        if (!Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ error: 'Tidak ada user yang dipilih untuk dihapus' });
        }

        const result = await User.deleteMany({ username: { $in: usernames }, role: 'siswa' });
        res.json({ message: `Berhasil menghapus ${result.deletedCount} akun siswa` });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const heartbeat = async (req, res) => {
    try {
        const { username, sessionId } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });
        
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Jika sessionId tidak cocok, berarti ada login baru di tempat lain
        if (user.sessionId && user.sessionId !== sessionId) {
            return res.status(401).json({ error: 'SESSION_EXPIRED', message: 'Akun Anda sedang digunakan di perangkat lain. Sesi ini telah berakhir.' });
        }

        await User.findOneAndUpdate(
            { username },
            { lastSeen: new Date() }
        );
        res.json({ message: 'Heartbeat recorded' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    initDefaultUsers,
    login,
    changePassword,
    updateProfile,
    getUsers,
    createUsers,
    deleteUser,
    uploadExcel,
    bulkDeleteUsers,
    heartbeat,
    resetUserPassword
};
