
class LocalizationManager {
    constructor() {
        this.currentLang = localStorage.getItem('lovecraft_lang') || 'fr';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.applyLanguage();
        this.setupLanguageToggle();
    }

    async loadTranslations() {
        try {
            // Chemin relatif pour GitHub Pages
            const response = await fetch(`locales/${this.currentLang}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.translations = await response.json();
            console.log(`✅ Traductions ${this.currentLang} chargées`);
            
        } catch (error) {
            console.error('❌ Erreur chargement traductions:', error);
            
            // Fallback : traductions intégrées
            this.translations = {
                'app': {
                    'title': 'LoveCraft - Créez des surprises digitales'
                },
                'nav': {
                    'login': 'Connexion',
                    'signup': 'Inscription',
                    'dashboard': 'Tableau de bord',
                    'create': 'Créer',
                    'settings': 'Paramètres',
                    'logout': 'Déconnexion'
                },
                'hero': {
                    'title': 'Créez des surprises digitales<br>inoubliables',
                    'cta1': 'Commencer gratuitement',
                    'cta2': 'Voir notre histoire'
                },
                'auth': {
                    'login': 'Connexion',
                    'signup': 'Inscription',
                    'email': 'Email',
                    'password': 'Mot de passe',
                    'confirmPassword': 'Confirmer le mot de passe',
                    'forgotPassword': 'Mot de passe oublié ?',
                    'or': 'ou',
                    'google': 'Continuer avec Google',
                    'noAccount': 'Pas de compte ?',
                    'hasAccount': 'Déjà un compte ?'
                },
                'dashboard': {
                    'welcome': 'Bonjour',
                    'createSurprise': 'Créer une surprise',
                    'mySurprises': 'Mes surprises',
                    'stats': 'Statistiques',
                    'noSurprises': 'Aucune surprise créée'
                },
                'footer': {
                    'copyright': '© 2025 LoveCraft - Conçu avec ❤️ par Max_Adis',
                    'story': 'Inspiré par une histoire vraie d\'amour',
                    'navigation': 'Navigation',
                    'legal': 'Légal',
                    'contact': 'Contact'
                }
            };
        }
    }

    t(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Traduction manquante: ${key}`);
                return defaultValue || key;
            }
        }
        
        return value || defaultValue || key;
    }

    applyLanguage() {
        // Titre de la page
        document.title = this.t('app.title');
        
        // Texte des éléments avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Mettre à jour le bouton de langue
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.innerHTML = `<i class="fas fa-globe mr-1"></i>${this.currentLang === 'fr' ? 'EN' : 'FR'}`;
        }
        
        // Stocker la langue
        localStorage.setItem('lovecraft_lang', this.currentLang);
        
        console.log(`✅ Langue appliquée: ${this.currentLang}`);
    }

    async switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        
        await this.loadTranslations();
        this.applyLanguage();
        
        // Notifier l'utilisateur
        this.showNotification(`🌍 Langue changée en ${lang === 'fr' ? 'Français' : 'English'}`);
    }

    setupLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const newLang = this.currentLang === 'fr' ? 'en' : 'fr';
                this.switchLanguage(newLang);
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-purple-100 text-purple-800 px-6 py-4 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-3"></i>
                <div>${message}</div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Créer une instance globale
const i18n = new LocalizationManager();

// Exporter pour les autres fichiers
export default i18n;

