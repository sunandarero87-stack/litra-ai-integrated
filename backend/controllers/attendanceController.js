const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.saveAttendance = async (req, res) => {
    try {
        const { date, records } = req.body; // records: { username: { status, kelas, name } }
        
        const operations = Object.entries(records).map(([username, data]) => ({
            updateOne: {
                filter: { date, username },
                update: { 
                    $set: { 
                        status: data.status, 
                        kelas: data.kelas,
                        name: data.name 
                    } 
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);
        res.json({ success: true, message: 'Absensi berhasil disimpan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menyimpan absensi' });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const { date, startDate, endDate, kelas } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        if (kelas && kelas !== 'all' && kelas !== 'Semua Kelas') {
            query.kelas = kelas;
        }

        const records = await Attendance.find(query).sort({ date: -1, name: 1 });
        res.json({ success: true, records });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil data absensi' });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { type, date, kelas } = req.query; // type: daily, weekly, monthly
        let startDate, endDate;
        const targetDate = new Date(date);

        if (type === 'daily') {
            startDate = endDate = date;
        } else if (type === 'weekly') {
            // Get start of week (Monday)
            const day = targetDate.getDay();
            const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(targetDate.setDate(diff));
            startDate = monday.toISOString().split('T')[0];
            
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            endDate = sunday.toISOString().split('T')[0];
        } else if (type === 'monthly') {
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString().split('T')[0];
        }

        let query = { date: { $gte: startDate, $lte: endDate } };
        if (kelas && kelas !== 'all' && kelas !== 'Semua Kelas') {
            query.kelas = kelas;
        }

        const records = await Attendance.find(query);
        
        // Group by status
        const summary = {
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpha: 0,
            total: records.length,
            details: records
        };

        records.forEach(r => {
            summary[r.status]++;
        });

        res.json({ success: true, summary, startDate, endDate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil ringkasan absensi' });
    }
};
