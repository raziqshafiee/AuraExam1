require('dotenv').config({ path: './config/.env' });
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const noteRoutes = require('./routes/note.routes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5000' }));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'note' }));
app.use('/', noteRoutes);

const PORT   = process.env.PORT || 5004;
const server = app.listen(PORT, () => console.log(`Note Service on port ${PORT}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
