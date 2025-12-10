import { database, auth, ref, set, get } from './firebase.js';

class SurpriseCreator {
    constructor(userId) {
        this.userId = userId;
        this.user = auth.currentUser;
        this.step = 1;
        this.templates = this.getTemplates();
        
        this.surprise = {
            pourQui: '',
            deLaPartDe: this.user.displayName || '',
            question1: 'Qui t\'aime plus que tout au monde ?',
            reponse1: this.user.displayName || '',
            customHint: '',
            messageFinal: 'Je t\'aime plus que tout au monde...',
            template: 'romantic',
            createdAt: new Date().toISOString(),
            views: 0,
            completedViews: 0
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
                }
            },
            geek: {
                name: 'Geek',
                emoji: '👨‍💻',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#1d4ed8',
                    gradient: 'from-blue-500 to-indigo-500'
                }
            },
            birthday: {
                name: 'Anniversaire',
                emoji: '🎂',
                colors: {
                    primary: '#f59e0b',
                    secondary: '#d97706',
                    gradient: 'from-yellow-500 to-orange-500'
                }
            },
            friendship: {
                name: 'Amitié',
                emoji: '🤝',
                colors: {
                    primary: '#10b981',
                    secondary: '#059669',
                    gradient: 'from-green-500 to-emerald-500'
                }
            }
        };
    }

    async init() {
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
                this.surprise = { ...this.surprise, ...data };
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
    }

    render() {
        const app = document.getElementById('app');
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        
        if (this.step === 1) {
            app.innerHTML = this.renderStep1();
        } else if (this.step === 2) {
            app.innerHTML = this.renderStep2();
            setTimeout(() => this.generateQRCode(), 100);
        }
    }

    renderStep1() {
        const currentTemplate = this.templates[this.surprise.template] || this.templates.romantic;
        
        return `
            <div class="max-w-4xl mx-auto">
                <!-- En-tête -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-magic text-purple-600 mr-2"></i>
                        ${this.editMode ? 'Modifier votre surprise' : 'Créez votre surprise'}
                    </h1>
                    <p class="text-gray-600">Personnalisez chaque détail</p>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <!-- Informations de base -->
                    <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Pour qui ? *
                            </label>
                            <input 
                                id="pourQui" 
                                type="text" 
                                value="${this.surprise.pourQui}"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                                placeholder="Nom de la personne"
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                De la part de *
                            </label>
                            <input 
                                id="deLaPartDe" 
                                type="text" 
                                value="${this.surprise.deLaPartDe}"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                                placeholder="Votre nom"
                                required
                            />
                        </div>
                    </div>
                    
                    <!-- Question et réponse -->
                    <div class="mb-8">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Question à poser
                        </label>
                        <input 
                            id="question1" 
                            type="text" 
                            value="${this.surprise.question1}"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 mb-4"
                            placeholder="Votre question"
                        />
                        
                        <div class="hint-section p-4 rounded-lg mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-lightbulb text-yellow-600 mr-2"></i>
                                Indice personnalisé (optionnel)
                            </label>
                            <input 
                                id="customHint" 
                                type="text" 
                                value="${this.surprise.customHint}"
                                class="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-800"
                                placeholder="Indice si réponse incorrecte"
                            />
                        </div>
                        
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Réponse attendue
                        </label>
                        <input 
                            id="reponse1" 
                            type="text" 
                            value="${this.surprise.reponse1}"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                            placeholder="La bonne réponse"
                        />
                    </div>
                    
                    <!-- Message -->
                    <div class="mb-8">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Message final *
                        </label>
                        <textarea 
                            id="messageFinal"
                            rows="4"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 resize-none"
                            placeholder="Votre message touchant..."
                        >${this.surprise.messageFinal}</textarea>
                        <div class="flex justify-between mt-2">
                            <span class="text-sm text-gray-500">Ce message sera révélé à la fin</span>
                            <span id="charCount" class="text-sm text-gray-500">
                                ${this.surprise.messageFinal.length}/500
                            </span>
                        </div>
                    </div>
                    
                    <!-- Template actuel -->
                    <div class="mb-8">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-palette mr-2" style="color: ${currentTemplate.colors.primary}"></i>
                            Choisissez un style
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            ${Object.entries(this.templates).map(([key, template]) => `
                                <button data-template="${key}" 
                                        class="template-card p-4 rounded-lg border-2 ${this.surprise.template === key ? 'selected' : 'border-gray-200'}"
                                        style="${this.surprise.template === key ? `border-color: ${template.colors.primary}` : ''}">
                                    <div class="text-2xl mb-2">${template.emoji}</div>
                                    <div class="font-medium text-sm">${template.name}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Bouton création -->
                    <button id="createBtn" class="btn-magic w-full py-4 text-white font-bold rounded-lg hover:opacity-90 transition">
                        <i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>
                        ${this.editMode ? 'Mettre à jour' : 'Créer ma surprise'}
                    </button>
                </div>
                
                <!-- Mini aperçu -->
                <div class="bg-white rounded-xl shadow-lg p-4">
                    <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                        <i class="fas fa-eye mr-2"></i>Aperçu
                    </h3>
                    <div class="text-sm text-gray-600">
                        <p>Pour: <span class="font-bold">${this.surprise.pourQui || '______'}</span></p>
                        <p>De: <span class="font-bold">${this.surprise.deLaPartDe || '______'}</span></p>
                        <p>Style: <span class="font-bold">${currentTemplate.name}</span></p>
                    </div>
                </div>
            </div>
        `;
    }

    renderStep2() {
        const surpriseUrl = `${window.location.origin}/s/?id=${this.surpriseId}`;
        const template = this.templates[this.surprise.template] || this.templates.romantic;
        
        return `
            <div class="max-w-4xl mx-auto">
                <!-- Succès -->
                <div class="text-center mb-8">
                    <div class="text-6xl mb-4">🎉</div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-4">Surprise créée !</h1>
                    <p class="text-xl text-gray-600">Pour <span class="font-bold">${this.surprise.pourQui}</span></p>
                </div>

                <!-- QR Code -->
                <div class="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                        QR Code de partage
                    </h2>
                    
                    <div class="flex justify-center mb-6">
                        <div id="qrCode" class="bg-white p-4 rounded-lg border">
                            <!-- QR Code généré ici -->
                            <div class="text-center p-4">
                                <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-gray-600 mb-6">Scannez ce QR Code pour découvrir la surprise</p>
                        <button id="downloadQRBtn" class="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition mr-3">
                            <i class="fas fa-download mr-2"></i>Télécharger
                        </button>
                        <a href="s/?id=${this.surpriseId}" target="_blank" class="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition inline-block">
                            <i class="fas fa-eye mr-2"></i>Voir la surprise
                        </a>
                    </div>
                </div>

                <!-- Lien -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Lien de partage</h3>
                    <div class="flex">
                        <input 
                            type="text" 
                            id="surpriseUrl"
                            value="${surpriseUrl}"
                            readonly
                            class="flex-grow px-4 py-3 border rounded-l-lg bg-gray-50 text-gray-800 text-sm"
                        />
                        <button id="copyLinkBtn" class="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="create.html" class="bg-white border border-purple-300 text-purple-600 p-6 rounded-xl text-center hover:bg-purple-50 transition">
                        <div class="text-3xl mb-3">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="font-bold">Créer une autre</div>
                    </a>
                    
                    <a href="dashboard.html" class="bg-purple-600 text-white p-6 rounded-xl text-center hover:bg-purple-700 transition">
                        <div class="text-3xl mb-3">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <div class="font-bold">Dashboard</div>
                    </a>
                </div>
            </div>
        `;
    }

    bindEvents() {
        if (this.step === 1) {
            this.bindStep1Events();
        } else {
            this.bindStep2Events();
        }
    }

    bindStep1Events() {
        // Mise à jour en temps réel
        const pourQuiInput = document.getElementById('pourQui');
        const deLaPartDeInput = document.getElementById('deLaPartDe');
        const questionInput = document.getElementById('question1');
        const reponseInput = document.getElementById('reponse1');
        const customHintInput = document.getElementById('customHint');
        const messageInput = document.getElementById('messageFinal');
        const charCount = document.getElementById('charCount');
        
        if (pourQuiInput) {
            pourQuiInput.addEventListener('input', (e) => {
                this.surprise.pourQui = e.target.value;
            });
        }
        
        if (deLaPartDeInput) {
            deLaPartDeInput.addEventListener('input', (e) => {
                this.surprise.deLaPartDe = e.target.value;
                // Mettre à jour la réponse automatiquement
                if (reponseInput && !reponseInput.value) {
                    reponseInput.value = e.target.value;
                    this.surprise.reponse1 = e.target.value;
                }
            });
        }
        
        if (questionInput) {
            questionInput.addEventListener('input', (e) => {
                this.surprise.question1 = e.target.value;
            });
        }
        
        if (reponseInput) {
            reponseInput.addEventListener('input', (e) => {
                this.surprise.reponse1 = e.target.value;
            });
        }
        
        if (customHintInput) {
            customHintInput.addEventListener('input', (e) => {
                this.surprise.customHint = e.target.value;
            });
        }
        
        if (messageInput && charCount) {
            messageInput.addEventListener('input', (e) => {
                this.surprise.messageFinal = e.target.value;
                charCount.textContent = `${e.target.value.length}/500`;
                charCount.className = `text-sm ${e.target.value.length > 500 ? 'text-red-500' : 'text-gray-500'}`;
            });
        }
        
        // Changement de template
        document.querySelectorAll('[data-template]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateKey = e.currentTarget.dataset.template;
                this.changeTemplate(templateKey);
            });
        });
        
        // Création
        document.getElementById('createBtn').addEventListener('click', () => {
            this.saveSurprise();
        });
    }

    bindStep2Events() {
        // Copier lien
        const copyBtn = document.getElementById('copyLinkBtn');
        const urlInput = document.getElementById('surpriseUrl');
        
        if (copyBtn && urlInput) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(urlInput.value);
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    copyBtn.classList.remove('bg-blue-600');
                    copyBtn.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                        copyBtn.classList.remove('bg-green-600');
                        copyBtn.classList.add('bg-blue-600');
                    }, 2000);
                } catch (error) {
                    urlInput.select();
                    document.execCommand('copy');
                    alert('Lien copié !');
                }
            });
        }
        
        // Télécharger QR Code
        document.getElementById('downloadQRBtn')?.addEventListener('click', () => {
            this.downloadQRCode();
        });
    }

    changeTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;
        
        this.surprise.template = templateKey;
        
        // Mettre à jour l'affichage
        document.querySelectorAll('[data-template]').forEach(btn => {
            if (btn.dataset.template === templateKey) {
                btn.classList.add('selected');
                btn.style.borderColor = template.colors.primary;
            } else {
                btn.classList.remove('selected');
                btn.style.borderColor = '';
            }
        });
        
        // Animation simple
        const btn = document.querySelector(`[data-template="${templateKey}"]`);
        if (btn) {
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 300);
        }
    }

    async saveSurprise() {
        // Validation
        if (!this.surprise.pourQui.trim() || !this.surprise.deLaPartDe.trim()) {
            alert('Veuillez remplir les noms');
            return;
        }
        
        if (this.surprise.messageFinal.length > 500) {
            alert('Message trop long (max 500 caractères)');
            return;
        }
        
        const createBtn = document.getElementById('createBtn');
        const originalHTML = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sauvegarde...';
        createBtn.disabled = true;
        
        try {
            // Générer ID si nouvelle surprise
            if (!this.editMode) {
                this.surpriseId = `surprise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Préparer les données
            const surpriseData = {
                ...this.surprise,
                userId: this.user.uid,
                userEmail: this.user.email,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            
            // Sauvegarde principale
            await set(ref(database, 'surprises/' + this.surpriseId), surpriseData);
            
            // Ajouter à l'utilisateur
            await set(ref(database, `users/${this.user.uid}/surprises/${this.surpriseId}`), {
                id: this.surpriseId,
                pourQui: this.surprise.pourQui,
                template: this.surprise.template,
                createdAt: new Date().toISOString()
            });
            
            // Passer à l'étape 2
            this.step = 2;
            this.render();
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de sauvegarde: ' + error.message);
            
            createBtn.innerHTML = originalHTML;
            createBtn.disabled = false;
        }
    }

    generateQRCode() {
        const url = `${window.location.origin}/s/?id=${this.surpriseId}`;
        const qrContainer = document.getElementById('qrCode');
        
        if (!qrContainer) return;
        
        qrContainer.innerHTML = '';
        
        try {
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrContainer, {
                    text: url,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff"
                });
            } else {
                // Fallback simple
                qrContainer.innerHTML = `
                    <div class="text-center p-4">
                        <p class="text-gray-600 mb-2">Lien :</p>
                        <a href="${url}" class="text-blue-600 text-sm break-all" target="_blank">${url}</a>
                    </div>
                `;
            }
        } catch (error) {
            qrContainer.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-gray-600">QR Code non généré</p>
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
        
        const link = document.createElement('a');
        link.download = `LoveCraft_${this.surprise.pourQui}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        alert('QR Code téléchargé !');
    }
}

export default SurpriseCreator;
