const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    examId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId:      { type: String, required: true },
    answers: [{
        questionId: String,
        answer:     String,
        isCorrect:  Boolean
    }],
    score:          { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    percentage:     { type: Number, default: 0 },
    submittedAt:    { type: Date, default: Date.now }
}, { timestamps: true });

// Prevents double-submission even under concurrent requests
SubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
