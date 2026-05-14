const SecurityGuard = {
    protectPage: function(allowedRole) {
        const session = localStorage.getItem('aura_user_session');
        if (!session) {
            window.location.href = '/src/views/auth.html';
            return;
        }
        const user = JSON.parse(session);
        if (allowedRole && user.role !== allowedRole) {
            alert('Access Denied: You do not have permission to view this page.');
            window.location.href = '/src/views/auth.html';
        }
    },

    getSession: function() {
        const saved = localStorage.getItem('aura_user_session');
        if (!saved) return null;
        const session = JSON.parse(saved);
        if (!session.email) session.email = 'user@auraexam.com';
        return session;
    },

    authFetch: function(url, options = {}) {
        const token = localStorage.getItem('aura_token');
        const headers = Object.assign({ 'Authorization': `Bearer ${token}` }, options.headers || {});
        return fetch(url, Object.assign({}, options, { headers }));
    },

    logout: function() {
        localStorage.removeItem('aura_user_session');
        localStorage.removeItem('aura_token');
        window.location.href = '/src/views/auth.html';
    },

    // ── Real proctoring: records events to tracking-service ──
    initProctoring: function(examId) {
        if (!examId) return;

        document.addEventListener('visibilitychange', () => {
            this._record(examId, 'tab_switch', { direction: document.hidden ? 'away' : 'return' });
        });

        window.addEventListener('blur', () => {
            this._record(examId, 'window_blur', {});
        });

        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this._record(examId, 'copy_attempt', {});
        });

        document.addEventListener('paste', (e) => {
            e.preventDefault();
            this._record(examId, 'paste_attempt', {});
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this._record(examId, 'right_click', {});
        });

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this._record(examId, 'fullscreen_exit', {});
            }
        });
    },

    _record: async function(examId, eventType, metadata) {
        const session = this.getSession();
        const token   = localStorage.getItem('aura_token');
        if (!session || !token) return;
        try {
            await fetch('/api/tracking/event', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ examId, studentId: session.email, eventType, metadata })
            });
        } catch {
            // Silent — never disrupt the exam
        }
    }
};
