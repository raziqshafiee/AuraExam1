const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename:    (_req, file, cb) => {
        const ext    = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
        cb(null, unique);
    }
});

const fileFilter = (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(Object.assign(new Error(`File type not allowed: ${file.mimetype}`), { status: 415 }), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }  // 100 MB
});
