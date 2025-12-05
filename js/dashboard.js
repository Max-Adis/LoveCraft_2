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
        });
    }

    updateUserInfo() {
        const email = this.user.email;
        const displayName = this.user.displayName || email.split('@')[0];
        
        document.getElementById('userEmail').textContent = displayName;
        document.getElementById('userNameDisplay').textContent = displayName;
        document.getElementById('userEmailDisplay').textContent = email;
        document.getElementById('welcomeName').textContent = displayName;
        
        // Mettre à jour l'avatar si photo disponible
        if (this.user.photoURL) {
            const avatar = document.querySelector('#userMenu .rounded-full');
            avatar.innerHTML = `<img src="${this.user.photoURL}" class="w-full h-full object-cover">`;
            document.getElementById('userIcon').classList.add('hidden');
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
            this.showNotification('Erreur de chargement des surprises', 'error');
        }
    }

    displaySurprises() {
        const tbody = document.getElementById('surprisesTableBody');
        
        if (this.surprises.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-gift text-4xl mb-4 text-gray-300"></i>
                        <p>Aucune surprise créée pour le moment</p>
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
            <tr class="hover:bg-gray-50">
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
                    <div class="text-xs text-gray-500">${surprise.completedViews || 0} complétions</div>
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
        localStorage.setItem('editSurpriseId', id);
        window.location.href = 'create.html?edit=' + id;
    }

    updateStats() {
        const totalSurprises = this.surprises.length;
        const totalViews = this.surprises.reduce((sum, s) => sum + (s.views || 0), 0);
        const completedViews = this.surprises.reduce((sum, s) => sum + (s.completedViews || 0), 0);
        
        let successRate = '0%';
        let rate = 0;
        
        if (totalViews > 0) {
            rate = (completedViews / totalViews) * 100;
            successRate = Math.round(rate) + '%';
        }
        
        const rateElement = document.getElementById('successRate');
        rateElement.textContent = successRate;
        
        if (rate >= 80) {
            rateElement.className = 'text-3xl font-bold text-green-600';
        } else if (rate >= 50) {
            rateElement.className = 'text-3xl font-bold text-yellow-600';
        } else {
            rateElement.className = 'text-3xl font-bold text-red-600';
        }
        
        document.getElementById('totalSurprises').textContent = totalSurprises;
        document.getElementById('totalViews').textContent = totalViews;
        
        rateElement.title = `${completedViews} personnes sur ${totalViews} ont complété la surprise (${successRate})`;
    }

    bindEvents() {
        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erreur déconnexion:', error);
                this.showNotification('Erreur lors de la déconnexion', 'error');
            }
        });

        // Bouton templates
        document.getElementById('templateBtn').addEventListener('click', () => {
            this.showTemplatesModal();
        });

        // Bouton stats
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.showStatsModal();
        });

        // Voir tout
        document.getElementById('viewAllBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAllSurprises();
        });
    }

    // Modals
    showTemplatesModal() {
        const modalHTML = `
            <div id="templatesModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Choisissez un template</h3>
                            <button onclick="dashboard.closeModal('templatesModal')" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            ${this.templates.map(template => `
                                <div class="border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition cursor-pointer group">
                                    <div class="flex items-start mb-4">
                                        <div class="text-3xl mr-4 group-hover:scale-110 transition">${template.icon}</div>
                                        <div>
                                            <h4 class="font-bold text-gray-800">${template.name}</h4>
                                            <p class="text-sm text-gray-600">${template.description}</p>
                                        </div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                                        <p class="text-sm text-gray-700"><strong>Question :</strong> ${template.question}</p>
                                    </div>
                                    <button onclick="dashboard.useTemplate('${template.id}')" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                                        <i class="fas fa-magic mr-2"></i>Utiliser ce template
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="text-center">
                            <button onclick="window.location.href='create.html'" class="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
                                <i class="fas fa-pen mr-2"></i>Créer personnalisé
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal('templatesModal', modalHTML);
        document.getElementById('templatesModal').classList.remove('hidden');
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            localStorage.setItem('selectedTemplate', JSON.stringify(template));
            window.location.href = 'create.html?template=' + templateId;
        }
    }

    showStatsModal() {
        const totalViews = this.surprises.reduce((sum, s) => sum + (s.views || 0), 0);
        const completedViews = this.surprises.reduce((sum, s) => sum + (s.completedViews || 0), 0);
        const conversionRate = totalViews > 0 ? ((completedViews / totalViews) * 100).toFixed(1) : 0;
        
        const modalHTML = `
            <div id="statsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Analytiques détaillés</h3>
                            <button onclick="dashboard.closeModal('statsModal')" class="text-gray-400 hover:text-gray-600">
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
        
        this.createModal('statsModal', modalHTML);
        document.getElementById('statsModal').classList.remove('hidden');
    }

    showAllSurprises() {
        const modalHTML = `
            <div id="allSurprisesModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Toutes mes surprises (${this.surprises.length})</h3>
                            <button onclick="dashboard.closeModal('allSurprisesModal')" class="text-gray-400 hover:text-gray-600">
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
                                        <tr class="hover:bg-gray-50">
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
        
        this.createModal('allSurprisesModal', modalHTML);
        document.getElementById('allSurprisesModal').classList.remove('hidden');
    }

    showPremiumModal() {
        this.createModal('premiumModal', '');
        document.getElementById('premiumModal').classList.remove('hidden');
    }

    showContactModal() {
        this.createModal('contactModal', '');
        document.getElementById('contactModal').classList.remove('hidden');
    }

    showTermsModal() {
        const modalHTML = `
            <div id="termsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Conditions d'utilisation</h3>
                            <button onclick="dashboard.closeModal('termsModal')" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="prose max-w-none">
                            <h4>1. Acceptation des conditions</h4>
                            <p>En utilisant LoveCraft, vous acceptez ces conditions d'utilisation...</p>
                            <h4>2. Service fourni</h4>
                            <p>LoveCraft est une plateforme permettant de créer des surprises digitales personnalisées...</p>
                            <h4>3. Compte utilisateur</h4>
                            <p>Vous êtes responsable de la confidentialité de votre compte...</p>
                            <h4>4. Contenu</h4>
                            <p>Vous conservez les droits sur le contenu que vous créez...</p>
                            <h4>5. Limitations</h4>
                            <p>LoveCraft ne peut être tenu responsable de l'utilisation du service...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal('termsModal', modalHTML);
        document.getElementById('termsModal').classList.remove('hidden');
    }

    showPrivacyModal() {
        const modalHTML = `
            <div id="privacyModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Politique de confidentialité</h3>
                            <button onclick="dashboard.closeModal('privacyModal')" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="prose max-w-none">
                            <h4>Collecte des données</h4>
                            <p>Nous collectons uniquement les données nécessaires au fonctionnement du service...</p>
                            <h4>Utilisation des données</h4>
                            <p>Vos données sont utilisées pour personnaliser votre expérience...</p>
                            <h4>Protection des données</h4>
                            <p>Nous protégeons vos données avec les standards de sécurité les plus élevés...</p>
                            <h4>Vos droits</h4>
                            <p>Vous pouvez à tout moment accéder, modifier ou supprimer vos données...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal('privacyModal', modalHTML);
        document.getElementById('privacyModal').classList.remove('hidden');
    }

    showCookiesModal() {
        const modalHTML = `
            <div id="cookiesModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Politique des cookies</h3>
                            <button onclick="dashboard.closeModal('cookiesModal')" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="prose max-w-none">
                            <p>Nous utilisons des cookies pour améliorer votre expérience sur LoveCraft...</p>
                            <h4>Cookies essentiels</h4>
                            <p>Nécessaires au fonctionnement du site...</p>
                            <h4>Cookies analytiques</h4>
                            <p>Nous aident à comprendre comment vous utilisez le site...</p>
                            <h4>Gestion des cookies</h4>
                            <p>Vous pouvez gérer vos préférences dans les paramètres...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal('cookiesModal', modalHTML);
        document.getElementById('cookiesModal').classList.remove('hidden');
    }

    showSupportModal() {
        const modalHTML = `
            <div id="supportModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Support LoveCraft</h3>
                            <button onclick="dashboard.closeModal('supportModal')" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            <p>Besoin d'aide ? Voici comment nous pouvons vous aider :</p>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-bold mb-2">📧 Contact direct</h4>
                                <p class="text-sm">Email : support@lovecraft.com</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-bold mb-2">📖 Centre d'aide</h4>
                                <p class="text-sm">Consultez notre FAQ et tutoriels</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-bold mb-2">💬 Chat en direct</h4>
                                <p class="text-sm">Disponible du lundi au vendredi, 9h-18h</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal('supportModal', modalHTML);
        document.getElementById('supportModal').classList.remove('hidden');
    }

    showBugModal() {
        const modalHTML = `
            <div id="bugModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold text-gray-800">Signaler un problème</h3>
                            <button onclick="dashboard.closeModal('bugModal')" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <form id="bugForm" action="https://formspree.io/f/mgvgzykk" method="POST">
                            <input type="hidden" name="type" value="bug">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Description du problème</label>
                                    <textarea name="message" rows="4" required class="w-full px-4 py-2 border rounded-lg" placeholder="Décrivez le problème rencontré..."></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Page concernée</label>
                                    <input type="text" name="page" class="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Dashboard, Création...">
                                </div>
                                <button type="submit" class="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700">
                                    <i class="fas fa-bug mr-2"></i>Signaler le problème
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal('bugModal', modalHTML);
        document.getElementById('bugModal').classList.remove('hidden');
    }

    createModal(id, content) {
        if (!document.getElementById(id)) {
            const modal = document.createElement('div');
            modal.id = id;
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50 overflow-y-auto';
            modal.innerHTML = content;
            document.body.appendChild(modal);
            
            // Fermer en cliquant en dehors
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(id);
                }
            });
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
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
