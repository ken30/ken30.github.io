(() => {
  'use strict';

  // Set by the inline script in <head> unless the visitor prefers reduced motion.
  const animate = document.documentElement.classList.contains('motion');

  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  };

  // ---------- Year ----------
  const setYear = () => {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  };

  // ---------- Text splitting ----------
  // Wraps each word in a clipping mask (.w) holding either the whole word
  // (.w-i) or one span per letter (.c). Screen readers get an untouched copy.
  const splitText = (el, byChar) => {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    let i = 0;

    const build = (from, into) => {
      from.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const copy = node.cloneNode(false);
          into.append(copy);
          build(node, copy);
          return;
        }
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (!part.trim()) { into.append(' '); return; }
          const mask = document.createElement('span');
          mask.className = 'w';
          (byChar ? Array.from(part) : [part]).forEach(text => {
            const span = document.createElement('span');
            span.className = byChar ? 'c' : 'w-i';
            span.textContent = text;
            span.style.setProperty('--i', i++);
            mask.append(span);
          });
          into.append(mask);
        });
      });
    };

    build(el, visual);
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.replaceChildren(sr, visual);
    el.classList.add('is-split');
  };

  // Letters in separate boxes lose the font's kerning, which shows at hero
  // size ("Wa", "Th"). Measure each pair and restore it as a margin.
  const restoreKerning = (el) => {
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.querySelectorAll('.w').forEach(word => {
      const chars = Array.from(word.querySelectorAll('.c'));
      if (chars.length < 2) return;
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
      word.append(probe);
      const width = (text) => {
        probe.textContent = text;
        return probe.getBoundingClientRect().width;
      };
      chars.slice(0, -1).forEach((c, k) => {
        const a = c.textContent;
        const b = chars[k + 1].textContent;
        c.style.marginRight = `${(width(a + b) - width(a) - width(b)) / size}em`;
      });
      probe.remove();
    });
  };

  const initSplitText = () => {
    if (!animate) return;
    const title = document.querySelector('.hero-title');
    if (title) {
      splitText(title, true);
      if (document.fonts) document.fonts.ready.then(() => restoreKerning(title));
      else restoreKerning(title);
    }
    document.querySelectorAll('.h2, .contact-heading').forEach(el => splitText(el, false));
  };

  // Give each word its line number so a heading rises line by line.
  // Measured at reveal time, when the layout is the one being seen.
  const indexLines = (el) => {
    let line = -1;
    let lastTop = null;
    el.querySelectorAll('.w').forEach(word => {
      const top = word.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        line++;
        lastTop = top;
      }
      word.style.setProperty('--line', line);
    });
  };

  // ---------- Reveal-on-scroll ----------
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal, .section-label');
    if (!animate || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.querySelectorAll('.is-split').forEach(indexLines);
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

    // One underline that slides between links instead of jumping.
    const inner = document.querySelector('.nav-inner');
    let indicator = null;
    let placed = false;
    if (animate && inner) {
      indicator = document.createElement('span');
      indicator.className = 'nav-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      inner.append(indicator);
    }

    const moveIndicator = (link) => {
      if (!indicator) return;
      if (!link) {
        indicator.classList.remove('is-shown');
        return;
      }
      const base = inner.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      // The first placement jumps into position rather than sliding in from 0,0.
      if (!placed) indicator.style.transition = 'none';
      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translate(${rect.left - base.left}px, ${rect.bottom - base.top + 6}px)`;
      if (!placed) {
        void indicator.offsetWidth;
        indicator.style.transition = '';
        placed = true;
      }
      indicator.classList.add('is-shown');
    };

    let current = null;
    const setActive = (id) => {
      if (id === current) return;
      current = id;
      let active = null;
      links.forEach(a => {
        const on = a.dataset.target === id;
        a.classList.toggle('is-active', on);
        if (on) active = a;
      });
      moveIndicator(active);
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

    const relayout = () => {
      placed = false;
      moveIndicator(links.find(a => a.dataset.target === current));
    };

    pick();
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', () => { pick(); relayout(); }, { passive: true });
    if (document.fonts) document.fonts.ready.then(relayout);
  };

  // ---------- Animated counters ----------
  const initCounters = () => {
    const stats = document.querySelectorAll('.stat-n[data-count]');
    // The markup holds the final values; only zero them if we'll count up.
    if (!stats.length || !animate || !('IntersectionObserver' in window)) return;
    const showFinal = () => stats.forEach(el => {
      el.textContent = `${parseInt(el.dataset.count, 10) || 0}${el.dataset.suffix || ''}`;
    });
    stats.forEach(el => { el.textContent = `0${el.dataset.suffix || ''}`; });
    window.addEventListener('beforeprint', showFinal);
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

  // ---------- Experience timeline ----------
  // Fills the rail down to a reading line 60% of the way down the viewport
  // and lights each role's marker as the fill passes it.
  const initTimeline = () => {
    const list = document.querySelector('.exp-list');
    if (!list || !animate) return;
    const items = Array.from(list.children);
    let queued = false;

    const update = () => {
      queued = false;
      const rect = list.getBoundingClientRect();
      const filled = Math.min(Math.max(window.innerHeight * 0.6 - rect.top, 0), rect.height);
      // Where each marker sits within its <li> (CSS sets it per breakpoint)
      const marker = items.length ? parseFloat(getComputedStyle(items[0], '::before').top) || 0 : 0;
      list.style.setProperty('--progress', (filled / rect.height).toFixed(4));
      items.forEach(li => li.classList.toggle('is-passed', filled > li.offsetTop + marker));
    };
    const request = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    list.addEventListener('transitionend', request);
  };

  ready(() => {
    setYear();
    initSplitText();
    initReveal();
    initNavScroll();
    initNavActive();
    initCounters();
    initExperience();
    initTimeline();
  });
})();
