# Clip 03 — "Nested Sequence 03.mp4" — forensic motion analysis

Conventions: frame numbers are 1-based (f1 = t 0.000 s); t = (f-1)/23.976. All px are at 1920x1080. "Obs" = measured from decoded frames; "est" = inferred. Scratch data: `analysis/work/clip-03/` (full-res PNGs in `full/`, per-frame ink log `ink.txt`).

## 1. Summary

| | |
|---|---|
| Duration / frames | 6.465 s, 155 frames, 23.976 fps, 1920x1080, h264 + AAC. I-frames at f1, f46, f91, f136 (GOP 45). |
| Role | Third beat. It resumes the flat card with the typing indicator (the same state clip 02 ends on), then the assistant reply is typed out. It is a pure "flat UI card" reference with zero camera or backdrop motion. |
| Sequence order | Confirmed 01 -> 02 -> 03. Clip 02's last frame vs clip 03 f1: mean abs diff 0.86/255, which is the same as in-clip frame noise, so it is a seamless continuation. Clip 01's last frame is also this state (diff 2.1). **03 -> 04 is a hard cut with a restyle (diff 20.8/255), see §5.** |

**What happens.**
- **f1-f3:** the three-dot typing indicator is still showing under "Cora+ 10:45".
- **f4-f6:** the dots fade out fast.
- **f7-f11:** a 5-frame empty beat.
- **f12-f81 (2.92 s):** the assistant reply is typed in a character at a time. It is 130 characters at a constant ~1.86 characters per frame (about 44.5 characters per second). Each character fades in.
- **f82-f155 (3.09 s):** a completely static hold. Nothing moves, not even the backdrop.

**Text answer.** The text does not change, redact or get replaced. It is only typed in, and the final string is `Hi Nigel, we’re sorry you lost your wallet and hope all is well otherwise.` + blank line + `Can you confirm your card number is 12XX XXXX XXXX 4567?`. The "12XXXXXXXXXX 4567??" you saw in clip 04 is the same string, misread. I checked it at full resolution in clip 04 f1.

**What the clip is not.**
- There is no entrance animation for the user bubble, avatar, timestamps or assistant name. They are already on screen at f1, having entered in clip 01.
- The bubble's "lift" shadow is static for the whole clip. It does not animate in.
- There is no camera push-in, tilt, rotation, parallax or perspective anywhere, including the last 1.5 s. Frames 93-155 are pixel-identical apart from encoder noise.

## 2. Element inventory

Geometry is px at 1920x1080. Percentages are of the frame unless stated.

| id | what | geometry | material / colour | z / depth | notes |
|---|---|---|---|---|---|
| BG | Blueprint-grid backdrop | full frame | base **#d0d8e6**. Soft left-of-card glow up to #dce6f6 (around x 400-500, y 300-500). Corner vignette down to ~#c7cfdb (top and bottom right). Minor grid lines ≈ **#c7cfdd** (~4% darker than base), pitch **26.35 px**. Crosshair "+" marks on a **210.8 px** lattice (8 minor cells), arm 52 px total (±26 px), 1-2 px stroke, darkest ≈ #575f6b. | back | Lattice crosshair columns x ≈ 117, 328, 538, 750, 961, 1172, 1383, 1593, 1803. Rows y ≈ 118, 328, 540, 750, 961. The frame centre (960,540) is a crosshair. |
| CARD | White chat card | x 538-1381, y 118.5-961.5 = **843 x 843 px (square)**. 43.9% of frame width, 78.1% of frame height. Centre (959.5, 540). Left 28.0%, right 71.9%, top 11.0%, bottom 89.0%. | **Corner radius 0.** Fill #fcfcfc at the left edge, #fafafa at ~43% of the width, falling to **#f3f3f3-#f5f5f5** at the right edge (light from the left). No vertical gradient (top and bottom samples are equal). | z1 (above grid) | Edges sit exactly on crosshair lattice lines. The card is **4 x 4 lattice cells**. |
| CARD-SH | Card cast shadow | See §6. Offset slab x ≈ 620-1520, y ≈ 156-1021. | multiply-like over the grid (grid lines show through) | between BG and CARD | Static for the whole clip and identical to clip 01's last frame (sampled px 143.4 vs 143.7 and 152.8 vs 152.8). |
| NAME-U | "Nigel" | glyph bbox x 1177-1229, y 258-279 (cap top 259, baseline ~274) | **#000000** (obs), IBM Plex Sans **600**, **22 px** (width-calibrated) | on CARD | Right-aligned to the bubble's right edge, x = 1303. |
| TIME-U | "10:45" | x 1244-1303, y 259-275 | mid-grey, obs darkest px #444446, core ≈ #5e5e60. Est #525252 (Carbon Gray 70). Plex **400**, **22 px** | on CARD | ~15 px gap after the name. |
| BUB | User bubble "I lost my wallet. I need to cancel / my credit card" | x ≈ 688-1303, y 297-415 = **~615 x 118 px** (32% of frame width, 10.9% of frame height; **73% of card width**) | fill #fcfcfc / #fafafa (1-3 levels off the card, so it reads only through its shadow). Radii: **top-right 0; other three ≈ 24 px** (est, med confidence). | **z2: floats ~50 px-equivalent above the card** (see shadow) | Text: Plex 400, **35 px**, #000, line pitch 42 px, left at x 736, so padding-x ≈ 48 px. Padding-y ≈ 17 px (2 x 42 + 34 = 118). Line 1 spans x 736-1256, line 2 x 737-961. |
| BUB-SH | Bubble lift shadow | A same-size copy of the bubble **offset (+46, +20) px**: x ≈ 736-1347, y ≈ 316-435 | multiply on card: ratio ≈ 0.65 at the right, ≈ 0.86 at the lower-left. Edge blur ~6-8 px. | between BUB and CARD | Static. |
| AVATAR | Blue dot | x 609-666, y 516-572 = **57 px circle**, centre (637.5, 544). 3.0% of frame height, 6.8% of card width. | **#0e62fe** (obs; = Carbon Blue 60 #0f62fe) | on CARD | Present from f1. No animation. |
| NAME-A | "Cora+" | x 696-757, y 532-549 | obs core #1b4ca3, darkest #1c3a81. This is darker than the avatar blue, so the true colour is likely Carbon Blue 70 **#0043ce** (low-med confidence; chroma smearing prevents an exact read). Plex **600**, **22 px**. | on CARD | Left edge aligned with the body text (x ≈ 696). |
| TIME-A | "10:45" | x 772-831, y 532-549 | #5c5e60 core (est #525252), Plex 400, 22 px | on CARD | |
| DOTS | Typing indicator, 3 dots | dot centres at f1: (702.7, 604.1), (725.8, 596.5), (746.5, 593.2). Dot Ø ≈ 13 px, pitch ≈ 22 px. | **#6b6b6b-#6f6f6f** (≈ Carbon Gray 60) | on CARD | Visible f1-f3, gone by f7. Middle dot is mid-bounce (y 596.5 -> 601.0 -> 603.5 over f1-f3). |
| BODY | Assistant message (typed) | x 696-1270, y 577-767. 4 lines. Left edge x ≈ 697. | **#000000** (obs), Plex **400**, **35 px**, line pitch 41.5 px (≈ 1.19 x). Paragraph break = one empty line (line tops 577 / 619 / 701 / 743). | on CARD | ~194 px of empty card below the text (card bottom 961 vs text bottom 767). |
| SPECK | Stray 2 px dark mark at (1059, 468) | 2x2 px | dark | on CARD | Present in clip 01, 02 and 03 and constant. Treat as a render artefact. Do not rebuild. |

Layout in card units (W = 843): card inner left margin to avatar = 71 px (8.4% of W). Avatar-to-text gap = 30 px. Text indent from card left = 158 px (18.8%). Bubble right margin to card = 78 px (9.3%). Bubble max-width ≈ 73% of W (wraps at "...cancel").

## 3. Timeline

Frame -> seconds: f = 1 + 23.976 x t. "Conf" = confidence.

| start f | start s | end f | end s | element | property | from -> to | easing guess | conf |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.000 | 3 | 0.083 | DOTS | hold (still showing from clip 02) | opacity 100% (middle dot y 596.5 -> 603.5, dot 3 y ≈ 593-594, dot 1 y 604.1) | bounce wave residual | high |
| 4 | 0.125 | 6 | 0.209 | DOTS | opacity | 100% (f3) -> ~17% (f4) -> ~10% (f5) -> ~1% (f6) -> 0 (f7). Measured by summed dot ink. | abrupt ease-out / exponential-decay look. About 83% of the opacity is lost in the first frame, then a short tail. About 125 ms total. | med |
| 7 | 0.250 | 11 | 0.417 | (nothing) | empty beat: indicator gone, no text yet | | | high |
| 12 | 0.459 | 81 | 3.337 | BODY | typewriter: chars revealed | 0 -> 130 chars (70 frames) | **linear**, 1.857 chars/frame = **44.5 chars/s = 22.5 ms/char = 0.54 frames/char**. No visible pauses. The paragraph break costs about 1 frame (f51 adds little ink, because the blank line adds none). | high |
| | | | | BODY (per char) | opacity of the newest char(s) | 0 -> 100% in ~1-2 frames; only the last 1-2 chars are visibly translucent in any frame | ease-out / linear ramp (est ~40-80 ms) | low-med |
| 12 | 0.459 | 30 | 1.210 | BODY L1 | "Hi Nigel, we’re sorry you lost your" (35 ch) | "Hi" shows at f12 | linear | high |
| 31 | 1.251 | 51 | 2.085 | BODY L2 | "wallet and hope all is well otherwise." (38 ch) | begins f31 ("wa"), "." lands f51 | linear | high |
| 51 | 2.085 | 70 | 2.878 | BODY L3 | "Can you confirm your card number is" (35 ch) | "C" faint at f51, "Ca" f52 | linear | high |
| 70 | 2.878 | 81 | 3.337 | BODY L4 | "12XX XXXX XXXX 4567?" (20 ch) | "1" faint f70, "12" f71, "4567" f79-80, "?" f81 | linear | high |
| 82 | 3.379 | 155 | 6.423 | everything | hold | **zero change**. f154 -> f155 mean diff 0.000. | n/a | high |
| 1 | 0.000 | 155 | 6.423 | BG, CARD, shadows, camera | any translate, scale, rotate, blur | none: block-match shift between f1/12/60/100 and f155 = (0,0) px on both background strips; card edges within ±1 px; card and bubble shadow sample values drift <1.3/255 | n/a | high |
| 1 | 0.000 | 8 | 0.29 | BG grid lines | line high-frequency energy rises (248 -> ~400) | likely encoder GOP quality ramp. Card edge gradient is unchanged, so it is **not** a depth-of-field settle. | n/a | med |

Cadence summary / stagger:
- dots hold 3 f -> dots fade 3 f -> gap 5 f -> type 70 f -> hold 74 f.
- Gap between the last dot frame (f6) and the first character (f12) is **6 frames (0.25 s)**.
- Per-line characters: L1 35, L2 38, L3 35, L4 20, plus 2 spaces at the line breaks = 130 total. Rate per half: 74 ch in 40 frames (1.85/frame) then 56 ch in 31 frames (1.81/frame).
- There are no stagger delays between siblings, because nothing else animates.
- Encoder keyframe refresh spikes at f45/46, f90/91, f135/136 are not motion. The YDIF spikes at ~f61 and ~f74 are 1-LSB encoder refreshes. When amplified x12 only the freshly typed glyphs show.

## 4. Composition

Key frames:

| frame | state |
|---|---|
| **f1** | Card, bubble, "Cora+ 10:45", avatar all present. Three dots at full opacity. Body area empty. |
| **f7-f11** | Same, body area empty. |
| **f30** | "Hi Nigel, we’re sorry you lost your" complete. |
| **f51** | Paragraph 1 complete, "C" appearing. |
| **f81** | Reply complete. |
| **f82-f155** | Identical frame (hold). |

Layout (identical in every frame):
- **Camera / projection:** flat, front-on orthographic. rotateX = rotateY = rotateZ = 0, no perspective, no keystone. The card edges are exactly axis-aligned.
- **Focal point:** the bubble + assistant text block, the centre-left of the card. The card is dead-centre in the frame. Focal text zone ≈ x 696-1303 (36%-68% of frame width) and y 258-767 (24%-71% of frame height).
- **Hierarchy:** bubble (lifted, with a heavy shadow) > assistant body text (35 px black) > name labels (22 px) > timestamps (22 px grey). The avatar is the only saturated colour.
- **Negative space:** side margins of the frame are ~28% of width each (grid only). Inside the card, the bottom ~23% (194 px below the text) is empty.
- **Depth of field:** none. Everything is sharp (the card edge transition is ≈ 2-3 px). Compare clip 02's defocus: gone here.
- **Grid backdrop behaviour:** locked, with no scale change, no parallax, no fade. Minor-grid pitch 26.35 px, crosshair lattice 210.8 px. Minor-line visibility is slightly stronger after f8 (encoder ramp). Lattice centre = frame centre = card centre.
- **Last 1.5 s (f120-f155):** pixel-identical. There are no first signs of perspective or rotation. The isometric move begins only in clip 04.

## 5. Transitions

**Inside the clip:** the only transitions are (a) the typing-indicator fade-out, f4-f6, ~125 ms, ease-out, and (b) the typewriter reveal with a short per-character fade, f12-f81. There is no scene-level transition.

**In from clip 02:**
- Technique: continuity (no transition).
- Clip 02's last frame has the same card with the same dots at the same positions. The mean abs diff to clip 03 f1 is 0.86/255 (in-clip noise level is 0.4-0.9).
- Clip 01's last frame is the same state too (diff 2.1).

**Out to clip 04 (a hard cut with a restyle, NOT a continuous move):**
- f155 is identical to f154.
- Clip 04 f1 vs clip 03 f155: mean abs diff **20.8/255**, versus 0.64 between clip 04 f1 and f2. This is a cut.
- Clip 04 f1 differs from clip 03 f155 as follows:

| property | clip 03 f155 | clip 04 f1 |
|---|---|---|
| Backdrop | grid + crosshairs, #d0d8e6 | grid **gone**, flat #d2dae8 with a faint dot lattice |
| Card fill | #fcfcfc -> #f3f3f3 gradient | flat **#dadce0 (grey tint)** |
| Card cast shadow | present | **absent** |
| Bubble shadow slab | translucent multiply | visibly more opaque mid-grey slab, offset ≈ (+41, +19) px (read from the image, colour not sampled) |
| Avatar | #0e62fe | #1851cd (darker) |
| Body text | x 698-1219 (line 1), width 521 | x 687-1227, width 540 (≈ +3.6%) |
| Name label y | 258-279 | **248-270 (−10 px)** |
| Last text line y | 743-767 | 750-774 (+7 px) |
| Bubble text x | 736-1256 | 720-1246 |

- The card outline and avatar sit in roughly the same place in both frames (judged by eye in a side-by-side, not measured). The text rows shift by the amounts above.
- The text-block deltas (header up 10 px, last line down 7 px, body ~3.6% wider, text left edge ~11 px further left) **suggest** the header, bubble and body may already be on slightly different Z depths under a perspective camera at clip 04 f1. I have not verified this. What is certain is that it is a re-rendered scene with different lighting/tone, and that the stitch is a cut, not a dissolve.
- Looking at the contact sheet of clip 04 f1-f8: f1-f4 look flat and rotation is visible by f5-f8.
- **Rebuild guidance:** treat clip 03 f155 (exact state in §7) as the end of a 2D scene. Either hard-cut to the 3D scene, or cross-dissolve over 3-6 frames if both scenes are rebuilt in one renderer. If both are one scene, ramp the card fill #fcfcfc -> #dadce0, fade the grid and the card shadow out, and fade the bubble slab to opaque, in the first ~4 frames of the explode.

## 6. Visual language

**Typography**
- **IBM Plex Sans.** Verified by rendering the exact strings in IBM Plex Sans (Latin 400/600 woff2) in a headless browser and solving font-size from the measured pixel widths.

| text | measured width | solved size | weight |
|---|---|---|---|
| "wallet and hope all is well otherwise." | 574 | 34.89 px | 400 |
| "Can you confirm your card number is" | 572 | 34.87 | 400 |
| "12XX XXXX XXXX 4567?" | 379 | 34.72 | 400 |
| "Hi Nigel, we’re sorry you lost your" | 521 | 34.85 | 400 |
| "my credit card" | 224 | 34.95 | 400 |
| "Nigel" | 52 | 21.8 | 600 |
| "10:45" | 59 | 21.9 | 400 |
| "Cora+" | 61 | 22.2 | 600 |

- Body and bubble = **35 px / weight 400 / line-height 41.5-42 px** (≈ 1.2; cap height 25 px; letter-spacing 0). Labels = **22 px**: name at 600, time at 400. In card units: 4.15% (body) and 2.6% (label) of card width.
- Curly apostrophe in "we’re". Numerals look like Plex tabular figures.
- The body is left-aligned and the bubble text is left-aligned inside a right-aligned bubble.

**Palette (obs unless stated)**

| token | hex | use |
|---|---|---|
| blue (avatar) | #0e62fe (≈ Carbon Blue 60 #0f62fe) | avatar; label likely darker #0043ce (est) |
| text black | #000000 (could be #161616 if compression overshoot) | name, body, bubble |
| timestamp grey | ~#525252 (est; obs darkest #444446) | times |
| typing dots | #6b6b6b-#6f6f6f | dots |
| card white | #fcfcfc -> #f3f3f3 (left -> right) | card fill |
| bubble white | #fcfcfc / #fafafa | bubble fill |
| bg | #d0d8e6 (glow #dce6f6, corner #c7cfdb) | backdrop |
| grid minor line | ~#c7cfdd | |
| crosshair | ~#575f6b (darkest), ~#88909e (typical) | |

**Shadows (the signature look: hard-offset translucent slabs, not Gaussian drop shadows)**

| | card shadow | bubble shadow |
|---|---|---|
| shape | a rectangle offset down-right and slightly **larger** than the card | the **same size** as the bubble |
| position | x ≈ 620-1520, y ≈ 156-1021. Right edge = card + 139 px (16.5% of W). Bottom = card + 60 px (7.1%). Left edge = card + 82 px (9.7%). Top = card + 38 px (4.5%). Centre offset ≈ **(+110, +49)** px | **(+46, +20)** px |
| darkness (ratio of shadowed grey level to unshadowed bg, from gray-level samples) | right strip: ≈ 0.55 next to the card -> ≈ 0.70 at the outer edge (e.g. 117 -> 149 vs bg 213). Bottom strip: ≈ 0.72 flat (154-157 vs 217). Per-channel RGB ratios are near-equal (0.59-0.62), so it behaves like a **neutral black multiply/overlay at α ≈ 0.45 (card edge) -> 0.30 (outer) / 0.28 (bottom)**. Rough estimate, not a fitted model. | right slab ratio ≈ 0.65 (gray 158-168 vs 249). Along the bottom strip 0.85 at x≈750 -> 0.73 at x≈1324 (213 -> 184 vs 252). Equivalent **black at α ≈ 0.15 (left) -> 0.35 (right)**. |
| edge softness | 10-90% over ≈ 36 px (right), ≈ 25-30 px (bottom, left), ≈ 12-16 px (top). Rough σ ≈ 6-14 px | ~5-12 px wide: σ ≈ 2-4 px |
| blend | grid lines show through = multiply-like | |
| animates? | no | no |

- **Consistent light direction:** the shadow vector for the card is (110, 49) and for the bubble (46, 20). Both point ≈ 24° below +x (down-right), a constant ~2.3-2.4 : 1 ratio. The light comes from the upper left, which is also why the card fill and the shadows darken to the right.
- **The bubble floats 0.42 x as far above the card as the card floats above the grid** (50 px vs 120 px shadow lengths). In card units: bubble "lift" ≈ 5.9% of W, card "lift" ≈ 14.2% of W. This is a good predictor of the Z separation in clip 04.
- No glass, no blur on the card, no border, no hairline, no corner radius. The card edge goes from bg to card white in ~3 px (the codec's softness), with no visible bright rim.

## 7. Recreation recipe

**HTML/CSS (design at 1920x1080, scale uniformly with the stage)**

```html
<div class="stage">            <!-- 1920x1080, bg #d0d8e6 + glow + vignette + grid -->
  <div class="card-shadow"></div>
  <div class="card">
    <div class="who-u"><b>Nigel</b><span>10:45</span></div>
    <div class="bubble-shadow"></div>
    <div class="bubble">I lost my wallet. I need to cancel my credit card</div>
    <div class="avatar"></div>
    <div class="who-a"><b>Cora+</b><span>10:45</span></div>
    <div class="dots"><i></i><i></i><i></i></div>
    <p class="body"><span class="c" style="--i:0">H</span>…</p>   <!-- one span per char -->
  </div>
</div>
```

```css
.stage{ background:
   radial-gradient(ellipse 700px 600px at 450px 400px, rgba(230,240,255,.55), transparent 70%),   /* left glow */
   radial-gradient(ellipse at 40% 50%, transparent 55%, rgba(30,45,80,.07)),                      /* vignette */
   #d0d8e6;
  /* minor grid 26.35px (8 per crosshair cell), 1px lines #c7cfdd */
  background-image: linear-gradient(#c7cfdd 1px,transparent 1px) , linear-gradient(90deg,#c7cfdd 1px,transparent 1px);
  background-size: 26.35px 26.35px; }
/* crosshairs: 52px "+" (1.5px, #5a6270) every 210.8px; lattice includes the centre (960,540) */

.card{ position:absolute; left:538px; top:118.5px; width:843px; height:843px; border-radius:0;
  background:linear-gradient(90deg,#fcfcfc 0,#fafafa 43%,#f3f3f3 100%); }
.card-shadow{ position:absolute; left:620px; top:156px; width:900px; height:865px;   /* = card + (82,38) .. (+139,+60) */
  background:linear-gradient(90deg,rgba(0,0,0,.45),rgba(0,0,0,.30)); mix-blend-mode:multiply; filter:blur(8px); }  /* alphas are rough estimates, tune against the reference */
.bubble{ position:absolute; left:688px-538px /*=150*/; top:297-118.5; width:615px; height:118px;
  background:#fcfcfc; border-radius:24px 0 24px 24px; padding:17px 48px; font:400 35px/42px "IBM Plex Sans"; color:#000; }
.bubble-shadow{ /* same box as .bubble, translated (+46px,+20px) */
  background:linear-gradient(90deg,rgba(0,0,0,.14),rgba(0,0,0,.35)); border-radius:24px 0 24px 24px; filter:blur(3px); }
.avatar{ width:57px;height:57px;border-radius:50%;background:#0f62fe; left:609-538; top:516-118.5 }
.who-u b{font:600 22px "IBM Plex Sans";color:#000} .who-u span{font:400 22px "IBM Plex Sans";color:#525252}
.who-a b{font:600 22px "IBM Plex Sans";color:#0043ce}   /* est; avatar blue #0f62fe if you prefer */
.body{ left:697-538; top:(line-1 top 577)-118.5; font:400 35px/41.5px "IBM Plex Sans"; width:~590px; white-space:pre-wrap }
```

Compute everything in card units (W = 843) so it scales: font 4.15% W, label 2.6% W, bubble 73% W wide, avatar 6.8% W, card shadow offset (13.0%, 5.8%) W, bubble shadow offset (5.5%, 2.4%) W. Anchor at the frame's lattice centre.

**Remotion / frame-driven typewriter (matches the clip):**
```ts
const FPS = 23.976, START = 12 - 1;            // first char visible at f12
const CPF = 1.857;                              // chars per frame
const reveal = (frame, i) => clamp((frame - START - i / CPF) / 1.5, 0, 1);  // ~1.5 f fade per char
// dots: opacity 1 until f3, then f4:.17, f5:.10, f6:.01, f7:0  (or 125 ms ease-out, exponential)
// total: typing 70 frames (2.92 s); hold 74 frames (3.09 s)
```
If building for real-time, use `animation-delay: calc(var(--i) * 22.5ms)` per character span with a 40-60 ms opacity transition; do not use a native `<input>` or a blinking caret (no caret visible in this clip).

**Pitfalls**
- Do not use a normal Gaussian `box-shadow` for the card. The look is a hard-offset multiply slab with a soft outer edge and a darker band hugging the card edge.
- Keep the bubble's shadow offset tied to the card's (same light direction, ratio 0.42).
- The text fill is the pure black of the original; against #fcfcfc it is very high contrast. Match it or the clip will look washed out.
- Pre-lay-out the text (reserve the full box and use per-char opacity) so lines do not reflow while typing. The original shows words wrap at line ends without jitter.
- Don't add camera motion in this scene. The clip's hold is perfectly still. Any parallax would contradict the established flat reference.
- The stray 2 px speck at (1059,468) is an artefact. Ignore it.

**Scaling to other aspect ratios:** keep the card square and size it from the short side of the frame (78.1% of height). Keep the lattice anchored to the card (card = 4 x 4 crosshair cells), centre both on the frame. For portrait, scale by width (card ~ 60-70% of width) and extend the grid; keep shadow offsets in card units.

## 8. Reusable patterns (for the skill)

- **A flat UI card = a square sized in lattice cells.** Make the card exactly N x N crosshair-lattice cells (here 4 x 4, 843 px), centred on a lattice crosshair, so card edges coincide with grid lines. Minor grid = lattice / 8.
- **Shadows are hard-offset translucent slabs, tied to height.** Card shadow ≈ (+13%, +5.8%) of card width with a soft σ≈10 px edge, multiply blend. An elevated element casts the same-size copy of itself offset by ~0.42x the card's vector (≈ (+5.5%, +2.4%) of W). One fixed light direction (≈ 24° below +x, light from the upper left) for every element in the scene.
- **Shadow length encodes Z.** The ratio of shadow offsets gives the layer separation to use when the card later explodes into layers (bubble sits at ~0.42 of the card's own float height).
- **Chat reply = indicator hold -> quick fade -> short beat -> constant-rate typewriter.** Dots hold ~3 frames, fade over ~3 frames (hard ease-out), wait ~5-6 frames (0.25 s), then reveal at ~1.86 chars/frame (≈ 44 chars/s, 22 ms per char) with a ~1-2 frame per-char fade and no pause at paragraph breaks.
- **Hold after the beat.** After the last character, hold ~74 frames (3.1 s) perfectly still to let the viewer (and the voice-over) read. Only then change the scene.
- **Static typography spec.** Body 35 px/41.5 px (≈ 1.2) IBM Plex Sans 400, labels 22 px (600 for the name, 400 for the time), pure black body, grey timestamps, Carbon Blue avatar, ≈ 48 px bubble padding-x.
- **Flat hold, then hard cut into the 3D scene.** The 2D-to-3D handoff here is a cut to a re-rendered scene (grid removed, tinted card, perspective already starting). Plan the 3D scene's first frame to match the 2D last frame in position, not in lighting.
- **Backdrop locked.** No parallax, scale or blur on the grid during UI beats. Motion budget goes to the content (text typing) only.

## 9. Open questions / uncertainty

- **Per-character fade timing is low-confidence.** Only the last 1-2 characters are translucent in each frame. The ramp could be a 1-frame opacity step or an interpolated frame-blend of the render. I give ~1-2 frames.
- **True colour of "Cora+" and the timestamps.** Chroma subsampling and 22 px thin strokes blur the colour. Cora+ (obs core #1b4ca3) is darker than the avatar blue, so it is likely #0043ce (Carbon Blue 70) but could be #0f62fe. Timestamps are most likely #525252 (obs darkest #444446). Body black could be #161616 with sharpening overshoot.
- **Bubble corner radii** (~24 px, top-right square) are estimated from a 4x zoom. Bubble left edge is nearly invisible (white on white), so the left bound x ≈ 688 is ±4 px.
- **Card gradient shape.** I sampled 7 points. The falloff is clearly horizontal (#fcfcfc -> #f3f3f3), but I did not fit the exact curve; the card also shows slight mottling.
- **Minor-grid hierarchy.** Some minor lines are fainter than others (detected spacing alternates 26/53 px). I did not resolve whether there is a major/minor line hierarchy.
- **Dot bounce phase.** Only 3 frames of the indicator animation are in this clip, so I cannot give a period for the bounce. Look at clip 02's tail for that.
- **Audio.** Level data only; I did not listen to it. The track is fairly steady (integrated -19.0 LUFS, loudness range 1.1 LU, mean -21 dB, max -6.2 dB). On a 10 ms RMS envelope no peak exceeds -14 dB, and there is no obvious difference between the typing section (mean -23.4 dB) and the hold (mean -25.4 dB). I found nothing that visibly lines up with the typing, the dot fade or the hold, but this level-based check cannot say what the audio actually is (music, voice or ambience).
- **Why clip 04 f1 looks different** (grey tint, grid gone, layers already at slightly different Z) is inferred. I only compared boundary frames; I did not analyse clip 04's motion beyond its first 8 frames.
