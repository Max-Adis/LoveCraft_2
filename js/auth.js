import { 
    auth, googleProvider,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from './firebase.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Écouter les changements d'authentification
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user) {
                // Rediriger vers le dashboard si connecté
                window.location.href = 'dashboard.html';
            }
        });

        // Gestion des boutons
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

        document.getElementById('demoBtn')?.addEventListener('click', () => {
            // Mode démo avec compte temporaire
            this.demoMode();
        });

        // Gestion des tabs
        document.getElementById('tabLogin')?.addEventListener('click', () => {
            this.switchTab('login');
        });

        document.getElementById('tabSignup')?.addEventListener('click', () => {
            this.switchTab('signup');
        });

        // Fermer modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.hideAuthModal();
        });

        // Connexion email/password
        document.getElementById('submitLogin')?.addEventListener('click', () => {
            this.loginWithEmail();
        });

        document.getElementById('submitSignup')?.addEventListener('click', () => {
            this.signupWithEmail();
        });

        // Connexion Google
        document.getElementById('googleLogin')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        document.getElementById('googleSignup')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        // Enter key pour les formulaires
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
        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('signupError').classList.add('hidden');
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
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
        } catch (error) {
            let message = 'Erreur de connexion';
            switch (error.code) {
                case 'auth/invalid-email':
                    message = 'Email invalide';
                    break;
                case 'auth/user-disabled':
                    message = 'Compte désactivé';
                    break;
                case 'auth/user-not-found':
                    message = 'Compte non trouvé';
                    break;
                case 'auth/wrong-password':
                    message = 'Mot de passe incorrect';
                    break;
                default:
                    message = error.message;
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
        } catch (error) {
            let message = "Erreur d'inscription";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Cet email est déjà utilisé';
                    break;
                case 'auth/invalid-email':
                    message = 'Email invalide';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Opération non autorisée';
                    break;
                case 'auth/weak-password':
                    message = 'Mot de passe trop faible';
                    break;
                default:
                    message = error.message;
            }
            this.showError('signupError', message);
        }
    }

    async loginWithGoogle() {
        try {
            await signInWithPopup(auth, googleProvider);
            this.hideAuthModal();
        } catch (error) {
            this.showError('loginError', 'Erreur avec Google : ' + error.message);
        }
    }

    async demoMode() {
        // Compte démo temporaire
        const demoEmail = 'demo@lovecraft.com';
        const demoPassword = 'demo123';

        try {
            await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Créer le compte démo
                try {
                    await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
                } catch (createError) {
                    this.showError('loginError', 'Impossible de créer le compte démo');
                }
            }
        }
    }

    async logout() {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        }
    }
}

// Initialiser l'authentification
new AuthManager();
