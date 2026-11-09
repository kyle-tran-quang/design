/* =========================================================================
   STAGE F (Figma slides 21a-22): the "// Maturity pathways" card, its blueprint, the "Plan your customers' next move" window, the compare toggle and the exit.
   Loaded AFTER stage-e.js. It APPENDS pieces, camera keys, one afterRender hook and extras to the main SCENE; nothing of Stages A-E is rewritten except two fade keys on Stage E's "stagee" piece.
   Data + windows: stagef-data.js (STAGEF.TIMING, local vh; global position TIMING.F.start in story.js). Pieces: stagef-card.js (the card / blueprint / window slabs), stagef-piece.js (the live window).

   BEAT SHEET (local vh, 0 = global 1620)
     0-24    E's card zooms back out (a second instance of Stage E's piece driven by a reversed clock; the original fades out at 0, the pose is identical)
     20-62   the card flips (rotateY, face swap at 90 deg); stage, text column and nav turn dark -> light in lockstep (afterRender)
     62-120  the five pathway blocks wipe open left to right, then their labels
     120-166 rest 1 (f1) | 166-202 camera flat -> iso, the card breaks into 7 outline slabs | 202-252 rest 2 (f2)
     252-318 slabs travel into the window (straight on-screen paths), the dark cells tip off, the live window cross-fades in | 318-360 rest 3 (f3)
     360-394 cursor, tap, toggle | 394-438 compare | 440-490 rest 4 (f4) | 490-524 exit: the window folds back to outlines and leaves an empty stage | 524-560 rest 5 (f5)
   Everything is a pure function of t: scrolling backward plays it in reverse.
   ========================================================================= */
(function () {
  const TT = window.TIMING, F = TT && TT.F, SC = window.SCENE, SF = window.STAGEF, SP = window.StagefPiece, SK = window.StagefCard,
        SE = window.STAGEE, EPc = window.StageePiece, AS = window.AssemblyScene;
  if (!F || !SC || !SF || !SP || !SK || !SE || !EPc || !AS) return;

  const S = F.start, T = SF.TIMING, K = SF.KNOBS, GEO = SF.GEO, G = SF.toGlobal(S);
  const V = vh => vh / TT.MAX, L = vh => V(S + vh), lv = t => t * TT.MAX - S;
  const EPS = V(0.02);                                                              // the width of an "instant" switch: 0.02 vh
  const ISO = SF.ISO, FLAT = SF.FLAT;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const win = (v, w) => clamp((v - w[0]) / (w[1] - w[0]), 0, 1);
  const cubic = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const quart = u => (u < 0.5 ? 8 * u * u * u * u : 1 - Math.pow(-2 * u + 2, 4) / 2);
  const f3 = v => String(Math.round(v * 1000) / 1000);
  const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const mixArr = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  const toCSS = arr => `rgb(${arr.map(Math.round).join(",")})`;
  const rgba = (h, a = 1) => [...hex(h), a];
  const add = p => { SC.pieces.push(p); return p; };

  // 1. Camera: flat through the card, iso for the blueprint, flat for the window, iso again for the exit (held iso to the end)
  SC.camera = SC.camera.filter(k => k.t < V(S) - 1e-9).concat(
    G.cameraKeys.map(k => ({ t: V(k.vh), rx: k.rx, rz: k.rz, s: k.s, e: k.e })),
    [{ t: 1, ...ISO }]
  );
  const camAt = t => AS.sample(SC.camera, t, FLAT);

  // 2. Stage E's live card: the original piece leaves at 0, a second instance (reversed clock) takes over in the identical pose and zooms back out, then flips
  const stagee = SC.pieces.find(p => p.id === "stagee");
  if (stagee) stagee.keys.push({ t: V(S), o: 1 }, { t: V(S) + EPS, o: 0 });
  const ET = SE.TIMING, EZ = [ET.zoom[1], ET.zoom[0]];                              // E's local clock: 100 -> 72 is the zoom played backwards
  const EP = EPc.make({ vh: t => lerp(EZ[0], EZ[1], win(lv(t), T.zoomOut)), T: ET });   // linear on purpose: E's own sine easing is applied inside its state(), so the reverse is a sine too
  const flipTh = v => 180 * cubic(win(v, T.flip));
  add({
    id: "stagef-e", label: "Next steps card (zoom out + flip)", kind: "media", depth: 23, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } },
    html: `<div class="sf-ew" data-ew>${EP.html}</div>`,
    update(body, k, t) {
      EP.update(body, k, t);
      const w = body.__sfew || (body.__sfew = body.querySelector("[data-ew]")), th = flipTh(lv(t));
      w.style.transformOrigin = `${SK.CENTRE[0]}px ${SK.CENTRE[1]}px`;
      w.style.visibility = th >= 90 ? "hidden" : "visible";
      w.style.transform = th > 0 ? `perspective(${SK.PERSPECTIVE}px) rotateY(${f3(th)}deg)` : "none";
    },
    keys: [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, { t: V(S) - EPS, o: 0 }, { t: V(S), o: 1 }]
  });

  // 3. The card as seven slabs (+ the rail and the product header, which have no card part). Camera maths for straight on-screen paths (same as stage-b.js).
  const RAD = Math.PI / 180;
  const proj = (px, py, z, cam) => {                                                // engine projection of a plane point at height z
    const rz = cam.rz * RAD, rx = cam.rx * RAD, k = cam.s / 0.8, x = px - 360, y = py - 512;
    const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz);
    return [360 + k * x1, 512 + k * (y1 * Math.cos(rx) - z * Math.sin(rx))];
  };
  const unproject = (sx, sy, z, cam) => {                                           // inverse of proj for a point at height z
    const rz = cam.rz * RAD, rx = cam.rx * RAD, k = cam.s / 0.8, cx = Math.cos(rx);
    const u0 = (sx - 360) / k, v0 = (sy - 512) / k + z * Math.sin(rx), v1 = v0 / (Math.abs(cx) < 1e-6 ? 1e-6 : cx);
    return [360 + u0 * Math.cos(rz) + v1 * Math.sin(rz), 512 - u0 * Math.sin(rz) + v1 * Math.cos(rz)];
  };
  // travel(): n + 1 sampled plane rects that walk the piece's top-left corner along the STRAIGHT, eased screen line from its card pose (blueprint camera) to its window pose (flat camera)
  function travel(id, from, to, zFrom, zTo, v0, v1, n = 20) {
    const t0 = L(v0), t1 = L(v1), S0 = proj(from.x, from.y, zFrom, camAt(t0)), S1 = proj(to.x, to.y, zTo, camAt(t1)), rects = {}, keys = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, e = quart(u), t = lerp(t0, t1, u), z = lerp(zFrom, zTo, e), name = i === 0 ? "card" : i === n ? "win" : `${id}-p${i}`;
      if (i && i < n) {
        const P = unproject(lerp(S0[0], S1[0], e), lerp(S0[1], S1[1], e), z, camAt(t));
        rects[name] = { x: P[0], y: P[1], w: lerp(from.w, to.w, e), h: lerp(from.h, to.h, e) };
      }
      keys.push({ t, x: 0, y: 0, z, rect: name, e: "linear" });
    }
    return { rects, keys };
  }

  const CARD = SF.CARD, TITLE_AT = T.flip[1] - 4, DROP = 200, RX = [40, -40, 40];
  const gs = id => GEO.slabs.find(s => s.id === id), gIdx = id => GEO.slabs.findIndex(s => s.id === id);
  const wrect = s => ({ x: GEO.win.x + s.x, y: GEO.win.y + s.y, w: s.w, h: s.h });
  const stroke = c => [c[0], c[1], c[2], 1];
  const RADIUS = { apm: "32px 32px 0 0", inv: "0 0 0 32px", ins: "0 0 32px 0" };
  const LIFT = {};  SF.BLUEPRINT.forEach((b, m) => { LIFT[b.id] = m; });

  // one definition per piece: i = layer order (stagger), g = the window slab it becomes
  const defs = SF.BLUEPRINT.map(b => {
    const blk = CARD.blocks.find(x => x.id === b.id), d = { b, i: 0 };
    if (b.id === "shell") Object.assign(d, { g: "base", i: 0, flip: true, real: [rgba("#FFFFFF"), rgba("#FFFFFF")] });
    else if (b.id === "title") Object.assign(d, { g: "hero", i: 1, title: CARD.title.text, wipeAt: TITLE_AT, real: [[69, 137, 255, 0], [69, 137, 255, 0]] });
    else {
      const idx = CARD.blocks.indexOf(blk), c = rgba(blk.bg);
      Object.assign(d, { i: 2, block: idx, real: [c, c], strips: !!blk.strips, border: !!blk.border, label: blk.label, lx: blk.lx, ly: blk.ly, ink: blk.ink, radius: RADIUS[b.id] });
      if (b.to) d.g = b.to === "tabs" ? "tabs" : "stages"; else d.fall = b.fall;
    }
    return d;
  });
  const fresh = ["rail", "header"].map((id, n) => ({ g: id, i: 3 + n, fresh: true }));

  function slabPiece(d) {
    const g = d.g ? gs(d.g) : null, b = d.b, zA = b ? b.zA : 0, m = b ? LIFT[b.id] : 0, i = d.i;
    const bp = g && g.bp ? { fill: g.bp, stroke: stroke(g.bpS) } : d.fall !== undefined ? { fill: GEO.cellBp.fill, stroke: stroke(GEO.cellBp.stroke) } : { fill: [255, 255, 255, 0.7], stroke: [141, 141, 141, 1] };
    const wn = g ? { fill: rgba(g.fill), stroke: rgba(g.stroke) } : bp;
    const real = d.real ? { fill: d.real[0], stroke: d.real[1] } : bp;
    const spec = { i, cardRect: b ? b.rect : null, real, bp, win: wn, flip: d.flip, block: d.block, wipeAt: d.wipeAt, fall: d.fall, fresh: d.fresh, title: d.title,
                   strips: d.strips, border: d.border, label: d.label, lx: d.lx, ly: d.ly, ink: d.ink, radius: d.radius };
    const PC = SK.make(spec, { vh: lv, T, K });
    const a0 = T.layers[0] + K.layerStep * i, a1 = a0 + K.layerLen, x0 = T.exit[0] + 4 + K.exitStep * i, x1 = x0 + K.exitLen;
    const zE = K.zEps * (g ? gIdx(g.id) + 1 : 1), zX = g ? g.z + zE : 0;
    const rects = {}, keys = [];
    if (b) rects.card = b.rect;
    if (g) rects.win = wrect(g);
    const gate = [{ t: V(S) - EPS, o: 0 }, { t: V(S), o: 1 }];                       // off until the beat starts (update() also hides each piece, this is the belt and braces)
    if (d.fresh) {
      keys.push({ t: 0, x: 0, y: 0, z: zE + DROP, rx: 0, o: 0, f: 1, rect: "win" }, ...gate, { t: L(a0), z: zE + DROP }, { t: L(a1), z: zE, e: "inOutQuart" },
                { t: L(x0), z: zE }, { t: L(x1), z: zX, e: "inOutQuart" }, { t: 1, z: zX });
    } else {
      const lift0 = T.tilt[0] + 2 + K.liftStep * m;
      keys.push({ t: 0, x: 0, y: 0, z: 0, rx: 0, o: 0, f: 1, rect: "card" }, ...gate, { t: L(lift0), z: 0 }, { t: L(lift0 + K.liftLen), z: zA, e: "inOutQuart" });
      if (d.fall !== undefined) {                                                   // the dark cells tip off and fall away
        const f0 = T.layers[0] + K.fallStep * d.fall;
        keys.push({ t: L(f0), z: zA, rx: 0 }, { t: L(f0 + K.fallLen), z: zA - K.fallDrop, rx: RX[d.fall], e: "inOutQuart" });
      } else {
        const tr = travel(b.id, b.rect, wrect(g), zA, zE, a0, a1);
        Object.assign(rects, tr.rects); keys.push(...tr.keys);
        keys.push({ t: L(x0), z: zE }, { t: L(x1), z: zX, e: "inOutQuart" }, { t: 1, z: zX });
      }
    }
    return { id: "sf-" + (b ? b.id : d.g), label: b ? b.label : g.label, kind: "card", depth: 30 + i, rects, html: PC.html, update: PC.update, keys };
  }
  defs.forEach(d => add(slabPiece(d)));
  fresh.forEach(d => add(slabPiece(d)));

  // 4. The live window (cross-fades in over the landed slabs, leaves at the start of the exit)
  const P = SP.make({ vh: lv, T });
  add({
    id: "stagef-win", label: "Maturity map window", kind: "media", depth: 60, rects: { r: GEO.win }, html: P.html, update: P.update,
    keys: [{ t: 0, x: 0, y: 0, z: 1, o: 0, f: 1, rect: "r" }, { t: L(T.real[0]), o: 0 }, { t: L(T.real[1]), o: 1, e: "inOutSine" },
           { t: L(T.exit[0]), o: 1 }, { t: L(T.exit[0] + 10), o: 0, e: "inOutCubic" }]
  });

  // 5. Theme flip (stage, text column, nav) and the exit (column to #F4F4F4, nav hidden). A pure function of t, so scrolling back restores everything.
  const VARS = ["--bg", "--page", "--text", "--line", "--tick", "--tick-act"];
  const prevAfter = SC.afterRender;
  SC.afterRender = t => {
    if (prevAfter) prevAfter(t);
    const v = lv(t), layoutEl = document.getElementById("layout"), sceneEl = document.getElementById("scene"), progEl = document.getElementById("progress");
    const els = [layoutEl, sceneEl, progEl].filter(Boolean), set = (k, val) => els.forEach(el => el.style.setProperty(k, val)), clear = () => els.forEach(el => VARS.forEach(k => el.style.removeProperty(k)));
    const u = SF.flipAt(v), ex = SF.exitAt(v);
    if (v > -0.05 && v < T.flip[1]) {
      const d = SF.flip.dark, l = SF.flip.light, m = k => toCSS(mixArr(hex(d[k]), hex(l[k]), u));
      clear();
      set("--bg", m("bg")); set("--page", m("page")); set("--text", m("text")); set("--line", m("line"));
      set("--tick", toCSS(mixArr(hex("#6f6f6f"), hex("#8d8d8d"), u))); set("--tick-act", toCSS(mixArr(hex("#f4f4f4"), hex("#000000"), u)));
      if (progEl) progEl.dataset.flip = "";
    } else {
      clear();
      if (progEl) delete progEl.dataset.flip;
      if (ex > 0 && layoutEl) layoutEl.style.setProperty("--page", toCSS(mixArr(hex(SF.flip.light.page), hex(SF.flip.light.bg), ex)));
    }
    if (progEl) { progEl.style.opacity = ex > 0 ? f3(1 - ex) : ""; progEl.style.transition = ex > 0 ? "none" : ""; }     // the nav fades with the exit (inline: `.progress.on` would win over a variable)
  };

  // 6. Description + activity inside update() hooks, declared so the pacing audit sees it
  SC.ariaLabel += " The Next steps card zooms back out and turns over, and the page turns light, revealing a Maturity pathways card whose five blocks open left to right. The card tilts into an isometric blueprint of outline slabs, which travel into a Plan your customers' next move window while three dark blocks tip off. A cursor switches on Compare stages and Stage 1 turns into a two-stage comparison. The window folds back to outlines and leaves an empty stage.";
  const ext = (id, w) => ({ id, keys: [{ t: L(w[0]), o: 0 }, { t: L(w[1]), o: 1 }] });
  SC.extras = (SC.extras || []).concat([
    ext("maturity: E card zooms out", T.zoomOut), ext("maturity: card flip + dark -> light", T.flip), ext("maturity: blocks wipe open", T.expand), ext("maturity: labels wipe in", T.labels),
    ext("maturity: slabs travel into the window", T.layers), ext("maturity: real window crossfade", T.real), ext("maturity: cursor to the toggle", T.cue),
    ext("maturity: tap + toggle", [T.tap[0], T.toggle[1]]), ext("maturity: compare", T.compare), ext("maturity: exit + column to #F4F4F4", T.exit)
  ]);

  window.StageF = { P, G, defs };
})();
