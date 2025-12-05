import { database, ref, get, update } from './firebase.js';

class SurpriseViewer {
    constructor() {
        this.step = 1;
        this.surprise = null;
        this.surpriseId = localStorage.getItem('surpriseId') || 
                         new URLSearchParams(window.location.search).get('id');
        this.init();
    }

    async init() {
        await this.loadSurprise();
        this.render();
        this.bindEvents();
    }

    async loadSurprise() {
        if (!this.surpriseId) {
            this.showError('Aucune surprise trouvée');
            return;
        }
        
        try {
            const surpriseRef = ref(database, 'surprises/' + this.surpriseId);
            const snapshot = await get(surpriseRef);
            
            if (snapshot.exists()) {
                this.surprise = snapshot.val();
                
                // Incrémenter les vues
                const currentViews = this.surprise.views || 0;
                await update(surpriseRef, {
                    views: currentViews + 1
                });
            } else {
                this.showError('Cette surprise n\'existe plus');
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
            this.showError('Erreur de chargement');
        }
    }

    render() {
        const app = document.getElementById('surprise-app');
        
        if (!app) return;
        
        if (!this.surprise) {
            app.innerHTML = `
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div class="text-5xl mb-6">😢</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">Surprise non trouvée</h1>
                    <p class="text-gray-600 mb-6">Cette surprise a été supprimée.</p>
                    <a href="${window.location.origin}/LoveCraft" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Retour
                    </a>
                </div>
            `;
            return;
        }

        // Thème
        let bgClass = 'from-pink-500 to-red-500';
        let textClass = 'text-white';
        
        if (this.surprise.theme === 'geek') {
            bgClass = 'from-blue-500 to-indigo-500';
        } else if (this.surprise.theme === 'fun') {
            bgClass = 'from-yellow-500 to-orange-500';
        } else if (this.surprise.theme === 'classique') {
            bgClass = 'from-gray-500 to-gray-700';
        }

        app.innerHTML = `
            <div class="max-w-md w-full">
                <div class="bg-gradient-to-r ${bgClass} rounded-2xl shadow-2xl p-6 md:p-8 ${textClass}">
                    ${this.renderStep()}
                </div>
            </div>
        `;
    }

    renderStep() {
        if (this.step === 1) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6">🔒</div>
                    <h1 class="text-2xl font-bold mb-4">Accès Sécurisé</h1>
                    <p class="opacity-90 mb-6">
                        ${this.surprise.deLaPartDe} a préparé une surprise pour toi.
                    </p>
                    
                    <input 
                        id="userName" 
                        type="text" 
                        placeholder="Ton prénom..."
                        class="w-full px-4 py-3 bg-white/20 rounded-lg mb-4 text-white placeholder-white/70"
                        autocomplete="off"
                    />
                    
                    <div id="error" class="text-yellow-300 mb-4 hidden text-sm"></div>
                    
                    <button id="validateBtn" class="w-full bg-white/30 hover:bg-white/40 text-white py-3 rounded-lg transition">
                        Valider <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            `;
        }
        
        if (this.step === 2) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6">🤔</div>
                    <h1 class="text-2xl font-bold mb-4">Question</h1>
                    <p class="text-xl mb-8 bg-white/10 p-4 rounded-xl">
                        "${this.surprise.question1}"
                    </p>
                    
                    <input 
                        id="userAnswer" 
                        type="text" 
                        placeholder="Ta réponse..."
                        class="w-full px-4 py-3 bg-white/20 rounded-lg mb-4 text-white placeholder-white/70"
                        autocomplete="off"
                    />
                    
                    <div id="error" class="text-yellow-300 mb-4 hidden text-sm"></div>
                    
                    <button id="answerBtn" class="w-full bg-white/30 hover:bg-white/40 text-white py-3 rounded-lg transition">
                        Répondre <i class="fas fa-check ml-2"></i>
                    </button>
                </div>
            `;
        }
        
        if (this.step === 3) {
            // Marquer comme complété
            this.markAsCompleted();
            
            return `
                <div class="text-center">
                    <div class="text-6xl mb-6 animate-pulse-heart">🎉</div>
                    <h1 class="text-3xl font-bold mb-6">Félicitations ${this.surprise.pourQui} !</h1>
                    
                    <div class="space-y-6">
                        <div class="bg-white/20 p-6 rounded-xl">
                            <p class="text-lg mb-3">Message de <span class="font-bold">${this.surprise.deLaPartDe}</span> :</p>
                            <p class="text-2xl italic font-semibold">
                                "${this.surprise.messageFinal}"
                            </p>
                        </div>
                        
                        <div class="mt-8">
                            <a href="${window.location.origin}/LoveCraft/create.html" class="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                                <i class="fas fa-heart mr-2"></i>Créer une surprise
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async markAsCompleted() {
        try {
            const surpriseRef = ref(database, 'surprises/' + this.surpriseId);
            const currentCompleted = this.surprise.completedViews || 0;
            await update(surpriseRef, {
                completedViews: currentCompleted + 1
            });
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    bindEvents() {
        if (this.step === 1) {
            const validateBtn = document.getElementById('validateBtn');
            const userNameInput = document.getElementById('userName');
            
            if (validateBtn && userNameInput) {
                validateBtn.addEventListener('click', () => this.validateName());
                userNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.validateName();
                });
            }
        }
        
        if (this.step === 2) {
            const answerBtn = document.getElementById('answerBtn');
            const userAnswerInput = document.getElementById('userAnswer');
            
            if (answerBtn && userAnswerInput) {
                answerBtn.addEventListener('click', () => this.validateAnswer());
                userAnswerInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.validateAnswer();
                });
            }
        }
    }

    validateName() {
        const input = document.getElementById('userName').value.toLowerCase().trim();
        const expected = this.surprise.pourQui.toLowerCase();
        
        // Validation flexible
        if (input === expected || input.includes(expected) || expected.includes(input)) {
            this.step = 2;
            this.render();
            this.bindEvents();
        } else {
            const errorElement = document.getElementById('error');
            if (errorElement) {
                errorElement.classList.remove('hidden');
                errorElement.textContent = `Cette surprise est pour ${this.surprise.pourQui} ❤️`;
            }
        }
    }

    validateAnswer() {
        const input = document.getElementById('userAnswer').value.toLowerCase().trim();
        const expected = (this.surprise.reponse1 || '').toLowerCase();
        
        // Si pas de réponse attendue ou réponse correcte
        if (!this.surprise.reponse1 || this.surprise.reponse1.trim() === '' ||
            input === expected || input.includes(expected) || expected.includes(input)) {
            
            this.step = 3;
            this.render();
            
        } else {
            const errorElement = document.getElementById('error');
            if (errorElement) {
                errorElement.classList.remove('hidden');
                errorElement.textContent = `Indice : ${this.surprise.reponse1}`;
            }
        }
    }

    showError(message) {
        const app = document.getElementById('surprise-app');
        if (app) {
            app.innerHTML = `
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div class="text-5xl mb-6">😢</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">Oups !</h1>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <a href="${window.location.origin}/LoveCraft" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Retour
                    </a>
                </div>
            `;
        }
    }
}

// Démarrer
new SurpriseViewer();
