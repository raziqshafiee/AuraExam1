const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseName: { type: String, required: true },
    classId: { type: String, required: true },
    lecturerId: { type: String, required: true }, 
    startTime: { type: Date }, // NEW: Specific start time
    endTime: { type: Date },   // NEW: Specific end time
    durationMinutes: { type: Number, required: true },
    questionCount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'scheduled', 'completed'], default: 'scheduled' },
    scheduledDate: { type: Date, required: true }, // Legacy fallback
    questions: [{ type: String }] 
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);