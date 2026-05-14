const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/tracking.controller');
const { authenticate } = require('../middleware/auth');

router.post('/api/tracking/event',                          authenticate, controller.recordEvent);
router.get('/api/tracking/exam/:examId',                    authenticate, controller.getExamEvents);
router.get('/api/tracking/exam/:examId/student/:studentId', authenticate, controller.getStudentEvents);

module.exports = router;
