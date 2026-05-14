const mongoose = require('mongoose');

// Read-only mirror — queries the same 'users' collection as auth-service.
// No password field or bcrypt hooks needed here.
const UserSchema = new mongoose.Schema({
    name:  { type: String },
    email: { type: String, unique: true },
    role:  { type: String, enum: ['student', 'lecturer', 'admin'] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
