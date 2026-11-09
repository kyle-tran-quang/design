/* =========================================================================
   STAGE F SLABS: the "// Maturity pathways" card (Figma 208:9517 > 333:6551) as live-HTML pieces, one per part that later becomes a part of the window (shell, title, APM band, FSM band,
   the three dark cells), plus two pieces that have no card part (left rail, product header) and only exist from the assembly on. The same pieces are the card, the blueprint's slabs and
   the window's layers, so nothing is swapped when the card tilts and nothing is drawn twice.

   Each piece = a face (fill + 1 px outline: the blueprint look, and the window layer's colour) and a real layer on top (the card's strips, label, title). update(body, k, t) is a PURE
   FUNCTION of scroll progress: no timers, no clock, no CSS transitions, no state between calls (refs live ON the body element, body.__sfc). Scrolling backward plays it in reverse.

   API    StagefCard.make(spec, { vh, T, K }) -> { html, update(body, k, t) }
          StagefCard.state(spec, v, T, K)      -> the numeric pose at local vh v (pure)
   spec   { i (order), cardRect | null, real:{fill,stroke}, bp:{fill,stroke}, win:{fill,stroke} (rgba arrays),
            flip (shell only: the back face of the card flip), block (0..4: wipe-open index), wipeAt (vh: wipe start of a non-block piece), fall (0..2: tips off),
            fresh (no card part: fades in during the assembly), title, strips, border, label, lx, ly, ink, radius }

   WHAT MOVES (windows in stagef-data.js)
     flip      shell only: rotateY(theta - 180) about the flip axis; visible once theta >= 90 (stage-f.js rotates Stage E's card as the front face)
     expand    blocks wipe open left to right (clip-path), staggered;  labels  wipe in left to right
     tilt      the real layer fades and the face goes from the card colour to the blueprint tint
     assemble  the face goes from the blueprint tint to the window colour as the piece travels (piece keys: rect + z, in stage-f.js); the dark cells fade while they fall
     exit      the window colour goes back to the blueprint tint as the piece lifts; the slab is visible under the fading live window
   ========================================================================= */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const win = (v, w) => clamp((v - w[0]) / (w[1] - w[0]), 0, 1);
  const cubic = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const sine = u => .5 - .5 * Math.cos(Math.PI * u);
  const smooth = u => u * u * (3 - 2 * u);
  const f3 = v => String(Math.round(v * 1000) / 1000);
  const mixc = (a, b, u) => a.map((x, i) => lerp(x, b[i], u));
  const rgba = c => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${f3(c[3])})`;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const PERSPECTIVE = 1400;                 // px; Stage E's front face uses the same value (stage-f.js)
  const CENTRE = [360, 512];                // the flip axis in stage px: the stage centre = the centre of the white card (105 + 255, 217 + 295), 0.47 px from Stage E's card centre

  function state(spec, v, T, K) {
    const th = 180 * cubic(win(v, T.flip));
    const a0 = T.layers[0] + K.layerStep * spec.i, a1 = a0 + K.layerLen;
    const x0 = T.exit[0] + 4 + K.exitStep * spec.i, x1 = x0 + K.exitLen;
    // ---- face colours: card -> blueprint (tilt) -> window (assemble) -> blueprint (exit)
    const uBp = cubic(win(v, [T.tilt[0], T.tilt[0] + 24])), uDrop = cubic(win(v, [a0, a1])), uX = cubic(win(v, [x0, x1]));
    let fill, stroke;
    if (v < a0) { fill = mixc(spec.real.fill, spec.bp.fill, uBp); stroke = mixc(spec.real.stroke, spec.bp.stroke, uBp); }
    else if (v < T.exit[0]) { fill = mixc(spec.bp.fill, spec.win.fill, uDrop); stroke = mixc(spec.bp.stroke, spec.win.stroke, uDrop); }
    else { fill = mixc(spec.win.fill, spec.bp.fill, uX); stroke = mixc(spec.win.stroke, spec.bp.stroke, uX); }
    // ---- opacity of the whole piece
    let a;
    if (spec.fall !== null && spec.fall !== undefined) {
      const f0 = T.layers[0] + K.fallStep * spec.fall;
      a = 1 - smooth(win(v, [f0 + K.fallLen * 0.45, f0 + K.fallLen]));
    } else {
      const arrive = spec.fresh ? smooth(win(v, [a0, a0 + K.layerLen * 0.4])) : 1;
      if (v < T.real[1]) a = arrive;                                                   // card, blueprint, assembly: the slab is what you see
      else if (v < T.exit[0]) a = 0;                                                   // the live window covers it (opaque from real[1])
      else a = smooth(win(v, [T.exit[0], T.exit[0] + 8])) * (1 - smooth(win(v, [x1 - 6, x1])));
    }
    // ---- wipes
    let clip = "none", lclip = "none", hidden = false;
    if (spec.block !== null && spec.block !== undefined) {
      const e0 = T.expand[0] + K.blkStep * spec.block, l0 = T.labels[0] + K.lblStep * spec.block;
      const ub = cubic(win(v, [e0, e0 + K.blkLen])), ul = sine(win(v, [l0, l0 + K.lblLen]));
      if (ub < 1) clip = `inset(0 ${f3((1 - ub) * 100)}% 0 0)`;
      if (ub <= 0) hidden = true;
      if (ul < 1) lclip = `inset(0 ${f3((1 - ul) * 100)}% 0 0)`;
    } else if (spec.wipeAt !== undefined) {
      const ub = sine(win(v, [spec.wipeAt, spec.wipeAt + K.lblLen]));
      if (ub < 1) clip = `inset(0 ${f3((1 - ub) * 100)}% 0 0)`;
      if (ub <= 0) hidden = true;
    }
    if (spec.flip) hidden = th < 90;
    if (spec.fresh && v < a0) hidden = true;
    return {
      th, a, fill, stroke, clip, lclip, hidden,
      flipT: spec.flip && th < 180 ? `perspective(${PERSPECTIVE}px) rotateY(${f3(th - 180)}deg)` : "none",
      real: 1 - smooth(win(v, [T.tilt[0], T.tilt[0] + 14]))
    };
  }

  function make(spec, { vh, T, K }) {
    const r = spec.cardRect, O = [0.2, 0.4, 0.6, 0.8, 0.9];
    let inner = "";
    if (spec.title) inner += `<div class="sf-ttl">${esc(spec.title)}</div>`;
    if (spec.strips) inner += O.map((o, n) => `<i class="sf-st" style="left:${279 + 40 * n}px;width:${n === 4 ? 39 : 40}px;background:rgba(255,255,255,${o})"></i>`).join("");
    if (spec.border) inner += `<i class="sf-bl"></i>`;
    if (spec.label) inner += `<div class="sf-lbl" data-l style="left:${spec.lx}px;top:${spec.ly}px;color:${spec.ink}">${esc(spec.label).replace(/\n/g, "<br>")}</div>`;
    const origin = spec.flip && r ? `transform-origin:${f3(CENTRE[0] - r.x)}px ${f3(CENTRE[1] - r.y)}px;` : "";
    const rad = spec.radius ? `border-radius:${spec.radius};` : "";
    const html = `<div class="sf-wrap" data-w style="${origin}"><div class="sf-face" data-f style="${rad}"></div><div class="sf-real" data-r style="${rad}">${inner}</div></div>`;

    const bind = body => ({ w: body.querySelector("[data-w]"), f: body.querySelector("[data-f]"), r: body.querySelector("[data-r]"), l: body.querySelector("[data-l]") });
    function update(body, k, t) {
      const R = body.__sfc || (body.__sfc = bind(body));
      const S = state(spec, vh(t), T, K);
      R.w.style.visibility = S.hidden ? "hidden" : "visible";
      R.w.style.opacity = f3(S.a);
      R.w.style.transform = S.flipT;
      R.w.style.clipPath = S.clip;
      R.f.style.background = rgba(S.fill);
      R.f.style.borderColor = rgba(S.stroke);
      R.r.style.opacity = f3(S.real);
      if (R.l) R.l.style.clipPath = S.lclip;
    }
    return { html, update };
  }

  window.StagefCard = { make, state, CENTRE, PERSPECTIVE };
})();
