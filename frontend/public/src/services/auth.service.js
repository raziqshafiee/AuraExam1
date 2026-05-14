const AuthService = {
    baseUrl: '/api/auth',

    _getAuthHeader() {
        const token = localStorage.getItem('aura_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('aura_token', data.token);
            }
            return data;
        } catch (error) {
            return { success: false, message: "Server connection failed." };
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Server connection failed." };
        }
    },

    async googleAuth(credential, role) {
        try {
            const body = { credential };
            if (role) body.role = role;
            const response = await fetch(`${this.baseUrl}/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('aura_token', data.token);
            }
            return data;
        } catch {
            return { success: false, message: 'Google sign-in failed.' };
        }
    },

    logout() {
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user_session');
    }
};
