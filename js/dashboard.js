import { 
    auth, database, ref, get, query, orderByChild, equalTo,
    onAuthStateChanged, signOut
} from './firebase.js';

class DashboardManager {
    constructor() {
        this.user = null;
        this.surprises = [];
        this.init();
    }

    async init() {
        // Vérifier l'authentification
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
        
        // Mettre à jour l'avatar si disponible
        if (this.user.photoURL) {
            const avatar = document.querySelector('#userMenu .rounded-full');
            avatar.innerHTML = `<img src="${this.user.photoURL}" class="w-full h-full rounded-full">`;
        }
    }

    async loadUserSurprises() {
        try {
            // Chercher les surprises de cet utilisateur
            const userId = this.user.uid;
            const surprisesRef = ref(database, 'surprises');
            
            // Note: Dans Realtime Database, on doit filtrer côté client
            // ou structurer les données par utilisateur
            const snapshot = await get(surprisesRef);
            
            this.surprises = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    const surprise = data[key];
                    // Associer l'ID utilisateur si tu veux filtrer par user
                    // Pour l'instant, on montre toutes les surprises
                    this.surprises.push({
                        id: key,
                        ...surprise
                    });
                });
            }
            
            this.displaySurprises();
        } catch (error) {
            console.error('Erreur chargement surprises:', error);
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
        
        // Trier par date (les plus récentes d'abord)
        this.surprises.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Afficher les 5 dernières
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
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="../LoveCraft/s/?id=${surprise.id}" target="_blank" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button onclick="editSurprise('${surprise.id}')" class="text-purple-600 hover:text-purple-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSurprise('${surprise.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const totalSurprises = this.surprises.length;
        const totalViews = this.surprises.reduce((sum, s) => sum + (s.views || 0), 0);
        const successRate = totalSurprises > 0 ? '100%' : '0%'; // Simplifié
        
        document.getElementById('totalSurprises').textContent = totalSurprises;
        document.getElementById('totalViews').textContent = totalViews;
        document.getElementById('successRate').textContent = successRate;
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
    }
}

// Fonctions globales
window.editSurprise = function(id) {
    // À implémenter - rediriger vers l'éditeur avec l'ID
    alert('Édition de la surprise ' + id);
};

window.deleteSurprise = function(id) {
    if (confirm('Supprimer cette surprise ?')) {
        // À implémenter - suppression Firebase
        alert('Suppression de ' + id);
    }
};

window.importTemplate = function() {
    alert('Fonctionnalité à venir : import de templates');
};

window.showStats = function() {
    alert('Analytiques détaillés à venir');
};

window.showTutorial = function() {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank'); // Exemple
};

// Initialiser le dashboard
new DashboardManager();
