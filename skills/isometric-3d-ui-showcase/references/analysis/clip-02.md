# Clip 02 – "Nested Sequence 02.mp4" – forensic motion analysis

All frame numbers are RAW 0-based decode indices (n = 0..194), t = n / 23.976 s. Method: every frame decoded (`-fps_mode passthrough`), PSNR-verified as exact (my work files f_NNN.png = raw n NNN-1). The 4 fps overview frames were used only as visual aids. Scripts/contact sheets live in `analysis/work/clip-02/`.
Coordinates are in the 1920x1080 output frame. "Hold" = the zoomed state raw 31-176.

## 1. Summary
- 1920x1080, 23.976 fps, 195 frames = 8.133 s, h264 + AAC 44.1 kHz.
- Story role: **clip 02 follows clip 01 and precedes clip 03 (order confirmed)**. First frame matches clip 01's last frame (mean abs pixel diff 0.66/255) and last frame matches clip 03's first frame (0.89/255). Narrative = "an NLP/AI layer reads the customer's message": the flat white chat card gets pushed in on and defocused, while the message pill stays sharp and floats in front. Words in the pill are highlighted, and two dark monospace "annotation" panels stream out the extracted data (Subject, Possible sentiments, Tone / Action item, Confirmation needed, Subsequent steps). The camera then pulls back and refocuses and the overlays retract, back to the flat card.
- Four phases:

| Phase | Raw frames | Seconds | What happens |
|---|---|---|---|
| A | 0-11 | 0.00-0.46 | Static, everything sharp. Only the 3-dot typing indicator moves. |
| B | 12-37 | 0.50-1.54 | Push-in 1.000 -> 1.237 together with a progressive defocus + 13% dimming of the card/backdrop plane. Pill chips start wiping in. Both dark panels scale out of a tiny dot (frames 26-37). |
| C | 38-168 | 1.58-7.01 | Hold at 1.237. Panels stream text word-by-word, chips wipe in, text auto-scrolls. Defocus keeps creeping to ~6 px. |
| D | 169-194 | 7.05-8.09 | Panels shrink back into their anchor corner (169-179). Pill chips wipe out (176-~188). Camera pulls back to 1.000 and refocuses (173-192). |

- Corrections to the pre-supplied understanding:
  1. It is not a static "close-up". It is a camera push-in of x1.237 (about a pivot above the frame) with the defocus ramping in over ~1.5 s.
  2. There are exactly **two** persistent dark panels (top-left "Subject" panel and bottom-right "Action item" panel). Their text grows and scrolls inside the same box. They are not many separate callouts.
  3. Text appears **word by word**, not per character. There is no visible caret.

## 2. Element inventory

| id | what | geometry (px @1920x1080; % of frame) | colour / material | z / depth | notes |
|---|---|---|---|---|---|
| E1 backdrop | blueprint grid: minor lines 26.3 px pitch (~1 px, ~#BEC6D2 on cell #CED6E4), plus-crosses every 8 cells = 211 px, arm +/-26 px, arm colour ~#78808C | full frame | bg #CED6E4 (206,214,228) at raw 0; soft lighter bloom left of card (~#DFE5F0) | deepest; blurred in B-C (sigma ~8-10 px, est.) | Crosses continue under the card; card edges land exactly on cross rows/cols (see E2). |
| E2 card | flat white square chat card | raw 0: x 537-1380, y 118-960 -> 843x842 (43.9% x 78.0%); centre (958,539). = 4x4 cross cells (4x211 px). Hold: x 434-1480, y ~234-1273 (bottom off-screen) | #FCFCFC top-left fading to ~#F6F6F6; sharp square corners; no radius | coplanar with E1 (same zoom) | Cast shadow towards lower-right (bbox ~x 612-1530, y 158-1010 at raw 0): near-edge value ~0.57x bg (#7A8296-ish), 25 px penumbra, soft end. |
| E3 name+time | "Nigel 10:45" | right-aligned to x=1304, baseline ~y 274; cap-height 16 px (~23 px type) | Nigel = Plex Sans SemiBold #000 (darkest sample); time = regular grey (~#5D5D5E observed, likely #525252-#6F6F6F) | card plane (blurs) | |
| E4 pill | user message bubble, white pill | raw 0: x ~688-1304, y ~297-415 (~620x119 = 32% x 11%). Hold: x 614-1387, y 455-603 (32.0-72.2%, 42.1-55.8%) | #FCFCFC; text #000; corners round except top-right (square) | **sharp layer, slightly above card** (parallax +3%) | Text IBM Plex Sans Regular, cap-height 25 px -> ~36 px font, line pitch 42 px (1.17). Hard slab shadow to the right (~40 px, ~#A2A2A2) and soft shadow below (~18 px, ~#CDCDCD) on the card. |
| E5 avatar | blue circle | d ~57 px, centre (638,544) = 33.2% x 50.4% | #0F62FE (measured 14,98,254) | card plane (blurs) | |
| E6 Cora label | "Cora+ 10:45" | x 695-832, y~541 (~23 px) | Cora+ Plex Sans SemiBold blue (#0F62FE, darkest sample #184BA0); time grey ~#666 | card plane | |
| E7 typing dots | 3 grey dots | d 12-13 px, centres x 703/726/748 (pitch 22.5), rest y=604, raised y=593 (src px) | #666667 | card plane (blurs) | wave loop, see section 3 |
| E8 chips (pill) | 4 highlight rectangles behind words | at raw 0 scale: lost 61x36, wallet 101x36, cancel 112x37, credit card 182x37 (hold: 76x44, 126x44, 139x46, 225x46); chip height ~1.0 em, radius ~6 px (7.5 hold px), pad-x ~4-5 px | yellow **#F2CC4A** (modal #F2CC4A/#F4CC48): "lost","wallet". Blue **#82CFFF** (=Carbon Cyan-30; observed #7ECEFE-#82CFFF): "cancel","credit card" | on the pill (sharp) | Text over chip is black/near-black. Chip is a left-to-right clip wipe: rounded left cap, square right edge while growing. |
| E9 panel TL | dark annotation panel "Subject / Possible sentiments / Tone" | final x 256-769, y 115-378 -> 513x263 (13.3-40.1% x 10.6-35.0%; 26.7% x 24.3%) | body **#303538** (48,53,56) flat; radius ~30 px (est., fit 30+-3) | screen-space overlay; nearest layer | Straddles the card's top-left corner. Shadow down-right: ~(+35..55, +20..30) px, blur ~25, ~30% (est.). |
| E10 panel BR | dark panel "Action item / Confirmation needed / Subsequent steps" | final x 1089-1603, y 671-936 -> 514x265 (56.7-83.5% x 62.1-86.7%) | same #303538, same radius | overlay, nearest | Hangs 123 px past the card's right edge. Diagonally opposite E9 around the pill (pill centre (1000,529); TL panel centre (-488,-282) from it, BR (+345,+274)). Same size as E9 within 1 px. |
| E11 panel text | IBM Plex Mono Regular | ~28 px font, advance 16.7-16.8 px (0.6 em), line pitch 33.5 px (1.2); left text inset: TL ~40 px (x 296 vs 256), BR ~57 px (x 1146 vs 1089) | labels white #FFF; TL values yellow (observed peak #DFC761, AA-thinned, source ~#F2CC4A-ish); BR values light blue (observed peak #A2CEEB; could be Carbon Blue-30 #A6C8FF or Cyan-30 #82CFFF at thin weight) | with panel | Panel text scales with the panel (it is one scaled element). Content is clipped at the panel box edge (glyphs cut by the rounded rect, no inner padding mask). |
| E12 panel chips | highlight behind first value | TL: x 289-~484, h 35 px ("Lost wallet"); BR: x 1140-1549, h 35 px ("Credit card cancellation"); radius ~6 px; pad-x ~4 px | yellow #F0CC4A / blue #90CDF8 .. #82CFFF | with panel | Text under the chip flips to dark (panel colour/near-black) as the chip passes. L->R clip wipe, same as E8. |
| E13 specks | 2-4 px dark specks at ~(809,20) and ~(1059,468) | negligible | dark | - | Present in clip 01's last frame too; ignore. |

## 3. Timeline
(raw frames; s = n/23.976. "src px" = 1920x1080 coordinates at scale 1.0; "hold px" = after x1.237 zoom.)

| start f | start s | end f | end s | element | property | from -> to | easing guess | conf |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.00 | 11 | 0.46 | whole scene | static | no camera/layer motion (YDIF ~0.01) | - | high |
| 0 | 0.00 | end | 8.09 | E7 dots | y per dot | wave loop: each dot rises 604 -> 593 src px (-11) over ~6 f, holds ~4 f, falls over ~6 f; dots offset 3-4 f; loop period 26.7 f (1.11 s). Raw 0: all up (~594) then cascade down dot1 f4, dot2 f8, dot3 f12. Peaks (dot1) f~51, 77, 104, 131, 157. Last frame f194: dot1 down, dot2/3 up. | smooth ease in/out (sine-like) | med-high |
| 12.5 | 0.52 | 31 | 1.29 | camera (E1+E2+E3+E5-E7 and all chat contents) | uniform scale + y shift about pivot (956,-376) = (49.8%, -34.8%) | s 1.000 -> 1.2373 (x), 1.2346 (y); ty 0 -> +215, tx 0 -> +1. Per frame: f14 1.0016, f16 1.019, f18 1.0625, f20 1.1163, f22 1.1606, f24 1.1922, f26 1.2144, f28 1.2286, f30 1.2366, f31 1.2373. Peak 0.027 scale/frame at f19-20 | cubic-bezier(.4,0,.2,1), D = 21.5 f (0.90 s), rmse 0.011 | high |
| 14 | 0.58 | 60 | 2.50 | E2/E3/E5/E6/E7 defocus (avatar-edge Gaussian sigma, output px) | blur | f0 0.1, f14 0.45, f18 0.6, f22 0.95, f24 1.4, f26 1.8, f28 2.0, f30 2.4, f32 2.7, f34 3.1, f36 3.6, f40 4.2, f44 4.8, f60 6.0, f100 6.3 (plateau 5.9-6.3 until f176) | ease-out, still creeping 1.2 s after the camera stops | high |
| 14 | 0.58 | 52 | 2.17 | backdrop+card plane brightness | dim | luminance x1.00 -> 0.865 (bg #CED6E4 -> #B2BAC6, uniform x0.867, i.e. ~13% black overlay); min f52-60; recovers to ~0.91 by f165 | ease-out | med |
| 17.5 | 0.73 | 26 | 1.08 | E8 chip "lost" | clip wipe L->R | width 0 -> 100%: f18 .03, f19 .23, f20 .47, f21 .67, f22 .81, f23 .87, f25 .97, f26 1.0 | (.3,0,.1,1)-ish, D 11 f | med |
| 21 | 0.88 | 32 | 1.33 | E8 chip "wallet" | clip wipe | f22 .05, f23 .18, f24 .38, f25 .61, f26 .72, f27 .83, f28 .89, f30 .96, f32 1.0 | (.4,0,.1,1), D 13.5 f | med |
| 27 | 1.13 | 38 | 1.58 | E8 chip "cancel" (blue) | clip wipe | f28 .08, f29 .21, f30 .39, f31 .59, f32 .74, f33 .82, f34 .88, f35 .93, f37 .99 | (.45,0,.15,1), D 15 f | med |
| 32 | 1.33 | 45 | 1.88 | E8 chip "credit card" (blue) | clip wipe | f33 .02, f34 .06, f35 .16, f36 .34, f37 .56, f38 .69, f39 .79, f40 .84, f41 .89, f43 .94, f45 1.0 | (.5,0,.1,1), D 16.5 f | med |
| 26 | 1.08 | 37 | 1.54 | E9 TL panel | scale-in from top-right anchor (~(770,108)) | f26: 9x4 px dot at (765,106); f27 76x38; f28 213x109; f29 322x164; f30 389x199; f31 433x222; f32 463x238; f33 484x247; f34 498x255; f35 507x260; f36 512x262; f37 513x263. Top y drifts 106 -> 115 as it grows. Uniform scale 0.018 -> 1 (text scales too) | cubic-bezier(.3,0,.1,1) D 11.5 f (alt quintOut (.22,1,.36,1) D 14.5), rmse 0.007 | high |
| 26 | 1.08 | 37 | 1.54 | E10 BR panel | scale-in from top-left anchor (~(1085,655)) | f27 76x38 ... f37 514x265, **frame-identical timing to E9** (0 f stagger) | same | high |
| 32 | 1.33 | 39 | 1.63 | E9 TL text | word reveal | "Subject:" present from scale-in; "Lost" f32; "wallet" f39 | step | high |
| 32 | 1.33 | 38 | 1.58 | E10 BR text | word reveal | "Credit" f32; "card" f35; "cancellation" f38 (one-frame +219 px jump) | step | high |
| 40 | 1.67 | 69 | 2.88 | E12 TL chip ("Lost wallet") | clip wipe + text colour yellow->dark | right edge x 289 -> 484 (sliver visible f40; >=10 px from f42): f42 304, f45 330, f47 356, f49 392, f51 420, f55 452, f59 466, f63 476, f67 482, f69 484. 50% at f49, 90% at f58 | ~(.45,0,.15,1), fit t0 36 / D 36 f | med-high |
| 39 | 1.63 | 69 | 2.88 | E12 BR chip ("Credit card cancellation") | clip wipe | right edge 1140 -> 1555: f39 1156, f41 1188, f43 1257 (.28), f45 1361 (.53), f47 1426 (.69), f49 1468 (.79), f51 1494 (.85), f53 1514 (.90), f55 1528 (.93), f59 1546, f61 1550, f67 1552, f69 1555. 50% at f45 | ~(.4,0,.1,1), D 28 f | med-high |
| 66 | 2.75 | 115 | 4.80 | E9 TL content | auto-scroll up (stick-to-bottom) | speed (px/frame, content moving up): 66:1 67:1 68:2 69:2 70:3 71:3 72:4 73:4, **74-107: 5 (cap)**, 108:4 109:4 110:3 111:3 112:2 113:2 114:1 115:1. Total ~210 px | trapezoid velocity (8 f ramps) | med-high |
| 67 | 2.79 | 112 | 4.67 | E10 BR content | same scroll | 67:3 68:3 69:4 70:4, **71-103: 5**, 104:4 105:4 106:4 107:3 108:3 109:2 110:2 111:1 112:1. Total ~203 px | same | med-high |
| 74 | 3.09 | 107 | 4.46 | E9 TL text, line adds | word reveals (white labels / yellow values) | Possible f74; "sentiments:" f81; Frustration f85; Anger f88; Fear f92; Tone: f95; Negative f100; Sensitive f107. Intervals 7,4,3,4,3,5,7 f | step | high |
| 68 | 2.84 | 109 | 4.55 | E10 BR text, line adds | word reveals | Confirmation f68; needed: f71; Credit f74; card f77; number f79; Subsequent f81; "1." f82; steps: f84; Offer f86; new f88; card f91; "2." f92; Confirm f93; interest f96; "3." f97; Verify f98; address f101; Send f105; request f109. Gaps 2-3 f (mean ~2.7 f/word, ~9 words/s) | step | med-high (+/-1 f) |
| 116 | 4.84 | 168 | 7.01 | all | hold | text static; only the dot wave runs | - | high |
| 169 | 7.05 | 177 | 7.38 | E9 TL panel | shrink back to top-right anchor | width 513 -> 0: f169 511, f170 501, f171 488, f172 463, f173 420, f174 348, f175 227, f176 108, gone f177. Exits faster than entry | ease-in (.6,0,.7,.5)-ish, D 8 f | med-high |
| 172 | 7.17 | 180 | 7.51 | E10 BR panel | shrink back to top-left anchor | width 514 -> 0: f172 511, f173 504, f174 489, f175 463, f176 419, f177 344, f178 222, f179 102, gone f180 | same, **starts 3 f after E9** (width 463 at f172 for TL vs f175 for BR) | med-high |
| 173 | 7.22 | 192 | 8.01 | camera | pull-back, same pivot (956,-376) | s 1.2373 -> 1.000 (tracker's last value 0.9968 included ~3 px accumulated drift; direct template match of all 4 corner crosses at f194 vs f0 = identical px). Per frame (tracker, +/-0.3%): f176 1.2373, f177 1.2302, f178 1.2231, f179 1.2112, f180 1.1938, f181 1.1717, f182 1.1432, f183 1.1100, f184 1.0791, f185 1.0538, f186 1.0348, f187 1.0222, f188 1.0127, f189 1.0063, f190 1.0016, f191 0.9984 (plateau ~1.000 from f191) | cubic-bezier(.65,0,.35,1) D 19.5 f, rmse 0.010 | high |
| 176 | 7.34 | 179 | 7.47 | E8 chip "lost" | wipe-out (left edge advances right) | width 1.0 -> 0.03: f177 .70, f178 .30, f179 .03 | ~linear, 3 f | med |
| 177 | 7.38 | ~188 | 7.84 | E8 chips "wallet","cancel","credit card" | wipe-out L->R | wallet f178 .86, f179 .65, f180 .46, f182 .31, f184 .18, f186 .06; cancel starts f179 (.85), f180 .64, f182 .40, f184 .23, f186 .14; credit card starts f179 (.99), f180 .81, f182 .45, f184 .24, f186 .11. Order lost -> wallet -> cancel/credit card, stagger ~1-2 f, then long ease-out tails | ease-out | med |
| 177 | 7.38 | 192 | 8.01 | E2-E7 defocus release | blur sigma | f176 5.6, f180 5.5, f182 4.6, f184 3.5, f186 2.8, f188 2.1, f190 1.2, f192 0.8, f194 0.7 | ease-in-out | high |
| 178 | 7.42 | 192 | 8.01 | backdrop/card dim | luminance | 0.91 -> ~0.995 | ease | med |
| 0-194 | - | - | - | E4 pill vs camera | residual (parallax) | pill text/slab is +7.3 src px lower and -0.8..-1.6 px left of where the camera alone puts it; builds up with the push-in and returns; at f194 text sits +6 px lower than at f0 (matches clip 03's first frame) | follows camera curve | med-high |

Stagger/offset summary:

| Pair | Offset |
|---|---|
| Pill chips start | lost f17.5 -> wallet f21 (+3.5) -> cancel f27 (+6) -> credit card f32 (+5): ~5 f (0.2 s) average |
| Chip start vs camera start | first chip starts 5 f after the camera starts |
| Panels TL vs BR, entrance | 0 f |
| Panels TL vs BR, exit | BR +3 f |
| Panel text starts vs pill chip | "Lost" f32 / "wallet" f39 trail the pill chips lost/wallet by ~15 / 18 f. "Credit" (f33) .. "cancellation" (f38) trails pill "cancel" (f27) by ~6 f. |
| Panel chip wipes | BR f39 vs TL f41 (+2); 50% points f45 vs f49 |
| Word cadence in panels | TL 3-7 f/word; BR 2-4 f/word |
| Scroll | TL and BR scroll envelopes start within 1 f of each other (f66/67) and end f112-114 |
| Chip exit | 1-2 f stagger, in reading order |

## 4. Composition

| Frame | Layout / camera / DoF |
|---|---|
| f0 (t 0.00) | Flat orthographic top-down. Card 537-1380 x 118-960 centred (28.0%-71.9% x 10.9%-88.9%). Pill upper-right of centre, avatar+Cora+dots lower-left under it. Large negative space bottom of card (y 640-960 empty). Everything sharp. Grid sharp, crosses 211 px. Pill shadow slab on the right. |
| f20 (0.83 s) | Mid push-in s 1.116, ty +104, pill chip "lost" ~half in, "wallet" starting. Blur sigma ~0.5 -> 1.0. |
| f30 (1.25 s) | s 1.2366. Panels exist as 390x200 growing boxes. Card dim ~0.94. blur ~2.4. |
| f52 (2.17 s) | Hold. Pill 32-72% x 42-56% sharp. Panel TL 13-40% x 11-35%, panel BR 57-83% x 62-87%. Card top-left corner (434,234) only visible below TL panel; bg dimmed (#B2BAC6); all crosses/grid ~6-10 px blurred; Nigel/Cora/avatar/dots blurred to sigma ~6. Focal point = pill, with panels on a diagonal TL -> pill -> BR (Z reading order). Negative space: right of card column x 1480-1900 and bottom-left. |
| f120 (5.0 s) | Same framing, panels full of text (TL shows last 5 lines, BR shows the whole 5-line "Subsequent steps" list). All 4 pill chips visible. |
| f184 (7.67 s) | Pull-back s 1.108, panels gone, chips mostly retracted, blur ~3.5. |
| f194 (8.09 s) | Camera s = 1.000 (all 4 corner crosses identical to f0). Card 536-1379 x 118-960 = same as f0. Pill sharp, no chips, pill text sits 6 px lower inside the pill than at f0. Dots: dot1 down, others up. |

- Projection: pure 2D orthographic (flat, rotateX/Z = 0). No isometric rotation in this clip. Depth is expressed only via blur, shadows and the small pill parallax.
- Grid behaviour: scales with the card (cross spacing 211 -> 261 px at s 1.237, grid and card coplanar, <1.5% residual). Dims 13% and blurs; crosses stay in registration with the card at every frame. Grid pitch 26.3 -> 32.6 px.
- Camera pivot: constant pivot at (956,-376) throughout push and pull. Because the pivot is above the frame, zooming pushes the card downwards (card top 118 -> 234) and keeps the top of the scene in frame; card centre drifts from y=539 to y~754 (hold).

## 5. Transitions
- **In (hand-off from clip 01)**: no transition. Clip 02 f0 is a continuation of clip 01's last frame: same card (537-1379 x 118-960), same pill, avatar, all-up dot state; mean abs diff 0.66/255. Pill text rows 320-344 for 'I' in both. Cut is invisible.
- **Intro to the annotation mode (f12-37)**: camera push-in with simultaneous rack-defocus of the card plane + dim, while the pill and overlays stay in focus. Callouts "pop" from a 9x4 px dot and scale up in place from the corner nearest the pill's centre line (TL: top-right corner; BR: top-left corner). Highlight chips are L->R clip wipes on the pill.
- **Mid-clip**: no cuts. State changes are content-only (text streams, chip wipes, scroll).
- **Out (f169-194)**: panels shrink back into their anchor corners (accelerating, 8-10 f), then pill chips wipe out (left edge advances right), while the camera pulls back (s 1.237 -> 1.000) and the card plane refocuses/undims. Technique name: *camera pull-back + defocus release + overlay collapse*.
- **Out hand-off (to clip 03)**: f194 is within 0.89/255 of clip 03's first frame. Card 536-1379 x 118-960 vs clip 03 card 537-1379 x 118-959; all 4 corner crosses match clip 03 f0 to the pixel. Clip 03 begins on the same card state with the pill text 6 px lower than clip 01's text position (consistent with this clip's last frame), no chips, dot wave continuing (dot1 low / dot2 mid / dot3 high), so continue the wave phase.

## 6. Visual language
- **Typography**: IBM Plex Sans (pill 36 px Regular, line-height 1.17; names 23 px SemiBold; times regular grey) and IBM Plex Mono (panels, 28 px, lh 1.2, advance 16.7 px). Mono confidence med-high (slab "r", "i", "1" glyph shapes + 0.6 em advance).
- **Palette**:

| Role | Hex |
|---|---|
| bg (raw 0) | #CED6E4 |
| bg (dimmed hold) | #B2BAC6 |
| card | #FCFCFC |
| pill | #FCFCFC |
| text | #000 (pill/Nigel) |
| grey text | ~#666 |
| avatar / Cora+ | #0F62FE |
| panel body | #303538 |
| panel text | #FFFFFF |
| yellow (chips, TL values) | #F2CC4A |
| blue chip | #82CFFF |
| blue list text | ~#A2CEEB sampled |
| grid line | ~#BEC6D2 |
| cross arm | ~#78808C |

- **Highlight treatment**: colour-coded semantics (yellow = problem/emotion entities: lost, wallet, Subject value, Sentiments, Tone; blue = action items: cancel, credit card, Action item, confirmation, steps). Chip = rounded rect (r ~6-7.5 px), height ~1 em on pill / 35 px on the 33.5 px panel line, left-to-right wipe, dark text on the chip. The same colour appears on the pill word, in the panel value and under the panel chip, so panel text colour links to the source word.
- **Shadows**: light from upper-left; cast shadows fall to lower-right. Card shadow long and hard (see E2). Pill: right slab ~40 px #A2A2A2 plus soft bottom shadow ~18 px. Panels: soft ~25 px blur, ~30% black, offset (+35-55, +20-30) px (est.).
- **Corner radii**: card 0; pill ~28-30 px (top-right square); panels ~30 px (est.); chips 6-7.5 px; avatar full circle.
- **Glass/translucency**: none; panels opaque.
- **Hairlines**: grid lines ~1 px, 6% contrast, no card border.
- **Dim/exposure**: the backdrop+card plane is darkened ~13% during the focus-pull; pill and panels are NOT dimmed (pill white stays #FCFCFC).

## 7. Recreation recipe
Stage = 1920x1080 CSS px, 23.976 fps (Remotion `fps=24000/1001`). Frame numbers below are raw frames; convert to ms with n x 41.708.

Layer structure (back to front):
```
<Stage 1920x1080>
  <CameraGroup style="transform-origin: 956px -376px; transform: scale(S) ; ">   // S: 1 -> 1.2373 -> 1.0
    <Backdrop grid + crosses />            // filter: blur(B_bg px) brightness(D)
    <Card 843x842 @ (537,118)> ... Nigel label, avatar, Cora label, dots </Card>   // filter: blur(B px) brightness(D)
  </CameraGroup>
  <PillLayer in camera but separate: sharp; extra translate(-1px, +7px) at full zoom (scale the extra by (S-1)/0.2373)>
  <PanelTL @ (256,115) 513x263 transform-origin: 100% 0 ... screen-space>
  <PanelBR @ (1089,671) 514x265 transform-origin: 0 0 ... screen-space>
</Stage>
```
Note: in the footage ty = 916 x (S-1) for the pivot (956,-376); with the CSS origin above, ty is automatic.

| Param | Value |
|---|---|
| Camera push | S(t): f12.5 -> f34 (0.9 s), `cubic-bezier(.4,0,.2,1)`, 1 -> 1.2373 |
| Camera pull | f173 -> f192.5 (0.81 s), `cubic-bezier(.65,0,.35,1)`, 1.2373 -> 1.000 |
| Card-plane blur | 0 -> 6 px, f14 -> f60, ease-out (formula: sigma ~ 6.2 x (1 - (1-p)^2.4), p = (f-14)/46); hold 6.0-6.3; release 5.6 -> 0.7 over f177 -> f192 ease-in-out. Grid layer ~9 px (more than the card, 6 px). Use CSS `blur(Npx)` (std-dev = N) |
| Dim | `brightness(0.87)` at peak (f52-60), ramp f14 -> f52, relax to 0.91 by f165, return to 1.0 at f192 |
| Panel enter | scale 0.018 -> 1, f26 -> f38, `cubic-bezier(.3,0,.1,1)` (or `cubic-bezier(.22,1,.36,1)` over 14.5 f); TL transform-origin = top-right ~(770,108); BR origin = top-left ~(1085,655); both in the same frame |
| Panel exit | scale 1 -> 0, TL f169 -> f177, BR f172 -> f180, `cubic-bezier(.6,0,.7,.5)` approx (accelerating) |
| Word reveal | tokens appear whole (opacity step) at frame numbers listed in section 3; cadence BR ~2.7 f/word, TL 3-7 f/word. Do NOT type per-character |
| Chip wipe | `clip-path: inset(0 X% 0 0 round 6px)` (left-to-right), X 100 -> 0 using bezier ~(.4,0,.1,1); pill chips D 11-16 f, panel chips D ~30 f; swap text colour to #1a1a1a under the chip |
| Pill chip starts | f17.5, f21, f27, f32; exits f176, f177.5, f178.5, f179 (left edge advances right, ease-out tails) |
| Scroll | trapezoid velocity: ramp 0 -> 5 px/f over f66 -> f74, cap 5 px/f (120 px/s) until f106, ramp down to 0 by f114; use `translateY` on an inner flow, clipped by the panel's own rounded box (no inner padding mask); anchor the last line ~59-80 px above the panel bottom |
| Typing dots | translateY 0 -> -11 -> 0 per dot, 16 f each (rise 6, hold 4, fall 6), stagger 3.5 f, loop 26.7 f; start state at f0: all dots up; phase so dot1 is down at f4 |
| Panel text | `font: 400 28px/33.5px "IBM Plex Mono"; color:#fff; left inset ~40-57 px` |
| Pill | `font: 400 36px/42px "IBM Plex Sans"`; text on chips #000 |

Pseudocode (Remotion):
```ts
const push = interpolate(f,[12.5,34],[0,1],{easing:Easing.bezier(.4,0,.2,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const pull = interpolate(f,[173,192.5],[0,1],{easing:Easing.bezier(.65,0,.35,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const S = 1 + 0.2373 * push * (1 - pull);          // 1 -> 1.2373 -> 1.0
const pillExtra = {x:-1, y:7} scaled by (S-1)/0.2373  // sharp pill's extra parallax offset (src px)
const blur = f<=60 ? 6.2*(1-(1-clamp01((f-14)/46))**2.4) : f<177 ? 6.1 : interpolate(f,[177,192],[5.6,0.7]);
```
Pitfalls:
1. Pill must stay unblurred and undimmed even though it sits on the card; separate the layers.
2. Chip wipe must use clip, not scaleX (otherwise the rounded caps squash and the text moves).
3. Reveal words, not characters.
4. Panels are screen-space; if they were camera-scaled they'd move +/-20% during the push (they do not).
5. Do not rotate or add perspective in this clip; keep the pivot above the frame to get the right "card falls downward as we push in" motion.

Other aspect ratios: scale the 1920x1080 stage by `min(w/1920, h/1080)` and keep the card centred. For portrait 9:16, panels would need re-anchoring (they hang 123 px off the card's right edge and 180 px off its left edge, so they would crop). Keep stage 16:9 letterboxed/pillarboxed, or anchor the panels relative to the card edge (TL panel overhangs the card's left edge by 178 px at hold, i.e. ~0.21 x card width; BR overhangs the right edge by 123 px) rather than the frame.

## 8. Reusable patterns (for the skill)
1. **Focus-pull annotation mode**: push the camera ~24% (pivot above the frame so the subject falls down-screen), blur the base plane (card + grid) to ~6 px / ~9 px and dim it ~13%, but leave the object under analysis (pill) and the callouts sharp and undimmed. Entry takes ~0.9 s on `cubic-bezier(.4,0,.2,1)`, defocus takes ~1.9 s to finish (it keeps creeping after the camera stops).
2. **Callout panels pop from a dot**: two identical 514x264 px panels (26.7% x 24.3% of frame, radius ~30 px, #303538, 28 px Plex Mono), placed on a diagonal around the focal object (one up-left, one down-right), each straddling the card's edge (overhang ~120-180 px). They scale 0.02 -> 1 in ~0.5 s from the corner facing the focal object, both in the same frame, and collapse in ~0.35-0.4 s with an accelerating curve, second one 2 f later.
3. **Highlights lead callout text**: pill chips start 5 f apart in reading order (lost, wallet, cancel, credit card), each a ~0.4-0.55 s left-to-right wipe. The same words appear in the callouts 6-18 f later, in the same colour, and get their own chip wipe ~1.2 s long, with the text under the chip flipping to dark.
4. **Colour semantics**: one colour per concept family (yellow = problem/emotion, blue = action). Use Carbon Cyan-30 #82CFFF and a warm yellow ~#F2CC4A; chip radius ~6 px, chip height ~= 1 em.
5. **Stream text by words**: whole-word reveals at 2.5-7 f/word with irregular cadence; no caret; blank lines as spacers; when content exceeds the box, auto-scroll at <= 5 px/frame (120 px/s) with 8-frame velocity ramps, clipped by the box edge, keep the last line ~60-80 px above the box bottom.
6. **Chrome continuity**: keep a tiny always-on loop (typing dots, 26.7 f period, 3.5 f stagger) running across clips and in phase at the cuts.
7. **Overlays are screen-space, base plane is camera-space**: the callouts do not take part in the camera zoom; the only parallax in the base is a ~3% extra shift (7 px) for a raised element such as the pill.
8. **Registration**: card edges snap to the cross-grid (card = 4x4 cross cells; cross pitch 211 px = 8 minor cells x 26.3 px).

## 9. Open questions / uncertainty
- **All frame indices in this report are raw 0-based decode frame numbers (n = 0..194, t = n/23.976 s)**, verified by PSNR (inf) against `select=eq(n,N)` decodes; no timing came from the 4 fps overview frames.
- Panel corner radius (~30 px) and shadow offsets/blur are estimated from edge profiles (low-med). The panel drop shadow overlaps the card's own shadow so is hard to isolate.
- Grid blur sigma (8-10 px) is inferred from contrast loss (grid contrast 6.1 -> 1.6 std) rather than a clean edge fit (med-low). Card-plane blur (~6 px) is measured from avatar/card edge fits (high).
- Pill is sharp, but I did not measure whether panels are slightly soft during frames 26-30 (they look marginally soft while scaling; probably motion blur or scale resampling).
- Exact hex of panel value text colours is uncertain because thin glyphs are anti-aliased against #303538 (yellow peak #DFC761, blue peak #A2CEEB; true colours are probably brighter, e.g. #F2CC4A / #A6C8FF-#82CFFF).
- Panel text vertical start differs (TL 97 px below top, BR 80 px) and cannot be explained by simple centring; I describe it as observed.
- Audio: continuous programme audio (about -17 LUFS integrated early, true peak -6.7 dBFS), syllable-like 0.2-0.4 s dips (possible voice-over or music with SFX); not transcribed. Spectral-flux onsets (raw frames): 2, 23, 26, 44, 49, 55, 61, 74, 83, 95, 112, 114, 120, 132, 139, 149, 152, 159, 181, 183; low-band hits 24, 46, 52, 57, 64, 74, 83, 114, 123, 128, 134... Onsets at f26 (first panel dot), f74 ("Possible") and f95 ("Tone:") coincide within +/-1 f of visual events, but with ~20 onsets in 195 f this may be chance; treat the audio-visual sync as unproven.
- The dot-wave period (26.7 f) was measured only during the static hold; during the push-in blur it is not measurable.
- The 6 px lower text position at the end vs start (pill text rows 326-349 vs 320-344) is measured, but I did not establish whether it is a deliberate layout shift or an artefact of the pill parallax (the end scale is 1.000, so it is not a scale effect). Clip 03's first frame has the same lower text, so the layout shift is real and persists.
