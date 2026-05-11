const mongoose = require('mongoose');

/**
 * connectDB
 * Connects the Node.js application to your MongoDB Atlas cluster.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Stop server on failure
    }
};

module.exports = connectDB;