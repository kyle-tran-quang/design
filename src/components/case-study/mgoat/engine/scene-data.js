/* =========================================================================
   SCENE DATA (Stage A: beats 1-7). Reference frame = the left half of a Figma slide: 720 x 1024.
   Every motion window comes from TIMING in story.js (vh of scroll); beat ranges come from STORY. Retime there, not here.
   Act 1 is UI morph only (flat camera, no blueprint), per the author's choice.

   MEASURED from Figma (file 1r4UreOVeEqdcXvnD5cetk), render bounds relative to each slide's stage (use_figma, absoluteRenderBounds):
     ring        208:5854 > 235:7266  Graphic        (88.6, 237)    545.3 x 543.3   export 2x, assets/act1b/ring.png
     dashboard   208:5897 > 208:6069  image 2        (48.5, 271.2)  593.8 x 483.7   existing assets/act1/dashboard.png (fit within 1px)
     tiles       208:6087  AppPoints (0, 137.7) 248.1x196.6 | Entitlement (468.1, 411.3) 251.9x209.4 | Usage (234.6, 668.8) 250.8x194.4
                 Figma exports at 2x with rotation + shadow baked in (assets/act1b/tile-*.png), so they sit at their render-bounds origin, unrotated.
                 NOTE: Usage now reads 15% (the earlier build used 35%) and Entitlement has four tags (Manage, Health, Predict, Monitor).
     city art    208:6197 > 208:6199  Stage / Capabilities morph 1 (0, 0) 720 x 1024: drawn live by capabilities.js (vector), not a PNG
     ALM         208:6307 > 208:6309  ALM Homepage   (43.6, 297.9)  633.1 x 435.3   existing assets/act1/alm-1-1.png
     hand card   208:6497 > 235:7773  Anim-simplifiedExport (30.1, 288) 659.5 x 447  export 2x, assets/act1b/handcard.png
     diagram     208:6704 > 208:6706  Stage / Capabilities morph 2 (0, 0) 720 x 1024: capabilities.js at p = 1
   MY DECISIONS (not in any Figma frame; redirect freely): the "converge" move between the dashboard/tiles and the city art, the tile stagger and drift,
   and the hand card -> diagram cross-fade (placeholder for the card-by-card morph).
   ========================================================================= */
(function () {
  const TT = window.TIMING, V = vh => vh / TT.MAX;                     // scroll vh -> scene progress t
  const w = (a, b) => [V(a), V(b)], tc = TT.toCity, ta = TT.toAlm;
  const W = 720, H = 1024;
  const P = id => SCENE.pieces.find(p => p.id === id), add = (id, ...keys) => P(id).keys.push(...keys.flat());

  // Tiles are LIVE HTML (scene.css .mg-tile, which already matches the Figma spec: 196 x 136, radius 8, white, 16px padding, two drop shadows). A PNG export
  // is not possible: Figma frames export with an opaque backdrop, which would paint a grey box over the dashboard. Position = the node's x / y in the slide
  // (its top-left BEFORE rotation); Figma rotates about that corner, counter-clockwise for positive values, so the engine's rz is the negative.
  //   AppPoints 235:7244 (19.38, 167.19) rot +4.11 | Entitlement 235:7247 (511.17, 426.22) rot -8.53 | Usage 235:7254 (258.15, 695.92) rot +3.39
  const TW = 196, TH = 136;
  const TILES = {
    "tile-apppoints":   { x: 19.38,  y: 167.19, rz: -4.11, label: "AppPoints" },
    "tile-entitlement": { x: 511.17, y: 426.22, rz: 8.53,  label: "Entitlement" },
    "tile-usage":       { x: 258.15, y: 695.92, rz: -3.39, label: "Usage" }
  };
  const tile = (label, inner) => `<div class="mg-tile"><div class="mg-label">${label}</div>${inner}</div>`;
  const tags = ["Manage", "Health", "Predict", "Monitor"].map(t => `<span class="mg-tag">${t}</span>`).join("");
  const TILE_HTML = {
    "tile-apppoints":   tile("AppPoints", `<div class="mg-value">2500</div>`),
    "tile-entitlement": tile("Entitlement", `<div class="mg-tags">${tags}</div>`),
    // Figma: track + "Used 35%" + "Unused 65%" are both #0f62fe, so the whole bar reads full blue; the headline value is 15%
    "tile-usage":       tile("Usage", `<div class="mg-value">15%</div><div class="mg-bar"><div class="fill" style="width:100%"></div></div>`)
  };

  const SCENE = window.SCENE = {
    ariaLabel: "Animated case study. A leaf inside a ring of dots, then the Maximo Operational dashboard slides up over it and three tiles appear around it: AppPoints, Entitlement and Usage. They converge into an illustration of a city, which gives way to a faded sketch of the ALM homepage, then a card showing many paths flowing to one target, then the capabilities diagram: seven Maximo modules beside seven industry cards.",
    hud: false, grid: false, fit: 1,
    frames: {                                   // w / h are the LOGICAL stage size; images are 2x-4x, so they stay sharp on high-density screens
      stage: { w: W, h: H },
      dashboard: { w: 594,   h: 483.75, src: window.MG_BASE + "act1/dashboard.png" },
      alm11:     { w: 633.25, h: 435.5, src: window.MG_BASE + "act1/alm-1-1.png" },
      hand:      { w: 660,   h: 447,   src: window.MG_BASE + "act1b/handcard.png" }
    },
    // z order = array order (flat camera, no 3D context): ring < dashboard < tiles < city art < ALM / hand card
    pieces: [

      { id: "ring", label: "Maximo ring", kind: "media", depth: 0, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } } },     // back: the draw-in + the 50% dim, UNDER the dashboard
      { id: "dashboard", label: "Operational dashboard", kind: "media", depth: 1,
        rects: { d0: { x: 48.25, y: 1040, w: 594, h: 483.75, img: "dashboard", ix: 0, iy: 0 },
                 d1: { x: 48.25, y: 270.75, w: 594, h: 483.75, img: "dashboard", ix: 0, iy: 0 },
                 } },
      ...Object.entries(TILES).map(([id, t]) => ({ id, label: t.label, kind: "card", depth: 2, html: TILE_HTML[id], origin: "0 0",
        rects: { r: { x: t.x, y: t.y, w: TW, h: TH } } })),
      // city art (p = 0) and the finished diagram (p = 1): one vector piece, capabilities.js. The bridge cue is parked past the end (b0 > 1) so the diagram keeps its text.
      { id: "capabilities", label: "Capabilities", kind: "media", depth: 3, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } } },
      // ring-front: AFTER the city art in z order, so during the morph the ring's leaves + dots are drawn over the city's (hidden) copies.
      { id: "ring-front", label: "Maximo ring (morph)", kind: "media", depth: 3.5, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } } },
      // ALM skeleton, then the hand card: one piece, the rect morphs between the two crops
      { id: "main", label: "ALM skeleton", kind: "media", depth: 4,
        rects: { alm: { x: 43.25, y: 297.75, w: 633.25, h: 435.5, img: "alm11", ix: 0, iy: 0 } } },
      { id: "handcard", label: "Flow card", kind: "media", depth: 5, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } } },
      { id: "to-diagram", label: "Flow card -> diagram", kind: "media", depth: 6, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } } }
    ],
    camera: [ { t: 0, rx: 0, rz: 0, s: 0.8 }, { t: 1, rx: 0, rz: 0, s: 0.8 } ]      // flat throughout
  };

  // ---- ring piece (vector, ring-piece.js). Its draw-in is a function of INTRO progress (SCENE.introT, 0..1 across the hero scroll, set by index.html); everything else is scene t.
  SCENE.introT = 1;
  const RING = RingPiece.make({ drawAt: () => SCENE.introT, dim: w(...TT.ring.dim), toCity: w(...TT.toCity.ring) });
  const RING_F = RingPiece.make({ drawAt: () => SCENE.introT, dim: w(...TT.ring.dim), toCity: w(...TT.toCity.ring), noCircle: true });
  const ringP = P("ring"); ringP.html = RING.html; ringP.update = RING.update;
  const ringF = P("ring-front"); ringF.html = RING_F.html; ringF.update = RING_F.update;

  // ---- hand card piece (vector, handcard-piece.js): the Figma pill loop scrubbed once over TT.pills
  const h0 = V(TT.toHand[0]), h1 = V(TT.toHand[1]);
  // the live pills keep RUNNING (free clock) while they run on through the first LEAVE (90%) of the diagram morph, fading only over the second half of that, so the loop never freezes or pops
  const LEAVE = 0.9, dLeave = V(TT.toDiagram[0]) + (V(TT.toDiagram[1]) - V(TT.toDiagram[0])) * LEAVE;
  const HAND = HandcardPiece.make({ clock: () => (SCENE.handClock ? SCENE.handClock() : 0), morph: t => Math.min(1, Math.max(0, (t - h0) / (h1 - h0))), leave: t => Math.min(1, Math.max(0, (t - V(TT.toDiagram[0])) / (dLeave - V(TT.toDiagram[0])))), leaveSpan: LEAVE });
  // Living element for the pacing audit (SCENE.extras = activity that is not a stage move): the pill loop runs on its OWN clock for as long as the card is landed. It declares presence only
  // (opacity keys), so it keeps the audit from reading that rest as dead scroll WITHOUT counting as stage motion at the text anchor (which must stay still).
  SCENE.extras = [{ id: "pill-loop (free-running clock)", keys: [{ t: h1, o: 0 }, { t: h1 + 0.0005, o: 1 }, { t: V(TT.toDiagram[0]), o: 1 }] },
                  // the card-by-card morph animates inside its own update(): it declares its whole span here so the audit sees the activity (it is stage motion, and it ends well before the capabilities anchor)
                  { id: "flow card -> diagram morph", keys: [{ t: V(TT.toDiagram[0]), o: 0 }, { t: V(TT.toDiagram[1]), o: 1 }] }];
  SCENE.handOn = t => t >= h1 && t < dLeave;                     // the free-running loop plays only while the card is landed and before it turns into the diagram
  const handP = P("handcard"); handP.html = HAND.html; handP.update = HAND.update;

  // ---- hand card -> diagram morph (vector, handcard-to-diagram.js): p runs 0 -> 1 over TT.toDiagram
  const TOD = HandcardToDiagram.make({ t0: V(TT.toDiagram[0]), t1: V(TT.toDiagram[1]) });
  const todP = P("to-diagram"); todP.html = TOD.html; todP.update = TOD.update;

  // ---- capabilities piece (vector). The morph (p 0 -> 1) runs while the piece is invisible, so the city art shows at p = 0 and the diagram at p = 1.
  const CAP = CapabilitiesPiece.make({ m0: V(TT.capPrime[0]), m1: V(TT.capPrime[1]), b0: 2, b1: 3, i0: V(tc.city[0]), i1: V(tc.city[1]), th: w(...tc.handoff) });
  SCENE.capProgress = CAP.progress;
  const cap = P("capabilities"); cap.html = CAP.html; cap.update = CAP.update;

  /* ---- timeline: every window below is read from TIMING (story.js), in vh of scroll ------------------------------------------------ */
  SCENE.pieces.forEach(p => p.keys = []);

  // ring: the back ring dims under the dashboard, then cross-fades into the front ring (which carries the morph without the white circle) as the dashboard fades
  const sw0 = V(tc.dash[0] + 2), sw1 = V(tc.dash[1]);
  add("ring", { t: 0, x: 0, y: 0, z: 0, o: 1, f: 1, rect: "r" }, { t: sw0, o: 1 }, { t: sw1, o: 0, e: "inOutSine" });
  add("ring-front", { t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, { t: sw0, o: 0 }, { t: sw1, o: 1, e: "inOutSine" },
      { t: V(tc.handoff[0]), o: 1 }, { t: V(tc.handoff[1]), o: 0, e: "inOutSine" });

  // dashboard: slides up from below the stage over the ring; recedes and fades into the city morph
  add("dashboard", { t: 0, x: 0, y: 0, z: 1, s: 1, o: 0, f: 1, rect: "d0" }, { t: V(TT.dash[0]), o: 0, rect: "d0" }, { t: V(TT.dash[0]) + 0.002, o: 1 },
      { t: V(TT.dash[1]), o: 1, rect: "d1", e: "inOutSine" },
      // the dashboard is heavy: it SINKS (gsapSink = power2.in: slow to start, gaining speed) and holds its opacity until it is going fast, then is gone
      { t: V(tc.dash[0]), y: 0, s: 1, o: 1, rect: "d1" }, { t: V(tc.dash[1]), y: 26, s: 0.96, o: 0, e: "gsapSink" });

  // tiles: each fades in with a short upward drift, staggered; they then gently converge inward and fade
  const [m0, m1] = w(...TT.tiles), drift = 40;
  // exit: each tile is PULLED toward the dashboard's centre (345, 512) by 18% of the way, with its own mass (TT.tileExit windows: Entitlement, the biggest, starts last and takes longest).
  // gsapTilePull (back.in) gives a small wind-up away from the pull, then acceleration; the tile levels out (rz -> 0) as it goes, and fades only once it is fast (opacity rides the same ease).
  const PULL = 0.18, CX = 345, CY = 512;
  const tileExits = Object.fromEntries(Object.entries(TILES).map(([id, t]) =>
    [id, { x: +((CX - (t.x + TW / 2)) * PULL).toFixed(1), y: +((CY - (t.y + TH / 2)) * PULL).toFixed(1) }]));
  Object.entries(TILES).forEach(([id, t], i) => {
    const a = m0 + i * (m1 - m0) * 0.22, b = Math.min(m1, a + (m1 - m0) * 0.56);
    const ex = tileExits[id], [x0, x1] = TT.tileExit[i];
    add(id, { t: 0, x: 0, y: drift, z: 2, rz: t.rz, s: 1, o: 0, f: 1, rect: "r" }, { t: a, y: drift, o: 0 }, { t: b, y: 0, o: 1, e: "inOutSine" },
        { t: V(x0), x: 0, y: 0, rz: t.rz, s: 1, o: 1, rect: "r" }, { t: V(x1), x: ex.x, y: ex.y, rz: 0, s: 0.92, o: 0, e: "gsapTilePull" });
  });

  // city art: internal elements fade in smoothly via ri(x) and hand; piece stays fully active through the city beat until toAlm
  const d0 = V(TT.toDiagram[0]), d1 = V(TT.toDiagram[1]);
  add("capabilities", { t: 0, x: 0, y: 0, z: 3, o: 1, f: 1, rect: "r" },
      { t: V(ta.city[0]), o: 1 }, { t: V(ta.city[1]), o: 0, e: "inOutSine" },
      { t: d1 - 0.0005, o: 0 }, { t: d1, o: 1 });
  add("to-diagram", { t: 0, x: 0, y: 0, z: 6, o: 0, f: 1, rect: "r" }, { t: d0 - 0.0005, o: 0 }, { t: d0, o: 1 }, { t: d1, o: 1 }, { t: d1 + 0.0005, o: 0 });

  // ALM skeleton fades in; during the morph it fades out (its six blocks are re-drawn by the hand card piece on top and travel); the card piece then holds until the diagram takes over
  add("main", { t: 0, x: 0, y: 0, z: 4, o: 0, f: 1, rect: "alm" }, { t: V(ta.alm[0]), o: 0 }, { t: V(ta.alm[1]), o: 1, e: "inOutSine" },
      { t: h0 + (h1 - h0) * 0.12, o: 1 }, { t: h0 + (h1 - h0) * 0.45, o: 0, e: "inOutSine" });
  add("handcard", { t: 0, x: 0, y: 0, z: 5, o: 0, f: 1, rect: "r" }, { t: h0 - 0.0005, o: 0 }, { t: h0, o: 1 },
      { t: dLeave, o: 1 }, { t: dLeave + 0.0005, o: 0 });                          // the live card keeps drawing its pills (fading them itself, see handcard-piece.js) for the first LEAVE of the morph; the piece then drops out
})();
