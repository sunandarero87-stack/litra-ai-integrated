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
        const user = await User.findOne({ username, password });
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

module.exports = {
    initDefaultUsers,
    login,
    changePassword,
    updateProfile,
    getUsers,
    createUsers,
    deleteUser
};
