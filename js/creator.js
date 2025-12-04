import { database, auth, ref, set, get, update } from './firebase.js';

class SurpriseCreator {
    constructor(userId) {
        this.userId = userId;
        this.user = auth.currentUser;
        this.step = 1;
        this.surprise = {
            pourQui: '',
            deLaPartDe: '',
            question1: 'Qui t\'aime plus que tout au monde ?',
            reponse1: '',
            messageFinal: 'Je t\'aime plus que tout au monde...',
            theme: 'romantique',
            createdAt: new Date().toISOString(),
            views: 0
        };
        this.surpriseId = null;
        this.init();
    }

    init() {
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

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Header avec info utilisateur -->
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center">
                        <a href="dashboard.html" class="flex items-center text-purple-600 hover:text-purple-700">
                            <i class="fas fa-arrow-left mr-2"></i>
                            <span>Retour au dashboard</span>
                        </a>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${this.user.photoURL ? 
                            `<img src="${this.user.photoURL}" class="w-8 h-8 rounded-full">` :
                            `<div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                                <i class="fas fa-user"></i>
                            </div>`
                        }
                        <span class="text-sm font-medium">${this.user.displayName || this.user.email}</span>
                    </div>
                </div>

                <!-- Titre principal -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-magic text-purple-600 mr-2"></i>
                        Créez votre surprise
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
                    <p class="text-lg italic mb-2">"Tryphène a pleuré de joie quand elle a découvert ma surprise digitale."</p>
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
                                    placeholder="Ex: Tryphène"
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
                                    value="${this.surprise.deLaPartDe || (this.user.displayName || '')}"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Ex: Max"
                                    required
                                />
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
                                    value="${this.surprise.reponse1 || (this.user.displayName || '')}"
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
                                <span id="charCount" class="text-sm text-gray-500">0/500</span>
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
                            <i class="fas fa-sparkles mr-2"></i>
                            Créer ma surprise
                        </button>
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
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Félicitations !</h2>
                    <p class="text-gray-600 mb-8">
                        Votre surprise "<span class="font-semibold">${this.surprise.pourQui}</span>" a été créée avec succès.
                    </p>
                    
                    <!-- QR Code -->
                    <div class="mb-8">
                        <div class="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl inline-block">
                            <div id="qrContainer" class="bg-white p-6 rounded-xl shadow-md">
                                <div id="qrCode" class="mb-4"></div>
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
                                class="flex-grow px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700"
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
                            <span class="font-medium">Tableau de bord</span>
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
            // Mise à jour des données en temps réel
            const inputs = ['pourQui', 'deLaPartDe', 'question1', 'reponse1'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', (e) => {
                        this.surprise[id] = e.target.value;
                        if (id === 'deLaPartDe' && !this.surprise.reponse1) {
                            this.surprise.reponse1 = e.target.value;
                            document.getElementById('reponse1').value = e.target.value;
                        }
                    });
                }
            });

            // Compteur de caractères pour le message
            const messageInput = document.getElementById('messageFinal');
            if (messageInput) {
                messageInput.addEventListener('input', (e) => {
                    this.surprise.messageFinal = e.target.value;
                    const charCount = document.getElementById('charCount');
                    charCount.textContent = `${e.target.value.length}/500`;
                    
                    if (e.target.value.length > 500) {
                        charCount.classList.add('text-red-500');
                    } else {
                        charCount.classList.remove('text-red-500');
                    }
                });
                // Initialiser le compteur
                document.getElementById('charCount').textContent = `${messageInput.value.length}/500`;
            }

            // Boutons de thème
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const theme = e.currentTarget.dataset.theme;
                    this.surprise.theme = theme;
                    
                    // Mettre à jour les styles des boutons
                    document.querySelectorAll('.theme-btn').forEach(b => {
                        b.classList.remove('border-pink-500', 'border-blue-500', 'border-yellow-500', 'border-gray-500');
                        b.classList.remove('bg-pink-50', 'bg-blue-50', 'bg-yellow-50', 'bg-gray-50');
                        b.classList.add('border-gray-200', 'bg-white');
                    });
                    
                    e.currentTarget.classList.remove('border-gray-200', 'bg-white');
                    if (theme === 'romantique') {
                        e.currentTarget.classList.add('border-pink-500', 'bg-pink-50');
                    } else if (theme === 'geek') {
                        e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    } else if (theme === 'fun') {
                        e.currentTarget.classList.add('border-yellow-500', 'bg-yellow-50');
                    } else {
                        e.currentTarget.classList.add('border-gray-500', 'bg-gray-50');
                    }
                });
            });

            // Bouton de création
            document.getElementById('createBtn').addEventListener('click', () => {
                this.saveSurprise();
            });

            // Entrée pour soumettre
            document.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.step === 1) {
                    this.saveSurprise();
                }
            });
        }

        if (this.step === 2) {
            this.bindResultEvents();
        }
    }

    async saveSurprise() {
        // Validation
        if (!this.surprise.pourQui || !this.surprise.deLaPartDe) {
            this.showError('Veuillez remplir le nom de la personne et votre nom');
            return;
        }

        if (this.surprise.messageFinal.length > 500) {
            this.showError('Le message est trop long (max 500 caractères)');
            return;
        }

        // Vérifier l'authentification
        if (!this.user) {
            alert('Session expirée. Veuillez vous reconnecter.');
            window.location.href = 'index.html';
            return;
        }

        // Désactiver le bouton pendant la sauvegarde
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Création en cours...';
            createBtn.disabled = true;
        }

        try {
            // Générer un ID unique
            this.surpriseId = `surprise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Préparer les données complètes
            const surpriseData = {
                // Données de base
                pourQui: this.surprise.pourQui.trim(),
                deLaPartDe: this.surprise.deLaPartDe.trim(),
                question1: this.surprise.question1.trim(),
                reponse1: this.surprise.reponse1.trim(),
                messageFinal: this.surprise.messageFinal.trim(),
                theme: this.surprise.theme,
                
                // Métadonnées utilisateur
                userId: this.user.uid,
                userEmail: this.user.email,
                userName: this.user.displayName || this.surprise.deLaPartDe,
                userPhoto: this.user.photoURL || '',
                
                // Dates
                createdAt: new Date().toISOString(),
                createdTimestamp: Date.now(),
                lastUpdated: new Date().toISOString(),
                
                // Statistiques
                views: 0,
                shares: 0,
                completedViews: 0,
                
                // Statut
                status: 'active',
                isPublic: false,
                
                // Autres
                version: '1.0'
            };
            
            console.log('📝 Sauvegarde de la surprise:', surpriseData);
            
            // 1. Sauvegarder la surprise principale
            await set(ref(database, 'surprises/' + this.surpriseId), surpriseData);
            console.log('✅ Surprise sauvegardée avec ID:', this.surpriseId);
            
            // 2. Ajouter à la liste des surprises de l'utilisateur
            await set(ref(database, 'users/' + this.user.uid + '/surprises/' + this.surpriseId), {
                id: this.surpriseId,
                pourQui: this.surprise.pourQui,
                createdAt: new Date().toISOString(),
                theme: this.surprise.theme,
                views: 0
            });
            console.log('✅ Ajoutée à la liste utilisateur');
            
            // 3. Mettre à jour les stats utilisateur
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
            console.log('✅ Stats mises à jour');
            
            // Passer à l'étape 2
            this.step = 2;
            this.render();
            this.showQRCode();
            this.bindResultEvents();
            
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            this.showError(`Erreur de sauvegarde: ${error.message}`);
            
            // Réactiver le bouton
            if (createBtn) {
                createBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>Créer ma surprise';
                createBtn.disabled = false;
            }
        }
    }

    showQRCode() {
    if (!this.surpriseId) {
        console.error('❌ Pas d\'ID de surprise !');
        return;
    }
    
    const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
    console.log('📱 URL de la surprise:', url);
    
    // Mettre à jour le champ URL
    const urlInput = document.getElementById('surpriseUrl');
    if (urlInput) {
        urlInput.value = url;
    }
    
    // Vérifier si QRCode est chargé
    if (typeof QRCode === 'undefined') {
        console.error('❌ QRCode.js non chargé !');
        document.getElementById('qrCode').innerHTML = `
            <div class="text-red-500 text-center p-4">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Erreur: Librairie QRCode non chargée</p>
                <p class="text-sm">Rechargez la page</p>
            </div>
        `;
        return;
    }
    
    // Générer le QR Code
    const qrElement = document.getElementById('qrCode');
    if (!qrElement) {
        console.error('❌ Element #qrCode non trouvé');
        return;
    }
    
    // Nettoyer l'élément d'abord
    qrElement.innerHTML = '';
    
    try {
        QRCode.toCanvas(qrElement, url, {
            width: 200,
            height: 200,
            margin: 1,
            color: {
                dark: '#7C3AED',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
        }, function (error) {
            if (error) {
                console.error('❌ Erreur QR Code:', error);
                qrElement.innerHTML = `
                    <div class="text-red-500 text-center p-4">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>Erreur génération QR Code</p>
                        <p class="text-sm">${error.message}</p>
                    </div>
                `;
            } else {
                console.log('✅ QR Code généré avec succès');
            }
        });
    } catch (error) {
        console.error('❌ Exception QR Code:', error);
        qrElement.innerHTML = `
            <div class="text-red-500 text-center p-4">
                <i class="fas fa-bug text-2xl mb-2"></i>
                <p>Exception: ${error.message}</p>
            </div>
        `;
    }
}
        // Générer le QR Code
        QRCode.toCanvas(document.getElementById('qrCode'), url, {
            width: 200,
            height: 200,
            margin: 2,
            color: {
                dark: '#7C3AED', // Couleur violette
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
        }, function (error) {
            if (error) {
                console.error('Erreur QR Code:', error);
                document.getElementById('qrCode').innerHTML = `
                    <div class="text-red-500 p-4">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>Erreur de génération du QR Code</p>
                    </div>
                `;
            }
        });
    }

    bindResultEvents() {
        // Copier le lien
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            const urlInput = document.getElementById('surpriseUrl');
            urlInput.select();
            document.execCommand('copy');
            
            // Animation de confirmation
            const btn = document.getElementById('copyLinkBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copié !';
            btn.classList.add('bg-green-600');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-600');
            }, 2000);
        });
        
        // Télécharger PNG
        document.getElementById('downloadPNG').addEventListener('click', () => {
            const qrContainer = document.getElementById('qrContainer');
            html2canvas(qrContainer, {
                backgroundColor: '#ffffff',
                scale: 2 // Qualité HD
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `LoveCraft_${this.surprise.pourQui}_QRCode.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(error => {
                console.error('Erreur PNG:', error);
                alert('Erreur lors de la génération du PNG');
            });
        });
        
        // Télécharger PDF
        document.getElementById('downloadPDF').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Titre
            pdf.setFontSize(24);
            pdf.setTextColor(124, 58, 237); // Violet
            pdf.text('✨ LoveCraft Surprise ✨', 105, 20, { align: 'center' });
            
            // Sous-titre
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Pour ${this.surprise.pourQui}`, 105, 30, { align: 'center' });
            pdf.text(`De la part de ${this.surprise.deLaPartDe}`, 105, 37, { align: 'center' });
            
            // QR Code
            const qrContainer = document.getElementById('qrContainer');
            html2canvas(qrContainer, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 60, 45, 90, 90);
                
                // Instructions
                pdf.setFontSize(14);
                pdf.text('Instructions :', 20, 150);
                
                pdf.setFontSize(11);
                const instructions = [
                    '1. Scannez le QR Code ci-dessus avec votre téléphone',
                    '2. Ou visitez directement le lien ci-dessous',
                    '3. Suivez les étapes pour découvrir la surprise',
                    '',
                    'Lien direct :',
                    `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`,
                    '',
                    '💡 Conseils :',
                    `• Imprimez cette page et cachez-la dans un livre`,
                    `• Montrez le QR Code sur votre téléphone`,
                    `• Accompagnez-le d\'un petit mot personnalisé`
                ];
                
                instructions.forEach((line, i) => {
                    pdf.text(line, 20, 160 + (i * 6));
                });
                
                // Footer
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text('Crée avec ❤️ sur LoveCraft - Inspiré par Max & Tryphène', 105, 280, { align: 'center' });
                
                // Sauvegarder
                pdf.save(`LoveCraft_Surprise_${this.surprise.pourQui}.pdf`);
            });
        });
    }

    showError(message) {
        // Créer une alerte élégante
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-slideIn';
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
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideIn { animation: slideIn 0.3s ease-out; }
        `;
        document.head.appendChild(style);
    }
}

// Export pour l'utiliser dans create.html
export default SurpriseCreator;
