const AuthController = {
    init: function() {
        AuthView.init();
        this.bindEvents();
    },

    bindEvents: function() {
        AuthView.tabLogin.addEventListener('click', () => AuthView.renderTabSwitch('login'));
        AuthView.tabRegister.addEventListener('click', () => AuthView.renderTabSwitch('register'));
        AuthView.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        AuthView.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    },

    async handleLogin(e) {
        e.preventDefault();
        
        // Grab the email the user typed in
        const userEmail = AuthView.loginEmail.value;
        const userPass = document.getElementById('login-password').value;

        const res = await AuthService.login(userEmail, userPass);
        
        if (res.success) {
            AuthView.showMessage(res.message, 'success');
            AuthView.showRedirectOverlay(res.role.toUpperCase(), res.redirectUrl);

            localStorage.setItem('aura_user_session', JSON.stringify({
                role: res.role,
                email: res.email || userEmail,
                name: res.name || userEmail.split('@')[0]
            }));

            setTimeout(() => window.location.href = res.redirectUrl, 2000);
        } else {
            AuthView.showMessage(res.message, 'error');
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };
        const res = await AuthService.register(data);
        if (res.success) {
            AuthView.showMessage(res.message, 'success');
            setTimeout(() => AuthView.renderTabSwitch('login'), 2000);
        } else {
            AuthView.showMessage(res.message, 'error');
        }
    }
};