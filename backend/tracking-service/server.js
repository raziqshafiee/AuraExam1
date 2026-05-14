require('dotenv').config({ path: './config/.env' });
const express        = require('express');
const cors           = require('cors');
const connectDB      = require('./config/db');
const trackingRoutes = require('./routes/tracking.routes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5000' }));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'tracking' }));
app.use('/', trackingRoutes);

const PORT   = process.env.PORT || 5003;
const server = app.listen(PORT, () => console.log(`Tracking Service on port ${PORT}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
