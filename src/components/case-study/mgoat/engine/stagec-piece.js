/* =========================================================================
   STAGE C PIECE: beat 11 "the second iteration". ONE live-HTML piece covering the whole stage (720 x 1024). update(body, k, t) is a PURE FUNCTION of scroll progress t.
   Contract: assembly-engine.js piece.html / piece.update (m-goat change 3).

   SOURCE: Figma file 1r4UreOVeEqdcXvnD5cetk, slide 13 stage 208:7717 > "ver3" 208:7718 (680 x 420, clips a 680 x 690 body). Built as live HTML from get_design_context
   (all sizes in Figma px; the screen is tiny on purpose: it is a 1:1 copy of the frame, so the zoom in C3 is a real zoom, not a raster upscale).
     sidebar 208:7720  (0,0) 231.2 x 419.6  #333       main 208:7753 (231.2,0) 448.8 x 690   form 208:7754 (74,0) 301.6 wide
     question 1 block 208:7763 (form-rel 23,48)  256.3 x 282   | question 2 208:7823 (23,300)  | sticky buttons 208:7885 (23, 419.6)
   FRAME POSITION: y 326.35 on slide 13, y 302 on slides 14 and 15 (Figma), so the frame settles 24px up as the form starts to scroll.

   THE WIREFRAME (C1) is the transitions-ui-generation look rebuilt as a pure function of scroll (the skill's own generate() runs on a clock and cannot be scrubbed):
   a dotted outline traced from the top centre both ways, then every box and text line of the screen traced in document order, MEASURED from the live DOM (same idea as the
   skill: nothing is hand-placed), then the real UI is revealed top to bottom behind a scan line while the drawing is wiped. Simplified vs the skill: no dot field, matrix rain,
   probe line, reticle or log panels.

   MY DECISIONS (not in any Figma frame; redirect freely):
     - camera: C1 starts 70% of the screen width, centred (full screen), then slides left and scales down to 1; C3 pushes to 2.1x on question 1
     - C2 scrolls the main column 272px (the full overflow) and the sticky Back / Next bar slides up from the fold as it scrolls
     - C3 scrolls back to the top while it zooms (lockstep), then a cursor ticks the first three options (the choice of options is mine)
   ========================================================================= */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const eio = u => { u = clamp(u, 0, 1); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  const eis = u => { u = clamp(u, 0, 1); return .5 - .5 * Math.cos(Math.PI * u); };   // sine in-out: peaks at 1.57x the average speed (cubic peaks at 3x), for the two long zoom moves
  const lerp = (a, b, u) => a + (b - a) * u;
  const win = (vh, w) => clamp((vh - w[0]) / (w[1] - w[0]), 0, 1);
  const HEX = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = HEX(a), B = HEX(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join(""); };
  const f1 = v => +v.toFixed(2);

  const A = window.MG_BASE + "stagec/";
  const SCR = { x: 20, y0: 326.35, y1: 302, w: 680, h: 420.05 };
  const SCROLL_MAX = 272;                         // form 692 - clip 420
  const Q1 = ["Reduce unplanned downtime", "Reduce maintenance costs", "Improve technician productivity", "Improve MRO inventory efficiency", "Extend asset lifespan",
              "Reduce compliance and safety risk", "Improve production quality and yield", "Meet service level commitments", "Improve operational visibility"];
  const Q2 = ["We lack visibility into asset health", "Too much work is reactive", "Maintenance costs continue to rise", "We struggle to plan and schedule work effectively",
              "Resource availability is difficult to manage", "Critical asset failures disrupt operations", "Inventory shortages delay work execution", "Data quality is inconsistent",
              "We struggle to prioritise improvement initiatives"];
  const FULL = { w: 1440, h: 1024 };               // the piece now spans the whole Figma slide (stage half + copy half); the final stage is its left half
  const CAM = {                                   // camera poses as {s, tx, ty}: stage point p -> p * s + t
    start: (() => { const s = (FULL.w * 0.70) / SCR.w, left = (FULL.w - SCR.w * s) / 2, top = (FULL.h - SCR.h * s) / 2; return { s, tx: left - SCR.x * s, ty: top - SCR.y0 * s }; })(),   // UI frame = 70% of the screen width, centred
    rest:  { s: 1, tx: 0, ty: 0 },
    q1:    (() => { const s = 2.1, cx = 475.5, cy = SCR.y1 + 189; return { s, tx: 360 - cx * s, ty: 512 - cy * s }; })()   // question 1 block centre -> centre of the LEFT half
  };

  /* The .sc-screen subtree (the 680 x 420 dark questionnaire) as markup. Exported so other pieces (stage-c-intro.js) reuse the REAL screen instead of copying it. */
  const opt = (txt, i, q) => `<div class="sc-opt" data-g="rect" data-q="${q}" data-i="${i}"><span class="sc-cb"><svg viewBox="0 0 6.468 6.468"><rect x=".202" y=".202" width="6.064" height="6.064" rx=".607"/><path d="M1.5 3.4 L2.8 4.7 L5 1.9" pathLength="1"/></svg></span><span class="sc-ot" data-g="text">${txt}</span></div>`;
  const head = (txt, ic) => `<div class="sc-qh"><div class="sc-h2" data-g="text">${txt}</div><div class="sc-info" data-g="rect"><img src="${A}${ic}" alt="" width="8.086" height="8.086"></div></div>`;
  function screenHTML() {
    return (
      `<div class="sc-screen">` +
        `<div class="sc-side" data-g="rect">` +
          `<div class="sc-logo" data-g="rect"><img src="${A}logo-base.svg" alt=""><div class="sc-logo-g"><img src="${A}logo-group.svg" alt=""></div><img class="sc-logo-d" src="${A}logo-dot.svg" alt=""></div>` +
          `<div class="sc-trow"><div class="sc-t1" data-g="text"><b>Maximo Application Suite</b><br>Growth readiness assessment</div><div class="sc-beta" data-g="text">beta v3</div></div>` +
          `<div class="sc-mid"><div class="sc-title" data-g="text">Your goals and priorities</div><div class="sc-page" data-g="text">Page 2 of 7</div></div>` +
          `<div class="sc-ibm" data-g="rect"><div class="sc-ibm-m"><img src="${A}ibm.svg" alt=""></div></div>` +
          `<div class="sc-art" data-g="rect"><img src="${A}sidebar-art.png" alt=""></div>` +
        `</div>` +
        `<div class="sc-main"><div class="sc-form">` +
          `<div class="sc-pbspace"></div>` +
          `<div class="sc-section">` +
            `<div class="sc-label"><span data-g="text">Goals &amp; priorities</span><i></i></div>` +
            `<div class="sc-q">${head("What are your top strategic business objectives? (choose up to 3)", "info-1.svg")}<div class="sc-opts">${Q1.map((t, i) => opt(t, i, 1)).join("")}</div></div>` +
            `<div class="sc-q">${head("What are your organisation’s biggest obstacles? (select all that apply)", "info-2.svg")}<div class="sc-opts">${Q2.map((t, i) => opt(t, i, 2)).join("")}</div></div>` +
          `</div>` +
        `</div></div>` +
        `<div class="sc-progress" data-g="rect"><div class="sc-pt"><div class="sc-pf"></div></div></div>` +
        `<div class="sc-btns"><div class="sc-btn" data-g="rect">Back</div><div class="sc-btn sc-next" data-g="rect">Next<img src="${A}arrow.svg" alt="" width="6.468" height="6.468"></div></div>` +
      `</div>`
    );
  }

  /* ---- COLLABORATORS (Figma-style multiplayer cursors; my decision, not in any Figma frame). Five people, one colour each (cursor, name flag). They work INSIDE the window (a clipped layer exactly over it),
     in window coordinates (680 x 420.05). Each follows a closed tour of waypoints [x, y, dwell ms, press]: dwell, then glide to the next with a sine in-out (hands, not robots). Periods differ per person
     (and each starts at its own offset), so they are never in step. Opacity is a pure function of scroll (TIMING.C.peers); the drift reads the page's free clock (SCENE.handClock), idle outside the window
     and under reduced motion, where each person rests on their first waypoint. Tips stay >= 70px from the right edge and 30px from the foot so a name flag never gets cut by the window. */
  const PEERS = [
    { n: "Kyle",     c: "#2b7bff", off: 0,    tour: [[286, 52, 1500, 0], [452, 96, 1100, 1], [584, 176, 1700, 0], [470, 262, 1200, 0], [330, 150, 1400, 1]] },
    { n: "Ashish",   c: "#1faa6b", off: 3100, tour: [[560, 60, 1300, 0], [606, 222, 1600, 1], [500, 340, 1300, 0], [352, 300, 1500, 0], [420, 190, 1100, 0]] },
    { n: "Karen",    c: "#e8509b", off: 1700, tour: [[90, 120, 1700, 0], [168, 52, 1100, 0], [214, 190, 1500, 1], [120, 280, 1300, 0]] },
    { n: "Ester",    c: "#f08a1c", off: 5200, tour: [[300, 360, 1400, 0], [428, 384, 1200, 1], [590, 330, 1500, 0], [540, 120, 1300, 0], [364, 248, 1100, 0]] },
    { n: "Tanushri", c: "#8a5cf6", off: 800,  tour: [[170, 360, 1600, 1], [60, 230, 1300, 0], [150, 30, 1200, 0], [260, 110, 1500, 0], [96, 330, 1100, 0]] }
  ];
  const GLIDE = 1250;                                              // ms per move
  PEERS.forEach(p => {                                             // cumulative times once: segment i = dwell at wp i, then the glide to wp i+1
    let c = 0; p.seg = p.tour.map(w => { const s = { a: c, d: w[2] }; c += w[2] + GLIDE; return s; }); p.T = c;
  });
  function peerPose(p, ms) {
    const t = (((ms + p.off) % p.T) + p.T) % p.T, n = p.tour.length;
    let i = n - 1; for (let k = 0; k < n; k++) if (t < p.seg[k].a + p.seg[k].d + GLIDE) { i = k; break; }
    const a = p.tour[i], b = p.tour[(i + 1) % n], u = t - p.seg[i].a - a[2];
    const m = u > 0 ? eis(u / GLIDE) : 0;
    const press = u <= 0 && a[3] ? Math.sin(clamp((t - p.seg[i].a - a[2] * .55) / 260, 0, 1) * Math.PI) : 0;   // a click in the second half of the dwell
    return { x: lerp(a[0], b[0], m), y: lerp(a[1], b[1], m), press };
  }

  let UID = 0;

  function make({ vh, T, clock }) {
    T = T || window.STAGEC.TIMING;
    const uid = "sc" + (++UID);

    const html =
      `<div class="sc-bgL"></div><div class="sc-bgR"></div>` +
      `<div class="sc-clip"><div class="sc-cam">` +
        screenHTML() +
        `<div class="sc-scan"></div>` +
        `<svg class="sc-wire" xmlns="http://www.w3.org/2000/svg"></svg>` +
        `<svg class="sc-cur" width="12" height="18" viewBox="0 0 12 18"><path d="M1 1 L1 14.2 L4.1 11.2 L6.3 16.6 L8.3 15.7 L6.1 10.4 L10.4 10.4 Z" fill="#fff" stroke="#161616" stroke-width="1" stroke-linejoin="round"/></svg>` +
      `<div class="sc-peers">${PEERS.map(p => `<div class="sc-peer" style="--pc:${p.c}"><svg class="sc-pa" width="14" height="15" viewBox="0 0 14 15"><path d="M1 1 L13 6.6 L6.4 7.7 L4.7 14 Z" fill="${p.c}" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/></svg><span class="sc-pn">${p.n}</span></div>`).join("")}</div>` +
      `</div></div>`;

    /* ---- first-update setup: refs, then measure the live DOM and build the wireframe from it. Re-run after fonts load (text widths change). */
    function setup(body) {
      const $ = s => body.querySelector(s);
      const st = body.__sc = body.__sc || {};
      st.bgL = $(".sc-bgL"); st.bgR = $(".sc-bgR"); st.clip = $(".sc-clip"); st.cam = $(".sc-cam"); st.screen = $(".sc-screen"); st.form = $(".sc-form"); st.btns = $(".sc-btns"); st.scan = $(".sc-scan");
      st.wire = $(".sc-wire"); st.cur = $(".sc-cur"); st.peers = $(".sc-peers"); st.peerEls = [...body.querySelectorAll(".sc-peer")];
      st.rows = [...body.querySelectorAll('.sc-opt[data-q="1"]')];
      const sr = st.screen.getBoundingClientRect();
      if (!sr.width) return false;                               // not laid out yet; try again next frame
      const ratio = sr.width / SCR.w, prevTf = st.form.style.transform;
      st.form.style.transform = "none";                          // measure at scroll 0
      const loc = r => ({ x: (r.left - sr.left) / ratio, y: (r.top - sr.top) / ratio, w: r.width / ratio, h: r.height / ratio });
      const parts = [];
      body.querySelectorAll("[data-g]").forEach(el => {
        if (el.dataset.g === "rect") { const r = loc(el.getBoundingClientRect()); if (r.w > 1 && r.h > 1 && r.y < SCR.h - 2 && r.y + r.h > 2) parts.push({ t: "r", ...r }); }
        else {
          const rg = document.createRange(); rg.selectNodeContents(el);
          [...rg.getClientRects()].forEach(q => { const r = loc(q); if (r.w > 2 && r.y < SCR.h - 2) parts.push({ t: "l", x: r.x, y: r.y + r.h * .62, w: r.w, h: 0 }); });
        }
      });
      st.tick = st.rows.slice(0, 3).map(el => { const c = loc(el.querySelector(".sc-cb").getBoundingClientRect()); return { x: c.x + c.w / 2, y: c.y + c.h / 2 }; });
      st.start = (() => { const r = loc(st.rows[6].getBoundingClientRect()); return { x: r.x + r.w - 40, y: r.y + r.h / 2 }; })();
      st.form.style.transform = prevTf;

      // wireframe: outline halves first, then the parts in document order
      const W = SCR.w, H = SCR.h, cx = W / 2;
      const items = [
        { d: `M${cx} 0 H${W} V${H} H${cx}`, len: cx + H + cx, o: 1 },
        { d: `M${cx} 0 H0 V${H} H${cx}`, len: cx + H + cx, o: 1 }
      ].concat(parts.map((p, i) => p.t === "r"
        ? { d: `M${f1(p.x)} ${f1(p.y)} h${f1(p.w)} v${f1(p.h)} h${f1(-p.w)} z`, len: 2 * (p.w + p.h), o: 0 }
        : { d: `M${f1(p.x)} ${f1(p.y)} h${f1(p.w)}`, len: p.w, o: 0 }));
      let defs = "", g = "";
      items.forEach((it, i) => {
        const n = Math.max(2, Math.round(it.len / 4.5)), gap = f1(it.len / n - .01);
        defs += `<mask id="${uid}m${i}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="${W + 60}" height="${H + 60}"><path d="${it.d}" pathLength="1" fill="none" stroke="#fff" stroke-width="9" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask>`;
        g += `<path d="${it.d}" fill="none" stroke="#6c6c6c" stroke-width="${it.o ? 1.45 : 1.2}" stroke-linecap="round" stroke-dasharray="0.01 ${gap}" mask="url(#${uid}m${i})"/>`;
      });
      const hs = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => `<rect class="h" x="${x - 2.5}" y="${y - 2.5}" width="5" height="5" fill="#f4f4f4" stroke="#8d8d8d" stroke-width="1"/>`).join("");
      st.wire.setAttribute("viewBox", `0 0 ${W} ${H}`);
      st.wire.innerHTML = `<defs>${defs}</defs>${g}${hs}<text class="lab" x="0" y="-9" fill="#8d8d8d" font-size="7.5" font-family="ui-monospace,Menlo,monospace" letter-spacing=".4">0 × 0</text>`;
      st.masks = [...st.wire.querySelectorAll("mask path")]; st.handles = [...st.wire.querySelectorAll("rect.h")]; st.lab = st.wire.querySelector(".lab");
      st.n = items.length; st.dirty = false;
      return true;
    }
    function reflow(body) { if (body.__sc) body.__sc.dirty = true; }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => document.querySelectorAll(".asm [data-html]").forEach(el => { const b = el.firstChild; if (b && b.__sc) b.__sc.dirty = true; }));

    function update(body, k, t) {
      let st = body.__sc;
      if (!st || st.dirty) { if (!setup(body)) return; st = body.__sc; }
      const v = vh(t);

      // ---- windows
      const camU = eio(win(v, T.camera)), bgU = sm(win(v, T.bg)), drawU = win(v, T.draw), revU = eio(win(v, T.reveal));
      const c2 = eio(win(v, T.scroll)), zU0 = eis(win(v, T.zoom)), oU = T.out ? eis(win(v, T.out)) : 0, zU = zU0 * (1 - oU);   // out: the zoom unwinds (lockstep with the form scrolling back, which zU already drives)
      const scrollPx = SCROLL_MAX * c2 * (1 - zU0);                // C3 scrolls the form back to the top while it zooms in, and it STAYS at the top during the exit

      // ---- stage + camera. C1 is full screen: light backdrop, the UI frame at 70% of the screen width. Once the polished UI is in, the backdrop turns dark (left #262626 = stage,
      // right #161616 = the copy column), then the frame slides left and scales down into its Figma pose. The right-hand cover hands over to the text column as the camera lands.
      const covU = T.cover ? sm(win(v, T.cover)) : 1;              // wiring: the whole overlay is a light cover that fades in over the end of Stage B's rest (hides its v1 + notes), then C1 plays on it
      const bgRU = (T.coverR ? sm(win(v, T.coverR)) : covU) * (1 - sm((camU - .5) / .5));   // the right backdrop (the text column) arrives AFTER Stage B's text has left (coverR), never dimming it              // the right-hand backdrop hands over to the text column across the second half of the slide (8vh, a fade not a pop)
      st.state = { covU, bgU, camU, bgRU };                        // read by stage-c.js (external backdrops)
      if (!T.external) {                                           // standalone test page: the backdrops live inside the piece
        st.bgL.style.background = mix("#f4f4f4", "#262626", bgU); st.bgR.style.background = mix("#ffffff", "#161616", bgU);
        st.bgL.style.opacity = covU.toFixed(3); st.bgR.style.opacity = bgRU.toFixed(3);
      }
      if (T.external && !st.extSet) { st.extSet = true; st.bgL.style.display = st.bgR.style.display = "none"; }   // wired: the viewport-sized backdrops are drawn by stage-c.js
      if (T.external) { st.clip.style.overflow = camU >= 1 ? "hidden" : "visible"; st.clip.style.width = "720px"; }   // wired: the engine root IS the stage column; C1 spills over the page until it lands, then it is clipped to the column
      else { st.clip.style.overflow = "hidden"; st.clip.style.width = (camU >= 1 ? 720 : FULL.w) + "px"; }
      const a = T.startPose ? T.startPose() : CAM.start, b = CAM.rest, c = CAM.q1;
      const cam = zU > 0 ? { s: lerp(b.s, c.s, zU), tx: lerp(b.tx, c.tx, zU), ty: lerp(b.ty, c.ty, zU) }
                         : { s: lerp(a.s, b.s, camU), tx: lerp(a.tx, b.tx, camU), ty: lerp(a.ty, b.ty, camU) };
      st.cam.style.transform = `translate(${f1(cam.tx)}px,${f1(cam.ty)}px) scale(${cam.s.toFixed(4)})`;
      const top = lerp(lerp(SCR.y0, SCR.y1, c2), SCR.y0, oU);        // settles up 24px as the scroll begins (Figma slides 14, 15); the exit returns it to y0 = 326.35, the pose Stage D's report morphs from
      st.screen.style.top = top.toFixed(2) + "px"; st.wire.style.top = SCR.y0 + "px";
      st.form.style.transform = `translateY(${-scrollPx.toFixed(2)}px)`;
      st.btns.style.top = (420 - 36 * sm(scrollPx / SCROLL_MAX)).toFixed(2) + "px";     // sticky bar rises from the fold as the form scrolls

      // ---- reveal (C1): the real UI comes in top to bottom behind a scan line; the wireframe is wiped below it
      const front = lerp(-60, SCR.h + 60, revU);
      const live = revU < 1;
      st.screen.style.webkitMaskImage = st.screen.style.maskImage = live ? `linear-gradient(to bottom,#000 ${f1(front - 28)}px,transparent ${f1(front)}px)` : "none";
      {                                                           // MORPH from the first iteration (wired page only, T.morph): the window fades in while its bottom edge grows from the v1's height (374) to its own (420)
        const mU = T.morph ? sm(win(v, T.morph)) : 1;
        st.screen.style.opacity = mU >= 1 ? "" : mU.toFixed(3);
        st.screen.style.clipPath = mU >= 1 ? "none" : `inset(0 0 ${f1((1 - mU) * 46)}px 0)`;
      }
      st.wire.style.display = live ? "block" : "none";
      st.wire.style.webkitMaskImage = st.wire.style.maskImage = `linear-gradient(to bottom,transparent ${f1(front - 20)}px,#000 ${f1(front + 8)}px)`;
      st.scan.style.top = f1(SCR.y0 + front) + "px"; st.scan.style.opacity = revU > 0 && revU < 1 ? .85 : 0;
      {                                                           // always written (not only while `live`): the DOM must be a pure function of t, also for the hidden wireframe
        const N = st.n, o = eio(drawU / .3);                       // outline: the first 30% of the draw window
        st.masks.forEach((m, i) => {
          const u = i < 2 ? o : eio((drawU - (.16 + .62 * ((i - 2) / Math.max(1, N - 3)))) / .22);
          const val = (1 - clamp(u, 0, 1)).toFixed(4);
          if (m.__v !== val) { m.__v = val; m.setAttribute("stroke-dashoffset", val); }   // skip identical writes (the cache mirrors the DOM, so it stays pure)
        });
        st.handles.forEach(h => h.setAttribute("opacity", sm((o - .6) / .4).toFixed(3)));
        st.lab.textContent = `${Math.round(SCR.w * o)} × ${Math.round(SCR.h * o)}`; st.lab.setAttribute("opacity", sm(o * 2).toFixed(3));
      }

      // ---- C3: cursor ticks the first three options of question 1
      const tk = st.tick, tv = v - T.ticks[0], seg = (T.ticks[1] - T.ticks[0]) / 3, moveLen = seg * 2 / 3;
      const show = sm((v - (T.ticks[0] - 4)) / 4) * (1 - sm(T.out ? win(v, T.out) * 3 : 0));        // the cursor leaves in the first third of the exit
      let pos = { x: st.start.x, y: st.start.y }, press = 0, hover = [0, 0, 0], checked = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        const t0 = i * seg, from = i ? tk[i - 1] : st.start, mu = eio((tv - t0) / moveLen), pu = clamp((tv - t0 - moveLen) / (seg - moveLen), 0, 1);
        if (tv >= t0) {
          pos = { x: lerp(from.x, tk[i].x, mu), y: lerp(from.y, tk[i].y, mu) };
          hover[i] = sm((tv - t0 - moveLen * .6) / (moveLen * .4)) * (i < 2 ? 1 - sm((tv - (t0 + seg) - 0) / (moveLen * .3)) : 1);
          if (pu > 0) press = Math.max(press, Math.sin(pu * Math.PI));
          checked[i] = sm((tv - t0 - moveLen - (seg - moveLen) * .15) / ((seg - moveLen) * .6));
        }
      }
      if (T.peers && st.peerEls) {                                // collaborators: fade with scroll, drift on the free clock
        const pv = sm(win(v, [T.peers[0], T.peers[0] + 14])) * (1 - sm(win(v, [T.peers[1] - 14, T.peers[1]]))), ms = clock ? clock() : 0;
        st.peers.style.opacity = pv.toFixed(3); st.peers.style.display = pv > 0 ? "block" : "none";
        if (pv > 0) st.peerEls.forEach((el, i) => {
          const q = peerPose(PEERS[i], ms);
          el.style.transform = `translate(${f1(q.x)}px,${f1(q.y)}px)`;
          el.firstChild.style.transform = `scale(${(1 - .18 * q.press).toFixed(3)})`;
        });
      }
      const SX = SCR.x, SY = SCR.y1;
      st.cur.style.opacity = show;
      st.cur.style.transform = `translate(${f1(SX + pos.x - 1)}px,${f1(SY + pos.y - 1)}px) scale(${(1 - .16 * press).toFixed(3)})`;
      st.rows.forEach((row, i) => {
        const un = 1 - sm(T.out ? win(v, T.out) * 2.5 : 0);                // raw window progress (not the eased oU): the ticks + hover are fully cleared by 40% of the exit, so the last frame is exact even if the scroll stops a hair short of the end                                // the exit also clears the ticks + hover (first ~45% of the exit), so the last frame is EXACTLY the C1 rest pose Stage D morphs from
        const hv = i < 3 ? hover[i] * un : 0, ck = i < 3 ? checked[i] * un : 0;
        row.style.background = mix("#262626", "#333333", hv);
        const sv = row.firstChild.firstChild;                      // the checkbox svg: a hairline rect (stroke .404 = Figma's; a CSS border would snap to a full pixel and look heavy when zoomed) + the tick
        sv.firstChild.style.fillOpacity = ck.toFixed(3); sv.lastChild.style.strokeDashoffset = (1 - ck).toFixed(3);
      });
    }

    return { html, update, reflow };
  }

  window.StagecPiece = { make, screenHTML, CAM, SCR, SCROLL_MAX };
})();
