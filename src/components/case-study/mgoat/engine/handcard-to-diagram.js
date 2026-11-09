/* =========================================================================
   HAND CARD -> DIAGRAM MORPH (Figma 235:7773 "Anim-simplifiedExport" -> 208:6706 "Stage / Capabilities morph 2").
   One vector piece, update(body, k, t) = a PURE FUNCTION of scroll progress t (p = 0 .. 1 over the toDiagram window). It draws the 14 diagram cards (data from capabilities-data.js,
   the same rects, fills, strokes and the exported glyph outlines as the finished diagram, so the end state is identical to capabilities.js at p = 1) and moves each from a START on the hand card.

   WHERE EACH CARD STARTS (all measured from Figma, stage coordinates):
     blue column (7)   the hand card's six horizontal lines, y = 419.75 + [0.27, 34.85, 69.36, 103.87, 138.29, 172.9]. Each line, a 1px-high strip from x 169.4 to ~371, becomes a card:
                       it thickens to 47px, slides to the card's row, and widens/narrows to 197. The 7th blue card (the tall one) grows out of the left half-disc's centre.
     lilac column (7)  the six pills (lilac #EAD8F9, 34.5 x 17.3), parked where the loop leaves them (their first-frame positions on the left edge of the card), grow into six lilac cards;
                       the 7th lilac card grows out of the pulsing node (523, 506).
   Everything that is not a card (frame, lines, rings, hand, node) is the clean hand card image, which fades out (and the diagram's connector / loop / "76 more" box fade in with the cards).
   ========================================================================= */
(function () {
  const D = window.CAP_DATA;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const f2 = v => v.toFixed(2);
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const HEX = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = HEX(a), B = HEX(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join(""); };

  // ---- start shapes (stage coordinates). A START is a rect {x, y, w, h} plus the colours it starts in.
  const LINE_Y = [0.27, 34.85, 69.36, 103.87, 138.29, 172.9].map(v => 419.75 + v);
  const LINE_X0 = 169.4, LINE_W = 180;                                  // the six lines run x 169.4 -> ~351 (Figma 235:7778); 1px high
  const GREY = "#8D8D8D";
  // blue column, top to bottom: cards 0..5 come from the six lines in order, card 6 (the tall one) from the left half-disc
  // the lines start as hairlines (h 0.5, NO stroke: sw0 = 0) so they match the card image's own lines; the stroke only grows in as they thicken
  const LINE_H = 0.5;
  const BLUE_START = [...LINE_Y.map(y => ({ x: LINE_X0, y: y - LINE_H / 2, w: LINE_W, h: LINE_H, fill: GREY, stroke: GREY, sw0: 0 })),
                      { x: 153.2, y: 488.8, w: 34.5, h: 34.5, fill: "#BE95FF", stroke: "#BE95FF", sw0: 0.54 }];
  // lilac column: the pills' first-frame centres (their loop-start positions) -> see handcard-piece.js PILLS (base + size/2 + translate at 0%). 7th from the node.
  const PILL_C = [[187.0, 420.3], [188.0, 454.3], [187.4, 489.1], [187.3, 523.4], [187.4, 558.2], [187.8, 592.4]];
  const PW = 34.5, PH = 17.3;
  // the six pills start NEAR NON-EXISTENT (PILL_S of their size, about the parked pill's centre; the live pills are still running and fading above them) and grow as they travel
  const PILL_S = 0.1;
  const LILAC_START = [...PILL_C.map(c => ({ x: c[0] - PW * PILL_S / 2, y: c[1] - PH * PILL_S / 2, w: PW * PILL_S, h: PH * PILL_S, fill: "#EAD8F9", stroke: "#EAD8F9", sw0: 0 })),
                       { x: 506.9, y: 489.6, w: 32.2, h: 32.9, fill: "#BE95FF", stroke: "#BE95FF", sw0: 0.54 }];
  // lilac cards: delayed start, then a damped SPRING (zero start velocity, ~5% overshoot, settles exactly on 1). Position and size use it, colour / text use the plain 0..1 progress.
  const LS = 0.06, LST = 0.26, LD = 0.68;                                // lilac window: starts at p 0.06, stagger 0.26 over the six, each run 0.68 of the morph (the last ends at 1.0)
  const SK = 4.2, SW = 5.2, spr = u => 1 - Math.exp(-SK * u) * (Math.cos(SW * u) + (SK / SW) * Math.sin(SW * u));
  const SPR1 = spr(1), spring = u => (u <= 0 ? 0 : u >= 1 ? 1 : spr(u) / SPR1);

  function make({ t0, t1 }) {
    const cards = [...D.left.map(c => ({ ...c, side: "L" })), ...D.right.map(c => ({ ...c, side: "R" }))];
    cards.forEach(c => { c.start = (c.side === "L" ? BLUE_START : LILAC_START)[c.i]; });
    const BAR = { L: "#0F62FE", R: "#A56EFF" };
    const html =
      `<svg viewBox="0 0 720 1024" width="720" height="1024" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block" fill="none" stroke-linejoin="miter" stroke-miterlimit="10" aria-hidden="true">` +
      `<g data-k="diagram" opacity="0"><path d="${D.loopD}" stroke="${D.loopStroke}" stroke-width="1"/><path d="${D.dropD}" stroke="#000" stroke-width="1"/><path d="${D.stubD}" stroke="#000" stroke-width="1"/>` +
        `<circle cx="${D.redNode.c[0]}" cy="${D.redNode.c[1]}" r="${D.nodeR}" fill="${D.redNode.fill}" stroke="${D.redNode.stroke}"/><g>${D.box.svg}<rect x="${D.box.x - 3.5}" y="${D.box.y - 0.5}" width="4" height="${D.box.h + 1}" fill="#8D8D8D"/></g></g>` +
      cards.map(c => `<g data-card="${c.side}${c.i}"><rect data-r rx="0"/><rect data-bar width="4" height="${c.h + 1}" fill="${BAR[c.side]}" opacity="0"/><g data-t opacity="0">${c.content}</g></g>`).join("") +
      `</svg>`;
    let R = null;
    const bind = body => { R = { body, dia: body.querySelector('[data-k="diagram"]'), cards: cards.map(c => body.querySelector(`[data-card="${c.side}${c.i}"]`)) }; };

    function update(body, k, t) {
      if (!R || R.body !== body) bind(body);
      const p = clamp((t - t0) / (t1 - t0), 0, 1);
      // the hand card's frame, lines, rings, hand and node fade over the first 70% of the morph (the lines/pills they leave behind are the cards' own starts)
      R.dia.style.opacity = sm(0.55, 1.0, p);                            // loop, drop line, red node, "and 76 more" box arrive with the cards
      cards.forEach((c, n) => {
        const g = R.cards[n], r = g.querySelector("[data-r]"), bar = g.querySelector("[data-bar]"), tx = g.querySelector("[data-t]");
        // stagger: top-to-bottom, both columns together, over 30% of the window (each card's own run is 70%)
        const L = c.side === "L", s = c.start;
        const u = L ? ease(clamp((p - 0.30 * c.i / 6) / 0.70, 0, 1)) : clamp((p - LS - LST * c.i / 6) / LD, 0, 1);   // u: plain 0..1 (colour, text, bar)
        const e = L ? u : spring(u);                                                                                    // e: geometry (lilac springs and overshoots a little)
        const x = lerp(s.x, c.x, e), y = lerp(s.y, c.y, e), w = lerp(s.w, c.w, e), h = lerp(s.h, c.h, e);
        r.setAttribute("x", f2(x)); r.setAttribute("y", f2(y)); r.setAttribute("width", f2(w)); r.setAttribute("height", f2(h));
        r.setAttribute("fill", mix(s.fill, c.fill, u)); r.setAttribute("stroke", mix(s.stroke, c.stroke, u)); r.setAttribute("stroke-width", f2(lerp(s.sw0, 1, u)));
        r.setAttribute("rx", f2(Math.max(0, lerp(Math.min(s.h, s.w) / 2, 0, e))));
        bar.setAttribute("x", f2(c.x - 0.5)); bar.setAttribute("y", f2(c.y - 0.5)); bar.setAttribute("opacity", f2(sm(0.8, 1, u)));
        tx.setAttribute("opacity", L ? f2(sm(0.58 + 0.025 * c.i, 0.70 + 0.025 * c.i, p)) : f2(sm(0.72, 0.96, u)));
        // blue lines are there from the start (they sit on the card image's own lines). The six lilac pills grow out of nothing; the 7th lilac fades in over the pulsing node.
        g.style.opacity = L && c.i < 6 ? 1 : (c.i < 6 ? sm(0, 0.3, u) : sm(0.0, 0.14, p));
      });
    }
    return { html, update };
  }
  window.HandcardToDiagram = { make };
})();
