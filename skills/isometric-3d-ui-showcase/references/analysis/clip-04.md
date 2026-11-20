# Clip 04 - forensic motion analysis (isometric build-up of the layered stack)

All frame numbers are RAW 0-based decoded frame indices of `Nested Sequence 04.mp4` (t = n / 23.976). Every dense frame was extracted straight from the mp4 and verified against `select=eq(n,N)` (PSNR 43.6 dB vs ~21 dB for neighbours). The pre-extracted `f_###.jpg` overview frames were used only as visual aids, never for timing.
Measured with: hull/quad fits of the card top face (frames 0-46, 54-316), backward ECC from frame 170 for 125-170 (hull is contaminated there), template-matched floor crosses, colour-class segmentation, pixel-column kymographs. Scratch + scripts: `analysis/work/clip-04/`.

## 1. Summary

- 317 frames, 13.22 s, 1920x1080, 23.976 fps, h264 + AAC (continuous music bed, no silence, true peak -6.1 dBFS, LRA 1.7 LU).
- Narrative: the grey flat chat card (the same card as clip 03, restyled) tilts into a dimetric 3D view, the camera drops down and pulls back while a set of labelled half-size tiles and three full-size plates rise in from BELOW the frame and dock under the card one group after another, until a 6-level "architecture stack" (card, tier 2, tier 3, blue glass plate, Integration plate, OpenShift plate) with a soft floor shadow remains. Then two side modules (blue "Db2 Warehouse", white "Enterprise data") build in on the floor with connector lines. The final 4.5 s are almost static.
- IMPORTANT corrections to the brief hypothesis (all verified):
  1. It is NOT an outward explosion. The layers start far below the card (about 1 card-width, mostly off-screen), rise toward it and CONVERGE to a compact stack (card top to OpenShift top about 0.96 x card width, about 1.04 x to the bottom of its red edge). "Exploded" is only the first ~1 s of each tile's life.
  2. The text does NOT change. It stays "12XX XXXX XXXX 4567?" (read at full res in frames 0, 20, 40, 316). The "12XXXXXXXXXX 4567??" impression came from low-res rotated text.
  3. Layers below the card are 2x2 GRIDS OF HALF-SIZE TILES (each tile = one labelled component, colours differ per tile) that sit coplanar at the end so each tier reads as one full-size slab with a split-colour front face. There are 3 full-size single plates at the bottom of the stack (glass, dark translucent, white/red).
  4. The background is not "a field that replaces the grid": at frame 0 it is already a defocused lattice of '+' marks (pitch about 183 px) on a smooth bluish ground; a rack-focus (frames 36-50) makes them crisp and a very faint hairline grid appears with them (frames 44-50).
  5. Camera is a long lens (near-orthographic, vFOV about 7 deg) and the final view is ASYMMETRIC dimetric (yaw 55.4 deg, elevation 36.8 deg, edge angles 40.9 / 22.4 deg), not true isometric. The camera passes through near-true-isometric around frames 114-132 only.
- 03 -> 04 boundary is a HARD CUT with a restyle (confirmed, see section 5).

## 2. Element inventory

Card side `W0` = 842 px at frame 0. Ratios "x W" = fraction of the card side. Colours are decoded-video sRGB averages (+/- 3 levels; compression noise).

| id | what | geometry | material / colour | z-order | notes |
|---|---|---|---|---|---|
| BG | ground colour | full frame | #d2dae8 at f0 (#d1d9e4 at f316) flat, no vignette | back | constant after f0 |
| CROSS | '+' marks on the floor plane (look like 'x' at yaw 45 deg) | arms about 20 px on screen at f316; floor lattice spacing about 0.24 W (u about 81 px, v about 64 px at f316; cells grow 1.24x top->bottom of frame) | darkest px #9aa2ae over bg, 1 px stroke, about 35-40% opacity | on floor | blurred blotches at f0-36, crisp from f46 |
| HAIR | fine isometric hairline grid on floor | about 1/4 of cross pitch | about +/-1.5 levels contrast | on floor | visible only after f46-50 |
| CARD | UI plate "User Interface" | 842x831 px flat (bbox x538-1381, y128-959 = same box as clip 03 last frame); thickness about 0.012 W | face #d9dde0 (f0-f140 #d6dadd) brightens to #e8ecef (blank patch) / #fcfcfd (bright zones) from f150-180; thin dark-grey rim about #8a898f | top of stack | text IBM Plex Sans (see sec. 6); raised white bubble with a grey offset "shadow slab" #97999d, avatar #174fcb |
| T2W | tile "Cora chat" | half size (0.5 W square) | top #8e8e8e, left face near-white #f9f9f9, inset 1-2 px black outline square | tier 2, W cell | label pill "Cora chat" |
| T2E | tile "NeuralSeek" | 0.5 W | top #232323, bevel #58595c, right face #0b0b0d, inset outline | tier 2, E cell | pill |
| T2S | tile "Cora Broker" | 0.5 W | top #424242, left bevel #6a6c71, right #0b0b0d | tier 2, S cell | pill; arrives later than T2W/T2E (first pixels f47 vs f37/f40) and settles at f83, so it is the last tier-2 tile to dock |
| T3N | tile "watsonx.ai" | 0.5 W | top #5c88eb / #5072c7, edge #051b59 | tier 3, N cell (hidden under card at the end) | pill |
| T3W | tile "Cloud Pak for B.A." | 0.5 W | translucent steel/pale blue #7589b1..#bed0f6 | tier 3, W cell | pill |
| T3E | tile "watsonx Assistant" (A) | 0.5 W | navy #0e2360 / #1d42a4 / top #102a74 | tier 3, E cell | pill |
| T3S | tile "watsonx Assistant" (B) | 0.5 W | pale grey-white glass gradient #b0b6bf..#f5f5f8, edge white | tier 3, S cell | second pill with the same text |
| GLASS | plate "watsonx.governance" | full size, thickness about 0.12 W, top face 0.33 W below the card top | translucent blue: top about #88a4e4 (about rgba(15,98,254,0.38) over the ground), bright electric-blue top rim (#2675eb), navy lower edge #0e2360/#0d2453 | below tier 3 | darkens toward the front because the next plate shows through |
| INTG | plate "Integration" | full size, thickness about 0.05 W, top face 0.70 W below the card top | dark translucent blue-grey: rosy-grey #c6bbc1 at back-left to #3c405b front-right; faint hex/circuit 1 px lines #8a8e9c; front face #8a8088-#97919b | below glass | pill |
| OSH | plate "Red Hat OpenShift" | full size, thickness about 0.06 W, top face 0.95-0.96 W below the card top | top white-grey #e6e5eb..#ccc4cc with thin grey + red line art (envelope-like diagonals); edge red #aa4a60 (shades to #40151c) | bottom | pill; red glow on floor (#6a5a64) |
| SHADOW | floor cast shadow | stair-stepped silhouette of the stack, falls to screen lower-right, about 0.6 W x 0.9 W | #8e939e core (about 0.68 multiply on the ground), softer edge, red tint under OSH, pale-blue glints at 2 spots | on floor | appears f148-170 |
| PILL x13 | label capsules | about 61 px tall, widths 183-283 px | 1 px stroke about #636a7a, text #464958, fill about #d2d6d9 (near ground) | 2D overlay tethered to its tile | constant 61 px height (not scaled by the camera) but moves with the tile (see pill table) |
| DB2 | side module "Db2 Warehouse" | about 0.9 W wide on screen, thickness about 0.06 W, hover about 0.1 W above own shadow | three nested L-shaped steps, gradient bright blue #8dadf3/#aec5f5 to lavender-cream #d5daeb | left of stack, floor | built f186-208 |
| ENT | side module "Enterprise data" | about 0.95 W wide, thickness about 0.06 W | white #f0f0f2 slab made of 5-6 tangram tiles that slide flush; side #d1d8e7; underside #727888 | right of stack | built f212-264 |
| CONN | connector lines | 1-2 px | one dark-blue (#1b3fa0-ish) + one grey line per side, run from the side modules to the stack at about OSH level | floor | Db2 side f204-212, ENT side about f234-250 |

## 3. Timeline

Time = frame / 23.976. "conf" = high/med/low. Camera values from the frame-indexed table below.

| start f | start s | end f | end s | element | property | from -> to | easing | conf |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.00 | 2 | 0.08 | CARD/CAM | hold flat | rotZ 0, elev 90, s 842 | - | high |
| 3 | 0.13 | 32 | 1.34 | CAM | rotZ (clockwise, CSS rotateZ(+)) | 0 -> 44.1 deg | ease-in-out (progress 0.15 @f8, 0.33 @f12, 0.52 @f16, 0.71 @f20, 0.86 @f24, 0.96 @f28); about cubic-bezier(0.42,0,0.45,1), peak 2.1 deg/f at f10-22 | high |
| 3 | 0.13 | 34 | 1.42 | CAM | elevation above floor | 90 -> 22.4 deg (min f34; settles 22.9-23.1) | same tween as rotZ; max rate -3.3 deg/f at f8-16; about 0.6 deg undershoot | high |
| 3 | 0.13 | 30 | 1.25 | CAM | card side in px (zoom) | 842 -> 894 (+6.2%), peak 902 at f34 | ease-in-out + small overshoot | med |
| 24 | 1.00 | 54 | 2.25 | CAM | look-at pan: card centre y | 534 -> 248 px (about -30 px/f at f34-46) | ease-out (decel to 0 at f54) | high |
| 34 | 1.42 | 168 | 7.01 | CAM | zoom-out (s) | 902 -> 386 px (x0.43) | slow constant part f46-136 (870->549, about -3.7 px/f), then faster ease-in-out f136-168 (549->386, up to -8 px/f at f144-156), eases out | high |
| 36 | 1.50 | 50 | 2.09 | BG/CROSS | rack-focus pull: blotches -> crisp crosses (+ hairline grid appears f44-50) | defocused -> sharp | ease-in; contrast 4% at f39, 12% at f45, 70% at f48, 100% by f51 (high-pass energy) | high |
| 37 | 1.54 | 60 | 2.50 | T2W (Cora chat) | rises from below frame, docks under card | first pixels at bottom edge f37; fully in view f48; about 0.45 W below card at f60 | decelerating (ease-out), no overshoot | med |
| 40 | 1.67 | 62 | 2.59 | T2E (NeuralSeek) | same | first pixels f40; in view f46 | ease-out | med |
| 47 | 1.96 | 83 | 3.46 | T2S (Cora Broker) | rises and docks. Measured front-vertex drop below the card front vertex / (s*cos e), W units: 0.73 (f50, clipped), 0.66 (f56), 0.58 (f59), 0.51 (f62), 0.44 (f65), 0.38 (f68), 0.33 (f71), 0.26 (f74), 0.21 (f77), 0.19 (f80), 0.18 (f83-86, final; the remaining 0.18 is its plan offset) | first pixels f47 | near-linear approach (about -0.025 W/f) from f56 to f71, then brakes to a stop by f80-83 with no overshoot: best fit quadratic ease-out (1-(1-t)^2), start f57, duration 29 f (1.2 s); a cubic ease-out fits worse (rss 0.0026 vs 0.0010), expo-out much worse. Use cubic-bezier(0.33, 0.1, 0.5, 1)-ish or easeOutQuad | med-high (f56-86) |
| 52 | 2.17 | 84 | 3.50 | T3N (watsonx.ai) | same | first pixels f52-53 | ease-out | med |
| 57 | 2.38 | 90 | 3.75 | T3W + T3E | same (both arrive together) | first pixels f57-62 | ease-out | med |
| 76 | 3.17 | 100 | 4.17 | T3S (Assistant B) | same | first pixels f76-78 | ease-out | med |
| 83 | 3.46 | 180 | 7.51 | GLASS | rises and docks; bottom of its front face, below the card's front vertex, in card-side units W (measured as dy / (s * cos elev)): >=0.91 (f96, clipped by frame bottom), 0.85 (f100), 0.80 (f104), 0.71 (f108-116), 0.63 (f120), 0.58 (f128), 0.54 (f136), 0.50 (f144), 0.48 (f148), 0.45 (f156), 0.43 (f164), 0.42 (f168), 0.40 (f176+, final) | first pixels f83-84; plate fully visible f94 | ease-out with a long tail (it lags the camera settle, still moving at f168) | med |
| 103 | 4.30 | 150 | 6.26 | INTG | same (first pixels at bottom f102-106; fully visible f126) | - | ease-out | med |
| 125 | 5.21 | 184 | 7.68 | OSH | docks; bottom of its red front edge, below the card's front vertex, in card-side units W (dy / (s * cos elev)): 1.35 (f144), 1.28 (f148), 1.23 (f152), 1.19 (f156), 1.15 (f160), 1.12 (f164), 1.09 (f168), 1.07 (f172), 1.05 (f176-196), 1.04 (f260-316, final) | first pixels f125-128 | monotonic ease-out, about 40 f from f144, no overshoot (remaining distance to final: 0.31, 0.24, 0.19, 0.15, 0.11, 0.08, 0.05, 0.03 at 4-frame steps from f144, i.e. about x0.77 per 4 f) | high (f144+) |
| 114 | 4.75 | 165 | 6.88 | CAM | rotZ 45 -> 55.4 deg (+10.4); elev 34.0 -> 36.8 (+2.8) | slow f108-132 (+3.6 deg), fast f138-156 (0.3 deg/f), settle by f165 | ease-in-out | high |
| 136 | 5.67 | 170 | 7.09 | CARD | face brightness | #d6dadd -> #e8ecef (blank patch); bright zones #fcfcfd | follows camera settle (lighting/exposure ramp) | med |
| 148 | 6.17 | 170 | 7.09 | SHADOW | floor shadow appears and grows | 0 -> final footprint | fade/grow with OSH docking | med |
| 40 | 1.67 | 280 | 11.68 | PILLS x13 (per-pill table below) | opacity | 0 -> 1 in about 4-6 f; hold 22-30 f (Db2 and Enterprise about 50-62 f); 1 -> 0 in about 4-6 f | linear/ease | high for timing (border-line detector, +/-1 f, see pill table below the stagger summary) |
| 163 | 6.80 | 180 | 7.51 | CAM | last small settle then near-static | s 386 -> 380 | ease-out | high |
| 188 | 7.84 | 208 | 8.68 | DB2 | tile builds: tiny pale-blue square hovering above its own shadow (f188) -> second L-piece (f192) -> nested 3-step L (f196) -> full size (f200-208) | scale/grow + nested pieces slide | ease-out | med |
| 204 | 8.51 | 212 | 8.84 | CONN (Db2 side) | line grows toward stack | 0 -> full | linear | low |
| 212 | 8.84 | 264 | 11.01 | ENT | white tile appears (f212), grows to 4-6 loose tiles (f214-222), tangram slides flush (f224-264) into one slab with faint seams | piece-wise slide + scale | ease-out | med |
| 234 | 9.76 | 250 | 10.43 | CONN (ENT side) | second pair of lines | 0 -> full | - | low |
| 180 | 7.51 | 316 | 13.18 | CAM | slow drift: s 380 -> 364.5 (-4.1%, about -0.13 px/f), card cy 318 -> 326 (+8 px), rotZ 55.4 -> 55.3, elev 36.8 -> 36.6 | linear | high |
| 180 | 7.51 | 316 | 13.18 | STACK | idle bob / float | none measured: tier offsets constant to within 1-2 px from f184 to f316 (OSH bottom edge 1.04 W, glass 0.40 W, Integration 1.00 W at f184-316) | - | high |

Stagger summary (frame at which each group's first pixels cross the bottom edge, which depends on the camera pan so it is only a proxy for Z-timing): Cora chat 37, NeuralSeek 40, Cora Broker 47, watsonx.ai 52, Cloud Pak/Assistant A about 57-62, Assistant B 76-78, governance glass 83, Integration 103, OpenShift 125. Gaps: 3, 7, 5, 5, 15-20, 6, 20, 22 frames. First five tiles come at about 5 frame (0.2 s) stagger, then the large plates come about 20 f (0.85 s) apart. Pill-in lags tile-first-visible by about 7-10 f for the early group.

Pill windows, MEASURED with a detector for the pill's two horizontal 1 px borders 57-65 px apart (strength about 50 = fully visible, <8 = invisible). Raw frames. "in start" = first detection (about 15% opacity), "full" = first frame at >= 80% of peak strength, "out start" = last frame at >= 80%, "gone" = last detection. Fade-in about 4-5 f (about 0.2 s), fade-out about 5 f (about 0.2 s), hold at full opacity 20 f (Cora chat) to 56 f (Db2/Enterprise). Pills are NOT static in screen space: each is tethered to its tile (offset constant relative to the tile), so it moves with the tile and with the camera, but its size is constant (61 px tall, the capsule does not scale with the zoom).

| # | pill | in start | full | out start | gone | screen x start -> end (left edge) | screen y start -> end (top border) | width px |
|---|---|---|---|---|---|---|---|---|
| 0 | User Interface | 42 | 47 | 67 | 72 | 87 -> 161 | 306 -> 246 | 208 |
| 1 | NeuralSeek | 46 | 51 | 72 | 77 | 1653 -> 1573 | 934 -> 363 | 181 |
| 2 | Cora chat | 47 | 51 | 73 | 77 | 129 -> 198 | 800 -> 362 | 159 |
| 3 | Cora Broker | 51 | 55 | 75 | 79 | 1345 -> 1281 | 970 -> 535 | 182 |
| 4 | watsonx.ai | 59 | 60 | 78 | 82 | 438 -> 481 | 988 -> 501 | 170 |
| 5 | Cloud Pak for B.A. | 68 | 69 | 88 | 92 | 87 -> 163 | 990 -> 488 | 262 |
| 6 | watsonx Assistant (right-hand tile) | 70 | 72 | 88 | 93 | 1576 -> 1536 | 993 -> 473 | 253 |
| 7 | watsonx Assistant (lower tile) | 76 | 76 | 93 | 98 | 1300 -> 1272 | 1008 -> 588 | 254 |
| 8 | watsonx.governance | 87 | 91 | 119 | 125 | 123 -> 222 | 982 -> 547 | 289 |
| 9 | Integration | 108 | 111 | 131 | 135 | 291 -> 356 | 999 -> 689 | 177 |
| 10 | Red Hat OpenShift | 161 | 166 | 195 | 201 | 388 -> 394 | 616 -> 572 | 255 |
| 11 | Db2 Warehouse | 211 | 217 | 274 | 279 | 169 | 627 | 229 |
| 12 | Enterprise data | 224 | 228 | 274 | 279 | 1419 -> 1430 | 130 -> 129 | 216 |

Notes: y start values near 930-1008 for pills 1-9 are the first detection at the bottom of the frame, so those pills enter from the bottom edge together with their tiles and travel 300-570 px up (the pill rides the tile). The delay between a group's tile first appearing and its pill reaching full opacity is about 7-10 f for the early group. Stagger between consecutive pill-ins: 4, 1, 4, 8, 9, 2, 6, 11, 21, 53 (then 63) frames. Pills that appear together visually: Cora chat + NeuralSeek (f47-51), Cloud Pak + watsonx Assistant (f68-72). Sizes: font-metrics identical across pills; capsule width = text width + about 46 px; text about 26 px IBM Plex Sans Regular, tracking 0.

Motion-energy (mean |frame diff| of luma): f3-39 0.6-3.4 (peak f9); f40-100 rises to 13.1 at f49 (tile entry + focus pull + labels), plateau 8.2-8.6 at f57-75, decays to 5 by f103; f103-133 4.7 -> 3.6; f134-153 bump 3.7 -> 5.0 (final camera move); f154-178 decays to 0.05; f179-316 about 0.05-0.7 with spikes at f196 (1.79), f200 (2.22), f218-221 (about 1.2), f229 (1.46), f315 (0.72).

### Frame-indexed camera table

`s` = card side in screen px (weak-perspective, horizontal scale), `rotZ` = in-plane yaw clockwise from the flat state (CSS rotateZ), `elev` = camera elevation above the floor (90 = top-down; CSS rotateX = 90 - elev), `cx,cy` = card centre on screen. Frames 47-53 are unreliable (top vertex leaves frame; interpolate), and f114 yaw is noisy (true about 45.5). Uncertainty about +/-1 deg, +/-1% s.

| f | t (s) | s | rotZ | elev | cx | cy |
|---|---|---|---|---|---|---|
| 0 | 0.00 | 842 | 0 | 90 | 959 | 544 |
| 2 | 0.08 | 838 | 0.3 | 90 | 958 | 542 |
| 4 | 0.17 | 840 | 1.3 | about 88 | 961 | 540 |
| 6 | 0.25 | 845 | 3.9 | 81.0 | 960 | 540 |
| 8 | 0.33 | 841 | 6.7 | 79.7 | 959 | 538 |
| 10 | 0.42 | 848 | 10.7 | 72.9 | 962 | 540 |
| 12 | 0.50 | 850 | 14.6 | 66.4 | 959 | 538 |
| 14 | 0.58 | 857 | 18.5 | 59.0 | 958 | 540 |
| 16 | 0.67 | 860 | 22.7 | 53.4 | 963 | 534 |
| 18 | 0.75 | 870 | 26.9 | 47.0 | 957 | 538 |
| 20 | 0.83 | 872 | 31.4 | 41.9 | 957 | 533 |
| 22 | 0.92 | 875 | 34.7 | 37.1 | 960 | 536 |
| 24 | 1.00 | 874 | 37.7 | 32.9 | 956 | 534 |
| 26 | 1.08 | 886 | 39.2 | 28.6 | 952 | 533 |
| 28 | 1.17 | 894 | 42.3 | 25.8 | 963 | 519 |
| 30 | 1.25 | 894 | 43.4 | 24.0 | 962 | 500 |
| 32 | 1.33 | 893 | 44.1 | 23.0 | 961 | 476 |
| 34 | 1.42 | 902 | 43.7 | 22.4 | 961 | 446 |
| 36 | 1.50 | 891 | 44.0 | 22.9 | 961 | 418 |
| 38 | 1.58 | 887 | 44.6 | 22.9 | 964 | 388 |
| 40 | 1.67 | 889 | 44.0 | 23.1 | 957 | 359 |
| 42 | 1.75 | 876 | 45.0 | 23.5 | 962 | 333 |
| 44 | 1.84 | 872 | 44.4 | 23.7 | 960 | 309 |
| 46 | 1.92 | 871 | 44.5 | 24.2 | 957 | 286 |
| 54 | 2.25 | 841 | 43.0 | 25.2 | 954 | 248 |
| 60 | 2.50 | 822 | 43.7 | 26.6 | 958 | 257 |
| 66 | 2.75 | 797 | 43.9 | 27.5 | 958 | 272 |
| 72 | 3.00 | 774 | 44.0 | 28.4 | 955 | 280 |
| 78 | 3.25 | 750 | 44.6 | 29.4 | 961 | 284 |
| 84 | 3.50 | 739 | 43.0 | 29.7 | 951 | 284 |
| 90 | 3.75 | 699 | 45.3 | 31.5 | 954 | 280 |
| 96 | 4.00 | 690 | 44.2 | 32.1 | 960 | 274 |
| 102 | 4.25 | 672 | 44.9 | 32.5 | 961 | 267 |
| 108 | 4.50 | 650 | 45.2 | 33.3 | 959 | 265 |
| 114 | 4.75 | 617 | about 45.5 | 34.0 | 954 | 271 |
| 120 | 5.01 | 610 | 46.3 | 34.3 | 962 | 274 |
| 126 | 5.26 | 589 | 48.0 | 34.8 | 961 | 281 |
| 132 | 5.51 | 571 | 48.2 | 35.1 | 961 | 291 |
| 138 | 5.76 | 549 | 48.8 | 35.3 | 960 | 299 |
| 144 | 6.01 | 509 | 50.3 | 35.6 | 960 | 307 |
| 150 | 6.26 | 459 | 52.5 | 35.8 | 959 | 312 |
| 156 | 6.51 | 420 | 54.3 | 35.9 | 959 | 313 |
| 162 | 6.76 | 397 | 55.1 | 36.3 | 959 | 314 |
| 168 | 7.01 | 386 | 55.2 | 36.8 | 958 | 316 |
| 192 | 8.01 | 380 | 55.4 | 36.8 | 958 | 318 |
| 216 | 9.01 | 377.5 | 55.5 | 36.7 | 958 | 319 |
| 240 | 10.01 | 374.5 | 55.3 | 36.9 | 959 | 321 |
| 264 | 11.01 | 373 | 55.3 | 36.6 | 959 | 322 |
| 288 | 12.01 | 369 | 55.3 | 36.6 | 958 | 324 |
| 316 | 13.18 | 364.5 | 55.4 | 36.8 | 958 | 326 |

Card top-face corners (screen px; T,R,B,L): f0 flat (538,129),(1379,128),(1381,959),(538,958) [TL,TR,BR,BL]; f12 (657,65),(1475,258),(1265,1015),(442,815); f24 (881,208),(1567,490),(1038,873),(340,575); f40 (945,116),(1587,351),(967,609),(330,359); f90 (953,23),(1451,286),(948,539),(463,272); f150 (1002,124),(1281,332),(917,502),(637,290); f168 (1007,157),(1225,345),(910,477),(691,286); f316 (1005,175),(1211,353),(912,479),(704,298).

## 4. Composition

Centre line: the card centre stays on x = 958 +/- 5 for the entire clip; only y moves.

| frame(s) | layout | focal point / hierarchy | projection | DoF / grid |
|---|---|---|---|---|
| 0 | card 844x832 centred (x538-1381, y128-959, i.e. 44% x 77% of frame), flat; bubble top-right of card, avatar+text lower | the chat text; large empty margins (28% left/right) | flat (rotZ 0, elev 90) | ground blotch lattice, pitch about 183 px, blurred; no hairlines |
| 12 | card rotating 14.6 deg, foreshortened to H about 950 px; near-vertical edge still 74 deg | still card-centric | elev 66, rotZ 14.6 | blotches still soft |
| 24 | card a flat rhombus (bbox x340-1567, y208-873) | card | elev 33, rotZ 38 | soft |
| 32-46 | symmetric dimetric, edges 21/22 deg; card slides up out of the vertical centre (cy 476 -> 286); lower 60% of frame empty until slab tips appear at the bottom edge (f37-40) | tension: empty lower frame waiting for tiles | elev 23, rotZ 44, s about 890 -> 870 | crosses crisp from f46 |
| 54-66 | card clipped by top edge (T vertex y<0), tiles at 2x2 positions (W x~640, E x~1260, S x~960, i.e. +/-0.37 s, 0 s) rising from the bottom, 4-6 pills left/right of tiles at x about 210 and 1700 | card at top, tile fan-out below, pills as annotations | elev 25-27, rotZ 44, s 840-800 | crisp crosses + hairlines |
| 78-96 | card + tier 2 + tier 3 have merged into a compact block (card L(463,272), B(948,539)); glass plate and pale tiles rise from the bottom; pills at left/right edges | centre column x 460-1450 | elev 29-32, rotZ 44-45, s 750-690 | same |
| 114-132 | stack = card, tier 2, tier 3, glass in the upper 3/5 of frame; INTG then OSH enter from the bottom; near-true isometric (edges 30/28 deg) | vertical stack, empty left/right | elev 34-35, rotZ 45-48 | same |
| 144-168 | zoom-out + yaw move: stack shrinks from 509 to 386 px card side, ends centred a little above middle (card centre y 316) with 0.43 W free margin above; shadow appears at the bottom | whole stack visible for the first time (stack spans y157-795) | rotZ 50 -> 55, elev 36 -> 37 | floor crosses spaced about 80 px |
| 168-180 | final pose | stack in the centre-left third (stack bbox about x700-1215 of 1920), huge floor margins, one pill (Red Hat OpenShift) at left, x372-655, y572-632 | rotZ 55.3, elev 36.7 | - |
| 200-232 | Db2 module bottom-left (x about 160-700, y 690-1060), Enterprise module right (x about 1225-1745, y 240-565), triangle composition around the stack | three nodes around the central stack | unchanged | - |
| 316 | see section 5 | - | - | pills gone |

Backdrop behaviour: no parallax drift beyond the camera's own rigid motion. The floor lattice is rigid with the stack (same world axes, lattice edge angles 21.6 / 40.7 deg at f316 vs card edges 22.4 / 40.9 deg). Pill capsules are tethered to their tiles (they move with them) but stay 61 px tall regardless of zoom.

### Projection (phase D)
- Edge angles of the card top face (screen, from horizontal; a = TL->TR side, b = TR->BR side): f40 20.8 / 22.1; f60 23.4 / 24.9; f84 25.3 / 27.4; f96 27.1 / 28.9; f120 30.6 / 28.3; f132 31.9 / 28.1; f150 36.8 / 24.8; f168 40.8 / 22.5; f316 40.9 / 22.4.
- True isometric (30 / 30) is touched only around f114-132 (elev 34-35.3, yaw 45-48). 2:1 dimetric (26.57 deg) is crossed at about f84-96, not held. The initial resting pose f32-46 is a shallow dimetric (elev 23, edges 21-22 deg, yaw 45). The final pose is an asymmetric dimetric: yaw 55.4, elev 36.8, edge angles 40.9 / 22.4 (tan = 0.865 / 0.415).
- Perspective: opposite edges of the card top are parallel to within 1 px (parallelogram residual about 0). The floor '+' lattice fits a homography with 0.45 px RMS over about 300 inliers; its horizon line is about 11,500 px above the frame centre (identical in f200/250/316) and cell area grows 1.24x from y=100 to y=980. That implies a pinhole focal length of about 9,000 px (+/-15%, vFOV about 6.9 deg, hFOV about 12 deg, about 200 mm full-frame-equivalent) and a camera distance of about 25 card-widths. So: "orthographic for practical purposes", with a faint perspective gradient on the floor (1.25x) that you can reproduce with perspective(9000px) or a 7-deg FOV camera. Confidence: med-high for "weak perspective", med for the number (it depends on the elevation).

## 5. Transitions

1. **Hand-in from clip 03 (hard cut + restyle).** Last frame of clip 03 (full res): white card (#fafafa, #fcfcfc, #f5f5f5 at three points) with a cast drop shadow to the right/bottom, on a fine blue grid (about 105 px at half res, i.e. about 21 px) with large crosshairs every about 210 px, ground #cdd5e3 / #d0d8e6. First frame of clip 04 (f0, `select=eq(n,0)`): same card position (bbox x538-1381, y128-959 vs 538-1374, y120-959), but face is flat mid-grey #d9dde0 (#dadce0 in the PNG), NO cast shadow, NO grid lines, ground #d2dae8, the crosshairs replaced by blurred '+' blotches (pitch about 183 px vs about 210 px in clip 03). Text content is identical ("Nigel 10:45 / I lost my wallet. I need to cancel my credit card / Cora+ 10:45 / Hi Nigel, we're sorry you lost your wallet and hope all is well otherwise. / Can you confirm your card number is 12XX XXXX XXXX 4567?"). So 03 -> 04 is a hard cut matched on the card footprint and text. This confirms the 03-analyst's finding. A soft white glow remains around the user bubble at f0.
2. **Camera tilt-in + push** f3-34: single combined tween (rotateZ 0 -> 44, elevation 90 -> 23, zoom +6%).
3. **Camera pan down + focus pull** f24-54 / f36-50: look-at moves down the stack (card centre 534 -> 248) while the ground defocus clears; tiles enter from the bottom edge from f37.
4. **Layer docking** f37-180: staggered ease-out rises of 9 groups from below frame (section 3), pills in/out per group.
5. **Zoom-out + yaw settle** f114-168: dolly out 549 -> 386, yaw +10.4 deg, elevation +2.8 deg, while the last two plates dock and the shadow arrives; card face brightens.
6. **Side modules** f186-264: hover-in builds with nested/tangram pieces, then connector lines.
7. **No cut, fade or zoom into a plate** occurs inside the clip. The last frame is a plain frame of the running scene (no fade-out in video or audio).

### Exact last-frame state (f316, hand-off to clip 05)
- Camera: rotZ 55.4 deg, elev 36.8 deg, card side 364.5 px (card width on screen 507 px, scale 0.433 of f0), card centre (958, 326). Drifting at -0.13 px/f in s and +0.065 px/f in cy.
- Card top face corners: T(1005,175) R(1211,353) B(912,479) L(704,298).
- Stack (top to bottom): UI card, tier 2 (grey W / black E / charcoal S tiles), tier 3 (pale-blue W / navy E / white-grey S / bright-blue N hidden), blue glass plate, dark translucent Integration plate, white/red-edged OpenShift plate. OSH front vertex about (912, 782).
- Left-vertex rows (x about 708-712): card top face 294-298 (edge to 316), tier 2 top face about 334 (front edge to about 363), tier 3 / pale blue about 372-400, glass top about 408 (navy edge to 440), Integration 510-528, OSH 589 (red edge 601-615).
- Floor: shadow lower-right of stack (core #8e939e), crosses at about 80x64 px cell, Db2 module at bottom-left (x about 160-700, y about 690-1065), Enterprise-data module at the right (x about 1225-1745, y about 240-565), two connector pairs (one dark blue, one grey) between each module and the stack.
- No pills on screen (all faded out by f280). No text overlay. Audio: music bed continuing (RMS about -25 dBFS at t=13.1 s).
- Whatever clip 05 does with "isometric blue modules + pill labels" must either start from this exact pose or cut; note clip 05's first frame should be compared with these numbers.

## 6. Visual language

- Typography: IBM Plex Sans (UI card text 26-30 px at f0: body about 34 px line height, bubble text about 25 px, "Nigel / Cora+" name tags 18-20 px bold/semibold, "10:45" 18 px grey). Pills: IBM Plex Sans Regular about 26 px, padding about 23 px each side (capsule width = text + about 46 px), capsule height 61 px (about 5.6% of frame height), 1 px border #636a7a, text #464958, fill about #d2d6d9 (almost transparent over the ground). Pills carry no leader lines; they are 2D capsules attached to a tile anchor and placed beside it.
- Palette: ground #d2dae8; card #d9dde0 -> #e8ecef/#fcfcfd; IBM blue accent #174fcb (avatar) / #0f62fe-ish glass; navy #0e2360; steel #7589b1; blue glass #88a4e4; black tile #232323; mid-grey #8e8e8e; charcoal #424242; red edge #aa4a60; floor shadow #8e939e; cross marks #9aa2ae; connector blue about #1b3fa0.
- Lighting: key light from upper-left (left-facing side faces are light/white, right-facing side faces dark/black: e.g. tier-2 left face white-grey, right face #0b0b0d), floor shadow falls toward the lower-right on screen. Shadow is soft (about 40-60 px blur) with about 0.68 multiply.
- Glass: single translucent plate with bright top rim, darker navy lower edge and visible content behind it (the plate below shows through, giving a blue-to-navy vertical gradient). Fill alpha about 0.35-0.4 of #0f62fe over the ground.
- Corner radii: card and tiles have square corners; chat bubble about 24-28 px radius; pills fully rounded (r = 30). Edge hairlines on tiles: inset square outline 1-2 px.
- Text treatment: no highlight in this clip. Text sits in the card plane (rotates with it). The bubble is a raised element with its own offset slab (the "shadow" is solid geometry that remains attached under tilt).
- Depth of field: only a defocused ground at the start (f0-36, blotch-blur radius about 15 px) that sharpens at f40-50; nothing else blurs. No motion blur observed on tile movement (stills at f44-60 are sharp; MAD diff 8-13).
- Audio: continuous music; no clear SFX transient alignment found (RMS dips at about 3.6, 7.0, 8.4, 9.8, 10.6 s look like musical phrasing; not tied to visual events). Not analysed for beat sync.

## 7. Recreation recipe

Frame/time base: 23.976 fps. Work in the original 1920x1080 stage with the card as an 842 px square.

**Camera (Three.js, near-ortho):** PerspectiveCamera vFOV 6.9 deg (or OrthographicCamera with zoom), distance about 24.7 x W0 from the look-at point. Per-frame `rotZ(f)`, `elev(f)`, `s(f)` from the table in section 3 (interpolate with monotone cubic). Convenient closed forms:
- f3->32: p = easeInOut((f-3)/29) with about cubic-bezier(0.42, 0, 0.45, 1); rotZ = 44.1 p; elev = 90 - 67.1 p; s = 842 + 52 p (then 902 at f34, settle to about 870 at f46).
- f46->168 elevation (piecewise linear through measured knots, deg): 24.2@46, 26.6@60, 29.4@78, 32.1@96, 34.0@114, 35.1@132, 35.8@150, 36.8@168, then 36.8 -> 36.6 by f316. An exponential closed form undershoots the end by about 1 deg, so interpolate the knots.
- yaw: 44.5 until f108, then easeInOut to 55.3 by f165 (+3.6 over f108-132, +5.5 over f138-156).
- zoom s: 871 @46, 822 @60, 750 @78, 690 @96, 610 @120, 549 @138, 509 @144, 459 @150, 420 @156, 397 @162, 386 @168, 380 @192, 364.5 @316.
- look-at: card centre y: 540 until f22, then 534 @24, 500 @30, 418 @36, 333 @42, 248 @54, 284 @78-84, 265 @108, 316 @168, 326 @316 (ease-out pan f24-54).

**CSS 3D equivalent** (stage = 1920x1080, `perspective: 9000px`, `transform-style: preserve-3d`):
```
.world{ transform: translate(var(--tx),var(--ty)) scale(var(--s)) rotateX(calc(90deg - var(--elev))) rotateZ(var(--rotz)); }
/* --s = s(f)/842 ; --rotz positive = clockwise; layers use translateZ(-k*W) with W = 842px */
```
Layer offsets (final, measured directly at f250-310 averaged, left-vertex column x=710-714, where every plate shares the same plan point; vertical px / (s*cos elev) = 292 px per W, +/-0.02 W): top-face depth below the card top = tier 2 0.14 W (118 px at W=842), tier 3 pale-blue/steel tiles 0.27 W (227 px), blue glass plate 0.33-0.39 W (278-328 px; its top rim is 0.33 and the bright lower edge 0.39), Integration 0.70 W (590 px), OpenShift 0.95-0.96 W (800-810 px). Gaps between consecutive tops: 0.14, 0.13, 0.06-0.12, 0.31-0.37, 0.25 W. Front-face heights on screen (thickness x cos 36.8): tier 2 0.04 W, glass 0.10 W (30 px), Integration 0.04 W, OpenShift red edge 0.05 W (14 px), so world thicknesses are about tier 2 0.05, glass 0.12, Integration 0.05, OpenShift 0.06 W, card 0.012 W (measured flat at f40). Bottom of the red edge is 1.04 W below the card's front vertex (this includes the 0.4 W plan offset projection, so do not use it as stack height). Medium confidence for tiers 2/3 (their faces overlap), high for Integration and OpenShift. Tiers 2 and 3 are 2x2 grids of 0.5 W tiles centred at plan offsets (+/-0.25, +/-0.25) W (W: Cora chat / Cloud Pak, E: NeuralSeek / watsonx Assistant, S: Cora Broker / Assistant B, N: watsonx.ai). Plan positions are already the final ones at f60 (+/-0.37 s horizontally, 0 s) so only Z moves.

**Tile entrance:** start each group about 1.0 W below its final slot (off-screen), animate translateZ -> final with a short, firm ease-out and NO overshoot. Measured (Cora Broker, tier 2): quadratic ease-out (1-(1-t)^2) over 29 frames (1.2 s), travelling about 0.025 W per frame in the middle; the large plates are slower (glass about 80 f, OpenShift about 55 f from its first full-view frame, with a decaying tail of about x0.77 per 4 f). Start frames (first pixel at bottom edge, proxy for t0): 37, 40, 47, 52, 57-62, 76, 83, 103, 125 (0.2 s apart for the first five, about 0.85 s for the three big plates). In your build trigger them at about -8 f relative to those numbers so the tile first appears on cue given your own camera.

**Pills:** DOM overlay anchored to a 3D point on each tile (project the anchor each frame) so the pill rides with its tile; fixed 61 px height (do not scale with the camera); opacity 0 -> 1 over 4-5 f, hold 20-56 f (see pill table: Cora chat 22 f at full, Db2/Enterprise 57 f/51 f), 1 -> 0 over about 5 f. Offset from the tile edge: the capsule sits about 100-200 px outside the tile's left/right silhouette (left of W tiles, right of E tiles; 'User Interface' left of the card).

**Background:** floor plane with '+' marks every 0.24 W and a hairline grid; CSS: draw on the floor element so it inherits the camera transform. Defocus: `filter: blur(15px)` on the floor at t0 animated to 0 between f36 and f50 (ease-in), hairlines opacity 0 -> 1 at f44-50.

**Shadow:** project the stack silhouette to the floor, offset lower-right, `multiply` about 0.68, blur 40-60 px, fade in f148-170. Keep the tiers' silhouettes (stair-step) rather than a single soft ellipse.

**Side modules:** DB2/ENT: floating slabs about 0.06 W thick, 0.1 W above their own shadows; build with 3-6 stacked pieces that scale/slide into place over 20-50 f; lines draw after.

**Aspect ratios:** everything is measured relative to the card side W; express offsets as multiples of W and keep the camera target at the card/stack centre (x = 50%). For 9:16 reduce zoom so the stack fits (stack depth about 1.0 W below the card), keep pills screen-space, and place the two side modules above/below instead of left/right.

**Pitfalls:** (1) do not animate perspective during the move (it is near-constant: the floor gradient 1.24x is baked); (2) keep rotation order rotateX(90-elev) then rotateZ so text stays attached to the card; (3) tiers with glass need real transmission/ordering (render glass after the plates below it); (4) the card must brighten about 8% from f136 to f170; (5) shadow must not appear before the OSH plate is mostly on-screen; (6) the first 3 frames are static.

## 8. Reusable patterns (for the skill)

- Tilt-in: ONE tween over about 1.25 s (30 f) rotating the plate +45 deg about Z and tilting from face-on to about 23 deg elevation with a +6% push; everything else waits for it.
- Resting angle first, true isometric second: start at a shallow dimetric (edges about 21 deg), let the camera elevation creep up about 0.12 deg/frame to pass through isometric (about 35 deg) while the stack assembles, then finish on an asymmetric dimetric (yaw 55, elev 37) for a more dynamic still.
- Layer space is a 2x2 half-size-tile grid per tier plus a few full-size plates; top-face gaps are 0.13, 0.15, 0.05 W in the dense group (card / tier 2 / tier 3 / glass), then about 0.34 and 0.25 W for the Integration and OpenShift plates; total depth from card top to OpenShift top about 0.96 x card width.
- Layers rise in from below and dock by decelerating (no bounce/overshoot); stagger 5 f (0.2 s) inside a group, about 20 f (0.85 s) between groups, with each group's label capsule fading in 7-10 f after the tile appears and out about 25 f later.
- Labels are 2D capsules tethered to their tile (they ride with it) with constant 61 px height, 1 px stroke, Plex Sans about 26 px, placed beside (not on) the tile, no leader lines; fade in 4-5 f, hold 20-56 f, fade out 5 f.
- Pull the camera back (x0.43 over 5.5 s) while the stack grows so the finished stack ends compact in the middle third, leaving room for side modules; finish with a near-static hold (only -4% zoom drift in 4.5 s) rather than a bob.
- Use a defocused ground that sharpens (rack-focus) at the moment layers enter to pull the eye to the layers.
- Floor shadow arrives last (after the bottom plate is placed) and carries a coloured bounce from the lowest plate (red).
- Material cue per tier: white-lit left faces / black right faces, glass = about 38% blue + bright rim + darker lower edge.

## 9. Open questions / uncertainty

- Indices in this report are RAW 0-based frame numbers (t = n/23.976); none are taken from the overview `f_###` names.
- Per-tile Z offsets before the tiles dock are not directly measurable because they are off-screen for the first 15-30 frames; the starting offset below the frame is extrapolated: the Cora Broker tile approaches at about 0.025 W per frame, so it was about 0.9-1.0 W further below its final slot at its first visible frame (f47, med-low confidence). Only Cora Broker (f56-86), the glass plate (f96-176) and OpenShift (f144-196) have clean measured approach curves; the other tiles' curves are inferred to be similar.
- Whether the card-vs-floor relative motion at f44-135 (floor crosses scroll up about 9 px/f, cumulative about 760 px, quantised +/-2 px, partly zoom) is "camera craning down" or "stack lowering" cannot be distinguished in an orthographic-like view. Reproduce it with the card centre kept near cy 250-310 and the floor moving up.
- The brightening of the card from #d6dadd to #e8ecef/#fcfcfd (f136-170) may be a light/exposure animation or a material change; unknown.
- The N cell of tier 2 (hidden under the card) may or may not exist; tier 3's N cell is watsonx.ai (visible only f52-80).
- Tier-level thickness and spacing numbers come from left- and front-vertex pixel scans of f316 (+/-4 px); individual 12-45 px tier faces are partly covered by overlapping tiers, so per-tile Z inside tier 2/3 are low confidence.
- Pill timings are from a border-line detector (+/-1 f) but the mapping of the two 'watsonx Assistant' pills to tiles (right-hand vs lower tile) is a guess.
- The focal length is derived from the floor-lattice horizon assuming the lattice is a square world grid and the camera elevation 36.8 deg; a different elevation changes f proportionally (e.g. 33 deg -> f about 7,800 px). The camera may well be a true orthographic one with a very mild extra projection from the render.
- Audio sync with visuals not examined beyond the RMS profile.
- Camera table frames 47-53 interpolated; yaw f84/f114 outliers about 2 deg.
- Stills used: 12 full-res 1920x1080 frames viewed individually (f0, 12, 20, 40, 60, 90, 130, 150, 175, 200, 250, 316; PNG/JPEG copies in `work/clip-04/full/`), plus the f0 and clip-03 last-frame side-by-side (`bound.png`). All 317 frames are saved as full-res JPEG in `work/clip-04/fr/`; about 25 contact sheets and crops (cs_*.png, k1-k4, s_a-s_c, m_db2, m_ent, stack316.png, rul_*.png, kymo*.png, pill_ids.png) support the numbers.
