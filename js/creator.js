import { database, auth, ref, set, get, update } from './firebase.js';

class SurpriseCreator {
    constructor(userId) {
        this.userId = userId;
        this.user = auth.currentUser;
        this.step = 1;
        
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
        this.checkEditMode();
        this.render();
        this.bindEvents();
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
                console.log('Surprise chargée pour édition:', this.surprise);
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
    }

    render() {
        const app = document.getElementById('app');
        
        if (this.step === 1) {
            app.innerHTML = `
                <div class="max-w-4xl mx-auto">
                    <div class="mb-8">
                        <a href="dashboard.html" class="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Retour au dashboard
                        </a>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">
                            <i class="fas fa-magic text-purple-600 mr-2"></i>
                            ${this.editMode ? 'Modifier votre surprise' : 'Créez votre surprise'}
                        </h1>
                        <p class="text-gray-600">
                            Personnalisez chaque détail pour créer un moment unique
                        </p>
                    </div>

                    <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div class="space-y-8">
                            <!-- Section 1: Pour qui -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">
                                    <i class="fas fa-user-check mr-2 text-purple-600"></i>
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
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
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
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                                            placeholder="Ex: Max"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Section 2: Question -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">
                                    <i class="fas fa-question-circle mr-2 text-blue-600"></i>
                                    Question personnalisée
                                </h2>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Question à poser
                                    </label>
                                    <input 
                                        id="question1" 
                                        type="text" 
                                        value="${this.surprise.question1}"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
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
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                        placeholder="Ex: Max (sera utilisé comme indice)"
                                    />
                                    <p class="text-sm text-gray-500 mt-2">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Cette réponse servira d'indice si la personne se trompe
                                    </p>
                                </div>
                            </div>

                            <!-- Section 3: Message -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">
                                    <i class="fas fa-heart mr-2 text-pink-600"></i>
                                    Message final
                                </h2>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Votre message d'amour
                                    </label>
                                    <textarea 
                                        id="messageFinal"
                                        rows="5"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-800"
                                        placeholder="Écrivez votre message le plus touchant..."
                                    >${this.surprise.messageFinal}</textarea>
                                    <div class="flex justify-between mt-2">
                                        <p class="text-sm text-gray-500">
                                            Ce message sera révélé à la fin de la surprise
                                        </p>
                                        <span id="charCount" class="text-sm text-gray-500">${this.surprise.messageFinal.length}/500</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 4: Thème -->
                            <div class="space-y-4">
                                <h2 class="text-xl font-bold text-gray-800">
                                    <i class="fas fa-palette mr-2 text-purple-600"></i>
                                    Choisissez un thème
                                </h2>
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

                            <!-- Bouton création -->
                            <div class="pt-6 border-t border-gray-200">
                                <button id="createBtn" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg">
                                    <i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>
                                    ${this.editMode ? 'Mettre à jour la surprise' : 'Créer ma surprise'}
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
            
        } else if (this.step === 2) {
            app.innerHTML = `
                <div class="max-w-4xl mx-auto">
                    <div class="mb-8">
                        <a href="dashboard.html" class="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Retour au dashboard
                        </a>
                    </div>

                    <div class="text-center mb-8">
                        <div class="text-5xl mb-4 animate-bounce">🎉</div>
                        <h1 class="text-3xl font-bold text-gray-800 mb-4">
                            ${this.editMode ? 'Surprise mise à jour !' : 'Félicitations !'}
                        </h1>
                        <p class="text-gray-600">
                            Votre surprise "<span class="font-semibold">${this.surprise.pourQui}</span>" a été ${this.editMode ? 'mise à jour' : 'créée'} avec succès.
                        </p>
                    </div>

                    <!-- QR Code -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div class="text-center">
                            <h2 class="text-xl font-bold text-gray-800 mb-6">
                                <i class="fas fa-qrcode mr-2 text-purple-600"></i>
                                QR Code de votre surprise
                            </h2>
                            <div id="qrCode" class="inline-block p-6 bg-gray-50 rounded-xl mb-6">
                                <!-- QR Code généré ici -->
                            </div>
                            <div class="mt-6">
                                <button id="downloadQRBtn" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition">
                                    <i class="fas fa-download mr-2"></i>Télécharger JPG
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Lien de partage -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-link mr-2 text-blue-600"></i>
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
                        <a href="s/?id=${this.surpriseId}" target="_blank" class="bg-white border-2 border-blue-200 text-blue-600 p-6 rounded-xl text-center hover:border-blue-400 transition">
                            <div class="text-3xl mb-3">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="font-bold">Voir la surprise</div>
                            <div class="text-sm text-gray-500 mt-1">Comme le destinataire</div>
                        </a>
                    </div>
                </div>
            `;
            
            // Générer QR Code
            this.generateQRCode();
        }
    }

    bindEvents() {
        if (this.step === 1) {
            // Input listeners
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
            
            // Message avec compteur
            const messageInput = document.getElementById('messageFinal');
            const charCount = document.getElementById('charCount');
            
            messageInput.addEventListener('input', (e) => {
                this.surprise.messageFinal = e.target.value;
                const count = e.target.value.length;
                charCount.textContent = `${count}/500`;
                charCount.className = `text-sm ${count > 500 ? 'text-red-500' : 'text-gray-500'}`;
            });
            
            // Thèmes
            document.querySelectorAll('[data-theme]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const theme = e.currentTarget.dataset.theme;
                    this.surprise.theme = theme;
                    
                    // Reset
                    document.querySelectorAll('[data-theme]').forEach(b => {
                        b.className = b.className.replace(/border-(pink|blue|yellow|gray)-500 bg-\1-50/, '');
                        b.className += ' border-gray-200';
                    });
                    
                    // Activer
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
            
        } else if (this.step === 2) {
            // Copier lien
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
            
            // Télécharger QR Code
            document.getElementById('downloadQRBtn').addEventListener('click', () => {
                this.downloadQRCode();
            });
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
        
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sauvegarde...';
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
                    createdAt: new Date().toISOString(),
                    theme: this.surprise.theme,
                    views: 0
                });
            }
            
            // Passer à l'étape 2
            this.step = 2;
            this.render();
            
            this.showNotification('✅ Surprise sauvegardée avec succès !');
            
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            alert('Erreur de sauvegarde: ' + error.message);
            
            if (createBtn) {
                createBtn.innerHTML = `<i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>${this.editMode ? 'Mettre à jour' : 'Créer'}`;
                createBtn.disabled = false;
            }
        }
    }

    generateQRCode() {
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        const qrContainer = document.getElementById('qrCode');
        
        if (!qrContainer) return;
        
        qrContainer.innerHTML = '';
        
        if (typeof QRCode === 'undefined') {
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
            console.error('Erreur QR:', error);
            qrContainer.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-red-500">Erreur génération QR</p>
                    <a href="${url}" class="text-blue-600 text-sm">${url}</a>
                </div>
            `;
        }
    }

    downloadQRCode() {
        const qrContainer = document.getElementById('qrCode');
        if (!qrContainer) return;
        
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) {
            alert('QR Code non généré');
            return;
        }
        
        // Créer un canvas plus grand avec design
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = 600;
        downloadCanvas.height = 700;
        const ctx = downloadCanvas.getContext('2d');
        
        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        
        // En-tête
        ctx.fillStyle = '#7C3AED';
        ctx.fillRect(0, 0, downloadCanvas.width, 150);
        
        // Logo/text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LoveCraft', downloadCanvas.width / 2, 60);
        ctx.font = '20px Arial';
        ctx.fillText('Votre surprise digitale', downloadCanvas.width / 2, 95);
        
        // Cœur
        ctx.font = '40px Arial';
        ctx.fillText('❤️', downloadCanvas.width / 2, 140);
        
        // Pour qui
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`Pour ${this.surprise.pourQui}`, downloadCanvas.width / 2, 200);
        ctx.font = '22px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`De la part de ${this.surprise.deLaPartDe}`, downloadCanvas.width / 2, 235);
        
        // QR Code
        const qrSize = 250;
        const qrX = (downloadCanvas.width - qrSize) / 2;
        const qrY = 270;
        ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);
        
        // Cadre
        ctx.strokeStyle = '#7C3AED';
        ctx.lineWidth = 3;
        ctx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
        
        // Instructions
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Comment utiliser :', downloadCanvas.width / 2, 560);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#4b5563';
        const instructions = [
            '1. Scannez ce QR Code avec votre téléphone',
            '2. Suivez les étapes pour découvrir la surprise',
            '3. Partagez ce moment magique !'
        ];
        
        instructions.forEach((text, index) => {
            ctx.fillText(text, downloadCanvas.width / 2, 590 + (index * 25));
        });
        
        // Footer
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Arial';
        ctx.fillText('Crée avec ❤️ sur LoveCraft', downloadCanvas.width / 2, 680);
        
        // Télécharger
        const link = document.createElement('a');
        link.download = `LoveCraft_${this.surprise.pourQui}.jpg`;
        link.href = downloadCanvas.toDataURL('image/jpeg', 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('✅ QR Code téléchargé !');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50';
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

export default SurpriseCreator;
