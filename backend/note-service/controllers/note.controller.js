const Note = require('../models/Note');
const Class = require('../models/Class');
const path  = require('path');
const fs    = require('fs');

exports.uploadFile = async (req, res) => {
    try {
        if (req.user.role !== 'lecturer' && req.user.role !== 'admin') {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(403).json({ success: false, message: 'Only lecturers can upload files.' });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'No file received.' });

        res.status(200).json({
            success:  true,
            url:      `/api/notes/uploads/${req.file.filename}`,
            name:     req.file.originalname,
            size:     req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createNote = async (req, res) => {
    try {
        if (req.user.role !== 'lecturer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only lecturers can create notes.' });
        }
        const { title, body, attachmentUrl, attachmentName, linkedTo } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'title is required.' });

        const note = await Note.create({
            authorId:       req.user.email,
            authorRole:     req.user.role,
            type:           'announcement',
            visibility:     'class',
            linkedTo:       linkedTo || undefined,
            title,
            body:           body || '',
            attachmentUrl:  attachmentUrl || '',
            attachmentName: attachmentName || ''
        });
        res.status(201).json({ success: true, data: note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLecturerNotes = async (req, res) => {
    try {
        if (req.user.role !== 'lecturer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only lecturers can access this.' });
        }
        const notes = await Note.find({ authorId: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch notes.' });
    }
};

exports.getClassNotes = async (req, res) => {
    try {
        const { classId } = req.params;
        const notes = await Note.find({ 'linkedTo.id': classId }).sort({ createdAt: -1 });

        if (req.user.role === 'student') {
            const studentId = req.user.email;
            const unviewed  = notes.filter(n => !n.views.includes(studentId)).map(n => n._id);
            if (unviewed.length) {
                await Note.updateMany({ _id: { $in: unviewed } }, { $addToSet: { views: studentId } });
            }
        }

        res.status(200).json({ success: true, data: notes });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch class notes.' });
    }
};

exports.downloadNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });

        const content  = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.body}`;
        const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(content);
    } catch {
        res.status(500).json({ success: false, message: 'Download failed.' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const studentId = req.user.email;
        const classes   = await Class.find({ students: studentId }).select('_id');
        if (!classes.length) return res.status(200).json({ success: true, count: 0 });

        const classIds = classes.map(c => c._id.toString());
        const count    = await Note.countDocuments({
            'linkedTo.id': { $in: classIds },
            views:         { $nin: [studentId] }
        });
        res.status(200).json({ success: true, count });
    } catch {
        res.status(500).json({ success: false, count: 0 });
    }
};

exports.getUnreadPreview = async (req, res) => {
    try {
        const studentId = req.user.email;
        const classes   = await Class.find({ students: studentId }).select('_id');
        if (!classes.length) return res.status(200).json({ success: true, data: [] });

        const classIds = classes.map(c => c._id.toString());
        const notes    = await Note.find({
            'linkedTo.id': { $in: classIds },
            views:         { $nin: [studentId] }
        }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json({ success: true, data: notes });
    } catch {
        res.status(500).json({ success: false, data: [] });
    }
};

exports.markRead = async (req, res) => {
    try {
        const studentId = req.user.email;
        await Note.findByIdAndUpdate(req.params.id, { $addToSet: { views: studentId } });
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to mark as read.' });
    }
};

exports.updateNote = async (req, res) => {
    try {
        if (req.user.role !== 'lecturer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only lecturers can update notes.' });
        }
        const { title, body, attachmentUrl, attachmentName, linkedTo } = req.body;
        const updated = await Note.findOneAndUpdate(
            { _id: req.params.id, authorId: req.user.email },
            { title, body, attachmentUrl, attachmentName, linkedTo },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Note not found.' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const deleted = await Note.findOneAndDelete({ _id: req.params.id, authorId: req.user.email });
        if (!deleted) return res.status(404).json({ success: false, message: 'Note not found.' });
        res.status(200).json({ success: true, message: 'Note deleted.' });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to delete note.' });
    }
};
