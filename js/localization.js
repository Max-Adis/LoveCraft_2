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
            const response = await fetch(`../locales/${this.currentLang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to French
            this.currentLang = 'fr';
            const response = await fetch('../locales/fr.json');
            this.translations = await response.json();
        }
    }

    t(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
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
        
        // Appliquer la direction RTL pour certaines langues si besoin
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    }

    async switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('lovecraft_lang', lang);
        
        await this.loadTranslations();
        this.applyLanguage();
        
        // Recharger les scripts qui dépendent de la langue
        this.triggerLanguageChange();
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

    triggerLanguageChange() {
        // Événement personnalisé pour informer d'autres scripts
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }

    // Méthode pour traduire du texte dynamique
    translate(text) {
        // Simple mapping pour les textes communs
        const mappings = {
            'fr': {
                'Bonjour': 'Hello',
                'Connexion': 'Login',
                'Inscription': 'Sign Up',
                'Créer une surprise': 'Create a surprise',
                'Email': 'Email',
                'Mot de passe': 'Password'
            },
            'en': {
                'Hello': 'Bonjour',
                'Login': 'Connexion',
                'Sign Up': 'Inscription',
                'Create a surprise': 'Créer une surprise',
                'Email': 'Email',
                'Password': 'Mot de passe'
            }
        };
        
        return mappings[this.currentLang]?.[text] || text;
    }
}

// Exporter une instance globale
const i18n = new LocalizationManager();
export default i18n;
