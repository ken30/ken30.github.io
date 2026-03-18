(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ──────────────────────────────
    // Theme Toggle
    // ──────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        const stored = localStorage.getItem('theme');
        if (stored) {
            document.documentElement.setAttribute('data-theme', stored);
        }

        function updateIcon() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggle.querySelector('i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }

        updateIcon();

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateIcon();
        });
    }

    // ──────────────────────────────
    // Scroll Animations
    // ──────────────────────────────
    const animatedEls = document.querySelectorAll('.animate-on-scroll');

    if (animatedEls.length) {
        const scrollObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        scrollObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        animatedEls.forEach((el) => scrollObserver.observe(el));
    }

    // ──────────────────────────────
    // Staggered Card Reveals
    // ──────────────────────────────
    if (!prefersReducedMotion) {
        const staggerContainers = document.querySelectorAll('.skill-tags, .education-grid');

        if (staggerContainers.length) {
            const staggerObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const children = entry.target.children;
                            for (let i = 0; i < children.length; i++) {
                                children[i].classList.remove('animate-on-scroll');
                                children[i].style.transitionDelay = Math.min(i * 100, 800) + 'ms';
                            }
                            entry.target.classList.add('visible');
                            staggerObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            staggerContainers.forEach((el) => {
                el.classList.add('stagger-children');
                staggerObserver.observe(el);
            });
        }
    }

    // ──────────────────────────────
    // Scroll-Triggered Counters
    // ──────────────────────────────
    const statsRow = document.querySelector('.stats-row');

    if (statsRow) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const counters = entry.target.querySelectorAll('.stat-number');
                        counters.forEach((counter) => animateCounter(counter));
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        counterObserver.observe(statsRow);
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        if (prefersReducedMotion) {
            el.textContent = target;
            return;
        }
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ──────────────────────────────
    // Typed Text Effect
    // ──────────────────────────────
    const typedEl = document.getElementById('typed-text');

    if (typedEl && !prefersReducedMotion) {
        const phrases = typedEl.dataset.phrases.split(',');
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeStep() {
            const current = phrases[phraseIndex];

            if (!isDeleting) {
                charIndex++;
                typedEl.textContent = current.substring(0, charIndex);

                if (charIndex === current.length) {
                    setTimeout(() => {
                        isDeleting = true;
                        typeStep();
                    }, 2000);
                    return;
                }
                setTimeout(typeStep, 100);
            } else {
                charIndex--;
                typedEl.textContent = current.substring(0, charIndex);

                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(typeStep, 500);
                    return;
                }
                setTimeout(typeStep, 50);
            }
        }

        typeStep();
    }

    // ──────────────────────────────
    // Navbar — scroll shadow
    // ──────────────────────────────
    const navbar = document.getElementById('navbar');

    if (navbar) {
        window.addEventListener(
            'scroll',
            () => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            },
            { passive: true }
        );
    }

    // ──────────────────────────────
    // Hamburger toggle
    // ──────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ──────────────────────────────
    // Active section tracking
    // ──────────────────────────────
    const sections = document.querySelectorAll('main section, #hero, footer');
    const navAnchors = document.querySelectorAll('.nav-links a');

    if (sections.length && navAnchors.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navAnchors.forEach((a) => {
                            a.classList.toggle(
                                'active',
                                a.getAttribute('href') === `#${id}`
                            );
                        });
                    }
                });
            },
            {
                rootMargin: '-30% 0px -70% 0px',
            }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }
})();
