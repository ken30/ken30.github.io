(() => {
  'use strict';

  const canvas = document.getElementById('hero-guilloche');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const root = document.documentElement;
  const still = !root.classList.contains('motion');

  const css = getComputedStyle(root);
  const ACCENT = css.getPropertyValue('--accent').trim() || '#a54a2a';
  const INK = css.getPropertyValue('--ink').trim() || '#1a1915';

  // Each band is a ring of sine waves, every copy phase-shifted from the last.
  // Their overlap weaves the lattice engraved on banknotes and cheques.
  // Radii and amplitudes are fractions of the rosette radius.
  const BANDS = [
    { r: 1.00, amp: 0.075, lobes: 24, copies: 16, spin:  1, color: ACCENT, alpha: 0.34 },
    { r: 0.80, amp: 0.090, lobes: 15, copies: 12, spin: -1, color: INK,    alpha: 0.14 },
    { r: 0.58, amp: 0.070, lobes: 18, copies: 14, spin:  1, color: ACCENT, alpha: 0.26 },
    { r: 0.36, amp: 0.060, lobes: 10, copies: 10, spin: -1, color: INK,    alpha: 0.12 },
  ];
  const TAU = Math.PI * 2;
  const STEPS_PER_LOBE = 12;
  const DRAW_IN_MS = 2800;   // engraving sweep on load
  const SCROLL_PHASE = 0.004; // phase per px scrolled; bands turn in opposite directions
  const LENS_RADIUS = 110;   // px around the pointer that bulges
  const LENS_PUSH = 22;      // px at the lens centre

  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let radius = 0;

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0 };

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (t) => Math.min(1, Math.max(0, t));

  const layout = () => {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const narrow = w < 720;
    cx = narrow ? w : w * 0.8;
    cy = narrow ? h * 0.12 : h * 0.46;
    radius = narrow ? w * 0.55 : Math.min(w * 0.3, h * 0.44);
  };

  const draw = (progress, phase) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 0.6;

    const lens = pointer.power > 0.01;
    const lensR2 = LENS_RADIUS * LENS_RADIUS;

    BANDS.forEach((band, b) => {
      // Bands are cut outermost-first, each starting a little after the last.
      const local = clamp01((progress - b * 0.1) / 0.7);
      if (local === 0) return;

      const sweep = TAU * easeOut(local);
      const steps = Math.max(2, Math.ceil(band.lobes * STEPS_PER_LOBE * easeOut(local)));
      const base = radius * band.r;
      const amp = radius * band.amp;

      ctx.beginPath();
      for (let c = 0; c < band.copies; c++) {
        const offset = (c / band.copies) * TAU + phase * band.spin;
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * sweep;
          const r = base + amp * Math.sin(band.lobes * t + offset);
          const a = t - Math.PI / 2;
          let x = cx + r * Math.cos(a);
          let y = cy + r * Math.sin(a);

          if (lens) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < lensR2 * 4 && d2 > 0.01) {
              const push = LENS_PUSH * pointer.power * Math.exp(-d2 / lensR2) / Math.sqrt(d2);
              x += dx * push;
              y += dy * push;
            }
          }

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = band.color;
      ctx.globalAlpha = band.alpha;
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  };

  // Resizing clears the canvas, so every layout change is followed by a repaint.
  let repaint = () => draw(1, 0);
  const onResize = () => {
    layout();
    repaint();
  };
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(hero);
  else window.addEventListener('resize', onResize, { passive: true });

  layout();
  if (still) {
    draw(1, 0);
    return;
  }

  // ---------- Animated ----------
  // Frames are drawn on demand: through the engraving, while the pointer lens
  // eases in or out, and on scroll. Once settled the loop stops, so an idle
  // page costs nothing.

  let raf = 0;
  let clock = 0;      // ms of engraving actually played, so pauses don't jump
  let prev = 0;
  let inView = true;

  const settled = () =>
    clock >= DRAW_IN_MS &&
    Math.abs(pointer.target - pointer.power) < 0.005 &&
    Math.abs(pointer.tx - pointer.x) < 0.5 &&
    Math.abs(pointer.ty - pointer.y) < 0.5;

  const frame = (now) => {
    clock += Math.min(now - (prev || now), 50);
    prev = now;

    pointer.x += (pointer.tx - pointer.x) * 0.14;
    pointer.y += (pointer.ty - pointer.y) * 0.14;
    pointer.power += (pointer.target - pointer.power) * 0.08;

    draw(clock / DRAW_IN_MS, window.scrollY * SCROLL_PHASE);
    raf = settled() ? 0 : requestAnimationFrame(frame);
  };

  const play = () => {
    if (raf || !inView || document.hidden) return;
    prev = 0;
    raf = requestAnimationFrame(frame);
  };

  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    pointer.tx = e.clientX - rect.left;
    pointer.ty = e.clientY - rect.top;
    if (pointer.target === 0) {
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
    }
    pointer.target = 1;
    play();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    pointer.target = 0;
    play();
  }, { passive: true });

  window.addEventListener('scroll', play, { passive: true });
  repaint = play;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else play();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) play();
      else pause();
    }).observe(hero);
  }

  play();
})();
