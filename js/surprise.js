import { database, ref, get, update } from './firebase.js';

class SurpriseViewer {
    constructor() {
        this.step = 1;
        this.surprise = null;
        this.surpriseId = localStorage.getItem('surpriseId') || 
                         new URLSearchParams(window.location.search).get('id');
        this.startTime = Date.now();
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
                console.log('✅ Surprise chargée:', this.surprise);
                
                // Incrémenter les vues
                const currentViews = this.surprise.views || 0;
                await update(surpriseRef, {
                    views: currentViews + 1,
                    lastViewed: new Date().toISOString()
                });
            } else {
                this.showError('Cette surprise n\'existe plus');
            }
        } catch (error) {
            console.error('❌ Erreur chargement:', error);
            this.showError('Erreur de chargement');
        }
    }

    render() {
        const app = document.getElementById('surprise-app');
        const loading = document.getElementById('loading');
        
        if (loading) {
            loading.style.display = 'none';
        }
        
        if (!this.surprise) {
            app.innerHTML = `
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
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

        // Déterminer le thème
        let themeClass = 'bg-gradient-romantic';
        let themeColor = 'text-pink-600';
        let focusRing = 'focus:ring-pink-500';
        let buttonClass = 'bg-pink-500 hover:bg-pink-600';
        
        if (this.surprise.theme === 'geek') {
            themeClass = 'bg-gradient-geek';
            themeColor = 'text-blue-600';
            focusRing = 'focus:ring-blue-500';
            buttonClass = 'bg-blue-500 hover:bg-blue-600';
        } else if (this.surprise.theme === 'fun') {
            themeClass = 'bg-gradient-fun';
            themeColor = 'text-yellow-600';
            focusRing = 'focus:ring-yellow-500';
            buttonClass = 'bg-yellow-500 hover:bg-yellow-600';
        } else if (this.surprise.theme === 'classique') {
            themeClass = 'bg-gradient-classic';
            themeColor = 'text-gray-600';
            focusRing = 'focus:ring-gray-500';
            buttonClass = 'bg-gray-500 hover:bg-gray-600';
        }

        app.innerHTML = `
            <div class="max-w-md w-full">
                <div class="${themeClass} rounded-2xl shadow-2xl p-6 md:p-8 text-white">
                    ${this.renderStep(themeColor, focusRing, buttonClass)}
                </div>
            </div>
        `;
    }

    renderStep(themeColor, focusRing, buttonClass) {
        if (this.step === 1) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6 animate-pulse-heart">🔒</div>
                    <h1 class="text-2xl font-bold mb-4">
                        Accès Sécurisé
                    </h1>
                    <p class="opacity-90 mb-6">
                        ${this.surprise.deLaPartDe} a préparé une surprise spéciale pour toi.
                    </p>
                    
                    <input 
                        id="userName" 
                        type="text" 
                        placeholder="Ton prénom..."
                        class="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg ${focusRing} mb-4 text-white placeholder-white/70"
                        autocomplete="off"
                        autofocus
                    />
                    
                    <div id="error" class="text-yellow-300 mb-4 hidden text-sm"></div>
                    
                    <button id="validateBtn" class="w-full ${buttonClass} text-white py-3 rounded-lg transition transform hover:-translate-y-1">
                        Valider <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                    
                    <p class="text-sm opacity-70 mt-6">
                        <i class="fas fa-info-circle mr-1"></i>
                        Entrez votre prénom pour découvrir la surprise
                    </p>
                </div>
            `;
        }
        
        if (this.step === 2) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6">🤔</div>
                    <h1 class="text-2xl font-bold mb-4">
                        Question de ${this.surprise.deLaPartDe}
                    </h1>
                    <p class="text-xl mb-8 bg-white/10 p-4 rounded-xl">
                        "${this.surprise.question1}"
                    </p>
                    
                    <input 
                        id="userAnswer" 
                        type="text" 
                        placeholder="Ta réponse..."
                        class="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg ${focusRing} mb-4 text-white placeholder-white/70"
                        autocomplete="off"
                        autofocus
                    />
                    
                    <div id="error" class="text-yellow-300 mb-4 hidden text-sm"></div>
                    
                    <button id="answerBtn" class="w-full ${buttonClass} text-white py-3 rounded-lg transition transform hover:-translate-y-1">
                        Répondre <i class="fas fa-check ml-2"></i>
                    </button>
                    
                    <p class="text-sm opacity-70 mt-6">
                        <i class="fas fa-lightbulb mr-1"></i>
                        Réponds correctement pour découvrir le message secret
                    </p>
                </div>
            `;
        }
        
        if (this.step === 3) {
            // Timer avant révélation
            return `
                <div id="timerContainer" class="text-center">
                    <div class="text-6xl mb-6 animate-pulse-heart">⏳</div>
                    <h1 class="text-2xl font-bold mb-4">
                        Préparation de la surprise...
                    </h1>
                    <div class="text-8xl font-bold mb-8" id="countdown">3</div>
                    <p class="opacity-90">Le message secret se prépare...</p>
                </div>
            `;
        }
        
        if (this.step === 4) {
            // Révélation avec flash
            this.markAsCompleted();
            
            return `
                <div id="revealContainer" class="text-center animate-flash">
                    <div class="text-6xl mb-6 animate-pulse-heart">${this.surprise.theme === 'romantique' ? '❤️' : this.surprise.theme === 'geek' ? '👨‍💻' : this.surprise.theme === 'fun' ? '🎉' : '🎩'}</div>
                    
                    <h1 class="text-3xl font-bold mb-6">
                        Félicitations ${this.surprise.pourQui} ! 🎉
                    </h1>
                    
                    <div class="space-y-6">
                        <div class="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                            <p class="text-lg mb-3">
                                Message spécial de <span class="font-bold">${this.surprise.deLaPartDe}</span> :
                            </p>
                            <p class="text-2xl italic font-semibold">
                                "${this.surprise.messageFinal}"
                            </p>
                        </div>
                        
                        <div class="bg-black/30 p-6 rounded-xl">
                            <p class="font-bold text-lg mb-2">✨ Surprise Exclusive ✨</p>
                            <p class="mb-4 opacity-90">
                                ${this.surprise.deLaPartDe} a créé cette surprise uniquement pour toi sur LoveCraft.
                            </p>
                            <div class="text-4xl mt-4">
                                ${this.surprise.theme === 'romantique' ? '💖' : this.surprise.theme === 'geek' ? '💻' : this.surprise.theme === 'fun' ? '😄' : '🎁'}
                            </div>
                        </div>
                        
                        <!-- Boutons CTA -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <a href="${window.location.origin}/LoveCraft/create.html" class="bg-white text-purple-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center">
                                <i class="fas fa-heart mr-2"></i>Créer une surprise
                            </a>
                            <button id="shareBtn" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
                                <i class="fas fa-share-alt mr-2"></i>Partager
                            </button>
                        </div>
                        
                        <div class="mt-6">
                            <button id="respondBtn" class="text-white/80 hover:text-white text-sm">
                                <i class="fas fa-reply mr-1"></i>Répondre à ${this.surprise.deLaPartDe}
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
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000); // en secondes
            
            await update(surpriseRef, {
                completedViews: currentCompleted + 1,
                lastCompleted: new Date().toISOString(),
                averageTimeSpent: timeSpent
            });
            
            // Jouer le son romantique
            this.playRomanticSound();
            
            console.log('✅ Marqué comme complété - Temps passé:', timeSpent + 's');
        } catch (error) {
            console.error('Erreur mise à jour:', error);
        }
    }

    playRomanticSound() {
        const audio = document.getElementById('romanticSound');
        if (audio) {
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Son non joué:', e));
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
        
        if (this.step === 4) {
            document.getElementById('shareBtn')?.addEventListener('click', () => {
                this.shareSurprise();
            });
            
            document.getElementById('respondBtn')?.addEventListener('click', () => {
                this.respondToSender();
            });
        }
    }

    validateName() {
        const input = document.getElementById('userName').value.toLowerCase().trim();
        const expected = this.surprise.pourQui.toLowerCase();
        
        if (input === expected || 
            input.includes(expected) || 
            expected.includes(input) ||
            (input.length > 2 && expected.includes(input.substring(0, 3)))) {
            this.step = 2;
            this.render();
            this.bindEvents();
        } else {
            const errorElement = document.getElementById('error');
            errorElement.classList.remove('hidden');
            errorElement.textContent = `Cette surprise est pour ${this.surprise.pourQui} ❤️`;
            
            // Animation shake
            const inputField = document.getElementById('userName');
            inputField.classList.add('animate-flash');
            setTimeout(() => inputField.classList.remove('animate-flash'), 500);
        }
    }

    validateAnswer() {
        const input = document.getElementById('userAnswer').value.toLowerCase().trim();
        const expected = (this.surprise.reponse1 || '').toLowerCase();
        
        if (!this.surprise.reponse1 || this.surprise.reponse1.trim() === '' ||
            input === expected || 
            input.includes(expected) || 
            expected.includes(input)) {
            
            // Lancer le timer
            this.step = 3;
            this.render();
            this.startCountdown();
            
        } else {
            const errorElement = document.getElementById('error');
            errorElement.classList.remove('hidden');
            errorElement.textContent = `Indice : Pense à qui t'aime... (${this.surprise.reponse1})`;
            
            const inputField = document.getElementById('userAnswer');
            inputField.classList.add('animate-flash');
            setTimeout(() => inputField.classList.remove('animate-flash'), 500);
        }
    }

    startCountdown() {
        let count = 3;
        const countdownElement = document.getElementById('countdown');
        
        const interval = setInterval(() => {
            countdownElement.textContent = count;
            countdownElement.classList.add('animate-countdown');
            
            setTimeout(() => {
                countdownElement.classList.remove('animate-countdown');
            }, 900);
            
            count--;
            
            if (count < 0) {
                clearInterval(interval);
                // Flash et révélation
                this.step = 4;
                this.render();
                this.bindEvents();
                
                // Animation flash supplémentaire
                const revealContainer = document.getElementById('revealContainer');
                if (revealContainer) {
                    revealContainer.classList.add('animate-flash');
                    setTimeout(() => revealContainer.classList.remove('animate-flash'), 1000);
                }
            }
        }, 1000);
    }

    shareSurprise() {
        const shareUrl = window.location.href;
        const shareText = `Découvre la surprise que ${this.surprise.deLaPartDe} a créée pour moi sur LoveCraft ! ❤️`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Surprise LoveCraft',
                text: shareText,
                url: shareUrl,
            }).then(() => {
                console.log('✅ Partage réussi');
            }).catch(err => {
                console.log('❌ Erreur partage:', err);
                this.copyToClipboard(shareUrl);
            });
        } else {
            this.copyToClipboard(shareUrl);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Lien copié ! Partage-le avec tes amis.');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('✅ Lien copié dans le presse-papier !');
        });
    }

    respondToSender() {
        const subject = encodeURIComponent(`Réponse à ta surprise LoveCraft ❤️`);
        const body = encodeURIComponent(`Cher(e) ${this.surprise.deLaPartDe},\n\nJ'ai découvert ta surprise sur LoveCraft et je voulais te dire...\n\n[Écrivez votre message ici]\n\nAvec amour,\n${this.surprise.pourQui}`);
        
        // Si on a l'email de l'expéditeur
        if (this.surprise.userEmail) {
            window.location.href = `mailto:${this.surprise.userEmail}?subject=${subject}&body=${body}`;
        } else {
            // Sinon, créer un message générique
            const message = `Je voudrais répondre à ${this.surprise.deLaPartDe} :\n\n`;
            prompt("Copiez ce message pour répondre :", message);
        }
    }

    showError(message) {
        const app = document.getElementById('surprise-app');
        app.innerHTML = `
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div class="text-5xl mb-6">😢</div>
                <h1 class="text-2xl font-bold text-gray-800 mb-4">
                    Oups !
                </h1>
                <p class="text-gray-600 mb-6">
                    ${message}
                </p>
                <a href="${window.location.origin}/LoveCraft" class="text-purple-600 hover:text-purple-700">
                    <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                </a>
            </div>
        `;
    }
}

// Démarrer la surprise
new SurpriseViewer();
