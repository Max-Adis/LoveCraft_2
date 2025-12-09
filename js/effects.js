class VisualEffects {
  constructor() {
    this.confettiActive = false;
  }

  // Particules avancées
  initParticles(containerId = 'particles-js') {
    particlesJS(containerId, {
      particles: {
        number: { value: 120, density: { enable: true, value_area: 800 } },
        color: { value: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'] },
        shape: { type: ['circle', 'triangle', 'polygon'] },
        opacity: { value: 0.7, random: true },
        size: { value: 4, random: true },
        line_linked: { 
          enable: true, 
          distance: 180, 
          color: '#ec4899', 
          opacity: 0.4, 
          width: 1 
        },
        move: { 
          enable: true, 
          speed: 3, 
          direction: 'none', 
          random: true,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' }
        }
      },
      retina_detect: true
    });
  }

  // Confettis personnalisés
  launchConfetti(options = {}) {
    if (this.confettiActive) return;
    this.confettiActive = true;
    
    const defaults = {
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
    };
    
    confetti({ ...defaults, ...options });
    
    setTimeout(() => {
      this.confettiActive = false;
    }, 1000);
  }

  // Heart Rain
  createHeartRain(count = 20) {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 24 + 16}px;
        top: -50px;
        left: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.5};
        animation: heart-fall ${Math.random() * 3 + 2}s linear infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      
      container.appendChild(heart);
    }
    
    document.body.appendChild(container);
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes heart-fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Nettoyer après 5 secondes
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 5000);
  }

  // Flash effect
  flashScreen(color = '#ffffff', duration = 300) {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${color};
      opacity: 0.7;
      z-index: 10000;
      pointer-events: none;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.style.transition = 'opacity 0.3s ease-out';
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    }, duration);
  }

  // Text reveal animation
  animateTextReveal(element, duration = 1000) {
    const text = element.textContent;
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.cssText = `
        opacity: 0;
        display: inline-block;
        animation: text-reveal 0.1s ease forwards;
        animation-delay: ${i * 0.05}s;
      `;
      element.appendChild(span);
    }
    
    // Ajouter animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes text-reveal {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => style.remove(), duration);
  }

  // Floating hearts around cursor
  initFloatingHearts() {
    document.addEventListener('mousemove', (e) => {
      if (Math.random() > 0.7) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
          position: fixed;
          font-size: 16px;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          opacity: 0.7;
          pointer-events: none;
          z-index: 10000;
          animation: float-away 1s ease-out forwards;
        `;
        
        document.body.appendChild(heart);
        
        setTimeout(() => heart.remove(), 1000);
      }
    });
    
    // Ajouter animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-away {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 0.7;
        }
        100% {
          transform: translate(${Math.random() * 40 - 20}px, -40px) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Instance globale
const visualEffects = new VisualEffects();

export default visualEffects;
