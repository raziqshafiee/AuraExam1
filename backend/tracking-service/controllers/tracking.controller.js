const TrackingEvent = require('../models/TrackingEvent');

exports.recordEvent = async (req, res) => {
    try {
        const { examId, studentId, eventType, metadata } = req.body;
        if (!examId || !studentId || !eventType) {
            return res.status(400).json({ success: false, message: 'examId, studentId, and eventType are required.' });
        }
        const event = await TrackingEvent.create({ examId, studentId, eventType, metadata });
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getExamEvents = async (req, res) => {
    try {
        const events = await TrackingEvent.find({ examId: req.params.examId }).sort({ timestamp: -1 });

        // Group by student for easy lecturer review
        const byStudent = events.reduce((acc, e) => {
            if (!acc[e.studentId]) acc[e.studentId] = [];
            acc[e.studentId].push(e);
            return acc;
        }, {});

        res.status(200).json({ success: true, count: events.length, data: byStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStudentEvents = async (req, res) => {
    try {
        const { examId, studentId } = req.params;
        const events = await TrackingEvent.find({ examId, studentId }).sort({ timestamp: -1 });

        const count = (type) => events.filter(e => e.eventType === type).length;
        const summary = {
            tab_switch:      count('tab_switch'),
            window_blur:     count('window_blur'),
            copy_attempt:    count('copy_attempt'),
            paste_attempt:   count('paste_attempt'),
            right_click:     count('right_click'),
            fullscreen_exit: count('fullscreen_exit'),
            camera_denied:   count('camera_denied'),
            camera_off:      count('camera_off'),
            head_turn:       count('head_turn'),
            head_down:       count('head_down'),
            gaze_away:       count('gaze_away'),
            face_absent:     count('face_absent')
        };

        res.status(200).json({ success: true, count: events.length, summary, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
