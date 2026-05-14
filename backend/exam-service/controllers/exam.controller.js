const Exam       = require('../models/Exam');
const Class      = require('../models/Class');
const Question   = require('../models/Question');
const Submission = require('../models/Submission');

// ── CLASS MANAGEMENT ──────────────────────────────────────────────

exports.createClass = async (req, res) => {
    try {
        const { className } = req.body;
        if (!className) return res.status(400).json({ success: false, message: 'className is required.' });

        const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newClass  = await Class.create({ className, classCode, lecturerId: req.user.email });
        res.status(201).json({ success: true, data: newClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLecturerClasses = async (req, res) => {
    try {
        const classes = await Class.find({ lecturerId: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: classes });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch classes.' });
    }
};

exports.getStudentClasses = async (req, res) => {
    try {
        const classes = await Class.find({ students: req.user.email });
        res.status(200).json({ success: true, data: classes });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch enrolled classes.' });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findOneAndDelete({ _id: req.params.id, lecturerId: req.user.email });
        if (!deletedClass) return res.status(404).json({ success: false, message: 'Class not found.' });
        await Exam.deleteMany({ classId: deletedClass._id.toString() });
        res.status(200).json({ success: true, message: 'Class deleted.' });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to delete class.' });
    }
};

// ── ENROLLMENT ────────────────────────────────────────────────────

exports.enrollInClass = async (req, res) => {
    try {
        const { classCode } = req.body;
        if (!classCode) return res.status(400).json({ success: false, message: 'classCode is required.' });

        const studentId   = req.user.email;
        const targetClass = await Class.findOne({ classCode: classCode.toUpperCase() });
        if (!targetClass) return res.status(404).json({ success: false, message: 'Invalid class code.' });
        if (targetClass.students.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this class.' });
        }

        targetClass.students.push(studentId);
        await targetClass.save();
        res.status(200).json({ success: true, message: `Enrolled in ${targetClass.className}` });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to enroll.' });
    }
};

// ── EXAM MANAGEMENT ───────────────────────────────────────────────

exports.createExam = async (req, res) => {
    try {
        const { title, courseName, classId, startTime, endTime, durationMinutes, questionCount, status, scheduledDate, questions, cameraRequired } = req.body;
        const exam = await Exam.create({
            title, courseName, classId,
            lecturerId:      req.user.email,
            startTime,       endTime,
            durationMinutes, questionCount,
            status:          status || 'scheduled',
            scheduledDate,
            questions:       questions || [],
            cameraRequired:  !!cameraRequired
        });
        res.status(201).json({ success: true, data: exam });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find({ lecturerId: req.user.email }).sort({ scheduledDate: -1 });
        res.status(200).json({ success: true, data: exams });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
    }
};

exports.getStudentExams = async (req, res) => {
    try {
        const studentId  = req.user.email;
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

        const enrolledClasses = await Class.find({ students: studentId }, '_id');
        const classIds        = enrolledClasses.map(c => c._id.toString());

        const exams = await Exam.find({
            classId: { $in: classIds },
            $or: [{ status: 'active' }, { scheduledDate: { $gte: tenDaysAgo } }]
        }).sort({ scheduledDate: 1 });

        res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const { title, courseName, startTime, endTime, durationMinutes, questionCount, status, scheduledDate, questions, cameraRequired } = req.body;
        const updated = await Exam.findOneAndUpdate(
            { _id: req.params.id, lecturerId: req.user.email },
            { title, courseName, startTime, endTime, durationMinutes, questionCount, status, scheduledDate, questions, cameraRequired: !!cameraRequired },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Exam not found.' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        const deleted = await Exam.findOneAndDelete({ _id: req.params.id, lecturerId: req.user.email });
        if (!deleted) return res.status(404).json({ success: false, message: 'Exam not found.' });
        await Submission.deleteMany({ examId: req.params.id });
        res.status(200).json({ success: true, message: 'Exam and submissions deleted.' });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to delete exam.' });
    }
};

// ── QUESTION BANK ─────────────────────────────────────────────────

exports.createQuestion = async (req, res) => {
    try {
        const { prompt, type, difficulty, classId, className, correctAnswers, options } = req.body;
        const question = await Question.create({
            prompt, type, difficulty, classId, className,
            lecturerId:     req.user.email,
            correctAnswers: correctAnswers || [],
            options:        options || []
        });
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLecturerQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ lecturerId: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: questions });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { prompt, type, difficulty, classId, className, correctAnswers, options } = req.body;
        const updated = await Question.findOneAndUpdate(
            { _id: req.params.id, lecturerId: req.user.email },
            { prompt, type, difficulty, classId, className, correctAnswers, options },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Question not found.' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const deleted = await Question.findOneAndDelete({ _id: req.params.id, lecturerId: req.user.email });
        if (!deleted) return res.status(404).json({ success: false, message: 'Question not found.' });
        res.status(200).json({ success: true, message: 'Question deleted.' });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to delete question.' });
    }
};

// ── EXAM TAKING & SUBMISSION ──────────────────────────────────────

exports.getExamWithQuestions = async (req, res) => {
    try {
        const { id }    = req.params;
        const studentId = req.user.email;

        const exam = await Exam.findById(id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        const now       = new Date();
        const startTime = new Date(exam.startTime || exam.scheduledDate);
        const endTime   = exam.endTime
            ? new Date(exam.endTime)
            : new Date(startTime.getTime() + exam.durationMinutes * 60_000);
        const isPastDue = now > endTime || exam.status === 'completed';

        const existingSubmission = await Submission.findOne({ examId: id, studentId });

        if (isPastDue && !existingSubmission) {
            return res.status(200).json({
                success: true,
                data: { exam, questions: [], submission: null, isReadonly: true, isMissed: true }
            });
        }

        const questions  = await Question.find({ _id: { $in: exam.questions } });
        const isReadonly = !!existingSubmission || isPastDue;

        res.status(200).json({ success: true, data: { exam, questions, submission: existingSubmission, isReadonly, isMissed: false } });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to load exam.' });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;
        const studentId = req.user.email;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

        const now       = new Date();
        const startTime = new Date(exam.startTime || exam.scheduledDate);
        const endTime   = exam.endTime
            ? new Date(exam.endTime)
            : new Date(startTime.getTime() + exam.durationMinutes * 60_000);

        if (now > endTime || exam.status === 'completed') {
            return res.status(403).json({ success: false, message: 'Exam is past its due date.' });
        }

        const questionIds     = answers.map(a => a.questionId);
        const actualQuestions = await Question.find({ _id: { $in: questionIds } });

        let score = 0;
        const processedAnswers = answers.map(studentAns => {
            const question = actualQuestions.find(q => q._id.toString() === studentAns.questionId);
            let isCorrect  = false;
            if (question) {
                isCorrect = question.type === 'essay'
                    ? question.correctAnswers.some(a => a.toLowerCase().trim() === studentAns.answer.toLowerCase().trim())
                    : question.correctAnswers.includes(studentAns.answer);
            }
            if (isCorrect) score++;
            return { questionId: studentAns.questionId, answer: studentAns.answer, isCorrect };
        });

        const totalQuestions = actualQuestions.length;
        const percentage     = totalQuestions > 0
            ? parseFloat(((score / totalQuestions) * 100).toFixed(2))
            : 0;

        await Submission.create({ examId, studentId, answers: processedAnswers, score, totalQuestions, percentage });

        res.status(201).json({ success: true, message: 'Exam submitted!', data: { score, totalQuestions, percentage } });
    } catch (error) {
        // Unique index violation = duplicate submission race condition
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam.' });
        }
        res.status(500).json({ success: false, message: 'Failed to submit exam.' });
    }
};

exports.getExamSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ examId: req.params.id }).sort({ submittedAt: -1 });
        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
    }
};

exports.getStudentSubmissions = async (req, res) => {
    try {
        const studentId   = req.user.email;
        const submissions = await Submission.find({ studentId })
            .populate('examId', 'title courseName')
            .sort({ submittedAt: -1 });

        const data = submissions.map(s => ({
            _id:            s._id,
            examId:         s.examId?._id,
            examTitle:      s.examId?.title || 'Exam',
            courseName:     s.examId?.courseName || '',
            studentId:      s.studentId,
            score:          s.score,
            totalQuestions: s.totalQuestions,
            percentage:     s.percentage,
            submittedAt:    s.submittedAt
        }));

        res.status(200).json({ success: true, data });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
    }
};

// ── ANALYTICS ─────────────────────────────────────────────────────

exports.getLecturerAnalytics = async (req, res) => {
    try {
        const lecturerId = req.user.email;
        const [exams, classes] = await Promise.all([
            Exam.find({ lecturerId }),
            Class.find({ lecturerId })
        ]);

        const examIds     = exams.map(e => e._id.toString());
        const submissions = await Submission.find({ examId: { $in: examIds } }).sort({ submittedAt: -1 });

        const uniqueStudents = new Set(classes.flatMap(c => c.students));

        let totalPercentage = 0;
        let passedCount     = 0;
        submissions.forEach(sub => {
            totalPercentage += sub.percentage || 0;
            if (sub.percentage >= 50) passedCount++;
        });

        const avgScore = submissions.length > 0
            ? (totalPercentage / submissions.length).toFixed(1)
            : 0;
        const passRate = submissions.length > 0
            ? Math.round((passedCount / submissions.length) * 100)
            : 0;

        const chartData = exams.map(exam => {
            const subs   = submissions.filter(s => s.examId.toString() === exam._id.toString());
            const eTotal = subs.reduce((acc, s) => acc + (s.percentage || 0), 0);
            return {
                title:         exam.title,
                avgPercentage: subs.length > 0 ? Math.round(eTotal / subs.length) : 0,
                attempts:      subs.length
            };
        }).filter(e => e.attempts > 0);

        const recentActivity = submissions.slice(0, 5).map(sub => {
            const examObj = exams.find(e => e._id.toString() === sub.examId.toString());
            return {
                studentId:      sub.studentId,
                examTitle:      examObj ? examObj.title : 'Deleted Exam',
                score:          sub.score,
                totalQuestions: sub.totalQuestions,
                percentage:     sub.percentage,
                submittedAt:    sub.submittedAt
            };
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalExams:       exams.length,
                    activeStudents:   uniqueStudents.size,
                    totalSubmissions: submissions.length,
                    avgScore,
                    passRate
                },
                chartData,
                recentActivity
            }
        });
    } catch {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
    }
};
