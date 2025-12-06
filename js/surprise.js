import { database, ref, get, update } from './firebase.js';

class SurpriseViewer {
    constructor() {
        this.step = 1;
        this.surprise = null;
        this.surpriseId = localStorage.getItem('surpriseId') || 
                         new URLSearchParams(window.location.search).get('id');
        this.userName = '';
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
        
        if (!app) return;
        
        if (!this.surprise) {
            app.innerHTML = `
                <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div class="text-5xl mb-6">😢</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">Surprise non trouvée</h1>
                    <p class="text-gray-600 mb-6">Cette surprise a été supprimée.</p>
                    <a href="${window.location.origin}/LoveCraft" class="text-purple-600 hover:text-purple-700">
                        <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
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
                
                <!-- Bouton partage social (apparaît seulement à l'étape 3) -->
                ${this.step === 3 ? this.renderShareSection() : ''}
            </div>
        `;
        
        // Pour l'étape 3, on attend que le DOM soit prêt
        if (this.step === 3) {
            setTimeout(() => {
                this.startRevealAnimation();
                this.playRomanticSound();
            }, 100);
        }
    }

    renderStep() {
        if (this.step === 1) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6 animate-pulse">🔒</div>
                    <h1 class="text-2xl font-bold mb-4">Accès Sécurisé</h1>
                    <p class="opacity-90 mb-6">
                        <span class="font-bold">${this.surprise.deLaPartDe}</span> a préparé une surprise spéciale pour toi.
                    </p>
                    
                    <input 
                        id="userName" 
                        type="text" 
                        placeholder="Ton prénom..."
                        class="w-full px-4 py-3 bg-white/20 rounded-lg mb-4 placeholder-white/70"
                        autocomplete="off"
                        style="color: white;"
                    />
                    
                    <div id="error" class="text-yellow-300 mb-4 hidden text-sm"></div>
                    
                    <button id="validateBtn" class="w-full bg-white/30 hover:bg-white/40 py-3 rounded-lg transition font-bold">
                        Valider <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            `;
        }
        
        if (this.step === 2) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6 animate-bounce">🤔</div>
                    <h1 class="text-2xl font-bold mb-4">Question</h1>
                    <p class="text-xl mb-8 bg-white/10 p-4 rounded-xl italic">
                        "${this.surprise.question1}"
                    </p>
                    
                    <input 
                        id="userAnswer" 
                        type="text" 
                        placeholder="Ta réponse..."
                        class="w-full px-4 py-3 bg-white/20 rounded-lg mb-4 placeholder-white/70"
                        autocomplete="off"
                        style="color: white;"
                    />
                    
                    <div id="error" class="text-yellow-300 mb-4 hidden text-sm"></div>
                    
                    <button id="answerBtn" class="w-full bg-white/30 hover:bg-white/40 py-3 rounded-lg transition font-bold">
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
                    <div id="countdown" class="hidden">
                        <div class="text-8xl mb-6 animate-pulse">3</div>
                        <p class="text-xl">Préparez-vous...</p>
                    </div>
                    
                    <div id="reveal">
                        <div class="text-6xl mb-6 animate-pulse">🎉</div>
                        <h1 class="text-3xl font-bold mb-2">Félicitations ${this.userName} !</h1>
                        <p class="opacity-90 mb-6">Voici votre message secret</p>
                        
                        <div class="bg-white/20 p-6 rounded-xl mb-8">
                            <p class="text-lg mb-3">Message de <span class="font-bold">${this.surprise.deLaPartDe}</span> :</p>
                            <p class="text-2xl italic font-semibold" id="finalMessage">
                                "${this.surprise.messageFinal}"
                            </p>
                        </div>
                        
                        <p class="text-sm opacity-80 mb-8">
                            <i class="fas fa-heart mr-1"></i>
                            Cette surprise a été créée spécialement pour vous avec LoveCraft
                        </p>
                        
                        <div class="space-y-4">
                            <a href="${window.location.origin}/LoveCraft/create.html" 
                               class="block bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                                <i class="fas fa-heart mr-2"></i>Créer une surprise
                            </a>
                            
                            <button id="shareStoryBtn" 
                                    class="block w-full bg-white/30 hover:bg-white/40 px-6 py-3 rounded-lg font-bold transition">
                                <i class="fas fa-plus-circle mr-2"></i>Créer une Story Instagram
                            </button>
                            
                            <button id="shareSurpriseBtn" 
                                    class="block w-full bg-white/30 hover:bg-white/40 px-6 py-3 rounded-lg font-bold transition">
                                <i class="fas fa-share-alt mr-2"></i>Partager cette surprise
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderShareSection() {
        return `
            <div class="mt-6 bg-white/10 rounded-xl p-6">
                <h3 class="font-bold text-lg mb-4 text-center">
                    <i class="fas fa-share-alt mr-2"></i>Partagez l'amour ❤️
                </h3>
                <div class="grid grid-cols-4 gap-3">
                    <button class="social-share bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90 transition" data-platform="whatsapp">
                        <i class="fab fa-whatsapp text-xl"></i>
                    </button>
                    <button class="social-share bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:opacity-90 transition" data-platform="facebook">
                        <i class="fab fa-facebook text-xl"></i>
                    </button>
                    <button class="social-share bg-gradient-to-r from-pink-400 to-red-500 text-white p-3 rounded-lg hover:opacity-90 transition" data-platform="instagram">
                        <i class="fab fa-instagram text-xl"></i>
                    </button>
                    <button class="social-share bg-gradient-to-r from-gray-800 to-black text-white p-3 rounded-lg hover:opacity-90 transition" data-platform="copy">
                        <i class="fas fa-copy text-xl"></i>
                    </button>
                </div>
                <p class="text-center text-sm opacity-80 mt-4">
                    <i class="fas fa-info-circle mr-1"></i>
                    Partagez cette belle surprise avec vos proches
                </p>
            </div>
        `;
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
        
        if (this.step === 3) {
            // Animation de révélations
            this.startRevealAnimation();
            
            // Bouton Story Instagram - FONCTIONNEL
            const shareStoryBtn = document.getElementById('shareStoryBtn');
            if (shareStoryBtn) {
                shareStoryBtn.addEventListener('click', () => {
                    this.createInstagramStory();
                });
            }
            
            // Bouton partage général - FONCTIONNEL
            const shareBtn = document.getElementById('shareSurpriseBtn');
            if (shareBtn) {
                shareBtn.addEventListener('click', () => {
                    this.showShareModal();
                });
            }
            
            // Boutons sociaux - FONCTIONNEL
            setTimeout(() => {
                document.querySelectorAll('.social-share').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const platform = e.currentTarget.dataset.platform;
                        this.shareSurprise(platform);
                    });
                });
            }, 300);
        }
    }

    validateName() {
        const input = document.getElementById('userName').value.trim();
        this.userName = input;
        const expected = this.surprise.pourQui.toLowerCase();
        
        // Validation flexible
        if (input.toLowerCase() === expected || 
            input.toLowerCase().includes(expected) || 
            expected.includes(input.toLowerCase())) {
            
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
            this.startCountdown();
            
        } else {
            const errorElement = document.getElementById('error');
            if (errorElement) {
                errorElement.classList.remove('hidden');
                errorElement.textContent = `Indice : ${this.surprise.reponse1}`;
            }
        }
    }

    startCountdown() {
        const countdownEl = document.getElementById('countdown');
        const revealEl = document.getElementById('reveal');
        
        if (countdownEl && revealEl) {
            countdownEl.classList.remove('hidden');
            revealEl.classList.add('hidden');
            
            let count = 3;
            const countdownInterval = setInterval(() => {
                countdownEl.innerHTML = `
                    <div class="text-8xl mb-6 animate-pulse">${count}</div>
                    <p class="text-xl">Préparez-vous...</p>
                `;
                
                count--;
                
                if (count < 0) {
                    clearInterval(countdownInterval);
                    countdownEl.classList.add('hidden');
                    revealEl.classList.remove('hidden');
                    
                    // Jouer son après révélation
                    this.playRomanticSound();
                    this.bindEvents();
                }
            }, 1000);
        }
    }

    startRevealAnimation() {
        // Animation flash sur le message
        const messageEl = document.getElementById('finalMessage');
        if (messageEl) {
            setTimeout(() => {
                messageEl.classList.add('animate-flash');
                messageEl.style.animation = 'flash 0.5s ease-in-out 3';
            }, 500);
        }
    }

    playRomanticSound() {
        try {
            const audio = document.getElementById('romanticSound');
            if (audio) {
                audio.volume = 0.3;
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.log('Son automatique bloqué, clic requis');
                });
            }
        } catch (error) {
            console.log('Erreur lecture audio:', error);
        }
    }

    createInstagramStory() {
        // Créer un canvas pour la story Instagram
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        
        // Fond gradient selon le thème
        let gradient;
        switch(this.surprise.theme) {
            case 'geek':
                gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#1e40af');
                break;
            case 'fun':
                gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
                gradient.addColorStop(0, '#f59e0b');
                gradient.addColorStop(1, '#d97706');
                break;
            case 'classique':
                gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
                gradient.addColorStop(0, '#6b7280');
                gradient.addColorStop(1, '#374151');
                break;
            default: // romantique
                gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
                gradient.addColorStop(0, '#ec4899');
                gradient.addColorStop(1, '#db2777');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);
        
        // Logo LoveCraft en haut
        ctx.fillStyle = 'white';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LoveCraft', 540, 200);
        
        // Cœur
        ctx.font = '100px Arial';
        ctx.fillText('❤️', 540, 320);
        
        // Message principal
        ctx.font = 'bold 64px Arial';
        ctx.fillText('J\'ai reçu une', 540, 500);
        ctx.fillText('surprise magique !', 540, 600);
        
        // Message personnalisé
        ctx.font = 'italic 52px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Découper le message en lignes
        const message = `"${this.surprise.messageFinal}"`;
        const maxWidth = 900;
        const lineHeight = 70;
        let y = 750;
        
        let words = message.split(' ');
        let line = '';
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, 540, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 540, y);
        
        // Signature
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`- ${this.surprise.deLaPartDe}`, 540, y + 100);
        
        // QR Code placehold (explication)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(290, 1100, 500, 500);
        
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Scanne pour créer', 540, 1350);
        ctx.fillText('ta propre surprise', 540, 1400);
        
        // Watermark en bas
        ctx.font = '32px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Créé avec LoveCraft', 540, 1850);
        ctx.fillText('lovecraft.com', 540, 1900);
        
        // Télécharger l'image
        const link = document.createElement('a');
        link.download = `LoveCraft_Story_${this.userName}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        this.showNotification('📸 Story téléchargée ! Partagez-la sur Instagram.');
    }

    showShareModal() {
        const shareModal = document.createElement('div');
        shareModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        shareModal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-share-alt mr-2 text-purple-600"></i>
                        Partagez cette belle surprise
                    </h3>
                    <button class="close-share-modal text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <p class="text-sm text-purple-800">
                            <i class="fas fa-quote-left mr-1"></i>
                            "${this.surprise.messageFinal}"
                            <i class="fas fa-quote-right ml-1"></i>
                        </p>
                        <p class="text-xs text-purple-600 mt-2">- ${this.surprise.deLaPartDe}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button class="share-platform bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:opacity-90 transition" data-platform="whatsapp">
                            <div class="text-2xl mb-2">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="font-bold">WhatsApp</div>
                        </button>
                        
                        <button class="share-platform bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg hover:opacity-90 transition" data-platform="facebook">
                            <div class="text-2xl mb-2">
                                <i class="fab fa-facebook"></i>
                            </div>
                            <div class="font-bold">Facebook</div>
                        </button>
                        
                        <button class="share-platform bg-gradient-to-r from-pink-400 to-red-500 text-white p-4 rounded-lg hover:opacity-90 transition" data-platform="instagram">
                            <div class="text-2xl mb-2">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="font-bold">Instagram</div>
                        </button>
                        
                        <button class="share-platform bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:opacity-90 transition" data-platform="copy">
                            <div class="text-2xl mb-2">
                                <i class="fas fa-copy"></i>
                            </div>
                            <div class="font-bold">Copier</div>
                        </button>
                    </div>
                    
                    <div class="text-center">
                        <button id="createStoryBtn" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition w-full">
                            <i class="fas fa-plus-circle mr-2"></i>Créer une Story Instagram
                        </button>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-heart text-red-500 mr-1"></i>
                            Partagé depuis LoveCraft - Créez vos propres surprises
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(shareModal);
        
        // Fermer modal
        shareModal.querySelector('.close-share-modal').addEventListener('click', () => {
            shareModal.remove();
        });
        
        // Créer Story Instagram
        shareModal.querySelector('#createStoryBtn').addEventListener('click', () => {
            this.createInstagramStory();
            shareModal.remove();
        });
        
        // Actions de partage
        shareModal.querySelectorAll('.share-platform').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareSurprise(platform);
                shareModal.remove();
            });
        });
        
        // Fermer en cliquant à l'extérieur
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.remove();
            }
        });
    }

    shareSurprise(platform) {
        const url = window.location.href;
        const message = `✨ ${this.surprise.deLaPartDe} m'a envoyé une surprise magique sur LoveCraft ! ✨\n\n"${this.surprise.messageFinal}"\n\n${url}\n\nCréez vos propres surprises sur LoveCraft 💖`;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(shareUrl, '_blank');
                break;
                
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;
                
            case 'instagram':
                this.createInstagramStory();
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
                        <i class="fas fa-arrow-left mr-2"></i>Retour à l'accueil
                    </a>
                </div>
            `;
        }
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

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    new SurpriseViewer();
});
