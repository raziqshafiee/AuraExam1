const mongoose = require('mongoose');

const TrackingEventSchema = new mongoose.Schema({
    examId:    { type: String, required: true },
    studentId: { type: String, required: true },
    eventType: {
        type: String,
        enum: [
            'tab_switch', 'window_blur', 'copy_attempt', 'paste_attempt', 'right_click', 'fullscreen_exit',
            'camera_denied', 'camera_off',
            'head_turn', 'head_down', 'gaze_away', 'face_absent'
        ],
        required: true
    },
    metadata:  { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
});

TrackingEventSchema.index({ examId: 1, studentId: 1 });

module.exports = mongoose.model('TrackingEvent', TrackingEventSchema);
