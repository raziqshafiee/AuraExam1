const express    = require('express');
const path       = require('path');
const router     = express.Router();
const controller = require('../controllers/note.controller');
const { authenticate } = require('../middleware/auth');
const upload     = require('../middleware/upload');

// Static uploads — served before all API routes
router.use('/api/notes/uploads', express.static(path.join(__dirname, '../uploads')));

// Wrap multer so its errors return JSON instead of crashing
function multerSingle(req, res, next) {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(err.status || 400).json({ success: false, message: err.message });
        next();
    });
}

router.post('/api/notes/upload',                       authenticate, multerSingle, controller.uploadFile);

router.post('/api/notes',                              authenticate, controller.createNote);
router.get('/api/notes/mine',                         authenticate, controller.getLecturerNotes);
router.get('/api/notes/class/:classId',               authenticate, controller.getClassNotes);
router.get('/api/notes/files/:id/download',           authenticate, controller.downloadNote);
router.get('/api/notes/announcements/unread',         authenticate, controller.getUnreadCount);
router.get('/api/notes/announcements/unread/preview', authenticate, controller.getUnreadPreview);
router.post('/api/notes/:id/mark-read',               authenticate, controller.markRead);
router.put('/api/notes/:id',                          authenticate, controller.updateNote);
router.delete('/api/notes/:id',                       authenticate, controller.deleteNote);

module.exports = router;
