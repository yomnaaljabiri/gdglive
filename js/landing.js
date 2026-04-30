/* ===== Landing Page JS ===== */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initNavScroll();
  initCounters();
});

/* Scroll Reveal */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function initReveal() {
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => revealObs.observe(el));
}

/* Navbar scroll */
function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    // Active link
    document.querySelectorAll('section[id]').forEach(s => {
      const top = s.offsetTop - 120;
      const bot = top + s.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bot) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + s.id) a.classList.add('active');
        });
      }
    });
  });
}

/* Counters */
function animateCounter(el) {
  const target = +el.dataset.count;
  let current = 0;
  const step = target / 50;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, 30);
}

function initCounters() {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(animateCounter);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stats-bar, .hero-stats').forEach(el => counterObs.observe(el));
}

/* Mobile menu */
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

/* Re-init on lang change */
window.addEventListener('langChange', () => {
  // Re-observe reveals for dynamic content
  initReveal();
});
