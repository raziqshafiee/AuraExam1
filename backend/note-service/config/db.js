const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Note Service — MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Note Service — MongoDB error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
