[file name]: auth.js
[file content begin]
import { 
    auth, googleProvider,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from './firebase.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user && window.location.pathname.includes('index.html')) {
                window.location.href = 'dashboard.html';
            }
        });

        // Boutons navigation
        document.getElementById('loginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('login');
        });

        document.getElementById('signupBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('signup');
        });

        document.getElementById('ctaSignup')?.addEventListener('click', () => {
            this.showAuthModal('signup');
        });

        // Tabs modal
        document.getElementById('tabLogin')?.addEventListener('click', () => {
            this.switchTab('login');
        });

        document.getElementById('tabSignup')?.addEventListener('click', () => {
            this.switchTab('signup');
        });

        // Fermer modals
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.hideAuthModal();
        });

        document.getElementById('closeForgotModal')?.addEventListener('click', () => {
            this.hideForgotModal();
        });

        // Connexion email/password
        document.getElementById('submitLogin')?.addEventListener('click', () => {
            this.loginWithEmail();
        });

        document.getElementById('submitSignup')?.addEventListener('click', () => {
            this.signupWithEmail();
        });

        // Google
        document.getElementById('googleLogin')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        document.getElementById('googleSignup')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        // Mot de passe oublié
        document.getElementById('forgotPassword')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotModal();
        });

        document.getElementById('submitReset')?.addEventListener('click', () => {
            this.resetPassword();
        });

        // Enter key
        document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loginWithEmail();
        });

        document.getElementById('signupConfirm')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.signupWithEmail();
        });
    }

    showAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        modal.classList.remove('hidden');
        this.switchTab(tab);
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.add('hidden');
        this.clearErrors();
    }

    showForgotModal() {
        this.hideAuthModal();
        document.getElementById('forgotPasswordModal').classList.remove('hidden');
    }

    hideForgotModal() {
        document.getElementById('forgotPasswordModal').classList.add('hidden');
    }

    switchTab(tab) {
        const loginTab = document.getElementById('tabLogin');
        const signupTab = document.getElementById('tabSignup');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (tab === 'login') {
            loginTab.classList.add('text-purple-600', 'border-purple-600');
            loginTab.classList.remove('text-gray-500');
            signupTab.classList.remove('text-purple-600', 'border-purple-600');
            signupTab.classList.add('text-gray-500');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            signupTab.classList.add('text-purple-600', 'border-purple-600');
            signupTab.classList.remove('text-gray-500');
            loginTab.classList.remove('text-purple-600', 'border-purple-600');
            loginTab.classList.add('text-gray-500');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
        this.clearErrors();
    }

    clearErrors() {
        document.getElementById('loginError')?.classList.add('hidden');
        document.getElementById('signupError')?.classList.add('hidden');
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50';
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-3"></i>
                <div>${message}</div>
            </div>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    async loginWithEmail() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('loginError', 'Veuillez remplir tous les champs');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            this.hideAuthModal();
            this.showSuccess('Connexion réussie !');
        } catch (error) {
            let message = 'Erreur de connexion';
            switch (error.code) {
                case 'auth/invalid-email': message = 'Email invalide'; break;
                case 'auth/user-disabled': message = 'Compte désactivé'; break;
                case 'auth/user-not-found': message = 'Compte non trouvé'; break;
                case 'auth/wrong-password': message = 'Mot de passe incorrect'; break;
                default: message = error.message;
            }
            this.showError('loginError', message);
        }
    }

    async signupWithEmail() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;

        if (!email || !password || !confirm) {
            this.showError('signupError', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirm) {
            this.showError('signupError', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            this.showError('signupError', 'Le mot de passe doit faire au moins 6 caractères');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            this.hideAuthModal();
            this.showSuccess('Compte créé avec succès !');
        } catch (error) {
            let message = "Erreur d'inscription";
            switch (error.code) {
                case 'auth/email-already-in-use': message = 'Cet email est déjà utilisé'; break;
                case 'auth/invalid-email': message = 'Email invalide'; break;
                case 'auth/operation-not-allowed': message = 'Opération non autorisée'; break;
                case 'auth/weak-password': message = 'Mot de passe trop faible'; break;
                default: message = error.message;
            }
            this.showError('signupError', message);
        }
    }

    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Stocker le nom Google pour pré-remplissage
            localStorage.setItem('googleUserName', result.user.displayName);
            localStorage.setItem('googleUserPhoto', result.user.photoURL);
            this.hideAuthModal();
            this.showSuccess('Connexion Google réussie !');
        } catch (error) {
            this.showError('loginError', 'Erreur avec Google : ' + error.message);
        }
    }

    async resetPassword() {
        const email = document.getElementById('resetEmail').value;
        
        if (!email) {
            alert('Veuillez entrer votre email');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            this.showSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
            this.hideForgotModal();
        } catch (error) {
            alert('Erreur : ' + error.message);
        }
    }

    async logout() {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    }
}

new AuthManager();
[file content end]
