import { auth, database, storage, ref, get, update, remove, signOut, onAuthStateChanged, storageRef, uploadBytes, getDownloadURL, updateProfile } from './firebase.js';

class SettingsManager {
    constructor() {
        this.user = null;
        this.settings = {};
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
            // Charger les paramètres utilisateur
            const settingsRef = ref(database, `users/${this.user.uid}/settings`);
            const snapshot = await get(settingsRef);
            
            if (snapshot.exists()) {
                this.settings = snapshot.val();
            } else {
                // Paramètres par défaut
                this.settings = {
                    notifications: true,
                    publicSurprises: false,
                    analytics: true,
                    newsletter: false,
                    language: 'fr',
                    theme: 'light'
                };
            }
        } catch (error) {
            console.error('Erreur chargement settings:', error);
            this.settings = {
                notifications: true,
                publicSurprises: false,
                analytics: true,
                newsletter: false,
                language: 'fr',
                theme: 'light'
            };
        }
    }

    async saveSettings() {
        try {
            await update(ref(database, `users/${this.user.uid}/settings`), this.settings);
            this.showNotification('Paramètres sauvegardés', 'success');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    async uploadProfilePicture(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showNotification('Veuillez sélectionner une image', 'error');
            return null;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB max
            this.showNotification('Image trop volumineuse (max 5MB)', 'error');
            return null;
        }
        
        try {
            const fileRef = storageRef(storage, `profile_pictures/${this.user.uid}_${Date.now()}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Mettre à jour le profil Firebase Auth
            await updateProfile(this.user, { photoURL: downloadURL });
            
            // Mettre à jour dans la database
            await update(ref(database, `users/${this.user.uid}`), {
                photoURL: downloadURL,
                updatedAt: new Date().toISOString()
            });
            
            this.showNotification('Photo de profil mise à jour', 'success');
            return downloadURL;
        } catch (error) {
            console.error('Erreur upload photo:', error);
            this.showNotification('Erreur lors du téléchargement', 'error');
            return null;
        }
    }

    async updateDisplayName(newName) {
        if (!newName.trim()) {
            this.showNotification('Le nom ne peut pas être vide', 'error');
            return false;
        }
        
        try {
            await updateProfile(this.user, { displayName: newName.trim() });
            
            // Mettre à jour dans la database
            await update(ref(database, `users/${this.user.uid}`), {
                displayName: newName.trim(),
                updatedAt: new Date().toISOString()
            });
            
            this.showNotification('Nom mis à jour', 'success');
            return true;
        } catch (error) {
            console.error('Erreur mise à jour nom:', error);
            this.showNotification('Erreur lors de la mise à jour', 'error');
            return false;
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
                        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div class="relative">
                                <div class="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    ${this.user.photoURL ? 
                                        `<img src="${this.user.photoURL}" id="profileImage" class="w-full h-full object-cover">` :
                                        `<i class="fas fa-user text-purple-600 text-5xl"></i>`
                                    }
                                </div>
                                <label for="profileUpload" class="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                                    <i class="fas fa-camera"></i>
                                    <input type="file" id="profileUpload" accept="image/*" class="hidden">
                                </label>
                            </div>
                            <div class="flex-grow">
                                <div class="mb-6">
                                    <h3 class="font-bold text-lg">${this.user.displayName || 'Non défini'}</h3>
                                    <p class="text-gray-600">${this.user.email}</p>
                                    <p class="text-sm text-gray-500 mt-1">
                                        Membre depuis ${new Date(this.user.metadata.creationTime).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                
                                <div class="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Nom d'affichage
                                        </label>
                                        <div class="flex gap-2">
                                            <input type="text" id="displayName" value="${this.user.displayName || ''}" 
                                                   class="flex-grow px-4 py-2 border rounded-lg">
                                            <button id="saveNameBtn" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                                                <i class="fas fa-save"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input type="email" value="${this.user.email}" disabled
                                               class="w-full px-4 py-2 border rounded-lg bg-gray-50">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 2. PRÉFÉRENCES -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-sliders-h mr-2"></i>Préférences
                    </h2>
                    <div class="space-y-6">
                        <div>
                            <h3 class="font-medium text-gray-700 mb-3">Langue</h3>
                            <select id="languageSelect" class="w-full md:w-64 px-4 py-2 border rounded-lg">
                                <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
                                <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                        
                        <div>
                            <h3 class="font-medium text-gray-700 mb-3">Notifications</h3>
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
                                    <span class="ml-3">Newsletter LoveCraft</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-medium text-gray-700 mb-3">Confidentialité</h3>
                            <div class="space-y-3">
                                <label class="flex items-center justify-between">
                                    <span>Surprises publiques</span>
                                    <select id="privacySetting" class="border rounded-lg px-3 py-1">
                                        <option value="private" ${!this.settings.publicSurprises ? 'selected' : ''}>Privé</option>
                                        <option value="public" ${this.settings.publicSurprises ? 'selected' : ''}>Public</option>
                                    </select>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="analytics" class="rounded text-purple-600" ${this.settings.analytics ? 'checked' : ''}>
                                    <span class="ml-3">Analytiques anonymes</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 3. DONNÉES -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-database mr-2"></i>Gestion des données
                    </h2>
                    <div class="space-y-6">
                        <div>
                            <h3 class="font-medium text-gray-700 mb-3">Exporter mes données</h3>
                            <button id="exportData" class="text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                                <i class="fas fa-file-export mr-2"></i>
                                Télécharger toutes mes données
                            </button>
                            <p class="text-sm text-gray-500 mt-2">
                                Recevez un fichier JSON avec toutes vos surprises et paramètres
                            </p>
                        </div>
                        
                        <div class="pt-6 border-t">
                            <h3 class="font-medium text-gray-700 mb-3 text-red-600">Zone de danger</h3>
                            <div class="space-y-4">
                                <div>
                                    <button id="deleteAllData" class="text-red-600 hover:text-red-700 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition mr-4">
                                        <i class="fas fa-trash-alt mr-2"></i>
                                        Supprimer toutes mes données
                                    </button>
                                    <button id="deleteAccount" class="text-red-600 hover:text-red-700 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">
                                        <i class="fas fa-user-slash mr-2"></i>
                                        Supprimer mon compte
                                    </button>
                                </div>
                                <p class="text-sm text-gray-500">
                                    <i class="fas fa-exclamation-triangle mr-1"></i>
                                    Ces actions sont irréversibles. Toutes vos données seront définitivement supprimées.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 4. SAUVEGARDE -->
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 class="text-xl font-bold mb-2">
                                <i class="fas fa-save mr-2"></i>Sauvegarder tous les paramètres
                            </h3>
                            <p>Appliquez toutes vos modifications en un clic</p>
                        </div>
                        <div class="flex gap-4">
                            <button id="saveAll" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                                <i class="fas fa-check mr-2"></i>Sauvegarder
                            </button>
                            <button id="logoutBtn" class="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition">
                                <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Upload photo
        document.getElementById('profileUpload').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const btn = e.target;
                btn.disabled = true;
                
                const url = await this.uploadProfilePicture(file);
                if (url) {
                    document.getElementById('profileImage').src = url;
                    if (!document.getElementById('profileImage').src) {
                        const img = document.createElement('img');
                        img.id = 'profileImage';
                        img.className = 'w-full h-full object-cover';
                        img.src = url;
                        document.querySelector('.rounded-full .fa-user').replaceWith(img);
                    }
                }
                
                btn.disabled = false;
            }
        });

        // Mettre à jour le nom
        document.getElementById('saveNameBtn').addEventListener('click', async () => {
            const newName = document.getElementById('displayName').value;
            const success = await this.updateDisplayName(newName);
            if (success) {
                document.querySelector('h3').textContent = newName || 'Non défini';
            }
        });

        // Sauvegarder tous
        document.getElementById('saveAll').addEventListener('click', () => {
            this.updateSettingsFromUI();
            this.saveSettings();
        });

        // Exporter données
        document.getElementById('exportData').addEventListener('click', async () => {
            await this.exportUserData();
        });

        // Supprimer données
        document.getElementById('deleteAllData').addEventListener('click', async () => {
            if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible.')) {
                return;
            }
            
            await this.deleteAllUserData();
        });

        // Supprimer compte
        document.getElementById('deleteAccount').addEventListener('click', async () => {
            if (!confirm('Supprimer définitivement votre compte ? Toutes vos données seront perdues.')) {
                return;
            }
            
            await this.deleteUserAccount();
        });

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
    }

    updateSettingsFromUI() {
        this.settings = {
            notifications: document.getElementById('notifViews').checked,
            publicSurprises: document.getElementById('privacySetting').value === 'public',
            analytics: document.getElementById('analytics').checked,
            newsletter: document.getElementById('newsletter').checked,
            language: document.getElementById('languageSelect').value,
            theme: 'light'
        };
    }

    async exportUserData() {
        try {
            const promises = [
                // Récupérer toutes les surprises
                get(ref(database, 'surprises')).then(snapshot => {
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
                    return userSurprises;
                }),
                
                // Récupérer les stats utilisateur
                get(ref(database, `users/${this.user.uid}/stats`)).then(snapshot => {
                    return snapshot.exists() ? snapshot.val() : {};
                })
            ];
            
            const [surprises, stats] = await Promise.all(promises);
            
            const exportData = {
                user: {
                    uid: this.user.uid,
                    email: this.user.email,
                    displayName: this.user.displayName,
                    photoURL: this.user.photoURL,
                    createdAt: this.user.metadata.creationTime,
                    lastLogin: this.user.metadata.lastSignInTime
                },
                settings: this.settings,
                surprises: surprises,
                stats: stats,
                exportedAt: new Date().toISOString(),
                totalSurprises: surprises.length,
                totalViews: surprises.reduce((sum, s) => sum + (s.views || 0), 0),
                totalCompletions: surprises.reduce((sum, s) => sum + (s.completedViews || 0), 0)
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
    }

    async deleteAllUserData() {
        try {
            // Récupérer toutes les surprises de l'utilisateur
            const surprisesRef = ref(database, 'surprises');
            const snapshot = await get(surprisesRef);
            
            let deletePromises = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    if (data[key].userId === this.user.uid) {
                        deletePromises.push(remove(ref(database, `surprises/${key}`)));
                    }
                });
            }
            
            // Supprimer les données utilisateur
            deletePromises.push(remove(ref(database, `users/${this.user.uid}`)));
            
            await Promise.all(deletePromises);
            
            this.showNotification('Toutes vos données ont été supprimées', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }

    async deleteUserAccount() {
        try {
            // D'abord supprimer les données
            await this.deleteAllUserData();
            
            // Puis supprimer le compte auth
            await this.user.delete();
            
            this.showNotification('Compte supprimé avec succès', 'success');
            setTimeout(() => window.location.href = 'index.html', 2000);
        } catch (error) {
            console.error('Erreur suppression compte:', error);
            this.showNotification('Erreur lors de la suppression du compte', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-transform ${
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

new SettingsManager();
