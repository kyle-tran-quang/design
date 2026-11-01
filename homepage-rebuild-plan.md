# Homepage Rebuild Plan: Designed by Kyle (from scratch)

## Top-Level Overview

**Goal:** Rebuild the homepage of the portfolio from scratch as readable source code. The current static export in `output/kyletran/` is minified Framer output and is hard to maintain. The rebuild must match the export 1:1 in layout, typography, color, motion and interaction.

**Decisions confirmed with the user**
- Stack: Astro + React islands, plain CSS (no Tailwind). React is used only for interactive pieces: the character, the wavy line and the horizontal scroll.
- New folder: `site/` at the repo root. `output/kyletran/` stays untouched as the reference.
- Reference: only the local static export `output/kyletran/index.html`, captured with Playwright. There is no Figma file.
- Scope: homepage first. Work/case study pages come later, in a separate plan.

**Approach:** Capture, then analyze, then build.
1. Capture the reference as hard data (screenshots, computed styles, bounding boxes, animation specs) at the three breakpoints.
2. Turn that data into a spec and design tokens.
3. Build section by section.
4. Verify each section against the capture using pixel and metric diffs.

**Why not read the minified code directly:** The visual truth is the rendered DOM. Capturing computed styles and boxes with Playwright gives exact values without decoding Framer's CSS presets. The hand-written custom code is already readable and is ported as-is: the `custom-horizontal-scroll` style and script in `index.html`, and `assets/components/CharacterCutout.tsx`.

### Evidence gathered so far

| Topic | Finding | Source |
|---|---|---|
| Breakpoints | Desktop `>=1200px` (`72rtr7`), tablet `810–1199.98px` (`hhwhds`), mobile `<=809.98px` (`1ag44uj`) | `index.html` line 451 and line 462 |
| DOM skeleton | `#main > [data-framer-root] > #trigger.framer-obrpb3 ("Horizontal scroll clip") > .framer-1k4toyc ("Scroll") > .ssr-variant > main.framer-vei7ga ("Cards")` | `index.html` line 451 |
| Sections (class order to verify in capture) | Hero `#hero` `.framer-1rmji8s`; Projects `.framer-1eeo9ib`; Works `.framer-189nece`; Playground `.framer-1s33beq`; About me `.framer-13ntcbj`; Footer/Contact `.framer-enliq4` | `AGENTS.md` §5.1, `index.html` line 451 |
| Section anchors | `projects`, `hero`, `playground`, `aboutme` | `data-framer-hydrate-v2` attributes, line 451 |
| Horizontal scroll (desktop only) | `.framer-1k4toyc` is the scrollport (`overflow-x:auto`, scrollbar hidden). `main` is `display:flex; width:max-content`. `html/body/#main` are locked to 100vw × 100vh | `<style id="custom-horizontal-scroll">`, line 279 |
| Scroll script | The wheel handler uses the larger of `deltaY` and `deltaX` and calls `preventDefault`. Smoothing is `scrollLeft += diff * 0.22` per rAF, stopping when `abs(diff) <= 0.5`. `deltaMode` 1 is multiplied by 24 and mode 2 by `innerHeight`. Nested vertical scrollers are skipped. | `index.html` lines 474–662 |
| Keyboard | Arrow Right/Down move +140px and Left/Up move −140px. PageDown/Space move +0.75 × innerWidth, PageUp/Shift+Space move the opposite way. Home/End jump to the ends. Ignored in inputs. | lines 617–653 |
| Scroll persistence | `scrollRestoration = manual`. Clicking a `/work/` link saves `scrollLeft` to `sessionStorage["hs_scroll_pos"]`, which is restored on return. Otherwise it starts at 0. | lines 495–525 |
| Hero disc | `.two-discs-rim-spin`, 8s linear infinite rotate, disabled under `prefers-reduced-motion` | `index.html` lines 452–455 |
| Character | `CharacterCutout.tsx`: SVG mask eyes, idle spin 6°/s, blink every 1.6–2.6s with a 1/6 double-blink chance, click triggers a 1000ms happy spin, eye tracking max 8px with 360px falloff | `assets/components/CharacterCutout.tsx` |
| Wavy line | A physics spring string that reacts to hover and drag (`wavy-line-*` in `page-home.js`). Constants must be extracted. | `AGENTS.md` §5.1, `assets/components/page-home.js` |
| Appear animations | `1c7tm23` (hero tagline): y −80→0, delay 0.5s, 0.7s tween, ease [0.44,0,0.56,1]. `12o2df9`: opacity 0.001→1 and scale 1.1→1, delay 0.6s, spring, bounce 0.2, 0.4s. `i65qer`: y 260→0 (remaining params and any other ids still to be extracted). | `<script type="framer/appear">`, line 461 |
| Tokens | 16 color tokens (accent `#fa680c`, dark-mode accent `#fa8237`, grays `#f7f7f7` to `#121212`, plus yellow, pink, teal, indigo, periwinkle) | `AGENTS.md` §4.1 |
| Fonts | Mikado (300/400/500/700 + italics), Bungee Shade, IBM Plex Mono Light Italic, plus IBM Plex Sans/Serif/Condensed and Be Vietnam Pro files present in `assets/fonts/` | `assets/fonts/` |
| Images | `home-hero-chibi-buro`, `home-projects-books-graphic`, `home-playground-01..07`, `home-about-me-portrait`, `shared-card-{breadslice,cardoctor,unblok}`, `home-works-card-mas-pricing`, `home-readmore-card-cardoctor-ds`, `shared-footer-about-me-card`, `shared-cards-carousel-anim` | `assets/images/` |
| Repo tooling | Root `package.json` already has Astro 7.3.5, `@astrojs/react` 7, React 19, TS strict. `vercel.json` builds to `dist/`. The GitHub Pages workflow currently deploys `output/kyletran`. | repo root |
| Open gap | The Framer `framer-styles-preset-*` values (size, weight, line-height, letter-spacing) are minified. They are recovered via computed styles in Sub-task 1, not by decoding CSS. | `index.html` line 142 |

### Target structure

```
site/
  astro.config.mjs, package.json, tsconfig.json
  public/assets/{fonts,images}        # copied from output/kyletran/assets
  src/
    pages/index.astro
    layouts/BaseLayout.astro
    styles/{tokens.css, fonts.css, base.css, home.css}
    components/home/{Hero,Projects,Works,Playground,AboutMe,Footer}.astro
    components/interactive/{CharacterCutout,WavyLine,HorizontalScroll,AppearOnLoad}.tsx
  reference/                          # captures: screenshots, specs, json
    capture.mjs, compare.mjs
```

The sub-tasks below are designed to run one at a time, each reviewable on its own.

---

## Sub-Tasks

### 1. Reference capture and measurement
- **Intent:** Produce the objective ground truth that every later step is verified against.
- **Expected Outcomes:**
  - Full-page and per-section screenshots at 1440×900, 1024×768 and 390×844.
  - A JSON dump per breakpoint with, for every visible element: tag, `data-framer-name`, bounding box relative to the scroll track, and computed font, color, spacing, border, radius, shadow, transform and opacity.
  - A section map with exact x-offsets and widths along the horizontal track.
  - Screenshots of hover states and animation frames, taken at 0s, 0.5s, 1s and 2s after load.
- **Todo List:**
  1. Add a Playwright dev dependency and write `site/reference/capture.mjs`. Serve `output/kyletran` locally and block external network requests.
  2. Set the viewport per breakpoint, wait for hydration, and screenshot the viewport at several `scrollLeft` positions on desktop. Also take a full-height screenshot on tablet and mobile.
  3. Walk the DOM under `main[data-framer-name="Cards"]` and dump the metrics to `site/reference/<breakpoint>.json`.
  4. Record hover and interaction states for each card and link, the character (idle, blink, happy) and the wavy line (idle, hover, drag).
  5. Record the appear-animation timeline by sampling transforms at fixed times after load.
  6. Write `site/reference/SECTION-MAP.md` with the section order, widths, gaps, text, links and images (src paths).
- **Relevant Context:** `output/kyletran/index.html` (lines 279–662 for custom code), `AGENTS.md` §3 and §5.1, `assets/images/`.
- **Status:** [x] done. Output is in `site/reference/`: `capture.mjs`, `{desktop,tablet,mobile}.json`, `states-*.json`, `appear-*.json`, `network-log.json`, `screenshots/`, and `SECTION-MAP.md` (discrepancies with this plan, content, measured behavior and the proposed diff tolerance). `site/package.json` holds Playwright as a dev dependency.

### 2. Graphify analysis and behavior spec
- **Intent:** Use the knowledge graph to find where the interactive logic lives, then write an exact behavior and design spec to build from.
- **Expected Outcomes:**
  - `site/reference/SPEC.md` covering tokens, type scale, per-section layout, and interaction and motion specs for each breakpoint.
  - The wavy-line physics constants and algorithm extracted from `page-home.js`.
  - The complete appear-animation table (every id, per breakpoint).
  - Graph updated, with `graphify query` used to cross-check module relationships.
- **Todo List:**
  1. Run `graphify query` for the wavy line, the hero, the hover/dropdown, and the scroll cluster ("Portfolio Architecture & Horizontal Scroll", community 50). Follow with `graphify path` and `graphify explain` where useful.
  2. Locate the wavy-line component in `assets/components/page-home.js` and `assets/js/toplevel-deps.js`. Extract the spring constants, anchor points, pointer interaction and render method.
  3. Extract all entries from `__framer__appearAnimationsContent` and map each id to its element.
  4. Check `update_ft_component.cjs` and the `nav-hover-window` patch (the hover dropdown on the scroll-parallax image component). Decide whether it is part of the homepage and document it.
  5. Convert the captured computed styles into the type scale, spacing scale and color tokens. Replace Framer hash names with semantic names.
  6. Document the hover states and the card link targets (`/work/*`).
  7. Run `graphify update` for the new `site/` folder once it is added (per AGENTS.md).
- **Relevant Context:** `graphify-out/GRAPH_REPORT.md`, `assets/components/page-home.js`, `assets/js/toplevel-deps.js`, `update_ft_component.cjs`, `assets/components/CharacterCutout.tsx`.
  - **From Sub-task 1 (read `site/reference/SECTION-MAP.md` §1 first):**
    - `main` has 3 wrappers (`#hero`, `#projects`, and an unnamed one holding Playground, About me and Contact), not 6 siblings. Desktop track is 9878px wide with 80px gaps. Tablet and mobile are flex columns (gap 80 and 40).
    - The hero has no character and no wavy line. `CharacterCutout` is in the Footer card area (absent on mobile). The wavy line is a vertical pill divider component (`aria-label="Elastic wavy line"`, 3 on desktop, 2 on tablet, 1 on mobile). The `two-discs-rim-spin` is in the Playground heading tile. This changes the scope of Sub-tasks 5 to 8, which should be re-split after the spec.
    - Works has 2 large cards; the other 3 are "…and some extras!" small cards. Playground has 8 tiles. There is a last orange "or…back to beginning." panel on desktop. Mail is `kyletrandesign@gmail.com`; `AGENTS.md` §5.1 has a stale address.
    - Wavy line: the DOM is `viewBox="-42 -8 84 294"`, one `<path>` of 394 points (1.5 unit steps), gradient fill. Per-frame traces of idle, hover, drag and release are in `states-*.json` (`wavy[].trace`). The physics functions in `page-home.js` start around `Jn`/`Yn` (search for `wavy-line-`). Use the traces to validate the extracted constants.
    - Appear animations are traced per frame in `appear-*.json` (`declaredAppearAnimations` has all six ids for all three breakpoints: `1c7tm23`, `12o2df9`, `i65qer`, `6lj0le`, `17csumr`, `w7diy9`). The scroll-triggered fade of the Works/Extras container wrappers (`framer-*-container`) was only partly captured and needs a re-measure. The hover on Playground tiles (caption strip to overlay) also needs a closer look.
    - The export still requests ~10 `framerusercontent.com` `srcset` candidates at runtime; the capture served them from `asset-map.json`. Nine images in the Playground heading are inline `data:` URIs that must be extracted for the rebuild.
    - Capture caveats: run `node reference/capture.mjs` from `site/`. The full states run takes 2 to 3 minutes per breakpoint, so run it as a background process. The proposed tolerances are in `SECTION-MAP.md` §7, and the pixel threshold is still to be verified with a reference-vs-reference diff.
- **Status:** [ ] pending

### 3. Project scaffold, tokens, fonts and assets
- **Intent:** Create the empty, buildable `site/` project with the foundation every section depends on.
- **Expected Outcomes:**
  - `npm run dev` in `site/` serves a blank page with correct fonts and tokens.
  - Fonts and images are copied and self-hosted, with no external requests.
  - Tokens exist as semantic CSS custom properties (the dark-mode accent is included).
- **Todo List:**
  1. Create `site/` with an Astro + React config. Decide between a self-contained `site/package.json` and a root workspace. Keep the root `astro` scripts working.
  2. Add `tokens.css` (16 colors, dark-mode accent override), `fonts.css` (`@font-face` for the Mikado, Bungee Shade and IBM Plex Mono files, `font-display` set) and `base.css` (reset).
  3. Copy the needed fonts and the homepage images into `site/public/assets`. Prefer the optimized variants (webp, avif, gif) the export already uses.
  4. Add `BaseLayout.astro` with the title, description, canonical, OG and Twitter meta from the export, the favicon and apple-touch icons (self-hosted), and no Framer badge or editor bar.
- **Relevant Context:** `AGENTS.md` §4, `output/kyletran/index.html` lines 1–30, `assets/fonts/`, `asset-map.json`.
- **Status:** [ ] pending

### 4. Horizontal scroll shell
- **Intent:** Build the horizontal track first. All sections sit inside it, and it is the riskiest behavior to get right.
- **Expected Outcomes:**
  - Desktop (≥1200px): a locked 100vw × 100vh viewport with a hidden-scrollbar horizontal scrollport and a flex track.
  - Wheel, trackpad, keyboard and touch behave exactly as in the reference (0.22 lerp, 140px keyboard step, 0.75 × viewport paging, Home/End).
  - Scroll position is saved when leaving for `/work/*` and restored on return.
  - Tablet and mobile fall back to native vertical flow.
- **Todo List:**
  1. Write `HorizontalScroll.tsx` as a client island (or a small inline module) that ports the behavior listed above. Use the same constants.
  2. Write `home.css` shell rules: scrollport, track and breakpoint media queries.
  3. Add placeholder section blocks with the measured widths from `SECTION-MAP.md`.
  4. Run `compare.mjs` on the section x-offsets and widths. Wheel-test the smoothing curve against the reference.
- **Relevant Context:** `output/kyletran/index.html` lines 279–442 (CSS) and 474–662 (script); `AGENTS.md` §6.
- **Status:** [ ] pending

### 5. Hero section (disc, tagline, character, wavy line)
- **Intent:** Build the most complex section, which carries the main interactions.
- **Expected Outcomes:**
  - Hero matches the reference at all three breakpoints (tagline, disc, character, avatar).
  - The disc spins at 8s linear and respects reduced motion.
  - `CharacterCutout` is ported unchanged apart from import cleanup.
  - The wavy line is re-implemented from the extracted spec and reacts to hover and drag like the reference.
  - Load-in animations (tagline y −80→0, image spring scale) match delay, duration and easing.
- **Todo List:**
  1. Build `Hero.astro` with the measured layout and copy: "Helping teams big and small win through solid & playful UX strategies" and its second line.
  2. Add `CharacterCutout.tsx` (copied from `assets/components/`) with `client:load`.
  3. Write `WavyLine.tsx` from the SPEC (spring physics, pointer, reduced motion).
  4. Write `AppearOnLoad` (CSS or WAAPI) for the entrance animations, using the appear table.
  5. Run the screenshot diff and the animation timeline comparison.
- **Relevant Context:** `assets/components/CharacterCutout.tsx`, `assets/components/page-home.js`, `index.html` lines 452–461, `assets/images/home-hero-chibi-buro.gif`.
- **Status:** [ ] pending

### 6. Projects and Works sections
- **Intent:** Recreate the "01/ Cases" heading tile and the case study cards that link to `/work/*`.
- **Expected Outcomes:**
  - The Projects heading tile (numbering, title, books graphic) and the Works cards (Breadslice, Unblok, Car Doctor, Car Doctor DS, MAS Pricing) match the reference, including text, tags, read time and links.
  - Card hover states (scale, elevation and any other effect) match the reference.
  - Links point at the same targets as the export. Decide whether to keep `.html` links or move to clean URLs, because the work pages are still the old export for now.
- **Todo List:**
  1. Build `Projects.astro` and `Works.astro` (with a shared `Card.astro`).
  2. Apply the captured styles and hover transitions.
  3. Wire links, and confirm the scroll-position save works for these links.
  4. Run the section diffs at all breakpoints.
- **Relevant Context:** `AGENTS.md` §5.1 items 2 and 3, `assets/images/shared-card-*`, `home-works-card-mas-pricing`, `home-projects-books-graphic`, `shared-cards-carousel-anim`.
- **Status:** [ ] pending

### 7. Playground and About me sections
- **Intent:** Recreate the experiments grid and the editorial profile section.
- **Expected Outcomes:**
  - The Playground header card and the 2-row grid of seven media items (`home-playground-01..07`) match the reference.
  - The About me section (custom type, portrait `home-about-me-portrait`, narrative copy) matches the reference.
  - Hover and animation behavior of the GIF and media tiles matches the reference.
- **Todo List:**
  1. Build `Playground.astro` and `AboutMe.astro`.
  2. Confirm the media tile sizes, the grid gaps and the lazy loading behavior from the capture.
  3. Run the section diffs.
  4. Build and deploy a preview, then report the URL.
- **Relevant Context:** `AGENTS.md` §5.1 items 4 and 5, `assets/images/home-playground-*`, `home-about-me-portrait*`.
- **Status:** [ ] pending

### 8. Footer and Contact
- **Intent:** Complete the last section of the track.
- **Expected Outcomes:**
  - The dark footer (`#3d3d3d` surface) with the about-me attribute cards (Leo, INFJ-T, Mikado), the mail link (`designedbyburo@gmail.com`) and the social links (LinkedIn, Behance, Instagram) matches the reference.
  - Link hrefs are verified against the export.
- **Todo List:**
  1. Build `Footer.astro`.
  2. Verify the social URLs from the export HTML.
  3. Run the section diffs, and a full-track diff on desktop.
- **Relevant Context:** `AGENTS.md` §5.1 item 6, `assets/images/shared-footer-about-me-card*`.
- **Status:** [ ] pending

### 9. Responsive pass, accessibility and 1:1 verification
- **Intent:** Close the gaps and prove the match across breakpoints and states.
- **Expected Outcomes:**
  - Tablet (810–1199) and mobile (≤809) layouts match the reference screenshots.
  - A diff report (`site/reference/DIFF-REPORT.md`) shows screenshots, box metrics and animation timing within an agreed tolerance for every section, with any remaining differences listed.
  - Keyboard focus, `alt` text, reduced motion and landmarks are sensible. Behavior changes versus the export are listed explicitly.
  - Zero network requests to `framer.com` or `framerusercontent.com`.
- **Todo List:**
  1. Finish `compare.mjs` (pixel diff plus box and style diff, per section and per breakpoint).
  2. Fix the discrepancies section by section.
  3. Audit network requests and the console.
  4. Run `npm run build` and `astro check`, and preview the build.
- **Relevant Context:** `site/reference/*`, `AGENTS.md` §9 checklist.
- **Status:** [ ] pending

### 10. Deployment wiring and graph sync
- **Intent:** Make the new site deployable without breaking the existing one, and keep project docs accurate.
- **Expected Outcomes:**
  - Deployment builds `site/` while `output/kyletran` stays available as the reference. The decision on whether to switch is confirmed with the user first.
  - `AGENTS.md` and `graphify-out/` are updated to describe `site/`.
- **Todo List:**
  1. Update `.github/workflows/deploy.yml` and `vercel.json` only after the user approves the switch. Both currently point at `output/kyletran` and `dist/`.
  2. Add a `site/README.md` with run and build instructions.
  3. Update `AGENTS.md` with the new structure.
  4. Run `graphify update site` (the mandatory sync rule in `AGENTS.md` §10.2).
- **Relevant Context:** `.github/workflows/deploy.yml`, `vercel.json`, root `package.json`, `AGENTS.md`.
- **Status:** [ ] pending

---

## Open Questions and Risks

- **Wavy line physics:** It lives in minified code, so the capture and the extraction in Sub-task 2 may only approximate the original. The result is verified visually by hover and drag recordings.
- **Hidden hover dropdown:** `update_ft_component.cjs` patches a `nav-hover-window` into the scroll-parallax image component. The work pages use a similar dropdown (`ScrollRotateIcon.tsx`). It needs a decision on whether the homepage has one.
- **Section order and gaps:** The order above comes from class names. Sub-task 1 confirms it from measured x-offsets.
- **Link format:** Decided: keep the `.html` links to the old work pages for now. The preview's `site/` build must still serve `output/kyletran/work/*.html` for those links to resolve, either by copying the work pages into the preview output or by linking to the production site. Choose the approach in Sub-task 3.
- **Preview deployment access:** It depends on Vercel (or another host) being logged in and linked on the user's machine. This is checked at the start of Sub-task 3, and the user is asked if it is missing.
- **Pixel tolerance:** The exact tolerance for the diff, for example sub-pixel text differences from font rendering, is agreed on at Sub-task 1.
