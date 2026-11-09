/* =========================================================================
   ASSEMBLY ENGINE: renders the left-hand scene as a pure function of progress t in [0,1].
   It knows nothing about scrolling or the text column, so it can be embedded anywhere:

     const scene = AssemblyScene.mount(containerEl, { scene: SCENE, story: STORY });
     scene.render(0.42);        // call from any clock (scroll, slider, video export)
     scene.destroy();

   Container needs a size (the scene fills it) and scene.css loaded.
   Theme: the engine sets data-theme on the container from the story beat at t.

   Copy of the archived bob-scene/assembly-engine.js (~/Documents/GitHub/bob-scene). Differences are marked "m-goat:":
     1. SCENE.hud === false       hides the HUD (title + rail)
     2. SCENE.fit                 reference-frame fit factor (default 0.92 = bob behaviour)
     3. piece.html                a live-HTML piece (Carbon tiles). Its box is the piece rect, size set by the engine.
        piece.update(el, k, t)    optional per-render hook for HTML pieces (bar fills, glow); a pure function of t.
     4. rect.iw / rect.ih         source crop size (default = w / h). Lets a whole image be scaled into a different box
     6. outgoing crop fades over the last 12% of a rect morph (original popped it off at u = 0.999)
   7. piece.paint {fill, stroke}  a flat coloured slab (no image): a plain card that is exactly the 2D shape while the camera is flat (f = 1) and
                                  fades to a faint tint plus the blueprint outline as fidelity drops. piece.noTag hides its blueprint tag.
   8. key.tg (0..1, default 1)    per-key tag visibility, so a piece can hide its blueprint tag during one beat and show it in another.
   Theme stays per beat (beat.theme), never the OS.
   ========================================================================= */
(function () {
  const E = {
    linear: t => t,
    inOutCubic: t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2,
    inOutQuart: t => t < .5 ? 8*t**4 : 1 - Math.pow(-2*t + 2, 4) / 2,
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,                       // m-goat: gentler than cubic/quart (peak speed 1.57x average vs 3x / 4x), so a morph moves for its whole window
    outBack: t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u*u*(3 - 2*u); };
  const PROPS = ["x","y","z","rx","rz","s","o","f","tg"];

  // Sample keyframes: unset props carry forward; each segment eases into its end key (key.e). `rect` is discrete and crossfades.
  function sample(keys, t, defaults) {
    const state = { ...defaults };
    let prev = { t: -Infinity, ...defaults }, next = null;
    for (const k of keys) {
      if (k.t <= t) { Object.assign(state, k); prev = { ...state, t: k.t }; }
      else { next = k; break; }
    }
    const out = { ...defaults, ...prev };
    out.rectA = prev.rect; out.rectB = prev.rect; out.u = 0;
    if (next && prev.t === -Infinity) out.rectA = out.rectB = next.rect || defaults.rect;
    else if (next) {
      const u = (E[next.e] || E.inOutCubic)(clamp((t - prev.t) / Math.max(1e-6, next.t - prev.t), 0, 1));
      for (const k of PROPS) if (next[k] !== undefined) out[k] = lerp(prev[k] ?? defaults[k] ?? 0, next[k], u);
      if (next.rect) { out.rectB = next.rect; out.u = u; }
    }
    return out;
  }

  function mount(root, { scene: SCENE, story: STORY }) {
    root.classList.add("asm");
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", SCENE.ariaLabel || STORY.title || "Animated UI assembly");
    const hud = SCENE.hud !== false;       // m-goat: 1
    root.innerHTML = '<div class="asm-stage"><div class="asm-world"><div class="asm-grid"></div></div></div>' +
                     (hud ? '<div class="asm-hud" aria-hidden="true"><span class="hud-title"></span><div class="rail"><i></i></div></div>' : '');
    const stage = root.querySelector(".asm-stage"), world = root.querySelector(".asm-world"), gridEl = root.querySelector(".asm-grid");
    const hudTitle = root.querySelector(".hud-title"), hudFill = root.querySelector(".rail i");
    const frameKey = Object.keys(SCENE.frames)[0], F = SCENE.frames[frameKey];

    const nodes = SCENE.pieces.map(p => {
      const el = document.createElement("div");
      el.className = "piece"; el.dataset.kind = p.kind; if (p.bare) el.dataset.bare = ""; el.setAttribute("aria-hidden", "true");
      if (p.bp) el.dataset.bp = "";                          // act 2.3: this piece shows blueprint outline + tag while the camera is tilted
      if (p.origin) el.style.transformOrigin = p.origin;
      if (p.radius) el.style.setProperty("--r", p.radius + "px");
      if (p.html) {                                           // m-goat: 3. live HTML piece; no outline, tag or image layers
        el.dataset.html = "";
        el.innerHTML = '<div class="html-body"></div>';
        const body = el.firstChild; body.innerHTML = p.html;
        world.appendChild(el);
        return { el, body, p, isHtml: true };
      }
      el.innerHTML = '<div class="outline"></div>' + (p.paint ? '<div class="paint"></div>' : '') + '<div class="layer a"></div><div class="layer b"></div><div class="tag"></div>';
      if (p.paint) { const pt = el.querySelector(".paint"); pt.style.background = p.paint.fill; pt.style.borderColor = p.paint.stroke; }
      const r = p.rects[frameKey];
      el.querySelector(".tag").textContent = r ? `${p.label} · ${r.w}×${r.h}` : p.label;
      world.appendChild(el);
      return { el, outline: el.querySelector(".outline"), paint: el.querySelector(".paint"), tag: el.querySelector(".tag"), a: el.querySelector(".a"), b: el.querySelector(".b"), p };
    });

    function paintLayer(layer, p, name, box, opacity) {
      const R = p.rects[name], Fr = SCENE.frames[(R && R.img) || name], src = Fr && Fr.src;   // R.img: crop from a different image than the frame
      if (!src || !R || opacity <= 0.001) { layer.style.opacity = 0; return; }
      const kx = box.w / (R.iw ?? R.w), ky = box.h / (R.ih ?? R.h);   // m-goat: 4. iw/ih = source crop size, so a whole image can be scaled into a different box
      layer.style.opacity = opacity;
      layer.style.backgroundImage = `url(${src})`;
      layer.style.backgroundSize = `${Fr.w * kx}px ${Fr.h * ky}px`;
      layer.style.backgroundPosition = `${-(R.ix ?? R.x) * kx}px ${-(R.iy ?? R.y) * ky}px`;
    }

    const beatAt = t => STORY.beats.findIndex((b, i) => t >= b.range[0] && (t < b.range[1] || i === STORY.beats.length - 1));
    let lastTheme = "";

    // The stage fills the root, so its size only changes when the root's does (the ResizeObserver below). Reading clientWidth/Height every frame forced a
    // synchronous layout right after the previous frame's style writes; the size is now read once per resize.
    let stageW = 0, stageH = 0;
    const narrowMQ = matchMedia("(max-width: 800px)");
    const measureStage = () => { stageW = stage.clientWidth; stageH = stage.clientHeight; };

    function render(t) {
      t = clamp(t, 0, 1);
      const cam = sample(SCENE.camera, t, { rx: 55, rz: -45, s: 0.7 });
      if (!stageW) measureStage();
      // m-goat: 8. Phones: the stage box is wider than tall (e.g. 390 x 338) but the world is a 720 x 1024 portrait, so fitting it whole leaves it tiny. Zoom in by MOBILE_ZOOM on
      // narrow screens (the margins of the world are empty and get cropped by the stage's overflow:hidden). The Stage C overlay is a second instance of this engine, so it gets the same zoom.
      const ws = Math.min(stageW / F.w, stageH / F.h) * (SCENE.fit ?? 0.92) * cam.s / 0.8 * (narrowMQ.matches ? (window.MOBILE_ZOOM ?? 1.35) : 1);   // m-goat: 2
      world.style.width = F.w + "px"; world.style.height = F.h + "px";
      world.style.setProperty("--inv", (1 / ws).toFixed(4));
      world.style.transform = `translate(-50%,-50%) scale(${ws}) rotateX(${cam.rx}deg) rotateZ(${cam.rz}deg)`;
      world.style.transformStyle = Math.abs(cam.rx) > 0.01 ? "preserve-3d" : "flat";   // 3D only while tilted: flat stacking follows piece order (Act 1), 3D depth sort in the blueprint
      const camF = smooth(25, 4, cam.rx);                      // fidelity allowed by camera angle: 3D stays low-fi
      gridEl.style.opacity = SCENE.grid ? 1 - camF : 0;
      nodes.forEach(n => {
        const { el, p } = n;
        const k = sample(p.keys, t, { x:0, y:0, z:0, rx:0, rz:0, s:1, o:0, f:0, tg:1, rect: Object.keys(p.rects)[0] });
        const A = p.rects[k.rectA], B = p.rects[k.rectB];
        // Culling: a piece that is invisible now and was invisible last frame has nothing to repaint. Only ~0-4 of the 50 pieces are on screen at once, so this skips the rest of
        // the per-frame style writes (and the piece-specific update() work). The first render of every piece is never skipped (n.seen): pieces may do one-off setup in update().
        // A piece can opt out with `noCull: true` (see the expansion card in stage-d.js).
        if (!p.noCull && n.seen && k.o <= 0 && n.hidden) return;
        n.seen = true; n.hidden = k.o <= 0;
        const box = { x: lerp(A.x, B.x, k.u), y: lerp(A.y, B.y, k.u), w: lerp(A.w, B.w, k.u), h: lerp(A.h, B.h, k.u) };
        el.style.width = box.w + "px"; el.style.height = box.h + "px"; el.style.opacity = k.o;
        el.style.transform = `translate3d(${box.x + k.x}px,${box.y + k.y}px,${k.z}px) rotateX(${k.rx}deg) rotateZ(${k.rz}deg) scale(${k.s})`;
        if (n.isHtml) { if (p.update) p.update(n.body, k, t); return; }      // m-goat: 3
        const { outline, tag, a, b } = n;
        const f = p.solid ? k.f : Math.min(k.f, camF), hasImg = !!SCENE.frames[(A && A.img) || k.rectA]?.src;
        outline.style.opacity = 1 - f * (n.paint ? 1 : hasImg ? 0.95 : 0.85);
        if (n.paint) n.paint.style.opacity = 0.3 + 0.7 * f;       // m-goat: 7. colour stays as a faint tint in the blueprint
        const lab = (p.labels && p.labels[k.u > 0.5 ? k.rectB : k.rectA]) || p.label, su = p.sizeScale || 1, txt = `${lab} · ${Math.round(box.w * su)}×${Math.round(box.h * su)}`;   // sizeScale: report source px when the piece is drawn scaled
        if (n.txt !== txt) { n.txt = txt; tag.textContent = txt; }
        tag.style.opacity = p.noTag ? 0 : (f < 0.3 ? 1 - f / 0.3 : 0) * (1 - camF) * k.tg;     // act 2.3: blueprint tags only while the camera is tilted (Act 1 hides tags in CSS anyway)
        tag.style.maxWidth = (box.w * ws) + "px";               // tag is counter-scaled, so clip it to the piece's on-screen width
        // Cross-fade: the outgoing crop stays fully opaque and the incoming crop fades in over it. Fading both
        // (1-u, u) only covers 75% at the midpoint, so the page background shows through the piece.
        // m-goat: 6. the outgoing crop fades out over the last 12% of the morph instead of popping off at u = 0.999. The tilted slabs differ slightly in
        // shape, so a hard pop would flash the outgoing slab's corners.
        paintLayer(a, p, k.rectA, box, k.rectB === k.rectA ? f : f * (1 - smooth(0.88, 1, k.u)));
        paintLayer(b, p, k.rectB, box, k.rectB === k.rectA ? 0 : f * k.u);
      });
      const bi = beatAt(t), beat = STORY.beats[bi];
      if (beat && beat.theme !== lastTheme) { lastTheme = beat.theme; root.dataset.theme = beat.theme; }
      if (hud) {
        hudTitle.textContent = beat ? `${String(bi + 1).padStart(2, "0")} / ${String(STORY.beats.length).padStart(2, "0")}   ${beat.title.toUpperCase()}` : "";
        hudFill.style.transform = `scaleX(${t})`;
      }
      return { beat: beat && beat.id, cam };
    }
    const ro = new ResizeObserver(() => { measureStage(); render(+root.dataset.t || 0); });
    ro.observe(root);
    const api = { render: t => { root.dataset.t = t; return render(t); }, destroy() { ro.disconnect(); root.innerHTML = ""; }, root };
    return api;
  }

  /* Key generators. Compose per piece per beat; append in increasing t (keys are not re-sorted).
     eps keeps coplanar pieces in a stable stacking order once flat (a hair of z per depth level). */
  const G = {
    eps: p => p.depth * 0.4,
    rest: (p, t, rect) => ({ t, x:0, y:0, z:G.eps(p), rx:0, rz:0, s:1, o:1, f:1, rect }),
    // style: drop | slideL | slideR | slideT | rise | unfold | pop. Staggered by `order` of `count` across [t0,t1].
    enter(style, p, t0, t1, rect, order, count, L) {
      const stag = 0.5 * (t1 - t0), step = count > 1 ? stag / (count - 1) : 0;
      const a = t0 + order * step, b = Math.min(t1, a + (t1 - t0) - stag), lift = p.depth * L;
      const from = ({ drop: { z: lift + 420 }, slideL: { x: -560, z: lift }, slideR: { x: 560, z: lift }, slideT: { y: -420, z: lift }, rise: { z: lift - 360 },
                      unfold: { rx: -88, z: lift }, pop: { s: 0.55, z: lift } })[style] || { z: lift + 420 };
      const e = (style === "drop" || style === "pop") ? "outBack" : "inOutSine";
      return [ { t: t0, ...from, o: 0, f: 0, rect }, { t: a, ...from, o: 0, f: 0, rect },
               { t: b, x: 0, y: 0, z: lift, rx: 0, s: 1, o: 1, f: 0, rect, e } ];
    },
    // lag (0..1) delays the fidelity ramp so a base layer only shows the real design once everything above it has landed
    resolve: (p, t0, t1, rect, L, lag = 0) => [ { t: t0, z: p.depth * L, f: 0, rect },
      ...(lag ? [{ t: t0 + (t1 - t0) * lag, f: 0 }] : []), { t: t1, z: G.eps(p), f: 1, rect } ],
    explode: (p, t0, t1, rect, L) => [ { t: t0, z: G.eps(p), f: 1, rect }, { t: t1, z: p.depth * L, f: 0, rect } ],
    // slide + resize between two frames' rects (crop crossfades while f = 0, so it is never seen)
    morph: (p, t0, t1, from, to, L) => [ { t: t0, z: p.depth * L, rect: from }, { t: t1, z: p.depth * L, rect: to, e: "inOutSine" } ],
    // UI morph (no blueprint): stays flat and fully real; the rect interpolates and the old/new crops crossfade
    flat: (p, t0, t1, from, to) => [ { t: t0, z: G.eps(p), f: 1, rect: from }, { t: t1, z: G.eps(p), f: 1, rect: to, e: "inOutSine" } ],
    // removed piece: drops away beneath the stack and fades
    exit: (p, t0, t1, L) => [ { t: t0, z: p.depth * L, o: 1, f: 0 }, { t: t1, z: p.depth * L - 380, o: 0, e: "inOutQuart" } ]
  };

  window.AssemblyScene = { mount, G, sample, E };
})();
