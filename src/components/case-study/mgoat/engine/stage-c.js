/* =========================================================================
   STAGE C (beat 11, "the second iteration"): wiring. Loaded AFTER stage-b.js. It does NOT touch Stage A or B's pieces; it only adds one overlay + one scene hook.
   Pieces / data: stagec-data.js (local timing + copy), stagec-piece.js (the dark screen, scroll, zoom, cursor), stagec.css.
   Windows: TIMING.C (story.js, vh of scroll). Retime there.

   NO SCROLL-DRIVEN C1 ANY MORE. The full-screen generation (cover, wireframe, reveal, backdrop turning dark, frame sliding into the left half) is a one-off, clock-based, scroll-locked
   intro owned by stage-c-intro.js (TIMING.C.intro = { trigger: 778, land: 872 }). This file is the page UNDERNEATH it: from TIMING.C.start (778) to TIMING.C.end (1106) it shows Stage C's LANDED
   layout and nothing else, with no animation between 778 and the first scroll window (893):
     - the dark questionnaire window at its rest pose: 680 x 420.05 at (20, 326.35) of the stage column, 1x, form scrolled to the top, no ticks, no cursor
     - the left half (the stage column) on the backdrop #262626; the right half is the page's own dark text column (#161616, index.html: the beat's theme is dark from 778, no light phase)
   There is no replay. After the intro, scrolling back below 778 hard-cuts to Stage B (the overlay is simply hidden), and scrolling forward again shows the landed state directly.

   WHY AN OVERLAY. The window used to need a full-viewport canvas for C1, and Stage D's hand-over (stage-d.js) is built on this overlay being visible up to TIMING.C.end and hidden past it, so
   C draws into a fixed full-viewport overlay with its OWN engine instance. The overlay's world is placed with the SAME scale and centre rule as the main scene (stage 720 x 1024, fit 1, camera
   0.8/0.8): its stage column coincides with the main stage's pixels.

   HAND-OVER
     in : at 778 the overlay is visible and opaque over the left half (Stage B's v1 + notes sit under it). Stage B's last pieces are keyed out 1vh later so that whatever follows Stage C
          (Stage D) does not find them there again.
     out: the overlay is visible from TIMING.C.start to TIMING.C.end (a pure function of scroll; nothing to call). Its LAST frame is the rest pose (byte-identical to the 778 frame).
          Stage D draws its own identical window and takes over beyond TIMING.C.end. window.StageC = { overlay, end, startVh, T, START } for reference.
   ========================================================================= */
(function () {
  const TT = window.TIMING, C = TT && TT.C, SP = window.StagecPiece, SD = window.STAGEC, AS = window.AssemblyScene;
  if (!C || !SP || !SD || !AS) return;

  const START = C.start;                                                               // global vh of the beat's local 0 = 778 (the end of Stage B; the overlay appears here, already landed)
  const loc = v => v - START;                                                          // global vh -> stagec-data local vh
  const T = {};                                                                        // the piece reads LOCAL windows from stagec-data.js; recompute them from TIMING.C so retiming in story.js is enough
  Object.keys(SD.TIMING).forEach(k => { T[k] = SD.TIMING[k]; });
  ["scroll", "zoom", "ticks", "out", "morph", "peers"].forEach(k => { if (C[k]) T[k] = [loc(C[k][0]), loc(C[k][1])]; });
  // The piece's C1 windows (draw, reveal, bg, camera) are retired: the intro plays them on a clock. The piece still reads them, so hand it windows that ended before the beat's local 0:
  // at every vh >= 0 it renders the landed frame (UI revealed, no wireframe, backdrop dark, camera at the rest pose). No cover windows (cover, coverR): the piece then draws no cover at all.
  const LANDED = [-2, -1];
  ["draw", "reveal", "bg", "camera"].forEach(k => { T[k] = LANDED; });
  delete T.cover; delete T.coverR;
  T.MAX = TT.MAX;
  T.external = true;                                                                   // the backdrop is drawn here (viewport-sized), not inside the piece

  const piece = SP.make({ vh: t => t * TT.MAX - START, T, clock: () => (SCENE.handClock ? SCENE.handClock() : 0) });   // piece time is the SCENE progress t; the piece converts to LOCAL vh
  // the peers' drift runs on the page's free clock (page.js handTick), which only advances while SCENE.handOn(t) is true: extend it to the peers' window (idle everywhere else, and under reduced motion)
  { const prevOn = SCENE.handOn, pw = C.peers; if (pw) SCENE.handOn = t => (prevOn ? prevOn(t) : false) || (t * TT.MAX >= pw[0] - 1 && t * TT.MAX <= pw[1] + 1); }
  const SC = {
    ariaLabel: "The second iteration of the assessment: a dark questionnaire screen, scrolled and zoomed to its first question.", hud: false, grid: false, fit: 1,
    frames: { stage: { w: 720, h: 1024 } },
    pieces: [{ id: "stagec", label: "Second iteration", kind: "media", depth: 0, rects: { r: { x: 0, y: 0, w: 720, h: 1024 } }, html: piece.html, update: piece.update, keys: [{ t: 0, x: 0, y: 0, z: 0, o: 1, f: 1, rect: "r" }] }],
    camera: [{ t: 0, rx: 0, rz: 0, s: 0.8 }, { t: 1, rx: 0, rz: 0, s: 0.8 }]
  };
  // ---- MORPH v1 -> dark v2 (a pure function of scroll, so it also plays backwards). Window: TIMING.C.morph. Over it the dark window fades in over the v1 while its bottom edge grows from the
  // v1's height (374) to its own (420) (stagec-piece.js, T.morph), the left backdrop darkens, and the feedback notes leave first. The v1 stays fully opaque underneath until the window
  // is opaque, then it is keyed out (no mid-fade dip). Outside the window nothing differs from the plain landed state: u = 0 before 778, u = 1 from the end of the window on.
  const MORPH = C.morph || [START, START + 1], sm01 = u => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
  const morphAt = t => sm01((t * TT.MAX - MORPH[0]) / (MORPH[1] - MORPH[0]));

  // ---- clean hand-over: Stage B's last pieces (the v1, its notes) are still keyed on the main scene. They sit under the overlay until the morph has finished, but whatever follows Stage C
  // (Stage D) would find them there again, so they are keyed out as the morph completes (the notes fade over the first 45% of it). Pure keys, so scrolling back restores them exactly.
  // Data on the shared SCENE, applied ONCE per page load: the module is cached, so this never runs a second time.
  {
    const tS = START / TT.MAX, tE = MORPH[1] / TT.MAX, tN = (MORPH[0] + 0.45 * (MORPH[1] - MORPH[0])) / TT.MAX, eps = 0.0005;
    SCENE.pieces.forEach(p => {
      const ks = p.keys; if (!ks || !ks.length) return;
      const last = ks[ks.length - 1]; if (last.t >= tE - eps) return;                      // already keyed past this point by someone else
      let o = 0; for (let i = ks.length - 1; i >= 0; i--) if (ks[i].o !== undefined) { o = ks[i].o; break; }
      if (o === 0) return;                                                                 // already invisible at the end of Stage B
      if (/^sb-note-/.test(p.id)) ks.push({ t: tS, o }, { t: tN, o: 0 });
      else ks.push({ t: tE - eps, o }, { t: tE, o: 0 });
    });
  }

  // ---- The data above is wired ONCE, when the module loads. The DOM below is built PER VISIT: window.StageC.mount() (called by page.js once the page markup exists) builds the overlay and returns the
  // function that removes it. The module is cached across visits, so nothing here may capture an element at load.
  const tOn = +(START / TT.MAX).toFixed(5), tOff = (C.end + 0.05) / TT.MAX;      // the overlay appears at the SAME scene progress as the `second` beat (story.js: f(778)), so the theme flip and the overlay are one frame
  let live = null;                                                               // the mounted overlay's hook, or null while the page is not on screen
  let lastT = 0;
  window.StageC = { overlay: null, end: C.end, startVh: START, T, START, mount };   // stage-d.js reads T at load; the overlay is only for reference

  // Installed ONCE, never replaced: stage-f.js wraps this function when it loads, so a per-visit reassignment would drop Stage F's hook.
  SCENE.afterRender = function (t) { lastT = t; if (live) live.after(t); };

  function mount() {
    const layout = document.getElementById("layout"), mainScene = document.getElementById("scene"), pr = document.getElementById("progress");
    if (!layout || !mainScene || !pr) return () => {};

    // ---- the overlay: fixed, full viewport, above the layout, inert. Inside it: the stage backdrop (left half) and the stage COLUMN, a box placed exactly where .stage-col is, holding the engine.
    // The engine therefore builds the SAME world (720 x 1024, same scale, same centre) as the main scene, so the landed frame is the main stage's pose by construction.
    // The right half is not drawn here: it is the page's dark text column.
    const ov = document.createElement("div");
    ov.id = "stageC"; ov.setAttribute("aria-hidden", "true");
    ov.style.cssText = "position:fixed;inset:0;z-index:2;pointer-events:none;visibility:hidden";
    const bgL = document.createElement("div"), col = document.createElement("div");
    bgL.style.cssText = "position:absolute;left:0;top:0;width:50%;height:100%;background:#262626";   // Figma slide 13 stage colour (the dark theme's --bg)
    col.style.cssText = "position:absolute;left:0;top:0;width:50%;height:100%";
    ov.append(bgL, col);
    pr.parentNode.insertBefore(ov, pr);                                         // progress lives in the React root, not directly under body
    const sheet = document.createElement("style");
    sheet.textContent = "#stageC .asm{overflow:visible;background:transparent} #stageC .asm-stage{overflow:visible}" +
      "@media (max-width:800px){#stageC .st-col{width:100%!important;height:40vh!important} #stageC>div:first-child{width:100%!important;height:40vh!important}}";
    document.head.appendChild(sheet); col.className = "st-col";
    const holder = col;
    const sceneC = AS.mount(holder, { scene: SC, story: { title: "Stage C", beats: [{ id: "second", range: [0, 1], theme: "dark", title: "Second iteration" }] } });
    window.StageC.overlay = ov;

    // ---- RASTER PRIME. The C3 zoom (2.1x) is only crisp if the camera layer was first rasterised at a large scale: Chromium fixes a composited layer's raster scale early and upscales it afterwards (the zoomed
    // text turns blocky). The old C1 got that for free (it first showed the window at the 70%-of-screen start pose, ~1.7x). The overlay now starts landed at 1x, so, once per mount, the camera is held at that
    // start pose for a few frames at 0.3% opacity (invisible; the page is under the hero then), then restored. Measured: without it the 2.1x text is blocky, with it the frames match the old page.
    const startPose = () => {
      const narrow = matchMedia("(max-width: 800px)").matches, wEl = holder.querySelector(".asm-world"), o = (narrow ? col : ov).getBoundingClientRect();
      const r = wEl && wEl.getBoundingClientRect(), ws = r ? r.width / 720 : 0, SCR = SP.SCR;
      if (!(ws > 0)) return { s: 1.7, tx: -200, ty: -150 };
      const s = 0.70 * o.width / (ws * SCR.w), cx = (o.left + o.width / 2 - r.left) / ws, cy = (o.top + o.height / 2 - r.top) / ws;
      return { s, tx: cx - (SCR.x + SCR.w / 2) * s, ty: cy - (SCR.y0 + SCR.h / 2) * s };
    };
    let priming = true, frames = 0, raf = 0;
    const prime = () => {
      ov.style.visibility = "visible"; ov.style.opacity = ".003";
      sceneC.render(tOn);
      const cam = holder.querySelector(".sc-cam"), p = startPose();
      if (cam) cam.style.transform = `translate(${p.tx.toFixed(2)}px,${p.ty.toFixed(2)}px) scale(${p.s.toFixed(4)})`;
      const step = () => {
        if (++frames < 4) { raf = requestAnimationFrame(step); return; }
        raf = 0; priming = false; ov.style.opacity = "";
        SCENE.afterRender(lastT);                                               // restore the overlay to the pure function of the current scroll (this also re-renders the landed pose)
      };
      raf = requestAnimationFrame(step);
    };

    // ---- the per-render hook, called through SCENE.afterRender after every main-scene render. A pure function of t, so scrolling back reverses it.
    const mainAsm = mainScene;                                                  // the engine makes the container itself the .asm root
    const hook = {
      after(t) {
        if (priming) return;                                                    // the prime owns the overlay for its first few frames
        const on = t >= tOn && t <= tOff;                                       // visible from 778 to the END of Stage C. Above this the overlay is gone and whatever follows (Stage D) shows its own, identical window
        ov.style.visibility = on ? "visible" : "hidden";
        const mu = morphAt(t);
        bgL.style.opacity = mu.toFixed(3);                                      // the left backdrop darkens with the morph (1 from its end on)
        // the beat is "dark" from 778, which would turn the MAIN stage dark in one step under the v1: hold it light and darken it with the morph (inline on the root, scroll-driven, so no CSS transition)
        const lv = mu < 1 && t >= tOn - 0.002;
        mainAsm.style.transition = lv ? "none" : "";
        mainAsm.style.backgroundColor = lv ? `rgb(${(c => c + "," + c + "," + c)(Math.round(0xf4 + (0x26 - 0xf4) * mu))})` : "";
        if (on) sceneC.render(t);
      }
    };
    live = hook;
    prime();

    return function unmount() {
      if (live === hook) live = null;
      if (raf) cancelAnimationFrame(raf);
      sceneC.destroy();
      ov.remove(); sheet.remove();
      mainAsm.style.transition = ""; mainAsm.style.backgroundColor = "";
      if (window.StageC.overlay === ov) window.StageC.overlay = null;
    };
  }
})();
