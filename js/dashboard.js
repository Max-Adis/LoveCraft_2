import { auth, database, ref, get, query, orderByChild, equalTo, onAuthStateChanged, signOut } from './firebase.js';
import i18n from './localization.js';

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
            // Charger les surprises de l'utilisateur
            const surprisesRef = ref(database, 'surprises');
            const snapshot = await get(query(surprisesRef, orderByChild('userId'), equalTo(this.user.uid)));
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                this.surprises = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            
            // Charger les stats
            const statsRef = ref(database, `users/${this.user.uid}/stats`);
            const statsSnap = await get(statsRef);
            this.stats = statsSnap.exists() ? statsSnap.val() : {
                totalSurprises: 0,
                totalViews: 0,
                totalCompletions: 0,
                streak: 0,
                level: 1,
                xp: 0
            };
            
            // Calculer les badges
            this.calculateBadges();
            
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        }
    }

    calculateBadges() {
        this.badges = [];
        
        // Badge 1: Romantique Débutant
        if (this.stats.totalSurprises >= 1) {
            this.badges.push({
                id: 1,
                name: 'Romantique Débutant',
                icon: '❤️',
                description: 'A créé sa première surprise',
                unlocked: true,
                color: 'bg-red-100 text-red-800'
            });
        }
        
        // Badge 2: Messager Fidèle
        if (this.stats.totalSurprises >= 3) {
            this.badges.push({
                id: 2,
                name: 'Messager Fidèle',
                icon: '✉️',
                description: '3 surprises créées',
                unlocked: true,
                color: 'bg-blue-100 text-blue-800'
            });
        }
        
        // Badge 3: Architecte de l'Amour
        if (this.stats.totalViews >= 10) {
            this.badges.push({
                id: 3,
                name: 'Architecte de l\'Amour',
                icon: '🏛️',
                description: '10 vues sur ses surprises',
                unlocked: true,
                color: 'bg-purple-100 text-purple-800'
            });
        }
        
        // Badge 4: Gardien de la Flamme
        if (this.stats.streak >= 7) {
            this.badges.push({
                id: 4,
                name: 'Gardien de la Flamme',
                icon: '🔥',
                description: '7 jours de connexion',
                unlocked: true,
                color: 'bg-orange-100 text-orange-800'
            });
        }
        
        // Badge 5: Flèche de Cupidon
        if (this.stats.totalCompletions >= 5) {
            this.badges.push({
                id: 5,
                name: 'Flèche de Cupidon',
                icon: '🏹',
                description: '5 surprises complétées',
                unlocked: true,
                color: 'bg-pink-100 text-pink-800'
            });
        }
        
        // Badges verrouillés
        const totalBadges = 5;
        for (let i = this.badges.length + 1; i <= totalBadges; i++) {
            const lockedBadges = [
                { name: 'Romantique Débutant', icon: '❤️', requirement: 'Créer 1 surprise' },
                { name: 'Messager Fidèle', icon: '✉️', requirement: 'Créer 3 surprises' },
                { name: 'Architecte de l\'Amour', icon: '🏛️', requirement: '10 vues' },
                { name: 'Gardien de la Flamme', icon: '🔥', requirement: '7 jours de streak' },
                { name: 'Flèche de Cupidon', icon: '🏹', requirement: '5 surprises complétées' }
            ];
            
            this.badges.push({
                id: i,
                name: lockedBadges[i-1].name,
                icon: lockedBadges[i-1].icon,
                description: lockedBadges[i-1].requirement,
                unlocked: false,
                color: 'bg-gray-100 text-gray-400'
            });
        }
    }

    render() {
        const loading = document.getElementById('loadingDashboard');
        if (loading) {
            loading.style.display = 'none';
        }
        
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="space-y-8">
                <!-- En-tête avec bienvenue -->
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                    <div class="flex flex-col md:flex-row items-center justify-between">
                        <div class="mb-6 md:mb-0">
                            <div class="flex items-center mb-4">
                                ${this.user.photoURL ? 
                                    `<img src="${this.user.photoURL}" class="w-16 h-16 rounded-full border-4 border-white/50 mr-4 object-cover">` :
                                    `<div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/50 mr-4">
                                        <i class="fas fa-user text-2xl"></i>
                                    </div>`
                                }
                                <div>
                                    <h1 class="text-2xl font-bold">Bonjour, ${this.user.displayName || this.user.email} !</h1>
                                    <p class="opacity-90">Bienvenue dans votre espace LoveCraft</p>
                                </div>
                            </div>
                            <p class="text-lg">
                                <i class="fas fa-quote-left opacity-70 mr-2"></i>
                                "Eve a pleuré de joie quand elle a découvert ma première surprise"
                                <i class="fas fa-quote-right opacity-70 ml-2"></i>
                                <span class="block text-sm opacity-80 mt-1">— Max, créateur de LoveCraft</span>
                            </p>
                        </div>
                        <div class="text-center">
                            <a href="create.html" class="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">
                                <i class="fas fa-plus mr-2"></i>Créer une surprise
                            </a>
                            <p class="text-sm opacity-80 mt-2">En 2 minutes chrono</p>
                        </div>
                    </div>
                </div>
                
                <!-- Statistiques principales -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Surprises créées</p>
                                <p class="text-3xl font-bold text-purple-600">${this.surprises.length}</p>
                            </div>
                            <div class="text-3xl text-purple-500">
                                <i class="fas fa-gift"></i>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-purple-600 h-2 rounded-full progress-bar" style="width: ${Math.min((this.surprises.length / 10) * 100, 100)}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">${this.surprises.length}/10 pour le prochain badge</p>
                    </div>
                    
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Vues totales</p>
                                <p class="text-3xl font-bold text-blue-600">${this.stats.totalViews || 0}</p>
                            </div>
                            <div class="text-3xl text-blue-500">
                                <i class="fas fa-eye"></i>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full progress-bar" style="width: ${Math.min(((this.stats.totalViews || 0) / 50) * 100, 100)}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">${this.stats.totalViews || 0}/50 pour le prochain badge</p>
                    </div>
                    
                    <div class="stat-card bg-white rounded-xl shadow-sm p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Taux d'engagement</p>
                                <p class="text-3xl font-bold text-green-600">${this.calculateEngagementRate()}%</p>
                            </div>
                            <div class="text-3xl text-green-500">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full progress-bar" style="width: ${this.calculateEngagementRate()}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Personnes qui ont complété la surprise</p>
                    </div>
                </div>
                
                <!-- Graphiques -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-bar mr-2"></i>Activité récente
                        </h3>
                        <div class="h-64">
                            <canvas id="activityChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-heart mr-2"></i>Badges débloqués
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            ${this.badges.map(badge => `
                                <div class="${badge.color} rounded-lg p-4 text-center border ${badge.unlocked ? 'border-transparent' : 'border-gray-200'} ${badge.unlocked ? 'badge-glow' : 'opacity-70'}">
                                    <div class="text-3xl mb-2">${badge.icon}</div>
                                    <p class="font-bold text-sm mb-1">${badge.name}</p>
                                    <p class="text-xs">${badge.description}</p>
                                    ${badge.unlocked ? 
                                        '<div class="mt-2 text-xs text-green-600"><i class="fas fa-check mr-1"></i>Débloqué</div>' :
                                        '<div class="mt-2 text-xs text-gray-500"><i class="fas fa-lock mr-1"></i>À débloquer</div>'
                                    }
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Liste des surprises -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold text-gray-800">
                            <i class="fas fa-gifts mr-2"></i>Mes surprises
                        </h3>
                        <span class="text-sm text-gray-500">${this.surprises.length} au total</span>
                    </div>
                    
                    ${this.surprises.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pour qui</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vues</th>
                                        <th class="px-4 py-3 text-left text-xs font-xs font-medium text-gray-500 uppercase tracking-wider">Complétions</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${this.surprises.map(surprise => `
                                        <tr class="hover:bg-gray-50 transition">
                                            <td class="px-4 py-4">
                                                <div class="flex items-center">
                                                    <div class="flex-shrink-0 h-10 w-10 rounded-full ${this.getThemeColor(surprise.theme)} flex items-center justify-center text-white mr-3">
                                                        ${this.getThemeIcon(surprise.theme)}
                                                    </div>
                                                    <div>
                                                        <div class="font-medium text-gray-900">${surprise.pourQui}</div>
                                                        <div class="text-sm text-gray-500">De la part de ${surprise.deLaPartDe}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-4 py-4 text-sm text-gray-500">
                                                ${new Date(surprise.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td class="px-4 py-4">
                                                <div class="flex items-center">
                                                    <i class="fas fa-eye mr-2 text-gray-400"></i>
                                                    <span class="font-medium">${surprise.views || 0}</span>
                                                </div>
                                            </td>
                                            <td class="px-4 py-4">
                                                <div class="flex items-center">
                                                    <i class="fas fa-check-circle mr-2 text-gray-400"></i>
                                                    <span class="font-medium">${surprise.completedViews || 0}</span>
                                                </div>
                                            </td>
                                            <td class="px-4 py-4">
                                                <div class="flex space-x-2">
                                                    <a href="s/?id=${surprise.id}" target="_blank" class="text-blue-600 hover:text-blue-700 text-sm">
                                                        <i class="fas fa-external-link-alt mr-1"></i>Voir
                                                    </a>
                                                    <a href="create.html?edit=${surprise.id}" class="text-purple-600 hover:text-purple-700 text-sm">
                                                        <i class="fas fa-edit mr-1"></i>Modifier
                                                    </a>
                                                    <a href="#" data-id="${surprise.id}" class="text-red-600 hover:text-red-700 text-sm delete-surprise">
                                                        <i class="fas fa-trash mr-1"></i>Supprimer
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <div class="text-5xl mb-4 text-gray-300">🎁</div>
                            <h4 class="text-lg font-medium text-gray-700 mb-2">Aucune surprise créée</h4>
                            <p class="text-gray-500 mb-6">Commencez par créer votre première surprise !</p>
                            <a href="create.html" class="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition">
                                <i class="fas fa-plus mr-2"></i>Créer ma première surprise
                            </a>
                        </div>
                    `}
                </div>
                
                <!-- Conseils et astuces -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h3 class="text-lg font-bold text-purple-800 mb-4">
                        <i class="fas fa-lightbulb mr-2"></i>Conseils pour vos surprises
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">💌</div>
                            <p class="font-medium text-gray-800">Envoyez par SMS</p>
                            <p class="text-sm text-gray-600">Le lien s'ouvre directement sur mobile</p>
                        </div>
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">🎨</div>
                            <p class="font-medium text-gray-800">Utilisez des thèmes différents</p>
                            <p class="text-sm text-gray-600">Adaptez la surprise à la personne</p>
                        </div>
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">⏰</div>
                            <p class="font-medium text-gray-800">Planifiez l'envoi</p>
                            <p class="text-sm text-gray-600">Envoyez à une date spéciale</p>
                        </div>
                        <div class="bg-white/50 p-4 rounded-lg">
                            <div class="text-purple-600 text-xl mb-2">🤫</div>
                            <p class="font-medium text-gray-800">Ajoutez un indice</p>
                            <p class="text-sm text-gray-600">Rendez la découverte plus amusante</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialiser les graphiques
        this.initCharts();
    }

    calculateEngagementRate() {
        if (!this.stats.totalViews || this.stats.totalViews === 0) return 0;
        const completions = this.stats.totalCompletions || 0;
        return Math.round((completions / this.stats.totalViews) * 100);
    }

    getThemeColor(theme) {
        switch(theme) {
            case 'romantique': return 'bg-gradient-to-r from-pink-500 to-red-500';
            case 'geek': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
            case 'fun': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
            case 'classique': return 'bg-gradient-to-r from-gray-500 to-gray-700';
            default: return 'bg-gradient-to-r from-purple-500 to-pink-500';
        }
    }

    getThemeIcon(theme) {
        switch(theme) {
            case 'romantique': return '<i class="fas fa-heart text-sm"></i>';
            case 'geek': return '<i class="fas fa-laptop-code text-sm"></i>';
            case 'fun': return '<i class="fas fa-laugh text-sm"></i>';
            case 'classique': return '<i class="fas fa-gem text-sm"></i>';
            default: return '<i class="fas fa-star text-sm"></i>';
        }
    }

    initCharts() {
        // Graphique d'activité
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            // Données fictives pour la démo
            const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            const viewsData = [3, 5, 2, 8, 4, 6, 7];
            const completionsData = [1, 2, 1, 3, 2, 4, 3];
            
            new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Vues',
                            data: viewsData,
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Complétions',
                            data: completionsData,
                            borderColor: '#ec4899',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 2
                            }
                        }
                    }
                }
            });
        }
    }

    bindEvents() {
        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erreur déconnexion:', error);
                alert('Erreur lors de la déconnexion');
            }
        });
        
        // Suppression de surprises
        document.querySelectorAll('.delete-surprise').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const surpriseId = e.currentTarget.dataset.id;
                const surprise = this.surprises.find(s => s.id === surpriseId);
                
                if (!surprise) return;
                
                if (confirm(`Supprimer la surprise pour ${surprise.pourQui} ?`)) {
                    try {
                        const surpriseRef = ref(database, 'surprises/' + surpriseId);
                        await remove(surpriseRef);
                        
                        // Recharger les données
                        await this.loadUserData();
                        this.render();
                        
                        alert('Surprise supprimée avec succès !');
                    } catch (error) {
                        console.error('Erreur suppression:', error);
                        alert('Erreur lors de la suppression');
                    }
                }
            });
        });
        
        // Écouter le changement de langue
        document.addEventListener('languageChanged', async () => {
            await this.loadUserData();
            this.render();
        });
    }
}

new DashboardManager();
