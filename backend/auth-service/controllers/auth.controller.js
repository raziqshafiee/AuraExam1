const jwt        = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User       = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function verifyToken(req) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// @desc Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        await User.create({ name, email, password, role });
        res.status(201).json({ success: true, message: 'Registration successful!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Login User & return JWT
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const routes = {
            'student': '/src/views/student-dashboard.html',
            'lecturer': '/src/views/lecturer-dashboard.html',
            'admin': '/src/views/admin.html'
        };

        res.status(200).json({
            success: true,
            token,
            role: user.role,
            name: user.name,
            email: user.email,
            redirectUrl: routes[user.role],
            message: `Welcome back, ${user.name}!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Forgot password — generates a reset code (displayed in demo mode)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).select('+resetCode +resetExpiry');
        if (!user) {
            return res.json({ success: true, message: 'If that email exists, a reset code has been generated.' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await User.updateOne({ email }, { resetCode: code, resetExpiry: new Date(Date.now() + 10 * 60 * 1000) });

        res.json({ success: true, resetCode: code, message: 'Reset code generated. In production this would be emailed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Reset password using code
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const user = await User.findOne({ email }).select('+password +resetCode +resetExpiry');
        if (!user || user.resetCode !== code || !user.resetExpiry || user.resetExpiry < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        user.password = newPassword;
        user.resetCode = undefined;
        user.resetExpiry = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Google OAuth sign-in / sign-up
exports.googleAuth = async (req, res) => {
    try {
        const { credential, role } = req.body;
        if (!credential) return res.status(400).json({ success: false, message: 'No Google credential provided.' });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            if (!role) {
                return res.json({ success: false, needsRole: true });
            }
            if (!['student', 'lecturer'].includes(role)) {
                return res.status(400).json({ success: false, message: 'Invalid role.' });
            }
            const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            user = await User.create({ name, email, password: randomPassword, role, googleId });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const routes = {
            student:  '/src/views/student-dashboard.html',
            lecturer: '/src/views/lecturer-dashboard.html',
            admin:    '/src/views/admin.html'
        };

        res.json({
            success: true, token,
            role: user.role, name: user.name, email: user.email,
            redirectUrl: routes[user.role],
            message: `Welcome, ${user.name}!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Google sign-in failed. ' + err.message });
    }
};

// @desc Change password (requires valid JWT)
exports.changePassword = async (req, res) => {
    try {
        const payload = verifyToken(req);
        if (!payload) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const user = await User.findById(payload.id).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const match = await user.matchPassword(currentPassword);
        if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
