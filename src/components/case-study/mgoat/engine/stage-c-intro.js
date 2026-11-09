/* =========================================================================
   STAGE C INTRO: the clock-based, scroll-locked hand-over from the first iteration (light) to the second iteration (dark). Plays ONCE per page load.
   Classic script. Load it AFTER stage-c.js:   <script src="stage-c-intro.js"></script>
   It injects its own stylesheet (stage-c-intro.css) and, lazily, the vendored runtime (vendor/transitions/ui-generation.js + the two .css files), all relative to THIS script's URL.
   Needs stagec.css + stagec-piece.js (the real .sc-screen markup, StagecPiece.screenHTML()).

   THE SEQUENCE (every duration is a named constant below; ~3.7 s in all)
     1  v crosses TIMING.C.intro.trigger (778) moving forward -> scroll locks, ONE full-screen grey layer (covers #progress too) fades in           FADE_IN
     2  the layer is opaque -> the page scroll jumps to TIMING.C.intro.land (872); the page underneath settles (its own ~140 ms ease) while we generate
     3  transitions-ui-generation, the REAL runtime (mode "skeleton") on a 680 x 420 copy of the dark questionnaire, 70% of the viewport width        GEN_MS * 1.09
        (capped so it is at most 70% of the viewport height too)
     4  inside the runtime's reveal phase the layer turns black (#161616 = the page's dark), finishing as the UI finishes revealing               BG_FADE
     5  hold on the polished UI                                                                                                                       HOLD
     6  the whole layer (background AND UI) slides up and away on --ease-smooth-out, revealing the landed layout; layer removed, lock released        SLIDE

   RULES  - plays only when v crosses the trigger moving forward from below AND the arrival v <= land. Loading at/after the trigger (reload, anchor) or one jump beyond `land`
            marks it played WITHOUT animating. Once played: nothing, ever (in-memory flag; a reload plays it again).
          - ?intro=off marks it played at once (tests, regression).  Click on the layer or Esc skips (cancel the run, jump if not yet done, fast slide).
          - prefers-reduced-motion: no generation, the jump happens under a plain layer that fades in and out.  max-width 800px: skipped (marked played).
          - the runtime failing to import (file://, offline): warn, short fade + jump, marked played.
   API    window.StageCIntro = { state: 'idle'|'playing'|'done', played, play(opts?) -> Promise, skip(), marks }
          play() ignores the `played` flag (manual play for the test page). Without #layout (the test page) it does not jump; { jump: false } also stays where it is.
   ========================================================================= */
(function () {
  "use strict";

  // ---------------------------------------------------------------- durations (ms) and sizes: retime here
  const FADE_IN = 300;                       // 1  the grey layer fades in
  const GEN_MS = 2000;                       // 3  generate({ duration }). The runtime's whole run is GEN_MS * 1.09 (its END constant) = 2180 ms. The skill's range is 1600-3600
  const GEN_RUN = GEN_MS * 1.09;
  const BG_FADE = 500;                       // 4  grey -> black. It ENDS when the runtime's reveal phase ends (REVEAL_END of GEN_MS, ui-generation.js PH.reveal[1]), so it starts at 1.61 s, inside the reveal (1.48-2.11 s)
  const REVEAL_END = 1.055;                  //    (mirror of the runtime's constant; the runtime itself is not touched)
  const HOLD = 500;                          // 5  the polished UI over black
  const SLIDE = 700;                         // 6  the layer slides up and away
  const DOT_BUDGET = 900;                    // the runtime draws ONE SVG circle per 15px cell and rewrites 3 attributes of each EVERY frame: 3431 at 1440 x 900, ~8000 on a 2560 wide screen, 9 fps on a throttled
                                             // retina laptop. Past this many the grid is thinned (every 2nd / 3rd column and row) as soon as the runtime builds it. Measured: the circles ARE the cost
  const SKIP_OPAQUE = 120;                   // skip before the layer is opaque: finish the fade this fast, then jump
  const SKIP_BG = 150;                       // skip: grey -> black
  const SKIP_SLIDE = 300;                    // skip: the slide
  const SETTLE_MIN = 700;                    // skip soon after the jump: wait until the page underneath has eased to rest (time constant ~140 ms) before sliding
  const SOFT_FADE = 200;                     // reduced motion / runtime unavailable: the plain layer fades in and out
  const READY_MS = 400;                      // after `load`: a position beyond the trigger seen before this is the browser restoring scroll, not the reader (-> played, no animation)
  const WARM_VH = 250;                       // start fetching the runtime this many vh before the trigger
  const FONT_WAIT = 2500;                    // never wait longer than this for fonts / image decode
  const WATCHDOG = 3000;                     // if the runtime has not finished this long after it should have, cancel it
  const FILL = 0.7;                          // the UI is 70% of the viewport width (and at most 70% of its height)
  const EASE_SLIDE = "cubic-bezier(0.22, 1, 0.36, 1)";    // --ease-smooth-out (ui-generation.js SMOOTH_OUT); also --sci-ease in stage-c-intro.css
  const GREY = "var(--sci-grey, #f4f4f4)", BLACK = "var(--sci-black, #161616)";    // defaults live in stage-c-intro.css. #161616 = the page's existing dark
  const FALLBACK = { trigger: 778, land: 872 };           // used when TIMING.C.intro is missing

  // ---------------------------------------------------------------- environment
  const url = p => window.MG_BASE + p;                                        // vendor runtime is served from public/assets/mgoat/
  const SP = window.StagecPiece;
  let layout = null;                                                       // set by mount(): the module is cached across visits, so #layout must not be captured at load
  const now = () => performance.now();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => matchMedia("(max-width: 800px)").matches;
  const cfg = () => { const I = window.TIMING && window.TIMING.C && window.TIMING.C.intro; return { trigger: I && I.trigger != null ? I.trigger : FALLBACK.trigger, land: I && I.land != null ? I.land : FALLBACK.land }; };
  const vNow = () => layout ? -layout.getBoundingClientRect().top / innerHeight * 100 : 0;                // vh of story scroll (the same mapping as index.html's target())
  const yOf = v => layout ? layout.getBoundingClientRect().top + scrollY + v * innerHeight / 100 : scrollY;      // v -> scrollY

  const api = { state: "idle", played: false, marks: {}, play: null, skip: null };
  window.StageCIntro = api;
  let active = null;                                       // the run in progress

  // ---------------------------------------------------------------- stylesheets + runtime (loaded once, lazily)
  const cssCache = {};
  const addCSS = href => cssCache[href] || (cssCache[href] = new Promise(res => {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.onload = () => res(true); l.onerror = () => res(false); document.head.appendChild(l);
  }));
  let rtP = null;
  const loadRuntime = () => rtP || (rtP = (async () => {                  // resolves to the module, or null (file://, offline, blocked): the caller falls back to a plain fade
    try {
      await Promise.all([addCSS(url("vendor/transitions/ui-generation.css")), addCSS(url("vendor/transitions/text-image-generation.css"))]);
      const m = await new Function("u", "return import(u)")(url("vendor/transitions/ui-generation.js"));   // not a literal import(): Vite's dev server would rewrite it and prepend an ES import to this classic script
      return m && typeof m.generate === "function" ? m : null;
    } catch (e) { console.warn("StageCIntro: could not load the transitions runtime (is the page opened from file://?), falling back to a plain fade.", e); return null; }
  })());
  const ownCSS = () => Promise.resolve(true);                                 // stage-c-intro.css is imported by the page entry
  ownCSS();                                                                // requested at load; the layer waits for it

  // ---------------------------------------------------------------- scroll lock
  const pin = { v: null, y: 0 };                                           // where the page is held: a story vh (survives a resize), or an absolute y when there is no #layout
  const pinY = () => (layout && pin.v !== null ? yOf(pin.v) : pin.y);
  const KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
  const hold = e => { if (!e.ctrlKey) e.preventDefault(); };               // ctrl + wheel is page zoom, not scroll
  const onKey = e => { if (e.key === "Escape") { api.skip(); return; } if (KEYS.has(e.key)) e.preventDefault(); };
  const onMouseDown = e => { if (e.button === 1) e.preventDefault(); };   // middle-click autoscroll
  const repin = () => { const y = pinY(); if (Math.abs(scrollY - y) > 1.5) scrollTo({ top: y, left: scrollX, behavior: "instant" }); };
  const onResize = () => { if (!active) return; if (active.fit) active.fit(); repin(); if (active.run) active.run.cancel(); };   // the drawing was measured at the old size: end it (the finished UI stays)
  let locked = false;
  function lock() {
    if (locked) return; locked = true;
    addEventListener("wheel", hold, { passive: false, capture: true });
    addEventListener("touchmove", hold, { passive: false, capture: true });
    addEventListener("keydown", onKey, { capture: true });
    addEventListener("mousedown", onMouseDown, { capture: true });
    addEventListener("scroll", repin, { passive: true });                  // backstop: scrollbar drag, anything the events above missed
    addEventListener("resize", onResize);
  }
  function unlock() {
    if (!locked) return; locked = false;
    removeEventListener("wheel", hold, { capture: true });
    removeEventListener("touchmove", hold, { capture: true });
    removeEventListener("keydown", onKey, { capture: true });
    removeEventListener("mousedown", onMouseDown, { capture: true });
    removeEventListener("scroll", repin);
    removeEventListener("resize", onResize);
  }

  // ---------------------------------------------------------------- the sequence
  const FONT_FACES = ['300 19px "IBM Plex Serif"', '400 6px "IBM Plex Sans"', '600 8px "IBM Plex Sans"', '500 5px "IBM Plex Mono"'];
  function prepare(box) {                                                  // fonts + image decode: the runtime traces what is rendered, so both must be final before it starts
    const f = document.fonts, imgs = [...box.querySelectorAll("img")];
    if (f && f.load) FONT_FACES.forEach(x => f.load(x).catch(() => {}));
    return Promise.race([Promise.all([f && f.ready, ...imgs.map(i => (i.decode ? i.decode().catch(() => {}) : null))]), sleep(FONT_WAIT)]);
  }
  // Thin the runtime's dot field (see DOT_BUDGET). The runtime keeps writing to the removed circles (cheap: nothing paints them); a coarser grid is the only visible change.
  function thinDots(overlay) {
    const dots = [...overlay.querySelectorAll("circle.t-gen-dot")];
    const step = Math.max(1, Math.round(Math.sqrt(dots.length / DOT_BUDGET)));
    if (step < 2) return;
    const rank = attr => { const u = [...new Set(dots.map(c => +c.getAttribute(attr)))].sort((a, b) => a - b); return new Map(u.map((v, i) => [v, i])); };
    const rx = rank("cx"), ry = rank("cy");
    dots.forEach(c => { if (rx.get(+c.getAttribute("cx")) % step || ry.get(+c.getAttribute("cy")) % step) c.remove(); });
  }
  // The runtime appends its overlay (.t-gen) to <body> inside a rAF callback; an observer's callback runs right after that callback, before the frame is painted, so the full grid is never drawn.
  const watchOverlay = () => {
    const mo = new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains("t-gen")) thinDots(n); })));
    mo.observe(document.body, { childList: true }); return mo;
  };
  const anim = (el, kf, ms, easing) => { const a = el.animate(kf, { duration: ms, easing: easing || "linear", fill: "forwards" }); return { a, done: a.finished.then(() => a, () => a) }; };

  async function run(opts) {
    opts = opts || {};
    const soft = reducedMotion();                                          // no generation: a plain fade in / jump / fade out
    const jumpOn = !!layout && opts.jump !== false;
    const marks = api.marks = { start: now() };
    const ctl = active = { skipped: false, sliding: false, jumped: false, run: null, fit: null, skipRes: null };
    const skipP = new Promise(r => (ctl.skipRes = r));
    const until = p => Promise.race([p, skipP]);                           // every wait ends early on skip
    api.state = "playing";
    pin.v = jumpOn ? vNow() : null; pin.y = scrollY;
    lock();
    document.body.classList.add("sci-on");
    let layer = null, mo = null;
    try {
      await ownCSS();
      if (!SP || !SP.screenHTML) throw new Error("StagecPiece.screenHTML is missing (load stagec-piece.js first)");

      // the layer: ONE element, fixed, over the whole viewport incl. the progress nav. Inside: the box the runtime generates, laid out at its FINAL scaled size
      layer = document.createElement("div"); layer.className = "sci-layer"; layer.dataset.theme = "light"; layer.setAttribute("aria-hidden", "true");
      layer.style.backgroundColor = GREY; layer.style.opacity = "0";
      const box = document.createElement("div"); box.className = "sci-box pre";
      const sc = document.createElement("div"); sc.className = "sci-scale"; sc.innerHTML = SP.screenHTML();
      box.appendChild(sc); layer.appendChild(box); document.body.appendChild(layer);
      layer.addEventListener("click", () => api.skip());
      const SCR = SP.SCR;
      ctl.fit = () => {                                                    // the BOX is not transformed (the runtime sets clip-path / opacity on it in px); only its child is scaled
        const vw = layer.clientWidth, vh = layer.clientHeight, s = Math.min(FILL * vw / SCR.w, FILL * vh / SCR.h), w = SCR.w * s, h = SCR.h * s;
        box.style.width = w + "px"; box.style.height = h + "px"; box.style.left = (vw - w) / 2 + "px"; box.style.top = (vh - h) / 2 + "px";
        sc.style.transform = "scale(" + s + ")";
      };
      ctl.fit();
      // whatever sits below the frame (rows past the fold, the sticky bar, question 2) is clipped by the real screen: keep it out of the drawing, the runtime would trace it under the frame
      const bottom = box.getBoundingClientRect().bottom;
      box.querySelectorAll("*").forEach(e => { if (e.getBoundingClientRect().top >= bottom - 1) e.setAttribute("data-t-generate-skip", ""); });
      const toBlack = ms => { layer.style.transition = "background-color " + ms + "ms ease-in-out"; layer.style.backgroundColor = BLACK; };   // grey -> black
      const prep = prepare(box), rtLoad = soft ? null : loadRuntime();     // both overlap the fade-in

      // 1. fade in
      const fade = anim(layer, [{ opacity: 0 }, { opacity: 1 }], soft ? SOFT_FADE : FADE_IN, "ease-out");
      await until(fade.done);
      {                                                                    // make it opaque for good (a skip may have cut the fade short: finish it fast, the jump stays invisible)
        const cur = parseFloat(getComputedStyle(layer).opacity) || 0;
        fade.a.cancel(); layer.style.opacity = String(cur);
        if (cur < 1) { const f = anim(layer, [{ opacity: cur }, { opacity: 1 }], SKIP_OPAQUE); await f.done; f.a.cancel(); }
        layer.style.opacity = "1"; marks.opaque = now();
      }

      // 2. the layer is opaque: jump to the landed position (Agent B's page shows the final layout there)
      ctl.jumped = true; marks.jump = now();
      if (jumpOn && !ctl.stopped) { pin.v = cfg().land; scrollTo({ top: pinY(), left: scrollX, behavior: "instant" }); }

      // 3. generation (reduced motion / runtime missing: nothing to draw, the layer just fades out below)
      let rt = null;
      if (!soft && !ctl.skipped) { rt = await until(rtLoad) || null; if (rt && !ctl.skipped) await until(prep); }
      if (rt && !ctl.skipped) {
        box.classList.remove("pre");
        mo = watchOverlay();
        ctl.run = rt.generate(box, { variant: "ui", mode: "skeleton", duration: GEN_MS });
        marks.gen = now();
        const bgTimer = setTimeout(() => toBlack(BG_FADE), Math.max(0, REVEAL_END * GEN_MS - BG_FADE));   // 4. grey -> black inside the reveal phase, done as the UI finishes revealing
        await until(Promise.race([ctl.run.finished, sleep(GEN_RUN + WATCHDOG)]));
        clearTimeout(bgTimer); ctl.run.cancel();                           // a no-op once finished; skip / resize / the watchdog end it here and the finished UI shows
        marks.genEnd = now();
        if (!ctl.skipped) { toBlack(BG_FADE); await until(sleep(HOLD)); marks.holdEnd = now(); }  // 5. hold (toBlack changes nothing when the fade already ran)
      }

      // 6. out: the layer slides up (full), or fades (reduced motion / runtime missing / nothing to show)
      if (ctl.stopped) return;                                           // the page was left: finally{} removes the layer and releases the lock, nothing else may run
      if (ctl.skipped) {
        box.classList.remove("pre"); toBlack(SKIP_BG);
        if (jumpOn) { const wait = SETTLE_MIN - (now() - marks.jump); if (wait > 0) await sleep(wait); }
      }
      ctl.sliding = true; marks.slide = now();
      const out = !ctl.skipped && !rt ? anim(layer, [{ opacity: 1 }, { opacity: 0 }], SOFT_FADE, "ease-out")
        : anim(layer, [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], ctl.skipped ? SKIP_SLIDE : SLIDE, EASE_SLIDE);
      await out.done;
    } catch (e) {
      console.error("StageCIntro:", e);
      if (!ctl.jumped && jumpOn && !ctl.stopped) { pin.v = cfg().land; scrollTo({ top: pinY(), left: scrollX, behavior: "instant" }); }
    } finally {
      active = null; marks.end = now();
      if (mo) mo.disconnect();
      if (layer) layer.remove();
      document.body.classList.remove("sci-on");
      unlock();
      if (!ctl.stopped) { api.played = true; api.state = "done"; stopWatching(); }
    }
  }

  let current = null;
  api.play = opts => current || (current = run(opts).then(() => { current = null; }));
  api.skip = () => { const c = active; if (!c || c.skipped || c.sliding) return; c.skipped = true; api.marks.skip = now(); if (c.run) c.run.cancel(); if (c.skipRes) c.skipRes(); };

  // ---------------------------------------------------------------- trigger: v crosses `trigger` moving forward from below, arriving at or before `land`
  let prevV = null, settled = false, warmed = false, watching = false;
  const markPlayed = () => { api.played = true; if (api.state !== "playing") api.state = "done"; stopWatching(); };
  function onScroll() {
    if (api.played || api.state === "playing") return;
    const v = vNow(), from = prevV; prevV = v;
    const { trigger, land } = cfg();
    if (!warmed && v >= trigger - WARM_VH && !narrow()) { warmed = true; if (!reducedMotion()) loadRuntime(); }
    if (v < trigger) return;
    if (!settled || from === null || from >= trigger || v > land || narrow() || !SP) { markPlayed(); return; }   // restore / anchor / one jump past `land` / already beyond / mobile: counts as seen, no animation
    api.play();
  }
  function stopWatching() { if (!watching) return; watching = false; removeEventListener("scroll", onScroll); }

  // ---------------------------------------------------------------- per-visit lifecycle
  // mount() is called by page.js once #layout exists and returns stop(). The module is cached, so a second visit calls mount() again on fresh DOM: every flag the first visit left behind is reset here.
  let readyTimer = 0, stopped = true;
  function mount() {
    layout = document.getElementById("layout");
    stopped = false; active = null; current = null;
    api.played = false; api.state = "idle"; api.marks = {};
    prevV = null; settled = false; warmed = false; watching = false;
    if (new URLSearchParams(location.search).get("intro") === "off") { api.played = true; api.state = "done"; }
    else if (layout) {
      watching = true; prevV = vNow(); addEventListener("scroll", onScroll, { passive: true });
      const ready = () => { readyTimer = setTimeout(() => { settled = true; if (!api.played && api.state !== "playing") { prevV = vNow(); if (prevV >= cfg().trigger) markPlayed(); } }, READY_MS); };
      if (document.readyState === "complete") ready(); else addEventListener("load", ready, { once: true });
      if (prevV >= cfg().trigger) markPlayed();
    }
    return stop;
  }
  // Leaving the page (also React's dev double-mount): end a run in progress WITHOUT sliding out or jumping, then undo everything the intro put on the document.
  function stop() {
    if (stopped) return; stopped = true;
    clearTimeout(readyTimer);
    stopWatching();
    const c = active;
    if (c) { c.stopped = true; c.skipped = true; if (c.run) c.run.cancel(); if (c.skipRes) c.skipRes(); }
    unlock();                                                              // idempotent; run()'s finally also calls it
    document.querySelectorAll(".sci-layer").forEach(el => el.remove());
    document.body.classList.remove("sci-on");
    layout = null; active = null; current = null;
    api.state = "idle"; api.played = false;
  }
  window.StageCIntro.mount = mount;
})();
