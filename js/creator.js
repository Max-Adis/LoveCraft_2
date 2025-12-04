import { db, collection, addDoc } from './firebase.js';

class SurpriseCreator {
    constructor() {
        this.step = 1;
        this.surprise = {
            pourQui: '',
            deLaPartDe: '',
            question1: 'Qui t\'aime plus que tout au monde ?',
            reponse1: '',
            messageFinal: 'Je t\'aime plus que tout au monde...',
            theme: 'romantique',
            createdAt: new Date().toISOString()
        };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <header class="text-center mb-8">
                    <h1 class="text-4xl md:text-5xl font-bold text-pink-600 mb-4">
                        ❤️ LoveCraft
                    </h1>
                    <p class="text-lg text-gray-600">
                        Crée une surprise digitale unique, comme Max pour Tryphène
                    </p>
                </header>

                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    ${this.renderStep()}
                </div>

                <div class="mt-8 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl p-6 text-center">
                    <p class="text-xl italic">"Tryphène a pleuré de joie quand elle a découvert ma surprise."</p>
                    <p class="mt-2 font-semibold">— Max, créateur</p>
                </div>
            </div>
        `;
    }

    renderStep() {
        if (this.step === 1) {
            return `
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Crée ta surprise</h2>
                
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Pour qui ? *
                        </label>
                        <input 
                            id="pourQui" 
                            type="text" 
                            value="${this.surprise.pourQui}"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            placeholder="Ex: Tryphène"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            De la part de ? *
                        </label>
                        <input 
                            id="deLaPartDe" 
                            type="text" 
                            value="${this.surprise.deLaPartDe}"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            placeholder="Ex: Max"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Message final
                        </label>
                        <textarea 
                            id="messageFinal"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-32"
                            placeholder="Ton message d'amour..."
                        >${this.surprise.messageFinal}</textarea>
                    </div>
                    
                    <button id="nextBtn" class="w-full py-4 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition">
                        Continuer
                    </button>
                </div>
            `;
        }
        
        if (this.step === 2) {
            return `
                <div class="text-center">
                    <div class="text-5xl mb-6">🎉</div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Ta surprise est prête !</h2>
                    
                    <div id="qrContainer" class="bg-gray-50 p-4 rounded-lg inline-block mb-6">
                        <div id="qrCode"></div>
                        <p class="text-sm text-gray-500 mt-2">Scannez ce QR Code</p>
                    </div>
                    
                    <div class="space-y-4 mb-6">
                        <a id="surpriseLink" href="#" target="_blank" class="block text-blue-600 underline break-all"></a>
                        <p class="text-gray-600">Partage ce lien avec la personne !</p>
                    </div>
                    
                    <div class="flex flex-col md:flex-row gap-4 justify-center">
                        <button id="downloadPNG" class="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            📥 Télécharger QR Code (PNG)
                        </button>
                        <button id="downloadPDF" class="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                            📄 Télécharger PDF
                        </button>
                    </div>
                </div>
            `;
        }
    }

    bindEvents() {
        if (this.step === 1) {
            const inputs = ['pourQui', 'deLaPartDe', 'messageFinal'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', (e) => {
                        this.surprise[id] = e.target.value;
                    });
                }
            });

            document.getElementById('nextBtn').addEventListener('click', async () => {
                if (!this.surprise.pourQui || !this.surprise.deLaPartDe) {
                    alert('Remplis tous les champs !');
                    return;
                }

                // Sauvegarde dans Firebase
                try {
                    const docRef = await addDoc(collection(db, 'surprises'), this.surprise);
                    this.surpriseId = docRef.id;
                    this.step = 2;
                    this.render();
                    this.showQRCode();
                    this.bindDownloadEvents();
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue');
                }
            });
        }
    }

    showQRCode() {
        const url = `${window.location.origin}/LoveCraft/s/?id=${this.surpriseId}`;
        document.getElementById('surpriseLink').href = url;
        document.getElementById('surpriseLink').textContent = url;
        
        // Générer QR Code
        QRCode.toCanvas(document.getElementById('qrCode'), url, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (error) {
            if (error) console.error(error);
        });
    }

    bindDownloadEvents() {
        // Télécharger PNG
        document.getElementById('downloadPNG').addEventListener('click', () => {
            const qrContainer = document.getElementById('qrContainer');
            html2canvas(qrContainer).then(canvas => {
                const link = document.createElement('a');
                link.download = `surprise-${this.surprise.pourQui}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });

        // Télécharger PDF
        document.getElementById('downloadPDF').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            pdf.setFontSize(22);
            pdf.setTextColor(236, 72, 153);
            pdf.text('✨ Ta Surprise LoveCraft ✨', 105, 30, { align: 'center' });
            
            const qrContainer = document.getElementById('qrContainer');
            html2canvas(qrContainer).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 60, 40, 90, 90);
                
                pdf.setFontSize(12);
                pdf.setTextColor(0, 0, 0);
                
                const lines = [
                    `Pour : ${this.surprise.pourQui}`,
                    `De : ${this.surprise.deLaPartDe}`,
                    '',
                    'Instructions :',
                    '1. Scanne le QR Code avec ton téléphone',
                    '2. Ou visite le lien directement',
                    '3. Suis les étapes pour découvrir la surprise !',
                    '',
                    'Message :',
                    `"${this.surprise.messageFinal}"`
                ];
                
                lines.forEach((line, i) => {
                    pdf.text(line, 20, 150 + (i * 7));
                });
                
                pdf.save(`surprise-pour-${this.surprise.pourQui}.pdf`);
            });
        });
    }
}

// Démarrer l'application
new SurpriseCreator();
