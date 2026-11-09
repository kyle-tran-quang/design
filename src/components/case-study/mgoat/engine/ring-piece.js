/* =========================================================================
   RING PIECE: the opening graphic (Figma 208:5854 > Graphic 235:7266, 545 x 543) drawn live as SVG, so it can (1) draw itself in, (2) dim to 50% while the dashboard
   comes in, and (3) morph into the city illustration (capabilities.js, p = 0). update(body, k, t) is a PURE FUNCTION of t, so scrolling backward plays in reverse.

   Geometry is copied from the Figma SVG export of 235:7266 (use_figma exportAsync), never redrawn:
     white circle  Ellipse 1       centre (271.89, 274.5) r 193.5
     lilac leaf    Vector / Vector_2   (the big leaf's crease is Vector_2)
     blue leaf     Vector_3 / Vector_4
     13 dots       Ellipse 2 ... (12)  r 23.5, alternating blue #D0E2FF / lilac #E8DAFF, stroke #393939
   The piece sits at (88.6, 237) on the 720 x 1024 stage, so the SVG below uses the stage's own coordinates (ring-local + OX/OY).

   Phases (windows come from TIMING.ring in story.js, as fractions of the whole scene t):
     draw      dots pop in one by one round the ring (stagger), the white circle fades up, then each leaf outline is drawn (stroke-dashoffset) and its fill follows
     dim       the whole graphic eases to 50% opacity (the dashboard arrives on top)
     toCity    the blue leaf grows to the city's big blue leaf, the lilac leaf to the first tree leaf, the 13 dots travel to the city's 6 nodes (7 merge and fade),
               the white circle fades. At the end the piece hands over to the city piece (identical positions), which is why the two never double up.
   ========================================================================= */
(function () {
  const OX = 88.6, OY = 237;                                   // ring-local -> stage
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const f2 = v => v.toFixed(2);
  const HEX = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = HEX(a), B = HEX(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join(""); };

  const LILAC_D = "M332.63 382.129L289.888 357.452C233.275 324.767 213.888 252.378 246.582 195.752L271.265 153L314.007 177.677C370.619 210.362 390.006 282.751 357.313 339.377L332.63 382.129Z";
  const LILAC_CREASE = "M332.63 382.129L271.265 153";
  const BLUE_D = "M332.098 381.749H282.744C217.374 381.749 164.39 328.752 164.39 263.366V214H213.744C279.114 214 332.098 266.997 332.098 332.383V381.749Z";
  const BLUE_CREASE = "M332.098 381.749L164.39 214";
  const CIRCLE = { cx: 271.89, cy: 274.5, r: 193.5 };
  const DOTS = [[278.39, 24, "b"], [394.059, 55.7139, "l"], [481.74, 137.549, "b"], [521.347, 250.758, "l"], [503.807, 369.406, "b"], [433.137, 466.312, "l"], [325.528, 519.276, "b"],
                [205.63, 516.166, "l"], [100.913, 457.691, "b"], [35.3636, 357.251, "l"], [24, 237.853, "b"], [69.425, 126.851, "l"], [161.232, 49.6724, "b"]];
  const FILL = { b: "#D0E2FF", l: "#E8DAFF" };
  const R = 23.5, DOT_STROKE = "#393939", LEAF_STROKE = "#022D0D";


  // sample a closed path to n points by arc length, using the browser's own geometry (no hand-written parser). Both outlines are sampled from the SAME start convention
  // (the path's first point), then the second is rotated/reversed to the best match, so the morph does not twist.
  function samplePath(d, n) {
    const ns = "http://www.w3.org/2000/svg", path = document.createElementNS(ns, "path"); path.setAttribute("d", d);
    const L = path.getTotalLength(), out = [];
    for (let i = 0; i < n; i++) { const pt = path.getPointAtLength(L * i / n); out.push([pt.x, pt.y]); }
    return out;
  }
  function bestAlign(src, dst) {                           // rotate / reverse dst so that point i of dst is nearest to point i of src (sum of squared distances)
    const n = src.length; let best = null;
    for (const rev of [false, true]) {
      const d = rev ? dst.slice().reverse() : dst;
      for (let sh = 0; sh < n; sh++) {
        let c = 0; for (let i = 0; i < n; i++) { const a = src[i], b = d[(i + sh) % n]; c += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; }
        if (!best || c < best.c) best = { c, pts: d.map((_, i) => d[(i + sh) % n]) };
      }
    }
    return best.pts;
  }
  const polyD = pts => "M" + pts.map(p => f2(p[0]) + " " + f2(p[1])).join("L") + "Z";

  // ---- the city (capabilities.js, p = 0) targets, in STAGE coordinates (measured from capabilities-data.js)
  //   big blue leaf: bbox (36.6, 340.7) 167.7 x 167.8 | first tree leaf (lilac): bbox (448.3, 286.8) 57.9 x 98.4 | six nodes r 7.415
  const CITY = {
    blue:  { x: 36.6, y: 340.7, w: 167.7, h: 167.8 },
    lilac: { x: 448.3, y: 286.8, w: 57.9, h: 98.4 },
    nodes: [[247.1, 554.1], [431.4, 699.2], [507.6, 564.7], [364.5, 577.4], [315.5, 706.9], [604.2, 584.8]],
    nodeR: 7.415
  };
  // which ring dot goes to which city node (nearest first, then the rest merge into the nearest node and fade)
  const DEST = DOTS.map(([x, y]) => { const sx = x + OX, sy = y + OY; let best = 0, bd = 1e9; CITY.nodes.forEach((n, i) => { const d = (n[0] - sx) ** 2 + (n[1] - sy) ** 2; if (d < bd) { bd = d; best = i; } }); return best; });
  // the first dot to claim each node is kept (it lands and stays); the others fade as they arrive
  const KEEP = new Set(); { const seen = new Set(); DEST.forEach((n, i) => { if (!seen.has(n)) { seen.add(n); KEEP.add(i); } }); }

  const CITY_LILAC_D = "M441.24 99.2835L455.759 84.7972C474.985 65.6139 474.985 34.5084 455.759 15.3251L441.24 0.838745L426.721 15.3251C407.495 34.5084 407.495 65.6139 426.721 84.7972L441.24 99.2835Z";   // capabilities-data.js, Vector_31 (in art coordinates)
  const ART = [36, 286];
  const N = 96;
  let LILAC_FROM = null, LILAC_TO = null;               // ring-local points -> stage points, built lazily (needs the DOM)
  const lilacPts = () => {
    if (LILAC_FROM) return;
    LILAC_FROM = samplePath(LILAC_D, N).map(p => [p[0] + OX, p[1] + OY]);                         // ring leaf, in stage coordinates
    LILAC_TO = bestAlign(LILAC_FROM, samplePath(CITY_LILAC_D, N).map(p => [p[0] + ART[0], p[1] + ART[1]]));   // city leaf, in stage coordinates
  };

  // leaf bboxes in ring-local coordinates (from the paths above)
  const BLUE_BB = { x: 164.39, y: 214, w: 167.708, h: 167.749 }, LILAC_BB = { x: 213.88, y: 153, w: 156.13, h: 229.13 };

  const BLOOM = u => (window.MGPhysics ? window.MGPhysics.ease("back.out(1.3)")(u) : sm(0, 1, u));       // physics.js (GSAP), with the old smoothstep as a fallback
  const DOT_EASE = u => (window.MGPhysics ? window.MGPhysics.ease("power2.inOut")(u) : sm(0, 1, u));

  function make({ drawAt, dim, toCity, noCircle = false }) {        // drawAt() -> 0..1 (INTRO time, see index.html); dim and toCity are [t0, t1] pairs, as fractions of the scene
    const dotEls = DOTS.map(([x, y, c], i) => `<circle data-dot="${i}" cx="${f2(x + OX)}" cy="${f2(y + OY)}" r="${R}" fill="${FILL[c]}" stroke="${DOT_STROKE}"/>`).join("");
    const html =
      `<svg viewBox="0 0 720 1024" width="720" height="1024" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
      `<circle data-k="circle" cx="${f2(CIRCLE.cx + OX)}" cy="${f2(CIRCLE.cy + OY)}" r="${CIRCLE.r}" fill="#fff"/>` +
      `<g data-k="lilac" transform="translate(${OX} ${OY})"><path data-p="fill" d="${LILAC_D}" fill="#E8DAFF"/><path data-p="line" d="${LILAC_D}" stroke="${LEAF_STROKE}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>` +
        `<path data-p="crease" d="${LILAC_CREASE}" stroke="${LEAF_STROKE}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></g>` +
      `<g data-k="blue" transform="translate(${OX} ${OY})"><path data-p="fill" d="${BLUE_D}" fill="#D0E2FF"/><path data-p="line" d="${BLUE_D}" stroke="${LEAF_STROKE}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>` +
        `<path data-p="crease" d="${BLUE_CREASE}" stroke="${LEAF_STROKE}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></g>` +
      dotEls + `</svg>`;

    let Rf = null;
    const bind = body => {
      const q = s => body.querySelector(s), qa = s => [...body.querySelectorAll(s)];
      Rf = { body, circle: q('[data-k="circle"]'), lilac: q('[data-k="lilac"]'), blue: q('[data-k="blue"]'), dots: qa("[data-dot]") };
      ["lilac", "blue"].forEach(k => { Rf[k + "P"] = { fill: Rf[k].querySelector('[data-p="fill"]'), line: Rf[k].querySelector('[data-p="line"]'), crease: Rf[k].querySelector('[data-p="crease"]') }; });
    };

    // a leaf grows from its ring bbox to a city bbox: translate + scale about the bbox top-left (the city leaves are the same shapes, so the outline stays true)
    const fit = (g, from, to, u) => {
      const sx = lerp(1, to.w / from.w, u), sy = lerp(1, to.h / from.h, u);
      const tx = lerp(OX, to.x - from.x * (to.w / from.w), u), ty = lerp(OY, to.y - from.y * (to.h / from.h), u);
      g.setAttribute("transform", `translate(${f2(tx)} ${f2(ty)}) scale(${f2(sx * 1000) / 1000} ${f2(sy * 1000) / 1000})`);
      // keep the stroke 1px on screen while scaling
      g.querySelectorAll('[data-p="line"],[data-p="crease"]').forEach(p => p.setAttribute("stroke-width", f2(1 / ((sx + sy) / 2))));
    };

    function update(body, k, t) {
      if (!Rf || Rf.body !== body) bind(body);
      const dp = drawAt();                                   // 0..1; 1 once the hero has dissolved into the stage
      const [d0, dn] = [0, 1], tt = dp;                      // the draw is a function of dp only (t is not involved)
      // ---- draw: dots pop in staggered (first 55% of the window), the circle fades up (20-60%), leaves draw (45-100%): lilac first, then blue
      Rf.dots.forEach((el, i) => {
        const a = dn * 0.55 * (i / (DOTS.length - 1)), b = a + dn * 0.30, u = sm(a, b, tt);
        el.style.opacity = u; el.setAttribute("r", f2(R * (0.4 + 0.6 * u)));
      });
      Rf.circle.style.opacity = noCircle ? 0 : sm(dn * 0.20, dn * 0.60, tt);
      const draws = [["lilac", 0.45, 0.80], ["blue", 0.60, 1.0]];
      draws.forEach(([name, a, b]) => {
        const u = sm(dn * a, dn * b, tt), P = Rf[name + "P"];
        P.line.setAttribute("stroke-dashoffset", f2(1 - u)); P.crease.setAttribute("stroke-dashoffset", f2(1 - clamp((u - 0.4) / 0.6, 0, 1)));
        P.fill.style.opacity = sm(0.55, 1, u);
      });

      // ---- toCity: leaves grow to the city's leaves, dots travel to the nodes (7 merge and fade), the circle fades
      // m = the plain smoothstep window (drives fades, which must never overshoot); mp = the same window through a spring ease (drives the leaves' size, so they bloom past
      // their city size and settle back; physics.js clamps the ends so mp = 0 / 1 exactly where m is, and the hand-off to the city piece lands on identical pixels).
      const lin = clamp((t - toCity[0]) / (toCity[1] - toCity[0]), 0, 1);      // raw window progress: the dots' flight and settle run on it, so they keep moving to the END of the window (smoothstep would idle there)
      const m = sm(toCity[0], toCity[1], t), mp = BLOOM(lin);
      fit(Rf.blue, BLUE_BB, CITY.blue, mp);
      lilacPts();
      if (m <= 0) { Rf.lilac.setAttribute("transform", `translate(${OX} ${OY})`); Rf.lilacP.fill.setAttribute("d", LILAC_D); Rf.lilacP.line.setAttribute("d", LILAC_D); Rf.lilacP.line.setAttribute("stroke-width", "1"); }
      else {                                                  // from here the leaf is a polygon in STAGE coordinates (no group transform), morphing to the city's outline
        const pts = LILAC_FROM.map((a, i) => [lerp(a[0], LILAC_TO[i][0], mp) - OX, lerp(a[1], LILAC_TO[i][1], mp) - OY]), d = polyD(pts);     // ring-local, like the crease
        Rf.lilac.setAttribute("transform", `translate(${OX} ${OY})`); Rf.lilacP.fill.setAttribute("d", d); Rf.lilacP.line.setAttribute("d", d);
        Rf.lilacP.line.setAttribute("stroke-width", "1");
      }
      Rf.lilacP.crease.style.opacity = 1 - sm(0, 0.35, m);                      // the ring leaf's crease has no counterpart in the city leaf: it fades as the shape changes
      Rf.circle.style.opacity = noCircle ? 0 : sm(dn * 0.20, dn * 0.60, tt) * (1 - sm(0, 0.45, m));
      Rf.dots.forEach((el, i) => {
        const [x, y, c] = DOTS[i], n = CITY.nodes[DEST[i]], sx = x + OX, sy = y + OY;
        // each dot flies on an ARC (a sideways bulge that is 0 at both ends, alternating side), eased power2.inOut so it accelerates, cruises and decelerates into its node.
        // It lands at lin = 0.8; the last 20% is a damped squash-settle on the kept dots (a wobble in radius that is exactly 0 at lin = 1). With the window stretched to 162-226vh
        // the landing is ~213vh and the settle runs 213-226, i.e. across the 'opportunity' anchor (220), so the stage is still alive as that sentence reaches the centre.
        const a0 = 0.05 + 0.02 * (i % 5), v = clamp((lin - a0) / (0.8 - a0), 0, 1), u = DOT_EASE(v);
        const dx = n[0] - sx, dy = n[1] - sy, len = Math.hypot(dx, dy) || 1, arc = Math.sin(Math.PI * v) * len * 0.16 * (i % 2 ? 1 : -1);
        el.setAttribute("cx", f2(lerp(sx, n[0], u) - dy / len * arc)); el.setAttribute("cy", f2(lerp(sy, n[1], u) + dx / len * arc));
        const base = sm(dn * 0.55 * (i / (DOTS.length - 1)), dn * 0.55 * (i / (DOTS.length - 1)) + dn * 0.30, tt);
        const k = clamp((lin - 0.8) / 0.2, 0, 1), wob = KEEP.has(i) ? 1 + 0.38 * Math.sin(k * Math.PI * 3) * (1 - k) : 1;
        el.setAttribute("r", f2(lerp(R * (0.4 + 0.6 * base), CITY.nodeR, u) * wob));
        el.style.opacity = base * (KEEP.has(i) ? 1 : 1 - sm(0.55, 1, m));
        el.setAttribute("fill", c === "b" ? mix(FILL.b, "#E8DAFF", u) : FILL.l);       // the city's nodes are all lilac
      });

      // ---- dim to 50% as the dashboard arrives, back to full as it morphs into the city (the city is full strength)
      const dimU = sm(dim[0], dim[1], t) * 0.5, back = sm(toCity[0], toCity[1], t);
      body.style.opacity = 1 - dimU * (1 - back);
    }
    return { html, update, DEST: DEST.slice(), KEEP: [...KEEP] };
  }
  window.RingPiece = { make };
})();
