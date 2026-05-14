const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/auth.controller.js');

router.post('/api/auth/register',         authController.registerUser);
router.post('/api/auth/login',            authController.loginUser);
router.post('/api/auth/google',           authController.googleAuth);
router.post('/api/auth/change-password',  authController.changePassword);
router.post('/api/auth/forgot-password',  authController.forgotPassword);
router.post('/api/auth/reset-password',   authController.resetPassword);

module.exports = router;
