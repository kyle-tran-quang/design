/* =========================================================================
   HAND CARD PIECE: Figma 208:6497 > 235:7773 "Anim-simplifiedExport" (660 x 447 at stage (30.1, 288)), rebuilt as live SVG so its pills can travel.
   update(body, k, t) is a PURE FUNCTION of scroll progress t (scroll is the only clock; the Figma loop is scrubbed once, as the author chose).

   GEOMETRY is copied from Figma (use_figma exportAsync of each node), in STAGE coordinates:
     card frame        Vector 235:7807   (170.48, 402.49)  397 x 207   stroke #8D8D8D 0.54
     left disc arc     Vector 235:7775   (117.93, 454.30)  53 x 104    (half ring on the left edge)
     lines (6)         Group  235:7778   (169.4, 419.75)   horizontal lines at y +0.27, +34.85, +69.36, +103.87, +138.29, +172.9
     converging curves 235:7788/7789/7790/7791  (351.68, 454.32 ...)  from the lines' ends to the node
     stub              235:7792          (506.9, 506.06) 60 x 0
     node              Group 235:7794    (506.9, 489.6)  32 x 33 (a ring + dot: the burst that pulses 1 -> 1.1 -> 1)
     bottom-left curve 235:7806          (170.48, 514.72) 380 x 95
     right rings + hand are raster (assets/act1b/handcard-right.png): rings 235:8215-8217 and the hand group, which never change.
   MOTION is the Figma timeline (get_motion_context on 235:7773, a 4.002s loop): six pills ("Nudge motion" groups) each travel a path from their start to the node, shrinking
   (scale x 1 -> 0.15, y 1 -> 0.3) and fading (opacity 0 -> 1 -> 0.6 -> 0), starts staggered. The keyframes below are the exact (time %, tx, ty) values.
   ========================================================================= */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const f2 = v => v.toFixed(2);
  const HEX = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = HEX(a), B = HEX(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join(""); };
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;           // cubic-bezier(.5,0,.5,1) ~ inOutCubic

  // ---- the six pills. base = the pill's rect (stage), from = its Figma translate at 0%, tx / ty = keyframes as [percent, value] (linear between), op = opacity keyframes, sx / sy = scale keyframes.
  // Read from get_motion_context (kf_235_<id>_...). Percentages are of the 4.002s loop. Values are in px of translation FROM the pill's base position.
  const PILLS = [
    { id: "7875", base: [274.02, 480.21], tx: [[0,-104.3],[33.333,-104.3],[35.833,-89.139],[38.333,-73.977],[40.833,-58.816],[43.333,-43.654],[45.833,-28.493],[48.333,-13.332],[50.833,1.83],[53.333,16.991],[55.833,32.153],[58.333,47.314],[60.833,62.475],[63.333,77.637],[65.333,95.774],[67.333,113.296],[69.333,129.558],[71.333,146.658],[73.333,161.69],[75.333,177.076],[77.333,191.525],[79.333,204.551],[81.333,218.092],[83.333,231.342]],
      ty: [[0,0],[63.333,0],[65.333,0.173],[67.333,1.982],[69.333,4.459],[71.333,8.251],[73.333,12.064],[75.333,14.931],[77.333,16.205],[79.333,16.855],[81.333,17.204],[83.333,17.253]],
      sx: [[0,1],[63.333,1],[65.333,0.9],[67.333,0.8],[69.333,0.7],[71.333,0.6],[73.333,0.5],[75.333,0.43],[77.333,0.36],[79.333,0.29],[81.333,0.22],[83.333,0.15]],
      sy: [[0,1],[69.333,1],[71.333,0.9],[73.333,0.8],[75.333,0.7],[77.333,0.6],[79.333,0.5],[81.333,0.4],[83.333,0.3]],
      op: [[0,0],[33.333,0],[36.667,1],[76.667,0.6],[82.5,0]] },
    { id: "7945", base: [291.28, 445.69], tx: [[0,-120.768],[16.667,-120.768],[19.167,-105.672],[21.667,-90.576],[24.167,-75.48],[26.667,-60.384],[29.167,-45.288],[31.667,-30.192],[34.167,-15.096],[36.667,0],[39.167,15.096],[41.667,30.192],[44.167,45.288],[46.667,60.384],[48.667,78.521],[50.667,95.882],[52.667,112.951],[54.667,125.839],[56.667,139.895],[58.667,153.013],[60.667,169.407],[62.667,187.132],[64.667,199.864],[66.667,214.089]],
      ty: [[0,0],[46.667,0],[48.667,0.518],[50.667,5.151],[52.667,13.09],[54.667,21.578],[56.667,32.722],[58.667,41.01],[60.667,47.738],[62.667,51.124],[64.667,52.14],[66.667,51.758]],
      sx: [[0,1],[46.667,1],[48.667,0.9],[50.667,0.8],[52.667,0.7],[54.667,0.6],[56.667,0.5],[58.667,0.43],[60.667,0.36],[62.667,0.29],[64.667,0.22],[66.667,0.15]],
      sy: [[0,1],[52.667,1],[54.667,0.9],[56.667,0.8],[58.667,0.7],[60.667,0.6],[62.667,0.5],[64.667,0.4],[66.667,0.3]],
      op: [[0,0],[16.667,0],[20,1],[60,0.6],[65.833,0]] },
    { id: "8010", base: [230.88, 445.69], tx: [[0,-60.384],[2.5,-43.589],[5,-26.794],[7.5,-9.999],[10,6.796],[12.5,23.592],[15,40.387],[17.5,57.182],[20,73.977],[22.5,90.772],[25,107.568],[27.5,124.363],[30,141.293],[32,157.703],[34,171.816],[36,182.684],[38,188.545],[40,193.194],[42,200.565],[44,206.181],[44.333,216.939],[46,231.407],[48,237.645],[50,274.474]],
      ty: [[0,-34.505],[27.5,-34.505],[30,-33.014],[32,-25.101],[34,-14.378],[36,-2.472],[38,4.787],[40,11.059],[42,20.548],[44,26.339],[44.333,36.331],[46,45.981],[48,48.52],[50,51.758]],
      sx: [[0,1],[30,1],[32,0.9],[34,0.8],[36,0.7],[38,0.6],[40,0.5],[42,0.43],[44,0.36],[46,0.29],[48,0.22],[50,0.15]],
      sy: [[0,1],[36,1],[38,0.9],[40,0.8],[42,0.7],[44,0.6],[46,0.5],[48,0.4],[50,0.3]],
      op: [[0,0],[3.333,1],[43.333,0.6],[49.167,0]] },
    { id: "8078", base: [317.16, 514.72], tx: [[0,-147.237],[8.333,-147.237],[10.833,-132.075],[13.333,-116.914],[15.833,-101.753],[18.333,-86.591],[20.833,-71.43],[23.333,-56.268],[25.833,-41.107],[28.333,-25.945],[30.833,-10.784],[33.333,4.377],[35.833,19.539],[38.333,34.7],[40.333,52.837],[42.333,70.262],[44.333,87.317],[46.333,103.755],[48.333,117.777],[50.333,133.132],[52.333,146.703],[54.333,162.096],[56.333,175.314],[58.333,188.405]],
      ty: [[0,0.097],[38.333,0.097],[40.333,-0.075],[42.333,-1.664],[44.333,-4.792],[46.333,-8.119],[48.333,-11.62],[50.333,-14.492],[52.333,-16.151],[54.333,-16.79],[56.333,-16.995],[58.333,-17.155]],
      sx: [[0,1],[38.333,1],[40.333,0.9],[42.333,0.8],[44.333,0.7],[46.333,0.6],[48.333,0.5],[50.333,0.43],[52.333,0.36],[54.333,0.29],[56.333,0.22],[58.333,0.15]],
      sy: [[0,1],[44.333,1],[46.333,0.9],[48.333,0.8],[50.333,0.7],[52.333,0.6],[54.333,0.5],[56.333,0.4],[58.333,0.3]],
      op: [[0,0],[8.333,0],[11.667,1],[51.667,0.6],[57.5,0]] },
    { id: "8146", base: [196.36, 514.72], tx: [[0,-26.663],[25,-26.663],[27.5,-10.064],[30,6.535],[32.5,23.134],[35,39.733],[37.5,56.332],[40,72.932],[42.5,89.531],[45,106.13],[47.5,122.729],[50,139.328],[52.5,155.927],[55,172.515],[57,188.784],[59,198.559],[61,210.445],[63,220.847],[65,232.422],[67,241.42],[69,254.247],[71,266.996],[73,285.449],[75,308.979]],
      ty: [[0,34.505],[52.5,34.505],[55,32.85],[57,29.77],[59,26.186],[61,19.693],[63,11.539],[65,3.132],[67,-2.718],[69,-10.071],[71,-14.398],[73,-17.573],[75,-17.253]],
      sx: [[0,1],[55,1],[57,0.9],[59,0.8],[61,0.7],[63,0.6],[65,0.5],[67,0.43],[69,0.36],[71,0.29],[73,0.22],[75,0.15]],
      sy: [[0,1],[61,1],[63,0.9],[65,0.8],[67,0.7],[69,0.6],[71,0.5],[73,0.4],[75,0.3]],
      op: [[0,0],[25,0],[28.333,1],[68.333,0.6],[74.167,0]] },
    { id: "8214", base: [230.88, 583.75], tx: [[0,-60.384],[41.667,-60.384],[44.167,-45.354],[46.667,-30.323],[49.167,-15.292],[51.667,-0.261],[54.167,14.769],[56.667,29.8],[59.167,44.831],[61.667,59.861],[64.167,74.892],[66.667,89.923],[69.167,104.954],[71.667,119.984],[73.667,138.214],[75.667,154.939],[77.667,168.039],[79.667,176.733],[81.667,193.003],[83.667,202.68],[85.667,210.373],[87.667,224.789],[89.667,238.246],[91.667,274.474]],
      ty: [[0,0],[71.667,0],[73.667,-0.863],[75.667,-7.163],[77.667,-16.641],[79.667,-25.411],[81.667,-44.784],[83.667,-56.834],[85.667,-65.316],[87.667,-77.231],[89.667,-83.531],[91.667,-86.263]],
      sx: [[0,1],[71.667,1],[73.667,0.9],[75.667,0.8],[77.667,0.7],[79.667,0.6],[81.667,0.5],[83.667,0.43],[85.667,0.36],[87.667,0.29],[89.667,0.22],[91.667,0.15]],
      sy: [[0,1],[77.667,1],[79.667,0.9],[81.667,0.8],[83.667,0.7],[85.667,0.6],[87.667,0.5],[89.667,0.4],[91.667,0.3]],
      op: [[0,0],[41.667,0],[45,1],[85,0.6],[90.833,0]] }
  ];

  // The static card is the Figma export of 235:7773 with the six pills and the pulsing node temporarily hidden (assets/act1b/handcard-clean.png, 2x). Drawn as one <image> at its Figma rect.
  const BASE = `<image href="${window.MG_BASE}act1b/handcard-clean.png" x="30.1" y="288" width="660" height="447" preserveAspectRatio="none"/>`;
  // The pulsing node (Figma 235:7801 + 235:7802): a #BE95FF circle 32.15 x 32.94 at (506.9, 489.59) with a #EAD8F9 dot 16.47 at (514.74, 498.21). It pulses 1 -> 1.1 -> 1 about its centre (a 4.0s loop).
  const NODE = `<g data-node transform="translate(523 506.06)"><ellipse cx="0" cy="0" rx="16.075" ry="16.47" fill="#BE95FF"/><circle cx="0" cy="0.14" r="8.23" fill="#EAD8F9"/></g>`;

  // ---- MORPH from the dashboard wireframe (ALM skeleton, Figma 208:6309). Six of its grey blocks become the six pills; the rest of the wireframe fades.
  // `from` = the block's rect in stage coordinates (Figma absoluteBoundingBox, relative to slide 07/08: same 720 x 1024 stage), `fill` = its grey. Pairing by position (no crossings).
  //   skel-pill1 208:6393 -> pill 8010 | skel-pill2 208:6394 -> 7945 | skel-pill3 208:6395 -> 7875 | skel-pill4 208:6396 -> 8078 | skel-gs-item-2 208:6423 -> 8146 | skel-gs-item-3 208:6424 -> 8214
  const FROM = { "8010": { r: [172, 444, 69, 10], fill: "#E0E0E0" }, "7945": { r: [246, 443, 42, 10], fill: "#E0E0E0" }, "7875": { r: [293, 442, 46, 10], fill: "#E0E0E0" },
                 "8078": { r: [345, 440, 51, 10], fill: "#E0E0E0" }, "8146": { r: [220, 642, 120, 20], fill: "#E8E8E8" }, "8214": { r: [221, 663, 120, 20], fill: "#E8E8E8" } };
  // the Figma wireframe is tilted 1.13deg about its centre; the blocks start with that tilt and straighten as they travel
  const TILT = 1.127, WF_C = [360, 515];
  // The wireframe's window (Figma 208:6309: render bounds (43.6, 297.9) 633.1 x 435.3, rotated 1.13deg, white, radius ~8) shrinks, straightens and turns into the card's inner frame
  // (Figma 235:7807: (170.48, 402.49) 397.2 x 207.1, radius 17.5, 0.54 stroke #8D8D8D, no fill).
  const WIN = { from: { x: 43.6 + 316.55, y: 297.9 + 217.65, w: 622, h: 424, rot: 1.127, r: 8 }, to: { x: 170.48 + 198.6, y: 402.49 + 103.55, w: 397.2, h: 207.1, rot: 0, r: 17.5 } };    // centre-based
  const PW = 34.51, PH = 17.26, PILL_FILL = "#EAD8F9";
  // piecewise-linear lookup of a [[pct, value], ...] track at pct; before the first key = first value, after the last = last value
  const track = (kf, pct) => { if (pct <= kf[0][0]) return kf[0][1]; for (let i = 1; i < kf.length; i++) if (pct <= kf[i][0]) { const a = kf[i - 1], b = kf[i]; return lerp(a[1], b[1], (pct - a[0]) / (b[0] - a[0])); } return kf[kf.length - 1][1]; };

  // The Figma loop is 100% = 4.002s; a pill is "done" once its opacity track reaches 0 (its last key). The scene plays the 0..83.35% span once (the longest pill ends at 91.7%).
  const LOOP_END = 92;

  // The Figma loop is 4.002s. The author wants it to play on ITS OWN clock, not scrubbed by scroll: update() reads `clock()` (ms since the card became visible, supplied by
  // index.html's rAF loop) and never looks at scroll t. A deliberate exception to "scroll is the only clock", confined to this piece; it is idle (clock = 0) when the card is not on stage.
  const LOOP_MS = 4002;
  function make({ clock, morph, leave = () => 0, leaveSpan = 1 }) {                       // morph(t) -> 0..1: 0 = on the wireframe, 1 = landed in the card
    const pills = PILLS.map((p, i) => `<g data-pill="${i}" opacity="0"><rect x="0" y="0" width="${PW}" height="${PH}" rx="${PH / 2}" fill="${PILL_FILL}"/></g>`).join("");
    const html = `<svg viewBox="0 0 720 1024" width="720" height="1024" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block" fill="none" stroke-linecap="round" aria-hidden="true">` +
      `<g data-base><g data-img>` + BASE + `</g>` + NODE + `</g>` + `<rect data-win rx="8" fill="#fff" stroke="#8D8D8D" stroke-width="0"/>` + pills + `</svg>`;
    let R = null;
    const bind = body => { R = { body, pills: [...body.querySelectorAll("[data-pill]")], node: body.querySelector("[data-node]"), base: body.querySelector("[data-base]"), img: body.querySelector("[data-img]"), win: body.querySelector("[data-win]") }; };
    function update(body, k, t) {
      if (!R || R.body !== body) bind(body);
      const m = morph(t), ms = clock(), pct = ms > 0 ? ((ms % LOOP_MS) / LOOP_MS) * 100 : 0;
      // the window: shrinks from the wireframe's window to the card frame (m 0 -> 0.8), turning from a white sheet into an outline; it is then the card's own frame (drawn by BASE), so it fades
      const wu = ease(clamp(m / 0.8, 0, 1)), W0 = WIN.from, W1 = WIN.to, ww = lerp(W0.w, W1.w, wu), wh = lerp(W0.h, W1.h, wu);
      R.win.setAttribute("x", f2(-ww / 2)); R.win.setAttribute("y", f2(-wh / 2)); R.win.setAttribute("width", f2(ww)); R.win.setAttribute("height", f2(wh)); R.win.setAttribute("rx", f2(lerp(W0.r, W1.r, wu)));
      R.win.setAttribute("transform", `translate(${f2(lerp(W0.x, W1.x, wu))} ${f2(lerp(W0.y, W1.y, wu))}) rotate(${f2(lerp(W0.rot, 0, wu))})`);
      R.win.setAttribute("fill-opacity", f2(1 - sm(0.1, 0.8, m))); R.win.setAttribute("stroke-width", f2(0.54 * sm(0.5, 1, m))); R.win.setAttribute("stroke-opacity", f2(1 - sm(0.85, 1, m)));
      R.win.style.opacity = m > 0 && m < 1 ? 1 : 0;
      R.base.style.opacity = sm(0.35, 0.9, m);                       // the card's frame, lines, rings and hand rise under the travelling blocks
      const lv = leave(t);
      R.img.style.opacity = 1 - sm(0, 0.7, lv * leaveSpan);          // the card image (frame, lines, rings, hand) fades over the first 70% of the diagram morph (leave * leaveSpan = the morph's p); it is drawn HERE, UNDER the live pills, so they stay visible and running
      R.node.style.opacity = 1 - sm(0.4, 1, lv);
      R.pills.forEach((el, i) => {
        const p = PILLS[i], F = FROM[p.id], pc = [p.base[0] + PW / 2 + track(p.tx, 0), p.base[1] + PH / 2 + track(p.ty, 0)];     // the pill's centre at loop start
        if (m < 1) {                                                // morphing: the wireframe block travels to the pill's start pose
          const u = ease(clamp((m - 0.12 * i / 6) / (1 - 0.12), 0, 1)), fc = [F.r[0] + F.r[2] / 2, F.r[1] + F.r[3] / 2];
          const cx = lerp(fc[0], pc[0], u), cy = lerp(fc[1], pc[1], u), sx = lerp(F.r[2] / PW, 1, u), sy = lerp(F.r[3] / PH, 1, u), rot = lerp(TILT, 0, u);
          el.setAttribute("transform", `translate(${f2(cx)} ${f2(cy)}) rotate(${f2(rot)}) scale(${f2(sx)} ${f2(sy)}) translate(${f2(-PW / 2)} ${f2(-PH / 2)})`);
          el.firstChild.setAttribute("fill", mix(F.fill, PILL_FILL, u)); el.setAttribute("opacity", 1);
          return;
        }
        el.firstChild.setAttribute("fill", PILL_FILL);
        const tx = track(p.tx, pct), ty = track(p.ty, pct), sx = track(p.sx, pct), sy = track(p.sy, pct), op = track(p.op, pct);
        const cx = p.base[0] + PW / 2 + tx, cy = p.base[1] + PH / 2 + ty;
        el.setAttribute("transform", `translate(${f2(cx)} ${f2(cy)}) scale(${f2(sx)} ${f2(sy)}) translate(${f2(-PW / 2)} ${f2(-PH / 2)})`);
        el.setAttribute("opacity", f2(op * (1 - sm(0.4, 1, leave(t)))));
      });
      const pulse = pct < 50 ? lerp(1, 1.1, ease(pct / 25 > 1 ? 2 - pct / 25 : pct / 25)) : lerp(1, 1.1, ease((pct - 50) / 25 > 1 ? 2 - (pct - 50) / 25 : (pct - 50) / 25));   // Figma: 0% 1, 25% 1.1, 50% 1, 75% 1.1, 100% 1
      R.node.setAttribute("transform", `translate(523 506.06) scale(${f2(pulse)})`);
    }
    return { html, update, PILLS };
  }
  window.HandcardPiece = { make };
})();
