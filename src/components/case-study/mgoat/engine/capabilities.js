/* =========================================================================
   CAPABILITIES MORPH: illustration (Figma 90:12696) -> diagram (Figma 90:12148), then diagram -> layers hand-off to v1.
   One HTML piece holding one SVG. update(body, k, t) is a PURE FUNCTION of scroll progress t, so scrolling backward plays it in reverse.
   Data comes from capabilities-data.js (generated from the Figma SVG exports by tools/build_capabilities.py), never hand-drawn.

   Morph progress p (0..1) is NOT linear in scroll: it runs m0..h0 (0 -> pA), CREEPS h0..h1 (pA -> pB, slowly, while the "stats" text is read), then runs h1..m1
   (pB -> 1). The three runs are cubic Hermite pieces that share the creep's slope at h0 and h1, so the speed never drops to zero mid-morph (no stop-start); it only
   eases from rest at m0 and into rest at m1. Pass h0 = h1 = m0 and pA = pB = 0 for a single eased run.
   Morph phases (p = 0..1 across the morph; the percentages are the author's brief):
     0-20%   fade the small details (windows, stems, wheat, leaf ridges, prongs, capsule marks) and every node but one
     15-55%  the outer arc stretches into the diagram's loop; the other two arcs converge onto it and fade; the kept node travels to the
             bottom of the left connector and turns red
     25-70%  blue shapes -> left column, lilac shapes -> right column, curves flatten to rectangles (point-for-point polygon morph);
             cards without a seed grow out of the nearest seed; top-to-bottom stagger, both columns together
     58-85%  card icons + text fade in over the finished rectangles (the exported glyph outlines, placed at their final position: never stretched)
     85-100% the "and 76 more..." box and its connector appear
   Deviation from the brief, on purpose: the pale architecture (buildings, solar panel) fades over 18-60%, not 60-90%, because it sits exactly under
   the forming left column. Nothing of the illustration is left to fade at 60-90%.

   Bridge, cue only (qb = 0..1 across b0..b1, the first part of the bridge beat): lines, bars, text and the red node fade, leaving 14 plain cards.
   The 3D part of the bridge (tilt, lift, merge into 7 layers, v1 landing) is NOT drawn here: at b1 scene-data.js swaps these 14 SVG cards for 14 engine
   slab pieces at the same rects and colours (make() returns their geometry as `cards`), so they can live in the same 3D world as the layers and v1.
   ========================================================================= */
(function () {
  const D = window.CAP_DATA;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const lerp = (a, b, u) => a + (b - a) * u;
  const HEX = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = HEX(a), B = HEX(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join(""); };
  const f2 = v => v.toFixed(2);
  const ART = `translate(${D.artOffset[0]} ${D.artOffset[1]})`;
  const BAR = { L: "#0F62FE", R: "#A56EFF" };

  function rectPts(x, y, w, h, n) {                         // same walk as the generator's rect_pts, so point i of a seed lands on point i of the rectangle
    const per = n / 4, o = [];
    for (let k = 0; k < per; k++) o.push(x + w * k / per, y);
    for (let k = 0; k < per; k++) o.push(x + w, y + h * k / per);
    for (let k = 0; k < per; k++) o.push(x + w - w * k / per, y + h);
    for (let k = 0; k < per; k++) o.push(x, y + h - h * k / per);
    return o;
  }
  function polyD(a, b, u) {
    let s = "";
    for (let i = 0; i < a.length; i += 2) s += (i ? "L" : "M") + f2(lerp(a[i], b[i], u)) + " " + f2(lerp(a[i + 1], b[i + 1], u));
    return s + "Z";
  }
  const rectD = (x, y, w, h) => `M${f2(x)} ${f2(y)}H${f2(x + w)}V${f2(y + h)}H${f2(x)}Z`;
  const lineD = (a, b, u) => {
    let s = "";
    for (let i = 0; i < a.length; i += 2) s += (i ? "L" : "M") + f2(lerp(a[i], b[i], u)) + " " + f2(lerp(a[i + 1], b[i + 1], u));
    return s;
  };

  // x extent (min, max) of an absolute SVG path made of M/L/H/V/C/Z, in the path's own coordinates
  function bx(d) {
    const t = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/g) || []; let i = 0, c, x = 0, lo = Infinity, hi = -Infinity;
    const put = v => { lo = Math.min(lo, v); hi = Math.max(hi, v); };
    while (i < t.length) {
      if (/[A-Z]/.test(t[i])) c = t[i++];
      if (c === "Z") continue;
      if (c === "V") { i++; continue; }
      if (c === "H") { x = +t[i++]; put(x); continue; }
      const n = c === "C" ? 3 : 1; for (let k = 0; k < n; k++) { x = +t[i++]; i++; put(x); }
    }
    return [lo, hi];
  }
  const LEAF_SEEDS = new Set(["Vector_3", "Vector_31"]);                              // the big blue leaf and the middle lilac tree leaf: drawn by the ring morph until `th`
  const LEAF_DET = new Set([2, 17]);                                                 // their crease and vein

  function make({ m0, m1, b0, b1, h0 = m0, h1 = m0, pA = 0, pB = 0, i0 = 0, i1 = 0, th = -1 }) {
    // i0..i1 = the intro draw-in window (the rest of the illustration fades in left to right); th = the hand-off: from th on, the illustration's own leaves replace the intro pieces' (identical) leaves.
    // With the defaults (no intro) everything is simply visible, as before.
    const cards = [...D.left.map(c => ({ ...c, side: "L" })), ...D.right.map(c => ({ ...c, side: "R" }))];
    const col = { L: cards.filter(c => c.side === "L"), R: cards.filter(c => c.side === "R") };
    cards.forEach(c => {
      c.n = cards.indexOf(c);
      c.cx = c.x + c.w / 2; c.cy = c.y + c.h / 2;
      if (c.seed) {
        c.rp = rectPts(c.x, c.y, c.w, c.h, D.N_SHAPE);
        let sx = 0, sy = 0; for (let i = 0; i < c.seed.length; i += 2) { sx += c.seed[i]; sy += c.seed[i + 1]; }
        c.sc = [sx / (c.seed.length / 2), sy / (c.seed.length / 2)];
      }
    });
    const retained = D.nodes.find(n => n.retained), others = D.nodes.filter(n => !n.retained);
    const X0 = 36, XW = 624, ART_X = D.artOffset[0];                         // the illustration spans x 36..660 on the stage
    const mid = d => { const [a, b] = bx(d); return (a + b) / 2 + ART_X; };
    const xs = { keep: D.keep.map(r => mid(r.d)), details: D.details.map(r => mid(r.d)), others: others.map(n => n.c[0]), top: retained.c[0], arcs: 432,
                 cards: cards.map(c => c.sc ? c.sc[0] : c.cx) };
    const isLeaf = c => LEAF_SEEDS.has(c.seedId);

    const html =
      `<svg viewBox="0 0 720 1024" width="720" height="1024" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
      `<g transform="${ART}" data-k="keep">${D.keep.map(r => `<path d="${r.d}" fill="${r.fill}" stroke="${r.stroke}" stroke-miterlimit="10"/>`).join("")}</g>` +
      `<g transform="${ART}">${D.details.map((r, i) => `<path data-d="${i}" d="${r.d}" fill="${r.fill}" stroke="${r.stroke}" stroke-miterlimit="10"/>`).join("")}</g>` +
      `<g data-k="arcs">${D.arcs.map((a, i) => `<path data-a="${i}" stroke="${a.stroke}"/>`).join("")}</g>` +
      `<g>${others.map((n, i) => `<circle data-o="${i}" cx="${n.c[0]}" cy="${n.c[1]}" r="${D.nodeR}" fill="${n.fill}" stroke="${n.stroke}"/>`).join("")}</g>` +
      `<g data-k="cards" stroke-linejoin="miter" stroke-miterlimit="10">${cards.map(c => `<path data-c="${c.n}"/>`).join("")}</g>` +
      `<g data-k="top">` +
        cards.map(c => `<rect data-b="${c.n}" width="4" height="${c.h + 1}" fill="${BAR[c.side]}" opacity="0"/>`).join("") +
        cards.map(c => `<g data-t="${c.n}" opacity="0">${c.content}</g>`).join("") +
        `<path data-k="drop" d="${D.dropD}" stroke="#000" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>` +
        `<path data-k="stub" d="${D.stubD}" stroke="#000" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>` +
        `<circle data-k="node" r="${D.nodeR}" stroke-linejoin="round"/>` +
        `<g data-k="box" opacity="0">${D.box.svg}<rect x="${D.box.x - 3.5}" y="${D.box.y - 0.5}" width="4" height="${D.box.h + 1}" fill="#8D8D8D"/></g>` +
      `</g></svg>`;

    let R = null;
    const bind = body => {
      const q = s => body.querySelector(s), qa = s => [...body.querySelectorAll(s)];
      R = { keep: q('[data-k="keep"]'), arcsG: q('[data-k="arcs"]'), cardsG: q('[data-k="cards"]'), top: q('[data-k="top"]'),
            details: qa("[data-d]"), arcs: qa("[data-a]"), others: qa("[data-o]"), cards: qa("[data-c]"), bars: qa("[data-b]"), texts: qa("[data-t]"),
            drop: q('[data-k="drop"]'), stub: q('[data-k="stub"]'), node: q('[data-k="node"]'), box: q('[data-k="box"]') };
      R.body = body;
    };

    // morph progress as a function of scroll (see header): Hermite pieces joined with equal slope at the creep's ends
    const hermite = (x0, x1, y0, y1, s0, s1, x) => { const h = x1 - x0, u = clamp((x - x0) / h, 0, 1), u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * s0 + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * s1; };
    const creep = h1 > h0 ? (pB - pA) / (h1 - h0) : 0;
    const pAt = t => !(h1 > h0) ? sm(m0, m1, t)
      : t <= h0 ? hermite(m0, h0, 0, pA, 0, creep, t) : t <= h1 ? pA + creep * (t - h0) : hermite(h1, m1, pB, 1, creep, 0, t);

    function update(body, k, t) {
      if (!R || R.body !== body) bind(body);
      const p = pAt(t);
      const qb = clamp((t - b0) / (b1 - b0), 0, 1);
      // intro draw-in: each element fades over 55% of the window, starting later the further right it sits (stagger = 45% of the window)
      const Wn = i1 - i0, stag = 0.45 * Wn;
      const hand = Array.isArray(th) ? sm(th[0], th[1], t) : (th < 0 || t >= th) ? 1 : 0;
      const ri = x => { if (!(Wn > 0)) return 1; const a = i0 + stag * clamp((x - X0) / XW, 0, 1); return sm(a, a + Wn - stag, t); };
      // ---- phase 1 (0-20%): details and surplus nodes fade; the pale architecture fades 18-60%
      const nD = R.details.length;
      R.details.forEach((el, i) => { const s = (i / nD) * 0.08; el.style.opacity = (1 - sm(s, s + 0.12, p)) * (LEAF_DET.has(i) ? hand : ri(xs.details[i])); });
      R.keep.style.opacity = 1 - sm(0.18, 0.60, p);
      [...R.keep.children].forEach((el, i) => { el.style.opacity = ri(xs.keep[i]); });
      R.others.forEach((el, i) => { const s = i * 0.012; el.style.opacity = (1 - sm(0.02 + s, 0.20 + s, p)) * hand; });      // the ring piece draws these 6 nodes until the hand-off (th), then they take over at the same spots
      // ---- phase 2 (15-55%): arcs -> loop
      const ua = ease(clamp((p - 0.15) / 0.40, 0, 1));
      R.arcs.forEach((el, i) => {
        const a = D.arcs[i];
        el.setAttribute("d", (i === 0 && ua >= 1) ? D.loopD : lineD(a.from_, D.loop, ua));
        el.setAttribute("stroke", i === 0 ? mix(a.stroke, D.loopStroke, ua) : a.stroke);
        el.style.opacity = i === 0 ? 1 : 1 - sm(0.40, 0.55, p);
      });
      // kept node: travels to the bottom of the left connector and turns red
      const rn = D.redNode;
      R.node.style.opacity = hand;
      R.node.setAttribute("cx", f2(lerp(retained.c[0], rn.c[0], ua))); R.node.setAttribute("cy", f2(lerp(retained.c[1], rn.c[1], ua)));
      R.node.setAttribute("fill", mix(retained.fill, rn.fill, ua)); R.node.setAttribute("stroke", mix(retained.stroke, rn.stroke, ua));
      // ---- phase 3 (25-70%): shapes -> cards, stagger by row, both columns together
      const U = c => ease(clamp((p - (0.25 + 0.02 * c.i)) / 0.33, 0, 1));
      cards.forEach(c => {
        const el = R.cards[c.n], u = U(c);
        let d, fill, stroke, op = 1, tr = null;
        if (c.seed) {
          if (u <= 0) { d = c.seedD; tr = ART; fill = c.seedFill; stroke = c.seedStroke; }                 // the exact illustration path until the morph starts
          else if (u < 1) { d = polyD(c.seed, c.rp, u); fill = mix(c.seedFill, c.fill, u); stroke = mix(c.seedStroke, c.stroke, u); }
          else { d = rectD(c.x, c.y, c.w, c.h); fill = c.fill; stroke = c.stroke; }
        } else {                                                          // no seed: grows out of the nearest seed, which is itself moving to its card
          const nc = col[c.side][c.near], un = U(nc), sx = lerp(nc.sc[0], nc.cx, un), sy = lerp(nc.sc[1], nc.cy, un);
          const cx = lerp(sx, c.cx, u), cy = lerp(sy, c.cy, u), w = lerp(8, c.w, u), h = lerp(8, c.h, u);
          op = clamp((p - (0.25 + 0.02 * c.i)) / 0.10, 0, 1);
          d = rectD(cx - w / 2, cy - h / 2, w, h); fill = mix(c.seedFill, c.fill, u); stroke = mix(c.seedStroke, c.stroke, u);
        }
        el.setAttribute("d", d); el.setAttribute("fill", fill); el.setAttribute("stroke", stroke);
        if (tr) el.setAttribute("transform", tr); else el.removeAttribute("transform");
        el.style.opacity = op * (isLeaf(c) ? hand : ri(xs.cards[c.n]));
        // accent bar + text only once the card is (nearly) in place
        const i = c.i;
        R.bars[c.n].setAttribute("x", f2(c.x - 0.5)); R.bars[c.n].setAttribute("y", f2(c.y - 0.5));
        R.bars[c.n].style.opacity = sm(0.80, 1, u);
        R.texts[c.n].style.opacity = sm(0.58 + 0.025 * i, 0.70 + 0.025 * i, p);
      });
      // ---- phase 5 (85-100%): connector stub (after the last left card lands), drop line, "and 76 more..." box
      R.stub.setAttribute("stroke-dashoffset", String(1 - sm(0.68, 0.78, p)));
      R.drop.setAttribute("stroke-dashoffset", String(1 - sm(0.85, 0.95, p)));
      R.box.style.opacity = sm(0.90, 1.0, p);
      // ---- bridge cue: lines, bars, text, the red node and the "76 more" box fade, leaving plain cards (the slabs take over at b1)
      const fadeTop = 1 - sm(0, 1, qb);
      R.top.style.opacity = fadeTop * ri(xs.top); R.arcsG.style.opacity = fadeTop * ri(xs.arcs);
    }
    return { html, update, progress: pAt, cards: cards.map(c => ({ side: c.side, i: c.i, x: c.x, y: c.y, w: c.w, h: c.h, fill: c.fill, stroke: c.stroke })) };
  }
  window.CapabilitiesPiece = { make };
})();
