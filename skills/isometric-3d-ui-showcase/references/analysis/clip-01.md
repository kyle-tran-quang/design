# Clip 01 — forensic motion analysis

Source: `Nested Sequence 01.mp4` — 1920x1080, 23.976 fps (24000/1001), 72 frames, 3.003 s, H.264 + AAC 44.1 kHz stereo.

**Conventions.** All frame numbers are 0-based raw-decode indices (frame 0 = t 0.000 s, t = n x 0.041708 s). Measurements are from lossless PNG decodes of every frame, using pixel-level scripts (scratch in `analysis/work/clip-01/scripts/`).

**Overview-frame offset.** The pre-extracted `frames/clip-01/f_###.jpg` are NOT at the nominal 0.25 s grid. The `fps=4` filter dropped the first two decoded frames, so `f_001` is really raw frame 2, `f_002` is raw frame 8, and so on (+2 frames, +0.083 s for every overview image). I verified this with bit-exact (diff 0.000) matches against raw decodes. Accurate-seek and `select` extractions agree with the raw decode. Treat the overview frames as shifted.

---

## 1. Summary

| | |
|---|---|
| Duration | 3.003 s, 72 frames |
| Role in sequence | **Not a blank-card title beat.** It is the full "build the card, then drop in the first chat messages" opening: wireframe draw, then card materialise, then chat content. The brief's hypothesis (01 = blank white card) is wrong. |
| First frame | Bare blueprint grid, flat colour #ced6e4, no card, no shadow, no glow. A barely visible neutral-grey ghost of the wireframe (about 70 px square at the bottom-left anchor, about 7 levels darker than BG, no blue tint) is already present at frame 0. |
| Last frame (71) | Flat top-down white square card with a hard lower-right drop shadow, a user message bubble ("Nigel 10:45", "I lost my wallet. I need to cancel my credit card") and a bot row (blue avatar disc, "Cora+ 10:45", three grey typing dots) just starting. |

Three sequential beats:

1. **Frames 1-24 (0.04-1.00 s)** — a blue 1.5 px wireframe square (with one diagonal) draws up from the bottom-left corner on the grid. It grows 0 to 846 px square, anchored at its bottom-left corner. The clip opens mid-move, so the first frames are already partly grown.
2. **Frames 25-41 (1.04-1.71 s)** — the wireframe cuts to a physical card at the same spot. The card cross-fades from a translucent grey-white to opaque white while its hard shadow grows out to the lower right and a soft blue glow rises on the left. The card does not move or scale.
3. **Frames 37-71 (1.54-2.96 s)** — chat content staggers in: header at 37, bubble at 47-58, avatar at 60-65, label and dots at 63-69. Each rises from about 20-70 px below its rest position while fading in.

The two small dots the brief asked about are **static dust/grain specks** at fixed pixels, not a cursor, loader or sparkle. They are present in all 72 frames and never move. The *real* loader is the three typing dots in the bot row.

The audio is a continuous pulsing low-frequency bed, with no riser, no whoosh and no silence. See section 3.

---

## 2. Element inventory

Coordinates are px in the 1920x1080 frame. Percentages are of 1920 (x) or 1080 (y).

| id | element | geometry | material / colour | z-order | notes |
|---|---|---|---|---|---|
| BG | Blueprint backdrop | full frame | base **#ced6e4** (206,214,228), flat at frame 0 | 0 | No vignette or gradient in frame 0. Later frames gain a left blue glow, see GLOW. |
| GRID-F | Fine grid | pitch **26.35 px** (1.372% of width), 73 columns x 41 rows. Lines at x = 12.2 + 26.35k, y = 13 + 26.35k | 1 px lines about 8 to 14 levels darker than BG, e.g. #b9c1cf on #ced6e4 | 1 | Alternates strong and weak lines (see GRID-X note). Static. |
| GRID-X | Crosshair marks | pitch **210.8 px** = exactly 8 fine cells (10.98% of width / 19.5% of height). Centres at x = 117.6 + 210.8i (i = 0..8), y = 117.9 + 210.8j (j = 0..4) | 1 px arms, **#767e8c to #8a8f9c** core (about 64 to 75 levels darker than BG), arm length **51 px** (25 px each side), centre gap none | 2 | 9 x 5 = 45 marks. Drawn above the fine grid. Drift under 0.5 px across the clip, i.e. static. |
| WIRE | Wireframe square + diagonal | grows from about 70 px at f0 to **846 x 846** px (44.1% of width, 78.3% of height). Anchor = bottom-left at (536, 960). Final: x 536-1383, y 114-960 | 1.5 px stroke, core **#0a3a9d to #3d70d2** (peak ink about #073a9d, antialiased edges #6296f6). Diagonal runs bottom-left to top-right | 3 | Exists frames 0-24 (a faint grey ghost at f0, visibly blue from f1). Hard cut at 25. |
| CARD | White card | **843 x 842** px at x 537.5-1380.6, y 118.5-960.5. 43.9% x 78.0% of frame. Centre (959.0, 539.5) i.e. 0.9 px left of true centre | Face **#fcfcfc** (252). Left-to-right shading to **#f5f5f5** at the right edge (see section 6). Sharp square corners | 4 | Top-down, flat, no rotation. Total offset of the card from the wireframe: wire is about 3 px larger on right and top. |
| SHADOW | Hard drop shadow | extends right to x = **1525** (card edge + 144 px) and down to y = **1015** (card edge + 55 px). Begins at the top at y about 150 and at the left at x about 610 | **#757d89 to #939ba9** (R side peak #757d89, B side peak #8a8f9c); soft edge about 25-30 px wide | 3.5 (under card) | Grows over frames 22-41. Offset direction about +144 x, +55 y. See section 6 for the profile. |
| GLOW | Blue light glow | left of the card, centred y about 540 (50% of height), strongest at x 440-535, falls to zero by x about 150 | Adds **+14 R, +16 G, +18 B** at peak (BG #ced6e4 becomes #dce4f6). Also +4 under the card and 0 on the right | 0.5 | Fades in frames 21-36, then holds. See section 6. |
| SPECK-A | Dust speck | 3 x 1 px at **(808-810, 21)** | near-black (min lum 1) | top | Static in all 72 frames. |
| SPECK-B | Dust speck | 4 x 2 px at **(1058-1059, 468-469)** | dark (min lum about 54-70) | top | Static. Over the card it stays dark on white. |
| HDR | Header "Nigel 10:45" | text bbox x 1176-1303, y about 257-280 (6.1% x 24.2% of width/height at its right end). Right edge sits 77 px inside the card's right edge | "Nigel" black #000, bold. "10:45" grey **#424242** | 5 | Rises about 11 px and fades in over frames 37-44. |
| BUB | User message bubble | white slab, about **x 728-1303, y 290-438** (575 x 148 px). Radius about 30 px on bottom-right only; other corners square. Text box x 736-1256, y 318-393 | Face same white as the card (#fcfcfc), so it reads only by its shadow. Hard shadow right (x 1303-1419, about #a0a0a0 core, 116 px wide) and bottom (y 415-436) | 6 | Raised slab. Rises from about 90 px below with growing height over frames 47-58. |
| BUB-TXT | "I lost my wallet. I need to cancel / my credit card" | 2 lines, glyph bbox x 736-1256, y 318-393; cap-height about 28 px; line pitch about 42 px | black #000 on white | 7 | IBM Plex Sans look (Regular). Fades in over frames 52-58. |
| AV | Bot avatar disc | **57 px** diameter, bbox x 609-665, y 516-573 (31.7%-34.6% x 47.8%-53.1%) | **#0e62fe** (IBM blue 60) | 5 | Rises about 70 px while fading in, frames 60-67. |
| LBL | "Cora+ 10:45" | bbox x 696-831, y 532-549 | "Cora+" bold **#0f62fe-ish** (darkest sampled #0f3681), "10:45" grey #505052 | 5 | Rises about 20 px, frames 63-69. |
| DOTS | Typing indicator | 3 dots, 12-13 px diameter, centres x 703, 726, 748, y about 594 | **#706f74** (112,111,116) | 5 | Rise 20 px with per-dot stagger, frames 63-71. |

**GRID-F detail.** Line darkness alternates in a repeating pattern by line index k: k mod 4 = 0 gives about 22, k mod 4 = 1 gives about 13, k mod 4 = 2 gives about 26 and k mod 4 = 3 gives about 12 (integrated darkness, arbitrary units). So lines at k = 2, 4, 6... are heavy and the odd lines are about half as strong. In practice this is a **53 px major sub-grid (every 2nd line) over a 26.35 px minor grid**, which also reads as a 4-cell square pattern. This could partly be moire from video compression of a single-weight grid, so confidence is **medium**.

---

## 3. Timeline

Frame numbers are raw 0-based. Seconds = frame / 23.976. "Easing guess" gives either a standard cubic-bezier fit (RMSE as a fraction of the total range) or a descriptive curve.

### 3.1 Visuals

| start f | start s | end f | end s | element | property | from to | easing guess | conf |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.000 | 0 | 0.000 | BG, GRID-F, GRID-X | all | static, no card | none | high |
| 0 | 0.000 | 1 | 0.042 | WIRE | side length, ghost | about 70 px at f0 (neutral-grey ghost: right edge at x 606-607 reads R 198 vs 205, no blue; blue-ink metric reads 0), 118 px at f1 | continuing curve | med |
| 1 | 0.042 | 19 | 0.792 | WIRE | side length (bottom-left anchored, square) | 118 to 846 px (f1 118, f2 184, f3 266, f4 354, f5 438, f6 514, f7 580, f8 632, f9 678, f10 714, f11 744, f12 770, f13 790, f14 808, f15 820, f16 830, f17 838, f18 844, f19 846) | ease in-out, fits **cubic-bezier(0.4, 0, 0.2, 1)**, started about 4 frames before f0, total duration about 25 frames (1.04 s), RMSE 0.005 | high |
| 1 | 0.042 | 19 | 0.792 | WIRE | stroke opacity (ink) | 0 to about 90% by f7 (ink strength f1 3, f2 34, f3 71, f4 90, f5 131, f6 162, f7 174, f8 180, then 184-192) | fast ease-out; fades in faster than it grows | med |
| 19 | 0.792 | 24 | 1.001 | WIRE | hold | 846 px, stable | none | high |
| 24 | 1.001 | 25 | 1.043 | WIRE to CARD | **hard cut** (wire drawn at f24; by f25 gone, translucent card present) | wire ink 133 to 0 in one frame | cut | high |
| 22 | 0.918 | 24 | 1.001 | SHADOW (pre-onset) | shadow starts to darken under the wireframe (f21 R 204, f22 195, f23 189, f24 183) | begins about 3 frames before the cut | ease-in | med |
| 22 | 0.918 | 41 | 1.710 | CARD | interior luminance (opacity/whitening) | f23 218, f25 220, f26 222, f27 225, f28 225, f29 233, f31 237, f33 241, f35 243, f37 247, f39 250, f41 252 | ease-out; fits cubic-bezier(0.4, 0.1, 0.2, 0.6) start f22.5 dur 19.5 frames (about 810 ms), RMSE 0.024 | med |
| 25 | 1.043 | 28 | 1.168 | CARD | grid visibility through card | crosshair contrast inside card: f22 72, f24 62, f25 55, f26 39, f27 35, f28 29, **f29 1** | card goes opaque between f28 and f29 (frosted translucent, then solid) | high |
| 25 | 1.043 | 39 | 1.627 | SHADOW right | extent x (row y=500) | 1412 to 1524 px (+112 px) (f24 1412, f25 1421, f26 1434, f28 1449, f30 1468, f32 1487, f34 1501, f36 1514, f38 1520, f39 1524) | ease-out, about 15 frames (605 ms) | med |
| 25 | 1.043 | 40 | 1.668 | SHADOW bottom | extent y (col x=1000) | 970 to 1015 px (f25 970, f28 981, f31 991, f34 1001, f37 1014, f38 1015) | ease-out, about 12 frames (500 ms) | med |
| 22 | 0.918 | 40 | 1.668 | SHADOW | peak darkness | right: R 206 to 118; bottom: R 195 to 153 | ease-out | med |
| 21 | 0.876 | 36 | 1.502 | GLOW | dRGB at x 440-500, y 640-680 | 0 to (14, 16, 18) (f22 1, f24 3, f26 5, f28 9, f30 11, f32 12, f34 13, f36 14, then flat) | ease-out | med |
| 36 | 1.502 | 43 | 1.793 | HDR | opacity, rise | opacity 0 to 100%, y +11 px to 0 (top y f38 268, f39 265, f40 263, f41 261, f42 260, f43 258, f44 258, f46 257) | ease-out; fade-in about 8 frames (334 ms) | med |
| 47 | 1.960 | 58 | 2.419 | BUB | rise (shadow strip bottom y) | 527 to 438 (f48 527, f49 503, f50 481, f51 466, f52 457, f53 451, f54 446, f55 443, f56 440, f57 439, f58 438); decay ratio about 0.7 per frame early, 0.6 late | **expo-out** fits cubic-bezier(0.1, 0.1, 0.1, 1.0), 10.5 frames (440 ms), RMSE 0.005 | high |
| 48 | 2.002 | 58 | 2.419 | BUB | height (grows from a thin strip) | strip height 31 px (f51), 84 (f52), 105, 120, 126, 134, 134, 137, 138 (f59) | same ease-out | med |
| 51 | 2.127 | 54 | 2.252 | BUB | shadow darkness | peak R 215 (f51), 200 (f52), 196 (f53), 175 (f54), 165 (f55), 163 (f56 onward) | ease-out | med |
| 52 | 2.169 | 58 | 2.419 | BUB-TXT | opacity | text min lum f52 238, f53 190, f54 123, f55 69, f56 0 (fully black) | ease-out; text rises 27 px (top y 346 at f53 to 319 at f58) and fades in about 5-6 frames (250 ms), starting about 4 frames after the bubble | med |
| 59 | 2.461 | 66 | 2.753 | AV | opacity, rise | disc y-top 566 (f60) to about 517 at f67; colour #8395c8 (f62) to #0e62fe (f65+) | expo-out, 7 frames (290 ms) | med |
| 62 | 2.586 | 69 | 2.878 | LBL | rise | y-top 552 (f63) to 532 (f69): -20 px; opacity ramp f63-f68 | expo-out, 6 frames (250 ms) | med |
| 62 | 2.586 | 70 | 2.920 | DOTS | rise, per-dot stagger | dot 1 y-top 608 at f63 to 587 at f69 (-21 px); dot 3 settles at f71 (y centres by frame: f64 dot1 606.9, dot2 611.9, dot3 612.8; f68 593.8, 594.4, 603.0; f71 594.0, 593.0, 594.7) | expo-out per dot, **dot 3 lags dot 1 by about 2 frames** (dots 2 and 3 are visible from f64) | med |
| 71 | 2.961 | 71 | 2.961 | all | **hold / last frame** | see section 4 | none | high |

### 3.2 Micro-motion and negative results

| item | finding | conf |
|---|---|---|
| Cursor dots | **Not a cursor.** SPECK-A (809,21) and SPECK-B (1059,468) are at identical pixels in all 72 frames. They are film-grain/dust artifacts, probably part of the background plate. | high |
| Camera drift / parallax | **None.** Crosshair centres move under 0.5 px over 72 frames; the card edge moves under 1.5 px (537.3-539.4 left edge, all subpixel scatter of the shadow-affected edge detector). Pure flat top-down view. | high |
| Grid reveal | **None.** The grid is fully present at frame 0 at full contrast and never animates. | high |
| Card entrance transform | **None.** The card does not scale, translate or rotate. It cross-fades in place (opacity and brightness only) at x 537.5-1380.6, y 118.5-960.5. | high |
| Typing-dots loop | Not seen running within the clip (still entering at f71). The dot-bounce loop, if any, starts after the clip. | med |
| Single-frame flicker at f47/f48 | Frame diffs at f47 and f48 contain 3.8k and 7.7k changed pixels above threshold, in the bubble zone (bbox x 707-1390, y 160-607). This is the bubble's first appearance and rise, not a glitch. | med |
| GOP structure | I-frames at 0 and 45 (t 1.877 s); not a motion feature. | high |

### 3.3 Stagger / offset summary

| pair | offset |
|---|---|
| WIRE end to CARD start | wire holds f19-f24 (5 frames, 0.21 s), then hard cut at f24-f25 |
| CARD fade start (f22) vs SHADOW start (f22) vs GLOW start (f21) | about simultaneous, within 1 frame; shadow and glow keep growing about 14 and 15 frames after |
| HDR start (f36) to BUB start (f47) | **11 frames** (0.46 s) |
| BUB start (f47) to BUB-TXT start (f52) | **5 frames** (0.21 s) |
| BUB start (f47) to AV start (f59) | **12 frames** (0.50 s) |
| AV start (f59) to LBL start (f62) | **3 frames** |
| LBL start (f62) to DOTS start (f62) | 0 frames (together), dot 3 lags dot 1 by about 2 frames |
| chain rhythm | 11 / 5 / 12 / 3 frames, i.e. grouped as header+bubble (about 1.5-2.4 s) then bot row (2.46-2.96 s) |

### 3.4 Audio

Stereo 44.1 kHz AAC, integrated **-17.9 LUFS**, true peak **-6.3 dBFS**, LRA 20 LU, L/R correlation 0.96. **No silence** at any point (`silencedetect` -60 dB finds nothing), and the first 40 ms is already live (about -18 dBFS at 0.04 s).

| aspect | finding |
|---|---|
| Character | A continuous **low-frequency bed with amplitude pulses**. Spectrum is dominated by 31 Hz, 61-62 Hz and 123-126 Hz (a drone/sub plus its first harmonic), with a second body at 200-500 Hz. Band energy relative to total: 20-80 Hz -11.8 dB, 80-200 Hz -5.0 dB, **200-500 Hz -2.7 dB**, 500-2k -13.3 dB, 2-6k -15.4 dB, 6-16k -25.2 dB. |
| Riser / whoosh | **No riser, no whoosh, no sweep** found; broadband high-frequency energy never rises over the clip. |
| Pulse rate | The 10 ms RMS envelope swings between about -15 and -32 dBFS in a quasi-regular wobble. Envelope autocorrelation peaks at 0.56 s and 0.88 s (r about 0.27), too weak to call a tempo. Treat as a sound-bed texture rather than a beat. |
| Distinct HF clicks | Sharp bursts above 3 kHz at about **0.12 s** (f3), **1.09 s** (f26), **1.77-1.83 s** (f42-f44), **2.39 s** (f57), **2.51 s** (f60), **2.65-2.71 s** (f63-f65). |

**Do the audio hits line up with visuals?** Partly, and only loosely:

| audio hit | nearest visual event | match |
|---|---|---|
| 1.09 s (f26) | wireframe-to-card cut at f24/f25 (1.00-1.04 s) | **yes, within 2 frames**, a click right after the cut |
| 1.77-1.83 s (f42-f44) | HDR fade-in just completed (f43-44) | close, 0 to 1 frame |
| 2.39 s / 2.51 s (f57, f60) | bubble settle (f58) / avatar start (f59-60) | yes, within 1-2 frames |
| 2.65-2.71 s (f63-f65) | LBL and dots start (f62-63) and avatar settle (f65-66) | yes, within 1-3 frames |
| 0.12 s (f3) | wire growing fast, no discrete event | no discrete visual |

So: the UI-state changes (card cut, header done, bubble landed, avatar and typing dots) are marked by small high-frequency "tick/tap" sounds, laid over a continuous low drone. The ticks sit about 1-2 frames after the visual landing. Confidence **medium**: this is from spectral burst detection only, not listening.

---

## 4. Composition

### 4.1 Key frames

| frame | t | content | layout (% of 1920 x 1080) |
|---|---|---|---|
| **0** | 0.000 | Bare grid; no card, no shadow, no glow. A near-invisible grey ghost of the wireframe (about 70 px) at the bottom-left anchor. | Grid fills frame; 9 x 5 crosshairs |
| **1** | 0.042 | Wireframe ghost, side 118 px at bottom-left anchor (536, 960) | x 28-34%, y 78-89% |
| **5** | 0.209 | Wireframe 438 px, ink 131/192 | x 28-51%, y 45-89% |
| **10** | 0.417 | Wireframe 714 px | x 28-65%, y 23-89% |
| **19** | 0.792 | Wireframe 846 px (final). Grid and crosshairs visible through the empty square. | x 27.9-72.0%, y 10.6-88.9% |
| **24** | 1.001 | Last wire frame, shadow pre-darkening below the right and bottom edges | same |
| **25** | 1.043 | Translucent grey-white card (grid still faintly visible through it), thin shadow strip right and bottom | card x 28.0-71.9%, y 11.0-88.9% |
| **29** | 1.210 | Card now opaque (grid gone), lum 233, shadow 155 | same |
| **36** | 1.502 | Card lum 246, shadow near full, glow near full | same |
| **41** | 1.710 | Card #fcfcfc final, shadow final, no chat content yet | same |
| **47** | 1.960 | Header present, bubble not yet drawn | |
| **53** | 2.211 | Bubble mid-rise, text 40% | bubble about x 730-1300, y 300-455 |
| **58** | 2.419 | Bubble settled, text full | bubble x 728-1303, y 290-438 |
| **65** | 2.711 | Avatar solid blue, label and dots rising | avatar y 523 |
| **71** | 2.961 | Final | see below |

### 4.2 Last frame (71): precise hand-off state for clips 02/03

Everything below is **static** at the hand-off, except the typing dots (see below).

| item | value |
|---|---|
| Camera | **Flat, top-down, orthographic-looking.** No tilt, no rotation, no perspective. Lighting from **upper-left** (shadow falls lower-right at about +144 px x, +55 px y). |
| Card | x 537.5-1380.6, y 118.5-960.5 (843 x 842 px); centre (959.0, 539.5); 28.0%-71.9% x, 11.0%-88.9% y |
| Card colour | #fcfcfc face; left-to-right gradient to #f5f5f5 at the right edge (luminance 252 at x = 560-760, 250 at 960, 247 at 1160, 243 at 1360; vertical shading none) |
| Shadow | right to x = 1524, bottom to y = 1018; peak colours #757d89 (right), #8a8f9c (below); hard edge, soft outer falloff over about 25 px |
| Glow | left side only, centred y about 540, peak +14/+16/+18 RGB (BG about #dce4f6 at x 440-535), 0 at far left |
| BG | #ced6e4 flat elsewhere |
| Header | "Nigel" bold black + "10:45" #424242, x 1177-1302, y 258-279 |
| Bubble | white slab x about 728-1303, y 290-438 incl. shadow strip; bottom shadow y 415-436; right shadow x 1303-1419 |
| Bubble text | 2 lines in black #000, bbox x 736-1256, y 318-393 |
| Avatar | #0e62fe disc, 57 px, bbox x 609-665, y 516-573 |
| Label | "Cora+" blue bold + "10:45" #505052, x 696-831, y 532-549 |
| Dots | 3 dots, #706f74, centres x 703 / 726 / 748, y 594, still settling (dot 3 about 1 px low) |
| Specks | (809,21) and (1059,468), present |
| Audio at end | continuing drone, small dip at f70 (-31 dBFS) then tail at f71 |

Frame 71 is **mid-conversation**, with the bot reply pending (typing dots). Clip 02 therefore should begin on this exact flat card state or on a cut that preserves it.

### 4.3 Camera, depth of field, grid behaviour

| item | value |
|---|---|
| Projection | Flat top-down; rotateX = 0, rotateZ = 0. All perceived "depth" comes from hard offset shadows only. |
| Depth of field | **None** in this clip. Text and grid are equally sharp, with no blur anywhere. |
| Grid scale | Fixed: 26.35 px minor pitch, 210.8 px crosshair pitch. No parallax, no fade, no zoom for 72 frames. |
| Focal point | Card centre (959, 539.5) is also the frame centre; wireframe grows off-centre (bottom-left anchored) toward it. |
| Negative space | Left of card 28% (537 px) of width, right 28% (539 px); top 11%, bottom 11%; the card fills about 78% of the frame height. |
| Shadow framing | The shadow adds about 144 px to the right and 55 px below, so the card's visual mass is slightly off-centre toward lower-right. |

---

## 5. Transitions

| transition | technique | detail |
|---|---|---|
| Wireframe to card (f24 to f25) | **Hard cut with matched geometry** | Wire at f24 spans x 536-1383, y 114-960 (846 px). Card at f25 spans x 539-1381, y 119-960 (843 x 842). A 3 px size mismatch on the top and right edges, so the cut is not pixel-matched but reads as continuous. The wire's bottom-left anchor (536, 960) and the card's bottom-left (537.5, 960.5) agree to under 2 px. |
| Card appearance (f22-f41) | **Cross-fade in place plus shadow growth plus glow fade** | Opacity ramp starts under the wire (the card is already about 4% whiter at f22, before the cut). The card is translucent for about 4 frames after the cut (grid visible at 55 to 29 contrast at f25-f28) and goes solid at f29. Shadow grows out from the card edges toward the lower-right over about 15 frames, simulating the card "lifting off" the grid. |
| Chat items (f36-f71) | **Rise + fade-in, staggered** | Each item translates upward 11-70 px (header 11, bubble about 90 with height growth, text 27, avatar about 50-70, label 20, dots 21) while fading in with an expo-out curve, 6-11 frames each. |
| **In (start of clip)** | Opens **mid-motion**: frame 0 is the grid with a barely visible 70 px grey ghost of the wireframe, frame 1 already shows it blue at 118 px and growing. The wire's curve fits a start about 4 frames before frame 0 (which is consistent with the ghost already being about 70 px), so the clip was probably trimmed from a longer sequence. The hand-in from a previous clip is a **cut on the bare grid** (BG #ced6e4, grid with 9 x 5 crosshairs). |
| **Out (end of clip)** | Hard end on a settled frame (typing dots still arriving). No fade-out. Clip 02 must continue from the frame-71 state (section 4.2), which means the card, shadow, glow, header, bubble, avatar and label are all static and the three dots are about 1 px from rest. |

---

## 6. Visual language

### Typography (IBM Plex Sans, confidence high on family from glyph shapes)

| use | size (measured) | weight | colour |
|---|---|---|---|
| Header "Nigel" | cap-height about 16 px, bbox height 22 px, so about **22-24 px font-size** | Bold/SemiBold | #000000 |
| Header "10:45" | same size | Regular | #424242 |
| Bubble body | cap-height about 26-28 px, line pitch about 42 px, so about **38-40 px font-size, 1.1 line-height** | Regular | #000000 |
| Label "Cora+" | about 22 px | Bold/SemiBold | blue (about #0f62fe; sampled darkest #0f3681) |
| Label "10:45" | about 22 px | Regular | #505052 |
| Typing dots | 12-13 px diameter | n/a | #706f74 |

Text is set at about 2x a typical web UI size, because the card is scaled up to fill 78% of the frame height.

### Palette

| role | hex |
|---|---|
| Backdrop | **#ced6e4** (206,214,228) |
| Backdrop with glow | #dce4f6 at peak (about +14,+16,+18) |
| Fine grid line | about #b9c1cf (8-14 levels below BG) |
| Crosshair | #767e8c to #8a8f9c core |
| Wireframe | #073a9d core to #3d70d2 (1.5 px); light edge #6296f6 |
| Card | #fcfcfc, to #f5f5f5 at the right edge |
| Hard shadow | #757d89 (right, near card) to #939ba9 (below, near card), falling to BG over about 25-30 px |
| Bubble shadow | about #a0a0a0 core (neutral grey, not blue-tinted) |
| Brand blue (avatar) | **#0e62fe** |
| Text black / grey | #000000 / #424242 / #505052 |
| Typing dots | #706f74 |

### Shadows and lighting

| item | value |
|---|---|
| Light direction | From **upper-left**; shadow offset about **+144 px right, +55 px down** at card scale (17.1% of card width right, 6.5% down). Note: offsets are asymmetric because the shadow is cast along a low-angle direction. |
| Card shadow | **Hard-edged**, with a soft penumbra about 25-30 px wide. Colour is a blue-grey (#757d89 near the card, #939ba9 below), i.e. BG multiplied by about 0.58 near the card (206 to 117 in R) and about 0.72 on the lower edge. Darkness falls off smoothly with distance: R shadow row y=700 gives x 1394 (115), 1450 (136), 1500 (142), then recovers to BG over x 1500-1540. |
| Bubble shadow | same style at smaller scale: **+116 px right, +21 px below**, colour about #a0a0a0 (neutral) on the white card, bottom strip about #cdcdcd |
| Card edge highlights | Thin **bright halo** 1-2 px at the top and left edges: the pixel row/col just outside the card is slightly brighter than the glow (left: (213,223,241) then card (251,253,255)); top edge steps 195 to 217 to 238 to 245 to 250 over 4 px, i.e. a soft **about 3-4 px edge-light ramp** from the light-facing edges. No visible rim line or bevel; thickness is conveyed only by the shadow. |
| Thickness | No visible side face. The card is a **zero-thickness plane** whose shadow offset implies lift height. |
| Corners | Card: **square (0 px radius)**, verified at TL and BR corners. Bubble: **about 30 px radius on the bottom-right only**, other corners square (consistent with the "Carbon" speech-bubble style). |
| Glass / translucency | The card is **translucent only during frames 25-28** (fade-in), not a glass material. |
| Borders / hairlines | None on the card. Wireframe stroke 1.5 px #073a9d to #3d70d2. |
| Glow | Soft blue (+14,+16,+18) lobe on the left only, vertical Gaussian-like profile about 540 centre, strongest within about 100 px of the card edge, falling to zero by x about 150-300 (dR f71-f0 by x: x=300 6, 400 11, 480 15, 520 11). Reads as light spill from a blue light source at left. A smaller +4 glow also appears above and below the card at f26-f36 (above fades back to 0 by f42, below stays at +4). |

### Colour note

The video is 8-bit Rec.709 limited-range. Card white is #fcfcfc, not #ffffff (about 1% headroom reserved), and BG measured #ced6e4 is the post-grade value as encoded.

---

## 7. Recreation recipe

### 7.1 Stage

```
canvas: 1920x1080 (design units; scale everything by W/1920)
background: #ced6e4
grid:      repeating lines every 26.35px (1px, rgba(40,60,100,0.10)),
           heavier every 2nd line (about +60% opacity)
crosshair: 9 x 5 marks; origin (117.6, 117.9); pitch 210.8; arm 51px; 1px #767e8c
card:      843x842 at (537.5, 118.5), centre-aligned on frame (offset -1px x)
```

Express all geometry as fractions of frame width so it scales: card width 0.439 W, card left 0.280 W, card top 0.1097 H (equivalently 0.078 of height per 100 px).

### 7.2 Timeline in ms (23.976 fps, 1 frame = 41.7 ms)

```
t=0        grid only (frame 0)
t=0 .. 0.8s  wireframe 0 -> 846px, anchor bottom-left (536,960)
             easing: cubic-bezier(0.4, 0, 0.2, 1), nominal 1040 ms (clip joins at frame ~4 of it)
             stroke fades in quickly: ink about 90% by 290 ms
t=0.80..1.00 hold wireframe (210 ms)
t=1.00     hard cut: wire off, card on (translucent)
t=0.92..1.71 card opacity/whiteness: 0.86 -> 1.0, ease-out about 800 ms
             (becomes opaque to the grid at t=1.21 s; before that, 25-50% grid show-through)
t=1.00..1.63 shadow: offset (0,0) -> (+144,+55), blur about 28px, ease-out, ~600 ms right / ~500 ms bottom
t=0.88..1.50 glow: left blue lobe 0 -> +(14,16,18), ease-out about 620 ms
t=1.50..1.84 header: translateY(11px) -> 0, opacity 0 -> 1, ease-out about 330 ms
t=1.96..2.42 bubble: translateY(+90px) -> 0, height grows, expo-out cubic-bezier(0.1,0.1,0.1,1), ~440 ms
t=2.17..2.42 bubble text: translateY(27px) -> 0, opacity 0 -> 1, about 250 ms (starts 5 frames after bubble)
t=2.46..2.75 avatar: translateY(~50-70px) -> 0, opacity 0 -> 1, expo-out ~290 ms
t=2.59..2.88 label: translateY(20px) -> 0, opacity 0 -> 1, ~250 ms
t=2.59..2.96 dots: translateY(21px) -> 0, expo-out, stagger 1 frame between dots 1->3 (about 40-80 ms)
```

### 7.3 CSS skeleton (flat, no 3D needed for this clip)

```css
.stage { width:1920px; height:1080px; background:#ced6e4; position:relative; overflow:hidden }
.grid {
  position:absolute; inset:0;
  background-image:
    linear-gradient(to right, rgba(60,80,120,.13) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(60,80,120,.13) 1px, transparent 1px);
  background-size: 26.35px 26.35px; background-position: 12px 13px;
}
/* crosshairs: 9x5 SVG <pattern> 210.8px, 51px arms, stroke #767e8c 1px */
.glow {
  position:absolute; left:0; top:0; width:560px; height:1080px;
  background: radial-gradient(ellipse 260px 420px at 480px 540px,
              rgba(150,190,255,.30), transparent 70%);
}
.card {
  position:absolute; left:537.5px; top:118.5px; width:843px; height:842px;
  background: linear-gradient(90deg,#fcfcfc 0%,#fcfcfc 45%,#f5f5f5 100%);
  box-shadow: 144px 55px 28px 0 rgba(30,40,70,.47); /* hard offset, 25-30px soft edge */
}
.wire { position:absolute; left:536px; bottom:120px; /* anchor bottom-left (536,960) */
        width:846px; height:846px; border:1.5px solid #0a3a9d; transform-origin: 0 100%; }
.wire::after { content:""; position:absolute; inset:0;
  background: linear-gradient(to top right, transparent calc(50% - .75px), #0a3a9d 50%, transparent calc(50% + .75px)); }
/* wire: animate width/height via scale(s) with transform-origin bottom-left;
   easing cubic-bezier(.4,0,.2,1), 1040ms */
```

### 7.4 Remotion

```ts
const f = useCurrentFrame();           // 0..71 @ 23.976
const wireS = interpolate(f+4, [0,25], [0,846], {easing: Easing.bezier(.4,0,.2,1), extrapolateRight:'clamp'});
const cardOp = interpolate(f, [22,41], [0.86,1], {easing: Easing.bezier(.4,.1,.2,.6), extrapolateLeft:'clamp', extrapolateRight:'clamp'});
const sh = (a,b)=>interpolate(f,[a,b],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const shadowX = 144*sh(22,40), shadowY = 55*sh(22,40);
const rise = (start,dur,dy)=> dy*(1-interpolate(f,[start,start+dur],[0,1],{easing:Easing.bezier(.1,.1,.1,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
```

### 7.5 Scaling to other aspect ratios

* Design in a **unit = card width (843 px)** system: card width 1.0u, shadow offset (0.171u, 0.065u), shadow soft edge 0.033u, grid pitch 0.0313u (= 26.35/843), crosshair pitch 0.25u (= 210.8/843, exactly 8 fine cells), bubble inset from card left 0.226u and from card top 0.204u (0.017u high header).
* **16:9 (1920x1080):** card height = 0.78 H. For **9:16 or 1:1**, keep the card square and sized to the *short* side (about 0.78 of it) and re-centre; the glow stays on the left of the card; keep the grid/crosshair pitch constant in absolute units so a bigger canvas just shows more grid.
* Keep the crosshair pitch an **integer multiple (8) of the fine pitch** and align the crosshair lattice so one mark's centre is at the grid origin (117.6, 117.9), otherwise the marks drift against the fine lines.

### 7.6 Pitfalls

* **Frame offset in provided overview frames** (see top): do not time against `f_###.jpg`.
* The wireframe *starts before the clip*: if recreating standalone, begin its curve at -4 frames, otherwise the first frame is empty.
* Card bubble is **white on white**: it is only visible through its shadow and a faint edge, so shadow tuning matters more than a border.
* The card goes opaque at f29 (not at the hard cut f25). A translucent look in f25-f28 is part of the effect; do not skip it.
* Wire is 3 px larger than the card on top and right; if you want a seamless cut, make them equal.
* No blur or depth of field in this clip. Clip 02 presumably introduces it.
* Video limited-range colour: render text at #000 and card at #fcfcfc, not #fff, if matching exactly.

---

## 8. Reusable patterns (for the skill)

1. **Draw a wireframe, then cut to the physical object.** A blue 1.5 px outline (with one diagonal) grows from a corner using `cubic-bezier(0.4,0,0.2,1)` (about 1.0 s), holds about 0.2 s, then hard-cuts to the filled object at the same footprint. The cut is a straight swap, no cross-dissolve.
2. **Materialise cards by opacity + shadow growth, never by scale or move.** The card stays pixel-fixed; it fades from translucent grey to white over about 0.8 s while its hard shadow extends from zero to (+17% card width, +6.5%) over about 0.6 s and a blue glow rises on the lit side. Make the card briefly translucent (grid ghosting through it for about 4 frames) before going solid.
3. **Hard shadow, light from upper-left.** Offset about 0.17 x card width right and 0.065 x card width down, 25-30 px soft edge (at 843 px card width), colour = backdrop multiplied by about 0.55-0.7 (blue-tinted), not black. Nested elements (bubbles) get the same shadow style at about 1/6 scale in neutral grey.
4. **UI content rises into place from below with expo-out, staggered by role.** Header fades in with an 11 px lift; the bubble rises about 90 px with `cubic-bezier(0.1,0.1,0.1,1)` over about 440 ms; text follows the bubble by 5 frames; the bot avatar follows the bubble by about 12 frames; label and dots are 3 frames after the avatar. Dots lag each other by about 1 frame.
5. **Blueprint grid: 26.35 px minor lines with an exact 8-cell crosshair lattice (210.8 px) = 1 crosshair per 8 minor cells.** Alternate line weights (every 2nd line heavier). 9 x 5 crosshairs fill a 1920x1080 frame with the lattice origin at about (117.6, 117.9). Grid is static: it does not parallax, scale or fade in this scene.
6. **Keep the camera dead flat in establishing shots.** No tilt, no drift, no depth-of-field. Depth is conveyed only by the offset shadow. Introduce rotation and blur in later clips.
7. **Place the card at 78% of frame height, centred,** leaving about 28% of the width on each side for glow and shadow and for later exploded-layer content.
8. **Pair small UI landings with audio ticks.** Tonal bed plus tiny tick sounds at each landing, with ticks about 1-2 frames after the visual settles.

---

## 9. Open questions / uncertainty

| # | issue | confidence / note |
|---|---|---|
| 1 | Brief says clip 01 is a "blank white card". The clip contains the wireframe draw, card materialise and first chat messages. The brief's sequence hypothesis (01 blank card, 02 chat UI) needs correcting: 01 already contains the chat start. | high |
| 2 | Overview frames are offset +2 frames (see top). Other analysts using `f_###.jpg` for timing will be 0.083 s late. | high, bit-exact verified |
| 3 | The 2-frame overview offset is an ffmpeg `fps`-filter artifact, not a player trim. The mp4 edit list (media_time 2002, first packet dts -2002) is ordinary B-frame delay compensation: raw decode, accurate seek (`-ss 0.25` returns raw frame 6 bit-exactly) and `select` all agree that playback starts at raw frame 0 with pts 0. I report against that timeline. | high |
| 4 | Wireframe diagonal geometry (corner to corner) assumed from view. Not measured for slope. | low |
| 5 | The grid's alternating line weights could be a video-compression artifact rather than design. | med |
| 6 | Easing fits for short fades (header, label, dots, text) are approximate (RMSE 0.013 to 0.055 of range); only the wireframe growth (0.005) and the bubble rise (0.005) are tight. | med |
| 7 | Audio was analysed spectrally only (not listened to). "Tick" interpretation of HF bursts is inferred. | med |
| 8 | Specks A and B are assumed to be part of the background plate. I did not verify whether they exist in other clips. | med |
| 9 | Card left-to-right gradient (252 to 243) could be a lighting falloff on the card or a vignette from the shadow compositing; I could not separate them. | low |
| 10 | The glow might be a point light rather than a gradient lobe; it shows no sign of a visible source and no rim light on the card's left edge beyond a 1-2 px bright halo. | low |
