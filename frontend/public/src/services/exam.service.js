const ExamService = {
    // Base API URL for all exam/class requests
    baseUrl: 'http://localhost:5001/api',

    async getStudentExams() {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/exams/student/${studentId}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: "Database connection failed." };
        }
    },

    async getStudentClasses() {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/classes/student/${studentId}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to fetch enrolled classes." };
        }
    },

    async enrollInClass(classCode) {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/exams/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classCode, studentId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to connect to the server." };
        }
    },

    // ADD THESE TWO FUNCTIONS:
     async getExamToTake(examId) {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/exams/${examId}/take/${studentId}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to load the exam." };
        }
    },

     async getStudentSubmissions() {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/submissions/student/${studentId}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    async submitExam(examId, answers) {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/exams/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId, studentId, answers })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to submit exam." };
        }
    }
};