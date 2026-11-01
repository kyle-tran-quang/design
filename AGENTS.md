# Agent Instructions & Architecture Guide: Designed by Kyle (`kyletran.framer.website`)

> **Source of Truth:** `/Users/kyle/Documents/GitHub/design/output/kyletran.framer.website`

---

## 1. Project Overview & Objective

This repository contains a high-fidelity, production-ready static export of the portfolio website **Designed by Kyle** (originally on `kyletran.framer.website`).

**Core Goal:** Maintain a standalone, 100% self-hosted, GitHub-deployable static web project with:
- Zero external CDN dependencies for runtime assets.
- Complete removal of Framer branding badges.
- True horizontal scroll on desktop for the homepage.
- Standard vertical reading scroll for all case study (Work) pages.

---

## 2. Sitemap & Route Map

| Page / Route | Local File Path | Canonical Route | Scroll Model | Description |
|---|---|---|---|---|
| **Homepage** | [`output/kyletran.framer.website/index.html`](output/kyletran.framer.website/index.html) | `/` | **Horizontal** (desktop) / **Vertical** (mobile) | Interactive horizontal showcase (Hero, Projects, Works, Playground, About Me, Footer) |
| **Breadslice** | [`output/kyletran.framer.website/work/breadslice.html`](output/kyletran.framer.website/work/breadslice.html) | `/work/breadslice` | **Vertical** (standard) | Case study: Breadslice product design |
| **Unblok** | [`output/kyletran.framer.website/work/unblok.html`](output/kyletran.framer.website/work/unblok.html) | `/work/unblok` | **Vertical** (standard) | Case study: Unblok UX & strategy |
| **Car Doctor** | [`output/kyletran.framer.website/work/cardoctor.html`](output/kyletran.framer.website/work/cardoctor.html) | `/work/cardoctor` | **Vertical** (standard) | Case study: Car Doctor mobile experience |
| **Car Doctor DS** | [`output/kyletran.framer.website/work/cardoctor-ds.html`](output/kyletran.framer.website/work/cardoctor-ds.html) | `/work/cardoctor-ds` | **Vertical** (standard) | Case study: Car Doctor Design System |
| **MAS Pricing** | [`output/kyletran.framer.website/work/mas-pricing.html`](output/kyletran.framer.website/work/mas-pricing.html) | `/work/mas-pricing` | **Vertical** (standard) | Case study: MAS Pricing & billing flow |

---

## 3. Responsive Breakpoints

| Breakpoint Name | Media Query | Framer Variant Hash | Homepage Layout | Work Pages Layout |
|---|---|---|---|---|
| **Desktop** | `(min-width: 1200px)` | `72rtr7` | Full-height horizontal track (`100vh`) with wheel translation | 1-column centered vertical document |
| **Tablet** | `(min-width: 810px) and (max-width: 1199.98px)` | `hhwhds` | Vertical column flow | Responsive vertical document |
| **Mobile** | `(max-width: 809.98px)` | `1ag44uj` | Compact single-column vertical flow | Compact single-column vertical flow |

---

## 4. Design Tokens & Styling System

### 4.1. Color Tokens (`CSS Custom Properties`)

The design system is parameterized through CSS variables defined on `body`:

```css
:root, body {
  /* Brand Accents */
  --token-1b713f29-8467-4eb4-aed8-bd97dff85ae1: #fa680c; /* Primary Orange Accent */
  --token-af72c21c-c33c-46b2-bca0-4e2ec8427cec: #ffc846; /* Warm Yellow / Mid-tone */
  --token-9004448f-e1e1-48c9-879c-4c60476c8b44: #e38042; /* Soft Orange */
  --token-54b71c5e-caea-41f2-af1f-784784f8c485: #e37f8a; /* Pink Accent */
  --token-286ca060-016c-4727-bb4e-86a10f5b9053: #e37f8a; /* Coral / Pink Highlight */
  --token-c8508209-1fe8-4b30-98af-f5a56f3be6e5: #3aab96; /* Mint Teal Accent */
  --token-dfd61118-f2ae-4531-b471-77173305e745: #3a4a9f; /* Deep Indigo / Blue */
  --token-4f9d75e0-de8c-4f23-be62-169d28935002: #697aff; /* Periwinkle / Light Blue */

  /* Neutral Surface & Background Grays */
  --token-1e405527-cf8f-40ad-b369-753edb4fdcdc: #f7f7f7; /* Background Ultra Light Gray */
  --token-48ce423d-fa13-4b7c-adb9-da498cf65491: #f2f2f2; /* Card Neutral Surface */
  --token-1543d3b0-869e-4a49-8dc8-c22fa978a565: #e6e6e6; /* Soft Divider Gray */
  --token-f0faea26-77a6-4de5-a6d3-6422b76a4490: #cccccc; /* Border / Stroke Neutral */
  --token-e2007bde-a5f8-4699-80dc-b6a4224f9adc: #b3b3b3; /* Secondary Text / Line Gray */
  --token-8722ab07-140b-44f8-a44d-a5bee73c377d: #7a7a7a; /* Muted Caption Gray */
  --token-cb9055b0-5488-44c3-a53a-6c1257dcaa92: #3d3d3d; /* Dark Surface Neutral */
  --token-2f20a10a-18f4-455e-af0c-215a63d9250a: #121212; /* Rich Dark Background */
}

@media (prefers-color-scheme: dark) {
  body {
    --token-1b713f29-8467-4eb4-aed8-bd97dff85ae1: #fa8237; /* Adjusted Dark Accent */
  }
}
```

### 4.2. Typography System

| Font Family | Weights / Styles | Primary Application |
|---|---|---|
| **Instrument Sans** | 400, 500, 600, 700, Italic | UI copy, navigation, buttons, subheadings |
| **Mikado** | Regular (400), Bold (700), Medium (500), Light (300), Italic | Primary brand display headings, project titles |
| **EB Garamond** | 400 Italic | Editorial emphasis, quotes, artistic captions |
| **Bungee Shade** | Regular (400) | Retro display text, graphic accents |
| **Fragment Mono** | Regular (400) | Technical metadata, tags, dates |
| **IBM Plex Mono** | 300 Italic | Numbering (`01/`), code annotations |
| **Pixelify Sans** | 400, 700 | Playful retro headings and badges |
| **Inter** | 400, 700, Italic | General fallback, SSR structural fallback |

---

## 5. Component Inventory

### 5.1. Homepage Components (`index.html`)

1. **`Hero` (`.framer-1rmji8s`)**
   - **Tagline Container (`.framer-1c7tm23` / `.framer-6lj0le`):** Large typography intro text: *"Helping teams big and small win through solid & playful UX strategies"*.
   - **Spinning Disc Rig (`.two-discs-rim-spin`):** Dual SVG disc graphic with continuous CSS keyframe rim spin animation (`8s linear infinite`).
   - **Physics Wavy Line Canvas (`$n`):** Interactive spring-physics SVG string that reacts to cursor hover and drag.
   - **Avatar / Illustration Frame (`.framer-48fe9b`):** Floating character visual element.

2. **`PROJECTS` (`.framer-1eeo9ib`)**
   - Section heading tile (`.framer-1z0dutv`) with `01/ Cases` numbering, title, and book graphic.
   - Project cards track linking directly to deep-dive case studies.

3. **`Works` (`.framer-189nece`)**
   - Showcase cards for individual case studies:
     - **Breadslice:** Card with picture frame, cover graphic, title, read time (`5 min read`).
     - **Unblok:** Product design workflow showcase with tags and link to `/work/unblok`.
     - **Car Doctor & Car Doctor DS:** Mobile app UI and Design System systemics.
     - **MAS Pricing:** Enterprise pricing architecture case study.
   - Hover states with interactive scale and elevation effects.

4. **`Playground` (`.framer-1s33beq`)**
   - Section header card (`.framer-so9fdf`).
   - 2-row multi-column grid (`.framer-rl709l`) displaying experimental animations, UI snippets, and interactive explorations.

5. **`About me` (`.framer-13ntcbj`)**
   - Editorial profile section with custom typography (`.framer-11smyc6`), background photo/illustration (`.framer-8y3vvo`), and background narrative.

6. **`Contact & Footer` (`.framer-enliq4` / `.framer-32vixs`)**
   - Dark theme anchor container (`#3d3d3d` surface).
   - "About Me" attribute cards (Horoscope badge: Leo, Personality: INFJ-T, Typefaces: Mikado).
   - Direct mail link (`designedbyburo@gmail.com`).
   - Social links: LinkedIn, Behance, Instagram.

### 5.2. Work / Case Study Components (`work/*.html`)

1. **Navigation Bar / Header:**
   - Sticky top bar with return home arrow icon (`/`) and dynamic project breadcrumb.
2. **Project Hero Header:**
   - Large hero title, summary statement, metadata grid (Role, Scope, Timeline, Tools).
3. **Structured Case Study Body:**
   - Multi-column image & text layouts, before/after comparisons, interactive design system token grids, responsive prototype showcases.
4. **Pagination & Next Project Footer:**
   - Bottom teaser card linking forward to subsequent case studies.

---

## 6. Scroll Behavior Architecture

### 6.1. Homepage: True Horizontal Scroll (`>= 1200px`)

Unlike the default Framer export which simulated scrolling using a `5721px` vertical container with JavaScript 2D translate transforms, the implementation uses **native true horizontal scrolling**:

- **DOM Structure:**
  ```html
  <div id="main">
    <div data-framer-root class="framer-uwW3q framer-72rtr7">
      <div id="trigger" class="framer-obrpb3">
        <div class="framer-1k4toyc" data-hide-scrollbars="true">
          <div class="ssr-variant">
            <main class="framer-vei7ga" data-framer-name="Cards">
              <!-- Side-by-side horizontal cards -->
            </main>
          </div>
        </div>
      </div>
    </div>
  </div>
  ```

- **CSS Guarantees (`<style id="custom-horizontal-scroll">`):**
  - Viewport is locked to `100vw` by `100vh` with `overflow: hidden` on `html, body, #main`.
  - `.framer-1k4toyc` is configured with `overflow-x: auto; overflow-y: hidden; display: block;` to act as the primary scrollport.
  - Centering rules (`place-content: center`, `align-items: center`) are overridden with `align-items: flex-start !important; justify-content: flex-start !important; display: block !important;` to ensure the document **starts at `x = 0` (far left)** without clipping.
  - Native scrollbar is hidden across browsers (`scrollbar-width: none; ::-webkit-scrollbar { display: none; }`).

- **Wheel & Keyboard Motion Script (`<script id="custom-horizontal-scroll-script">`):**
  - Intercepts `wheel` events and translates vertical wheel delta (`deltaY`) directly into horizontal scroll (`container.scrollLeft += delta`).
  - Supports trackpad horizontal swipe, keyboard navigation (`ArrowRight`, `ArrowLeft`, `PageDown`, `PageUp`, `Home`, `End`, `Space`), and touch gestures.
  - Enforces `history.scrollRestoration = 'manual'` and initializes `scrollLeft = 0` across `load`, `DOMContentLoaded`, and post-hydration phases.

### 6.2. Work Pages: Standard Vertical Scroll

All case study subpages (`/work/*`) use standard vertical scrolling across all screen sizes. The viewport has full natural height, and standard mouse/touch scrolling operates unmodified.

---

## 7. Assets Mapping & Structure

All runtime assets are fully local and bundled in [`output/kyletran.framer.website/assets/`](output/kyletran.framer.website/assets/):

```
output/kyletran.framer.website/
├── index.html
├── package.json
├── asset-map.json
├── work/
│   ├── breadslice.html
│   ├── unblok.html
│   ├── cardoctor.html
│   ├── cardoctor-ds.html
│   └── mas-pricing.html
└── assets/
    ├── css/           # CSS styles & SSR chunks
    ├── js/            # JavaScript modules (React runtime, Motion, page components)
    ├── fonts/         # WOFF2 web fonts (Mikado, Bungee Shade, IBM Plex Mono, etc.)
    ├── images/        # Optimized PNG, WebP, AVIF, GIF, SVG assets
    └── data/          # Static JSON indices and metadata
```

- **Local asset map reference:** [`output/kyletran.framer.website/asset-map.json`](output/kyletran.framer.website/asset-map.json) maps every original remote Framer CDN URL to its corresponding local file.

---

## 8. GitHub & Static Hosting Deployment Guide

### Option A: Deploy to GitHub Pages (Recommended)

1. **Option 1: Using GitHub Actions (Automated)**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy Static Site to GitHub Pages

   on:
     push:
       branches: [ main ]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload Artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: 'output/kyletran.framer.website'

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. **Option 2: Using `gh-pages` branch**
   ```bash
   npx gh-pages -d output/kyletran.framer.website
   ```

### Option B: Deploy to Vercel

Run from workspace root:
```bash
npx vercel output/kyletran.framer.website --prod
```

Or configure `vercel.json`:
```json
{
  "outputDirectory": "output/kyletran.framer.website",
  "cleanUrls": true
}
```

### Option C: Deploy to Netlify / Cloudflare Pages

- **Build command:** `(none)` (static site)
- **Publish directory:** `output/kyletran.framer.website`

---

## 9. Verification & Maintenance Checklist

- [x] **Badge-Free:** Ensure no `__framer-badge` element is rendered or displayed.
- [x] **Home Starting Offset:** Confirm homepage always opens at the Hero (`x = 0`), not centered in the middle.
- [x] **Wheel Interactivity:** Test vertical wheel up/down scrolling to verify fluid horizontal track translation.
- [x] **Responsive Check:** Test `< 1200px` (tablet & mobile) to verify smooth fallback to native vertical layout.
- [x] **Local Assets:** Verify that browser network tab shows zero requests to external `framer.com` or `framerusercontent.com` domains.
