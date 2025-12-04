import { 
    auth, database, ref, get, remove, onAuthStateChanged, signOut 
} from './firebase.js';

class DashboardManager {
    constructor() {
        this.user = null;
        this.surprises = [];
        this.templates = [
            {
                id: 'romantic',
                name: 'Romantique Classique',
                icon: '❤️',
                description: 'Fleurs, cœurs et poésie',
                question: 'Qui t\'aime plus que tout au monde ?',
                message: 'Tu es l\'amour de ma vie, chaque jour avec toi est un cadeau.'
            },
            {
                id: 'geek',
                name: 'Geek Love',
                icon: '👨‍💻',
                description: 'Pour les amoureux de la tech',
                question: 'Quel est ton bug préféré ? (moi)',
                message: 'Tu es la meilleure ligne de code de ma vie. Sans toi, tout buggue.'
            },
            {
                id: 'adventure',
                name: 'Aventure',
                icon: '🗺️',
                description: 'Carte au trésor numérique',
                question: 'Où irions-nous pour notre plus grande aventure ?',
                message: 'Avec toi, chaque jour est une nouvelle aventure. Prêt(e) à découvrir le monde ensemble ?'
            },
            {
                id: 'music',
                name: 'Musical',
                icon: '🎵',
                description: 'Surprise avec paroles',
                question: 'Quelle chanson nous représente le mieux ?',
                message: 'Tu es la mélodie de mon cœur, la chanson qui ne s\'arrête jamais.'
            }
        ];
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            
            this.user = user;
            this.updateUserInfo();
            await this.loadUserSurprises();
            this.updateStats();
            this.bindEvents();
            this.showTemplatesModal();
        });
    }

    updateUserInfo() {
        const email = this.user.email;
        const displayName = this.user.displayName || email.split('@')[0];
        document.getElementById('userEmail').textContent = displayName;
        
        if (this.user.photoURL) {
            const avatar = document.querySelector('#userMenu .rounded-full');
            avatar.innerHTML = `<img src="${this.user.photoURL}" class="w-full h-full rounded-full">`;
        }
    }

    async loadUserSurprises() {
        try {
            const surprisesRef = ref(database, 'surprises');
            const snapshot = await get(surprisesRef);
            
            this.surprises = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    const surprise = data[key];
                    // Filtrer par utilisateur
                    if (surprise.userId === this.user.uid) {
                        this.surprises.push({
                            id: key,
                            ...surprise
                        });
                    }
                });
            }
            
            this.displaySurprises();
        } catch (error) {
            console.error('Erreur chargement:', error);
            this.showNotification('Erreur de chargement', 'error');
        }
    }

    displaySurprises() {
        const tbody = document.getElementById('surprisesTableBody');
        
        if (this.surprises.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-gift text-4xl mb-4 text-gray-300"></i>
                        <p>Aucune surprise créée</p>
                        <a href="create.html" class="inline-block mt-4 text-purple-600 hover:text-purple-700">
                            Créer votre première surprise
                        </a>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.surprises.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const recentSurprises = this.surprises.slice(0, 5);
        
        tbody.innerHTML = recentSurprises.map(surprise => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-heart text-pink-600"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${surprise.pourQui}</div>
                            <div class="text-sm text-gray-500">${surprise.deLaPartDe}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${new Date(surprise.createdAt).toLocaleDateString('fr-FR')}</div>
                    <div class="text-sm text-gray-500">${new Date(surprise.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${surprise.views || 0} vues</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${surprise.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${surprise.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="../LoveCraft/s/?id=${surprise.id}" target="_blank" class="text-blue-600 hover:text-blue-900 mr-3" title="Voir">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button onclick="dashboard.editSurprise('${surprise.id}')" class="text-purple-600 hover:text-purple-900 mr-3" title="Éditer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="dashboard.deleteSurprise('${surprise.id}', '${surprise.pourQui}')" class="text-red-600 hover:text-red-900" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async deleteSurprise(id, name) {
        if (!confirm(`Supprimer la surprise pour ${name} ? Cette action est irréversible.`)) {
            return;
        }

        try {
            await remove(ref(database, 'surprises/' + id));
            // Supprimer aussi de la liste utilisateur
            await remove(ref(database, 'users/' + this.user.uid + '/surprises/' + id));
            
            this.showNotification('Surprise supprimée avec succès', 'success');
            await this.loadUserSurprises();
            this.updateStats();
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }

    editSurprise(id) {
        // Stocker l'ID pour édition et rediriger
        localStorage.setItem('editSurpriseId', id);
        window.location.href = 'create.html?edit=' + id;
    }

    updateStats() {
        const totalSurprises = this.surprises.length;
        const totalViews = this.surprises.reduce((sum, s) => sum + (s.views || 0), 0);
        const completedViews = this.surprises.reduce((sum, s) => sum + (s.completedViews || 0), 0);
        const successRate = totalViews > 0 ? Math.round((completedViews / totalViews) * 100) + '%' : '0%';
        
        document.getElementById('totalSurprises').textContent = totalSurprises;
        document.getElementById('totalViews').textContent = totalViews;
        document.getElementById('successRate').textContent = successRate;
    }

    showTemplatesModal() {
        // Créer modal pour templates
        const modalHTML = `
            <div id="templatesModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Choisissez un template</h3>
                            <button id="closeTemplates" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            ${this.templates.map(template => `
                                <div class="border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition cursor-pointer" data-template-id="${template.id}">
                                    <div class="flex items-start mb-4">
                                        <div class="text-3xl mr-4">${template.icon}</div>
                                        <div>
                                            <h4 class="font-bold text-gray-800">${template.name}</h4>
                                            <p class="text-sm text-gray-600">${template.description}</p>
                                        </div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                                        <p class="text-sm text-gray-700"><strong>Question :</strong> ${template.question}</p>
                                    </div>
                                    <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition" data-use-template="${template.id}">
                                        <i class="fas fa-magic mr-2"></i>Utiliser ce template
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="text-center">
                            <button id="createCustom" class="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
                                <i class="fas fa-pen mr-2"></i>Créer personnalisé
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter modal au DOM
        if (!document.getElementById('templatesModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Événements
            document.getElementById('closeTemplates').addEventListener('click', () => {
                document.getElementById('templatesModal').classList.add('hidden');
            });
            
            document.getElementById('createCustom').addEventListener('click', () => {
                window.location.href = 'create.html';
            });
            
            // Utiliser template
            this.templates.forEach(template => {
                const btn = document.querySelector(`[data-use-template="${template.id}"]`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        this.useTemplate(template);
                    });
                }
            });
        }
    }

    useTemplate(template) {
        // Stocker template dans localStorage pour création
        localStorage.setItem('selectedTemplate', JSON.stringify(template));
        window.location.href = 'create.html?template=' + template.id;
        document.getElementById('templatesModal').classList.add('hidden');
    }

    bindEvents() {
        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erreur déconnexion:', error);
            }
        });

        // Bouton templates
        document.getElementById('templateBtn').addEventListener('click', () => {
            document.getElementById('templatesModal').classList.remove('hidden');
        });

        // Bouton stats
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.showStatsModal();
        });

        // Bouton histoire
        document.getElementById('storyBtn').addEventListener('click', () => {
            this.showStory();
        });

        // Bouton paramètres
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            e.preventDefault();
            alert('Page paramètres à venir');
        });

        // Bouton historique
        document.getElementById('historyBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAllSurprises();
        });

        // Voir tout
        document.getElementById('viewAllBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAllSurprises();
        });
    }

    showAllSurprises() {
        const modalHTML = `
            <div id="allSurprisesModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Toutes mes surprises (${this.surprises.length})</h3>
                            <button id="closeAllSurprises" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pour</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complétions</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${this.surprises.map(surprise => `
                                        <tr>
                                            <td class="px-4 py-3">${surprise.pourQui}</td>
                                            <td class="px-4 py-3">${new Date(surprise.createdAt).toLocaleDateString('fr-FR')}</td>
                                            <td class="px-4 py-3">${surprise.views || 0}</td>
                                            <td class="px-4 py-3">${surprise.completedViews || 0}</td>
                                            <td class="px-4 py-3">
                                                <a href="../LoveCraft/s/?id=${surprise.id}" target="_blank" class="text-blue-600 hover:text-blue-900 mr-3">
                                                    <i class="fas fa-external-link-alt"></i>
                                                </a>
                                                <button onclick="dashboard.deleteSurprise('${surprise.id}', '${surprise.pourQui}')" class="text-red-600 hover:text-red-900">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('allSurprisesModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.getElementById('closeAllSurprises').addEventListener('click', () => {
                document.getElementById('allSurprisesModal').classList.add('hidden');
            });
        }
        
        document.getElementById('allSurprisesModal').classList.remove('hidden');
    }

    showStatsModal() {
        const totalViews = this.surprises.reduce((sum, s) => sum + (s.views || 0), 0);
        const completedViews = this.surprises.reduce((sum, s) => sum + (s.completedViews || 0), 0);
        const conversionRate = totalViews > 0 ? ((completedViews / totalViews) * 100).toFixed(1) : 0;
        
        const modalHTML = `
            <div id="statsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Analytiques détaillés</h3>
                            <button id="closeStats" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div class="bg-blue-50 p-6 rounded-xl">
                                <div class="text-3xl font-bold text-blue-600 mb-2">${this.surprises.length}</div>
                                <div class="text-sm text-gray-600">Surprises créées</div>
                            </div>
                            <div class="bg-green-50 p-6 rounded-xl">
                                <div class="text-3xl font-bold text-green-600 mb-2">${totalViews}</div>
                                <div class="text-sm text-gray-600">Vues totales</div>
                            </div>
                            <div class="bg-purple-50 p-6 rounded-xl">
                                <div class="text-3xl font-bold text-purple-600 mb-2">${conversionRate}%</div>
                                <div class="text-sm text-gray-600">Taux de conversion</div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="font-bold text-gray-800 mb-4">Performance par surprise</h4>
                            <div class="space-y-4">
                                ${this.surprises.map(surprise => `
                                    <div class="flex items-center justify-between border-b pb-3">
                                        <div>
                                            <div class="font-medium">${surprise.pourQui}</div>
                                            <div class="text-sm text-gray-500">${new Date(surprise.createdAt).toLocaleDateString('fr-FR')}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-medium">${surprise.views || 0} vues</div>
                                            <div class="text-sm text-gray-500">${surprise.completedViews || 0} complétions</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('statsModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.getElementById('closeStats').addEventListener('click', () => {
                document.getElementById('statsModal').classList.add('hidden');
            });
        }
        
        document.getElementById('statsModal').classList.remove('hidden');
    }

    showStory() {
        const storyHTML = `
            <div id="storyModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">L'histoire de Max & Eve</h3>
                            <button id="closeStory" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="space-y-6">
                            <div class="flex items-start">
                                <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800">L'idée originale</h4>
                                    <p class="text-gray-600 mt-1">Max voulait surprendre Eve d'une manière unique. Il a créé un site avec un parcours en 3 étapes : identification, quiz, et message final.</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start">
                                <div class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mr-4">
                                    <i class="fas fa-laptop-code"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800">La création</h4>
                                    <p class="text-gray-600 mt-1">En une nuit, Max a codé la première version. Il a caché un QR Code sous l'oreiller d'Eve avec un mot mystérieux.</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start">
                                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                    <i class="fas fa-gift"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800">La surprise</h4>
                                    <p class="text-gray-600 mt-1">Quand Eve a scanné le QR Code, elle a découvert le parcours. À la fin, le message personnalisé l'a fait pleurer de joie.</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start">
                                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                                    <i class="fas fa-globe"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-800">LoveCraft est né</h4>
                                    <p class="text-gray-600 mt-1">Max s'est dit : "Ce truc pourrait marcher pour plein de gens !" LoveCraft est né pour aider tous les amoureux à créer des moments magiques.</p>
                                </div>
                            </div>
                            
                            <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mt-8">
                                <p class="text-center italic text-gray-700">
                                    "Eve a pleuré quand elle a vu le message. Maintenant, c'est à vous de créer des moments inoubliables."
                                </p>
                                <p class="text-center font-bold mt-2">— Max, fondateur de LoveCraft</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('storyModal')) {
            document.body.insertAdjacentHTML('beforeend', storyHTML);
            document.getElementById('closeStory').addEventListener('click', () => {
                document.getElementById('storyModal').classList.add('hidden');
            });
        }
        
        document.getElementById('storyModal').classList.remove('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3"></i>
                <div>${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Créer instance globale
const dashboard = new DashboardManager();

// Exposer au global pour les onclick
window.dashboard = dashboard;
