(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  };

  // ---------- Year ----------
  const setYear = () => {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  };

  // ---------- Reveal-on-scroll ----------
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        if (delay) {
          setTimeout(() => el.classList.add('is-visible'), delay);
        } else {
          el.classList.add('is-visible');
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  };

  // ---------- Nav scroll state ----------
  const initNavScroll = () => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const update = () => {
      if (window.scrollY > 24) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  // ---------- Nav active section ----------
  const initNavActive = () => {
    const ids = ['hero', 'about', 'experience', 'achievements', 'skills', 'education', 'contact'];
    const links = Array.from(document.querySelectorAll('.nav-links a[data-target]'));
    if (!links.length) return;

    const setActive = (id) => {
      links.forEach(a => {
        a.classList.toggle('is-active', a.dataset.target === id);
      });
    };

    const pick = () => {
      const fromCenter = window.innerHeight / 2;
      let closest = 'hero';
      let best = Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const d = Math.abs(rect.top + rect.height / 2 - fromCenter);
        if (d < best) { best = d; closest = id; }
      }
      setActive(closest);
    };

    pick();
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick, { passive: true });
  };

  // ---------- Animated counters ----------
  const initCounters = () => {
    const stats = document.querySelectorAll('.stat-n[data-count]');
    if (!stats.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      stats.forEach(el => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        el.textContent = `${target}${suffix}`;
      });
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    stats.forEach(el => obs.observe(el));
  };

  // ---------- Experience accordion ----------
  const initExperience = () => {
    const buttons = document.querySelectorAll('.exp-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.nextElementSibling;
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Close all others
        buttons.forEach(other => {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          const p = other.nextElementSibling;
          if (p && p.classList.contains('exp-panel')) p.removeAttribute('data-open');
        });

        btn.setAttribute('aria-expanded', String(!isOpen));
        if (panel && panel.classList.contains('exp-panel')) {
          if (isOpen) panel.removeAttribute('data-open');
          else panel.setAttribute('data-open', 'true');
        }
      });
    });
  };

  ready(() => {
    setYear();
    initReveal();
    initNavScroll();
    initNavActive();
    initCounters();
    initExperience();
  });
})();
