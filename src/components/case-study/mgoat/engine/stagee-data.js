/* =========================================================================
   STAGE E DATA: the "Next steps" card, then the zoom into "How to implement"
   (Figma slides 20a + 20b of frame 208:5718, file 1r4UreOVeEqdcXvnD5cetk; stage frames 239:6834 / 239:6890, slides 239:6833 / 239:6889).
   One continuous beat with two text slots. The stage never stops between them.

     E1  slide 20a  239:6886  23 words  "In the next action steps, ..."   the card is whole (it rises into place while D's card leaves upward)
     E2  slide 20b  239:6944  26 words  "Each step explicitly tags ..."   the card zooms 1.4x onto "How to implement", three blocks dim to 25%, a blue frame appears around the block

   Every window is in vh of scroll, LOCAL to the beat (0 = the first vh after Stage D's final rest; D.end = 1480). STAGEE.toGlobal(startVh) shifts them to the real position.
   Chapter 10 on both slots (the same SectionNav tick as D's slides 18 and 19). Theme dark on both. No cursor is drawn in either frame, so none is built.

   PACING WORKSHEET (vh of scroll; viewer model: .claude/skills/ui-assembly-animation/reference/pacing.md)
   | Part                    | range (local vh) | vh | easing    | why this long |
   | Settle                  | before 0         | -  | -         | D's own rest (1437-1480, anchor 1458) is the Settle: the stage is still and D's sentence has had 43vh. E1's sentence arrives the moment it ends (see the text decision) |
   | Arrive  HERO 1          | 0-34             | 34 | inOutSine | one 1024 px conveyor pan = 900 screen px at a 1440x900 viewport. The sine peaks at 1.57x the average, so the pan needs >= 26.2vh to stay <= 6x; 34vh gives 4.6x |
   | Land                    | 26-34            | 8  | (tail)    | the last quarter of a sine moves 15% of the pan: the card decelerates into its pose and is settled before the Rest |
   | Rest E1                 | 34-72            | 38 | -         | 23 words need 20 + 0.6 x 23 = 33.8; +4 slack. E1's sentence is on screen from 0 and centred at the ANCHOR E1 = 53 (19vh of stillness each side) |
   | Cue                     | none             | 0  | -         | MY DECISION: no cue. The highlight is the pointer and Figma draws it at opacity 0 on 20a, so a pre-highlight would break the E1 pose. The zoom itself starts from a long still rest |
   | Zoom  HERO 2            | 72-100           | 28 | inOutSine | card 1.0 -> 1.4 about the fixed point (191.5, 1194.4): the largest corner moves 444 stage px = 390 screen px; sine peak 1.57 -> 2.4x. 28vh is inside the camera-move band (25-40) |
   |   dims (lockstep)       | 72-100           | 28 | inOutSine | the three blocks dim for the SAME reason as the zoom (the eye is sent to "How to implement"): same start, end and easing |
   |   settle (lockstep)     | 72-100           | 28 | inOutSine | Figma re-lays the 1.4x card out by up to 1.6 px per block (and 0.9 px per tag): same window, so the end pose is Figma's to the pixel |
   |   highlight (SUPPORTER) | 82-96            | 14 | smoothstep| starts after the zoom's first third (72 + 28/3 = 81.3), ends 4vh before the zoom lands so the frame is crisp on arrival (opacity 0 -> 1, pre-scale 0.98 -> 1) |
   | Land                    | 96-100           | 4  | (tail)    | highlight done, the zoom is in the last 5% of its curve (22 stage px left) |
   | Rest E2                 | 100-140          | 40 | -         | 26 words need 20 + 0.6 x 26 = 35.6; +4.4. E2's sentence is on screen from 72 and centred at the ANCHOR E2 = 120 (20vh of stillness each side) |
   Totals: MAX 140, STORY scrollVh would be 240 = the audit's budget 100 x 2 slots + 40. Anchor gaps: D(-22) -> E1 75, E1 -> E2 67 (budget 55-105). Rests are 78 of the 140vh.
   One hero per half; the highlight is the only supporter; everything else is still (explicit holds in auditScene). Measured on the test page: the stage is pixel-identical across
   each rest (34-72 and 100-140), and at both anchors it matches the Figma frame to within text anti-aliasing (1.6% / 2.4% of pixels differ at tolerance 24, geometry within 1 px).

   MY DECISIONS (none of these is in a Figma frame between 20a and 20b; redirect freely)
   MY DECISION: the hand-over is ONE conveyor pan, not a cross-fade. D's card (the 1.59x APM card) and E's card both travel UP by exactly one stage height (1024 px) in the same
     window with the same easing (they change for the same reason, so they move in lockstep). Both move by the same distance, so the gap between them is constant: measured on the real
     DOM with D's real piece, 336.5 px between D's bottom edge and E's top edge at every sample (247 px to the tail of D's shadow), so the cards never overlap. E first appears at
     v 9.5, D's body is off the stage at v 25.5 and its shadow at v 28: at every 0.5vh sample one card is on stage (no empty frame). Scrolling down moves the stage with the finger.
     Alternatives considered:
       (a) the brief's starting suggestion, D keeps rising and fades while E rises on the smooth-out curve: rejected. cubic-bezier(0.22,1,0.36,1) starts at slope 4.54 (every move must
           start at zero velocity) and a 1024 px travel on it peaks at 13.4x the scroll even at 34vh (it needs ~76vh to reach 6x). A fading D would also ghost through E.
       (b) a cross-fade or shell morph: needs a copy of D's card or edits to D's piece. Rejected (D's card is D's piece; solid cards arrive and leave by moving, not by fading through).
       (c) exit first, then enter: an empty stage in the middle. Rejected (the brief forbids > 10vh empty).
       (d) D leaves a shorter distance and fades (the "quieter exit" of transitions-polish): D's 1.59x card is 1278 px tall, so any shorter exit leaves it overlapping E. A quicker exit also
           fails the 6x rule: a 26vh sine pan of 900 screen px peaks at 6.04x (it needs >= 26.2vh), so D could only be 8vh quicker, and the two cards would then no longer keep a constant gap. The exit stays the quieter
           half in the way that matters here: pure motion, no overshoot, no bounce, and D is out of the picture (v 28) before E has landed (v 34).
   MY DECISION: easing. inOutSine (peak slope 1.57) for the pan and the zoom, smoothstep (peak 1.5) for opacity and the highlight. transitions-polish names --ease-smooth-out as the
     default for SURFACE motion, but that token is for time-based CSS and starts at slope 4.5. This page is scroll-driven, so the pacing rules win: every move starts and ends at zero
     velocity and stays under 6x the scroll. Stage E writes no time-based CSS at all, so no duration token is needed; the pre-scale 0.98 on the highlight is --scale-small, and the
     stagger rule does not apply (nothing staggers).
   MY DECISION: the zoom is a true camera zoom about the fixed point c = (191.5, 1194.4) that maps 20a's pose onto 20b's. x, y and scale are interpolated LINEARLY in one eased
     progress, which is exactly a scale about a fixed point. The scale is exactly 1.4 (786.8 / 562; BRIEF-E's "about 1.4003" came from rounded widths). The right edge of the zoomed
     card (x 820.8) and its top (y -226.7) are outside the 720 x 1024 stage and are clipped: intended in Figma (same accepted situation as D's 1.6x card), not "fixed".
   MY DECISION: the highlight (239:6888 in 20a at opacity 0, 239:6927 in 20b at opacity 1) fades in with a 0.98 -> 1 pre-scale about its centre. It is a supporter, so it starts at the zoom's first third.
   MY DECISION: Figma re-lays the card out at 1.4x, and its integer text-box heights differ from the unscaled ones, so inside the card some blocks sit up to 1.57 px (20a scale) higher than a
     pure x1.4 would put them, the card is 1.57 px shorter, and each tag pill is up to 0.9 px wider or narrower. The measured deltas are GEO.settle, GEO.cardH_B and GEO.tagW; they ease in over
     the zoom window so the 20b pose is Figma's to the pixel. Invisible in motion.
   MY DECISION: the three blocks dim through a card-coloured scrim (opacity 0 -> .75) instead of group opacity (1 -> .25). Over the uniform card the two are the same colour (0.25 p + 0.75 card),
     but group opacity makes Chromium keep the raster of the dimmed text at the scale it had at 1.0: measured with the page's own engine, a zoom reached by scrolling in left the dimmed
     text 2.6x softer than the same pose loaded directly. The scrim keeps the text in the card's own layer and the two renders are now identical (0 differing pixels).
   MY DECISION: text swaps happen when the previous Rest ends, i.e. as each hero STARTS: E1's sentence takes over from D's at local 0, E2's takes over from E1's at 72. The host's default is the
     midpoint between two anchors, which here lands INSIDE a hero (15.5 in the pan, 86.5 in the zoom): "do not run a hero across a text change" (pacing.md). Why at the START: "text leads, the
     stage shows" (pacing.md): the sentence is a promise and the stage keeps it, so E2's sentence about the role tags must already be on its way up the column when the zoom onto them plays, and
     E1's sentence must not linger beside a stage that no longer shows what it says. At 72 E1's sentence is 19vh past its anchor (fully readable, its Rest is over) and E2's top edge enters at the foot of the
     column (48vh below centre); at 0, D's sentence is 22vh past its anchor and E1's top edge enters at the foot. Cost, stated plainly: the host's fade is TIME (0.35s), not scroll. At the calibration of pacing.md (10vh of scroll ~ 0.1-0.15s) a viewer who scrolls steadily
     through the zoom sees the old sentence fade and the new one arrive during it (a viewer who pauses sees the fade finish before the stage has moved). So the text change is not kept
     off the hero for a fast scroller; it is only kept off the hero's MIDDLE and off the rests. The host default (mid-zoom) would be worse. The column geometry forbids the canonical
     'sentence first, then the hero': E2's block is pinned to its anchor (120, after the zoom), so before 72 it is more than 48vh below the centre. Alternatives: the host default (mid-hero, rejected); at the hero's END (34 / 100): the outgoing sentence would keep
     describing a stage that has changed, and the viewer would get the new sentence only after the move it explains (rejected).
     The wiring step must give the outgoing `to` and the incoming `from` the SAME value (index.html toggles `active` per slot from / to). D's last slot needs no change: its range end (= S) is E1's start.
   MY DECISION: will-change (hard rule 6 says 'on moving layers'). It is on the card (transform) and on the dim scrim (opacity). It is deliberately NOT on the highlight, nor on the ~30 small
     blocks / pills that settle by <= 1.6 px: they ride the card's layer. Measured on the highlight: with will-change its stroke is rasterised at the 0.98 pre-scale and stays soft, and
     a scrubbed-in render differs from a directly loaded one in 1.96% of the highlight band (0% without it, and 0% for the whole stage). Thirty extra compositor layers for sub-pixel
     moves would cost more than they save. This is a measured deviation from the letter of the rule, not an oversight.
   MY DECISION: hidden Figma nodes are not drawn: the tooltip instances 239:6854 / 239:6910 and the second-role tags 239:6870 / 239:6926 (visible: false in both slides).
   MY DECISION: reduced motion. poses = { arrive: 34, e1: 53, e2: 120 }. arrive and e1 are the SAME stage picture (the arrival ends on the E1 rest pose, nothing moves in between);
     the host keys one pose per text slot (e1, e2) exactly as Stage C does, so there are two distinct stage pictures. arrive is only the first finished frame of the beat.
   MY DECISION: the piece paints no stage background. The host's dark theme supplies #262626 (the test page sets it itself); the piece must be transparent so D's card can leave under E's.
   MY DECISION: budget. MAX 140 is exactly the audit's 100 x slots + 40 (scrollVh 240), under the brief's cap of 190. Rests were trimmed to the reading minimum + 4 rather than the hero.
   MY DECISION: the standalone test page can show D's REAL last frame (expansion-piece.js, read-only use) moving with STAGEE.handover.d.keys, so the hand-over is checked with the real geometry.

   WIRING RECIPE (a later step; nothing here is wired). With  S = 1480 (= TIMING.D.end)  and  G = STAGEE.toGlobal(S):
     index.html   <link stagee.css> after scene.css; <script stagee-data.js>, <script stagee-piece.js> after stage-d.js; a new stage-e.js after them.
     stage-e.js   const P = StageePiece.make({ vh: t => t * TIMING.MAX - S, T: STAGEE.TIMING });
                  SCENE.pieces.push({ id: "stagee", label: "Next steps card", kind: "media", depth: 22, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } }, html: P.html, update: P.update,
                                      keys: [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }].concat(G.eKeys.map(k => ({ t: k.vh / TIMING.MAX, o: k.o }))) });
                  const exp = SCENE.pieces.find(p => p.id === "expansion");          // the ONLY Stage D piece still on stage at 1480 (c-last, report, trust are keyed to 0 by stage-d.js)
                  G.dKeys.forEach(k => { const key = { t: k.vh / TIMING.MAX }; ["y", "o", "e"].forEach(p => { if (k[p] !== undefined) key[p] = k[p]; }); exp.keys.push(key); });
     story.js     TIMING.MAX = S + STAGEE.TIMING.MAX (1620); STORY.scrollVh = MAX + 100; beat numbers-zoom: range end f(S) (it currently ends at 1);
                  new beat { id: "next-steps", hold: true, chapter: 10, theme: "dark", range: [f(S), 1], texts: [ {id: "e1", snap: f(G.anchors.e1), from: f(G.textSwap.e1From), to: f(G.textSwap.e1To), ...},
                  {id: "e2", snap: f(G.anchors.e2), from: f(G.textSwap.e2From), to: f(G.textSwap.e2To), ...} ] }; reduced-motion poses from G.poses.
     Keep the engine's will-change chain as is: this piece measured identical raster whether scrubbed into a pose or loaded there, with it.

   HAND-OVER OUT to Stage F: STAGEE.endPose (numbers) and the piece id "stagee" in STAGEE.handover.f. The last frame is the 20b pose held to MAX. Stage F may key the whole piece
   (x, y, s, o move the entire root, clip included) exactly as this stage does to D's "expansion" piece.
   ========================================================================= */
(function () {
  const T = {
    MAX: 140,                              // local scrollable distance of the beat (vh)
    arrive: [0, 34],                       // HERO 1: D's card leaves upward and E's card rises into place, one 1024 px conveyor pan (lockstep, inOutSine). The Land is the tail of the curve
    rest1:  [34, 72],                      // Rest E1 (information only: nothing moves). ANCHOR E1 = 53
    zoom:   [72, 100],                     // HERO 2: the card zooms 1.0 -> 1.4 about a fixed point; dims and per-block settle run in LOCKSTEP (same window, same easing)
    hl:     [82, 96],                      // SUPPORTER: the highlight frames "How to implement". Starts after the zoom's first third (81.3), ends 4vh before the zoom lands
    rest2:  [100, 140]                     // Rest E2 (information only). ANCHOR E2 = 120
  };

  // Geometry, all measured with use_figma (read-only) on 2026-11-08. Stage px; card-local px are 20a's scale (1.0).
  const GEO = {
    stage: { w: 720, h: 1024 },
    card: { w: 562, h: 666.331, r: 5.854, fill: "#393939" },          // 20a 239:6835
    A: { x: 79, y: 179.305, s: 1 },                                     // 20a card pose (stage px)
    B: { x: 34, y: -226.734, s: 1.4 },                                  // 20b card pose 239:6891 (786.8 x 930.663, right edge 820.8 is clipped by the 720 stage)
    cardH_B: 664.759,                                                   // 930.663 / 1.4: the card is 1.572 shorter in 20b's own layout
    PAN: 1024,                                                          // one stage height: D leaves by it, E arrives over it
    hl: { x: 5.5, y: 366, w: 470, h: 297, r: 8, bw: 2, pre: 0.98 },     // 239:6888 (20a, opacity 0) = 239:6927 (20b, opacity 1) / 1.4: the same card-local rect in both
    dim: 0.25,                                                          // 239:6892, 239:6899, 239:6902 in 20b (239:6907 "How to implement" stays 1)
    veilH: 362,                                                         // the dim scrim ends here (card-local): below the list text (it ends 356), above the highlight (366) and the "How to implement" heading (379.8)
    // 20b tag width / 20a tag width, per label (Figma rounds each label to a whole px at each scale, so a pill is up to 0.9 card px wider or narrower after the re-layout): 85.979 / 1.4 / 62.271 ...
    tagW: { "Manage": 0.9862, "Reliability engineer": 1, "System administrator": 1.0024, "Technician": 0.9904 },
    // per-element vertical delta 20a -> 20b in card-local px: ((20b abs y - card y) / 1.4) - (20a abs y - card y). header / h1 / p1 move < 0.002 and are not applied.
    settle: { h2: -0.142, rowM: -0.571, list: -0.570, h3: -0.857, it1: -0.857, row1: -0.999, it2: -1.000, row2: -1.286, it3: -1.285, row3: -1.570 },
    viewport: { w: 1440, h: 900 }                                       // for the speed report: the stage column is 720 wide and the stage fits it (fit 1, scale 900/1024)
  };

  /* COPY. Every string is the Figma node's `characters`, verbatim. \u2028 is Figma's forced line break (rendered as <br>), \u000a likewise. */
  const COPY = {
    e1: { id: "239:6886", copy: ["In the next action steps, the system highlights a single top priority alongside two secondary steps so you always know where to start."] },
    e2: { id: "239:6944", copy: ["Each step explicitly tags responsible roles, like Asset Manager or Sys Admin, making it clear as to how to set up Maximo tasks with your team."] },
    card: {                                                              // 20a ids; 20b carries the identical strings (checked pairwise with use_figma)
      stepHead: "Step 01:",                                              // 239:6840, run 1 (IBM Plex Sans SemiBold, white)
      stepBody: " \u2028Collect periodic condition readings in Maximo Manage to trigger maintenance work when predefined operating limits are breached.",   // run 2 (Regular)
      enablesH: "What this enables",                                     // 239:6844
      enables: "Establishes condition-based maintenance workflows without requiring full IoT infrastructure investment. Builds team confidence in using asset condition data.",   // 239:6845
      modulesH: "Required Maximo modules",                               // 239:6847
      module: "Manage",                                                  // 239:6849 tag
      modulesList: "Condition monitoring records and threshold configuration\u2028Automated work order creation from condition alerts\u000aAsset condition readings and trend view\u2028",   // 239:6850
      implH: "How to implement",                                         // 239:6853
      steps: [                                                           // 239:6857 / 239:6862 / 239:6867 and their role tags (239:6859..6869)
        { text: "1: Configure continuous or periodic meter records for critical equipment.", roles: ["Reliability engineer", "System administrator"] },
        { text: "2: Establish standard processes to manually capture low-frequency vibration or thermography readings in Maximo.", roles: ["Reliability engineer", "Technician"] },
        { text: "3: Configure condition monitoring rules in Maximo to trigger follow-up \u2028work orders.", roles: ["System administrator"] }
      ]
    }
  };

  const wordCount = s => s.split(/\s+/).filter(Boolean).length;
  const WORDS = { e1: wordCount(COPY.e1.copy.join(" ")), e2: wordCount(COPY.e2.copy.join(" ")) };      // 23 and 26
  const ANCHORS = { e1: 53, e2: 120 };                                                           // gaps: D(-22) -> E1 75, E1 -> E2 67 (budget 55-105)

  // ---- shared maths for the reports (the piece has its own copies of the easings)
  const PEAK = { inOutSine: Math.PI / 2, smoothstep: 1.5, inOutCubic: 3, linear: 1 };           // peak slope of each curve (analytic)
  const FIT = Math.min(GEO.viewport.w / 2 / GEO.stage.w, GEO.viewport.h / GEO.stage.h);          // stage -> screen scale at the reference viewport: 900 / 1024 = 0.8789
  // the zoom is a scale about the fixed point c with B.o = c + s (A.o - c)
  const FIXED = { x: (GEO.B.x - GEO.B.s * GEO.A.x) / (1 - GEO.B.s), y: (GEO.B.y - GEO.B.s * GEO.A.y) / (1 - GEO.B.s) };   // (191.5, 1194.4)
  const rectCorners = (r) => [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => [GEO.A.x + r.x + i * r.w, GEO.A.y + r.y + j * r.h]);   // card-local rect -> 20a stage px
  const zoomDisp = (r) => rectCorners(r).map(p => (GEO.B.s - 1) * Math.hypot(p[0] - FIXED.x, p[1] - FIXED.y));                       // how far each corner travels in the zoom
  const CARD_RECT = { x: 0, y: 0, w: GEO.card.w, h: GEO.card.h };

  window.STAGEE = {
    TIMING: T, GEO, COPY, words: WORDS, anchors: ANCHORS, chapter: 10, theme: "dark", fit: FIT, fixedPoint: FIXED,
    // Finished poses for prefers-reduced-motion (local vh): the host jumps between them.
    poses: { arrive: T.arrive[1], e1: ANCHORS.e1, e2: ANCHORS.e2 },

    // Where the sentence changes (local vh): when the previous Rest ends, as each hero starts (see the text decision). Give each outgoing `to` and the incoming `from` this SAME value.
    textSwap: { e1From: 0, e1To: T.zoom[0], e2From: T.zoom[0], e2To: T.MAX },

    // The last frame of the beat (held from T.zoom[1] to MAX). Stage F designs its exit from these numbers.
    endPose: {
      card: { x: GEO.B.x, y: GEO.B.y, scale: GEO.B.s, localW: GEO.card.w, localH: GEO.cardH_B, stageRect: { x: 34, y: -226.734, w: 786.8, h: 930.663 }, right: 820.8, bottom: 703.929 },
      highlight: { opacity: 1, scale: 1, localRect: { x: GEO.hl.x, y: GEO.hl.y, w: GEO.hl.w, h: GEO.hl.h }, stageRect: { x: 41.7, y: 285.666, w: 658, h: 415.8 } },
      dim: { header: 0.25, enables: 0.25, modules: 0.25, implement: 1 },
      stage: { bg: "#262626", clip: "the card's right edge (820.8) and top (-226.7) are outside the 720 x 1024 stage and clipped" },
      onScreen: "the visible part of the card is the stage rect x 34..720, y 0..703.9: the lower blocks (Required modules list, How to implement + its highlight); the bottom 320 px of the stage is empty #262626",
      vsBrief: "BRIEF-F plans 'scaled 1.4003 at stage (34, -227)'. The built numbers above are authoritative: the scale is exactly 1.4 (786.8 / 562), the position (34, -226.734).",
      note: "Stage F: the whole E piece (id \"stagee\") can be keyed with x / y / s / o; its root clips to the piece rect (the stage), so a y key moves the clip with the card (see handover.f)."
    },

    // Wiring contract. Times are LOCAL vh; add startVh (toGlobal does it) and convert to t with vh / TIMING.MAX.
    handover: {
      in: "D's last frame is slide 19: the APM expansion card at scale 1.5915, 878.524 wide, at stage (23, -411.059) on #262626 (expansion-piece.js ZOOM). Local 0 is the first vh after D's final rest (D.end = 1480).",
      // Append these keys to D's engine piece "expansion" (stage-d.js piece id). They move the whole piece, whose root clips to the piece rect (= the stage), so the card leaves intact.
      // Lockstep with E's arrive window. The last key switches the piece off once it is fully off stage (its shadow tail ends ~956 px, the pan is 1024), so nothing is left drawn.
      d: {
        piece: "expansion",
        keys: [{ vh: T.arrive[0], y: 0 }, { vh: T.arrive[1], y: -GEO.PAN, e: "inOutSine" }, { vh: T.arrive[1] + 0.5, o: 0 }],
        note: "Keys are sorted by t and carry forward: x stays 0 and o stays 1 until the last key. The first key (y: 0 at vh 0) pins the start of the move; without it the engine would interpolate from D's previous key. Scrolling backward restores the card by the same keys. t = (startVh + vh) / TIMING.MAX. Only \"expansion\" is still on stage at D.end: stage-d.js keys c-last, report and trust to 0 long before."
      },
      // E's own engine piece (full stage rect, like D's pieces). Its update() is the whole animation; the keys only switch it on.
      e: {
        piece: "stagee", rect: { x: 0, y: 0, w: 720, h: 1024 },
        keys: [{ vh: -0.5, o: 0 }, { vh: 0, o: 1 }],
        factory: "StageePiece.make({ vh: t => t * TIMING.MAX - startVh, T })   // T = STAGEE.TIMING, or the windows shifted by toGlobal",
        note: "Link stagee.css after scene.css. Load stagee-data.js, then stagee-piece.js. Push the piece AFTER D's pieces (z-order = array order). The piece is transparent: #262626 comes from the beat theme."
      },
      // The right column.
      host: {
        beat: "one beat with two `texts` slots (as Stage C): ids e1, e2; chapter 10; theme dark; hold true; range [S, 1]",
        slots: [
          { id: "e1", snap: ANCHORS.e1, from: T.arrive[0], to: T.zoom[0], copy: COPY.e1.copy },
          { id: "e2", snap: ANCHORS.e2, from: T.zoom[0], to: T.MAX, copy: COPY.e2.copy }
        ],
        dSlot: "D's last slot (beat numbers-zoom) needs no change: its range end becomes S, which is E1's start.",
        theme: "No mid-beat theme flip is needed in E (dark on both slots, same as D). Stage F is light: its own hand-over describes the flip.",
        reduced: "STAGEE.poses: arrive 34, e1 53, e2 120. The host keys one pose per text slot (e1, e2); arrive and e1 are the same picture."
      },
      // For Stage F: how E's card can leave.
      f: {
        piece: "stagee",
        possible: "key x / y / s / o on the piece (engine keys: x, y are stage px, s scales about the stage centre (360, 512) because the piece keeps the engine's default transform-origin, o is opacity). A y key of -1024 over any window clears the 20b card (bottom edge 703.9) together with its clip; an opacity fade needs no clip handling. Stage E ends on the 20b pose HELD to local MAX, so the keys F appends start there.",
        lastFrame: "see endPose"
      }
    },

    // Shift every window and anchor to the beat's real position.
    toGlobal(startVh) {
      const shift = v => Array.isArray(v) ? v.map(x => x + startVh) : v + startVh;
      const out = {}; Object.keys(T).forEach(k => { out[k] = k === "MAX" ? T[k] : shift(T[k]); });
      out.anchors = {}; Object.keys(ANCHORS).forEach(k => { out.anchors[k] = ANCHORS[k] + startVh; });
      out.poses = {}; Object.keys(this.poses).forEach(k => { out.poses[k] = this.poses[k] + startVh; });
      out.textSwap = {}; Object.keys(this.textSwap).forEach(k => { out.textSwap[k] = this.textSwap[k] + startVh; });
      out.dKeys = this.handover.d.keys.map(k => ({ ...k, vh: k.vh + startVh }));
      out.eKeys = this.handover.e.keys.map(k => ({ ...k, vh: k.vh + startVh }));
      return out;
    },

    /* A SCENE-like object for .claude/skills/ui-assembly-animation/assets/pacing-audit.js. Every real move is a piece key (x, y, s, o); the engine only sees trivial visibility keys because
       the animation itself lives in update(), so the audit needs this description. x / y of the zoom piece are the displacement of the card's FASTEST point (its top-right corner), not
       of its origin, because that is what the eye follows and what the audit's speed rule needs. camera is [] as the brief asks, so every distance below is already in SCREEN px at the
       reference viewport (stage px x FIT = 0.879) and the audit's own camera scale stays 1.
       The audit has no inOutSine: it would treat it as inOutCubic (peak 3.0, the real sine is 1.57). So by default each sine move is modelled as a LINEAR move of pi/2 x the distance,
       which has the same peak speed and the same window. auditScene(0, { raw: true }) gives the literal geometry with the sine easing name, which the audit then mis-reads as cubic:
       it flags the pan as 8.6x (see auditNote). beats = the two text slots (their from / to are textSwap, their snap is the anchor). */
    auditScene(startVh = 0, opts = {}) {
      const total = startVh + T.MAX, t = vh => (vh + startVh) / total;
      const raw = !!opts.raw, K = (raw ? 1 : PEAK.inOutSine) * FIT, eSine = raw ? "inOutSine" : "linear";      // K: stage px -> audit px (screen px, x pi/2 when the sine is modelled as a line)
      const A = GEO.A, B = GEO.B;
      const corner = zoomDisp(CARD_RECT), iMax = corner.indexOf(Math.max(...corner));              // the fastest corner of the card
      const pc = rectCorners(CARD_RECT)[iMax], dxC = (B.s - 1) * (pc[0] - FIXED.x), dyC = (B.s - 1) * (pc[1] - FIXED.y);
      const hlCorner = zoomDisp(GEO.hl), jMax = hlCorner.indexOf(Math.max(...hlCorner));
      const ph = rectCorners(GEO.hl)[jMax];
      const pieces = [
        { id: "E card: arrive (one stage height)", rects: { r: { x: A.x, y: A.y, w: GEO.card.w, h: GEO.card.h } }, keys: [
          { t: t(T.arrive[0]), x: 0, y: GEO.PAN * K, o: 1, rect: "r" },
          { t: t(T.arrive[1]), x: 0, y: 0, e: eSine },
          { t: 1, x: 0, y: 0 }] },
        { id: "D card: exit (keys appended to the expansion piece)", rects: { r: { x: 23, y: -411.059, w: 878.524, h: 1277.9 } }, keys: [
          { t: t(T.arrive[0]), x: 0, y: 0, o: 1, rect: "r" },
          { t: t(T.arrive[1]), x: 0, y: -GEO.PAN * K, e: eSine },
          { t: 1, x: 0, y: -GEO.PAN * K }] },
        { id: "E card: zoom (fastest corner)", rects: { r: { x: pc[0], y: pc[1], w: GEO.card.w, h: GEO.card.h } }, keys: [
          { t: t(0), x: 0, y: 0, s: 1, o: 1, rect: "r" },
          { t: t(T.zoom[0]), x: 0, y: 0, s: 1 },
          { t: t(T.zoom[1]), x: dxC * K, y: dyC * K, s: B.s, e: eSine },
          { t: 1, x: dxC * K, y: dyC * K, s: B.s }] },
        { id: "E dims (3 blocks, lockstep with the zoom)", rects: { r: CARD_RECT }, keys: [
          { t: t(0), o: 1, rect: "r" },
          { t: t(T.zoom[0]), o: 1 },
          { t: t(T.zoom[1]), o: GEO.dim, e: eSine },
          { t: 1, o: GEO.dim }] },
        { id: "E highlight (supporter: fade + 0.98 -> 1 scale)", rects: { r: { x: ph[0], y: ph[1], w: GEO.hl.w, h: GEO.hl.h } }, keys: [
          { t: t(0), x: 0, y: 0, s: GEO.hl.pre, o: 0, rect: "r" },
          { t: t(T.hl[0]), s: GEO.hl.pre, o: 0 },
          { t: t(T.hl[1]), s: 1, o: 1, e: "inOutCubic" },
          { t: 1, s: 1, o: 1 }] }
      ];
      return {
        scrollVh: total + 100, pieces, camera: [], extras: [],
        beats: [
          { id: "e1", hold: true, snap: t(ANCHORS.e1), range: [t(this.textSwap.e1From), t(this.textSwap.e1To)], words: WORDS.e1 },
          { id: "e2", hold: true, snap: t(ANCHORS.e2), range: [t(this.textSwap.e2From), 1], words: WORDS.e2 }
        ]
      };
    },
    auditNote: "pacing-audit.js has no inOutSine and would read it as inOutCubic (peak 3.0, the real sine is 1.57). auditScene() therefore models each sine move as a linear move of pi/2 x the distance "
             + "(same peak speed, same window): that is the run to compare with the 6x limit. auditScene(0, { raw: true }) keeps the sine name and the audit flags the pan (and D's exit) at 8.6x, "
             + "which is the cubic misreading (3.0 / 1.57 = 1.9x too high; the first-principles number is 4.62x). speedReport() is the first-principles figure.",

    // On-screen speed of the fastest card point per px of scroll, at the reference viewport (1440 x 900). ratio = peak slope x on-screen displacement / scroll px. Must stay <= 6.
    speedReport() {
      const px = vh => vh * GEO.viewport.h / 100;
      const rows = [];
      const add = (name, win, ease, dispStage, note) => {
        const peak = PEAK[ease], dispScreen = dispStage * FIT, scroll = px(win[1] - win[0]), ratio = peak * dispScreen / scroll;
        rows.push({ name, windowVh: win, easing: ease, peakSlope: +peak.toFixed(3), maxDisplacementStagePx: +dispStage.toFixed(1), maxDisplacementScreenPx: +dispScreen.toFixed(1),
                    scrollPx: scroll, ratio: +ratio.toFixed(2), ok: ratio <= 6, minVhFor6x: +(peak * dispScreen / 6 / (GEO.viewport.h / 100)).toFixed(1), note });
      };
      add("arrive: E's card rises (and D's leaves) by one stage height", T.arrive, "inOutSine", GEO.PAN, "pure translation: every point of both cards moves 1024 stage px");
      const dc = zoomDisp(CARD_RECT);
      add("zoom: card 1.0 -> 1.4 (dims, settle and highlight ride on it)", T.zoom, "inOutSine", Math.max(...dc), `a scale about the fixed point (191.5, 1194.4); the four card corners move ${dc.map(d => d.toFixed(0)).join(" / ")} stage px (TL / TR / BL / BR)`);
      const dh = zoomDisp(GEO.hl);
      add("highlight frame (rides the zoom; its own fade + 0.98 -> 1 scale adds < 5 px)", T.zoom, "inOutSine", Math.max(...dh), `its corners move ${dh.map(d => d.toFixed(0)).join(" / ")} stage px: always less than the card's`);
      return { fit: +FIT.toFixed(4), viewport: GEO.viewport, rows, worst: Math.max(...rows.map(r => r.ratio)), pass: rows.every(r => r.ok) };
    }
  };
})();
