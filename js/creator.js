import { database, auth, storage, ref, set, get, update, remove, storageRef, uploadBytes, getDownloadURL } from './firebase.js';

class SurpriseCreator {
    constructor(userId) {
        this.userId = userId;
        this.user = auth.currentUser;
        this.step = 1;
        
        // INIT AVEC NOM GOOGLE SI DISPONIBLE
        const googleName = localStorage.getItem('googleUserName') || this.user.displayName || '';
        
        this.surprise = {
            pourQui: '',
            deLaPartDe: googleName,
            question1: 'Qui t\'aime plus que tout au monde ?',
            reponse1: googleName,
            messageFinal: 'Je t\'aime plus que tout au monde...',
            theme: 'romantique',
            createdAt: new Date().toISOString(),
            views: 0,
            completedViews: 0
        };
        
        this.surpriseId = null;
        this.editMode = false;
        this.init();
    }

    init() {
        this.checkTemplate();
        this.checkEditMode();
        this.render();
        this.bindEvents();
        this.checkAuth();
    }

    checkAuth() {
        if (!this.user) {
            alert('Veuillez vous connecter pour créer une surprise');
            window.location.href = 'index.html';
        }
    }

    checkTemplate() {
        const templateData = localStorage.getItem('selectedTemplate');
        if (templateData) {
            try {
                const template = JSON.parse(templateData);
                this.surprise.question1 = template.question;
                this.surprise.messageFinal = template.message;
                localStorage.removeItem('selectedTemplate');
            } catch (e) {
                console.error('Erreur template:', e);
            }
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
                this.surprise = { ...data };
            }
        } catch (error) {
            console.error('Erreur chargement édition:', error);
        }
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center">
                        <a href="dashboard.html" class="flex items-center text-purple-600 hover:text-purple-700">
                            <i class="fas fa-arrow-left mr-2"></i>
                            <span>Retour au dashboard</span>
                        </a>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${this.user.photoURL ? 
                            `<img src="${this.user.photoURL}" class="w-8 h-8 rounded-full object-cover">` :
                            `<div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                                <i class="fas fa-user"></i>
                            </div>`
                        }
                        <span class="text-sm font-medium">${this.user.displayName || this.user.email}</span>
                    </div>
                </div>

                <!-- Titre -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-magic text-purple-600 mr-2"></i>
                        ${this.editMode ? 'Modifier votre surprise' : 'Créez votre surprise'}
                    </h1>
                    <p class="text-gray-600">
                        Personnalisez chaque détail pour créer un moment unique
                    </p>
                </div>

                <!-- Carte principale -->
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    ${this.renderStep()}
                </div>

                <!-- Témoignage -->
                <div class="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 text-center">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <i class="fas fa-heart text-xl"></i>
                        </div>
                    </div>
                    <p class="text-lg italic mb-2">"Eve a pleuré de joie quand elle a découvert ma surprise digitale."</p>
                    <p class="font-semibold">— Max, créateur de LoveCraft</p>
                </div>
            </div>
        `;
    }

    renderStep() {
        if (this.step === 1) {
            return `
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Personnalisez votre surprise</h2>
                
                <div class="space-y-8">
                    <!-- Section Destinataire -->
                    <div class="bg-blue-50 p-6 rounded-xl">
                        <h3 class="text-lg font-semibold text-blue-800 mb-4">
                            <i class="fas fa-user-check mr-2"></i>Pour qui ?
                        </h3>
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nom de la personne *
                                </label>
                                <input 
                                    id="pourQui" 
                                    type="text" 
                                    value="${this.surprise.pourQui}"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Ex: Eve"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Votre nom *
                                </label>
                                <input 
                                    id="deLaPartDe" 
                                    type="text" 
                                    value="${this.surprise.deLaPartDe}"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Ex: Max"
                                    required
                                />
                                <p class="text-sm text-gray-500 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Ce nom sera affiché comme expéditeur
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Section Quiz -->
                    <div class="bg-yellow-50 p-6 rounded-xl">
                        <h3 class="text-lg font-semibold text-yellow-800 mb-4">
                            <i class="fas fa-question-circle mr-2"></i>Question personnalisée
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Question à poser
                                </label>
                                <input 
                                    id="question1" 
                                    type="text" 
                                    value="${this.surprise.question1}"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                                    placeholder="Ex: Qui t'aime plus que tout ?"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Réponse attendue
                                </label>
                                <input 
                                    id="reponse1" 
                                    type="text" 
                                    value="${this.surprise.reponse1}"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                                    placeholder="Ex: Max (sera utilisé comme indice)"
                                />
                                <p class="text-sm text-gray-500 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Cette réponse servira d'indice si la personne se trompe
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Section Message -->
                    <div class="bg-pink-50 p-6 rounded-xl">
                        <h3 class="text-lg font-semibold text-pink-800 mb-4">
                            <i class="fas fa-heart mr-2"></i>Message final
                        </h3>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Votre message d'amour
                            </label>
                            <textarea 
                                id="messageFinal"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition h-40"
                                placeholder="Écrivez votre message le plus touchant..."
                            >${this.surprise.messageFinal}</textarea>
                            <div class="flex justify-between items-center mt-2">
                                <p class="text-sm text-gray-500">
                                    <i class="fas fa-lightbulb mr-1"></i>
                                    Ce message sera révélé à la fin de la surprise
                                </p>
                                <span id="charCount" class="text-sm ${this.surprise.messageFinal.length > 500 ? 'text-red-500' : 'text-gray-500'}">
                                    ${this.surprise.messageFinal.length}/500
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Section Thème -->
                    <div class="bg-purple-50 p-6 rounded-xl">
                        <h3 class="text-lg font-semibold text-purple-800 mb-4">
                            <i class="fas fa-palette mr-2"></i>Choisissez un thème
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button data-theme="romantique" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'romantique' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'} hover:border-pink-300 transition text-center">
                                <div class="text-2xl mb-2">❤️</div>
                                <span class="font-medium">Romantique</span>
                            </button>
                            <button data-theme="geek" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'geek' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:border-blue-300 transition text-center">
                                <div class="text-2xl mb-2">👨‍💻</div>
                                <span class="font-medium">Geek</span>
                            </button>
                            <button data-theme="fun" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'fun' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white'} hover:border-yellow-300 transition text-center">
                                <div class="text-2xl mb-2">😄</div>
                                <span class="font-medium">Fun</span>
                            </button>
                            <button data-theme="classique" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'classique' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white'} hover:border-gray-300 transition text-center">
                                <div class="text-2xl mb-2">🎩</div>
                                <span class="font-medium">Classique</span>
                            </button>
                        </div>
                    </div>

                    <!-- Bouton de création -->
                    <div class="pt-6 border-t border-gray-200">
                        <button id="createBtn" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition transform hover:-translate-y-1 shadow-lg">
                            <i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>
                            ${this.editMode ? 'Mettre à jour la surprise' : 'Créer ma surprise'}
                        </button>
                        ${this.editMode ? `
                            <div class="mt-4 text-center">
                                <button id="deleteBtn" class="text-red-600 hover:text-red-700 text-sm">
                                    <i class="fas fa-trash mr-1"></i>Supprimer cette surprise
                                </button>
                            </div>
                        ` : ''}
                        <p class="text-center text-sm text-gray-500 mt-4">
                            <i class="fas fa-shield-alt mr-1"></i>
                            Votre surprise sera sauvegardée dans votre espace personnel
                        </p>
                    </div>
                </div>
            `;
        }
        
        if (this.step === 2) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6 animate-bounce">🎉</div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">
                        ${this.editMode ? 'Surprise mise à jour !' : 'Félicitations !'}
                    </h2>
                    <p class="text-gray-600 mb-8">
                        Votre surprise "<span class="font-semibold">${this.surprise.pourQui}</span>" a été ${this.editMode ? 'mise à jour' : 'créée'} avec succès.
                    </p>
                    
                    <!-- QR Code -->
                    <div class="mb-8">
                        <div class="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl inline-block">
                            <div id="qrContainer" class="bg-white p-6 rounded-xl shadow-md">
                                <div id="qrCode" class="mb-4 min-h-[200px] flex items-center justify-center"></div>
                                <p class="text-sm text-gray-600 font-medium">
                                    <i class="fas fa-qrcode mr-2"></i>
                                    Scannez-moi pour découvrir la surprise
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lien de partage -->
                    <div class="bg-gray-50 p-6 rounded-xl mb-8">
                        <h3 class="font-bold text-gray-800 mb-3">
                            <i class="fas fa-link mr-2"></i>Lien de partage
                        </h3>
                        <div class="flex flex-col md:flex-row gap-2 items-center">
                            <input 
                                type="text" 
                                id="surpriseUrl" 
                                value="${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}"
                                readonly
                                class="flex-grow px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm"
                            />
                            <button id="copyLinkBtn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                                <i class="fas fa-copy mr-2"></i>Copier
                            </button>
                        </div>
                        <p class="text-sm text-gray-500 mt-3">
                            <i class="fas fa-info-circle mr-1"></i>
                            Partagez ce lien directement ou utilisez le QR Code
                        </p>
                    </div>
                    
                    <!-- Boutons d'actions -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <button id="downloadPNG" class="p-4 bg-white border-2 border-pink-200 rounded-xl hover:border-pink-400 transition flex flex-col items-center justify-center">
                            <div class="text-3xl text-pink-600 mb-2">
                                <i class="fas fa-file-image"></i>
                            </div>
                            <span class="font-medium">Télécharger PNG</span>
                            <span class="text-xs text-gray-500 mt-1">QR Code seul</span>
                        </button>
                        
                        <button id="downloadPDF" class="p-4 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 transition flex flex-col items-center justify-center">
                            <div class="text-3xl text-purple-600 mb-2">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <span class="font-medium">Télécharger PDF</span>
                            <span class="text-xs text-gray-500 mt-1">Avec instructions</span>
                        </button>
                        
                        <a href="dashboard.html" class="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition flex flex-col items-center justify-center">
                            <div class="text-3xl mb-2">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <span class="font-medium">Dashboard</span>
                            <span class="text-xs text-white/80 mt-1">Voir toutes mes surprises</span>
                        </a>
                    </div>
                    
                    <!-- Conseils -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <h3 class="font-bold text-green-800 mb-3">
                            <i class="fas fa-lightbulb mr-2"></i>Idées pour votre surprise
                        </h3>
                        <ul class="text-left text-gray-700 space-y-2">
                            <li class="flex items-start">
                                <i class="fas fa-print text-green-600 mt-1 mr-2"></i>
                                <span>Imprimez le QR Code et cachez-le sous un oreiller</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-mobile-alt text-green-600 mt-1 mr-2"></i>
                                <span>Envoyez le lien par message avec un petit indice</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-utensils text-green-600 mt-1 mr-2"></i>
                                <span>Glissez le QR Code dans un livre ou sur le frigo</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-gift text-green-600 mt-1 mr-2"></i>
                                <span>Accompagnez-le d'un petit cadeau physique</span>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    bindEvents() {
        if (this.step === 1) {
            // Mise à jour en temps réel
            document.getElementById('pourQui')?.addEventListener('input', (e) => {
                this.surprise.pourQui = e.target.value;
            });

            document.getElementById('deLaPartDe')?.addEventListener('input', (e) => {
                this.surprise.deLaPartDe = e.target.value;
                // Mettre à jour la réponse si vide
                if (!this.surprise.reponse1 || this.surprise.reponse1 === localStorage.getItem('googleUserName')) {
                    this.surprise.reponse1 = e.target.value;
                    document.getElementById('reponse1').value = e.target.value;
                }
            });

            document.getElementById('question1')?.addEventListener('input', (e) => {
                this.surprise.question1 = e.target.value;
            });

            document.getElementById('reponse1')?.addEventListener('input', (e) => {
                this.surprise.reponse1 = e.target.value;
            });

            // Compteur de caractères
            const messageInput = document.getElementById('messageFinal');
            if (messageInput) {
                messageInput.addEventListener('input', (e) => {
                    this.surprise.messageFinal = e.target.value;
                    const charCount = document.getElementById('charCount');
                    charCount.textContent = `${e.target.value.length}/500`;
                    charCount.classList.toggle('text-red-500', e.target.value.length > 500);
                });
            }

            // Thèmes
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const theme = e.currentTarget.dataset.theme;
                    this.surprise.theme = theme;
                    
                    // Reset
                    document.querySelectorAll('.theme-btn').forEach(b => {
                        b.classList.remove('border-pink-500', 'border-blue-500', 'border-yellow-500', 'border-gray-500');
                        b.classList.remove('bg-pink-50', 'bg-blue-50', 'bg-yellow-50', 'bg-gray-50');
                        b.classList.add('border-gray-200', 'bg-white');
                    });
                    
                    // Activer
                    e.currentTarget.classList.remove('border-gray-200', 'bg-white');
                    const themeClasses = {
                        romantique: ['border-pink-500', 'bg-pink-50'],
                        geek: ['border-blue-500', 'bg-blue-50'],
                        fun: ['border-yellow-500', 'bg-yellow-50'],
                        classique: ['border-gray-500', 'bg-gray-50']
                    };
                    e.currentTarget.classList.add(...themeClasses[theme]);
                });
            });

            // Création
            document.getElementById('createBtn').addEventListener('click', () => {
                this.saveSurprise();
            });

            // Suppression
            if (this.editMode) {
                document.getElementById('deleteBtn').addEventListener('click', () => {
                    this.deleteSurprise();
                });
            }

            // Enter pour valider
            document.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.step === 1) {
                    this.saveSurprise();
                }
            });
        }

        if (this.step === 2) {
            this.showQRCode();
            this.bindResultEvents();
        }
    }

    async saveSurprise() {
        // Validation améliorée
        if (!this.surprise.pourQui.trim()) {
            this.showError('Veuillez entrer le nom de la personne');
            document.getElementById('pourQui').focus();
            return;
        }

        if (!this.surprise.deLaPartDe.trim()) {
            this.showError('Veuillez entrer votre nom');
            document.getElementById('deLaPartDe').focus();
            return;
        }

        if (this.surprise.messageFinal.length > 500) {
            this.showError('Le message est trop long (max 500 caractères)');
            return;
        }

        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${this.editMode ? 'Mise à jour...' : 'Création en cours...'}`;
            createBtn.disabled = true;
        }

        try {
            if (!this.editMode) {
                this.surpriseId = `surprise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }

            const surpriseData = {
                pourQui: this.surprise.pourQui.trim(),
                deLaPartDe: this.surprise.deLaPartDe.trim(),
                question1: this.surprise.question1.trim(),
                reponse1: this.surprise.reponse1.trim(),
                messageFinal: this.surprise.messageFinal.trim(),
                theme: this.surprise.theme,
                userId: this.user.uid,
                userEmail: this.user.email,
                userName: this.user.displayName || this.surprise.deLaPartDe,
                lastUpdated: new Date().toISOString(),
                status: 'active',
                isPublic: false,
                version: '2.0'
            };

            if (!this.editMode) {
                surpriseData.createdAt = new Date().toISOString();
                surpriseData.createdTimestamp = Date.now();
                surpriseData.views = 0;
                surpriseData.completedViews = 0;
            }

            // Sauvegarde principale
            await set(ref(database, 'surprises/' + this.surpriseId), surpriseData);
            
            // Ajout à la liste utilisateur si nouvelle
            if (!this.editMode) {
                await set(ref(database, 'users/' + this.user.uid + '/surprises/' + this.surpriseId), {
                    id: this.surpriseId,
                    pourQui: this.surprise.pourQui,
                    createdAt: new Date().toISOString(),
                    theme: this.surprise.theme,
                    views: 0
                });

                // Mise à jour stats
                const userStatsRef = ref(database, 'users/' + this.user.uid + '/stats');
                const statsSnapshot = await get(userStatsRef);
                const currentStats = statsSnapshot.exists() ? statsSnapshot.val() : {
                    totalSurprises: 0,
                    totalViews: 0,
                    lastCreated: null
                };
                
                await update(ref(database, 'users/' + this.user.uid + '/stats'), {
                    totalSurprises: (currentStats.totalSurprises || 0) + 1,
                    lastCreated: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            // Passer à l'étape 2
            this.step = 2;
            this.render();
            this.showQRCode();
            this.bindResultEvents();
            
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            this.showError(`Erreur de sauvegarde: ${error.message}`);
            
            const createBtn = document.getElementById('createBtn');
            if (createBtn) {
                createBtn.innerHTML = `<i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>${this.editMode ? 'Mettre à jour la surprise' : 'Créer ma surprise'}`;
                createBtn.disabled = false;
            }
        }
    }

    async deleteSurprise() {
        if (!this.surpriseId || !confirm('Supprimer cette surprise ? Cette action est irréversible.')) {
            return;
        }

        try {
            await remove(ref(database, 'surprises/' + this.surpriseId));
            await remove(ref(database, 'users/' + this.user.uid + '/surprises/' + this.surpriseId));
            
            alert('Surprise supprimée avec succès !');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showError('Erreur lors de la suppression');
        }
    }

    showQRCode() {
        if (!this.surpriseId) {
            console.error('❌ Pas d\'ID de surprise !');
            return;
        }
        
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        
        // Mettre à jour URL
        const urlInput = document.getElementById('surpriseUrl');
        if (urlInput) {
            urlInput.value = url;
        }
        
        // Vérifier librairie
        if (typeof QRCode === 'undefined') {
            console.error('❌ QRCode.js non chargé !');
            this.loadQRCodeLibrary(url);
            return;
        }
        
        this.generateQRCode(url);
    }

    loadQRCodeLibrary(url) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            console.log('✅ QRCode.js chargé');
            this.generateQRCode(url);
        };
        script.onerror = () => {
            console.error('❌ Échec chargement QRCode.js');
            document.getElementById('qrCode').innerHTML = `
                <div class="text-center p-4">
                    <p class="text-red-500 mb-2">QR Code non disponible</p>
                    <p class="text-sm text-gray-600 break-all">${url}</p>
                </div>
            `;
        };
        document.head.appendChild(script);
    }

    generateQRCode(url) {
        const qrElement = document.getElementById('qrCode');
        if (!qrElement) return;
        
        qrElement.innerHTML = '';
        
        try {
            new QRCode(qrElement, {
                text: url,
                width: 200,
                height: 200,
                colorDark: "#7C3AED",
                colorLight: "#FFFFFF",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('❌ Erreur génération QR:', error);
            qrElement.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-red-500">Erreur génération QR Code</p>
                    <p class="text-sm text-gray-600 mt-2 break-all">${url}</p>
                </div>
            `;
        }
    }

    bindResultEvents() {
        // Copier lien
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            const urlInput = document.getElementById('surpriseUrl');
            urlInput.select();
            urlInput.setSelectionRange(0, 99999);
            
            try {
                navigator.clipboard.writeText(urlInput.value).then(() => {
                    const btn = document.getElementById('copyLinkBtn');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copié !';
                    btn.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('bg-green-600');
                    }, 2000);
                });
            } catch (err) {
                document.execCommand('copy');
                const btn = document.getElementById('copyLinkBtn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copié !';
                btn.classList.add('bg-green-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('bg-green-600');
                }, 2000);
            }
        });
        
        // Télécharger PNG
        document.getElementById('downloadPNG').addEventListener('click', () => {
            if (typeof html2canvas === 'undefined') {
                this.showError('html2canvas non chargé');
                return;
            }
            
            const qrContainer = document.getElementById('qrContainer');
            html2canvas(qrContainer, {
                backgroundColor: '#ffffff',
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `LoveCraft_${this.surprise.pourQui}_QRCode.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(error => {
                console.error('Erreur PNG:', error);
                this.showError('Erreur lors de la génération du PNG');
            });
        });
        
        // Télécharger PDF
        document.getElementById('downloadPDF').addEventListener('click', () => {
            if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
                this.showError('Librairies non chargées');
                return;
            }
            
            const btn = document.getElementById('downloadPDF');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Génération...';
            btn.disabled = true;
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Contenu PDF
            pdf.setFontSize(24);
            pdf.setTextColor(124, 58, 237);
            pdf.text('✨ LoveCraft Surprise ✨', 105, 20, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Pour ${this.surprise.pourQui}`, 105, 30, { align: 'center' });
            pdf.text(`De la part de ${this.surprise.deLaPartDe}`, 105, 37, { align: 'center' });
            
            // QR Code
            const qrCanvas = document.querySelector('#qrCode canvas');
            if (qrCanvas) {
                const qrData = qrCanvas.toDataURL('image/png');
                pdf.addImage(qrData, 'PNG', 60, 50, 90, 90);
            }
            
            // Instructions
            pdf.setFontSize(12);
            pdf.text('Instructions :', 20, 150);
            
            const instructions = [
                '1. Scannez le QR Code avec votre téléphone',
                '2. Ou visitez directement le lien :',
                `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`,
                '3. Suivez les étapes pour découvrir la surprise',
                '',
                '💡 Conseils pour la surprise :',
                `• Cachez cette page sous un oreiller`,
                `• Montrez le QR Code sur votre téléphone`,
                `• Accompagnez d\'un petit mot personnalisé`,
                `• Faites preuve de créativité !`
            ];
            
            instructions.forEach((line, i) => {
                pdf.text(line, 20, 160 + (i * 6));
            });
            
            // Footer
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text('Crée avec ❤️ sur LoveCraft - Inspiré par Max & Eve', 105, 280, { align: 'center' });
            
            // Sauvegarde
            pdf.save(`LoveCraft_Surprise_${this.surprise.pourQui}.pdf`);
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }

    showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-xl mr-3"></i>
                <div>
                    <p class="font-medium">Erreur</p>
                    <p class="text-sm mt-1">${message}</p>
                </div>
                <button class="ml-auto text-red-500 hover:text-red-700" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

export default SurpriseCreator;
