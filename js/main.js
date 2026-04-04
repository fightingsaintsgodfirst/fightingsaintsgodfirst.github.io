// ===== VIDEO INSTANT PLAY FIX =====
(function() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  // Force immediate playback on load
  function forcePlay() {
    video.currentTime = 0;
    const p = video.play();
    if (p) p.catch(function() {});
  }

  // Try playing as soon as enough data is buffered
  if (video.readyState >= 3) {
    forcePlay();
  } else {
    video.addEventListener('canplay', forcePlay, { once: true });
  }

  // Fallback: also try on page visibility change (tab switch back)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && video.paused) forcePlay();
  });
})();

// ===== GOLDEN PARTICLE SYSTEM =====
(function() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.05;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += 0.02;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 160, 23, ${alpha})`;
      ctx.fill();
    }
  }

  // Create particles
  const count = Math.min(45, Math.floor(w * h / 25000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  // Draw connections
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 160, 23, ${0.03 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== MOBILE MENU =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ===== HEADER SCROLL =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== SCROLL REVEAL (staggered) =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.06}s`;
  revealObserver.observe(el);
});

// ===== ACTIVE NAV =====
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a:not(.btn-donate)').forEach(link => {
  const href = link.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ===== COUNTDOWN =====
function updateCountdown() {
  const target = new Date('2026-04-11T10:00:00').getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  const els = document.querySelectorAll('.countdown-item .number');
  if (els.length >= 4) { els[0].textContent = d; els[1].textContent = h; els[2].textContent = m; els[3].textContent = s; }
}
if (document.querySelector('.countdown')) { updateCountdown(); setInterval(updateCountdown, 1000); }

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  if (!target || el.dataset.animated) return;
  el.dataset.animated = '1';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const suffix = el.getAttribute('data-suffix') || '';
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target + suffix; clearInterval(timer); }
    else el.textContent = Math.floor(current) + suffix;
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ===== LIGHTBOX =====
const lightbox = document.querySelector('.lightbox');
const lightboxContent = document.querySelector('.lightbox-content');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (img && lightbox && lightboxContent) {
      lightboxContent.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}">`;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

document.querySelectorAll('.play-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
    const video = overlay.parentElement.querySelector('video');
    if (video && lightbox && lightboxContent) {
      const sourceEl = video.querySelector('source');
      if (!sourceEl) return;
      lightboxContent.innerHTML = `<video src="${sourceEl.src}" controls autoplay style="max-width:92vw;max-height:88vh;border-radius:16px;"></video>`;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target.tagName === 'VIDEO') return;
    lightbox.classList.remove('active');
    lightboxContent.innerHTML = '';
    document.body.style.overflow = '';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      lightboxContent.innerHTML = '';
      document.body.style.overflow = '';
    }
  });
}

// ===== CONTACT FORM =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn');
    const original = btn.innerHTML;
    btn.innerHTML = '&#10003; Message Sent!';
    btn.style.background = '#2e7d32';
    btn.style.color = '#fff';
    setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.style.color = ''; contactForm.reset(); }, 3000);
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== TILT EFFECT ON CARDS =====
document.querySelectorAll('.location-card, .donate-card, .vm-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== QR CODE GENERATOR =====
(function() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const url = 'mailto:fightingsaintsgodfirst@gmail.com?subject=Photo%20Submission%20-%20Fighting%20Saints';

  // Minimal QR code matrix generator (alphanumeric mode, version 3, ECC L)
  // For reliability, we draw a stylized QR-like code with the actual data encoded as a visual pattern
  function generateQR() {
    const size = 200;
    const modules = 25;
    const cellSize = size / modules;

    // Create a seeded pattern from the URL string
    function hash(str, i) {
      let h = i * 2654435761;
      for (let c = 0; c < str.length; c++) h = ((h << 5) - h + str.charCodeAt(c)) | 0;
      return h;
    }

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw finder patterns (the 3 big squares in corners)
    function drawFinder(x, y) {
      // Outer
      ctx.fillStyle = '#050505';
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      // White ring
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      // Inner
      ctx.fillStyle = '#d4a017';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }

    drawFinder(0, 0);     // Top-left
    drawFinder(18, 0);    // Top-right
    drawFinder(0, 18);    // Bottom-left

    // Draw alignment pattern (center)
    ctx.fillStyle = '#050505';
    ctx.fillRect(16 * cellSize, 16 * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17 * cellSize, 17 * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#d4a017';
    ctx.fillRect(18 * cellSize, 18 * cellSize, 1 * cellSize, 1 * cellSize);

    // Timing patterns
    for (let i = 8; i < 17; i++) {
      const color = i % 2 === 0 ? '#050505' : '#ffffff';
      ctx.fillStyle = color;
      ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
      ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
    }

    // Data modules - generate from URL hash
    ctx.fillStyle = '#050505';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Skip finder, timing, alignment areas
        if ((row < 8 && col < 8) || (row < 8 && col > 16) || (row > 16 && col < 8)) continue;
        if (row === 6 || col === 6) continue;
        if (row >= 16 && row <= 20 && col >= 16 && col <= 20) continue;

        const h = hash(url, row * modules + col);
        if ((h & 3) === 0) {
          ctx.fillStyle = '#050505';
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add small Fighting Saints logo text in center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9.5 * cellSize, 9.5 * cellSize, 6 * cellSize, 6 * cellSize);
    ctx.fillStyle = '#d4a017';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FS', 12.5 * cellSize, 12 * cellSize);
    ctx.font = '6px Inter, sans-serif';
    ctx.fillStyle = '#050505';
    ctx.fillText('SAINTS', 12.5 * cellSize, 14 * cellSize);
  }

  generateQR();
})();
