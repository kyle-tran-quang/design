/* =========================================================================
   STAGE B (beats 8-10): capabilities diagram -> 7-layer isometric stack -> journey simulator -> first iteration (v1).
   Loaded AFTER scene-data.js. It only APPENDS pieces + camera keys + two hide-keys on Stage A's "capabilities" piece; nothing of Stage A is rewritten.
   Every window is read from TIMING.B (story.js, vh of scroll). Retime there, not here.

   SOURCE (Figma file 1r4UreOVeEqdcXvnD5cetk, slide 11 "Journey simulator" 208:6820 and slide 10 "76 milestones" 208:6744):
     start pose   219:6821  Stage / Capabilities morph 2   = the finished diagram (Stage A ends here)
     end pose     219:6843  Transition / 7 milestones isometric -> v1:  "Isometric stack" 219:6844 (milestone-1..7 = 219:6851..6845, v1-form 219:6852, v1-header 219:6853)
                            + "Annotations" 219:6855 (dot / leader / label x 7)
     v1 landed    208:7016  (slide 12) 680.15 x 374.04 at (19.92, 324.96) + three feedback notes 208:7689 / 7692 / 7695
   The stack is an ORTHOGRAPHIC 2:1 drawing (both axes 26.565 deg off horizontal). That is exactly the engine camera at rx 60 / rz -45 with the stage scaled by
   KC = 2*sqrt(2)/sqrt(5) = 1.2649, so the slabs are real 3D planes and the camera produces the Figma pose; nothing is redrawn by hand.
   The 7 layers ARE the diagram's 7 right-hand cards (same seven labels: Industry solutions, Capabilities, APM, FSM, Real estates & facilities, EAM, HSE).

   BEAT SHEET (vh; full worksheet in the hand-over notes)
     8  milestones  cue 472-482 (diagram text, bars, connectors, red node fade; 14 plain cards remain) | HERO 482-522 (camera tilts to iso; the 7 lilac cards travel into a
                    stack and turn to wireframe; the 7 blue cards fall away) | card drops on top 508-534 | leader labels draw in 527-541 | REST 541-578 (anchor 553)
     9  simulator   scan 584-610 (each layer lights up in turn, top to bottom: "validate these by hand") | REST 610-642 (anchor 623), video slot in the text column
     10 first       labels off 642-650 | HERO 650-686 (camera flattens; the card grows into the real v1; slabs sink and fade) | live v1 crossfades in 682-692 | notes 688-700 | REST 700-757 (anchor 728)

   MY DECISIONS (not in any Figma frame; redirect freely): the diagram -> stack travel (bottom layer first), the blue cards falling away, the card drop, the layer scan
   under "validate by hand", and all timings.
   Pure functions of t everywhere (update() hooks read t and the camera only), so scrolling backward plays it in reverse.
   ========================================================================= */
(function () {
  const TT = window.TIMING, B = TT.B, SC = window.SCENE, D = window.CAP_DATA, U = window.V1UI, AS = window.AssemblyScene, CP = window.CapabilitiesPiece;
  if (!B || !SC || !D || !U || !AS || !CP) return;

  const V = vh => vh / TT.MAX;                                                      // scroll vh -> scene progress t
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const hex = (s, a = 1) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), a];
  const mixc = (p, q, u) => p.map((v, i) => lerp(v, q[i], u));
  const css = c => `rgba(${c[0].toFixed(1)},${c[1].toFixed(1)},${c[2].toFixed(1)},${c[3].toFixed(3)})`;
  const FULL = { x: 0, y: 0, w: 720, h: 1024 };
  const add = p => { SC.pieces.push(p); return p; };

  /* ---- camera geometry. The engine draws  screen = C + M (P - C) - (0, ZK z)  with P the plane position in the 720 x 1024 stage and z the lift.
          M is the Figma stack's own transform matrix [[.8944, .8944], [-.4472, .4472]]. plane() inverts it: where must a plane point sit to land on a Figma screen point. ---- */
  const C0 = [360, 512];
  const KC = 2 * Math.SQRT2 / Math.sqrt(5);                                         // 1.2649: camera scale of the stack relative to the flat stage scale
  const MA = 2 / Math.sqrt(5), MB = 1 / Math.sqrt(5), ZK = KC * Math.sqrt(3) / 2;   // ZK = 1.0954 screen px per unit of z at rx 60
  const plane = (sx, sy, z) => { const u = sx - C0[0], v = sy - C0[1] + ZK * z, k = 1 / (2 * MA * MB); return [C0[0] + k * (MB * u - MA * v), C0[1] + k * (MB * u + MA * v)]; };
  const ISO = { rx: 60, rz: -45, s: 0.8 * KC }, FLAT = { rx: 0, rz: 0, s: 0.8 };

  /* ---- the stack (Figma 219:6845-6851): 7 slabs 165 x 115.5, 38.105 screen px apart. milestone-1 (top) = Industry solutions. ---- */
  const N = 7, SW = 165, SH = 115.5, STEP = 38.1051, DZ = STEP / ZK;
  const ZL = i => (N - 1 - i) * DZ;                                                 // layer height: the bottom layer (HSE) sits at z 0
  const S0 = [150.8283, 503.2709];                                                  // milestone-1 origin on screen
  const PST = plane(S0[0], S0[1] + (N - 1) * STEP, 0);                              // every layer shares this plane position; the screen offset between layers is all z
  const LABELS = ["Industry solutions", "Capabilities", "APM", "FSM", "Real estates & facilities", "EAM", "HSE"];

  /* ---- the card on top (Figma 219:6852 body 330 x 178.27, 219:6853 header 330 x 34.98 sitting 27.65 above the body's top edge, in plane y) ---- */
  const ZC = ZL(0) + 112.25, DROP = 150, HEAD_DY = -27.6535;       // DROP: how far above its resting height the card starts. 150 keeps its whole header on the stage (240 started 10px above it).
  const PB = plane(82.6674, 380.3025, ZC);
  const BODY = { x: PB[0], y: PB[1], w: 330, h: 178.2725 }, HEAD = { x: PB[0], y: PB[1] + HEAD_DY, w: 330, h: 34.9835 };
  const SHADOW_DZ = 18 / ZK;                                                        // Figma shadow: 0 18 28 #0f3399 @ 18%; 18 screen px of offset

  /* ---- the landed v1 (Figma 208:7016): the 1682px frame shown at K1, header band above the form window ---- */
  const K1 = 680.1546630859375 / 1682, FX = 19.92266845703125, FY = 324.95538330078125, FW = 680.1546630859375;
  const HEADH = U.HEAD_H * K1;
  const F_HEAD = { x: FX, y: FY, w: FW, h: HEADH }, F_FORM = { x: FX, y: FY + HEADH, w: FW, h: U.WIN_H * K1 }, F_ALL = { x: FX, y: FY, w: FW, h: HEADH + U.WIN_H * K1 };
  const NOTES = [
    { id: "sb-note-1", x: 50.55,  y: 76.83,  tag: "feedback 1", text: "The concept is proven; the content needs iteration." },
    { id: "sb-note-2", x: 508.3,  y: 133.45, tag: "feedback 2", text: "“…how do you make Maximo the shiny object?”" },
    { id: "sb-note-3", x: 50.55,  y: 218.36, tag: "feedback 3", text: "Define what APM is up front, technology agnostic." }
  ];
  const NOTE_W = 121.31, NOTE_H = 93.01;

  /* ---- windows (vh -> t) ---- */
  const cue0 = V(B.cue[0]), cue1 = V(B.cue[1]), tilt0 = V(B.tilt[0]), tilt1 = V(B.tilt[1]);
  const flat0 = V(B.flatten[0]), flat1 = V(B.flatten[1]), live0 = V(B.live[0]), live1 = V(B.live[1]);
  const E = 0.0005;                                                                 // the width of an "instant" switch

  /* ---- the camera: flat (Stage A) -> isometric -> flat. Lockstep with the pieces on both moves. ---- */
  SC.camera = SC.camera.filter(k => k.t < tilt0 - 1e-9).concat([
    { t: tilt0, ...FLAT }, { t: tilt1, ...ISO }, { t: flat0, ...ISO }, { t: flat1, ...FLAT }, { t: 1, ...FLAT }
  ]);

  /* ---- screen-space paths. The engine draws a piece at  screen = C + k R(rz, rx) (P - C) - k (0, z sin rx)  (k = cam.s / 0.8), so interpolating P and z linearly while the camera
          swings gives a curved path that can leave the stage. pathKeys() instead samples (n steps) the plane position P that lands the piece's top-left corner on the straight,
          eased line from its stack pose to its flat pose, and emits one key per sample. Same easing as the camera (inOutCubic), so piece and camera stay in lockstep. ---- */
  const RAD = Math.PI / 180, ez = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const camAt = t => AS.sample(SC.camera, t, FLAT);
  const unproject = (sx, sy, z, cam) => {                                          // inverse of the engine's projection for a point at height z
    const rz = cam.rz * RAD, rx = cam.rx * RAD, k = cam.s / 0.8, cx = Math.cos(rx);
    const u0 = (sx - 360) / k, v0 = (sy - 512) / k + z * Math.sin(rx), v1 = v0 / (Math.abs(cx) < 1e-6 ? 1e-6 : cx);
    return [360 + u0 * Math.cos(rz) + v1 * Math.sin(rz), 512 - u0 * Math.sin(rz) + v1 * Math.cos(rz)];
  };
  // flatPath(): `from` = {x, y, z, w, h} (screen top-left, height, plane size) at flat0; `to` = {x, y, w, h} (flat rect) at flat1. Returns { rects, keys }: n + 1 sampled rects (each the exact
  // plane box for that instant) and the keys that walk through them with linear segments, so the engine's own rect interpolation traces the straight screen line.
  function flatPath(id, from, to, stackRect, n = 24) {
    const rects = {}, keys = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, t = lerp(flat0, flat1, u), e = ez(u), cam = camAt(t), z = lerp(from.z, 0, e);
      const P = unproject(lerp(from.x, to.x, e), lerp(from.y, to.y, e), z, cam), name = i === 0 ? stackRect : `${id}-p${i}`;
      if (i) rects[name] = { x: P[0], y: P[1], w: lerp(from.w, to.w, e), h: lerp(from.h, to.h, e) };
      keys.push({ t, x: 0, y: 0, z, rect: name, e: "linear" });
    }
    return { rects, keys };
  }

  /* ---- 1. the diagram with its text, bars and connectors fading (capabilities.js bridge cue), leaving 14 plain cards. A second instance of the piece, identical to Stage A's
          at t >= the end of its morph; it takes over from Stage A's piece at the cue start (overlapped by 0.0005 so there is never a frame without the diagram). ---- */
  const tc = TT.toCity;
  const thVal = Array.isArray(tc.handoff) ? tc.handoff.map(V) : V(tc.handoff);
  const CAPB = CP.make({ m0: V(TT.capPrime[0]), m1: V(TT.capPrime[1]), b0: cue0, b1: cue1, i0: V(tc.city[0]), i1: V(tc.city[1]), th: thVal });
  const capA = SC.pieces.find(p => p.id === "capabilities");
  if (capA) capA.keys.push({ t: cue0, o: 1 }, { t: cue0 + E, o: 0 });
  add({ id: "sb-cap", label: "Capabilities (bridge)", kind: "media", depth: 3, html: CAPB.html, update: CAPB.update, rects: { r: FULL },
        keys: [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, { t: cue0 - 2 * E, o: 0 }, { t: cue0 - E, o: 1 }, { t: cue1, o: 1 }, { t: cue1 + E, o: 0 }] });

  /* ---- 2. the 14 cards as real planes. At cue1 they replace the SVG cards at the same rects and colours (the slab goes on one instant BEFORE the SVG goes off: two identical opaque layers). ---- */
  const WIRE_FILL = [255, 255, 255, 0.5], WIRE_STROKE = hex("#8c8c99", 0.8);       // Figma 219:6845: white @ 50%, stroke #8c8c99 @ 80%
  const HL_FILL = hex("#0f62fe", 0.14), HL_STROKE = hex("#0f62fe");
  const scan0 = i => V(B.scan[0] + i * B.scanStep), scan1 = i => scan0(i) + V(B.scanLen);
  const hl = (i, t) => sm(scan0(i), lerp(scan0(i), scan1(i), 0.35), t) - sm(lerp(scan0(i), scan1(i), 0.65), scan1(i), t);      // 0 -> 1 -> 0 pulse under "validate by hand"
  const face = '<div class="sb-face"></div>';

  // left column: the seven blue module cards leave. They fall beneath where the stack forms and fade.
  D.left.forEach((c, i) => {
    const a = V(B.leftStart + i * B.leftStep), b = a + V(B.leftLen), fill = hex(c.fill), stroke = hex(c.stroke);
    add({ id: `sb-mod-${i}`, label: "Module " + (i + 1), kind: "card", depth: 4, html: face, rects: { r: { x: c.x, y: c.y, w: c.w, h: c.h } },
          update(body) { const f = body.firstChild; f.style.background = css(fill); f.style.borderColor = css(stroke); },
          keys: [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, { t: cue1 - E, o: 0 }, { t: cue1, o: 1 }, { t: a, z: 0, o: 1 }, { t: b, z: -260, o: 0, e: "inOutCubic" }] });
  });

  // right column: the seven lilac industry cards become the seven layers. Bottom layer first (lego order); same window/easing as the camera tilt.
  D.right.forEach((c, i) => {
    const Z = ZL(i), a = V(B.layerStart + (N - 1 - i) * B.layerStep), b = a + V(B.layerLen);
    const fill = hex(c.fill), stroke = hex(c.stroke), wa = V(B.wire[0]), wb = V(B.wire[1]);
    // travel into the stack (with the tilt), hold through the scan, then FOLD: the stack's z-gaps close and every slab grows to the landed v1's rect while the camera flattens,
    // so the layers collapse neatly beneath the card (rect "c"); the live v1 then covers them and they leave with it (live window).
    const fp = flatPath(`sb-layer-${i}`, { x: S0[0], y: S0[1] + i * STEP, z: Z, w: SW, h: SH }, F_ALL, "b");        // straight on-screen fold into the v1's rect (see flatPath)
    const k = [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "a" }, { t: cue1 - E, o: 0 }, { t: cue1, o: 1 },
               { t: a, z: 0, rect: "a" }, { t: b, z: Z, rect: "b", e: "inOutCubic" },
               ...fp.keys,
               { t: live0, o: 1 }, { t: live1, o: 0, e: "inOutSine" }];
    add({ id: `sb-layer-${i}`, label: LABELS[i], kind: "card", depth: 5 + i, html: face, rects: { a: { x: c.x, y: c.y, w: c.w, h: c.h }, b: { x: PST[0], y: PST[1], w: SW, h: SH }, ...fp.rects },
          update(body, _k, t) {
            const w = sm(wa, wb, t), h = hl(i, t);
            let fl = mixc(fill, WIRE_FILL, w), st = mixc(stroke, WIRE_STROKE, w);
            if (h > 0) { fl = mixc(fl, HL_FILL, h); st = mixc(st, HL_STROKE, h); }
            const f = body.firstChild; f.style.background = css(fl); f.style.borderColor = css(st);
            f.style.boxShadow = h > 0.01 ? `0 0 ${(14 * h).toFixed(1)}px rgba(15,98,254,${(0.35 * h).toFixed(3)})` : "none";
          }, keys: k });
  });

  /* ---- 3. the card that lands on the stack, with its soft shadow. Same pieces flatten into the real v1's frame. ---- */
  const c0 = V(B.card[0]), c1 = V(B.card[1]), cm = lerp(c0, c1, 0.3);
  const cardKeys = (dz, fp) => [
    { t: 0, x: 0, y: 0, z: ZC + dz + DROP, o: 0, f: 1, rect: "iso" }, { t: c0, z: ZC + dz + DROP, o: 0 }, { t: cm, o: 1 }, { t: c1, z: ZC + dz, o: 1, e: "outBack" },
    ...fp.keys, { t: live1, o: 1 }, { t: live1 + E, o: 0 }];
  // screen-space starts (Figma 219:6852 / 219:6853 origins) and the flat targets; the shadow sits SHADOW_DZ lower, which projects to the 18 screen px of Figma's drop shadow
  const fpShadow = flatPath("sb-shadow", { x: 82.6674, y: 380.3025 + 18, z: ZC - SHADOW_DZ, w: BODY.w, h: BODY.h }, F_ALL, "iso");
  const fpBody = flatPath("sb-card-body", { x: 82.6674, y: 380.3025, z: ZC, w: BODY.w, h: BODY.h }, F_FORM, "iso");
  const fpHead = flatPath("sb-card-head", { x: 57.9336, y: 367.9356, z: ZC + 0.2, w: HEAD.w, h: HEAD.h }, F_HEAD, "iso");
  add({ id: "sb-shadow", label: "Card shadow", kind: "card", depth: 6, html: '<div class="sb-shadow"></div>', rects: { iso: BODY, ...fpShadow.rects },
        update(body, _k, t) { const u = sm(flat0, flat1, t), el = body.firstChild; el.style.background = css(mixc([15, 51, 153, 0.18], [0, 0, 0, 0.10], u)); el.style.filter = `blur(${lerp(14, 8, u).toFixed(2)}px)`; },
        keys: cardKeys(-SHADOW_DZ, fpShadow) });
  add({ id: "sb-card-body", label: "v1 form", kind: "section", depth: 7, html: '<div class="sb-card-body"></div>', rects: { iso: BODY, ...fpBody.rects }, keys: cardKeys(0, fpBody) });
  add({ id: "sb-card-head", label: "v1 header", kind: "nav", depth: 8, html: '<div class="sb-card-head"><span>Maximo Readiness Assessment</span></div>', rects: { iso: HEAD, ...fpHead.rects },
        update(body, _k, t) { body.querySelector("span").style.opacity = 1 - sm(V(B.flatten[0] + 6), V(B.flatten[0] + 18), t); },        // the title leaves before the band grows past it
        keys: cardKeys(0.2, fpHead) });

  /* ---- 4. leader annotations (Figma 219:6855): dot + leader + mono label. ONE piece, billboarded: the body cancels the camera's rotation and scale so the lines and text read
          flat at any angle. The piece sits high in z so it is always drawn above the slabs. It keeps o = 1 (opacity < 1 would flatten its 3D) and fades inside. ---- */
  // z is high enough that the whole screen-facing plane (about 230 screen px tall = 265 z) stays above the card (z 321), so it never intersects a slab; the camera is orthographic,
  // so the height changes nothing but the plane() offset. The labels exist only while the camera is isometric (527-654), so the offset never has to track a camera move.
  const ANN_Z = 3000, PA = plane(349.1717, 485.77, ANN_Z);
  const labStart = i => V(B.labels[0] + i * B.labelStep), labLen = V(B.labelLen), offA = V(B.labelsOff[0]), offB = V(B.labelsOff[1]);
  const INK = hex("#52525c"), BLUE = hex("#0f62fe");
  add({ id: "sb-ann", label: "Layer labels", kind: "annotation", depth: 9,
        html: LABELS.map((l, i) => `<div class="sb-ann" style="top:${(i * STEP).toFixed(4)}px"><i class="dot"></i><i class="ln"></i><span class="lb">${l.replace("&", "&amp;")}</span></div>`).join(""),
        rects: { r: { x: PA[0], y: PA[1], w: 0, h: 0 } },
        update(body, _k, t) {
          const cam = AS.sample(SC.camera, t, FLAT), out = 1 - sm(offA, offB, t);
          body.style.transform = `rotateZ(${(-cam.rz).toFixed(4)}deg) rotateX(${(-cam.rx).toFixed(4)}deg) scale(${(0.8 / cam.s).toFixed(5)})`;
          const g = body._sb || (body._sb = [...body.querySelectorAll(".sb-ann")].map(el => ({ el, dot: el.querySelector(".dot"), ln: el.querySelector(".ln"), lb: el.querySelector(".lb") })));
          g.forEach((n, i) => {
            const u = clamp((t - labStart(i)) / labLen, 0, 1), h = hl(i, t), ink = css(mixc(INK, BLUE, h));
            n.el.style.opacity = out;
            n.dot.style.transform = `scale(${sm(0, 0.4, u).toFixed(4)})`; n.dot.style.background = ink;
            n.dot.style.boxShadow = h > 0.01 ? `0 0 ${(6 * h).toFixed(1)}px rgba(15,98,254,${(0.6 * h).toFixed(3)})` : "none";
            n.ln.style.transform = `scaleX(${sm(0.2, 0.8, u).toFixed(4)})`; n.ln.style.background = ink;
            n.lb.style.opacity = sm(0.5, 1, u); n.lb.style.transform = `translateX(${((1 - sm(0.5, 1, u)) * -8).toFixed(2)}px)`; n.lb.style.color = ink;
            n.lb.style.fontWeight = h > 0.05 ? "600" : "400";
          });
        },
        keys: [{ t: 0, x: 0, y: 0, z: ANN_Z, o: 1, f: 1, rect: "r" }] });

  /* ---- 5. the real v1 (live HTML from Figma, v1-ui.js) crossfades in over the wireframe once the camera is flat, then the three feedback notes. ---- */
  const liveKeys = [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, { t: live0, o: 0 }, { t: live1, o: 1, e: "inOutSine" }];
  add({ id: "sb-v1-form", label: "v1 form", kind: "section", depth: 10, html: U.formHtml(K1, 1682), rects: { r: F_FORM }, keys: liveKeys });
  add({ id: "sb-v1-head", label: "v1 header", kind: "nav", depth: 11, html: U.headerHtml(K1, 1682), rects: { r: F_HEAD }, keys: liveKeys.map(k => ({ ...k })) });
  NOTES.forEach((n, i) => {
    const a = V(B.notes[0] + i * B.noteStep), b = a + V(B.noteLen);
    add({ id: n.id, label: n.tag, kind: "card", depth: 12, rects: { r: { x: FX + n.x, y: FY + n.y, w: NOTE_W, h: NOTE_H } },
          html: `<div class="fb-note" style="--k:${K1}"><div class="fb-tag">${n.tag}</div><div class="fb-text">${n.text}</div></div>`,
          keys: [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, { t: a, o: 0 }, { t: b, o: 1, e: "inOutSine" }] });
  });

  SC.ariaLabel += " The diagram's text and connectors fade, leaving its cards. The camera tilts back into an isometric view as seven of the cards stack into seven wireframe layers (Industry solutions, Capabilities, APM, FSM, Real estates and facilities, EAM, HSE) with a blue-headed assessment card dropping on top, and each layer is labelled. The layers light up one by one. The camera then flattens and the card grows into the first version of the assessment, with three feedback notes pinned on it.";

  // Activity that lives inside update() hooks, declared so the pacing audit sees it (presence only: opacity keys, no stage motion).
  SC.extras = (SC.extras || []).concat([
    { id: "layer labels draw in", keys: [{ t: V(B.labels[0]), o: 0 }, { t: V(B.labels[1]), o: 1 }] },
    { id: "layer scan (validate by hand)", keys: [{ t: V(B.scan[0]), o: 0 }, { t: V(B.scan[1]), o: 1 }] }
  ]);
})();
