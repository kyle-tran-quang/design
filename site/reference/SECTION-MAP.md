# Section map: Designed by Kyle homepage (reference capture)

Source: `output/kyletran/index.html`, served locally by `site/reference/capture.mjs` (Playwright, Chromium, DPR 1, light scheme, motion allowed). All boxes are CSS px and are relative to `main[data-framer-name="Cards"]` (the horizontal track on desktop, the document column on tablet and mobile). Raw data: `desktop.json`, `tablet.json`, `mobile.json` (per element), `states-*.json` (hover, character, wavy line), `appear-*.json` (animation timeline), `screenshots/`.

## 1. Discrepancies with the plan (read first)

| # | Plan said | Measured | Impact |
|---|---|---|---|
| 1 | `main` holds six sections side by side | `main` has **3 wrappers**: `#hero` (`framer-1rmji8s`), `#projects` (`framer-p5kvx2`) and an unnamed one (`framer-10e8aaf`) that holds Playground, About me and Contact. The six sections exist inside them. | Sub-task 4 builds 3 wrappers, not 6 siblings. |
| 2 | The wavy line is in the hero (and the hero has a "character") | **The hero has neither.** The hero is: tagline, `KYLE TRAN` headline (Bungee Shade), "Now at IBM Ireland", and the `home-hero-chibi-buro.gif` image (link to `#aboutme`). The **wavy line is a vertical pill divider** (`aria-label="Elastic wavy line"`) between sections: 3 on desktop (x=2022, 4884, 5515), 2 on tablet, 1 on mobile. | Sub-task 5 scope changes. The wavy line belongs to a shared divider component. |
| 3 | `CharacterCutout` is in the hero | It is in the **Footer** card area (desktop box x=8614, y=565, 144×144). It is absent on mobile (not rendered). | Move to the Footer sub-task. |
| 4 | The spinning disc is in the hero | `.two-discs-rim-spin` is in the **Playground heading tile** (desktop x=5079, y=612, ~212×212, with an inner rotating disc). | Move to the Playground sub-task. |
| 5 | Works has 5 cards (Breadslice, Unblok, Car Doctor, Car Doctor DS, MAS Pricing) | **Works has 2 large cards** (MAS Pricing, CarDoctor). The other three are the small cards of a separate **"…and some extras!"** subsection (`Extras`, `framer-1ww2m32`): Unblok, CarDS, Breadslice. | Sub-task 6 needs two card variants. |
| 6 | Heading tile reads `01/ Cases` | Text is `01/` and `Case studies` (the layer is named "Cases"). | Copy. |
| 7 | Playground has 7 media tiles | **8 tiles** in a 4×2 grid: `home-playground-01..07` plus `shared-cards-carousel-anim.webp`. Hover swaps in a caption overlay (see §4). | Sub-task 7. |
| 8 | Mail is `designedbyburo@gmail.com` | Rendered text and `mailto:` are **`kyletrandesign@gmail.com`**. `designedbyburo@gmail.com` is only a leftover layer name, and `AGENTS.md` §5.1 repeats the stale address. | Use `kyletrandesign@gmail.com`. Fix `AGENTS.md` later. |
| 9 | Footer shows Leo, INFJ-T, Mikado | Visible: Horoscope **Leo (7 Aug)**, Illustrations **by me (yay!)**, Favorites **Plushies**, Fonts **Mikado**. `INFJ-T` / `Personality` exist only as layer names (confirmed: no rendered text node contains them). | Copy. |
| 10 | Nothing about a last panel | An **orange "or…back to beginning." panel** (x=9306, 572×900, link `./index.html#hero`, hover swaps fill to white) ends the track. It is hidden on tablet and mobile. | New block in the Footer sub-task. |
| 11 | "Projects" heading plus cards | Between the cards there are decorative 73×196 SVG blocks (desktop x=3591 and x=7132) in addition to the wavy pills. | Spacers/arrows to identify in Sub-task 2. |
| 12 | Hero image only | The page background is `#f2f2f2` (hero) over a white `body`. Tablet shows a 77px white strip under the hero because the hero is 691px high in a 768px viewport. | Check in Sub-task 3 tokens. |

## 2. Desktop track (1440×900, `scrollWidth` 9878, max `scrollLeft` 8438)

Everything is a `display:flex` row with `gap: 80px` between the items below (measured: every item starts exactly 80 after the previous one). Section height is 900 (the viewport).

| x start | x end | w | Block | Notes |
|---|---|---|---|---|
| 0 | 1440 | 1440 | **Hero** `#hero` | bg `rgb(242,242,242)`. Text column x=80 w=1280 (y 203 to 697). Chibi frame x=540 y=704 w=360 h=180 (image box 540,504 380×380 in the `a`). |
| 1440 | 5053 | 3613 | **Projects** `#projects` (wrapper) | padding 160 left, 40 right |
| 1600 | 1942 | 342 | Heading tile `Frame 2`, y=90 h=720 | `01/` (Mikado Light 36, `#fa680c`), `Case studies` (Mikado Medium 36, `#121212`), books graphic 310×165 at y=629 |
| 2022 | 2151 | 129 | Wavy pill 1, y=269 h=362 | |
| 2231 | 3511 | 1280 | **Works**, y=90 h=720 | 2 cards, each 600×720, x=2231 and x=2911, gap 80, radius 32 |
| 3591 | 3664 | 73 | SVG block, y=352 h=196 | |
| 3744 | 4804 | 1060 | **Extras**, y=188 h=524 | title `…and some extras! ✦`, 3 cards 300 wide, gap 80 |
| 4884 | 5013 | 129 | Wavy pill 2 | |
| 5053 | 7132 | 2079 | **Playground** `#playground` | |
| 5093 | 5435 | 342 | Heading tile, y=90 h=720 | `02/`, `Playground`, discs at x=5079 |
| 5515 | 5644 | 129 | Wavy pill 3 | |
| 5724 | 7052 | 1328 | Showcase grid, y=134 h=633 | CSS grid, 4 columns × 2 rows, tile 320×~308 |
| 7132 | 8306 | 1174 | **About me** `#aboutme` | |
| 7132 | 7205 | 73 | SVG block | |
| 7285 | 7745 | 460 | Text, y=342 h=216 | `Me as a person` (Mikado Medium 64, `#fa680c`, ls -2.56px, lh 67.2px) + paragraph |
| 7825 | 8226 | 401 | Portrait GIF 401×401, y=250 | |
| 8306 | 9878 | 1572 | **Contact** | |
| 8306 | 9306 | 1000 | **Footer** (dark `#3d3d3d`) | two rotated cards: "More about me" and "Let's get in touch!"; `CharacterCutout` at (8614,565) 144×144 |
| 9306 | 9878 | 572 | Orange panel `or…back to beginning.` | link `./index.html#hero`, Mikado Regular 64 white, arrow icon |

### Suggested scrollLeft anchors (as captured): 0, 1440, 2880, 4320, 5760, 7200, 8438.

## 3. Tablet (1024×768) and mobile (390×844)

Native vertical document, `main` is a flex column. No horizontal track.

| Block | Tablet x, y, w, h | Mobile x, y, w, h |
|---|---|---|
| `main` (gap) | 0,0,1024,6630 (**gap 80**) | 0,0,390,7772 (**gap 40**) |
| Hero | 0,0,1024,691 | 0,0,390,760 |
| Projects wrapper | 0,771,1024,2407 | 8,800,374,2317 |
| Heading tile | 28,831,968,280 | 24,840,342,369 |
| Works | 28,1320,968,440 (grid, 2 columns) | 24,1248,342,888 (stacked) |
| Extras | 28,1800,968,1318 | 24,2177,342,711 |
| Playground | 0,3258,1024,2426 | 0,3157,390,3409 |
| Playground heading | 24,3282,976,232 | 16,3237,358,356 |
| Showcase grid | 24,3763,976,1897 (grid) | 16,3617,358,2869 |
| About me | 0,5684,1024,562 | 0,6566,390,670 |
| Contact/Footer | 107,6246,810,384 | 0,7236,390,536 |

Differences from desktop: the orange "back to beginning" panel is not rendered. Wavy pills are horizontal (tablet: 2, mobile: 1). `CharacterCutout` is present on tablet (312,6417, 144×144) and **not** on mobile. Works cards use the `Tablet` / `Default (Mobile)` variants and the Extras cards the `Default (Mobile)` / `Read-more-mobile` variants. Variant switching uses the hashes `72rtr7` / `hhwhds` / `1ag44uj`.

## 4. Content (visible text, links, images)

**Hero:** "Helping teams big and small win through solid & playful UX strategies", "— since 2021", `KYLE TRAN` (Bungee Shade, 188.9px, ls -5.667px, lh 151px, `#fa680c`), "Now at **IBM Ireland**" (Mikado Regular 24 `#7a7a7a` + Mikado Medium 24 `#3d3d3d`). Link: `./index.html#aboutme` (tablet/mobile: `./#aboutme`). Image: `./assets/images/home-hero-chibi-buro.gif`.

**Projects:**
- Heading: `01/`, `Case studies`. Image: runtime src is `framerusercontent.com/images/fjyJscBAT7tDCffFObMTrCn5zSw.png`, maps to `/assets/images/home-projects-books-graphic.webp`.
- Works card 1: `IBM`, `2026`, "Giving IBM Maximo sellers the control they need to cut 30% deal time", `20 mins read`; link `./work/mas-pricing.html`; image `./assets/images/home-works-card-mas-pricing.avif`.
- Works card 2: `CarDoctor`, `2024`, "Design (rescue) CarDoctor to boost revenue to $1M", `20 mins read`; link `./work/cardoctor.html`; image `./assets/images/shared-card-cardoctor.avif`.
- Extras: `…and some extras!`; "Dream hacking to unlock creativity with Unblok and Apple Watch sensors" (`./work/unblok.html`, `shared-card-unblok-1024w.avif`); "Transforming CarDoctor's Design System for 2x agility in 4 months" (`./work/cardoctor-ds.html`, `home-readmore-card-cardoctor-ds.avif`); "2.5 years, 1 designer and a stillborn Breadslice" (`./work/breadslice.html`, `shared-card-breadslice.avif`). Tablet/mobile links drop `.html` (`./work/unblok`).

**Playground:** `02/`, `Playground`; 9 inline `data:` images build the disc graphics (these must be extracted in Sub-task 3). Tiles: `home-playground-01.gif`, `-02.webp`, `-03.gif`, `-04.avif`, `-05.gif`, `-06.gif`, `-07.avif`, `shared-cards-carousel-anim.webp`. Captions (revealed on hover) exist for tiles 1 to 4: (1) "Carbon Next visualization for IBM Maximo Predictive asset health and Condition insights, giving a full overview of outstanding asset issues", (2) "A new expression for AI-native Maximo, designed to hide complexity until complexity becomes useful, to progressively disclose the right action, at the right time.", (3) "IBM Maximo visualization for modules & AppPoints currency usage, with the aim to help sellers and customers understand what they're using and how much they cost.", (4) "Braun Design Playbook concept, with the aim to commemorate Braun's 100th year anniversary." Tiles 5 to 8 show a `Text` layer whose content is not rendered as text (empty in the dump), so they have no caption.

**About me:** `Me as a person`, paragraph "Everyday I overthink about how people experiences a product, push through chaos, build with AI, until I see something that finally works.", image `home-about-me-portrait.webp` (runtime src is a `framerusercontent.com` GIF URL).

**Footer:** "More about me" card (Horoscope / Leo (7 Aug), Illustrations / by me (yay!), Favorites / Plushies, Fonts / Mikado; image `shared-footer-about-me-card.png`). "Let's get in touch!" card: Drop me a line: `kyletrandesign@gmail.com` (`mailto:`), Life, work & stuff: LinkedIn `https://www.linkedin.com/in/kyletrandesign/`, Behance `https://www.behance.net/tranquang4`, Instagram `https://www.instagram.com/teaquang`, "(c) '26, by Kyle." in orange. Orange panel: "or…back to beginning." → `./index.html#hero`.

## 5. Behavior measured

**Hover (desktop, `states-desktop.json`, 19 targets; before/after diffs plus screenshots):**
- Works card: card fill `transparent` → `#e6e6e6`, "Shoulder" bar `#f2f2f2` → `#0f62fe`, title/year text `#7a7a7a` → `#f7f7f7`, text shifts up 1 to 2px. Cursor pointer.
- Extras card: picture frame gets a 3-layer `box-shadow` (`0 -10px 8px -2.75px rgba(0,0,0,.11)` plus two smaller), image `filter: brightness(.9)`.
- Playground tile: caption `Text` goes from a 160px white strip to a full-tile `rgba(0,0,0,.1)` overlay (height 160 → ~308, `display:flex → block`). Needs a closer look in Sub-task 2 for the exact reveal.
- Social and mail links: `color` and `border-color` `#f7f7f7` → `#697aff`.
- Orange panel: fill `#fa680c` → `#fff`, text and arrow `#fff` → `#fa680c`.
- Hero Chibi link: no visual change, cursor `none`.
- Tablet: Works cards (`Tablet` variant) show no hover change (cursor `auto`); the Extras cards change `BGImage` transform and the frame moves ~18px (a scale-down of about 0.9×, exact matrix in `states-tablet.json`). Mobile has no hover capture (touch).

**Character (`CharacterCutout`, footer, 6 s idle trace + click):** blinks start at 828 / 3411 / 5827 ms (gap 1.6 to 2.6 s as coded), the open-eye opacity dips for ~117 ms. Idle spin 36° over 6.0 s (6°/s). Eye tracking offsets (SVG units): right-near 4.68, far 6.67 (= 8px × 120.065/144). Click → ~1000 ms, spin about +360° (22° → 388°), smile arcs reach opacity 1 at ~280 ms, hold until ~800 ms, open eyes back at ~1080 ms. Matches the constants in `CharacterCutout.tsx`.

**Wavy line (`states-*.json`, 480 frames per trace):** SVG `viewBox="-42 -8 84 294"` inside a pill (`rect rx=55.7`, stroke `#e6e6e6`, width 17.4, viewBox `0 0 128.8 361`). One `<path>` of 394 points (1.5 unit steps), gradient fill (`#e6e6e6 → #ccc → #b3b3b3 → #b3b3b3 → #ccc → #e6e6e6`). At rest the x extent is ±10.6 (a travelling bump). Hover: ±10.1 (small change). Drag: x extent -0.65 … +33.6. Release: swings to -25.7 within 120 ms, settles back to ±10.6 within ~2.3 s. Cursor `grab`, `touch-action:none`. Full per-frame data and the sampled `d` strings are in `states-*.json`.

**Appear animations (`appear-*.json`, per-frame trace of 161 frames; times are ms after the `load` event):**

| id | element | from | to | start | end (settled) |
|---|---|---|---|---|---|
| `1c7tm23`, `6lj0le` | tagline text, "Now at IBM Ireland" | y -80 | 0 | 500 ms | ~1230 ms (tween 0.7 s, ease [0.44,0,0.56,1]) |
| `i65qer` | `KYLE TRAN` | y 260 | 0 | 500 ms | ~1230 ms |
| `12o2df9` | headline wrapper | scale 1.1, opacity .001 | 1, 1 | ~600 ms | ~1030 ms (spring) |
| `17csumr` | Chibi image | x -240, opacity .001 | 0, 1 | ~0 ms | ~630 ms |
| `w7diy9` ×5 | work/extras card bodies | x -146 to -150, opacity ~.03 | 0, 1 | starts as each card is reached | ~415 to 500 ms |
| (disc) | `two-discs-rim-spin` | rotates continuously | 8 s per turn | | |

The declared values (all three breakpoints) are in `declaredAppearAnimations`. Cards in Works and Extras also sit inside container wrappers (`framer-4j56oj-container`, …) that fade in the first time they enter the viewport (opacity ≈ .05 → 1 in ~500 ms, then stay). The `scrollReveal` block of `appear-desktop.json` only partly captured this (it flagged just the first card as hidden), so **Sub-task 2 should re-measure the container fade chain** before writing the spec.

## 6. Capture notes and caveats

- **Network:** the only request that left the machine was `https://framer.com/edit?…` (Framer's editor hook, aborted). The export's `srcset` still lists ~10 `framerusercontent.com` candidates, which the capture answered from the local file named in `asset-map.json` (list in `network-log.json`). Without that substitution seven images render blank at runtime, so **the live export still depends on `framerusercontent.com` for some `srcset` candidates**. Three 404s for `/assets/js?framerSiteId=…` come from the same editor script. Both are harmless for the rebuild.
- Reveal sweep: the capture scrolls the page once before shooting so that scroll-triggered fades have fired, then returns to `scrollLeft = 0`.
- Screenshots use `animations: "disabled"` for layout shots; the states and appear shots use `animations: "allow"`.
- Determinism: two full dump runs agree to ≤0.5px on 363 of 370 desktop elements (356/349 tablet, 322/326 mobile); the rest are the rotating disc and its children (up to 7px, expected, a rotating box).
- Hover on mobile was not captured (no hover on touch). Character states were not captured on mobile (not rendered).
- Font note: computed families are `"Mikado Regular"`, `"Mikado Medium"`, `"Mikado Light"`, `"Bungee Shade"` with Framer "Placeholder" fallbacks; text-style values (size, weight, line height, letter spacing) are in the JSON per element.

## 7. Proposed diff tolerance (for `compare.mjs`)

These are proposals to agree on. Values marked "to verify" have not been measured yet.

| Check | Proposed tolerance | Basis |
|---|---|---|
| Layout boxes (x, y, w, h) of static elements | **±1 px** (exact target ±0.5) | Reference repeats to ≤0.5px across runs (except rotating elements) |
| Rotating or animated elements (discs, character, wavy line, GIF/WebP tiles) | Compare size/position of the **unrotated parent**, mask the content in pixel diffs | The disc box varies by up to 7px with rotation |
| Computed `font-family`, `font-weight`, `color`, `background-color`, `border-radius` | **Exact string match** | Deterministic in the reference |
| Computed `font-size`, `letter-spacing`, `line-height`, `gap`, `padding` | **±0.5 px** | Fractional values such as 188.9px and -5.667px exist |
| Pixel diff per section (static regions) | **≤ 0.5 % of pixels differ** at per-pixel threshold 0.1 (pixelmatch), anti-aliasing ignored | Font rasterisation and sub-pixel text. **To verify** by diffing two captures of the reference with itself in Sub-task 4 |
| Animation timing (transform/opacity samples at 0, 0.5, 1, 2 s) | **±50 ms** on start/end, **±2 px** on translate, **±0.05** on opacity | Frame granularity ~16.7 ms, spring curves are approximated |
| Scroll smoothing | Settle time ±100 ms for a fixed wheel input | Same lerp (0.22) is ported as-is |
| External requests | **0** to `framer.com` / `framerusercontent.com` | AGENTS.md §9 |

## 8. Files

`capture.mjs` (re-run: `node reference/capture.mjs [--bp=desktop,tablet,mobile] [--steps=shots,dump,states,appear]` from `site/`), `desktop.json`, `tablet.json`, `mobile.json`, `states-{desktop,tablet,mobile}.json`, `appear-{desktop,tablet,mobile}.json`, `network-log.json`, `screenshots/{desktop,tablet,mobile}/` (scroll positions, per-section, `states/`, `appear/`, full-page on tablet and mobile).
