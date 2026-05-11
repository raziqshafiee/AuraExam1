const express = require('express');
const router = express.Router();
const path = require('path');
const authController = require('../controllers/auth.controller.js');
const examController = require('../controllers/exam.controller.js');

// ==========================================
// API ROUTES (Backend Logic)
// ==========================================

// Authentication
router.post('/api/auth/register', authController.registerUser);
router.post('/api/auth/login', authController.loginUser);

// Class Management API (These were missing!)
router.post('/api/classes/create', examController.createClass);
router.get('/api/classes/lecturer', examController.getLecturerClasses); 
router.get('/api/classes/student/:studentId', examController.getStudentClasses);

// Exam & Enrollment API (These were missing!)
router.post('/api/exams/enroll', examController.enrollInClass);
router.post('/api/exams', examController.createExam);
router.get('/api/exams/all', examController.getAllExams); 
router.get('/api/exams/student/:studentId', examController.getStudentExams);

// Question Bank APIs
router.post('/api/questions/create', examController.createQuestion);
router.get('/api/questions/lecturer', examController.getLecturerQuestions);

router.get('/api/exams/:id/take/:studentId', examController.getExamWithQuestions);
router.post('/api/exams/submit', examController.submitExam);

// Update Question
router.put('/api/questions/:id', examController.updateQuestion);

// Delete Question
router.delete('/api/questions/:id', examController.deleteQuestion);

// Update Exam
router.put('/api/exams/:id', examController.updateExam);

// Delete Exam
router.delete('/api/exams/:id', examController.deleteExam);

// Get Exam Submissions (for Lecturer Observation)
router.get('/api/exams/:id/submissions', examController.getExamSubmissions);


// Create a new question
router.post('/api/questions', examController.createQuestion);

// Get all questions for a lecturer
router.get('/api/questions/lecturer', examController.getLecturerQuestions);

// Update an existing question
router.put('/api/questions/:id', examController.updateQuestion);

// Delete a question
router.delete('/api/questions/:id', examController.deleteQuestion);

router.get('/api/analytics/lecturer', examController.getLecturerAnalytics);


// Analytics API
router.get('/api/analytics/lecturer', examController.getLecturerAnalytics);

// ADD THIS NEW ROUTE:
router.get('/api/submissions/student/:studentId', examController.getStudentSubmissions);

// Analytics View
router.get('/lecturer-analytics.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-analytics.html'));
});

router.delete('/classes/:id', examController.deleteClass);
// ==========================================
// HTML NAVIGATION ROUTES (Serving Views)
// ==========================================

// Landing Page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/index.html'));
});

// Auth Page
router.get('/src/views/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/auth.html'));
});

// Dashboards
router.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/admin.html'));
});

router.get('/student-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/student-dashboard.html'));
});

router.get('/student-exams.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/student-exams.html'));
});

router.get('/lecturer-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-dashboard.html'));
});

router.get('/lecturer-classes.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-classes.html'));
});

// ADD THE NEW QUESTION BANK ROUTE
router.get('/lecturer-questions.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-questions.html'));
});

// NEW: Add this route for the dedicated scheduling page
router.get('/lecturer-schedule-exam.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-schedule-exam.html'));
});

router.get('/student-take-exam.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/student-take-exam.html'));
});

router.get('/lecturer-exams.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-exams.html'));
});

router.get('/lecturer-analytics.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/public/src/views/lecturer-analytics.html'));
});




module.exports = router;