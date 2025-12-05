renderStep() {
    if (this.step === 1) {
        return `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Personnalisez votre surprise</h2>
            
            <div class="space-y-8">
                <!-- Section Destinataire -->
                <div class="bg-blue-50 p-6 rounded-xl">
                    <h3 class="text-lg font-semibold text-blue-800 mb-4">
                        <i class="fas fa-user-check mr-2"></i>Pour qui ?
                    </h3>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Nom de la personne *
                            </label>
                            <input 
                                id="pourQui" 
                                type="text" 
                                value="${this.surprise.pourQui}"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 placeholder-gray-500"
                                placeholder="Ex: Eve"
                                required
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Votre nom *
                            </label>
                            <input 
                                id="deLaPartDe" 
                                type="text" 
                                value="${this.surprise.deLaPartDe}"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 placeholder-gray-500"
                                placeholder="Ex: Max"
                                required
                            />
                            <p class="text-sm text-gray-500 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>
                                Ce nom sera affiché comme expéditeur
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Section Quiz -->
                <div class="bg-yellow-50 p-6 rounded-xl">
                    <h3 class="text-lg font-semibold text-yellow-800 mb-4">
                        <i class="fas fa-question-circle mr-2"></i>Question personnalisée
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Question à poser
                            </label>
                            <input 
                                id="question1" 
                                type="text" 
                                value="${this.surprise.question1}"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-gray-800 placeholder-gray-500"
                                placeholder="Ex: Qui t'aime plus que tout ?"
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Réponse attendue
                            </label>
                            <input 
                                id="reponse1" 
                                type="text" 
                                value="${this.surprise.reponse1}"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-gray-800 placeholder-gray-500"
                                placeholder="Ex: Max (sera utilisé comme indice)"
                            />
                            <p class="text-sm text-gray-500 mt-2">
                                <i class="fas fa-info-circle mr-1"></i>
                                Cette réponse servira d'indice si la personne se trompe
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Section Message -->
                <div class="bg-pink-50 p-6 rounded-xl">
                    <h3 class="text-lg font-semibold text-pink-800 mb-4">
                        <i class="fas fa-heart mr-2"></i>Message final
                    </h3>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Votre message d'amour
                        </label>
                        <textarea 
                            id="messageFinal"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition h-40 text-gray-800 placeholder-gray-500"
                            placeholder="Écrivez votre message le plus touchant..."
                        >${this.surprise.messageFinal}</textarea>
                        <div class="flex justify-between items-center mt-2">
                            <p class="text-sm text-gray-500">
                                <i class="fas fa-lightbulb mr-1"></i>
                                Ce message sera révélé à la fin de la surprise
                            </p>
                            <span id="charCount" class="text-sm ${this.surprise.messageFinal.length > 500 ? 'text-red-500' : 'text-gray-500'}">
                                ${this.surprise.messageFinal.length}/500
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Section Thème -->
                <div class="bg-purple-50 p-6 rounded-xl">
                    <h3 class="text-lg font-semibold text-purple-800 mb-4">
                        <i class="fas fa-palette mr-2"></i>Choisissez un thème
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button data-theme="romantique" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'romantique' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'} hover:border-pink-300 transition text-center">
                            <div class="text-2xl mb-2">❤️</div>
                            <span class="font-medium">Romantique</span>
                        </button>
                        <button data-theme="geek" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'geek' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:border-blue-300 transition text-center">
                            <div class="text-2xl mb-2">👨‍💻</div>
                            <span class="font-medium">Geek</span>
                        </button>
                        <button data-theme="fun" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'fun' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white'} hover:border-yellow-300 transition text-center">
                            <div class="text-2xl mb-2">😄</div>
                            <span class="font-medium">Fun</span>
                        </button>
                        <button data-theme="classique" class="theme-btn p-4 rounded-lg border-2 ${this.surprise.theme === 'classique' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white'} hover:border-gray-300 transition text-center">
                            <div class="text-2xl mb-2">🎩</div>
                            <span class="font-medium">Classique</span>
                        </button>
                    </div>
                </div>

                <!-- Bouton de création -->
                <div class="pt-6 border-t border-gray-200">
                    <button id="createBtn" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition transform hover:-translate-y-1 shadow-lg">
                        <i class="fas fa-${this.editMode ? 'save' : 'sparkles'} mr-2"></i>
                        ${this.editMode ? 'Mettre à jour la surprise' : 'Créer ma surprise'}
                    </button>
                    ${this.editMode ? `
                        <div class="mt-4 text-center">
                            <button id="deleteBtn" class="text-red-600 hover:text-red-700 text-sm">
                                <i class="fas fa-trash mr-1"></i>Supprimer cette surprise
                            </button>
                        </div>
                    ` : ''}
                    <p class="text-center text-sm text-gray-500 mt-4">
                        <i class="fas fa-shield-alt mr-1"></i>
                        Votre surprise sera sauvegardée dans votre espace personnel
                    </p>
                </div>
            </div>
        `;
    }
    
    if (this.step === 2) {
        return `
            <div class="text-center">
                <div class="text-5xl mb-6 animate-bounce">🎉</div>
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    ${this.editMode ? 'Surprise mise à jour !' : 'Félicitations !'}
                </h2>
                <p class="text-gray-600 mb-8">
                    Votre surprise "<span class="font-semibold">${this.surprise.pourQui}</span>" a été ${this.editMode ? 'mise à jour' : 'créée'} avec succès.
                </p>
                
                <!-- QR Code -->
                <div class="mb-8">
                    <div class="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl inline-block">
                        <div id="qrContainer" class="bg-white p-6 rounded-xl shadow-md">
                            <div id="qrCode" class="mb-4 min-h-[200px] flex items-center justify-center"></div>
                            <p class="text-sm text-gray-600 font-medium">
                                <i class="fas fa-qrcode mr-2"></i>
                                Scannez-moi pour découvrir la surprise
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Lien de partage -->
                <div class="bg-gray-50 p-6 rounded-xl mb-8">
                    <h3 class="font-bold text-gray-800 mb-3">
                        <i class="fas fa-link mr-2"></i>Lien de partage
                    </h3>
                    <div class="flex flex-col md:flex-row gap-2 items-center">
                        <input 
                            type="text" 
                            id="surpriseUrl" 
                            value="${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}"
                            readonly
                            class="flex-grow px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm"
                        />
                        <button id="copyLinkBtn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                            <i class="fas fa-copy mr-2"></i>Copier
                        </button>
                    </div>
                    <p class="text-sm text-gray-500 mt-3">
                        <i class="fas fa-info-circle mr-1"></i>
                        Partagez ce lien directement ou utilisez le QR Code
                    </p>
                </div>
                
                <!-- Boutons d'actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button id="downloadPNG" class="p-4 bg-white border-2 border-pink-200 rounded-xl hover:border-pink-400 transition flex flex-col items-center justify-center">
                        <div class="text-3xl text-pink-600 mb-2">
                            <i class="fas fa-file-image"></i>
                        </div>
                        <span class="font-medium">Télécharger PNG</span>
                        <span class="text-xs text-gray-500 mt-1">QR Code seul</span>
                    </button>
                    
                    <button id="downloadPDF" class="p-4 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 transition flex flex-col items-center justify-center">
                        <div class="text-3xl text-purple-600 mb-2">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <span class="font-medium">Télécharger PDF</span>
                        <span class="text-xs text-gray-500 mt-1">Avec instructions</span>
                    </button>
                    
                    <a href="dashboard.html" class="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition flex flex-col items-center justify-center">
                        <div class="text-3xl mb-2">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <span class="font-medium">Dashboard</span>
                        <span class="text-xs text-white/80 mt-1">Voir toutes mes surprises</span>
                    </a>
                </div>
                
                <!-- Conseils -->
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 class="font-bold text-green-800 mb-3">
                        <i class="fas fa-lightbulb mr-2"></i>Idées pour votre surprise
                    </h3>
                    <ul class="text-left text-gray-700 space-y-2">
                        <li class="flex items-start">
                            <i class="fas fa-print text-green-600 mt-1 mr-2"></i>
                            <span>Imprimez le QR Code et cachez-le sous un oreiller</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-mobile-alt text-green-600 mt-1 mr-2"></i>
                            <span>Envoyez le lien par message avec un petit indice</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-utensils text-green-600 mt-1 mr-2"></i>
                            <span>Glissez le QR Code dans un livre ou sur le frigo</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-gift text-green-600 mt-1 mr-2"></i>
                            <span>Accompagnez-le d'un petit cadeau physique</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }
}
