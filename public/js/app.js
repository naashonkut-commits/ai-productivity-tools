// Client-side JS for AI Productivity Tools web app
(function() {
  'use strict';

  // ── Navbar scroll effect ─────────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const current = window.scrollY;
      if (current > 100 && current > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
      lastScroll = current;
    }, { passive: true });
  }

  // ── Intersection Observer for feature cards ──────────
  if ('IntersectionObserver' in window) {
    const cards = document.querySelectorAll('.feature-card, .install-step');
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(function(card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(card);
    });
  }

  // ── Code block copy buttons ──────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const code = this.parentElement.querySelector('code');
      if (!code) return;
      const text = code.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.borderColor = '#6366f1';
          btn.style.color = '#ffffff';
          setTimeout(function() {
            btn.textContent = orig;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 2000);
        });
      }
    });
  });

  // ── Smooth scroll for anchor links ───────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  console.log('[AI Productivity Tools] Web app loaded.');
})();
