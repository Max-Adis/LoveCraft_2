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
            // Chemin RELATIF depuis le dossier racine
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
                    'signup': 'Inscription'
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
                    'forgotPassword': 'Mot de passe oublié ?',
                    'or': 'ou',
                    'google': 'Continuer avec Google'
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
        
        console.log(`✅ Langue appliquée: ${this.currentLang}`);
    }

    async switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('lovecraft_lang', lang);
        
        await this.loadTranslations();
        this.applyLanguage();
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
}

// Créer une instance globale
const i18n = new LocalizationManager();

// Exporter pour les autres fichiers
export default i18n;
