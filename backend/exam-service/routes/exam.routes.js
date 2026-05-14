const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/exam.controller');
const admin      = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const isLecturer = requireRole('lecturer', 'admin');
const isStudent  = requireRole('student');
const isAdmin    = requireRole('admin');

// ── Classes ──────────────────────────────────────────────────────
router.post('/api/classes/create',            authenticate, isLecturer, controller.createClass);
router.get('/api/classes/lecturer',           authenticate, isLecturer, controller.getLecturerClasses);
router.get('/api/classes/student/:studentId', authenticate, isStudent,  controller.getStudentClasses);
router.delete('/api/classes/:id',             authenticate, isLecturer, controller.deleteClass);

// ── Enrollment ────────────────────────────────────────────────────
router.post('/api/exams/enroll',              authenticate, isStudent,  controller.enrollInClass);

// ── Exams (specific paths before :id wildcards) ───────────────────
router.post('/api/exams',                     authenticate, isLecturer, controller.createExam);
router.get('/api/exams/all',                  authenticate, isLecturer, controller.getAllExams);
router.get('/api/exams/student/:studentId',   authenticate, isStudent,  controller.getStudentExams);
router.post('/api/exams/submit',              authenticate, isStudent,  controller.submitExam);
router.get('/api/exams/:id/take/:studentId',  authenticate, isStudent,  controller.getExamWithQuestions);
router.get('/api/exams/:id/submissions',      authenticate, isLecturer, controller.getExamSubmissions);
router.put('/api/exams/:id',                  authenticate, isLecturer, controller.updateExam);
router.delete('/api/exams/:id',              authenticate, isLecturer, controller.deleteExam);

// ── Questions ─────────────────────────────────────────────────────
router.post('/api/questions',                authenticate, isLecturer, controller.createQuestion);
router.get('/api/questions/lecturer',        authenticate, isLecturer, controller.getLecturerQuestions);
router.put('/api/questions/:id',             authenticate, isLecturer, controller.updateQuestion);
router.delete('/api/questions/:id',          authenticate, isLecturer, controller.deleteQuestion);

// ── Analytics ─────────────────────────────────────────────────────
router.get('/api/analytics/lecturer',        authenticate, isLecturer, controller.getLecturerAnalytics);

// ── Submissions ───────────────────────────────────────────────────
router.get('/api/submissions/student/:studentId', authenticate, isStudent, controller.getStudentSubmissions);

// ── Admin ─────────────────────────────────────────────────────────
router.get('/api/admin/stats',           authenticate, isAdmin, admin.getStats);
router.get('/api/admin/users',           authenticate, isAdmin, admin.getAllUsers);
router.put('/api/admin/users/:id/role',  authenticate, isAdmin, admin.updateUserRole);
router.delete('/api/admin/users/:id',   authenticate, isAdmin, admin.deleteUser);
router.get('/api/admin/classes',         authenticate, isAdmin, admin.getAllClasses);
router.get('/api/admin/exams',           authenticate, isAdmin, admin.getAllExams);
router.get('/api/admin/flags',           authenticate, isAdmin, admin.getIntegrityFlags);

module.exports = router;
