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
            console.error('Pas d\'ID de surprise');
            return;
        }
        
        try {
            const surpriseRef = ref(database, 'surprises/' + this.surpriseId);
            const snapshot = await get(surpriseRef);
            
            if (snapshot.exists()) {
                this.surprise = snapshot.val();
                console.log('Surprise chargée:', this.surprise);
                
                // Incrémenter les vues
                const currentViews = this.surprise.views || 0;
                await update(surpriseRef, {
                    views: currentViews + 1
                });
            } else {
                console.error('Surprise non trouvée');
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
        }
    }

    render() {
        const app = document.getElementById('surprise-app');
        
        if (!this.surprise) {
            app.innerHTML = `
                <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center mt-10">
                    <div class="text-5xl mb-6">😢</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">
                        Surprise non trouvée
                    </h1>
                    <p class="text-gray-600 mb-6">
                        Cette surprise n'existe plus ou a été supprimée.
                    </p>
                    <a href="${window.location.origin}/LoveCraft" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                    </a>
                </div>
            `;
            return;
        }

        // Appliquer le thème
        let bgColor = 'from-pink-50 to-red-50';
        let textColor = 'text-pink-600';
        
        if (this.surprise.theme === 'geek') {
            bgColor = 'from-blue-50 to-indigo-50';
            textColor = 'text-blue-600';
        } else if (this.surprise.theme === 'fun') {
            bgColor = 'from-yellow-50 to-orange-50';
            textColor = 'text-yellow-600';
        } else if (this.surprise.theme === 'classique') {
            bgColor = 'from-gray-50 to-gray-100';
            textColor = 'text-gray-600';
        }

        app.innerHTML = `
            <div class="max-w-md mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    ${this.renderStep(bgColor, textColor)}
                </div>
            </div>
        `;
    }

    renderStep(bgColor, textColor) {
        if (this.step === 1) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6">🔒</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">
                        Accès Sécurisé
                    </h1>
                    <p class="text-gray-600 mb-6">
                        ${this.surprise.deLaPartDe} a préparé une surprise spéciale pour toi.
                    </p>
                    
                    <input 
                        id="userName" 
                        type="text" 
                        placeholder="Ton prénom..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${this.surprise.theme === 'romantique' ? 'focus:ring-pink-500' : this.surprise.theme === 'geek' ? 'focus:ring-blue-500' : this.surprise.theme === 'fun' ? 'focus:ring-yellow-500' : 'focus:ring-gray-500'} mb-4"
                        autocomplete="off"
                    />
                    
                    <div id="error" class="text-red-500 mb-4 hidden"></div>
                    
                    <button id="validateBtn" class="w-full py-3 ${this.surprise.theme === 'romantique' ? 'bg-pink-500 hover:bg-pink-600' : this.surprise.theme === 'geek' ? 'bg-blue-500 hover:bg-blue-600' : this.surprise.theme === 'fun' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg transition">
                        Valider
                    </button>
                </div>
            `;
        }
        
        if (this.step === 2) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6">🤔</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">
                        Question de ${this.surprise.deLaPartDe}
                    </h1>
                    <p class="text-xl text-gray-700 mb-8">
                        "${this.surprise.question1}"
                    </p>
                    
                    <input 
                        id="userAnswer" 
                        type="text" 
                        placeholder="Ta réponse..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${this.surprise.theme === 'romantique' ? 'focus:ring-pink-500' : this.surprise.theme === 'geek' ? 'focus:ring-blue-500' : this.surprise.theme === 'fun' ? 'focus:ring-yellow-500' : 'focus:ring-gray-500'} mb-4"
                        autocomplete="off"
                    />
                    
                    <div id="error" class="text-red-500 mb-4 hidden"></div>
                    
                    <button id="answerBtn" class="w-full py-3 ${this.surprise.theme === 'romantique' ? 'bg-pink-500 hover:bg-pink-600' : this.surprise.theme === 'geek' ? 'bg-blue-500 hover:bg-blue-600' : this.surprise.theme === 'fun' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg transition">
                        Répondre
                    </button>
                </div>
            `;
        }
        
        if (this.step === 3) {
            // Marquer comme complété
            this.markAsCompleted();
            
            return `
                <div class="text-center">
                    <div class="text-6xl mb-6 animate-pulse">${this.surprise.theme === 'romantique' ? '❤️' : this.surprise.theme === 'geek' ? '👨‍💻' : this.surprise.theme === 'fun' ? '🎉' : '🎩'}</div>
                    
                    <h1 class="text-3xl font-bold ${this.surprise.theme === 'romantique' ? 'text-pink-600' : this.surprise.theme === 'geek' ? 'text-blue-600' : this.surprise.theme === 'fun' ? 'text-yellow-600' : 'text-gray-600'} mb-6">
                        Félicitations ${this.surprise.pourQui} ! 🎉
                    </h1>
                    
                    <div class="space-y-6">
                        <p class="text-lg text-gray-700">
                            Message spécial de <span class="font-bold">${this.surprise.deLaPartDe}</span> :
                        </p>
                        
                        <div class="${this.surprise.theme === 'romantique' ? 'bg-pink-50 border-pink-200' : this.surprise.theme === 'geek' ? 'bg-blue-50 border-blue-200' : this.surprise.theme === 'fun' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} p-6 rounded-xl border">
                            <p class="text-xl italic ${this.surprise.theme === 'romantique' ? 'text-pink-700' : this.surprise.theme === 'geek' ? 'text-blue-700' : this.surprise.theme === 'fun' ? 'text-yellow-700' : 'text-gray-700'}">
                                "${this.surprise.messageFinal}"
                            </p>
                        </div>
                        
                        <div class="mt-8 p-6 ${this.surprise.theme === 'romantique' ? 'bg-gradient-to-r from-pink-500 to-red-500' : this.surprise.theme === 'geek' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : this.surprise.theme === 'fun' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white rounded-xl">
                            <p class="font-bold text-lg mb-2">✨ Surprise ! ✨</p>
                            <p class="mb-4">
                                ${this.surprise.deLaPartDe} t'a préparé quelque chose de spécial.
                            </p>
                            <div class="text-4xl mt-4">
                                ${this.surprise.theme === 'romantique' ? '💖' : this.surprise.theme === 'geek' ? '💻' : this.surprise.theme === 'fun' ? '😄' : '🎁'}
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <button id="shareBtn" class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition">
                                <i class="fas fa-share-alt mr-2"></i>Partager cette surprise
                            </button>
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
            console.log('✅ Marqué comme complété');
        } catch (error) {
            console.error('Erreur mise à jour complétion:', error);
        }
    }

    bindEvents() {
        if (this.step === 1) {
            document.getElementById('validateBtn').addEventListener('click', () => {
                this.validateName();
            });
            
            document.getElementById('userName').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.validateName();
            });
        }
        
        if (this.step === 2) {
            document.getElementById('answerBtn').addEventListener('click', () => {
                this.validateAnswer();
            });
            
            document.getElementById('userAnswer').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.validateAnswer();
            });
        }
        
        if (this.step === 3) {
            document.getElementById('shareBtn')?.addEventListener('click', () => {
                this.shareSurprise();
            });
        }
    }

    validateName() {
        const input = document.getElementById('userName').value.toLowerCase().trim();
        const expected = this.surprise.pourQui.toLowerCase();
        
        // Validation flexible
        if (input === expected || 
            input.includes(expected) || 
            expected.includes(input) ||
            (input.length > 2 && expected.includes(input.substring(0, 3)))) {
            this.step = 2;
            this.render();
            this.bindEvents();
        } else {
            document.getElementById('error').classList.remove('hidden');
            document.getElementById('error').textContent = 
                `Cette surprise est pour ${this.surprise.pourQui} ❤️`;
            
            // Shake animation
            const inputField = document.getElementById('userName');
            inputField.classList.add('border-red-500');
            setTimeout(() => inputField.classList.remove('border-red-500'), 500);
        }
    }

    validateAnswer() {
        const input = document.getElementById('userAnswer').value.toLowerCase().trim();
        const expected = this.surprise.reponse1.toLowerCase();
        
        // Si pas de réponse attend
