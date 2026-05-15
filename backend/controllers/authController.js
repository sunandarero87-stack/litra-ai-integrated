const User = require('../models/User');

// HELPER: Validation to prevent same subject in same class assigned to different teachers
// HELPER: Validation to prevent same subject in same class assigned to different teachers
async function checkTeacherAssignmentConflicts(proposedTeachers, excludeUsername = null) {
    try {
        // 1. Fetch all current DB teachers to map existing ownerships
        const query = { role: 'guru' };
        if (excludeUsername) query.username = { $ne: excludeUsername };
        const currentTeachers = await User.find(query).lean(); // Use lean for performance

        const registry = new Map();
        const getCombos = (t) => {
            if (!t) return { classes: [], mapels: [] };
            const classes = String(t.kelas || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
            const mapels = String(t.mapel || '').split(',').map(m => m.trim().toLowerCase()).filter(Boolean);
            return { classes, mapels };
        };

        // Pre-fill registry with existing DB allocations
        for (const t of currentTeachers) {
            const { classes, mapels } = getCombos(t);
            const ownerName = t.name || t.username;
            
            for (const c of classes) {
                for (const m of mapels) {
                    // Jika ada guru "Semua Kelas", maka semua kelas untuk mapel tersebut terkunci
                    if (c === 'semua kelas') {
                        registry.set(`any|${m}`, ownerName);
                    }
                    registry.set(`${c}|${m}`, ownerName);
                }
            }
        }

        // 2. Check proposed teachers matrix
        for (const proposed of proposedTeachers) {
            if (!proposed || proposed.role !== 'guru') continue;
            const { classes, mapels } = getCombos(proposed);
            const proposedName = proposed.name || proposed.username;
            
            for (const c of classes) {
                for (const m of mapels) {
                    // Cek konflik dengan "Semua Kelas" atau kelas spesifik
                    const existingOwner = registry.get(`${c}|${m}`) || registry.get(`any|${m}`);
                    
                    if (existingOwner) {
                        // Jika owner-nya bukan guru yang sama (cek username atau name)
                        if (existingOwner !== proposedName && existingOwner !== proposed.username) {
                            return {
                                conflict: true,
                                error: `🚨 GAGAL: Mata Pelajaran [${m.toUpperCase()}] untuk Kelas [${c.toUpperCase()}] sudah diampu oleh Guru "${existingOwner}". Silakan pilih kelas atau mapel berbeda.`
                            };
                        }
                    }
                    
                    // Jika yang diinput adalah "Semua Kelas", cek apakah mapel ini sudah diampu guru lain di kelas manapun
                    if (c === 'semua kelas') {
                        for (const [key, owner] of registry.entries()) {
                            if (key.endsWith(`|${m}`) && owner !== proposedName && owner !== proposed.username) {
                                return {
                                    conflict: true,
                                    error: `🚨 GAGAL: Mata Pelajaran [${m.toUpperCase()}] tidak bisa diset "Semua Kelas" karena sudah ada guru lain yang mengampu mapel ini di kelas tertentu.`
                                };
                            }
                        }
                    }
                }
            }
        }
        return { conflict: false };
    } catch (err) {
        console.error('[Validator Error]', err);
        return { conflict: false }; 
    }
}

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
        let { username, password } = req.body;
        // Normalize username for case-insensitive matching
        username = String(username || '').trim().toLowerCase();
        
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
        let { username, newPassword } = req.body;
        username = String(username || '').trim().toLowerCase();
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
        let { username, name, photo } = req.body;
        username = String(username || '').trim().toLowerCase();
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

// Admin: Update Single User
const updateUser = async (req, res) => {
    try {
        let { username } = req.params;
        username = String(username || '').trim().toLowerCase();
        const updates = req.body;
        
        // Prevent hacking crucial security fields through basic update if not careful
        delete updates.password; 
        delete updates.role; // Typically role shouldn't toggle via basic modal for safety
        
        // NEW: Enforce strict mapping validation to prevent subject clashes
        if (updates.mapel || updates.kelas) {
            // Fake teacher object context from current known update payload
            const validatorPayload = [{ ...updates, role: 'guru', username }]; 
            const validation = await checkTeacherAssignmentConflicts(validatorPayload, username);
            if (validation.conflict) {
                return res.status(400).json({ error: validation.error });
            }
        }
        
        const user = await User.findOneAndUpdate({ username }, updates, { new: true });
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
        
        res.json({ success: true, message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Bulk Edit Class
const bulkUpdateClass = async (req, res) => {
    try {
        const { fromClass, toClass, role } = req.body; // 'siswa' or 'guru'
        if (!fromClass || !toClass) return res.status(400).json({ error: 'Kelas asal dan tujuan wajib diisi' });
        
        const query = { kelas: fromClass };
        if (role) query.role = role;

        const result = await User.updateMany(query, { $set: { kelas: toClass } });
        res.json({ 
            success: true, 
            message: `Berhasil memperbarui ${result.modifiedCount} akun.`, 
            modifiedCount: result.modifiedCount 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -sessionId').lean();
        // Optimization: Students only need basic info to reduce payload size.
        // Teacher photo is kept for chatbot, but student photo is removed from global list.
        const optimizedUsers = users.map(u => {
            if (u.role === 'siswa') {
                delete u.photo;
            }
            return u;
        });
        res.json(optimizedUsers);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createUsers = async (req, res) => {
    try {
        let usersToCreate = Array.isArray(req.body) ? req.body : [req.body];

        // Normalize usernames to lowercase
        usersToCreate = usersToCreate.map(u => ({
            ...u,
            username: String(u.username || '').replace(/\s+/g, '').toLowerCase()
        }));

        // NEW: Enforce strict mapping validation for new additions
        const validation = await checkTeacherAssignmentConflicts(usersToCreate);
        if (validation.conflict) {
            return res.status(400).json({ error: validation.error });
        }

        const requestedUsernames = usersToCreate.map(u => u.username);
        const existingUsers = await User.find({ username: { $in: requestedUsernames } });
        const existingUsernames = existingUsers.map(u => u.username);

        // Jika user tunggal (dari modal) dan sudah ada, beri error spesifik
        if (usersToCreate.length === 1 && existingUsernames.includes(usersToCreate[0].username)) {
            return res.status(400).json({ error: `🚨 GAGAL: Username "${usersToCreate[0].username}" sudah terdaftar. Gunakan username lain.` });
        }

        const newUsers = usersToCreate.filter(u => !existingUsernames.includes(u.username));
        if (newUsers.length > 0) {
            await User.insertMany(newUsers);
        } else {
            return res.status(400).json({ error: 'Tidak ada user baru yang ditambahkan (semua username sudah ada).' });
        }

        res.json({ message: `${newUsers.length} user(s) created.`, count: newUsers.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        let { username } = req.params;
        username = String(username || '').trim().toLowerCase();
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

        const targetRole = req.query.role === 'guru' ? 'guru' : 'siswa';

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
            const kelas = findKey('kelas') || (targetRole === 'siswa' ? '7A' : 'Semua Kelas');
            const mapel = findKey('mapel') || findKey('mata pelajaran') || '';
            const defaultPassword = targetRole === 'guru' ? 'guru123' : 'siswa123';
            const password = findKey('password') || defaultPassword;

            if (username && name) {
                const safeUsername = String(username).replace(/\s+/g, '').toLowerCase();
                usersToInsert.push({
                    username: safeUsername,
                    name: String(name).trim(),
                    kelas: String(kelas).trim(),
                    mapel: String(mapel).trim(), // Assign subject if available
                    role: targetRole,
                    password: String(password).trim() || defaultPassword,
                    mustChangePassword: true
                });
            } else {
                errorCount++;
            }
        });

        if (usersToInsert.length === 0) {
            return res.status(400).json({ error: 'Tidak ada data valid yang bisa disimpan. Pastikan judul kolom ada "Username" dan "Nama".' });
        }

        // NEW: Enforce strict mapping validation BEFORE batch insert
        const validation = await checkTeacherAssignmentConflicts(usersToInsert);
        if (validation.conflict) {
            return res.status(400).json({ error: validation.error });
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

        const roleLabel = targetRole === 'guru' ? 'guru' : 'siswa';
        res.json({
            success: true,
            message: `Berhasil mengimpor ${importCount} akun ${roleLabel}.${errorCount > 0 ? ` (Ada ${errorCount} baris bermasalah diabaikan).` : ''}${existingUsernames.length > 0 ? ` (${existingUsernames.length} akun terlewat karena username sudah ada).` : ''}`
        });

    } catch (err) {
        console.error('Error saat upload excel pengguna:', err);
        res.status(500).json({ error: 'Gagal membaca file Excel. Pastikan format file benar (.xlsx) dan tidak corrupt.' });
    }
};

const bulkDeleteUsers = async (req, res) => {
    try {
        const { usernames } = req.body;
        const role = req.query.role === 'guru' ? 'guru' : 'siswa';

        if (!Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ error: 'Tidak ada user yang dipilih untuk dihapus' });
        }

        const result = await User.deleteMany({ username: { $in: usernames }, role: role });
        res.json({ message: `Berhasil menghapus ${result.deletedCount} akun ${role}` });
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
        // Pengecualian: Admin dan Guru diizinkan memiliki beberapa sesi/tab untuk memudahkan manajemen
        if (user.role === 'siswa' && sessionId && user.sessionId && user.sessionId !== sessionId) {
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
    resetUserPassword,
    updateUser,
    bulkUpdateClass
};
