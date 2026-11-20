# Clip 05 - "Nested Sequence 05.mp4" - forensic motion analysis

**Index convention (important):** every frame number in this report is a **raw 0-based decoded frame index n** (n=0 is the first frame, n=278 the last). Time `t = n / 23.976` s (1 frame = 41.7 ms). The pre-extracted `frames/clip-05/f_###.jpg` overview images were NOT used for timing (they are time-shifted). All measurements come from frames decoded straight from the mp4 (verified: my working frames differ by 0.000 from `select=eq(n\,N)`).
Pixel coordinates are in the native 1920x1080 frame. "Hold 1" = n63-148, "Hold 2" = n211-278.

## 1. Summary

- **Duration / format:** 279 frames, 11.637 s, 1920x1080, 23.976 fps, h264 + AAC stereo 44.1 kHz (continuous music bed, abrupt start, ~0.2 s fade at the very end).
- **Narrative role:** this is the "architecture / platform" payoff shot. It starts on the already-exploded layer stack from clip 04 (chat card + 5 plates, with a periwinkle chevron plate left and a white tiled platform right), then the **camera pushes in and orbits onto the blue 4-quadrant "foundation" platform** (n3-63). Two quadrant squares lift into glass-walled modules (bars cube n40-67, lattice cube n56-76), a navy "data" box grows out of the right white platform (n66-80), a white data-packet dash starts looping along a connector (n65+), and pills label the modules (n72-139). After a 3.6 s hold the **camera dollies right and rack-focuses** from the hero platform to the right platform (n149-211), a third pill "Data source" appears on the box (n175-275), and the clip ends on a still hold (the dash, box texture and lattice colour keep cycling).
- **Hand-off in:** near-continuous cut from clip 04's last frame (same scene; small reframing step, see section 5). **Hand-off out:** hard stop on a held frame (no visual fade); audio fades over the last ~0.2 s.
- **Three-line style summary:** pale blue-grey backdrop #D2DAE5 with "+" crosshair lattice; near-white plates with soft grey shadows; IBM-blue glass modules with a green->blue "processing" lattice; shallow depth of field that is *re-pulled* between two planes by a rack focus.
- **Label inventory (complete):** "Foundational model" (n72-139), "Watson Discovery" (n72-139), "Data source" (n175-275). No other text appears after the chat card leaves frame (the chat text exists only n0-~33, see 2/E04). Corrections to the brief are listed in section 9.

## 2. Element inventory

Geometry is given at three camera states: **S0** = n0 (scale 1.00), **S1** = hold 1 (n100, hero zoom 2.20), **S2** = hold 2 (n278, hero zoom 2.99). % are of 1920x1080. Colours are measured medians from decoded frames (sRGB hex), JPEG/h264 noise +-3.

| id | what | geometry | material / colour | depth / z-order | notes |
|---|---|---|---|---|---|
| BG | Backdrop + floor | full frame | flat #D2DAE5 (S1/S2 #D0D8E3/#D1D9E4, no real gradient/vignette, <=2 levels) | rearmost | "+" crosshair lattice lies **on the floor plane** (world-fixed, scales with the camera). S0: nearest-neighbour vectors (48,42)/(54,48)/(54,42) px, cross ~20 px, stroke ~1 px #8A93A8 @~50 %. At S2 crosses ~55-60 px, spacing ~180-215 px, strokes near-black. A **fine minor grid** (cell ~24 px at S2, ~9 cells between crosshairs) is absent at n0 and present in the floor by ~n35 (see timeline). Far background crosses become soft blobs under DoF. |
| LP | Left periwinkle chevron plate | S0 bbox x175-690, y685-1025 (9-36 % W, 63-95 % H); thickness ~25 px | top: white->pink->blue gradient (#E2DFE6, #D3D1E9, #97B4F0); side edge #7DA0F1 / #4F74C4 | mid-left | Exits frame left by ~n37 (consequence of zoom/pan). Two thin connector lines attach to it. |
| RP | Right white platform | S0 bbox x1222-1722, y250-570 (64-90 % W, 23-53 % H). Edge lengths ~313 and ~283 px at S0; slab thickness ~24 px (~8 % of edge). S1 bbox x~1170-1920+, y345-870; S2 bbox x~720-1920+, y130-855 | top #F0F0F2 (range #E8E7EC-#F3F7FA); faces #828598 (front) / #737C8D (right); long soft grey shadow down-right | back plane (focus plane in Hold 2) | Faint 1 px tile seams divide the top into "bento" rectangles. Under DoF in Hold 1 (blur sigma ~4-5 px). |
| STK | Exploded stack (S0) | bbox x705-1218, y180-785 (37-63 % W, 17-73 % H); plate pitch ~0.3 of the platform edge (see HP) | 6 layers top->bottom: E04a chat card, E04b light-grey plate with black edge (#2C2A2D), E05 4-quadrant platform, E06 blue glass slab, E07 hex plate, E08 red-edged plate | centre | The two top layers (card + black-edged grey slab) leave through the top of frame (n27-33). The grey/black-edged slab is the "plate blurred at the top edge" in Hold 1 (bbox ~x440-1040, y0-150, sigma ~3.8 px). |
| E04a | Chat card | S0 top vertex (1000,182); 1 white sheet | top #EFF0F2 (#E6EAED-#FDFDFF) | top | Static text, iso-skewed: blue avatar dot, "Cora+ 10:45" (small blue/grey), outgoing white bubble "I lost my wallet. I need to cancel my credit card" + "10:45", reply "Hi Nigel, we're sorry you lost your wallet and hope all is well otherwise. Can you confirm your card number is 12XX XXXX XXXX 4567?". Visible n0-~33 only. |
| HP | **Hero platform** (4 quadrants) | S1: bbox x145-1265 (7.6-65.9 % W), y~385-958 (36-89 % H); left vertex (145,622), right vertex (1265,553), front vertex (765,868). Edge length L ~800 px at S1 = 364 px at S0 = **0.19 x frame width at S0**. Quadrant slab thickness ~30 px at S1. | pale-blue Q (left) #C7EAFC (shaded #B6D5F3); white Q (front) #E6EDF3 lit / #C5CCD2 shaded; mid-blue Q (back) #6E95F9 (range #6C92F5-#7BA8F9); deep-blue Q (right) #2943A3 (#2744A2 lit, #1A327B shaded). Each quadrant has a centred 1 px dark outline square (~50 % of quadrant edge, ~#3B4B7A @ 40 %). | mid | Pale + white squares stay as flat outlines; the **mid-blue square becomes the lattice-cube lid, the deep-blue square becomes the bars-cube lid** (lids use exactly their quadrant's colour: lid1 #6F94F5, lid2 #28439F). |
| E06 | Blue glass slab under HP | same footprint as HP, bottom vertex (770,958) at S1; gap to HP ~40 px at S1 (~0.06 L) | translucent electric blue gradient (rim #2161DC -> #214187 -> #212D54), bright specular rim on top edge, fades to navy toward the front-bottom | below HP | Gives the "glass layer" look; strongest saturation on the left/front rim. |
| E07 | Hex line-art plate | left vertex (152,905) at S1; spans to x~1262 | translucent smoky-grey: left-light #C1BEC9 (highlight #D3CACF) -> right-dark #292B37 / #26252E (left->right gradient); hex/square outlines 1 px ~#3A3B4A @ 40 % | below E06 | Heavily out of focus in Hold 2. |
| E08 | Red-edged wireframe plate | S0 bottom vertex (915,785) | white-grey top with thin wireframe; **red side edge #A2445C** (core #933750, highlight #AD5470) | lowest layer | Only a sliver visible in Hold 1 (bottom edge, y>1040). |
| C2 | **Bars cube** ("Watson Discovery") on deep-blue Q | S1: lid bbox x850-1122, y355-625 (44-58 % W); glass wall height ~140 px projected (~0.20 L true) | glass walls: ~90 % transparent white-blue, hazy top-right fade; lid #28439F; cavity floor near-black navy #02094A-#0B1847; bars: white #E5FAFF with pane #C4D1FE / blue-gradient front pane | on HP | 3 thin vertical white bars + 1 large front panel that **cycle up/down** (~40-frame loop). |
| C1 | **Lattice cube** ("Foundational model") on mid-blue Q | S1: lid bbox x542-812 (28-42 % W), y245-512 (23-47 % H); ~4x4x4 grid of cubes (~64), cube edge ~30 px at S1 (~0.04 L), pitch ~62 px, joined by thin pale rods | cubes: **green** median #2CA757 (light #60B782, dark #0D703A; seen through glass #368D6B) or **blue** median #466FEF (light #7E98EC, deep #074EE4); cavity floor #040F48 | on HP | Colour state toggles in left->right waves (timeline). |
| BX | **Data-source box** on RP | S1: bbox x1488-1790 (77-93 % W), y430-625 (40-58 %); S2: top face (1173,255)/(1310,155)/(1583,243)/(1450,342), body to y~512 | white lid #EAEAEA with ~3 % grey overhang strip #A3A6B1; body navy #2E3B81 (lit front), #252B50-#485484 (right face with vertical-streak "chart" texture); light-blue tile rectangles #5070B9; shadow on RP #A0A4A8 (hard-ish, falls down-right) | on RP | Front-face tile pattern re-arranges continuously (period ~55-60 frames). |
| CN | Connector line + data dash | S2: line from (775,800) to (955,675), slope 34.8 deg, ~6 px thick | line #384E83 (darkest #1E3466), ~6-7 px thick at S2; dash pure white, **~41 px long x 8 px thick at S2** (blob measured n229/236/244/262, constant) = ~14 px long at S0 (divide by hero zoom 2.99) | floor plane | S0 shows two thin parallel lines (dark #3D5680 upper, pale grey-blue lower) running left plate -> stack -> right platform. The dashed segment is the one entering the hero slab zone (x~1180-1310 at S1). |
| P1 | Pill "Foundational model" | S1 bbox x810-1110, y220-280 (300x60 px; 15.6 % W x 5.6 % H); left edge = lid1 right vertex (812), vertical centre = lid1 top vertex (y~245-250) | transparent fill (interior = bg #D0D8E3), 1.5-2 px outline #959DA8 at full opacity, text near-black (#010A13) | overlay | font ~28 px IBM Plex Sans Regular, padding ~26 px, radius 30 px. |
| P2 | Pill "Watson Discovery" | S1 bbox x1111-1392, y326-386 (281x60 px); left edge ~ lid2 right vertex (1122), centre y 356 = lid2 top vertex (355) | same as P1 | overlay | Fades in/out on the exact same frames as P1 (0 stagger). |
| P3 | Pill "Data source" | S2 final bbox x1496-1700, y129-190 (204x61 px; 10.6 % W) | same as P1 | overlay | Tracks the box during the move (position follows scene, **size constant**, no scale). |
| SH | Shadows | S0 shadows fall down-right ~110-200 px; S2 floor shadow of RP #717888 | soft penumbra ~6-10 px (S2) | on floor/plates | Key light from upper-left-front. |

Hero/lower layer pitch (low-med confidence): front-vertex spacing slab->hex->red ~105 px at S0 scale = ~0.29 L; chat-card / black slab sits ~0.45 L above the quadrant platform.

## 3. Timeline

All times t = n/23.976. "cb" = cubic-bezier. Confidence in last column.

### 3.1 Camera (measured by feature tracking of hero plane and right-platform/floor plane separately)

| start n | start s | end n | end s | element | property | from -> to | easing guess | conf |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.00 | 5 | 0.21 | CAM | hold | translation <0.25 px/f, scale drift <0.1 %/10 f (continues clip 04's very slow settle) | - | high |
| 3 | 0.13 | 63 | 2.63 | CAM move 1 (dolly-in + orbit + slight crane) | zoom (hero plane) | 1.000 -> 2.18 (x2.2) | ease-in-out, cb(0.50,0,0.40,1.05); log-zoom progress 5 %=n12, 25 %=n23, 50 %=n30, 75 %=n37, 95 %=n48, ~99 %=n60 | high |
| 3 | 0.13 | 63 | 2.63 | CAM move 1 | zoom (floor / right platform) | 1.000 -> 1.96 (x1.96) | same curve; hero zooms ~11-15 % more than floor => **perspective camera with parallax** | high |
| 3 | 0.13 | 63 | 2.63 | CAM move 1 | orbit (ortho estimate from iso edge angles) | azimuth 36.0 deg -> 52.0 deg (+16); elevation 36.5 -> 28.1 deg (-8.4) | same curve | med |
| 3 | 0.13 | 63 | 2.63 | CAM move 1 | content shift (where frame-0 centre (960,540) lands) | (960,540) n6 -> (944,545) n18 -> (936,522) n24 -> (928,445) n30 -> (903,386) n36 -> (854,423) n42 -> (813,461) n48 -> (785,491) n54 -> (765,516) n63 | arc: content first rises ~155 px then settles ~130 px lower; peak speed 17 px/f at n31-32 and 3.1 %/f zoom at n29-30 | med |
| 63 | 2.63 | 148 | 6.17 | CAM hold 1 | all | scale 2.202->2.196 (-0.3 %), translation ~0.02 px/f | static (no parallax drift) | high |
| 149 | 6.21 | 211 | 8.80 | CAM move 2 (dolly right + push-in + slight orbit) | zoom (hero plane) | 2.196 -> 2.996 (x1.36) | ease-in-out ~symmetric, cb(0.45,0.10,0.50,1.00); progress 5 %=n157, 25 %=n167, 50 %=n177, 75 %=n187, 95 %=n200 | high |
| 149 | 6.21 | 211 | 8.80 | CAM move 2 | zoom (right platform / floor) | 1.976 -> 2.615 (x1.32) | same | high |
| 149 | 6.21 | 211 | 8.80 | CAM move 2 | content shift of frame-0 centre | (759,518) n149 -> (712,509) n162 -> (560,479) n174 -> (461,461) n180 -> (373,445) n186 -> (256,425) n198 -> (216,420) n211 (net -543 px x, -98 px y) | peak 17 px/f at n175-176 | high |
| 149 | 6.21 | 211 | 8.80 | CAM move 2 | orbit | azimuth 52.2 -> 55.8 deg (+3.6, to ~56.2 by n278); elevation 27.8 -> 29.2 deg | same | med |
| 211 | 8.80 | 278 | 11.60 | CAM hold 2 | all | scale 2.996 -> 2.994, translation <=0.1 px/f | static | high |

Audio coincidence: the strongest onset of the first third of the clip (t=6.22 s, n149) lands exactly on the start of camera move 2; onsets at n51 and n58 coincide with the bars-cube lid/bars pop (med-low as sync evidence; music has many onsets).

### 3.2 Depth of field (blur sigma = Gaussian sigma px at 1920 wide, erf-edge fits on tracked edges; CSS `blur(sigma px)` equivalent)

| start n | start s | end n | end s | element | property | from -> to | easing guess | conf |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.00 | 29 | 1.21 | whole frame | blur | ~1.2-1.4 px (baseline softness of the render) | - | med |
| 30 | 1.25 | 70 | 2.92 | right-platform/floor group (back plane) | blur | ~1.4 -> ~4.1 (box left edge 4.0-4.5 px for n79-159; coarse edge metric 5.1-5.9) | ramps in as camera arrives (follows zoom curve) | med |
| 30 | 1.25 | 63 | 2.63 | hero plane (platform, cubes) | blur | stays sharp: 0.6-0.9 px (deep-blue edge, lid edges) | - | high |
| 63 | 2.63 | 159 | 6.63 | **Hold 1 focal plane = hero platform + both cubes** | hero ~0.8 px (in focus); top grey/black plate ~3.8 px; hex/red lower plates ~3-4 px (visual); right platform + box ~4.1 px | static | high / med |
| 164 | 6.84 | 205 | 8.55 | hero plane (platform, cubes, hex, red) | blur | 0.8 -> 1.3 (n169) -> 2.8 (n179) -> 5.0 (n189) -> 6.6 (n199) -> 7.2 (n209+) | ease-in-out, 50 % at ~n185 | med-high |
| 159 | 6.63 | 199 | 8.30 | right platform + box | blur | 4.1 -> 3.8 (n169) -> 3.1 (n179) -> 2.4 (n189) -> 1.7 (n199) -> 1.5-1.8 | ease-in-out, 50 % at ~n180 | med-high |
| 211 | 8.80 | 278 | 11.60 | **Hold 2 focal plane = right platform + box** | hero 7.2 px (heavily defocused, still readable shapes); right ~1.7 px (sharp) | static | high |

The focus pull is *simultaneous* with camera move 2 (not before/after). I found no isolated motion-blur streaking at peak speed (edges stay clean at n30 and n176); treat as none.

### 3.3 Object animation

| start n | start s | end n | end s | element | property | from -> to | easing guess | conf |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.00 | ~33 | 1.4 | E04a card, black grey slab | exit frame (top) | card top edge leaves frame at n27; text fully out by ~n34 | consequence of camera arc, no separate animation | high |
| 26 | 1.08 | 37 | 1.54 | LP periwinkle plate | exits frame left | - | camera consequence | high |
| ~15 | 0.6 | ~40 | 1.7 | BG fine minor grid | opacity 0 -> 1 (appears as camera closes in; absent n0, clearly present in floor from ~n35) | linear/ease-out | low |
| 39 | 1.63 | 44 | 1.84 | C2 deep-blue quadrant square | outline square -> thin raised slab (outline flattens to a line, then a hovering lid) | - | ease-out | med |
| 44 | 1.84 | 58 | 2.42 | C2 lid | rises from flush to full height (~0.20 L / ~140 px projected at S1) | 0 -> 1 | ease-out (decelerating) | med |
| 46 | 1.92 | 54 | 2.25 | C2 glass walls + cavity | opacity 0 -> 1; floor goes near-black navy | ease-out | med |
| 53 | 2.21 | 67 | 2.79 | C2 bars + front pane | scaleY 0 -> 1 from the floor; first bar sliver n53, bars 2-4 at n54-57 (stagger ~1-2 f), front pane n57-63, final shape n67 | ease-out, ~8-10 f per bar | med |
| 56 | 2.34 | 60 | 2.50 | C1 mid-blue quadrant square | outline -> thin slab (flatten) | - | med |
| 60 | 2.50 | 73 | 3.04 | C1 lid | rises flush -> full height (20 % at n65, 45 % at n68, 85 % at n71, 100 % at n73) | ease-out | med |
| 60 | 2.50 | 76 | 3.17 | C1 lattice cubes | revealed progressively beneath the rising lid (front/bottom layers first): green-pixel coverage 0.4 % n61, 17 % n63, 32 % n65, 43 % n67, 60 % n69, 82 % n71, 87 % n73, 98 % n75, plateau n77 | ease-out; behaves as lid-driven reveal, not per-cube pop | med |
| 65 | 2.71 | 278 | 11.60 | CN dash | white capsule (~41 x 8 px at S2) appears at the **right/upper end** (right-platform side) and travels down-left to the hero slab; **loop period 8.67 f avg (0.36 s)**, restarts at n195, 203, 211, 221, 229, 237, 247, 255, 263, 273 (intervals 8-8-10 repeating) | travel speed ~17 px/f at S2 over ~8-10 f then restart | linear | high |
| 66 | 2.75 | 68 | 2.84 | BX | ghost outline square on white RP -> crisp outline -> thin slab | - | med |
| 68 | 2.84 | 80 | 3.34 | BX | box body extrudes up from the platform (lid rises; navy walls grow: 25 % n71, 50 % n73, 75 % n75, 90 % n77, 100 % n79) | ease-out | med |
| 72 | 3.00 | 83 | 3.46 | P1, P2 | opacity 0 -> 1 (n73 .16, n75 .28, n77 .40, n79 .53, n81 .68, n82 .80, n83 1.0); **no translate, no scale**; steps look like 2-frame holds (12 fps cadence) | ~linear, 11 f (0.46 s) | med |
| 83 | 3.46 | 127 | 5.30 | P1, P2 | hold at full opacity (44 f = 1.84 s) | - | high |
| 128 | 5.34 | 139 | 5.80 | P1, P2 | opacity 1 -> 0 (n128 .79, n130 .60, n133 .39, n136 .19, n139 .02) | ~linear, 11 f | med |
| 61 | 2.54 | 112 | 4.67 | C1 | colour state GREEN (n61 first green; stable green n77-112) | - | high |
| 113 | 4.71 | 129 | 5.38 | C1 | **colour wave green -> blue**, sweeps left -> right across the lattice (green coverage 10060 n113, 8907 n117, 6758 n121, 2926 n125, 1255 n127, 0 n129) | ~linear/ease-in, 16 f | high |
| 129 | 5.38 | 152 | 6.34 | C1 | BLUE state | - | high |
| 153 | 6.38 | 170 | 7.09 | C1 | wave blue -> green, again left -> right (coverage 21 n153, 799 n159, 2592 n163, 7614 n167, 10217 n169, 12248 n171) | 17 f | high |
| 170 | 7.09 | 237 | 9.88 | C1 | GREEN hold (68 f) | - | high |
| 238 | 9.92 | 249 | 10.39 | C1 | wave green -> blue (13005 n239, 7469 n243, 3630 n245, 1256 n247, 0 n249) | 11 f (faster) | high |
| 249 | 10.39 | 278 | 11.60 | C1 | BLUE state; **final frame lattice is blue** | - | high |
| 53 | 2.21 | 278 | 11.60 | C2 panels | looping "equaliser": panel array rises/sinks, ~40-f period (sink events at n107 and n147; right-side panel rises n123-130; front panel re-rises n139-146; period peak in autocorrelation at 40 f = 1.67 s); ~8-10 f per rise/sink | ease-in-out | low-med |
| 79 | 3.29 | 278 | 11.60 | BX front/right face | light-blue tile rectangles re-arrange (tile area min n101 / max n129 / ... min n257 / max n271); half-period ~28-34 f => ~60 f (2.5 s) cycle; right face has vertical streak sparkline texture | smooth morph | low-med |
| 175 | 7.30 | 186 | 7.76 | P3 | opacity 0 -> 1 (n177 .09, n179 .21, n181 .35, n183 .53, n185 .71) while following its anchor | ~linear, 11 f | med |
| 175 | 7.30 | 209 | 8.72 | P3 | screen position follows the box: top-left (1559,182) n185 -> (1541,167) n189 -> (1518,148) n195 -> (1508,139) n199 -> (1496,129) n209 (**width constant 204-205 px**) | same as camera move 2 | high |
| 186 | 7.76 | 211 | 8.80 | P3 | text-core darkness plateaus at ~0.75-0.80 of its final value (148-169 vs 209 on a 0-215 scale) while the camera is moving, then steps to 1.0 at n212 once the camera is static. Cannot separate a real second opacity ramp from h264 smearing of moving text; build as one 0->1 fade over n175-186 (and optionally let it settle to full by n212) | - | low-med |
| 212 | 8.84 | 265 | 11.05 | P3 | hold at full opacity | - | high |
| 266 | 11.09 | 275 | 11.47 | P3 | opacity 1 -> 0 (n267 .56, n269 .33, n271 .20, n273 .08, n275 .04) | ~linear/ease-out, ~9 f | med |
| 276 | 11.50 | 278 | 11.60 | scene | last 3 frames: no pill; dash/lattice/box texture still animating | - | high |

### 3.4 Stagger / offset summary

| relation | offset (frames / s) |
|---|---|
| C2 flatten-start -> C1 flatten-start | n40 -> n56 = **16 f (0.67 s)** |
| C1 flatten-start -> BX outline | n56 -> n66 = **10 f (0.42 s)** |
| C2 / C1 / BX completion | n58 / n75 / n80 (gaps 17 f, 5 f) |
| Pills start vs C1 completion | n72 vs n75: pills start ~3 f **before** C1 is fully assembled (C1 lid ~85 %); +14 f after C2 completes |
| P1 vs P2 | 0 f (identical envelope) |
| Pill fade duration in / out | 11 f in, 11 f out; pill dwell 44 f (1.84 s) |
| Lattice colour waves | green->blue starts 41 f after the pills appear; waves ~16 f long, sweep left->right |
| Bars within C2 | ~1-2 f stagger, 8-10 f grow each |
| First dash vs hero camera arrival | dash starts n65, camera finishes n63 (+2 f) |
| Move 1 -> Move 2 gap | n63 -> n149 = 86 f (3.59 s) hold |
| P3 start vs camera move 2 start | n175 vs n149: starts 26 f into the move, finishes fading in at n186 (right after peak velocity n175-176) |

Micro-motion not present: no cursor, no caret, no typing, no hover; no parallax drift during holds.

## 4. Composition

Projection: a **telephoto perspective camera that behaves almost isometric** (the iso edge angles drift smoothly as the camera orbits). Estimated (orthographic approximation from the two dominant edge families, up-right edge angle `a1`, down-right edge angle `a2`; elevation `sin(e) = sqrt(tan a1 * tan a2)`, azimuth `tan(az) = tan a1 / sin e`):

| n | t s | up-right edge | down-right edge | elevation | azimuth |
|---|---|---|---|---|---|
| 0 | 0.00 | 23.4 deg | -39.3 deg | 36.5 deg | 36.0 deg |
| 13 | 0.54 | 23.7 | -38.4 | 36.1 | 36.7 |
| 21 | 0.88 | 24.6 | -36.2 | 35.4 | 38.4 |
| 29 | 1.21 | 26.7 | -31.2 | 33.4 | 42.3 |
| 37 | 1.54 | 29.3 | -25.6 | 31.3 | 47.3 |
| 49 | 2.04 | 30.8 | -21.1 | 28.6 | 51.2 |
| 61-149 | 2.54-6.2 | 31.0-31.1 | -20.2..-19.9 | 27.8-28.1 | 52.0-52.2 |
| 179 | 7.47 | 33.8 | -19.0 | 28.7 | 54.3 |
| 199 | 8.30 | 35.7 | -18.3 | 29.2 | 55.8 |
| 278 | 11.60 | 36.1 | -18.1 | 29.3 | 56.2 |

(For comparison, true isometric would be +-30 deg / 35.26 deg elevation; this render is ~36 deg elevation at n0, flattens to ~28 deg for the hero shot and ends ~29 deg. Confidence: med; absolute FOV not recoverable, see section 9.)

Key frames (percent coordinates of 1920x1080):

| n | t s | layout / focal point | hierarchy | negative space | DoF |
|---|---|---|---|---|---|
| **0** | 0.00 | Stack centred-right of middle: stack bbox x37-63 %, y17-73 %; right platform x64-90 %, y23-53 %; periwinkle plate lower-left x9-36 %, y63-95 %. Chat card top face centre ~(52 %, 28 %) | card (text, highest contrast) > blue slab > plates; the three groups form a "<" triangle joined by connector lines | large empty top-left and top/right (>45 % of frame is bare backdrop with crosshairs) | all sharp (sigma ~1.3) |
| 30 | 1.25 | peak of move; blue 4-quadrant plate emerging, card leaving the top, right platform now x62-100 % | quadrants (pale/white/deep-blue) become hero | top-left | sharp, fine grid appearing |
| 63 | 2.63 | **camera arrives.** Hero platform x7.6-66 %, y36-89 %; cube2/cube1 squares still flush | hero platform fills left 2/3 | top band + right third show soft right platform | right/back plane starts to defocus |
| 83 | 3.46 | both pills fully in | cubes + pills = focal cluster at (~43 % W, 40 % H) which sits near the **left-third / upper-third intersection (33 %, 33 %)**; WD pill at (65 % W, 33 % H) sits on the **right-third / upper-third intersection (66.7 %, 33 %)**; FM pill (50 %, 23 %) | upper-left 28 % x 35 % block (x0-540, y0-380) is empty backdrop | hero sharp (0.8), right plate blur 4.1 |
| 100 | 4.17 | Hold 1 reference. Hero bbox 7.6-66 % x 36-89 %; box (85 % W, 48 % H) = deep-blue accent on blurred white; top grey plate blurred at top edge (23-54 % W, 0-14 % H); connector dash small and blurred at (61-68 %, 68-74 %) | in-focus hero (saturated blue) vs blurred pale right platform (low contrast): saturation + sharpness both steer the eye left | right third top and bottom-left corner | 3 depth planes: top plate (sigma ~3.8), hero (0.8), right platform (4.1) |
| 139 | 5.80 | pills gone, lattice blue | cubes only | same | same |
| 180 | 7.51 | mid-move 2; hero at left edge, RP growing | transition | - | hero 2.8-3.0 / right 3.1: **both planes equally soft - the DoF crossover moment** |
| 211 | 8.80 | Hold 2 begins: box x61-82 % W (top face centre ~(72 %, 22 %)), y~13-47 %; RP spans x38-100 % | sharp right platform + box; blurred blue hero as left-edge colour mass | bottom-right floor with grid (x52-100 %, y82-100 %) reads as texture; top-left 0-52 % x 0-14 % | right 1.7, hero 7.2 |
| 239 | 9.97 | P3 pill at (83 % W, 15 % H) | box (upper-right third intersection (66.7 %, 33 %) hit: box visual centre (72 %, 35 %)) > pill > connector (45 %, 68 %) | - | - |
| **278** | 11.60 | Final: no pill; hero 0-48 % W blurred; RP x38-100 %, y12-79 %; box (61-82 % W, 24-47 % H); connector (40-50 %, 62-74 %) | - | - | right 1.7, hero 7.2 |

Depth staggering: three planes (top plate z+, hero z0, right platform z-); the focal plane *moves* from hero (z0) to right platform (z-) during move 2. The hero blue cluster has the saturated colour, the target of attention in Hold 1; in Hold 2 the target is the dark-navy box against pure white (maximum contrast).

Grid backdrop behaviour: backdrop colour constant; crosshair "+" lattice is world-fixed on the floor plane, so it scales x2.2 (S1) and x3.0 (S2) (cross ~20 -> ~45 -> ~60 px; spacing ~65 -> ~145 -> ~195 px) and shears with the orbit; the minor grid appears as zoom increases (LOD-style fade-in, low confidence); distant crosses defocus to soft blobs; no scene-independent parallax layer.

## 5. Transitions

**In (04 -> 05).** I diffed clip 04's last frame (n316) against clip 05's n0 (same camera family; iso edge angles equal: 23.5/-38.9 deg vs 23.4/-39.3 deg). Measured similarity alignment: clip 05 content is **scale 0.984, +17.4 px x, +8.2 px y** relative to clip 04's last frame (mean abs diff 4.0 vs ~0.5-0.8 between consecutive frames inside either clip), i.e. a **near-continuous cut with a small reframing jump (~1.6 % zoom-out, ~19 px shift)**, not a frame-exact continuation. Clip 04's last frames show a very slow zoom-out (-0.3 % per 10 frames); clip 05 begins nearly still (+0.02 %/f). Hypothesis "04 is the explosion, 05 starts on the already-exploded stack" is confirmed (n0 already shows all layers separated and the chat text).

**Exact first-frame state (n0):** backdrop #D2DAE5 with "+" lattice, no minor grid; exploded vertical stack top->bottom: white chat card (text visible, "Cora+ 10:45 / I lost my wallet..."), grey plate with black edge, quadrant platform (mostly covered by the card; blue quadrants + 1 px squares visible), electric-blue glass slab, grey hex plate, red-edged wireframe plate (bottom vertex (915,785)); periwinkle/pink-blue gradient chevron plate lower-left (175-690, 685-1025); white tiled platform right (1222-1722, 250-570); two thin parallel connector lines (dark blue upper, pale lower) joining the left plate, stack, and right platform; long soft grey shadows down-right; no pills; no dash.

**Internal transitions**
- **Camera push-in + orbit + elevation drop (n3-63):** exploded stack -> hero platform; no cut, no dissolve. Technique: 3D camera dolly with orbit; the previously covered quadrant platform is revealed because the card/black plate exit the top of frame as zoom exceeds 1.4x.
- **Module reveal = "lid lift" (n39-80):** the quadrant's inset outline square lifts as a lid while glass walls and a dark cavity appear and contents grow up from the floor (bars: scaleY; lattice: lid-driven reveal; box: extrude).
- **Colour state wave (lattice):** per-cube colour swap sweeping left->right across ~16 frames.
- **Rack focus + dolly right (n149-211):** the DoF focal plane moves from hero plane to right platform while the camera slides right and zooms x1.36. Technique: simultaneous dolly + defocus pull (the blur on both planes cross at ~sigma 3 at n180).
- **Label cuts in/out by opacity only** (11 f), never by slide/scale.

**Out.** Last frame n278 is a held frame of Hold 2 (nothing slides out, no fade-to-colour). The last visible event is the Data-source pill fade-out (n266-275). Audio: continuous music at -16..-27 dBFS RMS from t=0.02 s (no fade-in => it starts mid-music), mean -21 dBFS, gradual fade over the last ~0.2 s (-28 dBFS in 11.50-11.64 s). Hand-off to a following clip: right platform sharp at right, blurred hero blue mass at left edge, lattice blue, no labels.

## 6. Visual language

**Typography (pills).** IBM Plex Sans Regular (matches glyph shapes: single-storey "a" off, flat terminals, Plex "y"/"g"). Height 60 px pill at 1080p; text ~28 px (cap-height ~20 px, avg char advance ~13.7 px), padding-x ~26 px, line-height centred. Text colour near-black (#010A13 core, #000209 darkest; use #0A111A or #161616 at full opacity). Outline ~1.5-2 px #959DA8 (probably ~rgba(22,22,22,0.4)); **no visible fill** (interior == bg #D0D8E3), radius = height/2 (30 px), no shadow, no backdrop blur. Pill height ~5.6 % of frame height, ~28 px = 2.6 % of height. Chat card text (n0-33): IBM Plex Sans ~20-22 px at S0, #3A3A3A-ish, blue "Cora+" #4D6FE8-ish.

**Palette (measured).**

| role | hex |
|---|---|
| backdrop | #D2DAE5 (#D0D8E3 / #D1D9E4 in S1/S2) |
| floor shadow | #9097A1 (S0), #717888 deep (S2) |
| crosshair marks | ~#8A93A8 (S0), near-black #2B2F3A (S2) |
| pale-blue quadrant | #C7EAFC / #B6D5F3 |
| white quadrant | #E6EDF3 (lit) / #C5CCD2 |
| mid-blue quadrant & lid1 | #6E95F9 / #6F94F5 |
| deep-blue quadrant & lid2 | #2943A3 / #28439F (shade #1A327B, #0B1847) |
| glass slab rim | #2161DC -> #214187 -> #212D54 |
| hex plate | #C1BEC9 -> #292B37 (L->R) |
| red plate edge | #A2445C (#933750 / #AD5470) |
| white platform top | #F0F0F2 (#E8E7EC-#F3F7FA); side #828598 / #737C8D |
| lattice green | #2CA757 (#60B782 / #0D703A) |
| lattice blue | #466FEF (#7E98EC / #074EE4) |
| bars | #E5FAFF edges / #C4D1FE pane |
| box | #2E3B81 front, #5070B9 tiles, #252B50..#485484 right face, lid #EAEAEA |
| connector | #384E83 (dark #1E3466), dash #FFFFFF |
| pill outline / text | #959DA8 / #010A13 |

**Shadows / lighting.** Key light from upper-left-front: lit faces are the front-left faces (box front #2E3B81, right face darker #252B50); cast shadows fall down-right with soft penumbra (~6-10 px at S2); shadow of the box on RP is #A0A4A8 (~25-30 % darkening) and of RP on floor #717888. Glass slab and cube walls carry specular rim highlights on top edges and a Fresnel-like white haze toward top-right. Cavity floors under the lids are near-black navy (#02094A) acting as the "inner floor shadow".

**Glass.** Walls ~85-90 % transparent, tinted white-blue; thin ~1 px brighter vertical edge lines; lids are opaque. Slab: translucent gradient electric-blue -> navy, bright top-edge highlight.

**Plate thickness.** White platform ~8 % of edge (24 px of ~300 px at S0); quadrant platform ~30 px at S1 (~0.04 L); lid thickness ~3-4 % of height; box lid overhang strip ~3 %.

**Corner radii.** Plates and cubes: sharp corners (0 radius). Pills: full radius. Chat bubble: ~16 px radius (S0).

**Borders/hairlines.** 1 px dark outline squares inset 50 % in each quadrant (static on pale + white quadrants); 1 px tile seams on RP; hex/wireframe line-art 1 px at ~40 % opacity.

**Text highlight treatment.** None (no highlighted words in this clip).

## 7. Recreation recipe

**Scene units.** Define unit `u` = hero-platform edge length L (= 0.19 x frame width at the n0 framing). Layer pitch ~0.29 u, lid lift / glass height ~0.20 u, cube cell ~0.04 u (pitch ~0.077 u), plate thickness ~0.04 u (hero) / ~0.08 x edge (white platforms), slab-to-platform gap ~0.06 u. Right platform ~1.0 u wide, centred ~2.4 u to the +x side of the hero platform (derived from S0 layout, low-med confidence).

**Camera (Three.js).** Use a `PerspectiveCamera` with a long lens (vFOV ~12-18 deg, low confidence; parallax of hero vs floor/right plane is x1.115 at Hold 1 and x1.145 at Hold 2). Drive it in spherical coordinates around a moving target. Keyframes (t in s, `zoomHero` is the screen scale of the hero plane relative to n0; implement as distance `D = D0/zoomHero`):

```js
const FPS = 23.976, ms = n => n * 1000 / FPS;
const cameraKeys = [
  // n    zoomHero azimuth elevation  targetShiftPx(frame-0 centre lands at)
  [  0,   1.000, 36.0, 36.5, [960,540]],
  [ 12,   1.040, 36.4, 36.1, [956,540]],
  [ 24,   1.251, 39.0, 35.0, [936,522]],
  [ 30,   1.483, 42.3, 33.4, [928,445]],
  [ 36,   1.753, 46.0, 31.7, [903,386]],
  [ 48,   2.097, 50.5, 29.0, [813,461]],
  [ 63,   2.179, 52.0, 28.1, [765,516]],   // HOLD 1: n63..n148
  [149,   2.196, 52.2, 27.8, [759,518]],
  [162,   2.287, 52.5, 28.0, [712,509]],
  [174,   2.504, 53.7, 28.5, [560,479]],
  [186,   2.756, 55.0, 29.0, [373,445]],
  [198,   2.935, 55.7, 29.2, [256,425]],
  [211,   2.996, 55.9, 29.3, [216,420]],   // HOLD 2: n211..n278
  [278,   2.994, 56.2, 29.3, [212,424]],
];
// Easing windows: move1 n3..n63 cb(0.50,0,0.40,1.05) (2.5 s), move2 n148..n211 cb(0.45,0.10,0.50,1.00) (2.6 s).
// Interpolate zoom in LOG space, azimuth/elevation linearly, target in screen px (convert to world pan).
```

Practical implementation: build the isometric rig, then match the table rather than trusting a model FOV: compare your render against measured edge angles (up-right/down-right slopes 23.4/-39.3 deg at start, 31.0/-20.0 deg in Hold 1, 36.1/-18.1 deg at the end). In CSS 3D use `perspective: ~2200px` (or orthographic) with `rotateX(~62-64deg) rotateZ(~-36deg -> -52deg -> -56deg)`; ortho-iso `rotateX(90deg - elevation)`, `rotateZ(-azimuth)` per the table; there is **no roll** (the apparent in-image rotation of the hero in my similarity fits, ~-13.5 deg at n63, is the azimuth change, not camera roll).

**DoF / blur (post-process by plane).** Render three depth planes or use BokehPass; per-plane blur sigma (px at 1920 wide, scale proportionally):

```js
const blur = {
  hero:  n => lerpEase(n,[0,0.8],[164,0.8],[205,7.2]),      // ease-in-out; 50% at n185
  right: n => n<30?1.4 : n<70?lerp(n,30,70,1.4,4.1) : n<159?4.1 : lerpEase(n,[159,4.1],[199,1.7]), // 50% at n180
  topPlate: 3.8, lowerPlates: 3.5   // hex/red/top grey slab in Hold 1
};
```

CSS equivalent: `filter: blur(${sigma}px)` (CSS blur radius = sigma). Keep text/pills outside the blurred layers.

**Module pop-ups (ms from clip start; durations in ms, 41.7 ms/frame).** Easing `cubic-bezier(0, 0, 0.3, 1)` (decelerating) on all:

| module | flatten (ms) | lid rise (start, dur) | contents |
|---|---|---|---|
| bars cube C2 | 1670 | 1840, 580 | glass walls opacity 0->1 at 1920, dur 330; bars scaleY 0->1 from 2210, 8-10 f each, stagger 1-2 f |
| lattice cube C1 | 2330 | 2500, 540 | cubes revealed under lid 2500-3170 |
| box BX | 2750 | 2840, 500 | walls extrude with the lid |

**Pills.** `opacity` only: in 3000->3460 ms (12 f), hold to 5340, out 5340->5800 ms; `P1.left = lid1.rightVertex.x, P1.centreY = lid1.topVertex.y`; P2 same on cube2. `P3`: fade 7300->7760, out 11090->11470; anchor = box top face, centre x ~1598/1920 at S2, y ~160; size constant in px, follows the projected anchor of the box every frame (do not scale with zoom).

**Lattice colour.** Per-cube colour = `mix(green, blue, smoothstep(w - 0.15, w + 0.15, x_norm))` where `w` sweeps 0->1 over 16 frames left->right; timeline of target state: green n61-112, blue n129-152, green n170-237, blue n249+; transitions n113-129, n153-170, n238-249.

**Connector dash.** A 41 x 8 px (at S2; ~14 x 3 px at S0) white capsule on a 6 px #384E83 line; animate along the line from the right-platform end to the hero end over 8-10 frames, restart every 8.67 frames (0.36 s); first launch at n65; do not draw the line on (it is static from n0).

**Box texture.** Animate a navy panel with ~6-8 light-blue (#5070B9) rectangles whose widths morph on a ~60-frame loop; add vertical-streak sparkline texture to the right face.

**Pitfalls.** (1) Do not treat move 1 as 2D scale: parallax and the iso-angle drift are visible (elevation 36.5 -> 28 deg). (2) The pills do not scale with camera zoom (keep px size). (3) Keep the focus pull *coupled* to move 2; blur is not a separate beat. (4) Dash loop period is 8.67 frames - do not lock to 24 fps integer (use 0.36 s). (5) Lids are the same colour as their quadrant. (6) The first 0.2 s is a hold - don't start the camera on frame 0.

**Aspect-ratio scaling.** Everything above is in 1920x1080 px. For other aspect ratios keep the scene unit L and the camera angles, scale the frame by height (not width) for 16:9->4:3/1:1/9:16 (hero platform ~0.19 x W at n0 equals ~0.34 x H); re-solve the "target shift" in world units (not px), and clamp pill anchors to the visible frame (pills at x ~15-93 % of W in 16:9).

## 8. Reusable patterns (for the skill)

1. **Hold - move - hold - move - hold rhythm:** 0.2 s settle, 2.5 s ease-in-out camera move, 3.6 s hold in which all object animation happens, 2.6 s second move, 2.8 s final hold. Never animate camera and labels at the same time except the label that tracks the move.
2. **Camera moves are orbit + dolly, not 2D scale:** azimuth +16 deg and elevation -8 deg while zooming x2.2; expect 10-15 % extra zoom on near planes (perspective), no roll.
3. **Modules come out of the platform as lids:** flatten the inset outline square -> lift it as the module lid (same colour as the quadrant), fade glass walls in, darken the cavity, then grow contents from the floor with ease-out; stagger modules by 10-16 frames.
4. **Labels are fade-only pills:** 11-12 frames in, ~1.8 s dwell, 11 frames out, 1.5-2 px outline, transparent fill, ~28 px IBM Plex Sans, height 60 px; anchor left-edge to the module lid's right vertex and centre to its top vertex; pill size constant while the scene zooms.
5. **Depth of field is a story device:** put the focal plane on the hero in Hold 1 (sigma 0.8 vs 4 on others), then pull focus (sigma 0.8 -> 7, 4 -> 1.7) over the same frames as the next dolly; the two planes cross at ~sigma 3 mid-move.
6. **Persistent micro-loops give life to holds:** data dash (0.36 s loop), lattice colour waves (left->right, 16 f, state toggles every 1-3 s), panel equaliser (~1.7 s), box texture morph (~2.5 s). Keep them running through both holds.
7. **Compose to thirds:** hero cluster on the left-third/upper-third, label on the right-third/upper-third; in the second hold the box sits on the upper-right third intersection, pill above-right, large empty top-left.
8. **Backdrop is a real floor:** "+" lattice and a minor grid lie on the ground plane in the scene (they scale/shear with the camera), shadows fall down-right, key light upper-left-front.

## 9. Open questions / uncertainty

- **All frame indices in this report are raw 0-based decoded frame numbers n (t = n/23.976 s); overview f_### images were not used for timing.** My own `full/f_NNN.jpg` working frames equal raw n = NNN-1 (verified diff 0.000).
- **Corrections to the brief:** (a) clip starts with the full exploded stack incl. chat text, not just the blue modules; (b) pills have **no translucent fill** (transparent) and 1.5-2 px outline; (c) a third label **"Data source"** exists and belongs to the navy box; (d) the "dot" on the connector is a **white capsule dash that loops right->left every 0.36 s** from n65; (e) at ~5.5 s (n132) the two pills are mid fade-out (about 40 % opacity) and the lattice is mid green->blue wave; (f) the brief's "second platform blurred" holds only in Hold 1 - in Hold 2 it is the *sharp* plane and the hero is blurred; (g) "Foundational model" labels the lattice cube, "Watson Discovery" labels the bars cube; (h) the 04->05 cut is near-continuous but not frame-exact (scale 0.984, +17/+8 px).
- Camera FOV / true 3D distances are not recoverable from edge angles alone; angles use an orthographic approximation (med confidence). The vFOV 12-18 deg is inferred from the hero-vs-floor zoom discrepancy (low confidence).
- Fine minor-grid fade-in timing (n~15-40) is low confidence; I could not separate it from DoF/LOD changes.
- Lattice count (4x4x4) is visually estimated (med-low); the exact per-cube stagger inside the colour wave could not be resolved because the wave looks like a smooth left-to-right front (no per-cube random delay observed).
- C2's panel "equaliser" (rise/sink events) is described from sampled frames; exact heights and the full 40-frame schedule after n150 are low-med.
- Box face tile pattern: only coarse morph timing (min/max of light-tile area); individual tile motions not tabulated.
- Audio is a music bed; onset-to-visual sync is only convincing at n149 (camera move 2 start) and n51/n58 (bars cube pop); no SFX identified.
- The overview-frame count of the pill blur values uses "sigma"; true render DoF may be a depth-based CoC that also softens the slab and plates differently from my estimates (hex/red plates ~3-4 px is visual).
- Scratch files (contact sheets, trackers, kymographs) are in `/Users/kyletran/Movies/Natwest - Motion studies/analysis/work/clip-05/`.
