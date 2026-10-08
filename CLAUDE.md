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

**Single-page scroll layout** with seven sections: Hero, About, Experience, Key Achievements (`#achievements`, "Work" in the nav), Skills, Education, Contact.

### Files

- `index.html` — All content and structure; semantic HTML5 with ARIA attributes. A one-line inline script in `<head>` sets the `motion` class (see below). Achievement cards carry inline SVG line-art icons.
- `styles/styles.css` — Full stylesheet; CSS custom properties for tokens, responsive breakpoints at 880px and 720px, print styles, and reduced-motion handling
- `scripts/main.js` — UI behavior in an IIFE: text splitting for the hero name and headings, reveal-on-scroll, nav scroll state and sliding active indicator, animated counters, experience accordion, scroll-linked experience timeline
- `scripts/guilloche.js` — Canvas "guilloche" (banknote engraving) rosette behind the hero: engraves in on load, then redraws only on pointer movement (lens bulge) and scroll (counter-rotating bands)

### Design System

Single "Editorial" theme (Parchment & Amber): `--bg: #f3efe7`, `--accent: #a54a2a`, plus `--surface`, `--ink`, `--dim`, `--rule`, and easing tokens `--ease` / `--ease-in-out`, all on `:root`. Spacing density comes from `data-density` on `<html>` (`compact` / `cozy` / `spacious`). Typography uses Google Fonts: Fraunces (display serif, loaded with the full `wght` axis so the hero can animate weight), Inter (body sans), and JetBrains Mono (captions).

### Motion system

- The `<head>` script adds `motion` to `<html>` unless the visitor prefers reduced motion; `main.js`'s `onerror` removes it if the script fails to load. **Every rule that starts content hidden must be scoped under `.motion`**, so no-JS and reduced-motion visitors always get a complete, static page.
- `.reveal` elements (and `.section-label`) get `is-visible` from an IntersectionObserver; `data-delay` (ms) staggers them.
- Split text: `.hero-title` is split into letters (`.c`), `.h2` and `.contact-heading` into words (`.w-i`), each inside a clipping mask (`.w`). A visually hidden copy (`.sr-only`) keeps the text readable to screen readers. Hero letters have kerning restored as margins after fonts load.
- Hairline rules on `.hero-meta`, `.stat`, `.exp-btn`, `.edu-row` and `.contact-row` are drawn as backgrounds (`background-size` animates), not borders.
- When an element is both `.reveal` and has its own transitions, list them together in one `.motion …` rule; otherwise the more specific `.motion .reveal` transition silently replaces them.
- Print styles force every animated element to its final state.

### Key Patterns

- All JS uses `'use strict'` inside IIFEs with no external dependencies
- Event listeners use `{ passive: true }` where applicable
- The guilloche canvas is DPR-aware (capped at 2), pauses when the hero is off-screen or the tab is hidden, and draws a single static frame under reduced motion
