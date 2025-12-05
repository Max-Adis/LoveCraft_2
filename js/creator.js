import { database, auth, ref, set, get, update, remove } from './firebase.js';

class SurpriseCreator {
    constructor(userId) {
        this.userId = userId;
        this.user = auth.currentUser;
        this.step = 1;
        
        // Récupérer nom Google si disponible
        const googleName = localStorage.getItem('googleUserName') || this.user.displayName || '';
        
        this.surprise = {
            pourQui: '',
            deLaPartDe: googleName,
            question1: 'Qui t\'aime plus que tout au monde ?',
            reponse1: googleName,
            messageFinal: 'Je t\'aime plus que tout au monde...',
            theme: 'romantique',
            createdAt: new Date().toISOString()
        };
        
        this.surpriseId = null;
        this.editMode = false;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const app = document.getElementById('app');
        
        if (this.step === 1) {
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
                                `<img src="${this.user.photoURL}" class="w-8 h-8 rounded-full object-cover border border-gray-300">` :
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
                            Créez votre surprise
                        </h1>
                        <p class="text-gray-600">
                            Personnalisez chaque détail pour créer un moment unique
                        </p>
                    </div>

                    <!-- Formulaire -->
                    <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div class="space-y-8">
                            <!-- Destinataire -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">Pour qui est cette surprise ?</h2>
                                <div class="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de la personne *
                                        </label>
                                        <input 
                                            type="text" 
                                            id="pourQui"
                                            value="${this.surprise.pourQui}"
                                            placeholder="Ex: Eve"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Votre nom *
                                        </label>
                                        <input 
                                            type="text" 
                                            id="deLaPartDe"
                                            value="${this.surprise.deLaPartDe}"
                                            placeholder="Ex: Max"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Question -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">Question personnalisée</h2>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Question à poser
                                    </label>
                                    <input 
                                        type="text" 
                                        id="question1"
                                        value="${this.surprise.question1}"
                                        placeholder="Ex: Qui t'aime plus que tout ?"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Réponse attendue
                                    </label>
                                    <input 
                                        type="text" 
                                        id="reponse1"
                                        value="${this.surprise.reponse1}"
                                        placeholder="Ex: Max"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                                    />
                                    <p class="text-sm text-gray-500 mt-2">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Cette réponse servira d'indice si la personne se trompe
                                    </p>
                                </div>
                            </div>

                            <!-- Message -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">Message final</h2>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Votre message d'amour
                                    </label>
                                    <textarea 
                                        id="messageFinal"
                                        rows="5"
                                        placeholder="Écrivez votre message le plus touchant..."
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                                    >${this.surprise.messageFinal}</textarea>
                                    <div class="flex justify-between mt-2">
                                        <p class="text-sm text-gray-500">
                                            Ce message sera révélé à la fin de la surprise
                                        </p>
                                        <span id="charCount" class="text-sm text-gray-500">0/500</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Thème -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">Choisissez un thème</h2>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button data-theme="romantique" class="p-4 rounded-lg border-2 ${this.surprise.theme === 'romantique' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'} transition">
                                        <div class="text-2xl mb-2">❤️</div>
                                        <span class="font-medium">Romantique</span>
                                    </button>
                                    <button data-theme="geek" class="p-4 rounded-lg border-2 ${this.surprise.theme === 'geek' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'} transition">
                                        <div class="text-2xl mb-2">👨‍💻</div>
                                        <span class="font-medium">Geek</span>
                                    </button>
                                    <button data-theme="fun" class="p-4 rounded-lg border-2 ${this.surprise.theme === 'fun' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'} transition">
                                        <div class="text-2xl mb-2">😄</div>
                                        <span class="font-medium">Fun</span>
                                    </button>
                                    <button data-theme="classique" class="p-4 rounded-lg border-2 ${this.surprise.theme === 'classique' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'} transition">
                                        <div class="text-2xl mb-2">🎩</div>
                                        <span class="font-medium">Classique</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Bouton -->
                            <div class="pt-6 border-t">
                                <button id="createBtn" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg">
                                    <i class="fas fa-sparkles mr-2"></i>
                                    Créer ma surprise
                                </button>
                                <p class="text-center text-sm text-gray-500 mt-4">
                                    <i class="fas fa-shield-alt mr-1"></i>
                                    Votre surprise sera sauvegardée dans votre espace personnel
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialiser le compteur de caractères
            this.initCharCounter();
            
        } else if (this.step === 2) {
            app.innerHTML = `
                <div class="max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8">
                        <a href="dashboard.html" class="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
                            <i class="fas fa-arrow-left mr-2"></i>
                            <span>Retour au dashboard</span>
                        </a>
                    </div>

                    <!-- Succès -->
                    <div class="text-center mb-8">
                        <div class="text-5xl mb-4 animate-bounce">🎉</div>
                        <h1 class="text-3xl font-bold text-gray-800 mb-4">
                            Félicitations ! Votre surprise est prête
                        </h1>
                        <p class="text-gray-600">
                            Partagez-la avec ${this.surprise.pourQui} pour une réaction magique
                        </p>
                    </div>

                    <!-- QR Code -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div class="text-center">
                            <h2 class="text-xl font-bold text-gray-800 mb-6">
                                <i class="fas fa-qrcode mr-2"></i>
                                QR Code de votre surprise
                            </h2>
                            <div id="qrCode" class="inline-block p-6 bg-gray-50 rounded-xl mb-6">
                                <!-- QR Code généré ici -->
                            </div>
                            <p class="text-gray-600 mb-8">
                                Scannez ce QR Code avec un téléphone pour découvrir la surprise
                            </p>
                        </div>
                    </div>

                    <!-- Lien de partage -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-link mr-2"></i>
                            Lien de partage
                        </h2>
                        <div class="flex flex-col md:flex-row gap-2 mb-4">
                            <input 
                                type="text" 
                                id="surpriseUrl"
                                value="${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}"
                                readonly
                                class="flex-grow px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                            />
                            <button id="copyLinkBtn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-copy mr-2"></i>Copier
                            </button>
                        </div>
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-info-circle mr-1"></i>
                            Partagez ce lien par message, email ou réseaux sociaux
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <a href="dashboard.html" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl text-center hover:opacity-90 transition">
                            <div class="text-3xl mb-3">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div class="font-bold">Dashboard</div>
                            <div class="text-sm opacity-90 mt-1">Voir mes surprises</div>
                        </a>
                        <a href="create.html" class="bg-white border-2 border-purple-200 text-purple-600 p-6 rounded-xl text-center hover:border-purple-400 transition">
                            <div class="text-3xl mb-3">
                                <i class="fas fa-plus"></i>
                            </div>
                            <div class="font-bold">Créer une autre</div>
                            <div class="text-sm text-gray-500 mt-1">Nouvelle surprise</div>
                        </a>
                        <button id="shareBtn" class="bg-white border-2 border-blue-200 text-blue-600 p-6 rounded-xl text-center hover:border-blue-400 transition">
                            <div class="text-3xl mb-3">
                                <i class="fas fa-share-alt"></i>
                            </div>
                            <div class="font-bold">Partager</div>
                            <div class="text-sm text-gray-500 mt-1">Sur les réseaux</div>
                        </button>
                    </div>

                    <!-- Conseils -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                        <h3 class="font-bold text-green-800 mb-4">
                            <i class="fas fa-lightbulb mr-2"></i>Comment surprendre ${this.surprise.pourQui} ?
                        </h3>
                        <ul class="space-y-3">
                            <li class="flex items-start">
                                <i class="fas fa-mobile-alt text-green-600 mt-1 mr-3"></i>
                                <span>Envoyez le lien par SMS avec un message mystérieux</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-print text-green-600 mt-1 mr-3"></i>
                                <span>Imprimez le QR Code et cachez-le dans un livre</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-gift text-green-600 mt-1 mr-3"></i>
                                <span>Accompagnez-le d'un petit cadeau physique</span>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
            
            // Générer le QR Code
            this.generateQRCode();
        }
    }

    bindEvents() {
        if (this.step === 1) {
            // Mise à jour en temps réel des données
            document.getElementById('pourQui').addEventListener('input', (e) => {
                this.surprise.pourQui = e.target.value;
            });
            
            document.getElementById('deLaPartDe').addEventListener('input', (e) => {
                this.surprise.deLaPartDe = e.target.value;
                this.surprise.reponse1 = e.target.value;
                document.getElementById('reponse1').value = e.target.value;
            });
            
            document.getElementById('question1').addEventListener('input', (e) => {
                this.surprise.question1 = e.target.value;
            });
            
            document.getElementById('reponse1').addEventListener('input', (e) => {
                this.surprise.reponse1 = e.target.value;
            });
            
            document.getElementById('messageFinal').addEventListener('input', (e) => {
                this.surprise.messageFinal = e.target.value;
                const count = e.target.value.length;
                document.getElementById('charCount').textContent = `${count}/500`;
                document.getElementById('charCount').className = `text-sm ${count > 500 ? 'text-red-500' : 'text-gray-500'}`;
            });
            
            // Thèmes
            document.querySelectorAll('[data-theme]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const theme = e.currentTarget.dataset.theme;
                    this.surprise.theme = theme;
                    
                    // Reset tous les boutons
                    document.querySelectorAll('[data-theme]').forEach(b => {
                        b.className = b.className.replace(/border-(pink|blue|yellow|gray)-500 bg-\1-50/, '');
                        b.className += ' border-gray-200';
                    });
                    
                    // Activer le bouton sélectionné
                    const themeClasses = {
                        romantique: ['border-pink-500', 'bg-pink-50'],
                        geek: ['border-blue-500', 'bg-blue-50'],
                        fun: ['border-yellow-500', 'bg-yellow-50'],
                        classique: ['border-gray-500', 'bg-gray-50']
                    };
                    
                    e.currentTarget.classList.remove('border-gray-200');
                    e.currentTarget.classList.add(...themeClasses[theme]);
                });
            });
            
            // Bouton création
            document.getElementById('createBtn').addEventListener('click', () => {
                this.saveSurprise();
            });
            
            // Enter pour valider
            document.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveSurprise();
                }
            });
            
        } else if (this.step === 2) {
            // Copier le lien
            document.getElementById('copyLinkBtn').addEventListener('click', () => {
                const urlInput = document.getElementById('surpriseUrl');
                urlInput.select();
                urlInput.setSelectionRange(0, 99999);
                
                navigator.clipboard.writeText(urlInput.value).then(() => {
                    const btn = document.getElementById('copyLinkBtn');
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copié !';
                    btn.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.classList.remove('bg-green-600');
                    }, 2000);
                });
            });
            
            // Partager
            document.getElementById('shareBtn').addEventListener('click', () => {
                const url = document.getElementById('surpriseUrl').value;
                const text = `Découvre la surprise que j'ai créée pour toi sur LoveCraft ! ❤️`;
                
                if (navigator.share) {
                    navigator.share({
                        title: 'Surprise LoveCraft',
                        text: text,
                        url: url
                    });
                } else {
                    navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
                        alert('Lien copié dans le presse-papier ! Partage-le où tu veux.');
                    });
                }
            });
        }
    }

    initCharCounter() {
        const textarea = document.getElementById('messageFinal');
        const counter = document.getElementById('charCount');
        
        if (textarea && counter) {
            const count = textarea.value.length;
            counter.textContent = `${count}/500`;
            counter.className = `text-sm ${count > 500 ? 'text-red-500' : 'text-gray-500'}`;
        }
    }

    async saveSurprise() {
        // Validation
        if (!this.surprise.pourQui.trim()) {
            alert('Veuillez entrer le nom de la personne');
            document.getElementById('pourQui').focus();
            return;
        }
        
        if (!this.surprise.deLaPartDe.trim()) {
            alert('Veuillez entrer votre nom');
            document.getElementById('deLaPartDe').focus();
            return;
        }
        
        if (this.surprise.messageFinal.length > 500) {
            alert('Le message est trop long (max 500 caractères)');
            return;
        }
        
        // Animation du bouton
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Création en cours...';
            createBtn.disabled = true;
        }
        
        try {
            // Générer un ID unique
            this.surpriseId = `surprise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Préparer les données
            const surpriseData = {
                ...this.surprise,
                userId: this.user.uid,
                userEmail: this.user.email,
                userName: this.user.displayName || this.surprise.deLaPartDe,
                createdAt: new Date().toISOString(),
                createdTimestamp: Date.now(),
                views: 0,
                completedViews: 0,
                status: 'active'
            };
            
            // Sauvegarder dans Firebase
            await set(ref(database, 'surprises/' + this.surpriseId), surpriseData);
            
            // Ajouter à la liste utilisateur
            await set(ref(database, 'users/' + this.user.uid + '/surprises/' + this.surpriseId), {
                id: this.surpriseId,
                pourQui: this.surprise.pourQui,
                createdAt: new Date().toISOString(),
                theme: this.surprise.theme,
                views: 0
            });
            
            // Mettre à jour les stats
            const statsRef = ref(database, 'users/' + this.user.uid + '/stats');
            const statsSnapshot = await get(statsRef);
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
            
            // Passer à l'étape 2
            this.step = 2;
            this.render();
            
        } catch (error) {
            console.error('Erreur Firebase:', error);
            alert('Erreur lors de la création : ' + error.message);
            
            // Réactiver le bouton
            if (createBtn) {
                createBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>Créer ma surprise';
                createBtn.disabled = false;
            }
        }
    }

    generateQRCode() {
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        const qrContainer = document.getElementById('qrCode');
        
        if (!qrContainer) return;
        
        qrContainer.innerHTML = '';
        
        // Vérifier si QRCode.js est chargé
        if (typeof QRCode === 'undefined') {
            console.error('QRCode.js non chargé');
            qrContainer.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-red-500 mb-2">QR Code non disponible</p>
                    <a href="${url}" class="text-blue-600 text-sm break-all">${url}</a>
                </div>
            `;
            return;
        }
        
        try {
            new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: "#7C3AED",
                colorLight: "#FFFFFF",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Erreur génération QR:', error);
            qrContainer.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-red-500">Erreur génération QR Code</p>
                    <a href="${url}" class="text-blue-600 text-sm break-all">${url}</a>
                </div>
            `;
        }
    }
}

export default SurpriseCreator;
