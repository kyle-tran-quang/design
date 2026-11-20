/* isometric-3d-ui-showcase — shared stage runtime (no dependencies)
 *
 * A stage is a pure function render(frame) that writes styles for ONE frame.
 * Nothing is animated by CSS transitions, so the stage is scrubbable, deterministic,
 * screenshot-testable (?f=N) and portable to Remotion (useCurrentFrame -> render).
 *
 * Design space: 1920x1080 "stage units" at 23.976 fps. The stage <div> is scaled
 * uniformly to fit the window; every length inside it is in design px.
 *
 * URL params:  ?f=N      freeze on frame N (paused)      ?ui=0   hide the control bar
 *              ?loop=0   play once                        ?speed=0.5  playback speed
 */
(function (global) {
  'use strict';

  const FPS = 24000 / 1001; // 23.976

  /* ---------- math / easing ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /** CSS-style cubic-bezier easing, solved with Newton + bisection fallback. */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t;
    const Y = (t) => ((ay * t + by) * t + cy) * t;
    const dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const err = X(t) - x;
        if (Math.abs(err) < 1e-6) return Y(t);
        const d = dX(t);
        if (Math.abs(d) < 1e-6) break;
        t -= err / d;
      }
      let lo = 0, hi = 1;
      t = x;
      for (let i = 0; i < 24; i++) {
        const v = X(t);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return Y(t);
    };
  }

  /** Named curves measured from the reference clips (see references/motion-spec.md). */
  const ease = {
    linear: (t) => t,
    standard: bezier(0.4, 0, 0.2, 1),      // wireframe grow (clip 01)
    expoOut: bezier(0.1, 0.1, 0.1, 1),     // UI rise-in (clip 01) — very fast start, long settle
    out: bezier(0, 0, 0.2, 1),             // generic ease-out
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOut: bezier(0.65, 0, 0.35, 1),
  };

  /** progress of frame f through [a, b], eased, clamped to 0..1 */
  const prog = (f, a, b, e = ease.linear) => e(clamp((f - a) / (b - a)));

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Split an element's text into one <span class="c"> per character (keeps <br>). */
  function splitChars(el) {
    const spans = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const ch of n.textContent) {
            const s = document.createElement('span');
            s.className = 'c';
            s.textContent = ch;
            frag.appendChild(s);
            spans.push(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return spans;
  }

  /** Fit the 1920x1080 stage into the window (contain). */
  function fit(stage, host) {
    const s = Math.min(host.clientWidth / 1920, host.clientHeight / 1080);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
    return s;
  }

  /* ---------- mount ---------- */
  /**
   * @param {object} o
   * @param {number} o.frames   total frames
   * @param {function(number)} o.render  called with an integer frame
   * @param {function} [o.setup] called once before first render
   */
  function mount(o) {
    const q = new URLSearchParams(location.search);
    const host = $('#host');
    const stage = $('#stage');
    const ui = !(q.get('ui') === '0');
    let loop = q.get('loop') !== '0';
    let speed = parseFloat(q.get('speed') || '1');
    let frame = 0, playing = !q.has('f'), last = performance.now(), acc = 0;

    if (o.setup) o.setup(stage);
    const onResize = () => fit(stage, host);
    window.addEventListener('resize', onResize);
    onResize();

    // control bar
    let bar, scrub, readout, playBtn;
    if (ui) {
      bar = document.createElement('div');
      bar.className = 'bar';
      bar.innerHTML =
        '<button id="play" aria-label="Play/pause">❚❚</button>' +
        '<input id="scrub" type="range" min="0" max="' + (o.frames - 1) + '" value="0" step="1">' +
        '<span id="readout"></span>' +
        '<label><input id="loop" type="checkbox"' + (loop ? ' checked' : '') + '> loop</label>' +
        '<select id="speed"><option>0.25</option><option>0.5</option><option selected>1</option><option>2</option></select>';
      document.body.appendChild(bar);
      scrub = $('#scrub'); readout = $('#readout'); playBtn = $('#play');
      scrub.addEventListener('input', () => { playing = false; set(+scrub.value); });
      playBtn.addEventListener('click', () => { playing = !playing; if (playing && frame >= o.frames - 1) frame = 0; });
      $('#loop').addEventListener('change', (e) => (loop = e.target.checked));
      $('#speed').value = String(speed);
      $('#speed').addEventListener('change', (e) => (speed = parseFloat(e.target.value)));
    }

    function set(f) {
      frame = clamp(Math.round(f), 0, o.frames - 1);
      o.render(frame);
      if (ui) {
        scrub.value = frame;
        playBtn.textContent = playing ? '❚❚' : '▶';
        readout.textContent = 'f ' + String(frame).padStart(3, '0') + ' / ' + (o.frames - 1) +
          '  ·  ' + (frame / FPS).toFixed(2) + ' s';
      }
    }

    function tick(now) {
      const dt = (now - last) / 1000; last = now;
      if (playing) {
        acc += dt * FPS * speed;
        const step = Math.floor(acc);
        if (step > 0) {
          acc -= step;
          let nf = frame + step;
          if (nf >= o.frames) { if (loop) nf = 0; else { nf = o.frames - 1; playing = false; } }
          set(nf);
        }
      }
      requestAnimationFrame(tick);
    }

    set(q.has('f') ? parseInt(q.get('f'), 10) : 0);
    document.fonts && document.fonts.ready.then(() => set(frame));
    requestAnimationFrame(tick);

    // test hook for headless checks
    global.__setFrame = (f) => { playing = false; set(f); };
    return { set };
  }

  global.Stage = { FPS, clamp, lerp, bezier, ease, prog, $, $$, splitChars, mount };
})(window);
