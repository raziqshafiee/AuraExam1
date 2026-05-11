const Exam = require('../models/Exam');
const Class = require('../models/Class');
const Question = require('../models/Question');
const Submission = require('../models/Submission');


// ==========================================
// CLASS MANAGEMENT
// ==========================================

exports.createClass = async (req, res) => {
    try {
        const { className, lecturerId } = req.body;
        const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newClass = await Class.create({ className, classCode, lecturerId });
        res.status(201).json({ success: true, data: newClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLecturerClasses = async (req, res) => {
    try {
        const { lecturerId } = req.query;
        let query = lecturerId ? { lecturerId } : {};
        const classes = await Class.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStudentClasses = async (req, res) => {
    try {
        const { studentId } = req.params;
        const classes = await Class.find({ students: studentId });  
        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) return res.status(404).json({ success: false, message: 'Class not found' });
 
        // Also remove this classId from any exams that referenced it
        // (optional but keeps the DB clean — exams become orphaned otherwise)
        await Exam.deleteMany({ classId: deletedClass._id.toString() });
 
        res.status(200).json({ success: true, message: 'Class deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// EXAM & ENROLLMENT MANAGEMENT
// ==========================================

exports.enrollInClass = async (req, res) => {
    try {
        const { classCode, studentId } = req.body;
        const targetClass = await Class.findOne({ classCode: classCode.toUpperCase() });
        
        if (!targetClass) return res.status(404).json({ success: false, message: 'Invalid Class Code' });
        if (targetClass.students.includes(studentId)) return res.status(400).json({ success: false, message: 'You are already enrolled in this class.' });

        targetClass.students.push(studentId);
        await targetClass.save();

        res.status(200).json({ success: true, message: `Successfully enrolled in ${targetClass.className}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createExam = async (req, res) => {
    try {
        const exam = await Exam.create(req.body);
        res.status(201).json({ success: true, data: exam });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().sort({ scheduledDate: -1 });
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStudentExams = async (req, res) => {
    try {
        const { studentId } = req.params;
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        // 1. Find classes student is enrolled in
        const enrolledClasses = await Class.find({ students: studentId });
        const classIds = enrolledClasses.map(c => c._id.toString());

        // 2. Fetch exams mapped ONLY to those classes
        const exams = await Exam.find({
            classId: { $in: classIds },
            $or: [
                { status: 'active' },
                { scheduledDate: { $gte: tenDaysAgo } }
            ]
        }).sort({ scheduledDate: 1 });

        res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// QUESTION BANK MANAGEMENT
// ==========================================

exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLecturerQuestions = async (req, res) => {
    try {
        const { lecturerId } = req.query;
        let query = lecturerId ? { lecturerId } : {};
        const questions = await Question.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!updatedQuestion) return res.status(404).json({ success: false, message: 'Question not found' });
        res.status(200).json({ success: true, data: updatedQuestion });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if(!deletedQuestion) return res.status(404).json({ success: false, message: 'Question not found' });
        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// EXAM TAKING & SUBMISSION
// ==========================================

exports.getExamWithQuestions = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        
        const exam = await Exam.findById(id);
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found." });

        // Calculate timing
        const now = new Date();
        const startTime = new Date(exam.startTime || exam.scheduledDate);
        const endTime = exam.endTime
            ? new Date(exam.endTime)
            : new Date(startTime.getTime() + (exam.durationMinutes * 60000));

        const isPastDue = now > endTime || exam.status === 'completed';

        // Check if student already submitted
        const existingSubmission = await Submission.findOne({ examId: id, studentId });

        // ── CASE 1: Past due AND student never submitted → block access entirely
        //    Return exam metadata but NO questions, with a 'missed' flag.
        if (isPastDue && !existingSubmission) {
            return res.status(200).json({
                success: true,
                data: {
                    exam,
                    questions: [],          // No questions exposed
                    submission: null,
                    isReadonly: true,
                    isMissed: true          // Frontend uses this to show "missed" UI
                }
            });
        }

        // ── CASE 2: Student submitted → return questions + their answers (read-only review)
        // ── CASE 3: Active exam, not yet submitted → return full questions for taking
        const questions = await Question.find({ _id: { $in: exam.questions } });
        const isReadonly = !!existingSubmission || isPastDue;

        res.status(200).json({ 
            success: true, 
            data: { 
                exam, 
                questions, 
                submission: existingSubmission,
                isReadonly,
                isMissed: false
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const { examId, studentId, answers } = req.body;

        // Guard: prevent double submission
        const existing = await Submission.findOne({ examId, studentId });
        if (existing) return res.status(400).json({ success: false, message: "You have already taken this exam." });

        // Guard: prevent submission after due date
        const exam = await Exam.findById(examId);
        if (exam) {
            const now = new Date();
            const startTime = new Date(exam.startTime || exam.scheduledDate);
            const endTime = exam.endTime
                ? new Date(exam.endTime)
                : new Date(startTime.getTime() + (exam.durationMinutes * 60000));

            if (now > endTime || exam.status === 'completed') {
                return res.status(403).json({ success: false, message: "This exam is past its due date and can no longer be submitted." });
            }
        }

        const questionIds = answers.map(a => a.questionId);
        const actualQuestions = await Question.find({ _id: { $in: questionIds } });

        let score = 0;
        const processedAnswers = answers.map(studentAns => {
            const question = actualQuestions.find(q => q._id.toString() === studentAns.questionId);
            let isCorrect = false;

            if (question) {
                if (question.type === 'essay') {
                    // Case-insensitive trimmed match for short answers
                    isCorrect = question.correctAnswers.some(ans => 
                        ans.toLowerCase().trim() === studentAns.answer.toLowerCase().trim()
                    );
                } else {
                    // Exact match for MCQ and True/False
                    isCorrect = question.correctAnswers.includes(studentAns.answer);
                }
            }
            
            if (isCorrect) score++;

            return {
                questionId: studentAns.questionId,
                answer: studentAns.answer,
                isCorrect
            };
        });

        const totalQuestions = actualQuestions.length;
        const percentage = ((score / totalQuestions) * 100).toFixed(2);

        await Submission.create({
            examId, studentId, answers: processedAnswers, score, totalQuestions, percentage
        });
        
        res.status(201).json({ 
            success: true,
            message: "Exam submitted successfully!",
            data: { score, totalQuestions, percentage }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExam) return res.status(404).json({ success: false, message: 'Exam not found' });
        res.status(200).json({ success: true, data: updatedExam });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        const deletedExam = await Exam.findByIdAndDelete(req.params.id);
        if (!deletedExam) return res.status(404).json({ success: false, message: 'Exam not found' });
        
        // Also delete associated submissions to keep the DB clean
        await Submission.deleteMany({ examId: req.params.id });

        res.status(200).json({ success: true, message: 'Exam and related submissions deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getExamSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ examId: req.params.id }).sort({ submittedAt: -1 });
        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// ANALYTICS & REPORTS
// ==========================================

exports.getLecturerAnalytics = async (req, res) => {
    try {
        const { lecturerId } = req.query;

        const exams = await Exam.find({ lecturerId });
        const examIds = exams.map(e => e._id.toString());

        const submissions = await Submission.find({ examId: { $in: examIds } }).sort({ submittedAt: -1 });

        const classes = await Class.find({ lecturerId });
        let uniqueStudents = new Set();
        classes.forEach(c => c.students.forEach(s => uniqueStudents.add(s)));

        let totalPercentage = 0;
        let passedCount = 0;
        submissions.forEach(sub => {
            totalPercentage += sub.percentage || 0;
            if (sub.percentage >= 50) passedCount++;
        });

        const avgScore = submissions.length > 0 ? (totalPercentage / submissions.length).toFixed(1) : 0;
        const passRate = submissions.length > 0 ? Math.round((passedCount / submissions.length) * 100) : 0;

        const examPerformance = exams.map(exam => {
            const examSubs = submissions.filter(s => s.examId.toString() === exam._id.toString());
            let eTotal = 0;
            examSubs.forEach(s => eTotal += s.percentage || 0);
            return {
                title: exam.title,
                avgPercentage: examSubs.length > 0 ? Math.round(eTotal / examSubs.length) : 0,
                attempts: examSubs.length
            };
        }).filter(e => e.attempts > 0);

        const recentSubmissions = submissions.slice(0, 5).map(sub => {
            const examObj = exams.find(e => e._id.toString() === sub.examId.toString());
            return {
                studentId: sub.studentId,
                examTitle: examObj ? examObj.title : 'Deleted Exam',
                score: sub.score,
                totalQuestions: sub.totalQuestions,
                percentage: sub.percentage,
                submittedAt: sub.submittedAt
            };
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalExams: exams.length,
                    activeStudents: uniqueStudents.size,
                    totalSubmissions: submissions.length,
                    avgScore,
                    passRate
                },
                chartData: examPerformance,
                recentActivity: recentSubmissions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// STUDENT SUBMISSION TRACKING
// ==========================================

exports.getStudentSubmissions = async (req, res) => {
    try {
        const { studentId } = req.params;
        const submissions = await Submission.find({ studentId });
        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};