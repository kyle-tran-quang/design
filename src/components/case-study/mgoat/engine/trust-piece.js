/* =========================================================================
   TRUST PIECE: slide 16 "report" pulls apart into the three cards of slide 17 (Figma 208:9292 "17 Report trust and disclosure", stage frame 208:9293, 720 x 1024).
   One live HTML piece, update(body, k, t) = a PURE FUNCTION of scroll progress t (scroll is the only clock; no timers, no Date). Scrolling backward plays in reverse.

   WHAT IT DRAWS (only the destination cards; the report at rest is the sibling's ReportPiece, this file does not depend on it):
     banner  "Your Maturity index score" card (208:9322)   starts as a window onto the report's illustration strip   -> blue card
     bars    "Card - Progress bars (8)" (208:9295)          starts as a window onto the report's meters block         -> dark card, the two columns WIDEN (190.7 -> 266.7), bars are live
     nav     "Satellite - Vertical tabs" (208:9342)         starts as a window onto the report's nav list + buttons    -> dark card
     tabs    "Card - Tabs + panel" (208:9307)               starts as the 72.6px sliver of the panel that the report page clips, and OPENS DOWNWARD to 255px
                                                            (progressive disclosure, literally: the panel is revealed, not faded in)
   Each card is a clipped window: its rect animates from the report-region rect to the slide-17 rect, with content that is identical at both ends where possible (so nothing
   cross-fades unless the report had nothing there). A light blueprint lift sits on top: 1px outline + tiny mono tag + a dashed ghost of the destination slot, visible only
   from the cue until each card has landed.

   LIVING ELEMENT: in the rest, a small cursor clicks the tab panel's tabs (Asset data -> Work management -> Scheduling -> back to Asset data). Figma holds body copy for the
   Asset data tab ONLY (searched the whole file), so the other two tabs show a quiet skeleton, no invented words. Ends on Asset data = the slide-17 composition, which is also the
   prefers-reduced-motion pose and what the next beat must morph from.

   GEOMETRY (all Figma, stage coordinates, 1px = 1px; measured with use_figma read-only):
     slide 17 destinations .. see TO below (absoluteBoundingBox of 208:9322, 9295, 9342, 9307 inside 208:9293)
     slide 16 sources ....... see FROM below (frame 208:8302, report page 208:8303 at (20,285) 680 x 576, clipsContent = true, which is why the tab panel is a sliver)
   COLOURS/TYPE read from nodes: IBM Plex Sans (400/600/700), 48/100 is "IBM Plex Math" 33.17px; sizes 8.29 (meters, body) and 7.256 (+0.083 tracking) for nav/tabs/buttons.
   ========================================================================= */
(function () {
  "use strict";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const f2 = v => (Math.round(v * 100) / 100).toString();
  const io3 = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const ios = u => 0.5 - 0.5 * Math.cos(Math.PI * u);      // sine in-out for the cursor: peak slope 1.57
  const HEX = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = HEX(a), B = HEX(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join(""); };
  const rgba = (c, a) => { const h = HEX(c); return `rgba(${h[0]},${h[1]},${h[2]},${f2(a)})`; };
  const bell = (p, a, m, b) => sm(a, m, p) * (1 - sm(m, b, p));

  // ---- colours (Figma fills/strokes)
  const C = { report: "#161616", stage: "#262626", card: "#171717", line: "#393939", panelLine: "#525252", blue: "#0f62fe", strip: "#333333",
              t1: "#f4f4f4", t2: "#c6c6c6", tabIdle: "#393939", tabTop: "#4589ff", ok: "#24a148", warn: "#f1c21b", info: "#33b1ff", tick: "#6f6f6f", bp: "#78a9ff", bpLight: "#a6c8ff" };

  // ---- the four cards: FROM = region of the slide-16 report, TO = slide-17 rect (stage coordinates)
  //   banner  FROM 208:8304 "simplified ver - v2" (20, 285, 680 x 109.36) - the illustration strip           TO 208:9322 (60, 139, 600 x 140.46)
  //   bars    FROM 208:8371 "Frame 2774" (285.37, 527.14, 398.05 x 161.22) - 8 meters, 190.73 wide columns     TO 208:9295 (60, 315.46, 600 x 211.22)
  //   nav     FROM union of 208:8358 nav list (36.59, 622.15, 85 x 165.85) and 208:8359 buttons (36.59, 805.1, 174.22 x 25.55) -> (36.59, 622.15, 174.22 x 208.5)   TO 208:9342 (60, 563, 184 x 255)
  //   tabs    FROM 208:8386 "Frame 2720" (285.37, 788.41, 398.05 x 255.37) CLIPPED by the report page at y = 861 -> visible h 72.59      TO 208:9307 (275, 563, 385 x 255.37)
  const CARDS = [
    { id: "banner", tag: "BANNER", from: { x: 20,     y: 285,    w: 680,    h: 109.36 }, to: { x: 60,  y: 139,    w: 600, h: 140.46 } },
    { id: "bars",   tag: "BARS",   from: { x: 285.37, y: 527.14, w: 398.05, h: 161.22 }, to: { x: 60,  y: 315.46, w: 600, h: 211.22 } },
    { id: "nav",    tag: "NAV",    from: { x: 36.59,  y: 622.15, w: 174.22, h: 208.5  }, to: { x: 60,  y: 563,    w: 184, h: 255 } },
    { id: "tabs",   tag: "TABS",   from: { x: 285.37, y: 788.41, w: 398.05, h: 72.59  }, to: { x: 275, y: 563,    w: 385, h: 255.37 } }
  ];

  // ---- TIMING in vh of scroll for the whole piece (TOTAL), converted to fractions of the piece window [t0, t1]. Retime here only.
  //   Settle 0-4 | Cue 4-12 (outlines + ghosts + tags appear on the four source windows) | Hero 12-48 (4 cards, start every 6vh, each runs 18vh) |
  //   Land 48-58 (outlines/tags release) | Rest 58-106 (stage fully still; text anchor 82, 46 words need 48vh) | tab cycle 106-156 AFTER the text rest (cursor hops sized to <= 6x scroll) (living element, returns to Asset data)
  const TOTAL = 156, V = vh => vh / TOTAL;
  const TM = {
    cue: [4, 12], heroStart: [12, 18, 24, 30], run: 18, release: [-4, 6],        // release = outline/tag fade, relative to each card's own arrival
    curIn: [106, 108], toWork: [108, 118], pressWork: [118, 120], swWork: [119, 122],
    toSched: [122, 127], pressSched: [127, 129], swSched: [128, 131],
    toAsset: [132, 140], pressAsset: [140, 142], swAsset: [141, 144], curOut: [144, 156]
  };

  // ---- data (all text verbatim from Figma)
  const BARS = [   // [title (with the original line break), status, fill width, colour, two-line]
    ["Asset data", "Established", 138.38, C.ok, 0], ["Work management", "Established", 138.38, C.ok, 0],
    ["Inspections and<br>condition capture", "Emerging", 25.91, C.warn, 1], ["Supply chain and<br>inventory", "Growing", 103.66, C.info, 1],
    ["Scheduling", "Growing", 116.62, C.info, 0], ["Reliability practices", "Emerging", 4.66, C.warn, 0],
    ["Condition monitoring<br>and prediction", "Emerging", 30.58, C.warn, 1], ["Assignment<br>and dispatch", "Growing", 82.93, C.info, 1]
  ];
  const ROW_Y = [0, 36.88, 84.76, 121.63];
  const NAV = ["Where you are today", "Opportunities to increase ROI", "Your action plan", "Additional resources", "Help us improve"];
  const TABS = [["Asset data", 53.59, 0.52], ["Work management", 79.59, 54.11], ["Scheduling", 53.59, 133.7]];   // [label, width, x] card-local (Figma 208:9309 children)
  const ASSET_P = "Your asset register is a trusted, governed single source of truth—work order linkage, job plan reuse, and any analytics built on asset data are reliable because the foundation underneath them is clean and consistent.<br><br>This positions you to build classification, hierarchy, and relationship structure on top of data you can trust.";
  const ASSET_APPS = "Maximo Health Dashboard — Alert-to-Investigation Workflow<br>Maximo Predict — Contributing Factors for Root Cause Input<br>Maximo Manage — Service Requests &amp; RCBF Work Orders<br>Reliability Strategies — FMEA Update &amp; Job Plan Revision";
  const ASSET_ROLES = "Reliability Engineer; Maintenance Engineer; Asset Manager";

  const SELF_SRC = (typeof document !== "undefined" && document.currentScript && document.currentScript.src) || "";
  const FONT_LINK_ID = "trust-piece-fonts";
  function ensureFonts() {              // IBM Plex Sans is loaded by index.html; "IBM Plex Math" (the 48/100) is not, so this piece asks for it once
    if (typeof document === "undefined" || document.getElementById(FONT_LINK_ID)) return;
    const l = document.createElement("meta"); l.id = FONT_LINK_ID;      // only a marker so the Plex Math face below is added once: Plex Sans and Mono are self-hosted by the app (src/index.css)
    document.head.appendChild(l);
    // IBM Plex Math is not on Google Fonts: reuse the digits subset shipped for the expansion card (the "/" falls back to the serif stack)
    if (!document.getElementById(FONT_LINK_ID + "-math")) { const s = document.createElement("style"); s.id = FONT_LINK_ID + "-math"; let u = window.MG_BASE + "expansion/IBMPlexMath-digits.woff2"; s.textContent = `@font-face{font-family:"IBM Plex Math";src:url("${u}") format("woff2");font-weight:400;font-display:block}`; document.head.appendChild(s); }
  }

  const CSS = `
.tr-root{position:absolute;inset:0;overflow:visible;font-family:"IBM Plex Sans",system-ui,sans-serif;color:${C.t1};-webkit-font-smoothing:antialiased}
.tr-root *{box-sizing:border-box;margin:0}
.tr-card{position:absolute;left:0;top:0}
.tr-bg{position:absolute;inset:0;overflow:hidden}
.tr-abs{position:absolute;white-space:nowrap}
.tr-bd{position:absolute;inset:0;border:1px solid transparent;pointer-events:none}
.tr-ol{position:absolute;inset:-1px;border:1px solid ${C.bp};pointer-events:none;opacity:0}
.tr-tag{position:absolute;left:-1px;top:-1px;transform:translateY(-100%);font:500 9px/1 "IBM Plex Mono",ui-monospace,Menlo,monospace;letter-spacing:.06em;color:${C.bp};background:${C.stage};padding:3px 5px;white-space:nowrap;opacity:0;pointer-events:none}
.tr-ghost{position:absolute;border:1px dashed ${C.bp};pointer-events:none;opacity:0}
.tr-t{font-size:8.2927px;line-height:11.4024px}
.tr-s{font-size:7.2561px;line-height:9.3293px;letter-spacing:.0829px}
.tr-cursor{position:absolute;left:0;top:0;opacity:0;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}
.tr-sk{position:absolute;height:4px;border-radius:1px;background:${C.t2}}`;

  function make(opts) {
    opts = opts || {};
    const t0 = opts.t0 != null ? opts.t0 : 0, t1 = opts.t1 != null ? opts.t1 : 1;
    ensureFonts();
    const reduced = () => { try { return opts.reduced ? !!opts.reduced() : (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } };

    // ---------------- static HTML
    const bannerHTML =
      `<div data-k="b-in" style="position:absolute;inset:0;opacity:0">` +
      `<div class="tr-abs tr-t" style="left:16.59px;top:24.36px;font-weight:600">Your Maturity index score</div>` +
      `<div class="tr-abs" style="left:16.59px;top:52.35px;font:400 33.17px/36.28px 'IBM Plex Math','IBM Plex Serif',Georgia,serif">48/100</div>` +
      `<div class="tr-abs tr-t" style="left:16.59px;top:90.7px;font-weight:700">Level 2 </div>` +
      `<div class="tr-abs tr-t" style="left:16.59px;top:105.73px">Core operations established</div>` +
      `<div class="tr-abs tr-t" data-k="b-right" style="top:24.36px;width:122.84px;font-weight:700">Your strongest capabilities</div>` +
      ["Asset data", "Work Management", "Scheduling"].map((s, i) => `<div class="tr-abs tr-t" data-k="b-row" style="top:${f2(53.9 + 20.73 * i)}px;width:122.84px;height:16.59px;background:linear-gradient(90deg,#a6c8ff,#78a9ff) bottom/100% .52px no-repeat">${s}</div>`).join("") +
      `</div>`;

    const barsHTML =
      `<div data-k="g-in" style="position:absolute;left:0;top:0">` +
      BARS.map((b, i) => {
        const bar = b[4] ? 31.29 : 20.29;
        return `<div data-k="bar" style="position:absolute;top:${ROW_Y[i >> 1]}px;height:${f2(bar + 4.15)}px">` +
          `<div class="tr-abs tr-t" style="left:0;top:0;font-weight:600;color:${C.t1}">${b[0]}</div>` +
          `<div class="tr-abs tr-t" data-k="bv" style="top:${b[4] ? 11 : 0}px;color:${C.t2};text-align:right">${b[1]}</div>` +
          `<div data-k="btrack" style="position:absolute;left:0;top:${bar}px;height:4px;background:${C.stage}"></div>` +
          `<div style="position:absolute;left:0;top:${bar}px;height:4.15px;width:${b[2]}px;background:${b[3]}"></div>` +
          (false ? `<div data-k="btick" style="position:absolute;top:${bar}px;width:.52px;height:4.15px;background:${C.tick}"></div>` : "") +
          `</div>`;
      }).join("") + `</div>`;

    const navItems = NAV.map((s, i) => `<div style="position:absolute;left:0;top:${f2(33.17 * i)}px;width:85px;height:33.17px;display:flex;align-items:center;padding:0 8.29px;">` +
      `<div class="tr-s" style="width:68.41px;white-space:normal;${i === 0 ? `font-weight:600;color:${C.t1}` : `color:${C.t2}`}">${s}</div>` +
      `<div style="position:absolute;left:0;top:0;width:1.55px;height:33.17px;background:${i === 0 ? C.tabTop : C.panelLine}"></div></div>`).join("");
    const navHTML =
      `<div data-k="n-list" style="position:absolute;left:0;top:0;width:85px;height:165.85px">${navItems}</div>` +
      `<div data-k="n-b1" style="position:absolute;height:25.55px;background:${C.blue}"><div class="tr-abs tr-s" style="left:8.29px;top:8.1px;color:#fff">Talk to a seller</div></div>` +
      `<div data-k="n-b2" style="position:absolute;height:25.55px;width:75.46px;border:.52px solid #fff"><div class="tr-abs tr-s" style="left:7.77px;top:7.6px;color:#fff">Download</div>` +
      `<svg style="position:absolute;left:57.9px;top:8.4px" width="8.29" height="8.29" viewBox="0 0 8.29 8.29" fill="none"><path d="M1.56 2.74 L4.15 5.69 L6.74 2.74" stroke="#fff" stroke-width=".8"/></svg></div>`;

    const sk = (x, y, w, a) => `<div class="tr-sk" style="left:${x}px;top:${y}px;width:${w}px;opacity:${a}"></div>`;
    const placeholder = [223, 215, 223, 160, 0, 223, 190].map((w, i) => w ? sk(8.29, 13.9 + 11.4 * i, w, .1) : "").join("") +
      sk(8.29, 118.7, 85, .16) + [200, 223, 170, 190].map((w, i) => sk(8.29, 133.9 + 9.33 * i, w, .09)).join("") +
      sk(8.29, 196.8, 53, .16) + sk(8.29, 212, 190, .09);
    const tabHTML =
      `<div data-k="t-strip" style="position:absolute;left:.52px;top:.52px;height:25.55px;border-bottom:.52px solid ${C.panelLine}">` +
      TABS.map((t, i) => `<div data-k="tab" data-i="${i}" style="position:absolute;left:${f2(t[2] - 0.52)}px;top:0;width:${t[1]}px;height:25.55px;padding:7.77px 8.29px;border-top:0 solid ${C.tabTop}">` +
        `<div class="tr-abs tr-s" data-k="tl">${t[0]}</div>` + (i ? `<div style="position:absolute;left:0;top:0;width:.52px;height:26px;background:#6f6f6f"></div>` : "") + `</div>`).join("") +
      `<div style="position:absolute;left:${f2(186.65 - .52)}px;top:0;width:.52px;height:26px;background:#6f6f6f"></div></div>` +
      `<div style="position:absolute;left:.52px;top:26.07px">` +
        `<div data-k="pane" data-i="0" style="position:absolute;left:0;top:0;width:384px;height:229px">` +
          `<div class="tr-abs tr-t" style="left:8.29px;top:10.37px;width:223.38px;white-space:normal">${ASSET_P}</div>` +
          `<div class="tr-abs tr-s" style="left:8.29px;top:115.24px;font-weight:600">Supporting applications:</div>` +
          `<div class="tr-abs tr-s" style="left:8.29px;top:130.39px;color:${C.t2}">${ASSET_APPS}</div>` +
          `<div class="tr-abs tr-s" style="left:8.29px;top:193.27px;font-weight:600">Roles involved:</div>` +
          `<div class="tr-abs tr-s" style="left:8.29px;top:208.42px;color:${C.t2}">${ASSET_ROLES}</div></div>` +
        `<div data-k="pane" data-i="1" style="position:absolute;left:0;top:0;width:384px;height:229px;opacity:0">${placeholder}</div>` +
        `<div data-k="pane" data-i="2" style="position:absolute;left:0;top:0;width:384px;height:229px;opacity:0">${placeholder}</div>` +
      `</div>`;

    const inner = { banner: bannerHTML, bars: barsHTML, nav: navHTML, tabs: tabHTML };
    const cardHTML = CARDS.map(c =>
      `<div class="tr-ghost" data-ghost="${c.id}" style="left:${c.to.x - 1}px;top:${c.to.y - 1}px;width:${c.to.w + 2}px;height:${c.to.h + 2}px"></div>` +
      `<div class="tr-card" data-card="${c.id}"><div class="tr-bg" data-k="bg">${inner[c.id]}<div class="tr-bd" data-k="bd"></div></div><div class="tr-ol" data-k="ol"></div><div class="tr-tag" data-k="tag"></div></div>`).join("");
    const cursorHTML = `<svg class="tr-cursor" data-k="cur" width="14" height="19" viewBox="0 0 14 19"><path d="M.8.8 V15.2 L4.6 11.9 L7.3 17.8 L9.6 16.7 L6.9 10.9 L11.9 10.6 Z" fill="#fff" stroke="#161616" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
    const html = `<style>${CSS}</style><div class="tr-root" data-k="root" style="visibility:hidden">${cardHTML}${cursorHTML}</div>`;

    // ---------------- binding
    let Rf = null;
    const bind = body => {
      const q = s => body.querySelector(s), qa = s => [...body.querySelectorAll(s)];
      Rf = { body, root: q('[data-k="root"]'), cur: q('[data-k="cur"]'), cards: {}, ghosts: {} };
      CARDS.forEach(c => {
        const el = q(`[data-card="${c.id}"]`);
        Rf.cards[c.id] = { el, bg: el.querySelector('[data-k="bg"]'), bd: el.querySelector('[data-k="bd"]'), ol: el.querySelector('[data-k="ol"]'), tag: el.querySelector('[data-k="tag"]'), txt: "" };
        Rf.ghosts[c.id] = q(`[data-ghost="${c.id}"]`);
      });
      const B = Rf.cards.banner.el, G = Rf.cards.bars.el, N = Rf.cards.nav.el, T = Rf.cards.tabs.el;
      Rf.bIn = B.querySelector('[data-k="b-in"]'); Rf.bRight = B.querySelector('[data-k="b-right"]'); Rf.bRows = [...B.querySelectorAll('[data-k="b-row"]')];
      Rf.gIn = G.querySelector('[data-k="g-in"]'); Rf.bars = [...G.querySelectorAll('[data-k="bar"]')];
      Rf.bars.forEach(b => { b._v = b.querySelector('[data-k="bv"]'); b._tr = b.querySelector('[data-k="btrack"]'); b._tk = b.querySelector('[data-k="btick"]'); });
      Rf.nList = N.querySelector('[data-k="n-list"]'); Rf.nB1 = N.querySelector('[data-k="n-b1"]'); Rf.nB2 = N.querySelector('[data-k="n-b2"]');
      Rf.tabs = [...T.querySelectorAll('[data-k="tab"]')]; Rf.panes = [...T.querySelectorAll('[data-k="pane"]')]; Rf.tStrip = T.querySelector('[data-k="t-strip"]');
    };

    const SH_BASE = "0 16px 40px", SH_LIFT = "0 28px 56px";
    const shadow = (base, lift) => `${SH_BASE} ${rgba("#000000", base)},${SH_LIFT} ${rgba("#000000", lift)}`;

    function update(body, k, t) {
      if (!Rf || Rf.body !== body) bind(body);
      const p = (t - t0) / (t1 - t0), S = (a, b) => sm(V(a), V(b), p);
      Rf.root.style.visibility = p > 0 ? "visible" : "hidden";           // at p = 0 the sibling's report is on screen, identical to this piece's start; nothing is drawn before the beat
      const cue = S(TM.cue[0], TM.cue[1]);
      const U = {};

      CARDS.forEach((c, i) => {
        const R = Rf.cards[c.id], s = TM.heroStart[i], u = io3(clamp((p - V(s)) / V(TM.run), 0, 1)); U[c.id] = u;
        const x = lerp(c.from.x, c.to.x, u), y = lerp(c.from.y, c.to.y, u), w = lerp(c.from.w, c.to.w, u), h = lerp(c.from.h, c.to.h, u);
        R.el.style.cssText = `left:${f2(x)}px;top:${f2(y)}px;width:${f2(w)}px;height:${f2(h)}px`;
        const end = s + TM.run, lift = bell(u, 0, 0.5, 1);
        const rel = 1 - sm(V(end + TM.release[0]), V(end + TM.release[1]), p);           // blueprint outline + tag release as the card lands
        const bpA = cue * rel;
        R.ol.style.opacity = f2(bpA * (0.55 + 0.35 * lift));
        R.ol.style.borderColor = c.id === "banner" ? C.bpLight : C.bp;
        R.tag.style.opacity = f2(bpA);
        const txt = `${c.tag} · ${Math.round(w)}×${Math.round(h)}`; if (R.txt !== txt) { R.txt = txt; R.tag.textContent = txt; }
        const g = Rf.ghosts[c.id]; g.style.opacity = f2(cue * (1 - sm(0.55, 0.95, u)) * 0.7);
        const sb = (c.id === "tabs" ? 0.22 : 0.5) * sm(0.25, 1, u);
        let bg, bd;
        if (c.id === "banner") { bg = rgba(mix(C.strip, C.blue, sm(0, 0.8, u)), sm(0.05, 0.45, u)); bd = "transparent"; }
        else if (c.id === "bars") { bg = mix(C.report, C.card, u); bd = rgba(C.line, sm(0.2, 0.7, u)); }
        else if (c.id === "nav") { bg = mix(C.report, C.stage, u); bd = rgba(C.line, sm(0.2, 0.7, u)); }
        else { bg = mix(C.report, C.stage, u); bd = C.panelLine; }
        R.bg.style.background = bg;
        R.bg.style.boxShadow = shadow(sb, 0.3 * lift);
        R.bd.style.borderColor = c.id === "tabs" ? `${C.panelLine} ${C.panelLine} ${rgba(C.panelLine, sm(0.1, 0.6, u))} ${C.panelLine}` : bd;
        R.bd.style.borderWidth = c.id === "tabs" ? ".52px" : "1px";
      });

      // ---- banner: the illustration strip becomes the blue card; the words arrive once it is mostly blue
      const ub = U.banner, bw = lerp(CARDS[0].from.w, CARDS[0].to.w, ub);
      Rf.bIn.style.opacity = f2(sm(0.4, 0.75, ub));
      Rf.bRight.style.left = f2(bw - 16.59 - 122.84) + "px";
      Rf.bRows.forEach((r, i) => { r.style.left = f2(bw - 16.59 - 122.84) + "px"; });

      // ---- bars: the two columns widen; titles and statuses ride with them
      const ug = U.bars, cw = lerp(190.73, 266.71, ug), gap = lerp(207.31, 283.29, ug), pad = lerp(0, 25, ug);
      Rf.gIn.style.transform = `translate(${f2(pad)}px,${f2(pad)}px)`;
      Rf.bars.forEach((b, i) => {
        b.style.left = f2((i & 1) * gap) + "px"; b.style.width = f2(cw) + "px";
        b._v.style.right = "0px"; b._tr.style.width = f2(cw - 0.23) + "px";
        if (b._tk) b._tk.style.left = f2(cw - 0.52) + "px";
      });

      // ---- nav: list + buttons move together into the card's 17px padding; the primary button shrinks to its slide-17 width
      const un = U.nav, off = lerp(0, 17, un), by = lerp(182.95, 201.85, un);
      Rf.nList.style.transform = `translate(${f2(off)}px,${f2(off)}px)`;
      Rf.nB1.style.cssText = `position:absolute;height:25.55px;background:${C.blue};left:${f2(off)}px;top:${f2(by)}px;width:${f2(lerp(90.46, 66.24, un))}px`;
      Rf.nB2.style.left = f2(off + lerp(98.75, 74.54, un)) + "px"; Rf.nB2.style.top = f2(by) + "px";

      // ---- tabs: the strip is wider at the start (397 -> 384), the body is the same; the window opens downward through its own height
      const ut = U.tabs, tw = lerp(398.05, 385, ut);
      Rf.tStrip.style.width = f2(tw - 1.04) + "px";
      const rd = reduced();
      const wWork = rd ? 0 : S(...TM.swWork) - S(...TM.swSched), wSched = rd ? 0 : S(...TM.swSched) - S(...TM.swAsset), wAsset = 1 - wWork - wSched;
      const wts = [wAsset, wWork, wSched];
      Rf.panes.forEach((el, i) => { el.style.opacity = f2(wts[i]); });
      Rf.tabs.forEach((el, i) => {
        const a = wts[i];
        el.style.background = mix(C.tabIdle, C.stage, a);
        el.style.borderTopWidth = f2(1.04 * a) + "px";
        const l = el.querySelector('[data-k="tl"]'); l.style.color = mix(C.t2, C.t1, a); l.style.fontWeight = a > 0.5 ? 600 : 400;
      });

      // ---- cursor (living element): rides over the tab panel in the rest; hidden entirely under reduced motion
      const P0 = [255, 150], PW = [100, 17], PS = [160, 17], PA = [30, 17], TO = CARDS[3].to;
      const m1 = ios(S(...TM.toWork)), m2 = ios(S(...TM.toSched)), m3 = ios(S(...TM.toAsset)), m4 = ios(S(...TM.curOut));
      let cx = lerp(P0[0], PW[0], m1), cy = lerp(P0[1], PW[1], m1);
      cx = lerp(cx, PS[0], m2); cy = lerp(cy, PS[1], m2);
      cx = lerp(cx, PA[0], m3); cy = lerp(cy, PA[1], m3);
      cx = lerp(cx, P0[0], m4); cy = lerp(cy, P0[1], m4);
      const press = Math.max(bell(p, V(TM.pressWork[0]), V((TM.pressWork[0] + TM.pressWork[1]) / 2), V(TM.pressWork[1])),
                             bell(p, V(TM.pressSched[0]), V((TM.pressSched[0] + TM.pressSched[1]) / 2), V(TM.pressSched[1])),
                             bell(p, V(TM.pressAsset[0]), V((TM.pressAsset[0] + TM.pressAsset[1]) / 2), V(TM.pressAsset[1])));
      Rf.cur.style.opacity = rd ? 0 : f2(S(...TM.curIn) * (1 - S(TM.curOut[0] + 2, TM.curOut[1])));
      Rf.cur.style.transform = `translate(${f2(TO.x + cx)}px,${f2(TO.y + cy)}px) scale(${f2(1 - 0.12 * press)})`;
      Rf.cur.style.transformOrigin = "1px 1px";
    }

    return { html, update, TOTAL_VH: TOTAL };
  }

  window.TrustPiece = { make, FROM: Object.fromEntries(CARDS.map(c => [c.id, c.from])), TO: Object.fromEntries(CARDS.map(c => [c.id, c.to])), TIMING_VH: { TOTAL, ...TM } };
})();
