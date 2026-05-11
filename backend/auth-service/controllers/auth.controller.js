const User = require('../models/User');

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

// @desc Login User & Detect Role (RBAC)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user & get hashed password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const routes = {
            'student': '/student-dashboard.html',
            'lecturer': '/lecturer-dashboard.html',
            'admin': '/admin.html'
        };

        res.status(200).json({
            success: true,
            role: user.role,
            redirectUrl: routes[user.role],
            message: `Welcome back, ${user.name}!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};