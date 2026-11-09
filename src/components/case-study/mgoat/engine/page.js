// The old m-goat/index.html inline script, unchanged except for being wrapped in a function the page calls once its markup is mounted.
// Composes the hero -> stage transition, the split layout, the text column and the scroll clock.
export function startMGoat() {
// Returns stop(): removes every listener, the frame loop, the scenes and the Stage C overlay / intro. The module is cached across visits, so a second startMGoat() runs on fresh DOM.
return (function () {
  const offs = [];                                          // cleanups, run in reverse by stop()
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); offs.push(() => target.removeEventListener(type, fn, opts)); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const layout = document.getElementById("layout"), text = document.getElementById("text"), prog = document.getElementById("progress");
  const vh = STORY.scrollVh, maxVh = vh - 100;          // scrollable distance in vh = total minus one viewport
  layout.style.height = vh + "vh";

  // Hero -> stage transition: the hero is pinned for introVh of scroll (hero-transition.js), then the layout follows.
  const introVh = STORY.introVh || 0, HT = window.HeroTransition;
  const heroTrack = document.getElementById("heroTrack"), heroPin = document.getElementById("heroPin"), heroPage = document.getElementById("hero"),
        heroSlot = document.getElementById("heroSlot"), heroBox = document.getElementById("heroBox"), tint = heroBox.querySelector(".tint"),
        heroText = heroPage.querySelector(".hero-body");
  heroTrack.style.height = (100 + introVh) + "vh";
  if (introVh <= 0) layout.classList.remove("pre-intro");
  const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  let R0 = null, R1 = null;                                // viewport-space rects: the hero image slot, and the stage (left half of the viewport)
  const measure = () => {
    heroText.style.transform = "none"; heroBox.style.opacity = 0;
    const pin = heroPin.getBoundingClientRect(), slot = heroSlot.getBoundingClientRect();
    R0 = { x: slot.left - pin.left, y: slot.top - pin.top, w: slot.width, h: slot.height };          // relative to the pinned hero (which is at viewport 0,0 while pinned)
    const narrow = matchMedia("(max-width: 800px)").matches;
    R1 = narrow ? { x: 0, y: 0, w: innerWidth, h: innerHeight * 0.40 } : { x: 0, y: 0, w: innerWidth / 2, h: innerHeight };
  };
  // Right half: one section per beat, centred in the viewport when scroll reaches the beat's snap anchor. A beat with no copy renders no section (the visual plays).
  const buildSection = b => {
    const s = document.createElement("section");
    s.dataset.beat = b.id; s.style.top = `calc(${(b.snap ?? b.range[0]) * maxVh}vh + 50vh)`;
    if (b.full) s.classList.add("full");                                    // a text slot with `full: true` spans the whole viewport (Stage F slide 5)
    if (b.eyebrow) { const e = document.createElement("p"); e.className = "eyebrow"; e.textContent = b.eyebrow; s.appendChild(e); }
    b.copy.forEach(c => { const p = document.createElement("p"); p.innerHTML = c; s.appendChild(p); });   // copy is author-written story.js text; it may carry <span class="hl-o"> / <i>
    if (b.image) { const im = document.createElement("img"); im.className = "slot-img"; im.src = b.image.src; im.alt = b.image.alt || ""; im.width = b.image.w; im.height = b.image.h; im.decoding = "async"; s.appendChild(im); }   // a text slot with `image` shows it below the copy and fades with the slot
    return s;
  };
  // One text "slot" per section. A beat normally has one slot (its `copy`, on screen for the whole beat). A beat with `texts` has one slot per entry:
  // each is centred at its own `snap`, and is on screen from the midpoint after the previous text to the midpoint before the next (first = beat start, last = beat end).
  const slots = [];
  STORY.beats.forEach(b => {
    if (b.texts && b.texts.length) {
      b.texts.forEach((t, i) => {
        const prev = b.texts[i - 1], next = b.texts[i + 1];
        slots.push({ id: t.id, beat: b, snap: t.snap, copy: t.copy, eyebrow: t.eyebrow, chapter: t.chapter, image: t.image, full: t.full,
                     from: t.from ?? (prev ? (prev.snap + t.snap) / 2 : b.range[0]), to: t.to ?? (next ? (t.snap + next.snap) / 2 : b.range[1]) });
      });
    } else if (b.copy.length || b.eyebrow) slots.push({ id: b.id, beat: b, snap: b.snap ?? b.range[0], copy: b.copy, eyebrow: b.eyebrow, from: b.from ?? b.range[0], to: b.to ?? b.range[1] });
  });
  const sections = slots.map(sl => { const s = buildSection(sl); text.appendChild(s); sl.el = s; return s; });
  // the under-stage shows the first beat's text during the dissolve. It is positioned like the real one at the moment of handover:
  // the real layout's top is at the viewport top then, so a section at `top: calc(snap * maxVh vh + 50vh)` sits where it will be after the swap.
  const underCol = document.getElementById("underCol"), firstBeat = STORY.beats.find(b => b.copy.length || b.eyebrow);
  if (underCol && firstBeat) { const u = buildSection(firstBeat); u.classList.add("active"); underCol.appendChild(u); }
  // Progress rail: one tick per CHAPTER (12; several beats share a tick, see beat.chapter). React (SectionNav.tsx) renders the ticks and the hover card;
  // the engine reports the current chapter on #progress (data-chapter + a `chapterchange` event) and exposes window.MGoatNav.jump(n) for the card.
  let lastChap = NaN;
  const chapterSnap = [];                                    // chapter -> snap of its first text (where that text is centred)
  STORY.beats.forEach(b => (b.texts && b.texts.length ? b.texts.map(t => ({ c: t.chapter !== undefined ? t.chapter : b.chapter, s: t.snap })) : [{ c: b.chapter, s: b.snap ?? b.range[0] }])
    .forEach(({ c, s }) => { if (c !== undefined && chapterSnap[c] === undefined) chapterSnap[c] = s; }));

  const scene = AssemblyScene.mount(document.getElementById("scene"), { scene: SCENE, story: STORY });
  offs.push(() => scene.destroy());
  const introUnder = document.getElementById('introUnder');
  const underScene = introVh > 0 ? AssemblyScene.mount(document.getElementById('underScene'), { scene: SCENE, story: STORY }) : null;
  if (underScene) { underScene.render(0); offs.push(() => underScene.destroy()); }   // frozen at t = 0: the first beat's skeleton
  // Stage C's overlay and the one-off intro build DOM, so they are mounted now that #layout / #scene / #progress exist and undone by stop().
  if (window.StageC && window.StageC.mount) offs.push(window.StageC.mount());
  if (window.StageCIntro && window.StageCIntro.mount) offs.push(window.StageCIntro.mount());
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // key poses for reduced motion: one per beat, or one per text slot when a beat has `texts` (Stage C: its stage changes between the slots)
  const keyPoses = STORY.beats.flatMap(b => b.texts && b.texts.length ? b.texts.map(t => ({ pose: t.pose ?? t.snap, snap: t.snap })) : [{ pose: b.pose ?? b.snap ?? b.range[0], snap: b.snap ?? b.range[0] }]);
  const poses = keyPoses.map(k => k.pose);
  const anchors = keyPoses.map(k => k.snap);

  // scroll is the ONLY clock. The scene section starts below the hero, so progress is measured from the top of the split layout.
  const target = () => clamp(-layout.getBoundingClientRect().top / Math.max(1, layout.offsetHeight - innerHeight), 0, 1);
  // Jump to a chapter: an instant scroll to where its first text is centred. Instant on purpose: a smooth scroll would play every beat in between, and would cross
  // the Stage C trigger mid-way (stage-c-intro.js then locks the scroll). A jump straight past Stage C's trigger counts as seen; landing exactly on it plays the intro.
  offs.push(() => { delete window.MGoatNav; });
  window.MGoatNav = { jump(n) {
    const s = chapterSnap[n]; if (s === undefined) return;
    scrollTo({ top: layout.getBoundingClientRect().top + scrollY + s * Math.max(1, layout.offsetHeight - innerHeight), behavior: "instant" });
  } };
  let shown = target(), last = -1, raf = 0, prevTs = 0;
  const tau = reduce ? 0 : (STORY.smoothing || 0);          // ms; the scene eases toward the scroll position, the text follows scroll directly

  // hero progress q = how far the scroll has gone through the pinned intro (0 at the top of the page, 1 when the layout takes over)
  const introPx = () => (introVh / 100) * innerHeight;
  const qNow = () => introVh > 0 ? clamp(scrollY / introPx(), 0, 1) : 1;
  function drawHero(q) {
    // the ring's draw-in plays across the hero dissolve (TIMING.ring.drawIntro, as a fraction of q). This runs BEFORE any early return so that introT is 1 whenever the hero
    // is done (a reload part-way down, an anchor jump, scrolling back up): the ring is then fully drawn instead of stuck at its last intro value.
    const dI = TIMING.ring.drawIntro, intro = Math.min(1, Math.max(0, (q - dI[0]) / (dI[1] - dI[0])));
    if (SCENE.introT !== intro) { SCENE.introT = intro; last = -1; if (underScene) underScene.render(0); }
    if (!HT || !R0) return;
    const S = HT.state(q, R0, R1);
    const done = introVh <= 0 || S.done;
    heroPin.classList.toggle("done", done); if (introUnder) introUnder.classList.toggle("on", !done);
    layout.classList.toggle("pre-intro", !done);        // exactly one of {under-stage, real layout} is visible in any frame: no gap, no overlap
    if (done) return;
    heroText.style.opacity = S.text.opacity; heroText.style.transform = `translateY(${S.text.y}px)`;
    heroPage.style.background = `rgba(242,242,242,${S.bg.opacity})`;                  // #f2f2f2 fades, revealing the split layout underneath
    heroBox.style.opacity = S.box.opacity; heroBox.style.borderRadius = S.box.radius + "px";
    heroBox.style.width = S.box.w + "px"; heroBox.style.height = S.box.h + "px"; heroBox.style.transform = `translate(${S.box.x}px,${S.box.y}px)`;
    tint.style.opacity = Math.min(1, S.u * 0.9);                                       // image blue-grey -> stage grey as the box lands
    if (introUnder) introUnder.style.opacity = S.scene.opacity;

    if (introUnder) introUnder.style.setProperty("--intro-copy", S.copy.opacity);
  }

  /* ---- the ONE time-based exception: the hand card's pill loop (author's decision). It runs on its own clock while the card is on stage (SCENE.handOn(shown)) and is idle
     otherwise, so the page is scroll-driven everywhere else. Reduced motion: no loop, the card rests on its first frame. */
  let handT0 = 0, handNow = 0;
  SCENE.handClock = () => handT0 ? handNow - handT0 : 0;
  const handTick = (ts, t) => {
    const on = !reduce && SCENE.handOn && SCENE.handOn(t);
    if (on) { if (!handT0) handT0 = ts; handNow = ts; } else handT0 = 0;
    return on;
  };
  function paint(t) {
    if (t === last && !handT0) return; last = t;
    const { beat } = scene.render(t);
    if (SCENE.afterRender) SCENE.afterRender(t);              // Stage C: the full-screen overlay (stage-c.js)
    const cur = STORY.beats.find(b => b.id === beat);
    layout.dataset.theme = cur ? cur.theme : "light";         // Stage C is dark from its first vh (778): its generation intro is a separate one-off overlay (stage-c-intro.js), the page underneath is already landed
    prog.dataset.theme = layout.dataset.theme;                // the nav is a sibling of the layout, so it gets the theme itself (active tick = the text colour, so it never vanishes on the dark page)
    const mine = slots.filter(sl => sl.beat === cur);
    const slot = mine.find(sl => t >= sl.from && t < sl.to) || mine[mine.length - 1] && (t >= mine[mine.length - 1].to ? mine[mine.length - 1] : mine.find(sl => t < sl.from) || mine[0]);   // inside a slot -> that slot; past the last -> the last (the end of the page); before the first -> the first
    const chap = slot && slot.chapter !== undefined ? slot.chapter : (cur ? cur.chapter ?? 0 : -1);          // a text slot may carry its own chapter (Stage C: slides 13 / 14 / 15)
    const act = cur ? chap : -1;
    if (act !== lastChap) { lastChap = act; prog.dataset.chapter = act; prog.dispatchEvent(new CustomEvent("chapterchange", { detail: act })); }
  }
  // (the v1 form auto-scroll belongs to Stage B and is re-added there)
  const autoStep = () => {};

  function tick(ts) {
    raf = 0; const dt = prevTs ? Math.min(64, ts - prevTs) : 16; prevTs = ts;
    const q = reduce ? (qNow() > 0.5 ? 1 : 0) : qNow(); drawHero(q);
    let goal = target();
    autoStep(goal);
    const r = layout.getBoundingClientRect();
    prog.classList.toggle("on", r.top <= 0 && r.bottom > innerHeight * 0.5);       // ticks only while the split section is on screen
    // text follows the scroll position directly (never lags the reader)
    const lastSlot = slots[slots.length - 1];
    slots.forEach(sl => sl.el.classList.toggle("active", goal >= sl.from && (goal < sl.to || (sl === lastSlot && goal <= sl.to))));
    if (reduce) {                                      // reduced motion: jump between key poses (nearest beat anchor, shown at that beat's resolved pose)
      const bi = anchors.reduce((c, a, i) => Math.abs(a - goal) < Math.abs(anchors[c] - goal) ? i : c, 0);
      shown = poses[bi]; paint(shown); return;
    }
    // exponential ease toward the scroll position, frame-rate independent: shown += (goal - shown) * (1 - e^(-dt/tau))
    shown = tau > 0 ? shown + (goal - shown) * (1 - Math.exp(-dt / tau)) : goal;
    if (Math.abs(goal - shown) < 0.0004) shown = goal;
    const handOn = handTick(ts, shown);
    paint(shown);
    if (shown !== goal || handOn) req();                // keep animating until the scene catches up, and while the hand card's own loop is running
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
  on(window, "scroll", req, { passive: true });
  on(window, "resize", () => { last = -1; req(); });
  offs.push(() => { cancelAnimationFrame(raf); raf = 0; });

  if (STORY.mode === "snap") {                          // soft snap to beat anchors
    document.documentElement.style.scrollSnapType = "y proximity";
    STORY.beats.forEach(b => {
      const d = document.createElement("div");
      d.style.cssText = `position:absolute;left:0;width:1px;height:1px;top:calc(${b.snap ?? b.range[0]} * (100% - 100vh));scroll-snap-align:start`;
      layout.appendChild(d);
    });
  }
  measure(); shown = target(); req();
  on(window, 'resize', () => { measure(); req(); });
  let alive = true; offs.push(() => { alive = false; });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive) { measure(); req(); } });
  return function stop() { while (offs.length) { try { offs.pop()(); } catch (e) { console.error("M-GOAT stop:", e); } } };
})();
}
