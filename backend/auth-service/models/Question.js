const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true_false', 'essay'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    classId: { type: String, required: true }, 
    className: { type: String, required: true },
    lecturerId: { type: String, required: true },
    correctAnswers: [{ type: String, required: true }],
    options: [{ type: String }] // NEW: Array to store the 4 MCQ options
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);