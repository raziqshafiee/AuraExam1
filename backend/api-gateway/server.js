const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
app.use(cors());

// Auth service
app.use(createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith('/api/auth')
}));

// Exam service (exams, classes, questions, analytics, submissions)
app.use(createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    pathFilter: (path) =>
        path.startsWith('/api/exams') ||
        path.startsWith('/api/classes') ||
        path.startsWith('/api/questions') ||
        path.startsWith('/api/analytics') ||
        path.startsWith('/api/submissions') ||
        path.startsWith('/api/admin')
}));

// Tracking service
app.use(createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith('/api/tracking')
}));

// Note service
app.use(createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith('/api/notes')
}));

// Serve vanilla frontend
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Default route → auth page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/src/views/auth.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway on port ${PORT}`));
