/* =========================================================================
   EXPANSION PIECE: the APM expansion card (Figma slide 18 "Value of expansion" 208:9366 > stage 208:9367 > card 208:9368), rebuilt as LIVE HTML so the stage rail can widen / narrow
   and the card can arrive from the previous beat and zoom into the numbers (slide 19). update(body, k, t) is a PURE FUNCTION of scroll progress t AND of clock() (the one
   time-based exception, confined to this beat, like the pill loop in handcard-piece.js). Same inputs -> same DOM, so scrolling backward plays in reverse.

   API   ExpansionPiece.make({ clock, enter, zoom, reduced }) -> { html, update(body, k, t), loopPose, railPose }
           clock()  -> ms since the card LANDED (enter == 1). 0 = idle. Free-running, host-supplied, resets when the beat is left. Ignored while enter(t) < 1.
           enter(t) -> 0..1  how far the card has arrived (0 = not there, 1 = at its place with the default rail)
           zoom(t)  -> 0..1  0 = the card as drawn, 1 = slide 19's numbers zoom (Figma 231:6650). While zoom > 0 the loop is folded away (rail eases to default, cursor leaves).
           reduced  -> true: no loop, no cursor; the static hover-01 pose at the exact Figma frame 231:6448 (card top 105).
         window.ExpansionPiece.railPose({h1, h2}) -> { w[5], left[5], gap, height, cardHeight }   (h1 / h2 = how far stage 01 / 02 is expanded, 0..1)
         window.ExpansionPiece.loopPose(ms) -> { h1, h2, cx, cy, co }   (pure; cursor tip in stage px and its opacity)

   GEOMETRY (all from Figma, use_figma read-only, px; card-local unless said). Keyframes: 231:6367 default, 231:6448 hover 01, 231:6534 hover 02, 231:6650 numbers zoom.
     card 552 x 802.94 at stage (84, 111) default / 552 x 813.59 at (84, 105) hover (the frames re-centre it; here the TOP IS FIXED, see TOP_LOOP)
     title 231:6371 (17.25, 17.25) 20.13px | rail 231:6373 (17.25, 66.25) 522.48 x 273.13 | hover rails 236:6731 (stage 01) / 231:6613 (stage 02) 522 x 283.78
     default panels 186.875 | 186.875 | 41.91 x3, gap 5.75 | hover: expanded 351.73, collapsed 36.59 x4, gap 5.97
     lower blocks keep a 23px gap under the rail, so they ride the rail's height (273.13 -> 283.78 = 10.65px) with the card top fixed.
   COLOUR: card #393939, stage #262626, panel 01 #f1c21b, panel 02 #74e792, collapsed #262626, ink #161616, numbers #6f6f6f, blue tags #0043ce, outcomes #d0e2ff / #c6c6c6.
   The Figma frames draw NO cursor (no node named cursor/pointer in any of the five frames), so the pointer is stageshow's "arrow" style (solid rounded arrowhead, white on a dark stage).
   ========================================================================= */
(function () {
  const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  const ASSET = n => window.MG_BASE + "expansion/" + n;
  // IBM Plex Math (the big 01 / 02 numerals) is not on Google Fonts. Digits-only subset of @ibm/plex-math 1.0.0 (OFL), shipped in assets/expansion.
  try {
    if (!document.getElementById("ep-fonts")) {
      const s = document.createElement("style"); s.id = "ep-fonts";
      s.textContent = `@font-face{font-family:"IBM Plex Math";src:url("${ASSET("IBMPlexMath-digits.woff2")}") format("woff2");font-weight:400;font-style:normal;font-display:block}`;
      document.head.appendChild(s);
    }
  } catch (e) { /* head not ready: the numerals fall back to the serif stack */ }

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const f2 = v => (Math.round(v * 100) / 100).toString();
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

  // cubic-bezier(x1,y1,x2,y2) as a function of time (the stageshow kit's bezier(), same curves as its EASE table)
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = u => ((ax * u + bx) * u + cx) * u, dX = u => (3 * ax * u + 2 * bx) * u + cx;
    return t => {
      if (t <= 0) return 0; if (t >= 1) return 1;
      let u = t;
      for (let i = 0; i < 8; i++) { const d = dX(u); if (Math.abs(d) < 1e-6) break; const n = u - (X(u) - t) / d; if (n < 0 || n > 1) break; u = n; }
      if (Math.abs(X(u) - t) > 1e-6) { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { u = (lo + hi) / 2; if (X(u) < t) lo = u; else hi = u; } }
      return ((ay * u + by) * u + cy) * u;
    };
  }
  const E_TRIP  = bezier(0.5, 0, 0.2, 1.12);     // a cursor trip between the two stages: eases out, overshoots the target by a few px and settles back (a hand stopping a mouse)
  const E_OPEN  = bezier(0.05, 0.85, 0.3, 1);    // a panel opening: arrives fast, long soft settle
  const E_CLOSE = bezier(0.4, 0, 0.2, 1);        // a panel closing: quicker, symmetric

  // ---------------------------------------------------------------- geometry (Figma)
  const CARD = { x: 84, w: 552, topLoop: 111, topReduced: 105 };
  const PAD = 17.25, RAIL_Y = 66.25, GAP_V = 23;
  const RAIL = {
    D:  { w: [186.875, 186.875, 41.911, 41.911, 41.911], gap: 5.75, h: 273.125 },       // 231:6373
    H1: { w: [351.73, 36.59, 36.59, 36.59, 36.59], gap: 5.97, h: 283.78 },              // 236:6731
    H2: { w: [36.59, 351.73, 36.59, 36.59, 36.59], gap: 5.97, h: 283.78 }               // 231:6613
  };
  const CARD_H_D = 802.939;                                                              // 66.25 + 273.125 + 23 + 266.5 + 23 + 133.814 + 17.25
  const CARD_H_S1 = 813.59, CARD_H_S2 = 795.84;                                          // card height with stage 01 open (231:6448 hover) / stage 02 open (231:6534)
  const BASE_LOW = RAIL_Y + RAIL.D.h + GAP_V;                                            // 362.375: where "What it takes" starts in the default pose
  // numbers zoom (231:6650 > 233:6722): the card at stage (23, -411.059), 878.524 wide -> scale 878.524 / 552
  const ZOOM = { x: 23, y: -411.059, s: 878.524 / 552 };
  // union of the three slide-17 cards (208:9293 children, absoluteBoundingBox relative to that stage): progress bars (60,315.46,600x211.22), tabs+panel (275,563,385x255.37),
  // maturity banner (60,139,600x140.46), vertical tabs (60,563,184x255)  ->  x 60..660, y 139..818.37
  const UNION = { x: 60, y: 139, w: 600, h: 818.37 - 139 };
  // cursor spots, stage px. The cursor only ever travels between these two and never leaves the card. Both sit in empty panel space (right of the round button, below the stage
  // name) and OUTSIDE where the description text lands once the panel opens (unchanged from the original spots).
  const P1 = [181.25, 412.25], P2 = [478, 436];

  const railPose = ({ h1 = 0, h2 = 0 }) => {
    const mix = i => RAIL.D.w[i] + h1 * (RAIL.H1.w[i] - RAIL.D.w[i]) + h2 * (RAIL.H2.w[i] - RAIL.D.w[i]);
    const a = h1 + h2, w = [0, 1, 2, 3, 4].map(mix), gap = lerp(RAIL.D.gap, RAIL.H1.gap, a), height = lerp(RAIL.D.h, RAIL.H1.h, a);
    const left = []; let x = 0; w.forEach(v => { left.push(x); x += v + gap; });
    return { w, left, gap, height, cardHeight: CARD_H_D + (height - RAIL.D.h) };
  };

  // ---------------------------------------------------------------- the loop (ms), a pure function of the clock. AUTHORED time, played at SPEED (below).
  // An INTRO that plays once, then a CYCLE that repeats forever. The cycle starts and ends in the SAME state (cursor on P1, stage 01 fully open), so the wrap is invisible.
  //   INTRO  0-150 cursor fades in ON stage 01 | 150-1500 rest | 1500-2300 stage 01 opens (0.1s intent delay after the pointer lands) -> hands over to the cycle
  //   CYCLE  0-2200 HOLD stage 01 open | 2200-3000 cursor travels P1 -> P2 (E_TRIP: overshoots a few px and settles)
  //          2750-3350 stage 01 closes (its cause: the pointer left it) | 3450-4250 stage 02 opens | 4250-6450 HOLD stage 02 open
  //          6450-7250 cursor travels P2 -> P1 | 7000-7600 stage 02 closes (the pointer left it) | 7700-8500 stage 01 opens -> the cycle wraps to its own start
  // The cursor never leaves the card and never fades out once it has appeared.
  // SPEED: the authored timeline plays this many times faster (2 = half the time). Readers often scroll through this beat quickly, so the
  // cursor has to arrive and open stage 01 well inside the rest window. Only this constant changes the pace; the segments below keep their ratios.
  const INTRO_MS = 2300, CYCLE_MS = 8500, SPEED = 2;
  const ramp = (c, a, b, e) => e(clamp((c - a) / (b - a), 0, 1));
  const seg = (c, a, b, p, q, e, bend) => {                                        // a point on a gently curved trip p -> q
    const u = e(clamp((c - a) / (b - a), 0, 1)), dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1, k = bend * len * Math.sin(Math.PI * u);
    return [lerp(p[0], q[0], u) - dy / len * k, lerp(p[1], q[1], u) + dx / len * k];
  };
  function loopPose(ms) {
    const m = ms > 0 ? ms * SPEED : 0;
    if (m < INTRO_MS) {                                                            // intro: the cursor fades in on stage 01, then stage 01 opens
      return { h1: ramp(m, 1500, 2300, E_OPEN), h2: 0, cx: P1[0], cy: P1[1], co: sm(0, 150, m) };
    }
    const c = (m - INTRO_MS) % CYCLE_MS;                                           // the cycle: stage 01 open -> stage 02 open -> stage 01 open
    const h1 = (1 - ramp(c, 2750, 3350, E_CLOSE)) + ramp(c, 7700, 8500, E_OPEN);   // open at the start, closes for stage 02, re-opens at the end (the two terms never overlap)
    const h2 = ramp(c, 3450, 4250, E_OPEN) * (1 - ramp(c, 7000, 7600, E_CLOSE));
    let p;
    if (c < 2200) p = P1;
    else if (c < 6450) p = c < 3000 ? seg(c, 2200, 3000, P1, P2, E_TRIP, 0.07) : P2;
    else p = seg(c, 6450, 7250, P2, P1, E_TRIP, 0.07);
    return { h1: clamp(h1, 0, 1), h2, cx: p[0], cy: p[1], co: 1 };
  }

  // ---------------------------------------------------------------- copy (verbatim from the Figma text nodes; U+2028 pairs become a blank line)
  const TXT = {
    title: "APM expansion path",
    cur: "Your current stage", tgt: "Your target stage", stage: "Stage",
    name1: "Digital Maintenance Foundation", name2: "APM foundation",
    d1a: "This is the foundation everything else is built on. Clean, criticality-scored asset data gives you a single source of truth for work order linkage, failure mode mapping, and future analytics.",
    d1b: "Structured failure data and reliable work management data become the raw material that FMEA, Reliability Strategies, and health scoring all depend on later — skip this, and every capability above Stage 1 inherits the gap. Mobility closes the paper lag, and condition monitoring gets your team acting on asset signals for the first time, without needing IoT investment yet.",
    d2a: "Maintenance starts being driven by evidence instead of habit. Reliability Strategies tie every work order to a documented failure mode, not just a<br>fixed interval. A foundational health score gives you one number to judge asset condition instead of checking multiple sources separately.",
    d2b: "And exploring Monitor with data you already have lets you experience real dashboards — a low-risk way to build momentum before committing to full instrumentation.",
    takeH: "What it takes to achieve your target stage:",
    take: "Know when assets will fail before they do. Quantify risk, prescribe action, prevent failure. Risk Scenario Engine (RSE) live, RCBF standard practice, AIP Foundation active connecting failure evidence to capital planning.",
    outH: "Potential outcomes",
    out: [["Up to 47%", "reduction in unplanned downtime via early failure prediction"], ["10–20%", "reduction in maintenance overtime and emergency repair costs"], ["Continuous", "failure probability scoring"]],
    capH: "What capabilities are you using and which ones you’ll need:",
    cta: "Talk to a seller",
    // stage 02 hover (Figma 231:6534): the same headings, a different body, outcomes and tags. Shown only while the stage 02 panel is open.
    take2: "Build the foundational APM data loop — strategy, scores, and condition visibility. Reliability Strategies activated, foundational health scores enabled for critical assets, Monitor exploration with existing data sources begins.",
    out2: [["15–20%", "reduction in unplanned downtime for critical pilot assets"], ["Single", "objective health score view across critical asset classes in Maximo Health"], ["Elimination", "of calendar-only guesswork through lightweight condition telemetry"]]
  };
  // tags: [label, kind, x, y, w]   (231:6438..6444)
  const TAGS = [["Manage", "chk", 0, 0, 60.75], ["Mobile", "chk", 66.5, 0, 56.75], ["Spatial (Partial)", "inc", 129, 0, 92.75], ["HSE", "out", 227.5, 0, 34.25],
                ["Scheduler", "out", 0, 28.75, 58.25], ["Dispatcher", "out", 64, 28.75, 61.25], ["Organizer", "out", 131, 28.75, 56.25]];
  // stage 02 hover tags (Figma 231:6604..6609): one row
  const TAGS2 = [["Manage", "chk", 0, 0, 60.75], ["Health", "chk", 66.5, 0, 55.75], ["Monitor", "out", 128, 0, 49.25], ["RS", "out", 183, 0, 28.75], ["Predict", "out", 217.5, 0, 46.25]];

  // icons: Figma SVG exports of the instances (paths verbatim; fills set to currentColor / the node's own colour)
  const SV = (vb, body, extra) => `<svg viewBox="0 0 ${vb} ${vb}" width="${vb}" height="${vb}" fill="none" ${extra || ""} aria-hidden="true">${body}</svg>`;
  const ICON = {
    check: SV(12, `<path d="M5.03125 7.69566L3.23438 5.89842L3.74217 5.39063L5.03125 6.67934L7.75711 3.95313L8.26563 4.46164L5.03125 7.69566Z" fill="currentColor"/><path d="M5.75 0.71875C4.75492 0.71875 3.78217 1.01383 2.95479 1.56667C2.1274 2.11951 1.48254 2.90528 1.10173 3.82462C0.72093 4.74397 0.621294 5.75558 0.815426 6.73155C1.00956 7.70752 1.48874 8.604 2.19237 9.30763C2.896 10.0113 3.79249 10.4904 4.76845 10.6846C5.74442 10.8787 6.75604 10.7791 7.67538 10.3983C8.59472 10.0175 9.38049 9.3726 9.93333 8.54521C10.4862 7.71783 10.7813 6.74509 10.7813 5.75C10.7813 4.41563 10.2512 3.13591 9.30763 2.19237C8.36409 1.24883 7.08437 0.71875 5.75 0.71875ZM5.75 10.0625C4.89707 10.0625 4.06329 9.80958 3.35411 9.33571C2.64492 8.86185 2.09217 8.18833 1.76577 7.40032C1.43937 6.61232 1.35397 5.74522 1.52037 4.90867C1.68676 4.07213 2.09749 3.30372 2.7006 2.7006C3.30372 2.09749 4.07213 1.68676 4.90868 1.52036C5.74522 1.35396 6.61232 1.43937 7.40032 1.76577C8.18833 2.09217 8.86185 2.64492 9.33572 3.3541C9.80958 4.06329 10.0625 4.89707 10.0625 5.75C10.0625 6.89375 9.60815 7.99065 8.7994 8.7994C7.99065 9.60815 6.89375 10.0625 5.75 10.0625Z" fill="currentColor"/>`),
    radar: SV(12, `<path d="M10.7813 1.22694L10.2731 0.71875L5.49592 5.49592C5.43046 5.5637 5.39424 5.65448 5.39506 5.74871C5.39588 5.84293 5.43367 5.93307 5.5003 5.9997C5.56693 6.06633 5.65707 6.10413 5.7513 6.10495C5.84552 6.10576 5.9363 6.06954 6.00408 6.00408L7.50627 4.50218C7.78561 4.89617 7.92449 5.37259 7.90061 5.85497C7.87673 6.33735 7.69147 6.79772 7.37457 7.16219C7.05767 7.52666 6.6275 7.77409 6.15312 7.86477C5.67874 7.95545 5.18764 7.88412 4.75866 7.66223C4.32968 7.44034 3.98768 7.08075 3.78756 6.64119C3.58745 6.20162 3.54082 5.70757 3.65516 5.23833C3.76949 4.76908 4.03817 4.35186 4.41806 4.05362C4.79795 3.75539 5.26703 3.59343 5.75 3.59375V2.875C5.09923 2.87411 4.46735 3.09373 3.95741 3.49805C3.44747 3.90237 3.08956 4.46753 2.94204 5.10136C2.79453 5.7352 2.86611 6.40032 3.14512 6.98825C3.42413 7.57618 3.8941 8.05224 4.4784 8.33879C5.06269 8.62534 5.72683 8.70548 6.36251 8.56613C6.9982 8.42678 7.56792 8.07617 7.97876 7.57148C8.38961 7.06678 8.61734 6.43778 8.62482 5.78705C8.6323 5.13631 8.41909 4.50224 8.01996 3.98824L9.04299 2.9652C9.70463 3.74185 10.0663 4.72974 10.0625 5.75C10.0625 6.60293 9.80958 7.43671 9.33572 8.1459C8.86185 8.85508 8.18833 9.40783 7.40032 9.73423C6.61232 10.0606 5.74522 10.146 4.90868 9.97964C4.07213 9.81324 3.30372 9.40251 2.7006 8.7994C2.09749 8.19628 1.68676 7.42787 1.52037 6.59133C1.35397 5.75478 1.43937 4.88768 1.76577 4.09968C2.09217 3.31167 2.64492 2.63815 3.35411 2.16429C4.06329 1.69042 4.89707 1.4375 5.75 1.4375V0.71875C4.75492 0.71875 3.78217 1.01383 2.95479 1.56667C2.1274 2.11951 1.48254 2.90528 1.10173 3.82462C0.72093 4.74397 0.621294 5.75558 0.815426 6.73155C1.00956 7.70752 1.48874 8.604 2.19237 9.30763C2.896 10.0113 3.79249 10.4904 4.76845 10.6846C5.74442 10.8787 6.75604 10.7791 7.67538 10.3983C8.59472 10.0175 9.38049 9.3726 9.93333 8.54521C10.4862 7.71783 10.7813 6.74509 10.7813 5.75C10.7852 4.53926 10.348 3.36854 9.55133 2.45683L10.7813 1.22694Z" fill="currentColor"/>`),
    dash: SV(12, `<g fill="currentColor"><path d="M2.76712 1.68948C2.35491 2.0058 1.99163 2.38119 1.68899 2.80354L2.26399 3.23479C2.52793 2.86874 2.84254 2.54204 3.19837 2.26448L2.76712 1.68948Z"/><path d="M1.65306 4.42073L0.970243 4.20511C0.796651 4.70153 0.711506 5.22457 0.71868 5.75042H1.43743C1.43597 5.29837 1.50882 4.84915 1.65306 4.42073Z"/><path d="M0.970243 7.33167C1.13691 7.83279 1.3793 8.30545 1.68899 8.73323L2.26399 8.30198C2.00419 7.93822 1.79841 7.53876 1.65306 7.11604L0.970243 7.33167Z"/><path d="M2.80306 9.81136C3.23083 10.1211 3.70349 10.3634 4.20462 10.5301L4.42024 9.84729C3.99752 9.70193 3.59807 9.49616 3.23431 9.23636L2.80306 9.81136Z"/><path d="M4.20462 0.970731L4.42024 1.65354C4.84867 1.50931 5.29788 1.43646 5.74993 1.43792V0.719168C5.22408 0.711994 4.70104 0.797139 4.20462 0.970731Z"/><path d="M8.69681 9.81136C9.12011 9.49586 9.49538 9.1206 9.81087 8.69729L9.23587 8.26604C8.96861 8.64116 8.64067 8.9691 8.26556 9.23636L8.69681 9.81136Z"/><path d="M9.84681 7.08011L10.5296 7.29573C10.6859 6.79507 10.7706 6.27481 10.7812 5.75042H10.0624C10.0639 6.20247 9.99104 6.65168 9.84681 7.08011Z"/><path d="M10.4937 4.16917C10.327 3.66804 10.0846 3.19538 9.77493 2.76761L9.19993 3.19886C9.45973 3.56262 9.66551 3.96207 9.81087 4.38479L10.4937 4.16917Z"/><path d="M8.66087 1.65354C8.23309 1.34385 7.76043 1.10146 7.25931 0.934793L7.04368 1.61761C7.4664 1.76296 7.86585 1.96874 8.22962 2.22854L8.66087 1.65354Z"/><path d="M7.29524 10.5301L7.07962 9.84729C6.6512 9.99153 6.20198 10.0644 5.74993 10.0629V10.7817C6.27225 10.7506 6.79003 10.6663 7.29524 10.5301Z"/></g>`),
    max: SV(12, `<path d="M7.1875 0.71875V1.4375H9.55434L6.46875 4.52166L6.97691 5.03125L10.0625 1.94566V4.3125H10.7813V0.71875H7.1875Z" fill="#f4f4f4"/><path d="M5.03125 6.97763L4.52525 6.46875L1.4375 9.55434V7.1875H0.71875V10.7813H4.3125V10.0625H1.94566L5.03125 6.97763Z" fill="#f4f4f4"/>`),
    min: SV(9, `<path d="M1.07361 4.8311V5.36785H2.84113L0.536865 7.67104L0.916347 8.05159L3.22061 5.74733V7.51485H3.75736V4.8311H1.07361Z" fill="#f4f4f4"/><path d="M8.05135 0.917128L7.67348 0.537109L5.36761 2.84137V1.07386H4.83086V3.7576H7.5146V3.22085H5.74709L8.05135 0.917128Z" fill="#f4f4f4"/>`),
    inc: SV(12, `<path d="M8.54026 2.46506L9.00209 1.91468C8.55597 1.53707 8.04735 1.24023 7.49915 1.03752L7.25348 1.71228C7.72294 1.88642 8.1584 2.14117 8.54026 2.46506Z" fill="#FFD6E8"/><path d="M9.99422 5.03125L10.7014 4.8829C10.602 4.30868 10.4028 3.7563 10.1128 3.2508L9.49063 3.59375C9.73897 4.04082 9.90927 4.52695 9.99422 5.03125Z" fill="#FFD6E8"/><path d="M7.25348 9.78772L7.49915 10.4625C8.04735 10.2598 8.55597 9.96293 9.00209 9.58532L8.54026 9.03494C8.1584 9.35883 7.72294 9.61358 7.25348 9.78772Z" fill="#FFD6E8"/><path d="M9.49063 7.90625L10.1128 8.26563C10.4029 7.75431 10.6021 7.19653 10.7015 6.6171L9.99422 6.49243C9.9092 6.98924 9.73882 7.46757 9.49063 7.90625Z" fill="#FFD6E8"/><path d="M5.75 10.7813V0.71875C4.41563 0.71875 3.13591 1.24883 2.19237 2.19237C1.24883 3.13591 0.71875 4.41563 0.71875 5.75C0.71875 7.08437 1.24883 8.36409 2.19237 9.30763C3.13591 10.2512 4.41563 10.7813 5.75 10.7813Z" fill="#FFD6E8"/>`),
    tagchk: SV(12, `<path d="M5.03125 7.69566L3.23438 5.89842L3.74217 5.39063L5.03125 6.67934L7.75711 3.95313L8.26563 4.46164L5.03125 7.69566Z" fill="#D0E2FF"/><path d="M5.75 0.71875C4.75492 0.71875 3.78217 1.01383 2.95479 1.56667C2.1274 2.11951 1.48254 2.90528 1.10173 3.82462C0.72093 4.74397 0.621294 5.75558 0.815426 6.73155C1.00956 7.70752 1.48874 8.604 2.19237 9.30763C2.896 10.0113 3.79249 10.4904 4.76845 10.6846C5.74442 10.8787 6.75604 10.7791 7.67538 10.3983C8.59472 10.0175 9.38049 9.3726 9.93333 8.54521C10.4862 7.71783 10.7813 6.74509 10.7813 5.75C10.7813 4.41563 10.2512 3.13591 9.30763 2.19237C8.36409 1.24883 7.08437 0.71875 5.75 0.71875ZM5.75 10.0625C4.89707 10.0625 4.06329 9.80958 3.35411 9.33571C2.64492 8.86185 2.09217 8.18833 1.76577 7.40032C1.43937 6.61232 1.35397 5.74522 1.52037 4.90867C1.68676 4.07213 2.09749 3.30372 2.7006 2.7006C3.30372 2.09749 4.07213 1.68676 4.90868 1.52036C5.74522 1.35396 6.61232 1.43937 7.40032 1.76577C8.18833 2.09217 8.86185 2.64492 9.33572 3.3541C9.80958 4.06329 10.0625 4.89707 10.0625 5.75C10.0625 6.89375 9.60815 7.99065 8.7994 8.7994C7.99065 9.60815 6.89375 10.0625 5.75 10.0625Z" fill="#D0E2FF"/>`),
    svc: SV(12, `<path d="M9.10441 4.29453L9.53763 3.86113C9.59596 3.80348 9.66979 3.76401 9.75013 3.74752C9.83047 3.73104 9.91387 3.73824 9.99019 3.76827L10.5182 3.97915C10.5954 4.01047 10.6615 4.06393 10.7083 4.13277C10.7551 4.20161 10.7805 4.28277 10.7813 4.36601V5.33345C10.7808 5.38858 10.7695 5.44308 10.7481 5.49385C10.7266 5.54462 10.6953 5.59066 10.656 5.62934C10.6167 5.66802 10.5702 5.69859 10.5191 5.71929C10.468 5.73999 10.4134 5.75043 10.3582 5.75L10.3403 5.74946C6.64035 5.51921 5.89375 2.38471 5.75262 1.18508C5.74032 1.07445 5.77246 0.963461 5.84198 0.876524C5.91149 0.789587 6.01269 0.733819 6.12332 0.721484C6.13958 0.719604 6.15593 0.718692 6.1723 0.718753H7.10646C7.18983 0.719011 7.27122 0.744207 7.34016 0.7911C7.4091 0.837992 7.46243 0.904437 7.49329 0.981887L7.7041 1.51017C7.7351 1.58623 7.74301 1.66973 7.72685 1.75026C7.71069 1.83079 7.67116 1.90477 7.61322 1.96298L7.17999 2.39632C7.17999 2.39632 7.42947 4.08545 9.10441 4.29453Z" fill="#fff"/><path d="M5.75 10.7813H5.03125V8.98438C5.03094 8.69854 4.91725 8.4245 4.71513 8.22238C4.51301 8.02026 4.23897 7.90657 3.95313 7.90625H2.51563C2.22978 7.90657 1.95574 8.02026 1.75362 8.22238C1.5515 8.4245 1.43781 8.69854 1.4375 8.98438V10.7813H0.71875V8.98438C0.719311 8.50799 0.908804 8.05127 1.24566 7.71442C1.58252 7.37756 2.03924 7.18806 2.51563 7.1875H3.95313C4.42951 7.18806 4.88623 7.37756 5.22309 7.71442C5.55995 8.05127 5.74944 8.50799 5.75 8.98438V10.7813Z" fill="#fff"/><path d="M3.23438 3.59375C3.44761 3.59375 3.65605 3.65698 3.83335 3.77545C4.01065 3.89392 4.14883 4.0623 4.23043 4.2593C4.31203 4.4563 4.33338 4.67307 4.29178 4.88221C4.25018 5.09135 4.1475 5.28345 3.99672 5.43423C3.84595 5.58501 3.65384 5.68769 3.44471 5.72929C3.23557 5.77089 3.0188 5.74954 2.82179 5.66794C2.62479 5.58634 2.45641 5.44815 2.33795 5.27085C2.21948 5.09356 2.15625 4.88511 2.15625 4.67188C2.15625 4.38594 2.26984 4.11172 2.47203 3.90953C2.67421 3.70734 2.94844 3.59375 3.23438 3.59375ZM3.23438 2.875C2.87899 2.875 2.53158 2.98039 2.23608 3.17783C1.94059 3.37527 1.71028 3.65591 1.57428 3.98424C1.43828 4.31258 1.40269 4.67387 1.47203 5.02243C1.54136 5.37099 1.7125 5.69116 1.96379 5.94246C2.21509 6.19376 2.53526 6.36489 2.88382 6.43423C3.23238 6.50356 3.59367 6.46798 3.92201 6.33197C4.25035 6.19597 4.53098 5.96566 4.72842 5.67017C4.92587 5.37467 5.03125 5.02727 5.03125 4.67188C5.03125 4.43591 4.98477 4.20225 4.89447 3.98424C4.80417 3.76624 4.67181 3.56815 4.50496 3.4013C4.3381 3.23444 4.14002 3.10208 3.92201 3.01178C3.704 2.92148 3.47034 2.875 3.23438 2.875Z" fill="#fff"/>`)
  };
  // the header glyph (Figma instance 231:6372 "data--scientist", 23 x 23, fill #D0E2FF): the export's path, verbatim
  const HDR_ICON = `<svg viewBox="0 0 23 23" width="23" height="23" fill="none" aria-hidden="true"><path d="M19.8662 12.2197H20.3844V13.6572H19.8662V12.2197ZM3.59371 13.3984H2.15621V13.9167H3.59371V13.3984ZM18.4287 13.6572H18.9469V10.0634H18.4287V13.6572ZM4.77246 2.15719C4.77246 1.61813 5.2109 1.17969 5.74996 1.17969C6.28902 1.17969 6.72746 1.61813 6.72746 2.15719C6.72746 2.69625 6.28902 3.13469 5.74996 3.13469C5.2109 3.13469 4.77246 2.69625 4.77246 2.15719ZM5.28996 2.15719C5.28996 2.41091 5.49624 2.61719 5.74996 2.61719C6.00368 2.61719 6.20996 2.41091 6.20996 2.15719C6.20996 1.90347 6.00368 1.69719 5.74996 1.69719C5.49624 1.69719 5.28996 1.90347 5.28996 2.15719ZM21.8212 3.59469V15.0947C21.8212 15.2377 21.7055 15.3534 21.5625 15.3534H14.4799C14.2736 15.9924 13.869 16.5523 13.3242 16.9448C15.392 17.7009 16.79 19.6681 16.79 21.9228V22.2822H16.2725V21.9228C16.2725 19.7019 14.7696 17.7893 12.6183 17.2711C12.5105 17.2459 12.4315 17.1539 12.4214 17.0439C12.4113 16.934 12.4717 16.829 12.5731 16.7845C13.511 16.3626 14.1162 15.4181 14.1162 14.3759C14.1162 12.9334 12.9425 11.7597 11.5 11.7597C10.0574 11.7597 8.88371 12.9334 8.88371 14.3759C8.88371 15.4174 9.48962 16.3633 10.4269 16.7845C10.5282 16.829 10.5886 16.934 10.5785 17.0439C10.5685 17.1539 10.4887 17.2459 10.3816 17.2711C8.23037 17.7893 6.72746 19.7019 6.72746 21.9228V22.2822H6.20996V21.9228C6.20996 19.6681 7.60721 17.7002 9.67506 16.9448C8.86502 16.3618 8.36621 15.4088 8.36621 14.3759C8.36621 12.735 9.63409 11.3845 11.2412 11.253V3.59469C11.2412 3.45166 11.3569 3.33594 11.5 3.33594H21.5625C21.7055 3.33594 21.8212 3.45166 21.8212 3.59469ZM21.3037 3.85344H11.7587V9.43884L14.1917 7.00588C14.293 6.90453 14.4569 6.90453 14.5582 7.00588L16.5312 8.97884L19.5004 6.00969H17.9687V5.49219H20.3859L20.3665 7.90934L19.8482 7.90503L19.8605 6.38128L16.7138 9.52797C16.6124 9.62931 16.4486 9.62931 16.3472 9.52797L14.375 7.55428L11.7587 10.1705V11.253C13.3666 11.3852 14.6337 12.735 14.6337 14.3759C14.6337 14.5312 14.6222 14.685 14.5999 14.8359H21.303L21.3037 3.85344ZM3.59371 16.2734H2.15621V16.7917H3.59371V16.2734ZM7.18746 18.2284H1.43746C1.29443 18.2284 1.17871 18.1127 1.17871 17.9697V12.2197C1.17871 12.0767 1.29443 11.9609 1.43746 11.9609H7.18746C7.33049 11.9609 7.44621 12.0767 7.44621 12.2197V17.9697C7.44621 18.1127 7.33049 18.2284 7.18746 18.2284ZM6.92871 15.3534H1.69621V17.7102H6.92871V15.3534ZM6.92871 12.4784H1.69621V14.8352H6.92871V12.4784ZM1.17871 4.31344C1.17871 3.77438 1.61715 3.33594 2.15621 3.33594C2.64568 3.33594 3.05249 3.69747 3.12293 4.16753L4.86734 5.33047C5.02474 5.00128 5.36112 4.77344 5.74996 4.77344C6.19918 4.77344 6.57868 5.07819 6.69296 5.49219H8.40143C8.51499 5.07819 8.89449 4.77344 9.34443 4.77344C9.88349 4.77344 10.3219 5.21188 10.3219 5.75094C10.3219 6.29 9.88277 6.72844 9.34371 6.72844C8.89449 6.72844 8.51499 6.42369 8.40071 6.00969H6.69296C6.60168 6.34103 6.34005 6.60266 6.00871 6.69394V8.40241C6.42271 8.51597 6.72746 8.89547 6.72746 9.34541C6.72746 9.88447 6.28902 10.3229 5.74996 10.3229C5.2109 10.3229 4.77246 9.88375 4.77246 9.34469C4.77246 8.89547 5.07721 8.51597 5.49121 8.40169V6.69394C5.12249 6.59259 4.84074 6.28066 4.78324 5.89684L3.03884 4.73319C2.88143 5.06309 2.54505 5.29094 2.15621 5.29094C1.61715 5.29094 1.17871 4.8525 1.17871 4.31344ZM8.88371 5.75094C8.88371 6.00466 9.08999 6.21094 9.34371 6.21094C9.59743 6.21094 9.80371 6.00466 9.80371 5.75094C9.80371 5.49722 9.59743 5.29094 9.34371 5.29094C9.08999 5.29094 8.88371 5.49722 8.88371 5.75094ZM5.74996 8.88469C5.49624 8.88469 5.28996 9.09097 5.28996 9.34469C5.28996 9.59841 5.49624 9.80469 5.74996 9.80469C6.00368 9.80469 6.20996 9.59841 6.20996 9.34469C6.20996 9.09097 6.00368 8.88469 5.74996 8.88469ZM5.28996 5.75094C5.28996 6.00466 5.49624 6.21094 5.74996 6.21094C6.00368 6.21094 6.20996 6.00466 6.20996 5.75094C6.20996 5.49722 6.00368 5.29094 5.74996 5.29094C5.49624 5.29094 5.28996 5.49722 5.28996 5.75094ZM1.69621 4.31344C1.69621 4.56716 1.90249 4.77344 2.15621 4.77344C2.40993 4.77344 2.61621 4.56716 2.61621 4.31344C2.61621 4.05972 2.40993 3.85344 2.15621 3.85344C1.90249 3.85344 1.69621 4.05972 1.69621 4.31344ZM16.9912 13.6572H17.5094V11.5009H16.9912V13.6572ZM1.17871 7.90719C1.17871 7.36813 1.61715 6.92969 2.15621 6.92969C2.69527 6.92969 3.13371 7.36813 3.13371 7.90719C3.13371 8.44625 2.69527 8.88469 2.15621 8.88469C1.61715 8.88469 1.17871 8.44625 1.17871 7.90719ZM1.69621 7.90719C1.69621 8.16091 1.90249 8.36719 2.15621 8.36719C2.40993 8.36719 2.61621 8.16091 2.61621 7.90719C2.61621 7.65347 2.40993 7.44719 2.15621 7.44719C1.90249 7.44719 1.69621 7.65347 1.69621 7.90719Z" fill="#D0E2FF"/></svg>`;

  const SHADOW = "0.96px 1.37px 1.82px rgba(0,0,0,.089),2.9px 4.14px 5.52px rgba(0,0,0,.065),5.54px 7.92px 10.56px rgba(0,0,0,.047),8.78px 12.54px 16.73px rgba(0,0,0,.034),12.55px 17.93px 23.9px rgba(0,0,0,.025),16.8px 24px 32px rgba(0,0,0,.018)";   // Frame 2732's six drop shadows

  const CSS = `
.ep{position:absolute;inset:0;overflow:hidden;font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:#f4f4f4;-webkit-font-smoothing:antialiased}
.ep *{box-sizing:border-box}
.ep [data-card]{position:absolute;left:0;top:0;width:552px;transform-origin:0 0;will-change:transform}
.ep [data-shell]{position:absolute;background:#393939;border-radius:5.75px}
.ep .a{position:absolute;white-space:nowrap}
.ep .w{white-space:normal}
.ep .pn{position:absolute;top:0;overflow:hidden}
.ep .pn>*{position:absolute;left:0;top:0}
.ep .ink{color:#161616}
.ep .num{font-family:"IBM Plex Math","IBM Plex Serif",Georgia,serif;font-size:46px;line-height:37.375px;width:60px;transform-origin:0 0;white-space:nowrap}
.ep .ic{width:11.5px;height:11.5px;transform-origin:0 0;display:block}
.ep .ic svg{display:block;width:100%;height:100%}
.ep .btn{border-radius:50%;background:#6f6f6f}
.ep .btn>span{position:absolute;left:50%;top:50%;display:block;line-height:0}
.ep .chip{position:absolute;height:23px;border-radius:11.5px;font-size:8.63px;letter-spacing:.23px;line-height:13.44px;white-space:nowrap}
.ep .chip.f{background:#0043ce;color:#d0e2ff}
.ep .chip.f.inc{color:#ffd6e8}
.ep .chip.o{background:#262626;border:.72px solid #f4f4f4;color:#e0e0e0}
.ep .chip i{position:absolute;left:5.75px;top:5.75px;width:11.5px;height:11.5px;display:block}
.ep .chip i svg{display:block;width:100%;height:100%}
.ep .chip b{position:absolute;top:4.78px;font-weight:400}
.ep .cta{position:absolute;width:124.5px;height:34.56px;border:.72px solid #fff;color:#fff;font-size:10.06px;letter-spacing:.12px;line-height:13px}
.ep .cur{position:absolute;left:0;top:0;width:22px;height:22px;pointer-events:none;will-change:transform;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))}
.ep .cur path{fill:#fff;stroke:#fff;stroke-width:2.4;stroke-linejoin:round}
`;

  function make({ clock = () => 0, enter = () => 1, zoom = () => 0, reduced = false } = {}) {
    const lab = (cls, txt, st) => `<div class="a ${cls}" style="${st}">${txt}</div>`;
    // ---- the two coloured stage panels (children are absolutely positioned; update() sets every number)
    const panel = (n) => {
      const p1 = n === 0, ink = "ink";
      return `<div class="pn" data-pn="${n}" style="background:${p1 ? "#f1c21b" : "#74e792"}">` +
        `<div class="a ${ink}" data-r="hl" style="letter-spacing:.12px">${p1 ? TXT.cur : TXT.tgt}</div>` +
        `<div class="ic ${ink}" data-r="hi">${p1 ? ICON.check : ICON.radar}</div>` +
        `<div class="a ${ink}" data-r="st">${TXT.stage}</div>` +
        `<div class="a ${ink} num" data-r="num">0${n + 1}</div>` +
        (p1 ? `<div class="a w ${ink}" data-r="nmD">${TXT.name1}</div><div class="a w ${ink}" data-r="nmE">${TXT.name1}</div>`
            : `<div class="a w ${ink}" data-r="nmD">${TXT.name2}</div>`) +
        `<div class="btn" data-r="bt"><span data-r="bmax" style="margin:-5.75px 0 0 -5.75px;width:11.5px;height:11.5px">${ICON.max}</span><span data-r="bmin" style="margin:-4.5px 0 0 -4.5px;width:9px;height:9px">${ICON.min}</span></div>` +
        `<div class="w ${ink}" data-r="ds" style="width:199.39px;font-size:10.45px;line-height:13.44px;letter-spacing:.12px;opacity:0">${p1 ? TXT.d1a + "<br><br>" + TXT.d1b : TXT.d2a + "<br><br>" + TXT.d2b}</div>` +
        `</div>`;
    };
    const dim = n => `<div class="pn" data-pn="${n}" style="background:#262626"><div class="ic" data-r="hi" style="color:#f4f4f4;fill:#f4f4f4">${ICON.dash}</div><div class="a num" data-r="num" style="color:#6f6f6f">0${n + 1}</div></div>`;
    const chipHtml = ([l, k, x, y, w]) => {
      const icon = k === "chk" ? ICON.tagchk : k === "inc" ? ICON.inc : "";
      return `<div class="chip ${k === "out" ? "o" : "f"}${k === "inc" ? " inc" : ""}" style="left:${x}px;top:${y}px;width:${w}px">${icon ? `<i>${icon}</i>` : ""}<b style="left:${icon ? 20.13 : 8.63 - 0.72}px">${l}</b></div>`;
    };
    const tagHtml = TAGS.map(chipHtml).join(""), tagHtml2 = TAGS2.map(chipHtml).join("");
    const outGrid = list => list.map(([v, c], i) => {
      const x = i === 1 ? 212.03 : 0, y = i === 2 ? 72 : 0;
      return `<div class="a" style="left:${x}px;top:${y}px;width:177.53px"><div style="font-size:20.13px;line-height:25.88px;color:#d0e2ff">${v}</div><div class="w" style="margin-top:11.5px;font-size:8.63px;line-height:11.5px;letter-spacing:.23px;color:#c6c6c6">${c}</div></div>`;
    }).join("");
    const outHtml = outGrid(TXT.out), outHtml2 = outGrid(TXT.out2);
    const H = `font-size:10.06px;letter-spacing:.12px;font-weight:600;color:#f4f4f4;`;
    const html = `<div class="ep" data-ep style="visibility:hidden"><style>${CSS}</style>` +
      `<div data-card>` +
        `<div data-shell></div>` +
        `<div data-it="hd"><div class="a" style="left:${PAD}px;top:${PAD}px;font-size:20.13px;line-height:25.88px;color:#f4f4f4">${TXT.title}</div><div class="a" style="left:${PAD + 494.5}px;top:${PAD}px;width:23px;height:23px">${HDR_ICON}</div></div>` +
        `<div data-rail style="position:absolute;left:${PAD}px;top:${RAIL_Y}px;width:523px">${panel(0)}${panel(1)}${dim(2)}${dim(3)}${dim(4)}</div>` +
        `<div data-low style="position:absolute;left:0px;top:0px;width:552px;height:0px">` +
          // set 1: stage 01 / default content (unchanged)
          `<div data-set="1" style="position:absolute;left:0px;top:0px;width:552px;height:0px">` +
          `<div data-it="b2"><div class="a" style="left:${PAD}px;top:${BASE_LOW}px;${H}line-height:14.38px">${TXT.takeH}</div><div class="a w" style="left:${PAD}px;top:${BASE_LOW + 26.5}px;width:304.75px;font-size:11.5px;line-height:17.25px">${TXT.take}</div></div>` +
          `<div data-it="b3"><div class="a" style="left:${PAD}px;top:${BASE_LOW + 118.5}px;${H}line-height:14.38px">${TXT.outH}</div><div class="a" style="left:${PAD}px;top:${BASE_LOW + 118.5 + 26.5}px;width:517.5px;height:121.5px">${outHtml}</div></div>` +
          `<div data-it="b4"><div class="a" style="left:${PAD}px;top:${BASE_LOW + 289.5}px;${H}line-height:12.94px">${TXT.capH}</div><div class="a" style="left:${PAD}px;top:${BASE_LOW + 289.5 + 24.5}px;width:345px;height:52px">${tagHtml}</div>` +
          `<div class="cta" style="left:${PAD}px;top:${BASE_LOW + 289.5 + 99.25}px"><span class="a" style="left:10.78px;top:10.06px">${TXT.cta}</span><span class="a" style="left:101.28px;top:10.53px;width:11.5px;height:11.5px;line-height:0">${ICON.svc}</span></div></div>` +
          `</div>` +
          // set 2: stage 02 hover content (Figma 231:6581). Offsets are Figma's, measured from the same block top (BASE_LOW); data-low already adds the rail's extra height.
          `<div data-set="2" style="position:absolute;left:0px;top:0px;width:552px;height:0px;opacity:0">` +
          `<div data-it="c2"><div class="a" style="left:${PAD}px;top:${BASE_LOW}px;${H}line-height:14.38px">${TXT.takeH}</div><div class="a w" style="left:${PAD}px;top:${BASE_LOW + 26.5}px;width:304.75px;font-size:11.5px;line-height:17.25px">${TXT.take2}</div></div>` +
          `<div data-it="c3"><div class="a" style="left:${PAD}px;top:${BASE_LOW + 118.5}px;${H}line-height:14.38px">${TXT.outH}</div><div class="a" style="left:${PAD}px;top:${BASE_LOW + 118.5 + 26.5}px;width:517.5px;height:121.5px">${outHtml2}</div></div>` +
          `<div data-it="c4"><div class="a" style="left:${PAD}px;top:${BASE_LOW + 300.5}px;${H}line-height:12.94px">${TXT.capH}</div><div class="a" style="left:${PAD}px;top:${BASE_LOW + 300.5 + 24.5}px;width:345px;height:23px">${tagHtml2}</div>` +
          `<div class="cta" style="left:${PAD}px;top:${BASE_LOW + 371}px"><span class="a" style="left:10.78px;top:10.06px">${TXT.cta}</span><span class="a" style="left:101.28px;top:10.53px;width:11.5px;height:11.5px;line-height:0">${ICON.svc}</span></div></div>` +
          `</div>` +
        `</div>` +
      `</div>` +
      `<div class="cur" data-cur style="opacity:0"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style="display:block"><path d="M4 3 18.5 9.6 11.8 11.8 9.6 18.5Z"/></svg></div>` +
      `</div>`;

    let R = null;
    const bind = body => {
      const q = (s, r) => (r || body).querySelector(s);
      const pn = [0, 1, 2, 3, 4].map(i => {
        const el = q(`[data-pn="${i}"]`), g = k => q(`[data-r="${k}"]`, el);
        return { el, hl: g("hl"), hi: g("hi"), st: g("st"), num: g("num"), nmD: g("nmD"), nmE: g("nmE"), bt: g("bt"), bmax: g("bmax"), bmin: g("bmin"), ds: g("ds") };
      });
      body.querySelectorAll("[style]").forEach(e => e.setAttribute("style", e.style.cssText));      // canonical serialisation, so equal states give equal DOM text
      R = { body, root: q("[data-ep]"), card: q("[data-card]"), shell: q("[data-shell]"), rail: q("[data-rail]"), low: q("[data-low]"), cur: q("[data-cur]"), pn,
            set1: q('[data-set="1"]'), set2: q('[data-set="2"]'),
            it: { hd: q('[data-it="hd"]'), b2: q('[data-it="b2"]'), b3: q('[data-it="b3"]'), b4: q('[data-it="b4"]'), c2: q('[data-it="c2"]'), c3: q('[data-it="c3"]'), c4: q('[data-it="c4"]') } };
    };
    const put = (el, o) => { if (!el) return; const s = el.style; for (const k in o) s[k] = o[k]; };
    const px = v => f2(v) + "px";

    function update(body, k, t) {
      if (!R || R.body !== body) bind(body);
      const p = clamp(enter(t), 0, 1), z = clamp(zoom(t), 0, 1);
      R.root.style.visibility = p <= 0 ? "hidden" : "visible";      // p = 0: fully styled at its start pose but hidden (so the DOM is a pure function of the inputs)

      // ---- pose: the loop (only once the card has landed), folded away by the zoom; reduced motion = static hover 01
      let pose;
      if (reduced) pose = { h1: 1, h2: 0, cx: 0, cy: 0, co: 0 };
      else { const lp = loopPose(clock()), w = sm(0.9, 1, p); pose = { h1: lp.h1 * w, h2: lp.h2 * w, cx: lp.cx, cy: lp.cy, co: lp.co * w }; }      // the loop is weighted in over the last 10% of the arrival, so there is no pop at enter = 1
      const fold = 1 - sm(0, 0.3, z), h1 = pose.h1 * fold, h2 = pose.h2 * fold, co = pose.co * (1 - sm(0, 0.12, z));
      const rp = railPose({ h1, h2 }), top = reduced ? CARD.topReduced : CARD.topLoop;
      const cardH = rp.cardHeight + (CARD_H_S2 - CARD_H_S1) * h2;                         // stage 02's content is shorter (Figma 231:6534: 795.84 vs 813.59 for stage 01 hover)

      // ---- card placement: arrival (union of the previous beat's three cards -> the card) then the numbers zoom
      const u = ease(clamp((p - 0.05) / 0.55, 0, 1)), zs = sm(0.2, 1, z);      // smoothstep only: peak slope 1.5 (ease(sm()) was 4.5). Give the zoom window >= 45vh in the host
      const zx = lerp(CARD.x, ZOOM.x, zs), zy = lerp(top, ZOOM.y, zs), zk = lerp(1, ZOOM.s, zs);
      put(R.card, { transform: `translate(${f2(zx)}px,${f2(zy)}px) scale(${f2(zk * 10000) / 10000})`, height: px(cardH) });
      const sx = lerp(UNION.x - CARD.x, 0, u), sy = lerp(UNION.y - top, 0, u), sw = lerp(UNION.w, CARD.w, u), sh = lerp(UNION.h, cardH, u);
      put(R.shell, { left: px(sx), top: px(sy), width: px(sw), height: px(sh), opacity: f2(sm(0, 0.22, p)), boxShadow: u > 0.02 ? SHADOW.replace(/rgba\(0,0,0,([\d.]+)\)/g, (m, a) => `rgba(0,0,0,${f2(a * sm(0.3, 0.7, u) * 1000) / 1000})`) : "none" });

      // ---- content arrives in a stagger (opacity + 10px rise) after the shell has nearly landed
      const arr = (el, a, b) => { const v = sm(a, b, p); put(el, { opacity: f2(v), transform: `translateY(${f2((1 - v) * 10)}px)` }); };
      arr(R.it.hd, 0.46, 0.66);
      arr(R.it.b2, 0.62, 0.82); arr(R.it.b3, 0.68, 0.88); arr(R.it.b4, 0.74, 0.96);
      arr(R.it.c2, 0.62, 0.82); arr(R.it.c3, 0.68, 0.88); arr(R.it.c4, 0.74, 0.96);
      put(R.low, { top: px(rp.height - RAIL.D.h) });
      // stage 02 hover swaps the lower copy: set 1 (stage 01 / default) fades out as set 2 (stage 02) fades in, both driven by how far stage 02 is open (h2)
      put(R.set1, { opacity: f2(1 - h2) }); put(R.set2, { opacity: f2(h2) });

      // ---- the rail
      put(R.rail, { height: px(rp.height) });
      const A = h1 + h2;
      const pin = [[0.50, 0.72], [0.54, 0.76], [0.58, 0.8], [0.60, 0.82], [0.62, 0.84]];
      for (let i = 0; i < 5; i++) {
        const P = R.pn[i], w = rp.w[i], av = sm(pin[i][0], pin[i][1], p);
        put(P.el, { left: px(rp.left[i]), width: px(w), height: px(rp.height), opacity: f2(av), transform: `translateY(${f2((1 - av) * 10)}px)` });
        if (i < 2) {
          const c = clamp((RAIL.D.w[0] - w) / (RAIL.D.w[0] - RAIL.H1.w[1]), 0, 1), e = clamp((w - RAIL.D.w[0]) / (RAIL.H1.w[0] - RAIL.D.w[0]), 0, 1);
          const m3 = (d, ee, cc) => d + e * (ee - d) + c * (cc - d);
          const g = i === 0 ? 43.1875 : 44.5625, by = i === 0 ? 214.25 : 215.625;
          const fs = m3(10.06, 10.45, 10.06);
          put(P.hl, { left: px(m3(11.5, 11.95, 11.5)), top: px(m3(8.625, 8.96, 8.625)), fontSize: px(fs), lineHeight: px(fs * 1.2863), opacity: f2(1 - sm(0, 0.4, c)) });
          const isz = m3(11.5, 11.95, 11.95), ipad = lerp(11.5, 11.95, e), ic = sm(0, 1, c);
          put(P.hi, { left: px(lerp(w - ipad - isz, (w - isz) / 2, ic)), top: px(m3(9.34, 9.71, 10.45)), transform: `scale(${f2(isz / 11.5 * 1000) / 1000})` });
          const sfs = m3(11.5, 11.95, 11.5);
          put(P.st, { left: px(m3(14.375, 14.94, 14.375)), top: px(m3(g, 45.36, g)), fontSize: px(sfs), lineHeight: px(sfs * 1.375), opacity: f2(1 - sm(0, 0.35, c)) });
          const nk = m3(46, 47.79, 20.91) / 46, nx = lerp(m3(11.5, 11.95, 11.5), (w - 55.34 * nk) / 2, ic);
          put(P.num, { left: "0px", top: "0px", transform: `translate(${f2(nx)}px,${f2(m3(g + 23.1875, 45.36 + 24.47, 29.87))}px) scale(${f2(nk * 10000) / 10000})` });
          const nfs = m3(14.38, 14.94, 14.38);
          const nameBox = { left: px(m3(11.5, 11.95, 11.5)), top: px(m3(g + 72.0625, 45.36 + 75.25, g + 72.0625)), width: px(m3(163.875, 113.51, 163.875)), fontSize: px(nfs), lineHeight: px(nfs * 1.4) };
          const cOut = 1 - sm(0, 0.35, c);
          if (i === 0) {
            put(P.nmD, { ...nameBox, opacity: f2((1 - sm(0, 0.4, e)) * cOut) });
            put(P.nmE, { left: px(11.95), top: px(45.36 + 75.25), width: px(113.51), fontSize: px(14.94), lineHeight: px(20.91), opacity: f2(sm(0.45, 0.9, e)) });
          } else put(P.nmD, { ...nameBox, opacity: f2(cOut) });
          const bs = m3(34.5, 25.76, 34.5);
          put(P.bt, { left: px(m3(11.5, 11.95, 11.5)), top: px(m3(by, 212.64, by)), width: px(bs), height: px(bs), opacity: f2(1 - sm(0, 0.3, c)) });
          put(P.bmax, { opacity: f2(1 - sm(0.1, 0.5, e)) }); put(P.bmin, { opacity: f2(sm(0.5, 0.9, e)) });
          put(P.ds, { left: px(128.45), top: px(45.36), opacity: f2(sm(0.55, 1, e)) });
        } else {
          const fs = lerp(20.13, 20.91, A), nk = fs / 46, isz = lerp(11.5, 11.95, A);
          put(P.hi, { left: px((w - isz) / 2), top: px(lerp(10.0625, 10.45, A)), transform: `scale(${f2(isz / 11.5 * 1000) / 1000})` });
          put(P.num, { left: "0px", top: "0px", transform: `translate(${f2((w - 55.34 * nk) / 2)}px,${f2(lerp(28.75, 29.87, A))}px) scale(${f2(nk * 10000) / 10000})` });
        }
      }

      // ---- the pointer (outside the card's transform; the arrow's tip is at (4,3) in its 22px box)
      put(R.cur, { opacity: f2(co), transform: `translate(${f2(pose.cx - 4)}px,${f2(pose.cy - 3)}px)` });
    }
    return { html, update, loopPose, railPose };
  }
  window.ExpansionPiece = { make, railPose, loopPose, INTRO_MS, CYCLE_MS, RAIL, UNION, ZOOM, CARD };
})();
