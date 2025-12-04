import { db, getDoc, doc, updateDoc, increment } from './firebase.js';

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
        if (!this.surpriseId) return;
        
        try {
            const docRef = doc(db, 'surprises', this.surpriseId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                this.surprise = docSnap.data();
                // Incrémenter les vues
                await updateDoc(docRef, {
                    views: increment(1)
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    render() {
        const app = document.getElementById('surprise-app');
        
        if (!this.surprise) {
            app.innerHTML = `
                <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div class="text-5xl mb-6">😢</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">
                        Surprise non trouvée
                    </h1>
                    <p class="text-gray-600">
                        Cette surprise n'existe plus ou a été supprimée.
                    </p>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="max-w-md mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">
                        Accès Sécurisé
                    </h1>
                    <p class="text-gray-600 mb-6">
                        ${this.surprise.deLaPartDe} a préparé une surprise spéciale.
                    </p>
                    
                    <input 
                        id="userName" 
                        type="text" 
                        placeholder="Votre prénom..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 mb-4"
                    />
                    
                    <div id="error" class="text-red-500 mb-4 hidden"></div>
                    
                    <button id="validateBtn" class="w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
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
                        ${this.surprise.question1}
                    </p>
                    
                    <input 
                        id="userAnswer" 
                        type="text" 
                        placeholder="Votre réponse..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 mb-4"
                    />
                    
                    <div id="error" class="text-red-500 mb-4 hidden"></div>
                    
                    <button id="answerBtn" class="w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
                        Répondre
                    </button>
                </div>
            `;
        }
        
        if (this.step === 3) {
            return `
                <div class="text-center">
                    <div class="text-6xl mb-6 animate-pulse">❤️</div>
                    
                    <h1 class="text-3xl font-bold text-pink-600 mb-6">
                        Félicitations ${this.surprise.pourQui} ! 🎉
                    </h1>
                    
                    <div class="space-y-6">
                        <p class="text-lg text-gray-700">
                            Message spécial de <span class="font-bold">${this.surprise.deLaPartDe}</span> :
                        </p>
                        
                        <div class="bg-pink-50 p-6 rounded-xl">
                            <p class="text-xl italic text-pink-700">
                                "${this.surprise.messageFinal}"
                            </p>
                        </div>
                        
                        <div class="mt-8 p-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl">
                            <p class="font-bold text-lg">🎁 Surprise !</p>
                            <p class="mt-2">
                                ${this.surprise.deLaPartDe} a préparé quelque chose pour toi.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    bindEvents() {
        if (this.step === 1) {
            document.getElementById('validateBtn').addEventListener('click', () => {
                const input = document.getElementById('userName').value.toLowerCase();
                const expected = this.surprise.pourQui.toLowerCase();
                
                if (input.includes(expected) || expected.includes(input)) {
                    this.step = 2;
                    this.render();
                    this.bindEvents();
                } else {
                    document.getElementById('error').classList.remove('hidden');
                    document.getElementById('error').textContent = 
                        `Cette surprise est pour ${this.surprise.pourQui} ❤️`;
                }
            });
        }
        
        if (this.step === 2) {
            document.getElementById('answerBtn').addEventListener('click', () => {
                const input = document.getElementById('userAnswer').value.toLowerCase();
                const expected = this.surprise.reponse1.toLowerCase();
                
                if (input.includes(expected) || expected.includes(input) || !this.surprise.reponse1) {
                    this.step = 3;
                    this.render();
                } else {
                    document.getElementById('error').classList.remove('hidden');
                    document.getElementById('error').textContent = 
                        `Indice : Réfléchis à qui a créé cette surprise...`;
                }
            });
        }
    }
}

// Démarrer la surprise
new SurpriseViewer();
