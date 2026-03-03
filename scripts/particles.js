(() => {
    'use strict';

    // Bail if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;

    // Config
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 30 : 60;
    const CONNECT_DIST = 120;
    const MOUSE_RADIUS = 100;
    const COLOR = '0, 113, 227';
    const DOT_OPACITY = 0.3;
    const LINE_OPACITY = 0.12;

    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let animId = null;
    let paused = false;
    let scrollY = 0;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = hero.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
        particles = [];
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: Math.random() * 2 + 1,
            });
        }
    }

    function draw() {
        if (paused) return;

        const w = hero.offsetWidth;
        const h = hero.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        ctx.save();
        // Subtle parallax offset
        if (!isMobile) {
            ctx.translate(0, -scrollY * 0.15);
        }

        // Update & draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Drift
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            // Clamp
            p.x = Math.max(0, Math.min(w, p.x));
            p.y = Math.max(0, Math.min(h, p.y));

            // Mouse repulsion
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                p.x += (dx / dist) * force * 2;
                p.y += (dy / dist) * force * 2;
            }

            // Draw dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${COLOR}, ${DOT_OPACITY})`;
            ctx.fill();
        }

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    const opacity = LINE_OPACITY * (1 - dist / CONNECT_DIST);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${COLOR}, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        ctx.restore();

        animId = requestAnimationFrame(draw);
    }

    // Mouse tracking (relative to hero)
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    }, { passive: true });

    // Touch support
    hero.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = hero.getBoundingClientRect();
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
    }, { passive: true });

    hero.addEventListener('touchend', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    }, { passive: true });

    // Scroll tracking for parallax
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    }, { passive: true });

    // Visibility API — pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            paused = true;
            if (animId) cancelAnimationFrame(animId);
        } else {
            paused = false;
            draw();
        }
    });

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createParticles();
        }, 200);
    });

    // Init
    resize();
    createParticles();
    draw();
})();
