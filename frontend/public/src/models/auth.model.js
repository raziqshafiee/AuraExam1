const AuthModel = {
    state: { 
        activeTab: 'login',
        user: null 
    },
    
    routes: {
        'student': '/student-dashboard.html',
        'lecturer': '/lecturer-dashboard.html',
        'admin': '/admin.html'
    },
    
    // --- Session Management ---
    saveSession: function(userData) {
        this.state.user = userData;
        localStorage.setItem('aura_user_session', JSON.stringify(userData));
    },

    getSession: function() {
        const saved = localStorage.getItem('aura_user_session');
        return saved ? JSON.parse(saved) : null;
    },

    clearSession: function() {
        this.state.user = null;
        localStorage.removeItem('aura_user_session');
    },

    // --- Logic ---
    registerUser: function(data) {
        if (data.password !== data.confirmPassword) {
            return { success: false, message: 'Passwords do not match.' };
        }
        return { success: true, message: `${data.role.toUpperCase()} account created successfully!` };
    },
    
    loginUser: function(email) {
        let detectedRole = 'student';
        
        if (email.includes('admin')) {
            detectedRole = 'admin';
        } else if (email.includes('lecturer') || email.includes('teacher')) {
            detectedRole = 'lecturer';
        }

        const userData = {
            email: email,
            role: detectedRole,
            loginTime: new Date().getTime()
        };

        // Persist the session locally
        this.saveSession(userData);

        return { 
            success: true, 
            message: `Welcome back! Role detected: ${detectedRole.toUpperCase()}`,
            redirectUrl: this.routes[detectedRole],
            role: detectedRole 
        };
    },
    
    setTab: function(tab) { 
        this.state.activeTab = tab; 
    }
};