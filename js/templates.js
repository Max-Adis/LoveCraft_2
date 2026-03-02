class TemplateManager {
  constructor() {
    this.templates = {
      romantic: {
        name: 'Romantique',
        colors: { primary: '#ec4899', secondary: '#d946ef', gradient: 'from-pink-500 to-purple-500' },
        emoji: '❤️',
        effects: ['hearts', 'sparkles']
      },
      geek: {
        name: 'Geek',
        colors: { primary: '#3b82f6', secondary: '#1d4ed8', gradient: 'from-blue-500 to-indigo-500' },
        emoji: '👨‍💻',
        effects: ['stars']
      },
      birthday: {
        name: 'Anniversaire',
        colors: { primary: '#f59e0b', secondary: '#d97706', gradient: 'from-yellow-500 to-orange-500' },
        emoji: '🎂',
        effects: ['confetti']
      },
      friendship: {
        name: 'Amitié',
        colors: { primary: '#10b981', secondary: '#059669', gradient: 'from-green-500 to-emerald-500' },
        emoji: '🤝',
        effects: ['stars', 'sparkles']
      },
      mysterious: {
        name: 'Mystérieux',
        colors: { primary: '#6b7280', secondary: '#4b5563', gradient: 'from-gray-500 to-gray-700' },
        emoji: '🔮',
        effects: ['stars']
      }
    };
  }

  applyTemplate(templateName, container) {
    const template = this.templates[templateName] || this.templates.romantic;

    container.style.setProperty('--primary-color', template.colors.primary);
    container.style.setProperty('--secondary-color', template.colors.secondary);

    const gradientClass = template.colors.gradient;
    if (!container.className.includes('from-')) {
      container.classList.add(...gradientClass.split(' '));
    }

    const emojiEl = container.querySelector('.template-emoji');
    if (emojiEl) emojiEl.textContent = template.emoji;

    return template;
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
        pointer-events: none;
        z-index: 0;
      `;
      container.appendChild(heart);
    }
  }
}

const templateManager = new TemplateManager();
export default templateManager;
