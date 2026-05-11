const AuthView = {
    init: function() {
        this.loginForm = document.getElementById('form-login');
        this.registerForm = document.getElementById('form-register');
        this.tabLogin = document.getElementById('tab-login');
        this.tabRegister = document.getElementById('tab-register');
        this.msgBox = document.getElementById('message-box');
        
        this.regRole = document.getElementById('reg-role');
        this.regPass = document.getElementById('reg-password');
        this.regConfirm = document.getElementById('reg-confirm');
        
        this.loginEmail = document.getElementById('login-email');

        this.overlay = document.getElementById('redirect-overlay');
        this.overlayText = document.getElementById('redirect-text');
        this.overlayUrl = document.getElementById('redirect-url');
    },

    renderTabSwitch: function(activeTab) {
        this.msgBox.classList.add('hidden');

        if (activeTab === 'login') {
            this.registerForm.classList.add('hidden');
            this.registerForm.classList.remove('fade-enter-active');
            this.loginForm.classList.remove('hidden');
            setTimeout(() => this.loginForm.classList.add('fade-enter-active'), 10);

            this.tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-md bg-white shadow-sm text-blue-700 transition-all";
            this.tabRegister.className = "flex-1 py-2 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all";
        } else {
            this.loginForm.classList.add('hidden');
            this.loginForm.classList.remove('fade-enter-active');
            this.registerForm.classList.remove('hidden');
            setTimeout(() => this.registerForm.classList.add('fade-enter-active'), 10);

            this.tabRegister.className = "flex-1 py-2 text-sm font-medium rounded-md bg-white shadow-sm text-blue-700 transition-all";
            this.tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all";
        }
    },

    showMessage: function(text, type) {
        this.msgBox.textContent = text;
        this.msgBox.className = 'mb-4 p-3 rounded-lg text-sm text-center font-medium';
        
        if (type === 'error') {
            this.msgBox.classList.add('bg-red-100', 'text-red-700');
        } else {
            this.msgBox.classList.add('bg-green-100', 'text-green-700');
        }
    },

    showRedirectOverlay: function(role, url) {
        this.overlay.classList.remove('hidden');
        this.overlayText.innerText = `Connecting to ${role} portal...`;
        this.overlayUrl.innerText = `Redirecting -> ${url}`;
    },

    clearForms: function() {
        this.loginForm.reset();
        this.registerForm.reset();
    }
};