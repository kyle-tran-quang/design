/* =========================================================================
   STAGE F PIECE: the maturity-map window (Figma 21a 235:9309 single-stage view, 21b 235:8232 comparison view), rebuilt as LIVE HTML, plus the drawn cursor and its tap ring.
   ONE engine piece, rect = the window (600 x 600 at stage (60, 212)). Everything inside is positioned in WINDOW-LOCAL px (Figma px of this drawing, roughly 0.3x of normal UI sizes).
   update(body, k, t) is a PURE FUNCTION of scroll progress t: no timers, no clock, no CSS transitions, no state kept between calls. Scrolling backward plays it in reverse.
   Refs live ON the body element (body.__sf), never in the closure (the page may mount the same scene twice).

   API    StagefPiece.make({ vh, T }) -> { html, update(body, k, t) }
            vh(t)  -> LOCAL vh of scroll (0 = the first vh after Stage E's final rest). Use  t => t * TIMING.MAX - startVh  when wired.
            T      -> the windows (defaults to STAGEF.TIMING)
          StagefPiece.state(v, T) -> the numeric pose at local vh v (pure; used by the reports and tests)

   WHAT MOVES (all in stagef-data.js windows)
     cue       cursor travels (quadratic bow) from beyond the window's right edge to the "Compare stages" toggle; clipped by the window until it crosses the edge, so it ENTERS already moving
     tap       cursor scale dip 0.92 + a ring that grows and fades
     toggle    knob slides, track #8D8D8D -> #24A148
     compare   HERO 3. Stage tabs -> "Choose 2 stages" checkbox row (the same "Stage n" labels travel, boxes and the question label arrive); Stage 1's column narrows 227.9 -> 133.4 px
               (a real width change: the text re-wraps) and its gaps ease to the 21b values; Stage 1's lower blocks fade as "What's holding them back" arrives
     stage2    SUPPORTER. Stage 2 column + divider slide in 22 px and fade up; the Feedback tab follows 6 vh later
     cursorOut the cursor fades
   COLOURS are explicit values from Figma (no theme variables): this piece is the same in light and dark.
   ========================================================================= */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const win = (v, w) => clamp((v - w[0]) / (w[1] - w[0]), 0, 1);
  const sine = u => .5 - .5 * Math.cos(Math.PI * u);
  const cubic = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const smooth = u => u * u * (3 - 2 * u);
  const f3 = v => String(Math.round(v * 1000) / 1000);
  const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const mix = (a, b, u) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(",")})`;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Layout numbers of the two poses (window-local px). Measured from m-goat/assets/stagef/f21a.png and f21b.png (1.953 px per stage px) and the Figma node values in STAGE-F-HANDOFF.md.
  const L = {
    colX: 220.6, row0: 233.5, tabH: 16,                  // right column left edge; stage tabs row top and height
    top1: 267.7, top2: 271.3,                            // top of the stage columns in 21a / 21b
    w1: [227.9, 133.4],                                  // Stage 1 column width: single / comparison
    hg: [18.18, 23.8],                                   // heading -> "Where the customer is"
    pg: [5.8, 12.4],                                     // tags -> paragraph
    stackMt: [7.1, 113],                                 // paragraph -> lower blocks (they leave in 21b; "What's holding them back" sits at holdY)
    holdY: 594,                                          // window-local top of "What's holding them back"
    s2x: 378.8, divX: 366.5, fbX: 587.94, fbY: 476.96,
    tabX: i => L.colX + 31.4 * i + 6.06,                 // stage label left in the tab row
    chkX: i => L.colX + 1 + 35.85 * i,                   // checkbox box left
    lblX: i => L.colX + 10.8 + 35.85 * i,                // stage label left in the checkbox row
    tabY: 238.2, lblY: 244.3                             // stage label top (tab row / checkbox row)
  };

  function state(v, T) {
    const D = window.STAGEF, K = D.KNOBS, C = D.GEO.cursor;
    T = T || D.TIMING;
    const c = cubic(win(v, T.cue)), tp = win(v, T.tap), tg = sine(win(v, T.toggle)), cm = cubic(win(v, T.compare));
    const s2 = cubic(win(v, [T.stage2[0], T.stage2[1] - K.stage2Step])), fb = cubic(win(v, [T.stage2[0] + K.stage2Step, T.stage2[1]]));
    const out = smooth(win(v, T.cursorOut));
    // cursor: quadratic bow from -> to; opaque from the start of the cue, faded by cursorOut
    const [x0, y0] = C.from, [x2, y2] = C.to, dx = x2 - x0, dy = y2 - y0, len = Math.hypot(dx, dy) || 1;
    const cx = (x0 + x2) / 2 - dy / len * C.arc, cy = (y0 + y2) / 2 + dx / len * C.arc;
    const px = (1 - c) * (1 - c) * x0 + 2 * (1 - c) * c * cx + c * c * x2, py = (1 - c) * (1 - c) * y0 + 2 * (1 - c) * c * cy + c * c * y2;
    return {
      c, tp, tg, cm, s2, fb,
      cur: { x: px, y: py, o: (v >= T.cue[0] ? 1 : 0) * (1 - out), s: 1 - (1 - K.tapScale) * Math.sin(Math.PI * tp) },
      ring: { r: lerp(1, D.GEO.tapRing.r, tp), o: tp > 0 && tp < 1 ? .35 * (1 - tp) : 0 },
      knob: 9.08 * tg,
      w1: lerp(L.w1[0], L.w1[1], cm), top: lerp(L.top1, L.top2, cm), hg: lerp(L.hg[0], L.hg[1], cm), pg: lerp(L.pg[0], L.pg[1], cm), stackMt: lerp(L.stackMt[0], L.stackMt[1], cm),
      stackO: 1 - smooth(win(cm, [0, .5])), holdO: smooth(win(cm, [.5, 1])),
      q: smooth(win(cm, [0, .7])), underO: 1 - smooth(win(cm, [0, .4])), boxO: smooth(win(cm, [.3, 1]))
    };
  }

  function make({ vh, T }) {
    const D = window.STAGEF, G = D.GEO, W = D.COPY.window;
    T = T || D.TIMING;

    const check = '<svg class="sf-ck" viewBox="0 0 6 6" width="6.06" height="6.06"><circle cx="3" cy="3" r="2.6" fill="none" stroke="#161616" stroke-width=".45"/><path d="M1.8 3.1 2.7 3.9 4.3 2.2" fill="none" stroke="#161616" stroke-width=".45"/></svg>';
    const tags = W.tags.map(s => `<span class="sf-tag">${esc(s)}</span>`).join("");
    const ready = (label, extraStyle) => `<div class="sf-ready" ${extraStyle || ""}><div class="sf-rl">${check}<span>${esc(label)}</span></div><div class="sf-rt">${esc(W.readyText)}</div></div>`;
    const block = (h, p, st) => `<div class="sf-blk" ${st || ""}><div class="sf-h2">${esc(h)}</div><div class="sf-p" style="margin-top:9.09px">${esc(p)}</div></div>`;

    const rail = W.rail.map((s, i) => `<div class="sf-rrow${i ? "" : " sel"}"><i></i><span>${esc(s)}</span></div>`).join("");
    const logo = '<svg class="sf-logo" viewBox="0 0 24 24" width="24.24" height="24.24"><defs><linearGradient id="sfg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7B4DE8"/><stop offset="1" stop-color="#0F62FE"/></linearGradient></defs>' +
      '<path d="M12 2.2 20.2 6.9V17.1L12 21.8 3.8 17.1V6.9Z" fill="none" stroke="url(#sfg)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.1" fill="none" stroke="#161616" stroke-width="1.5"/></svg>';
    const dl = '<svg class="sf-dl" viewBox="0 0 6 6" width="6.06" height="6.06"><path d="M3 .6V4M1.5 2.6 3 4.1 4.5 2.6M.8 5.3h4.4" fill="none" stroke="#fff" stroke-width=".5"/></svg>';

    // stage labels: one element per stage; they travel from the tab row to the checkbox row
    const labels = W.stageTabs.map((s, i) => `<span class="sf-sl" data-sl="${i}">${esc(s)}</span>`).join("");
    const unders = W.stageTabs.map((s, i) => `<i class="sf-un${i ? "" : " sel"}" data-un style="left:${f3(L.colX + 31.4 * i)}px"></i>`).join("");
    const boxes = W.stageTabs.map((s, i) => `<i class="sf-bx${i < 2 ? " on" : ""}" data-bx style="left:${f3(L.chkX(i))}px">${i < 2 ? '<svg viewBox="0 0 6 6" width="5.3" height="5.3"><path d="M1.2 3.2 2.5 4.4 4.8 1.8" fill="none" stroke="#fff" stroke-width=".7"/></svg>' : ""}</i>`).join("");

    const html =
      `<div class="sf-root" data-sf>` +
        `<div class="sf-win" data-win>` +
          // ---- UI shell header (UI shell, #F4F4F4)
          `<div class="sf-a sf-nav"><span class="sf-ibm" style="left:6.06px">IBM</span><span class="sf-app" style="left:18.3px">${esc(W.appName)}</span><i class="sf-div" style="left:145.3px"></i>` +
          `<span class="sf-ni" style="left:151.5px;width:32.3px">${esc(W.nav[0])}</span><span class="sf-ni sel" style="left:186.8px;width:57.3px">${esc(W.nav[1])}</span></div>` +
          // ---- header section: logo, serif heading, subtitle
          `<div class="sf-a sf-hero">${logo}<div class="sf-brand"><span>IBM</span> <b>Maximo\u00ae</b></div>` +
          `<div class="sf-title">Plan your customers\u2019 next<br>move</div><div class="sf-sub">${esc(W.subtitle)}</div></div>` +
          // ---- product tabs (FSM selected)
          `<div class="sf-a sf-pt sel" style="left:87.88px;width:94.7px">${esc(W.tabs[0])}</div><div class="sf-a sf-pt" style="left:184.2px;width:107px">${esc(W.tabs[1])}</div>` +
          // ---- left rail
          `<div class="sf-a sf-rail">${rail}</div>` +
          `<div class="sf-a sf-btn"><span>Download APM maturity map</span>${dl}</div>` +
          // ---- stage tabs / checkbox row, toggle
          unders + `<div class="sf-a sf-ruler" data-ruler></div>` +
          `<div class="sf-a sf-q" data-q>${esc(W.chooseLabel)}</div>` + boxes + labels +
          `<div class="sf-a sf-tgl" data-tgl><i class="sf-trk" data-trk><i class="sf-knob" data-knob></i></i><span>${esc(W.compareLabel)}</span></div>` +
          // ---- Stage 1 column (single -> narrower)
          `<div class="sf-a sf-col" data-c1><div class="sf-h1">${esc(W.s1.n)}<br>${esc(W.s1.name)}</div>` +
            `<div class="sf-h2" data-c1w>${esc(W.where)}</div><div class="sf-tags" style="margin-top:6.2px">${tags}</div><div class="sf-p" data-c1p>${esc(W.s1Para)}</div>` +
            `<div class="sf-stack" data-c1s>${ready(W.ready1)}${block(W.value.h, W.value.p, 'style="margin-top:18.18px"')}${block(W.pilot.h, W.pilot.p, 'style="margin-top:18.18px"')}</div></div>` +
          `<div class="sf-a sf-h2" data-hold style="left:${L.colX}px;top:${L.holdY}px;opacity:0">${esc(W.holding)}</div>` +
          // ---- divider, Stage 2 column, Feedback tab
          `<i class="sf-a sf-vl" data-vl style="left:${L.divX}px;top:${L.top2}px;height:${600 - L.top2}px"></i>` +
          `<div class="sf-a sf-col" data-c2 style="left:${L.s2x}px;top:${L.top2}px;width:133.4px"><div class="sf-h1">${esc(W.s2.n)}<br>${esc(W.s2.name)}</div>` +
            `<div class="sf-h2" style="margin-top:23.8px">${esc(W.where)}</div><div class="sf-tags" style="margin-top:6.2px">${tags}</div><div class="sf-p" style="margin-top:12.4px">${esc(W.s2Para)}</div>${ready(W.ready2, 'style="margin-top:10px"')}</div>` +
          `<div class="sf-a sf-fb" data-fb style="left:${L.fbX}px;top:${L.fbY}px"><span>${esc(W.feedback)}</span></div>` +
        `</div>` +
        // ---- cursor + tap ring (drawn only; outside .sf-win's clip? no: inside the root, clipped by .sf-clip so it enters from beyond the window edge)
        `<div class="sf-clip"><i class="sf-ring" data-ring></i><svg class="sf-cur" data-cur viewBox="0 0 9 13" width="${G.cursor.size * 0.7}" height="${G.cursor.size}"><path d="M.5.5v10.2l2.5-2.3 1.9 4.2 1.7-.8-1.8-4h3.6Z" fill="#161616" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/></svg></div>` +
      `</div>`;

    const bind = body => {
      const q = s => body.querySelector(s), qa = s => [...body.querySelectorAll(s)];
      return { c1: q("[data-c1]"), c1w: q("[data-c1w]"), c1p: q("[data-c1p]"), c1s: q("[data-c1s]"), c2: q("[data-c2]"), vl: q("[data-vl]"), fb: q("[data-fb]"), hold: q("[data-hold]"),
               trk: q("[data-trk]"), knob: q("[data-knob]"), q: q("[data-q]"), cur: q("[data-cur]"), ring: q("[data-ring]"),
               sl: qa("[data-sl]"), un: qa("[data-un]"), bx: qa("[data-bx]") };
    };
    const GREY = hex("#525252"), INK = hex("#161616"), OFF = hex("#8D8D8D"), ON = hex("#24A148");

    function update(body, k, t) {
      const R = body.__sf || (body.__sf = bind(body));
      const S = state(vh(t), T);
      const C = G.cursor;
      // ---- toggle
      R.knob.style.transform = `translateX(${f3(S.knob)}px)`;
      R.trk.style.background = mix(OFF, ON, S.tg);
      // ---- stage labels: tab row -> checkbox row (same elements, they move)
      R.sl.forEach((el, i) => {
        el.style.transform = `translate(${f3(lerp(L.tabX(i), L.lblX(i), S.q))}px,${f3(lerp(L.tabY, L.lblY, S.q))}px)`;
        el.style.color = i === 0 ? mix(INK, INK, 0) : mix(GREY, INK, S.q);
        el.style.fontWeight = i === 0 && S.q < .5 ? 600 : 400;
      });
      R.un.forEach(el => { el.style.opacity = f3(S.underO); });
      R.bx.forEach(el => { el.style.opacity = f3(S.boxO); el.style.transform = `scale(${f3(lerp(.6, 1, S.boxO))})`; });
      R.q.style.opacity = f3(S.boxO);
      // ---- Stage 1 column reflows narrower; its gaps and lower blocks follow
      R.c1.style.width = f3(S.w1) + "px";
      R.c1.style.top = f3(S.top) + "px";
      R.c1w.style.marginTop = f3(S.hg) + "px";
      R.c1p.style.marginTop = f3(S.pg) + "px";
      R.c1s.style.marginTop = f3(S.stackMt) + "px";
      R.c1s.style.opacity = f3(S.stackO);
      R.hold.style.opacity = f3(S.holdO);
      // ---- Stage 2 column, divider, Feedback tab
      R.c2.style.opacity = f3(S.s2); R.c2.style.transform = `translateX(${f3(G.stage2.dx * (1 - S.s2))}px)`;
      R.vl.style.opacity = f3(S.s2);
      R.fb.style.opacity = f3(S.fb); R.fb.style.transform = `translateX(${f3(12 * (1 - S.fb))}px)`;
      // ---- cursor (hotspot = the arrow tip) and tap ring
      R.cur.style.opacity = f3(S.cur.o);
      R.cur.style.transform = `translate(${f3(S.cur.x)}px,${f3(S.cur.y)}px) scale(${f3(S.cur.s)})`;
      R.ring.style.opacity = f3(S.ring.o);
      R.ring.style.transform = `translate(${f3(S.cur.x - S.ring.r)}px,${f3(S.cur.y - S.ring.r)}px)`;
      R.ring.style.width = R.ring.style.height = f3(S.ring.r * 2) + "px";
    }
    return { html, update };
  }

  window.StagefPiece = { make, state, L };
})();
