/* =========================================================================
   STAGE F DATA (rebuild): Figma file 1r4UreOVeEqdcXvnD5cetk. Slides: s1 208:9517 (pathways card), s2 333:5958 (old map), s3 333:6577 (window 333:6579),
   s4 235:8230 (comparison), s5 208:9575 (to be continued).
   One continuous beat. Stage E's dark card zooms back out, flips (dark -> light page), the pathways blocks expand and their labels wipe in; the card then tilts to an isometric
   blueprint and its pieces travel and assemble into the "Plan your customers' next move" window; a cursor toggles Compare stages; the window folds back to outlines and leaves an empty
   stage under a full-width "To be continued...".

   Every window is in vh of scroll, LOCAL to the beat (0 = the first vh after Stage E's final rest; E.end = 1620). STAGEF.toGlobal(startVh) shifts them. Chapter 11 on all five slots.

   PACING WORKSHEET (vh; viewer model .claude/skills/ui-assembly-animation/reference/pacing.md). MAX 560, scrollVh 660.
   | Part                    | range    | vh | easing     | why this long |
   | E card zooms out        | 0-24     | 24 | inOutSine  | E's own zoom (28vh) played backwards; the highlight fades out in lockstep |
   | Flip HERO 1             | 20-62    | 42 | inOutCubic | rotateY 0 -> 180 about the card centre (face swap at 90); the page turns dark -> light in lockstep |
   | Expand HERO 2           | 62-110   | 48 | inOutCubic | 5 blocks wipe open left to right, staggered 5vh, 28vh each (the reveal edge moves 420 px: needs >= 26vh for 6x) |
   | Labels (SUPPORT)        | 86-120   | 34 | inOutSine  | each label wipes in left to right, staggered 5vh, 14vh each |
   | Rest 1  (s1)            | 120-166  | 46 | -          | 2 sentences, 28 words: 20 + 0.6 x 28 = 36.8; +9; anchor 143 |
   | Blueprint HERO 3        | 166-202  | 36 | inOutCubic | camera flat -> iso; the card breaks into 7 outline slabs that lift (stagger 1.5vh, 25vh each, inOutQuart) |
   | Rest 2  (s2 + old map)  | 202-252  | 50 | -          | 15 words + a 561 px image to look at; anchor 227 |
   | Assemble HERO 4         | 252-318  | 66 | inOutQuart | slabs travel into the window (stagger 2.5vh, 32vh each), camera iso -> flat 256-302, the 3 dark cells tip off and fall, the live window cross-fades in 300-318 |
   | Rest 3  (s3)            | 318-360  | 42 | -          | 27 words: 20 + 0.6 x 27 = 36.2; +6; anchor 339 |
   | Cue / Tap / Toggle      | 360-394  | 34 | cubic/sine | cursor enters moving, tap dip + ring, knob slides |
   | Compare HERO 5          | 394-432  | 38 | inOutCubic | tabs -> checkbox row, Stage 1 narrows (lockstep); Stage 2 + Feedback tab arrive 404-438 (SUPPORT) |
   | Rest 4  (s4)            | 440-490  | 50 | -          | 2 sentences, 34 words: 20 + 0.6 x 34 = 40.4; +10; anchor 465 |
   | Exit HERO 6             | 490-524  | 34 | inOutCubic | window tilts back to outlines (camera flat -> iso) and fades; column and nav go #F4F4F4 / hidden in lockstep |
   | Rest 5  (s5)            | 524-560  | 36 | -          | 3 words; the page ends here; anchor 542 |
   Anchor gaps: E2 1600 -> s1 1763 (163: E's rest 1580-1620, then the zoom-out/flip/expand which the empty column covers), s1 -> s2 84, s2 -> s3 112, s3 -> s4 126, s4 -> s5 77.

   MY DECISIONS (none is in a Figma frame; redirect freely)
     - Reverse zoom: the live E piece is re-made with a time map (v 0-24 -> E's local 100 -> 72). The pathways card (510 x 590) sits exactly centred in E's card footprint (562 x 666) in Figma,
       so the flip rotates E's card, swaps the face at 90 deg (the second face is drawn as rotateY(theta - 180), not mirrored) and the white card lands at (105, 217).
     - Blueprint pieces map: shell -> window shell, title -> header section, APM band -> product tabs, FSM band -> Stage content; the rail and the UI-shell header drop in new; the 3 dark cells tip off.
     - The old 5-column map is a static image in the text column (story.js), not on the stage.
     - Easing: inOutCubic for camera and fades, inOutQuart for piece travel, inOutSine for click, toggle, label wipes. No overshoot.
   ========================================================================= */
(function () {
  const T = {
    MAX: 434,
    zoomOut:   [0, 14],                          // E card zooms back out
    flip:      [12, 38],                         // HERO 1: rotateY 0 -> 180 + page dark -> light
    expand:    [38, 66],                         // HERO 2: blocks wipe open (5 blocks, KNOBS.blkStep / blkLen)
    labels:    [52, 72],                         // SUPPORT: labels wipe in (KNOBS.lblStep / lblLen)
    rest1:     [72, 98],                         // ANCHOR f1 (68)
    rest1b:    [98, 158],                        // ANCHOR f1b (128)
    tilt:      [158, 180],                       // HERO 3: camera flat -> iso, card breaks into slabs
    rest2:     [180, 248],                       // ANCHOR f2 (203)
    assemble:  [248, 288],                       // HERO 4
    layers:    [250, 277],                       // slab travel (stagger KNOBS.layerStep, len KNOBS.layerLen)
    camFlat:   [250, 278],                       // camera iso -> flat
    real:      [277, 288],                       // live window cross-fades in
    rest3:     [288, 313],                       // ANCHOR f3 (300)
    cue:       [313, 324],
    tap:       [324, 328],
    toggle:    [327, 334],
    compare:   [334, 357],                       // HERO 5
    stage2:    [340, 361],
    cursorOut: [357, 361],
    rest4:     [361, 392],                       // ANCHOR f4 (376)
    exit:      [392, 412],                       // HERO 6
    rest5:     [412, 434]                        // ANCHOR f5 (423)
  };

  const KNOBS = {
    blkStep: 3, blkLen: 16,                      // pathways blocks: block i opens over [expand0 + 3i, + 16] (last ends 38 + 12 + 16 = 66)
    lblStep: 3, lblLen: 8,                       // labels: label i wipes over [labels0 + 3i, + 8] (last ends 52 + 12 + 8 = 72)
    liftStep: 1, liftLen: 15,                     // blueprint lift: slab i over [tilt0 + 2 + 1i, + 15]
    layerStep: 1.5, layerLen: 19,                // window assembly: layer order i = 0..4 (shell, title, bands + cells, rail + header...): slab over [layers0 + 1.5i, + 19]
    fallStep: 1.8, fallLen: 18, fallDrop: 260,   // the 3 dark cells tip off: cell j over [layers0 + 1.8j, + 18], z - 260, rx +-40
    exitStep: 1, exitLen: 12,                    // exit: slab i lifts over [exit0 + 4 + 1i, + 12]
    tapScale: 0.92, stage2Step: 6, camZ: 0.8,
    zEps: 0.1                                    // coplanar slabs sit a hair above the live card
  };

  const FLAT = { rx: 0, rz: 0, s: 0.8 };
  const KF = 0.78;
  const ISO = { rx: 60, rz: -45, s: 0.8 * KF };
  const ZK = KF * Math.sin(Math.PI / 3);

  // Pathways card (Figma 208:9517 / 333:6551), stage px. The white card is centred in Stage E's card footprint (562 x 666 at (79, 179.3)): offset (26, 38).
  const CARD = {
    x: 105, y: 217, w: 510, h: 590, ox: 26, oy: 38,
    title: { x: 16, y: 24, text: "// Maturity pathways", color: "#4589FF" },
    box: { x: 16, y: 77, w: 478, h: 497, r: 32 },            // container; the blocks are clipped by its rounded corners
    // blocks in container-local px; strips = 40 px wide from x 279 (the last is 39 so the band ends at 478), white overlay opacities
    blocks: [
      { id: "apm",  label: "Asset performance\nmanagement", x: 0,   y: 0,   w: 478, h: 165, bg: "#F1C21B", ink: "#000", strips: true, lx: 20, ly: 20 },
      { id: "fsm",  label: "Field service\nmanagement",     x: 0,   y: 165, w: 478, h: 165, bg: "#FF7EB6", ink: "#000", strips: true, lx: 20, ly: 20 },
      { id: "inv",  label: "Inventory\noptimization",        x: 0,   y: 330, w: 159, h: 167, bg: "#3F3F3F", ink: "#fff", lx: 20, ly: 25 },
      { id: "hse",  label: "Health,\nsafety &\nenvironment", x: 159, y: 330, w: 160, h: 167, bg: "#3F3F3F", ink: "#fff", lx: 20, ly: 25, border: true },
      { id: "ins",  label: "Asset\ninspection",              x: 319, y: 330, w: 159, h: 167, bg: "#3F3F3F", ink: "#fff", lx: 20, ly: 25, border: true }
    ],
    stripX: 279, stripW: 40, stripO: [0.2, 0.4, 0.6, 0.8, 0.9]
  };
  const bx = CARD.x + CARD.box.x, by = CARD.y + CARD.box.y;     // 121, 294
  // Blueprint slabs of the card (stage px) and the window slab each one becomes. zA = lifted height in the blueprint, zB = height in the window.
  const BLUEPRINT = [
    { id: "shell", label: "Card shell",   rect: { x: CARD.x, y: CARD.y, w: CARD.w, h: CARD.h }, zA: 0,  to: "base" },
    { id: "title", label: "Title",        rect: { x: CARD.x + 16, y: CARD.y + 24, w: 300, h: 35 }, zA: 40, to: "hero" },
    { id: "apm",   label: "APM band",     rect: { x: bx, y: by, w: 478, h: 165 }, zA: 80, to: "tabs" },
    { id: "fsm",   label: "FSM band",     rect: { x: bx, y: by + 165, w: 478, h: 165 }, zA: 80, to: "stages" },
    { id: "inv",   label: "Inventory",    rect: { x: bx, y: by + 330, w: 159, h: 167 }, zA: 80, fall: 0 },
    { id: "hse",   label: "HSE",          rect: { x: bx + 159, y: by + 330, w: 160, h: 167 }, zA: 80, fall: 1 },
    { id: "ins",   label: "Inspection",   rect: { x: bx + 319, y: by + 330, w: 159, h: 167 }, zA: 80, fall: 2 }
  ];

  const GEO = {
    stage: { w: 720, h: 1024, bg: "#F4F4F4" },
    win: { x: 60, y: 212, w: 600, h: 600 },               // stage px
    // The window as 6 slabs. z = height in iso (z units). Window-local rects. `bp` = blueprint colours the slab starts from (rgba), `from` = the card slab it comes from.
    slabs: [
      { id: "base",   label: "Window",          x: 0,      y: 0,      w: 600,   h: 600,   z: 0,  fill: "#FFFFFF", stroke: "#8D8D8D", bp: [255, 255, 255, 0.7], bpS: [141, 141, 141], from: "shell" },
      { id: "hero",   label: "Header section",  x: 0,      y: 18.56,  w: 600,   h: 169.3, z: 34, fill: "#E0E0E0", stroke: "#8D8D8D", bp: [69, 137, 255, 0.14], bpS: [69, 137, 255], from: "title" },
      { id: "tabs",   label: "Product tabs",    x: 87.88,  y: 187.9,  w: 224.4, h: 15.9,  z: 68, fill: "#FFFFFF", stroke: "#0F62FE", bp: [241, 194, 27, 0.35], bpS: [196, 150, 0], from: "apm" },
      { id: "rail",   label: "Left rail",       x: 87.88,  y: 264,    w: 101.5, h: 152.8, z: 68, fill: "#FFFFFF", stroke: "#8D8D8D" },
      { id: "stages", label: "Stage content",   x: 220.6,  y: 233.5,  w: 227.9, h: 366.5, z: 68, fill: "#FFFFFF", stroke: "#8D8D8D", bp: [255, 126, 182, 0.35], bpS: [214, 84, 146], from: "fsm" },
      { id: "header", label: "Product header",  x: 0,      y: 0,      w: 600,   h: 18.18, z: 102, fill: "#E0E0E0", stroke: "#8D8D8D" }
    ],
    cellBp: { fill: [63, 63, 63, 0.35], stroke: [63, 63, 63] },
    toggle: { x: 451.5, y: 237.2, w: 18.18, h: 9.09, label: "Compare stages" },
    tabsRow: { x: 220.6, y: 233.5, w: 212.5, h: 16 },
    cursor: { from: [700, 330], to: [460.6, 241.7], size: 12, arc: 14 },
    tapRing: { r: 7 },
    stage2: { dx: 22 },
    viewport: { w: 1440, h: 900 }
  };

  /* COPY. Every string is the Figma node's `characters`, verbatim. */
  const COPY = {
    f1: { id: "208:9517", copy: ["Another part of the sales enablement kit is the maturity maps for each pathway."] },
    f1b: { id: "208:9517b", copy: ["Our focus was on asset performance management and field service management maturity content for sellers and clients for the first phase."] },
    f2: { id: "333:5958", copy: ["Initially, we had this maturity map which was comprehensive but too complex and hard to follow."] },
    f3: { id: "333:6577", copy: ["To give readers clarity without forcing the whole map with 5 stages into one view, I split the content into one single stage view at a time."] },
    f4: { id: "235:8230", copy: ["This helps executives pinpoint exact gaps in their hardware monitoring, versus on-the-ground execution.", "A comparison view helps them guide the conversation to the customer about where they\u2019re at and the target stage."] },
    f5: { id: "208:9575", copy: ["To be continued..."] },
    window: {
      appName: "Maximo Growth Opportunity Assessment Tool", nav: ["Overview", "Opportunity paths"],
      heading: "Plan your customers\u2019 next move",
      subtitle: "Assess where customers\u2019 assets performance and field service management operations stand today and advance toward reliability-driven, self-optimizing operations.",
      tabs: ["Field Service Management (FSM)", "Asset Performance Management (APM)"],
      rail: ["Where the customer is", "Value after resolving", "Pilot recommendation", "Key milestones", "Getting started (minimal viable steps)"],
      stageTabs: ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"],
      compareLabel: "Compare stages", chooseLabel: "Choose 2 stages for comparison", feedback: "Feedback",
      s1: { n: "Stage 1", name: "Reactive execution" }, s2: { n: "Stage 2", name: "Coordinated field operations" },
      where: "Where the customer is",
      tags: ["Paper or digital work orders", "Limited technician visibility", "Minimal dispatch", "Owner rather than assigned resources"],
      s1Para: "Most organizations start here. Work is created -- from breakdowns, customer calls, PMs -- and someone decide who does it informally through whiteboards, spreadsheets, or phone calls. The architectural distinction to internalize: OWNER / OWNER GROUP provides administrative and financial accountability -- who answers for the work -- while the ASSIGNMENT object provides the technical trigger that surfaces work in mobile dispatch and scheduling views. Relying on Owner alone leaves that trigger unset, so work never flows to the field.",
      s2Para: "A planner or supervisor is actively coordinating work \u2014 but mostly manually through Assignment Manager or by placing work orders directly. There is basic scheduling visibility but no structured forward-planning horizon. The key advance is centralized management of assignments and beginning to look ahead more than a day at a time. The Scheduling / Dispatch Dashboard becomes the right interface \u2014 resource availability and demand across a rolling window, without Optimizer.",
      readyText: "Work orders carry scheduled dates and a forward planning horizon is established (weekly to monthly). A centralized scheduler or dispatcher role is active in Assignment Manager, workforce availability is enriched with exceptions, and job plans gain materials, tools, and classifications. HSE, Inspections, and Inventory enter as parallel capability layers.",
      ready1: "Are you ready?", ready2: "Is the customer ready for this stage?",
      value: { h: "Value after resolving", p: "Digitize field execution and give technicians real-time access to asset and work data with Maximo Mobile. This is the entry point that pays for itself immediately in reduced phone calls and paper chase" },
      pilot: { h: "Pilot recommendation", p: "Pick one department (e.g. HVAC) with 2-5 technicians. Fix the Assignment object. Deploy Mobile. Run for 4 weeks. Measure how many work orders are completed digitally vs on paper" },
      holding: "What\u2019s holding them back"
    }
  };

  const wordCount = s => s.split(/\s+/).filter(Boolean).length;
  const WORDS = {}; ["f1", "f1b", "f2", "f3", "f4", "f5"].forEach(k => { WORDS[k] = wordCount(COPY[k].copy.join(" ")); });
  const ANCHORS = { f1: 68, f1b: 128, f2: 203, f3: 300, f4: 376, f5: 423 };

  const PEAK = { inOutSine: Math.PI / 2, smoothstep: 1.5, inOutCubic: 3, inOutQuart: 2, linear: 1 };
  const FIT = Math.min(GEO.viewport.w / 2 / GEO.stage.w, GEO.viewport.h / GEO.stage.h);
  const cursorLen = Math.hypot(GEO.cursor.to[0] - GEO.cursor.from[0], GEO.cursor.to[1] - GEO.cursor.from[1]);
  const maxZ = 102 + 90;

  window.STAGEF = {
    TIMING: T, KNOBS, GEO, CARD, BLUEPRINT, COPY, words: WORDS, anchors: ANCHORS, chapter: 11, fit: FIT, ISO, FLAT, ZK,
    // Finished poses for prefers-reduced-motion (local vh): pathways card / blueprint / single stage / comparison / empty + big text.
    poses: { card: ANCHORS.f1, blueprint: ANCHORS.f2, single: ANCHORS.f3, comparison: ANCHORS.f4, empty: ANCHORS.f5 },

    // Camera keys (local vh). Stage E ends flat. flat through the card, iso for the blueprint, flat for the window, iso again for the exit.
    cameraKeys: [
      { vh: 0, ...FLAT }, { vh: T.tilt[0], ...FLAT }, { vh: T.tilt[1], ...ISO, e: "inOutCubic" },
      { vh: T.camFlat[0], ...ISO }, { vh: T.camFlat[1], ...FLAT, e: "inOutCubic" },
      { vh: T.exit[0], ...FLAT }, { vh: T.exit[1], ...ISO, e: "inOutCubic" }
    ],

    // --flip (0 dark, 1 light) over T.flip; --exit (0 light page, 1 #F4F4F4 page, nav hidden) over T.exit
    flip: { dark: { bg: "#262626", page: "#161616", text: "#f4f4f4", line: "#f4f4f4" }, light: { bg: "#f4f4f4", page: "#ffffff", text: "#000000", line: "#1c1c1f" } },
    flipAt(vh) { const u = Math.min(1, Math.max(0, (vh - T.flip[0]) / (T.flip[1] - T.flip[0]))); return u * u * (3 - 2 * u); },
    exitAt(vh) { const u = Math.min(1, Math.max(0, (vh - T.exit[0]) / (T.exit[1] - T.exit[0]))); return u * u * (3 - 2 * u); },

    // Where the sentence changes (local vh): as each hero starts (text leads, the stage shows; same rule as Stage E), except f1 which waits for the expand to land. The outgoing `to` and the incoming `from` are the SAME value. eOut = Stage E's e2 `to` (the column stays empty until f1From).
    textSwap: { eOut: 0, f1From: 38, f1To: 98, f1bFrom: 98, f1bTo: T.tilt[0], f2From: T.tilt[0], f2To: T.assemble[0], f3From: T.assemble[0], f3To: T.cue[0], f4From: T.cue[0], f4To: T.exit[1] - 4, f5From: T.exit[1] - 4, f5To: T.MAX },

    toGlobal(startVh) {
      const shift = v => Array.isArray(v) ? v.map(x => x + startVh) : v + startVh;
      const out = {}; Object.keys(T).forEach(k => { out[k] = k === "MAX" ? T[k] : shift(T[k]); });
      out.anchors = {}; Object.keys(ANCHORS).forEach(k => { out.anchors[k] = ANCHORS[k] + startVh; });
      out.poses = {}; Object.keys(this.poses).forEach(k => { out.poses[k] = this.poses[k] + startVh; });
      out.textSwap = {}; Object.keys(this.textSwap).forEach(k => { out.textSwap[k] = this.textSwap[k] + startVh; });
      out.cameraKeys = this.cameraKeys.map(k => ({ ...k, vh: k.vh + startVh }));
      return out;
    },

    /* A SCENE-like object for .claude/skills/ui-assembly-animation/assets/pacing-audit.js. Distances are SCREEN px at the reference viewport (stage px x FIT). Sine moves are modelled as
       linear moves of pi/2 x the distance (same peak, same window). Camera tilts are real camera keys. */
    auditScene(startVh = 0, opts = {}) {
      const total = startVh + T.MAX, t = vh => (vh + startVh) / total, raw = !!opts.raw;
      const S = (raw ? 1 : PEAK.inOutSine), Q = (raw ? 1 : PEAK.inOutQuart);
      const px = (x, y) => ({ x: x * FIT, y: y * FIT });
      const mk = (id, w, h, from, to, win, e) => ({ id, rects: { r: { x: 0, y: 0, w, h } }, keys: [
        { t: t(win[0]), x: from.x, y: from.y, o: 1, rect: "r" }, { t: t(win[1]), x: to.x, y: to.y, e: e || "inOutCubic" }, { t: 1, x: to.x, y: to.y }] });
      const zs = 80 * ZK, zf = KNOBS.fallDrop * ZK;
      const pieces = [
        mk("E card: zoom out", 562, 666, { x: 0, y: 0 }, px(-(786.8 - 562) / 2 * 0 - 45, 406), T.zoomOut, "linear"),
        mk("card flip (edge travel)", 562, 666, { x: 0, y: 0 }, px(281, 0), T.flip),
        mk("pathways block wipe (reveal edge)", 478, 165, { x: 0, y: 0 }, px(478, 0), [T.expand[0], T.expand[0] + KNOBS.blkLen]),
        mk("label wipe (reveal edge)", 150, 40, { x: 0, y: 0 }, { x: 150 * FIT * S, y: 0 }, [T.labels[0], T.labels[0] + KNOBS.lblLen], "linear"),
        mk("blueprint lift (z)", 478, 165, { x: 0, y: 0 }, { x: 0, y: -zs * Q }, [T.tilt[0] + 2, T.tilt[0] + 2 + KNOBS.liftLen]),
        mk("FSM band travels into Stage content", 478, 165, { x: 0, y: 0 }, px(160, 14), [T.layers[0], T.layers[0] + KNOBS.layerLen]),
        mk("dark cell tips off", 159, 167, { x: 0, y: 0 }, { x: 0, y: zf * Q }, [T.layers[0], T.layers[0] + KNOBS.fallLen]),
        mk("cursor: travels to the toggle", 8, 8, { x: 0, y: 0 }, px(GEO.cursor.to[0] - GEO.cursor.from[0], GEO.cursor.to[1] - GEO.cursor.from[1]), T.cue),
        mk("Stage 1 narrows (compare hero)", 100, 100, { x: 0, y: 0 }, px(-110, 0), T.compare),
        { id: "Stage 2 arrives (supporter)", rects: { r: { x: 0, y: 0, w: 100, h: 100 } }, keys: [
          { t: t(T.stage2[0]), x: GEO.stage2.dx * FIT, y: 0, o: 0, rect: "r" }, { t: t(T.stage2[1]), x: 0, y: 0, o: 1, e: "inOutCubic" }, { t: 1, x: 0, y: 0, o: 1 }] },
        { id: "window fades out (exit)", rects: { r: { x: 0, y: 0, w: 600, h: 600 } }, keys: [
          { t: t(T.exit[0]), o: 1, rect: "r" }, { t: t(T.exit[0] + 10), o: 0, e: "inOutCubic" }, { t: 1, o: 0 }] }
      ];
      const camera = this.cameraKeys.map(k => ({ t: t(k.vh), rx: k.rx, rz: k.rz, s: k.s, e: k.e }));
      return {
        scrollVh: total + 100, pieces, camera,
        extras: [
          { id: "flip dark -> light", keys: [{ t: t(T.flip[0]), o: 0 }, { t: t(T.flip[1]), o: 1 }] },
          { id: "tap + toggle", keys: [{ t: t(T.tap[0]), o: 0 }, { t: t(T.toggle[1]), o: 1 }] },
          { id: "real window crossfade", keys: [{ t: t(T.real[0]), o: 0 }, { t: t(T.real[1]), o: 1 }] },
          { id: "column + nav to #F4F4F4", keys: [{ t: t(T.exit[0]), o: 0 }, { t: t(T.exit[1]), o: 1 }] }
        ],
        beats: ["f1", "f1b", "f2", "f3", "f4", "f5"].map(k => ({ id: k, hold: true, snap: t(ANCHORS[k]), range: [t(this.textSwap[k + "From"]), k === "f5" ? 1 : t(this.textSwap[k + "To"])], words: WORDS[k] }))
      };
    },
    auditNote: "pacing-audit.js has no inOutSine / inOutQuart; sine moves are modelled as linear moves of pi/2 x the distance. Camera tilts are real camera keys (inOutCubic).",

    speedReport() {
      const pxv = vh => vh * GEO.viewport.h / 100, rows = [];
      const add = (name, win, ease, dispScreen, note) => {
        const peak = PEAK[ease], scroll = pxv(win[1] - win[0]), ratio = peak * dispScreen / scroll;
        rows.push({ name, windowVh: win, easing: ease, peakSlope: +peak.toFixed(3), maxDisplacementScreenPx: +dispScreen.toFixed(1), scrollPx: scroll, ratio: +ratio.toFixed(2), ok: ratio <= 6, minVhFor6x: +(peak * dispScreen / 6 / (GEO.viewport.h / 100)).toFixed(1), note });
      };
      add("E card zooms out", T.zoomOut, "inOutSine", 440 * FIT, "E's zoom: the card corner travels about 440 stage px");
      add("flip: card edge", T.flip, "inOutCubic", 281 * FIT, "half the card width collapses and re-opens");
      add("blocks wipe open", [T.expand[0], T.expand[0] + KNOBS.blkLen], "inOutCubic", 478 * FIT, "reveal edge crosses the 478 px container");
      add("labels wipe in", [T.labels[0], T.labels[0] + KNOBS.lblLen], "inOutSine", 150 * FIT, "reveal edge crosses a label");
      add("blueprint lift (z)", [T.tilt[0] + 2, T.tilt[0] + 2 + KNOBS.liftLen], "inOutQuart", 80 * ZK, "80 z units");
      add("assemble: slabs travel", [T.layers[0], T.layers[0] + KNOBS.layerLen], "inOutQuart", 190 * FIT, "the FSM band moves about 190 px");
      add("assemble: cells tip off", [T.layers[0], T.layers[0] + KNOBS.fallLen], "inOutQuart", KNOBS.fallDrop * ZK, "z - 260");
      add("cue: cursor to the toggle", T.cue, "inOutCubic", cursorLen * FIT, `${cursorLen.toFixed(0)} stage px`);
      add("compare: Stage 1 narrows", T.compare, "inOutCubic", 110 * FIT, "right edge of Stage 1 moves about 110 px");
      add("stage 2 arrives", T.stage2, "inOutCubic", GEO.stage2.dx * FIT, "slides in from 22 px");
      return { fit: +FIT.toFixed(4), viewport: GEO.viewport, rows, worst: Math.max(...rows.map(r => r.ratio)), pass: rows.every(r => r.ok) };
    }
  };
})();
