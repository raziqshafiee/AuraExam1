const SecurityGuard = {
    protectPage: function(allowedRole) {
        const session = localStorage.getItem('aura_user_session');
        
        if (!session) {
            console.warn("No active session found. Redirecting to login...");
            window.location.href = '/src/views/auth.html';
            return;
        }

        const user = JSON.parse(session);

        // Check if the user has the right permissions for this page
        if (allowedRole && user.role !== allowedRole) {
            alert("Access Denied: You do not have permission to view this page.");
            window.location.href = '/src/views/auth.html';
            return;
        }

        console.log(`Authenticated as ${user.role}`);
    },

    // Gets the current user session data for the dashboards
    getSession: function() {
        const saved = localStorage.getItem('aura_user_session');
        if (saved) {
            const parsedSession = JSON.parse(saved);
            // Safety Fallback: Ensure an email exists so .split('@') never crashes
            if (!parsedSession.email) {
                parsedSession.email = 'lecturer@auraexam.com'; 
            }
            return parsedSession;
        }
        return null;
    },

    logout: function() {
        localStorage.removeItem('aura_user_session');
        window.location.href = '/src/views/auth.html';
    },

    // Proctoring Feature: Detect if user tries to "Exit" or switch tabs
    initProctoring: function() {
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                console.warn("Security Alert: User left the exam tab!");
            }
        });

        window.addEventListener("blur", () => {
            console.warn("Security Alert: Window lost focus!");
        });
    }
};