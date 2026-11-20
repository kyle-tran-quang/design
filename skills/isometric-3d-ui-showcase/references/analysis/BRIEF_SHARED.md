# Shared brief — isometric-3d-ui-showcase motion analysis

## Why this exists
We are building a Claude skill called **isometric-3d-ui-showcase**. It will teach Claude to
build interactive mockups, transitions, and videos *to scale* in this visual style:
isometric / exploded-layer 3D UI on a blueprint-grid backdrop (IBM Carbon-like: IBM Plex Sans/Mono,
blues + warm greys, soft shadows, depth of field).
The 5 clips ("Nested Sequence 01..05.mp4", 1920x1080, 23.976 fps, h264 + audio) are reference examples.
They appear to be sequential parts of one story:
  01 blank white card on grid -> 02 chat UI with dark annotation callouts + defocus ->
  03 flat chat card -> 04 card explodes into isometric layers -> 05 isometric blue modules + pill labels.
(Order is a hypothesis — confirm or correct it from the first/last frames.)

## Your job
Analyse ONE clip in forensic detail: **motion, composition, transitions**. The output must be precise enough
that an engineer can re-create the clip in CSS 3D / Three.js / Remotion with matching timing and numbers.
Prefer measured numbers over adjectives. Where you estimate, say so and give a confidence (high/med/low).

## Paths
- Source clips (READ ONLY, never modify): /Users/kyletran/Movies/Natwest - Motion studies/Nested Sequence NN.mp4
- Pre-extracted 4 fps overview frames: /Users/kyletran/Movies/Natwest - Motion studies/analysis/frames/clip-NN/f_###.jpg
  (f_001 = t=0.00s, spacing 0.25 s, 1280px wide)
- YOUR scratch dir (create/use only this for generated files): /Users/kyletran/Movies/Natwest - Motion studies/analysis/work/clip-NN/
- YOUR report (the deliverable): /Users/kyletran/Movies/Natwest - Motion studies/analysis/reports/clip-NN.md
- Do not write anywhere else. Do not edit other clips' files.

## Method (ffmpeg/ffprobe are at /opt/homebrew/bin; use the Read tool to LOOK at images)
1. Skim the 4 fps overview frames to understand the beats.
2. Find where motion actually happens: compute a motion-energy curve (e.g. ffmpeg `select='gt(scene,0.0)'`+`metadata=print`,
   or `tblend`/`signalstats` YDIF per frame) and list the bursts. Report as frame numbers AND seconds (frame/23.976).
3. Re-extract DENSE frames (every frame or every 2nd frame) ONLY inside the motion bursts, and tile them into contact
   sheets (ffmpeg `tile=4x3`, ~480px per cell) so you can read 12 frames at once. View full-res single frames for detail.
4. Measure: element positions/sizes as % of the 1920x1080 frame (and px), rotation/skew angles of isometric planes
   (estimate from edge slopes in the frame), layer spacing in px, scale changes, blur radius changes, opacity changes.
   Sample colours by cropping a small region and reading pixel values (e.g. `ffmpeg -vf crop=4:4:x:y,scale=1:1 -f rawvideo -pix_fmt rgb24 -`
   piped through `xxd`, or save a PNG and read it). Give hex codes.
5. Estimate easing by plotting position-vs-frame for a moving element across the burst (3+ sample points): classify as
   linear / ease-in / ease-out / ease-in-out / overshoot-spring / expo; give an approximate cubic-bezier.
6. Check the audio track (ffprobe/ffmpeg `astats` or `silencedetect`/`ebur128`): is there music/SFX? Do transients line up with visual hits?
   Keep this brief — a few lines.
7. Note first-frame and last-frame content precisely so adjacent clips can be stitched/continued (hand-off state).

## Required report structure (markdown, use these exact H2 headings)
## 1. Summary
Duration, frame count, narrative purpose of the clip in the sequence, one-paragraph description.
## 2. Element inventory
Table: id | what it is | geometry (w x h px / % of frame) | material/colour (hex) | z-order/depth | notes.
## 3. Timeline
Table: start frame | start s | end frame | end s | element id | property animated | from -> to | easing guess | confidence.
Cover EVERY animated event, including micro-motion (cursor dots, caret, typing, hover, parallax drift, camera drift).
Also give a stagger/offset summary (delay between siblings in frames).
## 4. Composition
Per key frame (give frame numbers): layout in % coordinates, focal point, visual hierarchy, negative space,
camera/projection (flat / isometric — give estimated rotateX/rotateZ or axis angles), depth of field state,
grid backdrop behaviour (scale, parallax, fade, crosshair spacing in px).
## 5. Transitions
Every transition inside the clip AND the in/out hand-off to neighbouring clips (exact first/last frame state).
Name the technique (e.g. camera pull-back + defocus, layer separation along Z, mask wipe, scale-from-card, cross-dissolve).
## 6. Visual language
Typography (family guess, sizes in px, weights, colours), palette (hex), shadows (offset/blur/opacity/colour),
lighting direction, corner radii, glass/translucency, borders/hairlines, text highlight treatment.
## 7. Recreation recipe
Concrete numbers: suggested CSS 3D transform stack or Three.js camera params, durations in ms, easing curves,
stagger values, and pitfalls. Pseudocode / small snippets welcome. State how it should scale to other aspect ratios.
## 8. Reusable patterns (for the skill)
3-8 bullet "rules" distilled from this clip that generalise (e.g. "separate layers along Z by N% of panel width",
"callouts enter 6 frames after their anchor word highlights"). These feed the skill's rules file directly.
## 9. Open questions / uncertainty

## Hygiene
- Be quantitative. Prefer a table to prose. Be honest about anything you could not measure.
- When finished, your final message to me should be SHORT: path of the report + the 5 most important findings.
