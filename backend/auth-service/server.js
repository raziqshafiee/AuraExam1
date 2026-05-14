require('dotenv').config({ path: './config/.env' });
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth.routes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5000' }));
app.use(express.json({ limit: '10kb' }));

// Strict rate limit on all auth endpoints — 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/auth', authLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth' }));
app.use('/', authRoutes);

const PORT   = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`Auth Service on port ${PORT}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
