const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title:          { type: String, required: true },
    courseName:     { type: String, required: true },
    classId:        { type: String, required: true },
    lecturerId:     { type: String, required: true },
    startTime:      { type: Date },
    endTime:        { type: Date },
    durationMinutes:{ type: Number, required: true },
    questionCount:  { type: Number, required: true },
    status:         { type: String, enum: ['active', 'scheduled', 'completed'], default: 'scheduled' },
    scheduledDate:  { type: Date, required: true },
    questions:       [{ type: String }],
    cameraRequired:  { type: Boolean, default: false }
}, { timestamps: true });

ExamSchema.index({ lecturerId: 1 });
ExamSchema.index({ classId: 1 });
ExamSchema.index({ scheduledDate: -1 });

module.exports = mongoose.model('Exam', ExamSchema);
