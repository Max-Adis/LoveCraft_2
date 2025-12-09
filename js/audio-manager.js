class AudioManager {
  constructor() {
    this.sounds = {};
    this.currentMusic = null;
    this.isMusicPlaying = false;
    this.volume = 0.3;
  }

  init() {
    // Musique principale
    this.sounds.background = new Howl({
      src: ['assets/sounds/romantic-piano.mp3'],
      loop: true,
      volume: this.volume,
      html5: true,
      onplay: () => {
        this.isMusicPlaying = true;
        this.updateMusicButton();
      },
      onpause: () => {
        this.isMusicPlaying = false;
        this.updateMusicButton();
      }
    });

    // Effets sonores
    this.sounds.success = new Howl({
      src: ['assets/sounds/success.mp3'],
      volume: 0.5
    });

    this.sounds.reveal = new Howl({
      src: ['assets/sounds/reveal.mp3'],
      volume: 0.6
    });

    this.sounds.click = new Howl({
      src: ['assets/sounds/click.mp3'],
      volume: 0.3
    });

    // Créer le bouton de contrôle
    this.createMusicControl();
  }

  createMusicControl() {
    const controlDiv = document.createElement('div');
    controlDiv.id = 'global-music-control';
    controlDiv.className = 'fixed bottom-6 right-6 z-50';
    
    controlDiv.innerHTML = `
      <button id="toggle-global-music" 
              class="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center">
        <i class="fas fa-music"></i>
      </button>
      <div id="volume-control" class="mt-2 bg-white rounded-lg p-2 shadow-lg hidden">
        <input type="range" min="0" max="100" value="${this.volume * 100}" 
               class="w-full" id="volume-slider">
        <p class="text-xs text-gray-600 text-center mt-1">Volume</p>
      </div>
    `;
    
    document.body.appendChild(controlDiv);
    
    // Événements
    document.getElementById('toggle-global-music').addEventListener('click', () => {
      this.toggleMusic();
    });
    
    document.getElementById('toggle-global-music').addEventListener('mouseenter', () => {
      document.getElementById('volume-control').classList.remove('hidden');
    });
    
    document.getElementById('toggle-global-music').addEventListener('mouseleave', () => {
      document.getElementById('volume-control').classList.add('hidden');
    });
    
    document.getElementById('volume-slider').addEventListener('input', (e) => {
      const newVolume = e.target.value / 100;
      this.setVolume(newVolume);
    });
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      this.sounds.background.pause();
    } else {
      this.sounds.background.play();
    }
  }

  setVolume(volume) {
    this.volume = volume;
    this.sounds.background.volume(volume);
    this.updateMusicButton();
  }

  updateMusicButton() {
    const btn = document.getElementById('toggle-global-music');
    if (!btn) return;
    
    if (this.isMusicPlaying) {
      btn.innerHTML = '<i class="fas fa-volume-up"></i>';
      btn.classList.remove('from-purple-600', 'to-pink-600');
      btn.classList.add('from-green-500', 'to-emerald-500');
    } else {
      btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      btn.classList.remove('from-green-500', 'to-emerald-500');
      btn.classList.add('from-purple-600', 'to-pink-600');
    }
  }

  playEffect(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].play();
    }
  }

  stopAll() {
    this.sounds.background.stop();
    this.isMusicPlaying = false;
    this.updateMusicButton();
  }
}

// Instance globale
const audioManager = new AudioManager();

// Initialiser quand la page est prête
document.addEventListener('DOMContentLoaded', () => {
  audioManager.init();
});

export default audioManager;
