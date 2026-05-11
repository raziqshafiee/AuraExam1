const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: String, required: true }, // Email
    answers: [{
        questionId: String,
        answer: String,
        isCorrect: Boolean // Store if this specific answer was right
    }],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);