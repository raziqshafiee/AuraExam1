const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config/.env' });
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');


connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../../frontend/public')));


app.use('/src', express.static(path.join(__dirname, '../../frontend/public/src')));
app.use('/src', express.static(path.join(__dirname, '../../frontend/src')));


app.use('/', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🔒 Server on port ${PORT}`));