# Motion spec — measured from the five reference clips

Every number here was measured from the source footage (1920×1080, 23.976 fps) by frame-level analysis, then used to build
the stages in `assets/stages/`. The five analysis reports are the provenance trail (`references/analysis/clip-0N.md`).

**Conventions.** Frames are raw 0-based (`t = n / 23.976`). Lengths are px at 1920×1080 unless "W". `W` = the flat card side
(842 px). `u` = hero-platform edge (stage 04). **Confidence** is marked where it isn't high: *(med)* / *(low)*.

> **Corrections to the raw reports.** The analysis agents made several errors that were found by rebuilding the stages and
> comparing against the footage. This file carries the corrected values. Where a report and this file disagree, this file wins.
> See "Known corrections" at the end.

---

## 0. The sequence at a glance

| Clip | Length | What happens | Stage |
|---|---|---|---|
| 01 | 3.0 s | Blue wireframe square grows → hard-cut to white card → card materialises → chat content rises in | `01` |
| 02 | 8.1 s | Camera pushes in ×1.237 · base plane defocuses + dims · two callout panels pop from a dot · highlight chips wipe · text streams by word · pull-back | `03` |
| 03 | 6.5 s | Flat card, no camera motion · typewriter reply at 44 chars/s · 3.1 s hold | `01` |
| 04 | 13.2 s | **Hard cut + restyle** → card tilts to dimetric → half-size tiles and 3 full plates rise from *below* and dock into a stack → shadow → two side modules | `02` |
| 05 | 11.6 s | Hold · orbit + dolly onto the platform · modules pop out as lids · rack focus to the far plane · fade-only pills | `04` |

Joins 01→02→03 are seamless (mean abs diff < 1/255). **03→04 is a hard cut with a restyle** (grid and cast shadow removed, card
white → grey `#dadce0`). 04→05 is near-continuous with a +17/+8 px reframe at scale 0.984.

---

## 1. Backdrop and registration (flat scenes)

| | |
|---|---|
| Ground | flat `#ced6e4` (clip 01) / `#d0d8e6` (03) — no vignette |
| Minor grid | **26.35 px** pitch, 1 px, `rgba(60,80,120,.13)`; every 2nd line heavier *(med — may be compression)* |
| Crosshair lattice | **210.8 px** pitch = exactly **8 minor cells**; arms 51 px, 1.2 px, `#767e8c`; origin (117.6, 117.9) |
| Card | square, **843×843** at (538, 118.5) = exactly **4×4 crosshair cells**, square corners; fill `#fcfcfc` → `#f3f3f3` left→right |
| Left glow | broad pale lobe on the *lit* (left) side that **lightens** the ground by about (+11, +13, +15) RGB. It is not a saturated blue and does not darken. |
| Light | upper-left, ≈ 24° below +x |

**Rule: size the card in lattice cells** so its edges sit on grid lines.

## 2. Shadows — hard-offset slabs, not Gaussian drop shadows

- Card shadow: a same-size slab offset **(+144, +55) px** (≈ +17 % W, +6.5 % W), `mix-blend-mode: multiply`, soft edge ≈ 9 px, colour = ground × ~0.55–0.7 (blue-tinted `#929498`), **not black**. Grid lines show through.
- Raised element (message bubble): the same shape offset **(+46, +20)** ≈ 0.42 × the card's vector, 3 px blur, neutral grey gradient.
- **Shadow length encodes height.** Use the ratio to choose layer separation before the card explodes into layers.

## 3. Build-up (clip 01) — wireframe → object → content

| t (frames) | Event | Curve |
|---|---|---|
| −4 → 25 | blue wireframe square (2.5 px `#123c9c`, **one diagonal bottom-left → top-right**) grows from bottom-left corner (536, 960) to 846 px | `cubic-bezier(.4, 0, .2, 1)`, ≈ 1.04 s |
| 25 | **hard cut** wireframe → card (no dissolve). Wire is ~3 px larger than the card on top/right | — |
| 25 → 43 | card colour ramps from backdrop-grey to white: `#c3cddc`(24) `#dae0e5`(28) `#ececee`(32) `#f4f4f4`(36) `#fafafa`(42). **Ease-out, measured.** Grid ghosts through for ≈ 4 frames | ease-out |
| 25 → 40 | shadow slides out to (+144, +55) | ease-out cubic |
| 36 → 44 | header "Nigel 10:45": translateY 11 → 0, fade | ease-out |
| 49 → 58 | bubble rises **91 px**. Measured offsets f49→f55: 91, 64, 44, 31, 20, 12, 7 → **×0.68 per frame** | exponential decay |
| 55 → 60 | bubble *text* rises separately: 12, 7, 3, 1 px — lags the bubble by ≈ 5 frames | — |
| 59 → 66 | avatar rises ≈ 60 px, expo-out | `cubic-bezier(.1,.1,.1,1)` |
| 62 → 71 | label + typing dots rise 20/21 px, **1 frame stagger between dots** | expo-out |

Camera is dead flat. No depth of field, no parallax. Depth is carried by the shadow alone.

## 4. Typewriter reply (clip 03)

dots hold 3 f → fade over ≈ 4 f → **5-frame beat** → constant-rate reveal at **1.857 chars/frame** (≈ 44.5 chars/s, 22.5 ms/char),
per-character fade ≈ 1.5 f, **no caret, no pause at the paragraph break** → hold **74 frames (3.1 s)** perfectly still.
Lay the whole string out first and fade per-character opacity, so lines never reflow.

Type: IBM Plex Sans. Body **35 px** / 41.5 px, 400, `#000`. **Bubble 36 px** / 42, 400. Labels 22 px (600 name, 400 time), time `#525252`.
Avatar 57 px circle `#0f62fe`. "Cora+" label `#0043ce` *(low–med)*. Bubble: 615×118, radii 24 px except top-right 0, padding-x ≈ 46.

## 5. Focus-pull annotation (clip 02) — stage 03

**Camera.** Push-in on a pivot **above the frame** at (956, −376), so the card slides *down* ≈ 215 px as it zooms.
`S: 1 → 1.2373`, f12.5 → f34, `cubic-bezier(.4, 0, .2, 1)`. Pull-back f173 → f192.5, `cubic-bezier(.65, 0, .35, 1)`, back to **exactly 1.000**.

**Focus.** The base plane (card + grid) defocuses to σ ≈ 6 px over f14 → f60 — `σ = 6.2 × (1 − (1 − p)^2.4)`, `p = (f−14)/46` — so blur keeps growing ≈ 1.2 s *after* the camera stops. Grid ≈ 9 px.
It also **dims ≈ 13 %** (`#ced6e4 → #b2bac6`, `brightness(.87)` at f52–60, relaxing to .91). The focal object (message pill) and callouts stay sharp and undimmed.
Release: σ 5.6 → 0.7 over f177 → f192.

**Callout panels** — exactly two, screen-space (they do **not** zoom with the camera):

| | Top-left | Bottom-right |
|---|---|---|
| Box | 513×263 at (256, 115) | 514×265 at (1089, 671) |
| Origin | top-right ≈ (770, 108) | top-left ≈ (1085, 655) |
| Enter | scale 0.018 → 1, **f26 → f37, same frame**, `cubic-bezier(.3,0,.1,1)` | same |
| Exit | f169 → f177, accelerating `(.6,0,.7,.5)` | f171 → f180 (**+2 f**) |

Fill `#303538`, radius ≈ 30 *(est)*, IBM Plex Mono **28 px / 33.5 px**, white text. Words appear whole (opacity step) — **never per-character**:
BR ≈ 2.6 f/word (≈ 9 words/s), TL 3–7 f/word, no caret. Once text overflows, auto-scroll up at **≤ 5 px/frame** (120 px/s) with **8-frame velocity ramps**, clipped by the panel edge; keep the last line 60–80 px above the bottom.

**Highlight chips.** Yellow `#f2cc4a` = problem/emotion · cyan `#82cfff` = action. Radius ≈ 6 px, height ≈ 1 em, `clip-path: inset(0 X% 0 0 round 6px)` — **never `scaleX`** (it squashes the caps).
On the pill they start **≈ 5 f apart in reading order**: lost f17.5 → wallet f21 → cancel f27 → credit card f32, each 11–16 f. The same words appear in the callouts 6–18 f later with their own ≈ 30 f chip wipe, and the text under the chip flips dark. Pill chips wipe out in reading order f176 → f188.

Always-on micro-loop: 3 typing dots, each rises 11 px (6 f), holds 4 f, falls (6 f); **3.5 f stagger; loop 26.7 f**. Keep it in phase across cuts.

## 6. Flat → dimetric → layer stack (clip 04) — stage 02

**It is not an explosion.** Tiles rise from **below the frame** and *converge* into a stack ≈ 1.0 W tall. "Exploded" is only the first ≈ 1 s of each tile's life.

**Camera** — one eased move, orthographic-ish (vFOV ≈ 7°, near-parallel edges, 1.24× floor gradient baked):

| Frames | rotZ | elevation | s (card px) | Notes |
|---|---|---|---|---|
| 3 → 32 | 0 → 44.1° | 90 → 22.4° | 842 → 894 (+6 %) | `cubic-bezier(.42, 0, .45, 1)`, peak 2.1°/f |
| 24 → 54 | ≈ 44° | 23 → 25° | | look-at pan: card centre y 534 → 248 px, ease-out |
| 46 → 168 | 44.5 → 55.4° | 24 → 36.8° | 871 → 386 (×0.43) | slow constant part, then a faster ease-in-out f136–168 |
| 168 → 316 | 55.4 | 36.8 | 386 → 364.5 | near-static drift, **no idle bob** |

Full keyframe table: the `CAM_KF` array in `02-isometric-layer-stack.html` (verified to 2–7 px against the measured card corners at 7 frames).
Edge angles: ≈ 21/22° during the tilt, near true isometric (30/28°) only around f114–132, **end asymmetric 40.9°/22.4°** (yaw 55.4, elev 36.8). 2:1 (26.57°) is crossed at f84–96.

**Layers** (top-face depth below the card top, in W — ±0.05):

| Layer | Depth | Thickness | Final form |
|---|---|---|---|
| card | 0 | 0.012 | flat grey UI plate |
| tier 2 | 0.13 | 0.045 | 2×2 grid of **half-size tiles** (grey · black · charcoal) |
| tier 3 | 0.28 | 0.045 | 2×2 half-size tiles (pale-blue · navy · white-grey · bright-blue) |
| glass | 0.33 | 0.06–0.10 | full size, ≈ 38 % blue, bright rim `#2f7bff`, navy lower edge |
| integration | 0.68 | 0.04–0.07 | full size, translucent smoky-grey, faint hex line-art |
| openshift | 0.97 | 0.025–0.05 | full size, white-grey, **red edge `#aa4a60`**, envelope line-art |

Tiles in a tier **sit coplanar at the end**, so each tier reads as one slab with a split-colour front. Plan positions are final from f60; **only Z moves**.
Gaps between top faces: 0.13, 0.15, 0.05 W (dense group) then 0.35 and 0.29 W for the two big plates.

**Entrance.** Stagger **≈ 5 f (0.2 s)** inside the early group, **≈ 20 f (0.85 s)** between the big plates. Each plate decelerates with no overshoot.
First-pixel frames: 37, 40, 47, 52, 57–62, 76, 83 (glass), 103, 125 (OpenShift). Measured approach (excess above final, in W):

- glass: `0.22·e^(−(f−100)/22) + 0.24·e^(−(f−100)/30)` (resid 0.026 W)
- openshift: `0.28·e^(−(f−144)/12) + 0.04·e^(−(f−144)/25)` (resid 0.022 W)

A single exponential does **not** fit — use two terms.

**Backdrop.** At f0 the ground is a *defocused lattice* of '+' marks (pitch ≈ 183 px) — a **rack focus** (f36–50) makes it crisp, and a faint hairline grid appears f44–50. It is not a grid-for-field replacement.
**Floor shadow** arrives *last* (f148–170): stair-stepped silhouette of the stack, lower-right, ≈ 0.68 multiply, with a **red bounce** under the lowest plate.
**Card** brightens ≈ 8 % over f136–170 (`#d6dadd → #e8ecef`).

**Pills** — screen-space, 61 px tall, Plex Sans ≈ 26 px, 1 px `#636a7a` stroke, fill ≈ ground, **constant size**, placed *beside* (not on) the tile, no leader lines.
Fade in 3–4 f, hold 20–32 f, out 4–6 f; lag the tile's first pixels by 7–10 f.

**Side modules** (f186–264): Db2 builds from 3–6 nested L pieces over 20–50 f; Enterprise data is a 5–6 tile tangram that slides flush. Both hover ≈ 0.1 W above their own shadow. Connector lines (1–2 px, one dark-blue, one grey each side) grow **after** the module (linear).

## 7. Platform scene (clip 05) — stage 04

**Rhythm: hold · move · hold · move · hold.**

| n | | |
|---|---|---|
| 0–5 | hold | don't start the camera on frame 0 |
| 3–63 | **MOVE 1** (2.5 s) | `cubic-bezier(.50, 0, .40, 1.05)`; hero zoom ×2.18; orbit + dolly, **not** 2D scale |
| 63–148 | HOLD 1 (3.6 s) | all object animation happens here; drift < 0.3 % |
| 149–211 | **MOVE 2** (2.6 s) | `cubic-bezier(.45, .10, .50, 1.0)`; zoom ×1.36; **rack focus coupled to this move** |
| 211–278 | HOLD 2 (2.8 s) | static |

**Camera mapping** — clip 05's azimuth is measured from the other axis: **`rotZ = 91.4 − azimuth`** (verified: edge angles at n0 / hold 1 / end = (−40.8, 22.3) / (−21.2, 29.8) / (−19.0, 34.8) vs reported (40.9, 22.4) / (31.0, −20.0) / (36.1, −18.1)).
Camera origin was **solved from measured vertices, not from the report's "target"** — see the pitfall below.

**Depth of field** (σ px, `blur()`): Hold 1 — hero 0.8, top plate 3.8, hex/red 3–4, right platform + box 4.1. Move 2 — hero **0.8 → 7.2**, far plane **4.1 → 1.7**, crossing at ≈ 3 px near n180. Hold 2 — hero 7.2, right 1.7.

**Modules come out of the platform as lids.** The inset outline square flattens → lifts as the lid (**same colour as its quadrant**) → glass walls fade in, cavity goes near-black navy → contents grow from the floor, ease-out. Stagger 10–16 f. `cubic-bezier(0, 0, .3, 1)`.

| Module | Flatten | Lid rise | Contents |
|---|---|---|---|
| bars cube | n39–44 | n44–58, ≈ 0.20 u | walls n46–58 · bars scaleY 0→1 from n53, **1–2 f stagger**, 8–10 f each |
| lattice cube | n56–60 | n60–73 | 4×4×4 cubes revealed under the lid (front/bottom first) |
| data box | n66–68 | n68–80 | walls extrude with the lid |

**Lattice colour wave** (left → right, 16 f): green n61–112 → blue n113–129 → green n153–170 → blue n238–249 (final). Per-cube `mix(green, blue, smoothstep(w−.15, w+.15, x))`.
**Connector dash** — 41×8 px white capsule at S2 (≈ 14×3 at S0) looping along a *static* line every **8.67 f (0.36 s)**, right → left, first launch n65. Do not lock to 24 fps.

**Pills — opacity only.** 11 f in · ≈ 1.84 s hold · 11 f out. Transparent fill, 1.5–2 px `#959da8` outline, 60 px tall, Plex Sans ≈ 28 px, `#010a13`. No slide, no scale.
"Foundational model" + "Watson Discovery": n72–139, **0-frame stagger**, anchored left edge = lid right vertex, centre = lid top vertex. "Data source": n175–275, tracks the box at constant px size.

---

## Easing vocabulary (measured)

| Name | Curve | Used for |
|---|---|---|
| standard | `cubic-bezier(.4, 0, .2, 1)` | wireframe grow, camera push-in |
| expo-out | `cubic-bezier(.1, .1, .1, 1)` / ×0.68 per frame | UI rise-in |
| panel-in | `cubic-bezier(.3, 0, .1, 1)` | callouts from a dot |
| panel-out | `cubic-bezier(.6, 0, .7, .5)` | callouts collapse (accelerating) |
| pull-back | `cubic-bezier(.65, 0, .35, 1)` | camera return |
| decel | `cubic-bezier(0, 0, .3, 1)` | lids, modules |
| tilt | `cubic-bezier(.42, 0, .45, 1)` | flat → dimetric |

No overshoot anywhere in UI motion. The only >1 handle is the camera move-1 curve (`1.05`).

## Known corrections (found by rebuilding the stages against the footage)

| Source | Said | Actually |
|---|---|---|
| clip 01 recipe | card opacity 0.86 → 1.0 | card **colour** ramps backdrop-grey → white over ≈ 18 f; opacity alone cannot reproduce it |
| clip 01 recipe | bubble text rises 27 px | text trails the bubble by only ≈ 5 px |
| clip 01 recipe | wire diagonal: top-left → bottom-right | **bottom-left → top-right** |
| clip 01 recipe | glow is a saturated blue | broad pale lobe that *lightens* the ground |
| clip 03 report | bubble font 35 px | **36 px** (body is 35) |
| clip 02 draft | pull-back ends 0.997 | **1.000** (tracker drift) |
| all brief | overview `f_001` = t 0.00 | overview frames are **+2 raw frames** (the `fps=4` filter dropped the first two decodes) — never time from them |
| brief | clip 01 = blank title card | already contains the chat content; the card builds up |
| brief | clip 04 = explosion; text changes | tiles **converge from below**; text never changes |

## Pitfalls that cost real time

1. **A CSS `filter` on a `preserve-3d` element flattens the whole scene.** The stack collapses into one plane. Put blur on a **flat wrapper** above the 3D world (stage 04's `#focus`).
2. **Don't convert a report's "target shift" into a camera origin** when the orbit angles change — the offset must be rotated, not just scaled. Solve the origin from measured vertices instead (3 vertices agreeing to 3 px is the sanity check).
3. **PSNR is the wrong judge for 3D stages.** Every `+` mark and rotated glyph is a sub-pixel mismatch. Verify the **camera** by projecting known corners against measured corners, then judge the look visually.
4. **Translucent layers need explicit back-to-front DOM order** in CSS 3D (append the deepest plate first).
5. A single exponential does not fit a docking plate — it falls fast then has a long tail. Fit two terms.
6. Pills are screen-space: project the anchor each frame, offset, and never scale them.
