# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal resume website for Ken Peu (Software Development Manager), hosted on GitHub Pages at ken30.github.io. Static single-page site with no build system, no frameworks, and no package manager — pure HTML/CSS/JavaScript served directly.

## Development

No build or install steps. Open `index.html` in a browser or serve locally:

```bash
python -m http.server 8000
```

There are no tests, linters, or CI/CD pipelines.

## Architecture

**Single-page scroll layout** with six sections: Hero, About, Experience, Skills, Education, Contact.

### Files

- `index.html` — All content and structure; semantic HTML5 with ARIA attributes
- `styles/main.css` — Full stylesheet (~1175 lines); CSS custom properties for theming, responsive breakpoints at 768px and 480px, print styles, and reduced-motion preferences
- `scripts/main.js` — UI behavior in an IIFE: theme toggle (localStorage-persisted), scroll animations via Intersection Observer, animated counters, typed text effect, mobile hamburger menu, active nav tracking
- `scripts/particles.js` — Canvas-based particle system in hero section with mouse/touch interaction, parallax, and visibility API pause
- `references/` — Source resume content (Resume.md, Resume.docx, career summary)

### Design System

Two themes toggled via `[data-theme]` attribute on `<html>`:
- **Light:** Parchment & Amber (`--bg: #f5f0ea`, `--accent: #b06a2b`)
- **Dark:** Obsidian & Amber (`--bg: #0a0a0c`, `--accent: #c27c3b`)

CSS variables defined under `:root` and `[data-theme="dark"]`. Typography uses Google Fonts: Fraunces (display/serif) and Figtree (body/sans-serif). Icons via Font Awesome 6.5.1 CDN.

### Key Patterns

- All JS uses `'use strict'` inside IIFEs with no external dependencies
- Animations respect `prefers-reduced-motion` — both JS files check this before enabling effects
- Event listeners use `{ passive: true }` where applicable
- Particle system is DPR-aware and adjusts count for mobile (30) vs desktop (60)
- Print-to-PDF triggers `window.print()` with dedicated print styles in CSS
