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
            // CORRECTION : fonctionne avec "/" ET "/index.html"
            const path = window.location.pathname;
            const isHomePage = path === '/' || 
                               path.endsWith('/index.html') || 
                               path.endsWith('/LoveCraft/') ||
                               path.endsWith('/LoveCraft');
            
            if (user && isHomePage) {
                window.location.href = 'dashboard.html';
            }
        });

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

        document.getElementById('tabLogin')?.addEventListener('click', () => {
            this.switchTab('login');
        });

        document.getElementById('tabSignup')?.addEventListener('click', () => {
            this.switchTab('signup');
        });

        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.hideAuthModal();
        });

        document.getElementById('closeForgotModal')?.addEventListener('click', () => {
            this.hideForgotModal();
        });

        document.getElementById('submitLogin')?.addEventListener('click', () => {
            this.loginWithEmail();
        });

        document.getElementById('submitSignup')?.addEventListener('click', () => {
            this.signupWithEmail();
        });

        document.getElementById('googleLogin')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        document.getElementById('googleSignup')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        document.getElementById('forgotPassword')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotModal();
        });

        document.getElementById('submitReset')?.addEventListener('click', () => {
            this.resetPassword();
        });

        document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loginWithEmail();
        });

        document.getElementById('signupConfirm')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.signupWithEmail();
        });
    }

    showAuthModal(tab = 'login') {
        document.getElementById('authModal').classList.remove('hidden');
        this.switchTab(tab);
    }

    hideAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
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
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.classList.remove('hidden');
        }
    }

    showSuccess(message) {
        const div = document.createElement('div');
        div.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50';
        div.innerHTML = `<div class="flex items-center"><i class="fas fa-check-circle mr-3"></i><div>${message}</div></div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    async loginWithEmail() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('loginError', 'Veuillez remplir tous les champs');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            this.hideAuthModal();
            // Redirection manuelle en plus de onAuthStateChanged
            window.location.href = 'dashboard.html';
        } catch (error) {
            // CORRECTION : nouveaux codes d'erreur Firebase v9+
            let message = 'Erreur de connexion';
            switch (error.code) {
                case 'auth/invalid-email':
                    message = 'Email invalide'; break;
                case 'auth/user-disabled':
                    message = 'Compte désactivé'; break;
                case 'auth/user-not-found':
                    message = 'Aucun compte avec cet email'; break;
                case 'auth/wrong-password':
                    message = 'Mot de passe incorrect'; break;
                case 'auth/invalid-credential':
                    message = 'Email ou mot de passe incorrect'; break;
                case 'auth/too-many-requests':
                    message = 'Trop de tentatives, réessayez plus tard'; break;
                case 'auth/network-request-failed':
                    message = 'Erreur réseau, vérifiez votre connexion'; break;
                default:
                    message = 'Email ou mot de passe incorrect';
            }
            this.showError('loginError', message);
        }
    }

    async signupWithEmail() {
        const email = document.getElementById('signupEmail').value.trim();
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
            window.location.href = 'dashboard.html';
        } catch (error) {
            let message = "Erreur d'inscription";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Cet email est déjà utilisé'; break;
                case 'auth/invalid-email':
                    message = 'Email invalide'; break;
                case 'auth/weak-password':
                    message = 'Mot de passe trop faible (min 6 caractères)'; break;
                default:
                    message = "Erreur lors de la création du compte";
            }
            this.showError('signupError', message);
        }
    }

    async loginWithGoogle() {
        try {
            await signInWithPopup(auth, googleProvider);
            window.location.href = 'dashboard.html';
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                this.showError('loginError', 'Erreur Google : ' + error.message);
            }
        }
    }

    async resetPassword() {
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email) {
            alert('Veuillez entrer votre email');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            this.showSuccess('Email de réinitialisation envoyé !');
            this.hideForgotModal();
        } catch (error) {
            alert('Erreur : email introuvable');
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
