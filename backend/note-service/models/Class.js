const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    className:  { type: String, required: true },
    classCode:  { type: String, required: true, unique: true },
    lecturerId: { type: String, required: true },
    students:   [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
