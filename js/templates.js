class TemplateManager {
  constructor() {
    this.templates = {
      romantic: {
        name: 'Romantique',
        colors: {
          primary: '#ec4899',
          secondary: '#d946ef',
          gradient: 'from-pink-500 to-purple-500'
        },
        emoji: '❤️',
        music: 'romantic-piano.mp3',
        effects: ['hearts', 'sparkles']
      },
      geek: {
        name: 'Geek',
        colors: {
          primary: '#3b82f6',
          secondary: '#1d4ed8',
          gradient: 'from-blue-500 to-indigo-500'
        },
        emoji: '👨‍💻',
        music: 'electronic.mp3',
        effects: ['code', 'pixels']
      },
      birthday: {
        name: 'Anniversaire',
        colors: {
          primary: '#f59e0b',
          secondary: '#d97706',
          gradient: 'from-yellow-500 to-orange-500'
        },
        emoji: '🎂',
        music: 'happy-birthday.mp3',
        effects: ['confetti', 'balloons']
      },
      friendship: {
        name: 'Amitié',
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          gradient: 'from-green-500 to-emerald-500'
        },
        emoji: '🤝',
        music: 'friendship.mp3',
        effects: ['stars', 'sparkles']
      },
      mysterious: {
        name: 'Mystérieux',
        colors: {
          primary: '#6b7280',
          secondary: '#4b5563',
          gradient: 'from-gray-500 to-gray-700'
        },
        emoji: '🔮',
        music: 'mysterious.mp3',
        effects: ['fog', 'stars']
      }
    };
  }

  applyTemplate(templateName, container) {
    const template = this.templates[templateName] || this.templates.romantic;
    
    // Appliquer les couleurs
    container.style.setProperty('--primary-color', template.colors.primary);
    container.style.setProperty('--secondary-color', template.colors.secondary);
    
    // Appliquer le gradient
    const gradientClass = template.colors.gradient;
    container.className = container.className.replace(/from-\w+-\d+ to-\w+-\d+/, gradientClass);
    if (!container.className.includes('from-')) {
      container.classList.add(...gradientClass.split(' '));
    }
    
    // Ajouter l'emoji
    const emojiEl = container.querySelector('.template-emoji');
    if (emojiEl) {
      emojiEl.textContent = template.emoji;
    }
    
    // Charger la musique
    if (typeof audioManager !== 'undefined') {
      audioManager.loadMusic(`assets/sounds/${template.music}`);
    }
    
    // Appliquer les effets
    this.applyEffects(template.effects, container);
    
    return template;
  }

  applyEffects(effects, container) {
    effects.forEach(effect => {
      switch(effect) {
        case 'hearts':
          this.createHeartsEffect(container);
          break;
        case 'confetti':
          visualEffects.launchConfetti();
          break;
        case 'stars':
          this.createStarsEffect(container);
          break;
        case 'sparkles':
          this.createSparklesEffect(container);
          break;
      }
    });
  }

  createHeartsEffect(container) {
    for (let i = 0; i < 10; i++) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 24 + 16}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.3 + 0.2};
        animation: float ${Math.random() * 10 + 5}s infinite ease-in-out;
        z-index: 1;
      `;
      container.appendChild(heart);
    }
  }

  createStarsEffect(container) {
    for (let i = 0; i < 15; i++) {
      const star = document.createElement('div');
      star.innerHTML = '✨';
      star.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 12}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.4 + 0.1};
        animation: twinkle ${Math.random() * 3 + 2}s infinite alternate;
        z-index: 1;
      `;
      container.appendChild(star);
    }
  }

  createSparklesEffect(container) {
    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.innerHTML = '⭐';
      sparkle.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 18 + 10}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.3};
        animation: spin ${Math.random() * 8 + 4}s infinite linear;
        z-index: 1;
      `;
      container.appendChild(sparkle);
    }
  }

  // Rendu du sélecteur de templates
  renderTemplateSelector(currentTemplate = 'romantic') {
    return `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          <i class="fas fa-palette mr-2"></i>Choisissez un thème
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          ${Object.entries(this.templates).map(([key, template]) => `
            <button data-template="${key}" 
                    class="template-btn p-4 rounded-lg border-2 ${currentTemplate === key ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'} transition-all hover:scale-105">
              <div class="text-2xl mb-2">${template.emoji}</div>
              <span class="font-medium text-sm">${template.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Instance globale
const templateManager = new TemplateManager();

export default templateManager;
