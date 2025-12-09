import { database, auth, ref, set, get, update } from './firebase.js';

class SurpriseCreator {
    constructor(userId) {
        this.userId = userId;
        this.user = auth.currentUser;
        this.step = 1;
        this.templates = this.getTemplates();
        
        const googleName = localStorage.getItem('googleUserName') || this.user.displayName || '';
        
        this.surprise = {
            pourQui: '',
            deLaPartDe: googleName,
            question1: 'Qui t\'aime plus que tout au monde ?',
            reponse1: googleName,
            customHint: '', // NOUVEAU: Indice personnalisé
            messageFinal: 'Je t\'aime plus que tout au monde...',
            template: 'romantic', // NOUVEAU: Template au lieu de theme
            music: 'romantic-piano.mp3', // NOUVEAU: Musique du template
            effects: ['hearts', 'sparkles'], // NOUVEAU: Effets visuels
            createdAt: new Date().toISOString(),
            views: 0,
            completedViews: 0,
            colors: { // NOUVEAU: Couleurs du template
                primary: '#ec4899',
                secondary: '#d946ef',
                gradient: 'from-pink-500 to-purple-500'
            }
        };
        
        this.surpriseId = null;
        this.editMode = false;
        this.init();
    }

    getTemplates() {
        return {
            romantic: {
                name: 'Romantique',
                emoji: '❤️',
                colors: {
                    primary: '#ec4899',
                    secondary: '#d946ef',
                    gradient: 'from-pink-500 to-purple-500'
                },
                music: 'romantic-piano.mp3',
                effects: ['hearts', 'sparkles']
            },
            geek: {
                name: 'Geek',
                emoji: '👨‍💻',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#1d4ed8',
                    gradient: 'from-blue-500 to-indigo-500'
                },
                music: 'electronic.mp3',
                effects: ['code', 'pixels']
            },
            birthday: {
                name: 'Anniversaire',
                emoji: '🎂',
                colors: {
                    primary: '#f59e0b',
                    secondary: '#d97706',
                    gradient: 'from-yellow-500 to-orange-500'
                },
                music: 'happy-birthday.mp3',
                effects: ['confetti', 'balloons']
            },
            friendship: {
                name: 'Amitié',
                emoji: '🤝',
                colors: {
                    primary: '#10b981',
                    secondary: '#059669',
                    gradient: 'from-green-500 to-emerald-500'
                },
                music: 'friendship.mp3',
                effects: ['stars', 'sparkles']
            },
            mysterious: {
                name: 'Mystérieux',
                emoji: '🔮',
                colors: {
                    primary: '#8b5cf6',
                    secondary: '#7c3aed',
                    gradient: 'from-purple-500 to-violet-500'
                },
                music: 'mysterious.mp3',
                effects: ['fog', 'stars']
            },
            elegant: {
                name: 'Élégant',
                emoji: '👑',
                colors: {
                    primary: '#6b7280',
                    secondary: '#4b5563',
                    gradient: 'from-gray-500 to-gray-700'
                },
                music: 'elegant-piano.mp3',
                effects: ['sparkles', 'glitter']
            }
        };
    }

    async init() {
        this.checkEditMode();
        await this.loadUserPreferences();
        this.render();
        this.bindEvents();
        this.initBackgroundEffects();
    }

    async loadUserPreferences() {
        try {
            const prefsRef = ref(database, `users/${this.user.uid}/preferences`);
            const snapshot = await get(prefsRef);
            
            if (snapshot.exists()) {
                const prefs = snapshot.val();
                if (prefs.defaultTemplate) {
                    this.surprise.template = prefs.defaultTemplate;
                    const template = this.templates[this.surprise.template];
                    if (template) {
                        this.surprise.colors = template.colors;
                        this.surprise.music = template.music;
                        this.surprise.effects = template.effects;
                    }
                }
            }
        } catch (error) {
            console.log('Aucune préférence utilisateur trouvée');
        }
    }

    async checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            this.editMode = true;
            await this.loadSurpriseForEdit(editId);
        }
    }

    async loadSurpriseForEdit(id) {
        try {
            const surpriseRef = ref(database, 'surprises/' + id);
            const snapshot = await get(surpriseRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                this.surpriseId = id;
                this.surprise = { 
                    ...this.surprise, // Garder les valeurs par défaut
                    ...data // Écraser avec les données existantes
                };
                
                // S'assurer que les champs nouveaux existent
                if (!this.surprise.customHint) this.surprise.customHint = '';
                if (!this.surprise.template) this.surprise.template = 'romantic';
                if (!this.surprise.music) this.surprise.music = 'romantic-piano.mp3';
                if (!this.surprise.effects) this.surprise.effects = ['hearts', 'sparkles'];
                if (!this.surprise.colors) {
                    const template = this.templates[this.surprise.template] || this.templates.romantic;
                    this.surprise.colors = template.colors;
                }
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
    }

    render() {
        const app = document.getElementById('app');
        
        if (this.step === 1) {
            app.innerHTML = this.renderStep1();
        } else if (this.step === 2) {
            app.innerHTML = this.renderStep2();
            
            // Générer QR Code avec délai pour laisser le DOM se charger
            setTimeout(() => {
                this.generateQRCode();
                this.initShareEffects();
            }, 100);
        }
    }

    renderStep1() {
        const currentTemplate = this.templates[this.surprise.template] || this.templates.romantic;
        
        return `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <a href="dashboard.html" class="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 hover:scale-105 transition">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour au dashboard
                    </a>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-magic text-purple-600 mr-2 animate-pulse"></i>
                        ${this.editMode ? 'Modifier votre surprise' : 'Créez votre surprise'}
                    </h1>
                    <p class="text-gray-600">
                        Personnalisez chaque détail pour créer un moment unique
                    </p>
                </div>

                <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
                    <!-- Background du template -->
                    <div class="absolute inset-0 opacity-5 z-0" 
                         style="background: linear-gradient(135deg, ${currentTemplate.colors.primary}, ${currentTemplate.colors.secondary})">
                    </div>
                    
                    <div class="relative z-10">
                        <!-- Boutons rapides -->
                        <div class="flex flex-wrap gap-3 mb-8">
                            <button id="previewBtn" class="flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                                <i class="fas fa-eye mr-2"></i>Aperçu
                            </button>
                            <button id="templatesBtn" class="flex items-center bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition">
                                <i class="fas fa-palette mr-2"></i>Changer de template
                            </button>
                            <button id="demoBtn" class="flex items-center bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition">
                                <i class="fas fa-play mr-2"></i>Voir la démo
                            </button>
                        </div>
                        
                        <div class="space-y-8">
                            <!-- Section 1: Pour qui -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800 flex items-center">
                                    <i class="fas fa-user-check mr-2" style="color: ${currentTemplate.colors.primary}"></i>
                                    Pour qui est cette surprise ?
                                </h2>
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de la personne *
                                        </label>
                                        <input 
                                            id="pourQui" 
                                            type="text" 
                                            value="${this.surprise.pourQui}"
                                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-gray-800 transition-all focus:scale-[1.02]"
                                            placeholder="Ex: Eve"
                                            required
                                            style="border-color: ${currentTemplate.colors.primary}30;"
                                        />
                                        <div class="mt-2 text-xs text-gray-500 flex items-center">
                                            <i class="fas fa-info-circle mr-1"></i>
                                            Le nom qui apparaîtra sur la surprise
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Votre nom *
                                        </label>
                                        <input 
                                            id="deLaPartDe" 
                                            type="text" 
                                            value="${this.surprise.deLaPartDe}"
                                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-gray-800 transition-all focus:scale-[1.02]"
                                            placeholder="Ex: Max"
                                            required
                                            style="border-color: ${currentTemplate.colors.secondary}30;"
                                        />
                                        <div class="mt-2 text-xs text-gray-500 flex items-center">
                                            <i class="fas fa-user-edit mr-1"></i>
                                            Comment vous souhaitez vous présenter
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 2: Question et Indice -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800 flex items-center">
                                    <i class="fas fa-question-circle mr-2" style="color: ${currentTemplate.colors.primary}"></i>
                                    Question interactive
                                </h2>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Question à poser
                                    </label>
                                    <input 
                                        id="question1" 
                                        type="text" 
                                        value="${this.surprise.question1}"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-gray-800 transition-all focus:scale-[1.02]"
                                        placeholder="Ex: Qui t'aime plus que tout ?"
                                        style="border-color: ${currentTemplate.colors.primary}30;"
                                    />
                                    <div class="mt-2 text-xs text-gray-500 flex items-center">
                                        <i class="fas fa-lightbulb mr-1"></i>
                                        Cette question sera posée au destinataire
                                    </div>
                                </div>
                                
                                <!-- NOUVELLE SECTION: Indice personnalisé -->
                                <div class="hint-section p-4 rounded-xl">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-lightbulb text-yellow-600 mr-2"></i>
                                        Indice personnalisé
                                    </label>
                                    <input 
                                        id="customHint" 
                                        type="text" 
                                        value="${this.surprise.customHint}"
                                        class="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-800 transition-all focus:scale-[1.02]"
                                        placeholder="Ex: Souviens-toi de notre premier rendez-vous au café..."
                                    />
                                    <div class="mt-2 text-xs text-gray-500 flex items-center">
                                        <i class="fas fa-info-circle text-yellow-600 mr-1"></i>
                                        Cet indice s'affichera si la réponse est incorrecte
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Réponse attendue
                                    </label>
                                    <input 
                                        id="reponse1" 
                                        type="text" 
                                        value="${this.surprise.reponse1}"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-gray-800 transition-all focus:scale-[1.02]"
                                        placeholder="Ex: Max (sera utilisé comme indice)"
                                        style="border-color: ${currentTemplate.colors.secondary}30;"
                                    />
                                    <div class="mt-2 text-xs text-gray-500 flex items-center">
                                        <i class="fas fa-key mr-1"></i>
                                        La bonne réponse pour accéder au message final
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: Message -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800 flex items-center">
                                    <i class="fas fa-heart mr-2" style="color: ${currentTemplate.colors.primary}"></i>
                                    Message final
                                </h2>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Votre message d'amour
                                    </label>
                                    <textarea 
                                        id="messageFinal"
                                        rows="5"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-gray-800 transition-all focus:scale-[1.02] resize-none message-preview"
                                        placeholder="Écrivez votre message le plus touchant..."
                                        style="border-color: ${currentTemplate.colors.primary}30; min-height: 150px;"
                                    >${this.surprise.messageFinal}</textarea>
                                    <div class="flex justify-between mt-2">
                                        <p class="text-sm text-gray-500 flex items-center">
                                            <i class="fas fa-quote-right mr-1"></i>
                                            Ce message sera révélé à la fin de la surprise
                                        </p>
                                        <span id="charCount" class="text-sm font-medium ${this.surprise.messageFinal.length > 500 ? 'text-red-500' : 'text-gray-500'}">
                                            ${this.surprise.messageFinal.length}/500
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 4: Template actuel -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800 flex items-center">
                                    <i class="fas fa-palette mr-2" style="color: ${currentTemplate.colors.primary}"></i>
                                    Template sélectionné
                                </h2>
                                <div class="flex items-center justify-between p-4 rounded-xl border-2" 
                                     style="border-color: ${currentTemplate.colors.primary}; background: linear-gradient(135deg, ${currentTemplate.colors.primary}10, ${currentTemplate.colors.secondary}10)">
                                    <div class="flex items-center">
                                        <div class="text-3xl mr-4">${currentTemplate.emoji}</div>
                                        <div>
                                            <h3 class="font-bold text-gray-800">${currentTemplate.name}</h3>
                                            <p class="text-sm text-gray-600">${currentTemplate.effects.join(', ')}</p>
                                        </div>
                                    </div>
                                    <div class="flex space-x-2">
                                        <div class="w-6 h-6 rounded-full" style="background: ${currentTemplate.colors.primary}"></div>
                                        <div class="w-6 h-6 rounded-full" style="background: ${currentTemplate.colors.secondary}"></div>
                                    </div>
                                </div>
                                
                                <!-- Mini sélecteur de templates -->
                                <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    ${Object.entries(this.templates).map(([key, template]) => `
                                        <button data-template="${key}" 
                                                class="p-2 rounded-lg border ${this.surprise.template === key ? 'border-2' : 'border-gray-200'} transition-all hover:scale-105"
                                                style="${this.surprise.template === key ? `border-color: ${template.colors.primary}` : ''}">
                                            <div class="text-xl mb-1">${template.emoji}</div>
                                            <div class="text-xs font-medium">${template.name}</div>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Bouton création -->
                            <div class="pt-6 border-t border-gray-200">
                                <button id="createBtn" class="btn-magic w-full py-4 text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    <i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2 animate-pulse"></i>
                                    ${this.editMode ? 'Mettre à jour la surprise' : 'Créer ma surprise magique'}
                                </button>
                                <p class="text-center text-sm text-gray-500 mt-4 flex items-center justify-center">
                                    <i class="fas fa-shield-alt mr-2"></i>
                                    Votre surprise sera sauvegardée dans votre espace personnel
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Mini-preview en bas -->
                <div class="mt-6 p-4 bg-white rounded-xl shadow-lg border">
                    <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                        <i class="fas fa-eye mr-2"></i>Aperçu rapide
                    </h3>
                    <div class="text-sm text-gray-600">
                        <p>Pour: <span class="font-bold" id="previewPourQui">${this.surprise.pourQui || '______'}</span></p>
                        <p>De: <span class="font-bold" id="previewDeLaPartDe">${this.surprise.deLaPartDe || '______'}</span></p>
                        <p>Template: <span class="font-bold">${currentTemplate.name}</span></p>
                    </div>
                </div>
            </div>
        `;
    }

    renderStep2() {
        const surpriseUrl = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        const template = this.templates[this.surprise.template] || this.templates.romantic;
        
        return `
            <div class="max-w-6xl mx-auto">
                <!-- En-tête de succès -->
                <div class="text-center mb-8 relative">
                    <div class="absolute inset-0 bg-gradient-to-r ${template.colors.gradient} opacity-10 rounded-3xl blur-xl"></div>
                    <div class="relative z-10">
                        <div class="text-6xl mb-4 animate-bounce">${template.emoji}</div>
                        <h1 class="text-4xl font-bold text-gray-800 mb-4">
                            ${this.editMode ? 'Surprise mise à jour !' : 'Félicitations ! 🎉'}
                        </h1>
                        <p class="text-xl text-gray-600">
                            Votre surprise "<span class="font-bold">${this.surprise.pourQui}</span>" a été ${this.editMode ? 'mise à jour' : 'créée'} avec succès.
                        </p>
                    </div>
                </div>

                <!-- QR Code amélioré -->
                <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${template.colors.gradient}"></div>
                    
                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                            <i class="fas fa-qrcode mr-3" style="color: ${template.colors.primary}"></i>
                            QR Code de votre surprise
                        </h2>
                        
                        <div class="inline-block p-6 bg-gradient-to-br ${template.colors.gradient} rounded-2xl mb-6 animate-pulse-glow">
                            <div id="qrCode" class="bg-white p-4 rounded-xl">
                                <!-- QR Code sera généré ici -->
                                <div class="text-center text-gray-500 p-8">
                                    <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                                    <p class="text-lg">Génération du QR Code...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <p class="text-gray-700 mb-4">
                                <i class="fas fa-info-circle mr-2"></i>
                                Scannez ce QR Code pour découvrir la surprise
                            </p>
                            <div class="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
                                <i class="fas fa-mobile-alt mr-2"></i>
                                <span>Compatible avec tous les smartphones</span>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <button id="downloadQRBtn" class="btn-magic text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <i class="fas fa-download mr-3"></i>Télécharger en HD
                            </button>
                            <button id="shareQRBtn" class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <i class="fas fa-share-alt mr-3"></i>Partager
                            </button>
                            <button id="previewSurpriseBtn" class="bg-gradient-to-r ${template.colors.gradient} text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <i class="fas fa-eye mr-3"></i>Voir la surprise
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Lien de partage amélioré -->
                <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-link mr-3 text-blue-600"></i>
                        Lien de partage direct
                    </h2>
                    <div class="flex flex-col md:flex-row gap-3 mb-4">
                        <div class="flex-grow relative">
                            <input 
                                type="text" 
                                id="surpriseUrl"
                                value="${surpriseUrl}"
                                readonly
                                class="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-mono text-sm"
                            />
                            <i class="fas fa-link absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <div class="flex gap-2">
                            <button id="copyLinkBtn" class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold hover:scale-105">
                                <i class="fas fa-copy mr-2"></i>Copier
                            </button>
                            <button id="testLinkBtn" class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold hover:scale-105">
                                <i class="fas fa-external-link-alt mr-2"></i>Tester
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-info-circle mr-2"></i>
                        Partagez ce lien par message, email ou réseaux sociaux
                    </div>
                </div>

                <!-- Options de partage améliorées -->
                <div class="bg-gradient-to-r ${template.colors.gradient} bg-opacity-10 rounded-2xl p-8 mb-8 border border-purple-200">
                    <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <i class="fas fa-share-alt mr-3" style="color: ${template.colors.primary}"></i>
                        Partagez votre création
                    </h2>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <button class="share-option bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-xl text-center hover:opacity-90 transition hover:scale-105 shadow-lg" data-platform="instagram">
                            <div class="text-4xl mb-3">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="font-bold">Instagram</div>
                            <div class="text-sm opacity-90 mt-1">Story & Post</div>
                        </button>
                        
                        <button class="share-option bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl text-center hover:opacity-90 transition hover:scale-105 shadow-lg" data-platform="facebook">
                            <div class="text-4xl mb-3">
                                <i class="fab fa-facebook"></i>
                            </div>
                            <div class="font-bold">Facebook</div>
                            <div class="text-sm opacity-90 mt-1">Post & Messenger</div>
                        </button>
                        
                        <button class="share-option bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl text-center hover:opacity-90 transition hover:scale-105 shadow-lg" data-platform="whatsapp">
                            <div class="text-4xl mb-3">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="font-bold">WhatsApp</div>
                            <div class="text-sm opacity-90 mt-1">Message & Status</div>
                        </button>
                        
                        <button class="share-option bg-gradient-to-r from-gray-800 to-black text-white p-6 rounded-xl text-center hover:opacity-90 transition hover:scale-105 shadow-lg" data-platform="sms">
                            <div class="text-4xl mb-3">
                                <i class="fas fa-sms"></i>
                            </div>
                            <div class="font-bold">SMS</div>
                            <div class="text-sm opacity-90 mt-1">Message texte</div>
                        </button>
                    </div>
                    
                    <div class="bg-white/80 p-4 rounded-xl">
                        <div class="flex items-start">
                            <i class="fas fa-lightbulb text-yellow-600 text-xl mr-3 mt-1"></i>
                            <div>
                                <p class="font-bold text-gray-800 mb-2">Idées créatives de partage :</p>
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>• Cachez le QR Code dans un livre ou sous un coussin</li>
                                    <li>• Envoyez-le par message avec un indice mystérieux</li>
                                    <li>• Imprimez-le et glissez-le dans une poche ou un sac</li>
                                    <li>• Partagez-le sur les réseaux avec un compte à rebours</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistiques et actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <a href="dashboard.html" class="bg-gradient-to-r ${template.colors.gradient} text-white p-8 rounded-2xl text-center hover:opacity-90 transition hover:scale-105 shadow-xl">
                        <div class="text-4xl mb-4">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <div class="font-bold text-xl mb-2">Dashboard</div>
                        <div class="opacity-90">Voir toutes mes surprises</div>
                    </a>
                    
                    <a href="create.html" class="bg-white border-3 border-dashed ${template.colors.gradient.split(' ')[0].replace('from-', 'border-')} text-gray-800 p-8 rounded-2xl text-center hover:border-solid transition hover:scale-105 shadow-lg">
                        <div class="text-4xl mb-4" style="color: ${template.colors.primary}">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="font-bold text-xl mb-2">Créer une autre</div>
                        <div class="text-gray-500">Nouvelle surprise</div>
                    </a>
                    
                    <a href="s/?id=${this.surpriseId}" target="_blank" class="bg-white border-3 ${template.colors.gradient.split(' ')[0].replace('from-', 'border-')} text-gray-800 p-8 rounded-2xl text-center hover:opacity-90 transition hover:scale-105 shadow-lg">
                        <div class="text-4xl mb-4" style="color: ${template.colors.primary}">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="font-bold text-xl mb-2">Voir la surprise</div>
                        <div class="text-gray-500">Comme le destinataire</div>
                    </a>
                </div>
                
                <!-- Template info -->
                <div class="bg-white rounded-2xl shadow-xl p-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="text-3xl mr-4">${template.emoji}</div>
                            <div>
                                <h3 class="font-bold text-gray-800">Template: ${template.name}</h3>
                                <p class="text-sm text-gray-600">Musique: ${template.music.replace('.mp3', '')} • Effets: ${template.effects.join(', ')}</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <div class="w-8 h-8 rounded-full" style="background: ${template.colors.primary}"></div>
                            <div class="w-8 h-8 rounded-full" style="background: ${template.colors.secondary}"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        if (this.step === 1) {
            this.bindStep1Events();
        } else if (this.step === 2) {
            setTimeout(() => {
                this.bindStep2Events();
            }, 200);
        }
    }

    bindStep1Events() {
        // Mettre à jour la prévisualisation en temps réel
        const updatePreview = () => {
            const pourQui = document.getElementById('pourQui')?.value || '______';
            const deLaPartDe = document.getElementById('deLaPartDe')?.value || '______';
            
            const previewPourQui = document.getElementById('previewPourQui');
            const previewDeLaPartDe = document.getElementById('previewDeLaPartDe');
            
            if (previewPourQui) previewPourQui.textContent = pourQui;
            if (previewDeLaPartDe) previewDeLaPartDe.textContent = deLaPartDe;
        };

        // Input listeners avec prévisualisation
        document.getElementById('pourQui')?.addEventListener('input', (e) => {
            this.surprise.pourQui = e.target.value;
            updatePreview();
            this.animateField(e.target, this.surprise.colors.primary);
        });
        
        document.getElementById('deLaPartDe')?.addEventListener('input', (e) => {
            this.surprise.deLaPartDe = e.target.value;
            this.surprise.reponse1 = e.target.value; // Mettre à jour la réponse automatiquement
            const reponseInput = document.getElementById('reponse1');
            if (reponseInput) reponseInput.value = e.target.value;
            updatePreview();
            this.animateField(e.target, this.surprise.colors.secondary);
        });
        
        document.getElementById('question1')?.addEventListener('input', (e) => {
            this.surprise.question1 = e.target.value;
            this.animateField(e.target, this.surprise.colors.primary);
        });
        
        document.getElementById('reponse1')?.addEventListener('input', (e) => {
            this.surprise.reponse1 = e.target.value;
            this.animateField(e.target, this.surprise.colors.secondary);
        });
        
        // NOUVEAU: Indice personnalisé
        document.getElementById('customHint')?.addEventListener('input', (e) => {
            this.surprise.customHint = e.target.value;
            this.animateField(e.target, '#f59e0b');
        });
        
        // Message avec compteur
        const messageInput = document.getElementById('messageFinal');
        const charCount = document.getElementById('charCount');
        
        if (messageInput) {
            messageInput.addEventListener('input', (e) => {
                this.surprise.messageFinal = e.target.value;
                const count = e.target.value.length;
                if (charCount) {
                    charCount.textContent = `${count}/500`;
                    charCount.className = `text-sm font-medium ${count > 500 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`;
                }
                this.animateField(e.target, this.surprise.colors.primary);
            });
            
            // Auto-resize
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
        
        // Templates mini
        document.querySelectorAll('[data-template]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateKey = e.currentTarget.dataset.template;
                this.changeTemplate(templateKey);
            });
        });
        
        // Boutons d'action
        document.getElementById('previewBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPreview();
        });
        
        document.getElementById('templatesBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTemplatesModal();
        });
        
        document.getElementById('demoBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDemo();
        });
        
        // Bouton création
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.saveSurprise();
            });
        }
        
        // Auto-update de la réponse quand on change le nom
        setTimeout(() => {
            const deLaPartDeInput = document.getElementById('deLaPartDe');
            const reponseInput = document.getElementById('reponse1');
            
            if (deLaPartDeInput && reponseInput && !reponseInput.value) {
                reponseInput.value = deLaPartDeInput.value;
                this.surprise.reponse1 = deLaPartDeInput.value;
            }
        }, 500);
    }

    bindStep2Events() {
        // Copier lien - FONCTIONNEL
        const copyBtn = document.getElementById('copyLinkBtn');
        const urlInput = document.getElementById('surpriseUrl');
        
        if (copyBtn && urlInput) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(urlInput.value);
                    
                    // Feedback visuel amélioré
                    copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copié !';
                    copyBtn.classList.remove('bg-blue-600');
                    copyBtn.classList.add('bg-green-600');
                    copyBtn.classList.add('scale-105');
                    
                    // Animation
                    this.createConfettiEffect(copyBtn);
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy mr-2"></i>Copier';
                        copyBtn.classList.remove('bg-green-600', 'scale-105');
                        copyBtn.classList.add('bg-blue-600');
                    }, 2000);
                    
                } catch (error) {
                    // Fallback pour anciens navigateurs
                    urlInput.select();
                    document.execCommand('copy');
                    alert('Lien copié dans le presse-papier !');
                }
            });
        }
        
        // Tester le lien
        document.getElementById('testLinkBtn')?.addEventListener('click', () => {
            window.open(urlInput.value, '_blank');
        });
        
        // Télécharger QR Code
        const downloadBtn = document.getElementById('downloadQRBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadQRCode();
            });
        }
        
        // Partager QR Code
        const shareBtn = document.getElementById('shareQRBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.showShareOptions();
            });
        }
        
        // Prévisualiser la surprise
        document.getElementById('previewSurpriseBtn')?.addEventListener('click', () => {
            window.open(`s/?id=${this.surpriseId}`, '_blank');
        });
        
        // Boutons partage social
        document.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareOnSocial(platform);
            });
        });
        
        // Ajouter des effets au survol
        this.addHoverEffects();
    }

    animateField(field, color) {
        field.style.boxShadow = `0 0 0 3px ${color}30`;
        setTimeout(() => {
            field.style.boxShadow = '';
        }, 300);
        
        // Effet sonore doux
        this.playSoundEffect('click');
    }

    changeTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;
        
        this.surprise.template = templateKey;
        this.surprise.colors = template.colors;
        this.surprise.music = template.music;
        this.surprise.effects = template.effects;
        
        // Mettre à jour l'affichage
        const templateDisplay = document.querySelector('.template-card');
        if (templateDisplay) {
            templateDisplay.innerHTML = `
                <div class="flex items-center">
                    <div class="text-3xl mr-4">${template.emoji}</div>
                    <div>
                        <h3 class="font-bold text-gray-800">${template.name}</h3>
                        <p class="text-sm text-gray-600">${template.effects.join(', ')}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <div class="w-6 h-6 rounded-full" style="background: ${template.colors.primary}"></div>
                    <div class="w-6 h-6 rounded-full" style="background: ${template.colors.secondary}"></div>
                </div>
            `;
        }
        
        // Mettre à jour les boutons templates
        document.querySelectorAll('[data-template]').forEach(btn => {
            if (btn.dataset.template === templateKey) {
                btn.classList.add('border-2');
                btn.style.borderColor = template.colors.primary;
            } else {
                btn.classList.remove('border-2');
                btn.style.borderColor = '';
            }
        });
        
        // Jouer un son de changement
        this.playSoundEffect('success');
        
        // Animation
        this.createTemplateChangeEffect(template);
    }

    async saveSurprise() {
        // Validation améliorée
        const errors = [];
        
        if (!this.surprise.pourQui.trim()) {
            errors.push('Veuillez entrer le nom de la personne');
            document.getElementById('pourQui').focus();
        }
        
        if (!this.surprise.deLaPartDe.trim()) {
            errors.push('Veuillez entrer votre nom');
            if (!errors.length) document.getElementById('deLaPartDe').focus();
        }
        
        if (this.surprise.messageFinal.length > 500) {
            errors.push('Le message est trop long (max 500 caractères)');
        }
        
        if (errors.length > 0) {
            this.showErrorModal(errors.join('<br>'));
            return;
        }
        
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            const originalHTML = createBtn.innerHTML;
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sauvegarde en cours...';
            createBtn.disabled = true;
            
            // Animation de sauvegarde
            this.createSaveAnimation();
        }
        
        try {
            if (!this.editMode) {
                this.surpriseId = `surprise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            const template = this.templates[this.surprise.template] || this.templates.romantic;
            
            const surpriseData = {
                pourQui: this.surprise.pourQui.trim(),
                deLaPartDe: this.surprise.deLaPartDe.trim(),
                question1: this.surprise.question1.trim(),
                reponse1: this.surprise.reponse1.trim(),
                customHint: this.surprise.customHint.trim(), // NOUVEAU
                messageFinal: this.surprise.messageFinal.trim(),
                template: this.surprise.template,
                music: template.music,
                effects: template.effects,
                colors: template.colors,
                userId: this.user.uid,
                userEmail: this.user.email,
                userName: this.user.displayName || this.surprise.deLaPartDe,
                lastUpdated: new Date().toISOString(),
                views: this.surprise.views || 0,
                completedViews: this.surprise.completedViews || 0,
                status: 'active'
            };
            
            if (!this.editMode) {
                surpriseData.createdAt = new Date().toISOString();
                surpriseData.createdTimestamp = Date.now();
            }
            
            // Sauvegarde principale
            await set(ref(database, 'surprises/' + this.surpriseId), surpriseData);
            
            // Ajout à la liste utilisateur si nouvelle
            if (!this.editMode) {
                await set(ref(database, 'users/' + this.user.uid + '/surprises/' + this.surpriseId), {
                    id: this.surpriseId,
                    pourQui: this.surprise.pourQui,
                    template: this.surprise.template,
                    createdAt: new Date().toISOString(),
                    views: 0
                });
            }
            
            // Passer à l'étape 2 avec effet
            this.createSuccessAnimation();
            
            setTimeout(() => {
                this.step = 2;
                this.render();
                
                // Son de succès
                this.playSoundEffect('reveal');
                
                // Confettis
                this.createConfettiEffect(document.getElementById('app'));
                
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            this.showErrorModal('Erreur de sauvegarde: ' + error.message);
            
            if (createBtn) {
                createBtn.innerHTML = `<i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>${this.editMode ? 'Mettre à jour' : 'Créer'}`;
                createBtn.disabled = false;
            }
        }
    }

    generateQRCode() {
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        const qrContainer = document.getElementById('qrCode');
        
        if (!qrContainer) {
            console.error('Conteneur QR Code non trouvé');
            return;
        }
        
        // Effacer contenu
        qrContainer.innerHTML = '';
        
        // Utiliser l'API QR Code plus fiable
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        qrContainer.appendChild(canvas);
        
        try {
            // Essayer d'abord avec l'API moderne
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrContainer, {
                    text: url,
                    width: 200,
                    height: 200,
                    colorDark: this.surprise.colors.primary,
                    colorLight: "#FFFFFF",
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                // Fallback à l'API en ligne
                const img = document.createElement('img');
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=${this.surprise.colors.primary.replace('#', '')}`;
                img.alt = "QR Code";
                img.className = "w-full h-full";
                qrContainer.innerHTML = '';
                qrContainer.appendChild(img);
            }
            
            // Ajouter animation
            setTimeout(() => {
                qrContainer.classList.add('qr-appear');
            }, 100);
            
        } catch (error) {
            console.error('Erreur génération QR:', error);
            qrContainer.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-red-500 mb-2">QR Code non généré</p>
                    <a href="${url}" class="text-blue-600 text-sm break-all" target="_blank">${url}</a>
                </div>
            `;
        }
    }

    async downloadQRCode() {
        const qrContainer = document.getElementById('qrCode');
        if (!qrContainer) {
            this.showNotification('QR Code non trouvé', 'error');
            return;
        }
        
        const canvas = qrContainer.querySelector('canvas, img');
        if (!canvas) {
            this.showNotification('QR Code non généré. Veuillez patienter...', 'error');
            return;
        }
        
        try {
            // Créer un canvas de design premium
            const downloadCanvas = document.createElement('canvas');
            downloadCanvas.width = 1200;
            downloadCanvas.height = 1600;
            const ctx = downloadCanvas.getContext('2d');
            
            const template = this.templates[this.surprise.template];
            const gradient = ctx.createLinearGradient(0, 0, 1200, 1600);
            gradient.addColorStop(0, template.colors.primary);
            gradient.addColorStop(1, template.colors.secondary);
            
            // Fond
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1200, 1600);
            
            // En-tête avec gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1200, 300);
            
            // Logo LoveCraft
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('LoveCraft', 600, 100);
            ctx.font = '30px Arial';
            ctx.fillText('Surprise Digitale', 600, 160);
            
            // Cœur
            ctx.font = '80px Arial';
            ctx.fillText(template.emoji, 600, 250);
            
            // Informations
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 48px Arial';
            ctx.fillText(`Pour ${this.surprise.pourQui}`, 600, 400);
            ctx.font = '36px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`De la part de ${this.surprise.deLaPartDe}`, 600, 460);
            
            // QR Code
            const qrSize = 500;
            const qrX = 350;
            const qrY = 550;
            
            // Dessiner le QR Code
            if (canvas.tagName === 'CANVAS') {
                ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);
            } else if (canvas.tagName === 'IMG') {
                ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);
            }
            
            // Cadre décoratif
            ctx.strokeStyle = template.colors.primary;
            ctx.lineWidth = 8;
            ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
            
            // Instructions
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 36px Arial';
            ctx.fillText('Comment utiliser :', 600, 1150);
            
            ctx.font = '28px Arial';
            ctx.fillStyle = '#4b5563';
            const instructions = [
                '1. Scannez ce QR Code avec votre téléphone',
                '2. Suivez les étapes pour découvrir la surprise',
                '3. Partagez ce moment magique avec vos proches !'
            ];
            
            instructions.forEach((text, index) => {
                ctx.fillText(text, 600, 1220 + (index * 60));
            });
            
            // Watermark
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'italic 20px Arial';
            ctx.fillText('Créé sur LoveCraft • lovecraft.com', 600, 1550);
            
            // Date
            ctx.fillText(new Date().toLocaleDateString('fr-FR'), 600, 1580);
            
            // Télécharger
            const link = document.createElement('a');
            const fileName = `LoveCraft_${this.surprise.pourQui}_${new Date().toISOString().split('T')[0]}.jpg`;
            link.download = fileName;
            link.href = downloadCanvas.toDataURL('image/jpeg', 1.0);
            
            // Déclencher le téléchargement
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification(`✅ QR Code téléchargé : ${fileName}`);
            
            // Effet sonore
            this.playSoundEffect('success');
            
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            this.showNotification('Erreur lors du téléchargement', 'error');
        }
    }

    showShareOptions() {
        const shareModal = document.createElement('div');
        shareModal.className = 'fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4';
        shareModal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-share-alt mr-2" style="color: ${this.surprise.colors.primary}"></i>
                        Partager votre surprise
                    </h3>
                    <button class="close-share-modal text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-gradient-to-r ${this.surprise.colors.gradient} bg-opacity-10 p-4 rounded-xl">
                        <p class="text-sm text-gray-800 mb-2">
                            <i class="fas fa-lightbulb mr-1" style="color: ${this.surprise.colors.primary}"></i>
                            <strong>Idée créative :</strong> Cachez le QR Code dans un livre, sur un miroir, ou envoyez-le par message !
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button class="share-action bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-lg hover:opacity-90 transition hover:scale-105" data-action="sms">
                            <div class="text-2xl mb-2">
                                <i class="fas fa-sms"></i>
                            </div>
                            <div class="font-bold">SMS</div>
                        </button>
                        
                        <button class="share-action bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg hover:opacity-90 transition hover:scale-105" data-action="email">
                            <div class="text-2xl mb-2">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="font-bold">Email</div>
                        </button>
                        
                        <button class="share-action bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg hover:opacity-90 transition hover:scale-105" data-action="whatsapp">
                            <div class="text-2xl mb-2">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="font-bold">WhatsApp</div>
                        </button>
                        
                        <button class="share-action bg-gradient-to-r from-gray-700 to-black text-white p-4 rounded-lg hover:opacity-90 transition hover:scale-105" data-action="copy">
                            <div class="text-2xl mb-2">
                                <i class="fas fa-copy"></i>
                            </div>
                            <div class="font-bold">Copier lien</div>
                        </button>
                    </div>
                    
                    <div class="text-center">
                        <button id="downloadForStory" class="bg-gradient-to-r ${this.surprise.colors.gradient} text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition w-full">
                            <i class="fab fa-instagram mr-2"></i>Télécharger pour Instagram
                        </button>
                    </div>
                    
                    <p class="text-center text-sm text-gray-500 mt-4">
                        <i class="fas fa-check-circle text-green-500 mr-1"></i>
                        L'image contient déjà le watermark "Créé sur LoveCraft"
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(shareModal);
        
        // Fermer modal
        shareModal.querySelector('.close-share-modal').addEventListener('click', () => {
            shareModal.remove();
        });
        
        // Actions de partage
        shareModal.querySelectorAll('.share-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.performShareAction(action);
                shareModal.remove();
            });
        });
        
        // Télécharger pour Instagram
        shareModal.querySelector('#downloadForStory').addEventListener('click', () => {
            this.downloadForInstagram();
            shareModal.remove();
        });
        
        // Fermer en cliquant à l'extérieur
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.remove();
            }
        });
    }

    performShareAction(action) {
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        const message = `✨ ${this.surprise.deLaPartDe} t'a préparé une surprise spéciale sur LoveCraft ! ✨\n\n${url}\n\nScanne le QR Code pour découvrir le message secret 💖`;
        
        switch(action) {
            case 'sms':
                window.location.href = `sms:?body=${encodeURIComponent(message)}`;
                break;
                
            case 'email':
                window.location.href = `mailto:?subject=Surprise de ${this.surprise.deLaPartDe}&body=${encodeURIComponent(message)}`;
                break;
                
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                break;
                
            case 'copy':
                navigator.clipboard.writeText(message).then(() => {
                    this.showNotification('✅ Message copié dans le presse-papier !');
                }).catch(() => {
                    // Fallback
                    const tempInput = document.createElement('input');
                    tempInput.value = message;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    this.showNotification('✅ Message copié !');
                });
                break;
        }
        
        this.playSoundEffect('click');
    }

    shareOnSocial(platform) {
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        const message = `✨ ${this.surprise.deLaPartDe} t'a préparé une surprise spéciale sur LoveCraft ! ✨`;
        
        let shareUrl = '';
        const fullMessage = `${message}\n\n${url}`;
        
        switch(platform) {
            case 'instagram':
                this.downloadForInstagram();
                this.showNotification('📸 Image téléchargée ! Partagez-la dans votre story Instagram.');
                return;
                
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
                break;
                
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
                break;
                
            case 'sms':
                window.location.href = `sms:?body=${encodeURIComponent(fullMessage)}`;
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        
        this.playSoundEffect('click');
    }

    downloadForInstagram() {
        // Créer une image optimisée pour Instagram
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        
        const template = this.templates[this.surprise.template];
        const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
        gradient.addColorStop(0, template.colors.primary);
        gradient.addColorStop(1, template.colors.secondary);
        
        // Fond
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);
        
        // Contenu
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // Titre
        ctx.font = 'bold 72px Arial';
        ctx.fillText('LoveCraft', 540, 200);
        
        // Sous-titre
        ctx.font = '32px Arial';
        ctx.fillText('Une surprise spéciale pour vous', 540, 280);
        
        // Cœur
        ctx.font = '100px Arial';
        ctx.fillText(template.emoji, 540, 400);
        
        // Message principal
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`Pour: ${this.surprise.pourQui}`, 540, 550);
        ctx.fillText(`De: ${this.surprise.deLaPartDe}`, 540, 620);
        
        // QR Code placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(290, 750, 500, 500);
        
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.fillText('Scannez pour découvrir', 540, 1400);
        ctx.fillText('la surprise !', 540, 1450);
        
        // Call to action
        ctx.font = '28px Arial';
        ctx.fillText('Créez vos propres surprises sur', 540, 1600);
        ctx.fillText('lovecraft.com', 540, 1650);
        
        // Watermark
        ctx.font = '24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('#LoveCraft #SurpriseDigitale', 540, 1850);
        
        // Télécharger
        const link = document.createElement('a');
        link.download = `LoveCraft_Instagram_${this.surprise.pourQui}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        this.showNotification('📱 Image pour Instagram téléchargée !');
        this.playSoundEffect('success');
    }

    // NOUVELLES FONCTIONNALITÉS

    initBackgroundEffects() {
        // Initialiser les effets de fond
        setTimeout(() => {
            this.createFloatingHearts();
            this.initMouseEffects();
        }, 1000);
    }

    createFloatingHearts() {
        const container = document.getElementById('app');
        if (!container) return;
        
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 15}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.2 + 0.1};
                pointer-events: none;
                z-index: 1;
                animation: float-heart ${Math.random() * 10 + 5}s infinite ease-in-out;
            `;
            container.appendChild(heart);
        }
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float-heart {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                50% { transform: translate(${Math.random() * 50 - 25}px, -20px) rotate(${Math.random() * 20 - 10}deg); }
            }
        `;
        document.head.appendChild(style);
    }

    initMouseEffects() {
        document.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.9) {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = '✨';
                sparkle.style.cssText = `
                    position: fixed;
                    font-size: 16px;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    opacity: 0.7;
                    pointer-events: none;
                    z-index: 10000;
                    animation: sparkle-fade 1s ease-out forwards;
                `;
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 1000);
            }
        });
    }

    showPreview() {
        // Récupérer les valeurs actuelles
        const pourQui = document.getElementById('pourQui')?.value || 'Nom';
        const deLaPartDe = document.getElementById('deLaPartDe')?.value || 'Vous';
        const messageFinal = document.getElementById('messageFinal')?.value || 'Message';
        const question1 = document.getElementById('question1')?.value || 'Question';
        
        const modal = document.getElementById('previewModal');
        const content = document.getElementById('previewContent');
        
        if (!modal || !content) return;
        
        const template = this.templates[this.surprise.template];
        
        content.innerHTML = `
            <div class="bg-gradient-to-r ${template.colors.gradient} rounded-2xl p-8 text-white">
                <div class="text-center">
                    <div class="text-5xl mb-6 animate-pulse">${template.emoji}</div>
                    <h2 class="text-2xl font-bold mb-4">Aperçu de la surprise</h2>
                    <p class="opacity-90 mb-6">Voici comment verra la personne</p>
                </div>
                
                <div class="space-y-6">
                    <div class="bg-white/20 p-4 rounded-xl">
                        <p class="font-bold mb-2">Pour :</p>
                        <p class="text-xl">${pourQui}</p>
                    </div>
                    
                    <div class="bg-white/20 p-4 rounded-xl">
                        <p class="font-bold mb-2">De la part de :</p>
                        <p class="text-xl">${deLaPartDe}</p>
                    </div>
                    
                    <div class="bg-white/20 p-4 rounded-xl">
                        <p class="font-bold mb-2">Question :</p>
                        <p class="text-lg italic">"${question1}"</p>
                    </div>
                    
                    <div class="bg-white/20 p-4 rounded-xl">
                        <p class="font-bold mb-2">Message final :</p>
                        <p class="text-lg">"${messageFinal}"</p>
                    </div>
                    
                    <div class="bg-white/20 p-4 rounded-xl">
                        <p class="font-bold mb-2">Template :</p>
                        <div class="flex items-center">
                            <div class="text-2xl mr-3">${template.emoji}</div>
                            <div>
                                <p class="font-bold">${template.name}</p>
                                <p class="text-sm opacity-80">${template.effects.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-8 text-center">
                    <div class="inline-block p-4 bg-white/10 rounded-xl">
                        <p class="text-sm opacity-80">
                            <i class="fas fa-qrcode mr-2"></i>
                            Un QR Code sera généré automatiquement
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        this.playSoundEffect('click');
    }

    showTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        const grid = document.getElementById('templatesGrid');
        
        if (!modal || !grid) return;
        
        grid.innerHTML = Object.entries(this.templates).map(([key, template]) => `
            <div class="template-card border-2 rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105
                       ${this.surprise.template === key ? 'border-purple-500 border-4' : 'border-gray-200'}"
                 data-template="${key}"
                 style="${this.surprise.template === key ? `border-color: ${template.colors.primary}` : ''};
                         background: linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.secondary}15)">
                <div class="text-4xl mb-3">${template.emoji}</div>
                <h4 class="font-bold text-gray-800 mb-2">${template.name}</h4>
                <p class="text-sm text-gray-600 mb-3">${template.effects.join(', ')}</p>
                <div class="flex justify-center space-x-2">
                    <div class="w-6 h-6 rounded-full" style="background: ${template.colors.primary}"></div>
                    <div class="w-6 h-6 rounded-full" style="background: ${template.colors.secondary}"></div>
                </div>
            </div>
        `).join('');
        
        // Gestion du clic
        let selectedTemplate = this.surprise.template;
        grid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', function() {
                selectedTemplate = this.dataset.template;
                
                // Mettre à jour l'affichage
                grid.querySelectorAll('.template-card').forEach(c => {
                    c.classList.remove('border-purple-500', 'border-4');
                    c.classList.add('border-gray-200');
                    c.style.borderWidth = '2px';
                });
                
                this.classList.add('border-purple-500', 'border-4');
                this.classList.remove('border-gray-200');
                this.style.borderWidth = '4px';
                
                // Animation
                const template = this.templates[selectedTemplate];
                this.style.borderColor = template.colors.primary;
            });
        });
        
        // Bouton de confirmation
        const confirmBtn = document.getElementById('confirmTemplateBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.changeTemplate(selectedTemplate);
                modal.classList.add('hidden');
            });
        }
        
        modal.classList.remove('hidden');
        this.playSoundEffect('click');
    }

    showDemo() {
        // Créer une démo interactive
        this.showNotification('🎬 Démo interactive lancée !');
        
        // Remplir automatiquement les champs
        setTimeout(() => {
            document.getElementById('pourQui').value = 'Eve';
            this.surprise.pourQui = 'Eve';
            
            setTimeout(() => {
                document.getElementById('deLaPartDe').value = 'Max';
                this.surprise.deLaPartDe = 'Max';
                
                setTimeout(() => {
                    document.getElementById('messageFinal').value = 'Tu es la personne la plus importante de ma vie. Je t\'aime plus que tout au monde ❤️';
                    this.surprise.messageFinal = document.getElementById('messageFinal').value;
                    
                    this.showNotification('✅ Démo chargée ! Vous pouvez maintenant créer votre surprise.');
                }, 500);
            }, 500);
        }, 500);
    }

    addHoverEffects() {
        // Ajouter des effets au survol des éléments
        const elements = document.querySelectorAll('.share-option, .template-card, button');
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.05)';
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
            });
        });
    }

    initShareEffects() {
        // Initialiser les effets de partage
        this.createConfettiEffect(document.querySelector('#qrCode'));
    }

    createSaveAnimation() {
        const btn = document.getElementById('createBtn');
        if (!btn) return;
        
        // Animation de sauvegarde
        btn.classList.add('animate-pulse');
        
        // Créer des particules
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = '✨';
            particle.style.cssText = `
                position: absolute;
                font-size: 20px;
                left: 50%;
                top: 50%;
                opacity: 0.7;
                pointer-events: none;
                z-index: 1000;
                animation: save-particle 1s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    createSuccessAnimation() {
        // Confettis
        this.createConfettiEffect(document.getElementById('app'));
        
        // Flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0;
            z-index: 9998;
            animation: success-flash 1.5s ease-out;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 1500);
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes success-flash {
                0% { opacity: 0; }
                50% { opacity: 0.7; }
                100% { opacity: 0; }
            }
            
            @keyframes save-particle {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 0.7;
                }
                100% {
                    transform: translate(${Math.random() * 200 - 100}px, -100px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => style.remove(), 2000);
    }

    createConfettiEffect(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.innerHTML = ['❤️', '✨', '🎉', '🌟', '💖'][Math.floor(Math.random() * 5)];
            confetti.style.cssText = `
                position: fixed;
                font-size: 24px;
                left: ${centerX}px;
                top: ${centerY}px;
                opacity: 0.8;
                pointer-events: none;
                z-index: 10000;
                animation: confetti-fall ${Math.random() * 1 + 0.5}s ease-out forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 1000);
        }
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confetti-fall {
                0% {
                    transform: translate(0, 0) rotate(0deg) scale(1);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(${Math.random() * 200 - 100}px, 200px) rotate(${Math.random() * 360}deg) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => style.remove(), 1000);
    }

    createTemplateChangeEffect(template) {
        // Effet visuel lors du changement de template
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, ${template.colors.primary}20 0%, transparent 70%);
            opacity: 0;
            z-index: 9999;
            animation: template-change 1s ease-out;
            pointer-events: none;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes template-change {
                0% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 0.3; transform: scale(1); }
                100% { opacity: 0; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => style.remove(), 1000);
    }

    playSoundEffect(type) {
        try {
            const sounds = {
                click: new Audio('assets/sounds/click.mp3'),
                success: new Audio('assets/sounds/success.mp3'),
                reveal: new Audio('assets/sounds/reveal.mp3')
            };
            
            if (sounds[type]) {
                sounds[type].volume = 0.3;
                sounds[type].play().catch(() => {
                    // Silencieux en cas d'erreur
                });
            }
        } catch (error) {
            // Silencieux en cas d'erreur
        }
    }

    showErrorModal(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
                <div class="text-center mb-6">
                    <div class="text-5xl text-red-500 mb-4">❌</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Oups !</h3>
                    <p class="text-gray-600">${message}</p>
                </div>
                
                <button class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
                    <i class="fas fa-times mr-2"></i>Fermer
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('button').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-transform animate-fadeIn ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3"></i>
                <div class="font-medium">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

export default SurpriseCreator;
