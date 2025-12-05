import { auth, database, ref, get, onAuthStateChanged, signOut, remove } from './firebase.js';

class DashboardManager {
    constructor() {
        this.user = null;
        this.surprises = [];
        this.stats = {};
        this.badges = [];
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            
            this.user = user;
            await this.loadUserData();
            this.render();
            this.bindEvents();
        });
    }

    async loadUserData() {
        try {
            console.log('🔍 Chargement des données pour:', this.user.email);
            
            // Charger TOUTES les surprises
            const surprisesRef = ref(database, 'surprises');
            const snapshot = await get(surprisesRef);
            
            this.surprises = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Filtrer seulement les surprises de cet utilisateur
                Object.keys(data).forEach(key => {
                    const surprise = data[key];
                    if (surprise.userId === this.user.uid) {
                        this.surprises.push({
                            id: key,
                            ...surprise
                        });
                    }
                });
                
                // Trier par date (plus récent d'abord)
                this.surprises.sort((a, b) => {
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                });
                
                console.log(`✅ ${this.surprises.length} surprises trouvées`);
            }
            
            // Calculer les stats
            this.calculateStats();
            
            // Calculer les badges
            this.calculateBadges();
            
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            this.showError('Impossible de charger les données');
        }
    }

    calculateStats() {
        const totalViews = this.surprises.reduce((sum, s) => sum + (parseInt(s.views) || 0), 0);
        const totalCompletions = this.surprises.reduce((sum, s) => sum + (parseInt(s.completedViews) || 0), 0);
        
        this.stats = {
            totalSurprises: this.surprises.length,
            totalViews: totalViews,
            totalCompletions: totalCompletions,
            engagementRate: totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0,
            streak: 0,
            level: 1
        };
    }

    calculateBadges() {
        this.badges = [
            {
                id: 1,
                name: 'Romantique Débutant',
                icon: '❤️',
                description: 'Créer 1 surprise',
                unlocked: this.stats.totalSurprises >= 1,
                color: 'bg-red-100 text-red-800'
            },
            {
                id: 2,
                name: 'Messager Fidèle',
                icon: '✉️',
                description: 'Créer 3 surprises',
                unlocked: this.stats.totalSurprises >= 3,
                color: 'bg-blue-100 text-blue-800'
            },
            {
                id: 3,
                name: 'Architecte de l\'Amour',
                icon: '🏛️',
                description: '10 vues',
                unlocked: this.stats.totalViews >= 10,
                color: 'bg-purple-100 text-purple-800'
            },
            {
                id: 4,
                name: 'Gardien de la Flamme',
                icon: '🔥',
                description: '7 jours de connexion',
                unlocked: false, // À implémenter plus tard
                color: 'bg-orange-100 text-orange-800'
            },
            {
                id: 5,
                name: 'Flèche de Cupidon',
                icon: '🏹',
                description: '5 surprises complétées',
                unlocked: this.stats.totalCompletions >= 5,
                color: 'bg-pink-100 text-pink-800'
            }
        ];
    }

    render() {
        const loading = document.getElementById('loadingDashboard');
        if (loading) {
            loading.style.display = 'none';
        }
        
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="space-y-8">
                <!-- En-tête -->
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
                    <div class="flex flex-col md:flex-row items-center justify-between">
                        <div class="mb-6 md:mb-0">
                            <div class="flex items-center mb-4">
                                ${this.user.photoURL ? 
                                    `<img src="${this.user.photoURL}" class="w-16 h-16 rounded-full border-4 border-white/50 mr-4 object-cover shadow-lg" onerror="this.style.display='none'">` :
                                    `<div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/50 mr-4 shadow-lg">
                                        <i class="fas fa-user text-2xl"></i>
                                    </div>`
                                }
                                <div>
                                    <h1 class="text-2xl font-bold">Bonjour, ${this.user.displayName || this.user.email} !</h1>
                                    <p class="opacity-90">Votre espace personnel LoveCraft</p>
                                </div>
                            </div>
                            <p class="text-lg italic">
                                <i class="fas fa-quote-left opacity-70 mr-2"></i>
                                "Créez des moments magiques pour ceux que vous aimez"
                            </p>
                        </div>
                        <div class="text-center">
                            <a href="create.html" class="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg transform hover:-translate-y-1">
                                <i class="fas fa-plus mr-2"></i>Créer une surprise
                            </a>
                            <p class="text-sm opacity-80 mt-2">En 2 minutes chrono</p>
                        </div>
                    </div>
                </div>
                
                <!-- Actions rapides -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="create.html" class="stat-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-purple-200 hover:border-purple-400">
                        <div class="text-3xl text-purple-600 mb-4">
                            <i class="fas fa-plus-circle"></i>
                        </div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">Créer une surprise</h3>
                        <p class="text-gray-600 text-sm">Nouveau message personnalisé</p>
                    </a>
                    
                    <a href="#" id="viewRecentSurprise" class="stat-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-pink-200 hover:border-pink-400">
                        <div class="text-3xl text-pink-600 mb-4">
                            <i class="fas fa-eye"></i>
                        </div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">Voir dernière surprise</h3>
                        <p class="text-gray-600 text-sm">${this.surprises.length > 0 ? `Pour ${this.surprises[0].pourQui}` : 'Aucune surprise'}</p>
                    </a>
                    
                    <a href="settings.html" class="stat-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-blue-200 hover:border-blue-400">
                        <div class="text-3xl text-blue-600 mb-4">
                            <i class="fas fa-cog"></i>
                        </div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">Paramètres</h3>
                        <p class="text-gray-600 text-sm">Gérer votre compte</p>
                    </a>
                </div>
                
                <!-- Statistiques -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="stat-card bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-xl p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm opacity-90">Surprises créées</p>
                                <p class="text-4xl font-bold">${this.stats.totalSurprises}</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-gift"></i>
                            </div>
                        </div>
                        <div class="w-full bg-white/30 rounded-full h-2">
                            <div class="bg-white h-2 rounded-full" style="width: ${Math.min((this.stats.totalSurprises / 10) * 100, 100)}%"></div>
                        </div>
                        <p class="text-xs opacity-80 mt-2">${this.stats.totalSurprises}/10 pour le prochain badge</p>
                    </div>
                    
                    <div class="stat-card bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-xl p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm opacity-90">Vues totales</p>
                                <p class="text-4xl font-bold">${this.stats.totalViews}</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-eye"></i>
                            </div>
                        </div>
                        <div class="w-full bg-white/30 rounded-full h-2">
                            <div class="bg-white h-2 rounded-full" style="width: ${Math.min((this.stats.totalViews / 50) * 100, 100)}%"></div>
                        </div>
                        <p class="text-xs opacity-80 mt-2">${this.stats.totalViews}/50 vues pour le prochain badge</p>
                    </div>
                    
                    <div class="stat-card bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-xl p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm opacity-90">Taux d'engagement</p>
                                <p class="text-4xl font-bold">${this.stats.engagementRate}%</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="w-full bg-white/30 rounded-full h-2">
                            <div class="bg-white h-2 rounded-full" style="width: ${this.stats.engagementRate}%"></div>
                        </div>
                        <p class="text-xs opacity-80 mt-2">Personnes ayant complété la surprise</p>
                    </div>
                </div>
                
                <!-- Tableau des dernières surprises -->
                <div class="bg-white rounded-2xl shadow-xl p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-history mr-2"></i>Dernières surprises
                        </h3>
                        <span class="text-sm text-gray-500">${this.surprises.length} au total</span>
                    </div>
                    
                    ${this.surprises.length > 0 ? this.renderSurprisesTable() : this.renderNoSurprises()}
                </div>
                
                <!-- Badges -->
                <div class="bg-white rounded-2xl shadow-xl p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-trophy mr-2"></i>Vos badges
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        ${this.badges.map(badge => `
                            <div class="${badge.color} rounded-xl p-4 text-center border-2 ${badge.unlocked ? 'border-transparent badge-unlocked' : 'border-gray-200 opacity-70'}">
                                <div class="text-3xl mb-2">${badge.icon}</div>
                                <p class="font-bold text-sm mb-1">${badge.name}</p>
                                <p class="text-xs">${badge.description}</p>
                                ${badge.unlocked ? 
                                    '<div class="mt-2 text-xs text-green-600 font-bold"><i class="fas fa-check mr-1"></i>Débloqué</div>' :
                                    '<div class="mt-2 text-xs text-gray-500"><i class="fas fa-lock mr-1"></i>À débloquer</div>'
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Conseils -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 class="text-lg font-bold text-purple-800 mb-4">
                        <i class="fas fa-lightbulb mr-2"></i>Conseils pour vos surprises
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white/70 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">💌</div>
                            <p class="font-medium text-gray-800">Envoyez par SMS</p>
                            <p class="text-sm text-gray-600">Le lien s'ouvre directement sur mobile</p>
                        </div>
                        <div class="bg-white/70 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">🎨</div>
                            <p class="font-medium text-gray-800">Utilisez des thèmes différents</p>
                            <p class="text-sm text-gray-600">Adaptez la surprise à la personne</p>
                        </div>
                        <div class="bg-white/70 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">⏰</div>
                            <p class="font-medium text-gray-800">Planifiez l'envoi</p>
                            <p class="text-sm text-gray-600">Envoyez à une date spéciale</p>
                        </div>
                        <div class="bg-white/70 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">🤫</div>
                            <p class="font-medium text-gray-800">Ajoutez un indice</p>
                            <p class="text-sm text-gray-600">Rendez la découverte plus amusante</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSurprisesTable() {
        const recentSurprises = this.surprises.slice(0, 5);
        
        return `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pour qui</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vues</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Complétions</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${recentSurprises.map(surprise => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-4 py-4">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 rounded-full ${this.getThemeColor(surprise.theme)} flex items-center justify-center text-white mr-3">
                                            ${this.getThemeIcon(surprise.theme)}
                                        </div>
                                        <div>
                                            <div class="font-bold text-gray-900">${surprise.pourQui || 'Inconnu'}</div>
                                            <div class="text-sm text-gray-500">De : ${surprise.deLaPartDe || 'Anonyme'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-4 text-sm text-gray-900">
                                    ${surprise.createdAt ? new Date(surprise.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                </td>
                                <td class="px-4 py-4">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${this.getViewsColor(surprise.views)}">
                                        <i class="fas fa-eye mr-1"></i>${surprise.views || 0}
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${this.getCompletionColor(surprise.completedViews)}">
                                        <i class="fas fa-check-circle mr-1"></i>${surprise.completedViews || 0}
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <div class="flex space-x-3">
                                        <a href="s/?id=${surprise.id}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition">
                                            <i class="fas fa-external-link-alt mr-1"></i>Voir
                                        </a>
                                        <a href="create.html?edit=${surprise.id}" class="text-purple-600 hover:text-purple-800 font-medium text-sm bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg transition">
                                            <i class="fas fa-edit mr-1"></i>Modifier
                                        </a>
                                        <button data-id="${surprise.id}" class="delete-surprise text-red-600 hover:text-red-800 font-medium text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition">
                                            <i class="fas fa-trash mr-1"></i>Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${this.surprises.length > 5 ? `
                <div class="mt-6 text-center">
                    <button id="viewAllSurprises" class="text-purple-600 hover:text-purple-700 font-medium">
                        <i class="fas fa-list mr-1"></i>Voir toutes les surprises (${this.surprises.length})
                    </button>
                </div>
            ` : ''}
        `;
    }

    renderNoSurprises() {
        return `
            <div class="text-center py-12">
                <div class="inline-block p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                    <i class="fas fa-gift text-4xl text-purple-500"></i>
                </div>
                <h4 class="text-xl font-bold text-gray-700 mb-2">Aucune surprise créée</h4>
                <p class="text-gray-500 mb-6">Créez votre première surprise en 2 minutes !</p>
                <a href="create.html" class="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition shadow-lg">
                    <i class="fas fa-plus mr-2"></i>Créer ma première surprise
                </a>
            </div>
        `;
    }

    getThemeColor(theme) {
        const colors = {
            'romantique': 'bg-gradient-to-r from-pink-500 to-red-500',
            'geek': 'bg-gradient-to-r from-blue-500 to-indigo-500',
            'fun': 'bg-gradient-to-r from-yellow-500 to-orange-500',
            'classique': 'bg-gradient-to-r from-gray-500 to-gray-700'
        };
        return colors[theme] || 'bg-gradient-to-r from-purple-500 to-pink-500';
    }

    getThemeIcon(theme) {
        const icons = {
            'romantique': '<i class="fas fa-heart text-xs"></i>',
            'geek': '<i class="fas fa-laptop-code text-xs"></i>',
            'fun': '<i class="fas fa-laugh text-xs"></i>',
            'classique': '<i class="fas fa-gem text-xs"></i>'
        };
        return icons[theme] || '<i class="fas fa-star text-xs"></i>';
    }

    getViewsColor(views) {
        const count = parseInt(views) || 0;
        if (count === 0) return 'bg-gray-100 text-gray-800';
        if (count < 5) return 'bg-blue-100 text-blue-800';
        if (count < 10) return 'bg-green-100 text-green-800';
        return 'bg-purple-100 text-purple-800';
    }

    getCompletionColor(completions) {
        const count = parseInt(completions) || 0;
        if (count === 0) return 'bg-gray-100 text-gray-800';
        if (count < 3) return 'bg-yellow-100 text-yellow-800';
        if (count < 5) return 'bg-pink-100 text-pink-800';
        return 'bg-red-100 text-red-800';
    }

    bindEvents() {
        // Déconnexion
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erreur déconnexion:', error);
                this.showError('Erreur lors de la déconnexion');
            }
        });
        
        // Voir dernière surprise
        const viewRecentBtn = document.getElementById('viewRecentSurprise');
        if (viewRecentBtn && this.surprises.length > 0) {
            viewRecentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(`s/?id=${this.surprises[0].id}`, '_blank');
            });
        }
        
        // Voir toutes les surprises
        const viewAllBtn = document.getElementById('viewAllSurprises');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllSurprises();
            });
        }
        
        // Suppression de surprises
        setTimeout(() => {
            document.querySelectorAll('.delete-surprise').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const surpriseId = e.currentTarget.dataset.id;
                    await this.deleteSurprise(surpriseId);
                });
            });
        }, 100);
    }

    async deleteSurprise(surpriseId) {
        const surprise = this.surprises.find(s => s.id === surpriseId);
        if (!surprise) return;
        
        if (!confirm(`Supprimer la surprise pour ${surprise.pourQui} ? Cette action est irréversible.`)) {
            return;
        }
        
        try {
            await remove(ref(database, `surprises/${surpriseId}`));
            
            // Recharger les données
            await this.loadUserData();
            this.render();
            this.bindEvents();
            
            this.showNotification('✅ Surprise supprimée avec succès');
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showError('❌ Erreur lors de la suppression');
        }
    }

    showAllSurprises() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-6">
                    <a href="#" id="backToDashboard" class="text-purple-600 hover:text-purple-700 font-medium">
                        <i class="fas fa-arrow-left mr-2"></i>Retour au tableau de bord
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mt-2">Toutes mes surprises (${this.surprises.length})</h1>
                </div>
                
                <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gradient-to-r from-purple-50 to-pink-50">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase">Pour qui</th>
                                    <th class="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase">Date</th>
                                    <th class="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase">Thème</th>
                                    <th class="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase">Vues</th>
                                    <th class="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase">Complétions</th>
                                    <th class="px-6 py-4 text-left text-xs font-bold text-purple-800 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${this.surprises.map(surprise => `
                                    <tr class="hover:bg-gray-50 transition">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center">
                                                <div class="w-12 h-12 rounded-full ${this.getThemeColor(surprise.theme)} flex items-center justify-center text-white mr-4">
                                                    ${this.getThemeIcon(surprise.theme)}
                                                </div>
                                                <div>
                                                    <div class="font-bold text-gray-900">${surprise.pourQui || 'Inconnu'}</div>
                                                    <div class="text-sm text-gray-500">De : ${surprise.deLaPartDe || 'Anonyme'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-900">
                                            ${surprise.createdAt ? new Date(surprise.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                                                ${surprise.theme || 'standard'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="font-bold text-gray-800">${surprise.views || 0}</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="font-bold text-gray-800">${surprise.completedViews || 0}</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex space-x-2">
                                                <a href="s/?id=${surprise.id}" target="_blank" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium text-sm">
                                                    Voir
                                                </a>
                                                <a href="create.html?edit=${surprise.id}" class="bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-medium text-sm">
                                                    Modifier
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                        <div class="text-2xl font-bold text-purple-600">${this.stats.totalSurprises}</div>
                        <div class="text-gray-700">Surprises totales</div>
                    </div>
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                        <div class="text-2xl font-bold text-blue-600">${this.stats.totalViews}</div>
                        <div class="text-gray-700">Vues totales</div>
                    </div>
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                        <div class="text-2xl font-bold text-green-600">${this.stats.engagementRate}%</div>
                        <div class="text-gray-700">Taux d'engagement</div>
                    </div>
                </div>
            </div>
        `;
        
        // Bouton retour
        document.getElementById('backToDashboard').addEventListener('click', (e) => {
            e.preventDefault();
            this.render();
            this.bindEvents();
        });
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

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-3"></i>
                <div>${message}</div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Démarrer l'application
new DashboardManager();
