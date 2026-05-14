const User          = require('../models/User');
const Exam          = require('../models/Exam');
const Class         = require('../models/Class');
const Submission    = require('../models/Submission');
const TrackingEvent = require('../models/TrackingEvent');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [students, lecturers, admins, exams, classes, submissions, flags] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'lecturer' }),
            User.countDocuments({ role: 'admin' }),
            Exam.countDocuments(),
            Class.countDocuments(),
            Submission.countDocuments(),
            TrackingEvent.countDocuments()
        ]);
        res.json({ success: true, data: { students, lecturers, admins, exams, classes, submissions, flags } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/users?role=&search=
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            // Escape special regex chars to prevent ReDoS
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(escaped, 'i');
            query.$or = [{ name: re }, { email: re }];
        }
        const users = await User.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'lecturer', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role.' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: `Role updated to ${role}.`, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find().sort({ createdAt: -1 });
        res.json({ success: true, data: classes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/exams
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().sort({ createdAt: -1 });
        res.json({ success: true, data: exams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/flags?limit=50
exports.getIntegrityFlags = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const flags = await TrackingEvent.find()
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json({ success: true, data: flags });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
