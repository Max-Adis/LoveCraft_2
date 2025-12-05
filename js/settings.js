import { auth, database, ref, get, update, remove, signOut, onAuthStateChanged } from './firebase.js';

class SettingsManager {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            
            this.user = user;
            await this.loadSettings();
            this.render();
            this.bindEvents();
        });
    }

    async loadSettings() {
        try {
            const settingsRef = ref(database, `users/${this.user.uid}/settings`);
            const snapshot = await get(settingsRef);
            
            if (snapshot.exists()) {
                this.settings = snapshot.val();
            } else {
                this.settings = {
                    notifications: true,
                    publicSurprises: false,
                    analytics: true,
                    newsletter: false
                };
            }
        } catch (error) {
            console.error('Erreur chargement settings:', error);
            this.settings = {
                notifications: true,
                publicSurprises: false,
                analytics: true,
                newsletter: false
            };
        }
    }

    async saveSettings() {
        try {
            await update(ref(database, `users/${this.user.uid}/settings`), this.settings);
            this.showNotification('Paramètres sauvegardés avec succès', 'success');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    render() {
        const app = document.getElementById('settingsApp');
        
        app.innerHTML = `
            <div class="space-y-8">
                <!-- 1. PROFIL UTILISATEUR -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-user-circle mr-2"></i>Profil
                    </h2>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <div class="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mr-6 overflow-hidden">
                                ${this.user.photoURL ? 
                                    `<img src="${this.user.photoURL}" class="w-full h-full object-cover">` :
                                    `<i class="fas fa-user text-purple-600 text-3xl"></i>`
                                }
                            </div>
                            <div>
                                <h3 class="font-bold text-lg">${this.user.displayName || 'Non défini'}</h3>
                                <p class="text-gray-600">${this.user.email}</p>
                                <button id="changePhoto" class="mt-2 text-purple-600 hover:text-purple-700 text-sm">
                                    <i class="fas fa-edit mr-1"></i>Modifier la photo
                                </button>
                            </div>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nom d'affichage
                                </label>
                                <input type="text" id="displayName" value="${this.user.displayName || ''}" 
                                       class="w-full px-4 py-2 border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input type="email" value="${this.user.email}" disabled
                                       class="w-full px-4 py-2 border rounded-lg bg-gray-50">
                            </div>
                        </div>
                        
                        <button id="saveProfile" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            <i class="fas fa-save mr-2"></i>Enregistrer le profil
                        </button>
                    </div>
                </div>
                
                <!-- 2. NOTIFICATIONS -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-bell mr-2"></i>Notifications
                    </h2>
                    <div class="space-y-3">
                        <label class="flex items-center">
                            <input type="checkbox" id="notifViews" class="rounded text-purple-600" ${this.settings.notifications ? 'checked' : ''}>
                            <span class="ml-3">Quand quelqu'un voit ma surprise</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="notifCompleted" class="rounded text-purple-600" ${this.settings.notifications ? 'checked' : ''}>
                            <span class="ml-3">Quand quelqu'un finit le parcours</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="newsletter" class="rounded text-purple-600" ${this.settings.newsletter ? 'checked' : ''}>
                            <span class="ml-3">Newsletter LoveCraft (conseils, idées)</span>
                        </label>
                    </div>
                </div>
                
                <!-- 3. CONFIDENTIALITÉ -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-shield-alt mr-2"></i>Confidentialité
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <label class="flex items-center justify-between">
                                <span class="font-medium">Surprises publiques</span>
                                <select id="privacySetting" class="border rounded-lg px-3 py-1">
                                    <option value="private" ${!this.settings.publicSurprises ? 'selected' : ''}>Privé (seulement avec le lien)</option>
                                    <option value="public" ${this.settings.publicSurprises ? 'selected' : ''}>Public (dans la galerie)</option>
                                </select>
                            </label>
                            <p class="text-sm text-gray-500 mt-1">
                                Les surprises publiques apparaissent dans la galerie LoveCraft
                            </p>
                        </div>
                        
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" id="analytics" class="rounded text-purple-600" ${this.settings.analytics ? 'checked' : ''}>
                                <span class="ml-3">Autoriser les statistiques anonymes</span>
                            </label>
                            <p class="text-sm text-gray-500 ml-7">
                                Aide à améliorer LoveCraft pour tous
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- 4. DONNÉES -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-database mr-2"></i>Gestion des données
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-medium mb-2">Exporter mes données</h3>
                            <button id="exportData" class="text-blue-600 hover:text-blue-700 text-sm">
                                <i class="fas fa-file-export mr-1"></i>
                                Télécharger toutes mes données
                            </button>
                            <p class="text-sm text-gray-500 mt-1">
                                Recevez un fichier JSON avec toutes vos surprises
                            </p>
                        </div>
                        
                        <div class="pt-4 border-t">
                            <h3 class="font-medium mb-2 text-red-600">Zone de danger</h3>
                            <button id="deleteAllData" class="text-red-600 hover:text-red-700 text-sm mr-4">
                                <i class="fas fa-trash-alt mr-1"></i>
                                Supprimer toutes mes données
                            </button>
                            <button id="deleteAccount" class="text-red-600 hover:text-red-700 text-sm">
                                <i class="fas fa-user-slash mr-1"></i>
                                Supprimer mon compte
                            </button>
                            <p class="text-sm text-gray-500 mt-1">
                                Ces actions sont irréversibles
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- 5. SAUVEGARDE -->
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-xl font-bold mb-2">
                                <i class="fas fa-save mr-2"></i>Sauvegarder tous les paramètres
                            </h3>
                            <p>Appliquez toutes vos modifications en un clic</p>
                        </div>
                        <button id="saveAll" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100">
                            <i class="fas fa-check mr-2"></i>Sauvegarder tout
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Sauvegarder profil
        document.getElementById('saveProfile').addEventListener('click', async () => {
            const displayName = document.getElementById('displayName').value;
            
            try {
                await update(auth.currentUser, { displayName });
                this.showNotification('Profil mis à jour avec succès', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                console.error('Erreur mise à jour profil:', error);
                this.showNotification('Erreur lors de la mise à jour', 'error');
            }
        });

        // Sauvegarder tous les paramètres
        document.getElementById('saveAll').addEventListener('click', () => {
            this.updateSettingsFromUI();
            this.saveSettings();
        });

        // Exporter données
        document.getElementById('exportData').addEventListener('click', async () => {
            try {
                const surprisesRef = ref(database, 'surprises');
                const snapshot = await get(surprisesRef);
                
                let userSurprises = [];
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    Object.keys(data).forEach(key => {
                        if (data[key].userId === this.user.uid) {
                            userSurprises.push({
                                id: key,
                                ...data[key]
                            });
                        }
                    });
                }
                
                const exportData = {
                    user: {
                        uid: this.user.uid,
                        email: this.user.email,
                        displayName: this.user.displayName,
                        photoURL: this.user.photoURL
                    },
                    settings: this.settings,
                    surprises: userSurprises,
                    exportedAt: new Date().toISOString()
                };
                
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `lovecraft_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Données exportées avec succès', 'success');
            } catch (error) {
                console.error('Erreur export:', error);
                this.showNotification('Erreur lors de l\'export', 'error');
            }
        });

        // Supprimer données
        document.getElementById('deleteAllData').addEventListener('click', async () => {
            if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible.')) {
                return;
            }
            
            try {
                const surprisesRef = ref(database, 'surprises');
                const snapshot = await get(surprisesRef);
                
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const deletePromises = [];
                    
                    Object.keys(data).forEach(key => {
                        if (data[key].userId === this.user.uid) {
                            deletePromises.push(remove(ref(database, `surprises/${key}`)));
                        }
                    });
                    
                    await Promise.all(deletePromises);
                }
                
                // Supprimer settings utilisateur
                await remove(ref(database, `users/${this.user.uid}`));
                
                this.showNotification('Toutes vos données ont été supprimées', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 2000);
            } catch (error) {
                console.error('Erreur suppression:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        });

        // Supprimer compte
        document.getElementById('deleteAccount').addEventListener('click', async () => {
            if (!confirm('Supprimer définitivement votre compte ? Toutes vos données seront perdues.')) {
                return;
            }
            
            try {
                // D'abord supprimer les données
                await document.getElementById('deleteAllData').click();
                
                // Puis supprimer le compte auth
                await this.user.delete();
                
                this.showNotification('Compte supprimé avec succès', 'success');
                setTimeout(() => window.location.href = 'index.html', 2000);
            } catch (error) {
                console.error('Erreur suppression compte:', error);
                this.showNotification('Erreur lors de la suppression du compte', 'error');
            }
        });

        // Déconnexion (si tu veux l'ajouter)
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erreur déconnexion:', error);
            }
        });
    }

    updateSettingsFromUI() {
        this.settings = {
            notifications: document.getElementById('notifViews').checked,
            publicSurprises: document.getElementById('privacySetting').value === 'public',
            analytics: document.getElementById('analytics').checked,
            newsletter: document.getElementById('newsletter').checked
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
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
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

new SettingsManager();
