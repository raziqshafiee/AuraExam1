const mongoose = require('mongoose');

// Read-only mirror — queries the same 'trackingevents' collection as tracking-service.
const TrackingEventSchema = new mongoose.Schema({
    examId:    { type: String },
    studentId: { type: String },
    eventType: { type: String },
    metadata:  { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrackingEvent', TrackingEventSchema);
