const ExamService = {
    baseUrl: '/api',

    _getHeaders() {
        const token = localStorage.getItem('aura_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    async getStudentExams() {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/exams/student/${studentId}`, {
                headers: this._getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Database connection failed." };
        }
    },

    async getStudentClasses() {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/classes/student/${studentId}`, {
                headers: this._getHeaders()
            });
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
                headers: this._getHeaders(),
                body: JSON.stringify({ classCode, studentId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to connect to the server." };
        }
    },

    async getExamToTake(examId) {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/exams/${examId}/take/${studentId}`, {
                headers: this._getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to load the exam." };
        }
    },

    async getStudentSubmissions() {
        try {
            const session = JSON.parse(localStorage.getItem('aura_user_session'));
            const studentId = session && session.email ? session.email : 'unknown';

            const response = await fetch(`${this.baseUrl}/submissions/student/${studentId}`, {
                headers: this._getHeaders()
            });
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
                headers: this._getHeaders(),
                body: JSON.stringify({ examId, studentId, answers })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Failed to submit exam." };
        }
    }
};
