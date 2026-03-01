(() => {
    'use strict';

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

        // Close menu on link click
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
