/* =========================================================================
   STAGE D (beats 12-15 = Figma slides 16, 17, 18, 19): the report -> trust + progressive disclosure -> APM expansion card -> numbers zoom.
   Loaded AFTER stage-c.js. It only APPENDS pieces + extras to the main SCENE and wraps SCENE.handOn; nothing of Stages A-C is rewritten.
   Pieces: report-piece.js (ReportPiece), trust-piece.js (TrustPiece), expansion-piece.js (ExpansionPiece); windows: TIMING.D (story.js, vh of scroll). Retime there.

   HAND-OVER IN. Stage C's overlay (#stageC) is visible up to 1106 and its LAST frame is the dark 680 x 420 window at (20, 326.35). Past 1106 the main scene must draw the same pixels:
   a frozen copy of Stage C's piece ("c-last", the same factory at its final local vh) does, and it fades out over the report's first moments, while the report piece (whose p = 0 is the
   empty shell of that window) grows into the report. Both pieces fade IN while the overlay still covers the stage (before 1106), so nothing pops.

   BEAT SHEET (vh)                                   anchors: report 1155 | trust 1262 | expansion 1372 | numbers 1458 (gaps 105, 107, 110, 86)
     12 report     entrance 1106-1142 (the window grows, the strip draws, the bars fill) | Rest 1142-1184 (32 words -> 39)
     13 trust      cue 1184-1192, cards pull apart 1192-1228, outlines release -1238 | Rest 1238-1286 (46 words -> 48) | tab cycle 1286-1336 (cursor, scroll-driven)
     14 expansion  the three cards converge into the card 1324-1352 (overlaps the cursor leaving) | Rest 1352-1392 (29 words -> 37): the hover loop runs on a FREE clock
     15 numbers    the card zooms 1.6x onto Potential outcomes 1392-1437 (45vh keeps the peak under 6x) | Rest 1437-1480 (35 words -> 41)
   MY DECISIONS (not in any Figma frame): the c-last hand-over, the report -> trust split timing, trust cards fading into the expansion shell, the loop's clock.
   ========================================================================= */
(function () {
  const TT = window.TIMING, D = TT && TT.D, SC = window.SCENE, SCm = window.StageC;
  const RP = window.ReportPiece, TP = window.TrustPiece, EP = window.ExpansionPiece, SP = window.StagecPiece;
  if (!D || !SC || !RP || !TP || !EP || !SP || !SCm || !SCm.T) return;

  const V = vh => vh / TT.MAX;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const FULL = { x: 0, y: 0, w: 720, h: 1024 }, EPS = 0.0005;
  const REDUCED = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  const add = p => { SC.pieces.push(p); return p; };
  const piece = (id, label, depth, html, update, keys, extra) => add({ id, label, kind: "media", depth, rects: { r: FULL }, html, update, keys, ...extra });
  const hold = (...ks) => [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }, ...ks];

  // ---- report. After the trust split starts, the regions the trust cards redraw are hidden (the cards sit on exactly those rects), the title block and the window fade.
  const REPORT = RP.make({ enter: [V(D.report[0]), V(D.report[1])] });
  const rv = {};     // cached element lookups per body
  const reportUpdate = (body, k, t) => {
    REPORT.update(body, k, t);
    if (!rv.body || rv.body !== body) {
      rv.body = body; rv.reg = {}; ["illustration", "title", "nav", "buttons", "kpi-bars", "tab-panel"].forEach(n => { rv.reg[n] = body.querySelector(`[data-region="${n}"]`); });
      rv.win = body.querySelector('[data-k="win"]'); rv.illo = body.querySelector('[data-k="illo"]');
    }
    const v = t * TT.MAX, split = v > D.trust[0];
    ["nav", "buttons", "kpi-bars", "tab-panel"].forEach(n => { if (rv.reg[n]) rv.reg[n].style.visibility = split ? "hidden" : ""; });
    if (rv.reg.illustration) rv.reg.illustration.style.opacity = split ? (1 - sm(D.trust[0], D.trust[0] + 10, v)).toFixed(3) : "";
    if (rv.reg.title) rv.reg.title.style.opacity = split ? (1 - sm(D.trust[0], D.trust[0] + 8, v)).toFixed(3) : "";
    const w = split ? (1 - sm(D.trust[0] + 4, D.trust[0] + 20, v)).toFixed(3) : "";
    if (rv.win) rv.win.style.opacity = w; if (rv.illo) rv.illo.style.opacity = w;
  };
  piece("report", "Report", 20, REPORT.html, reportUpdate,
    hold({ t: V(D.cLast[0]), o: 0 }, { t: V(D.cLast[1]), o: 1 }, { t: V(D.trust[0] + 22), o: 1 }, { t: V(D.trust[0] + 22) + EPS, o: 0 }));

  // ---- c-last: Stage C's piece frozen at its last local vh (the rest pose). Same factory, same data; external backdrops (the stage column is the main scene's own).
  const CL = SP.make({ vh: () => SCm.T.out[1], T: SCm.T });
  // ADDED AFTER the report: stacking follows array order, so the frozen last frame sits ON TOP of the report's empty shell and fades out over it (the report would otherwise paint its opaque window over the form).
  // It fades in under Stage C's overlay (opaque until 1106.05), out while the report grows
  piece("c-last", "Second iteration (last frame)", 22, CL.html, CL.update,
    hold({ t: V(D.cLast[0]), o: 0 }, { t: V(D.cLast[1]), o: 1 }, { t: V(D.fade[0]), o: 1 }, { t: V(D.fade[1]), o: 0, e: "inOutSine" }));

  // ---- trust + disclosure (TOTAL_VH = 156: its piece window is [trust0, trust0 + 156])
  const TRUST = TP.make({ t0: V(D.trust[0]), t1: V(D.trust[1]) });
  piece("trust", "Trust + disclosure", 21, TRUST.html, TRUST.update,
    hold({ t: V(D.trust[0]) - EPS, o: 0 }, { t: V(D.trust[0]), o: 1 }, { t: V(D.exp[0]), o: 1 }, { t: V(D.exp[0] + 6.5), o: 0, e: "inOutSine" }));

  // ---- expansion card. Its hover loop is the second (and last) free-running clock on the page: the same clock index.html runs for the hand card (SCENE.handClock),
  // started when the card has landed and reset when it leaves; off under reduced motion (index.html), where the card holds the hover-01 pose.
  const EXP = EP.make({ clock: () => (SC.handClock ? SC.handClock() : 0), enter: t => (t - V(D.exp[0])) / (V(D.exp[1]) - V(D.exp[0])),
                        zoom: t => (t - V(D.zoom[0])) / (V(D.zoom[1]) - V(D.zoom[0])), reduced: REDUCED });
  piece("expansion", "APM expansion card", 21, EXP.html, EXP.update,
    hold({ t: V(D.exp[0]) - EPS, o: 0 }, { t: V(D.exp[0]), o: 1 }),
    { noCull: true });   // the engine skips updates for invisible pieces; this card's big stage numerals rasterise 482px differently if it is skipped while hidden (found by screenshot diff), so it keeps updating
  const prevOn = SC.handOn;
  const zLen = D.zoom[1] - D.zoom[0];
  SC.handOn = t => (prevOn ? prevOn(t) : false) || (t >= V(D.exp[1]) && t < V(D.zoom[0] + zLen * 0.3));       // the loop folds away over the first 30% of the zoom (expansion-piece.js: fold)

  SC.ariaLabel += " After the second iteration, a report page, the dark roadmap, is built: an illustration strip, a capability bars panel and a tabbed section. It pulls apart into a maturity score card, the capability bars and a navigation panel with tabs. These converge into an APM expansion card where the stages open one after the other, and the card then zooms onto its potential outcomes.";

  // activity inside update() hooks, declared so the pacing audit sees it
  SC.extras = (SC.extras || []).concat([
    { id: "report entrance (window, strip, bars)", keys: [{ t: V(D.report[0]), o: 0 }, { t: V(D.report[1]), o: 1 }] },
    { id: "trust: cards pull apart", keys: [{ t: V(D.trust[0] + 12), o: 0 }, { t: V(D.trust[0] + 58), o: 1 }] },
    { id: "trust: tab cycle (cursor)", keys: [{ t: V(D.trust[0] + 106), o: 0 }, { t: V(D.trust[0] + 156), o: 1 }] },
    { id: "expansion: cards converge", keys: [{ t: V(D.exp[0]), o: 0 }, { t: V(D.exp[1]), o: 1 }] },
    { id: "expansion: hover loop (free clock)", keys: [{ t: V(D.exp[1]), o: 0 }, { t: V(D.exp[1]) + EPS, o: 1 }, { t: V(D.zoom[0]), o: 1 }] },
    { id: "expansion: numbers zoom", keys: [{ t: V(D.zoom[0]), o: 0 }, { t: V(D.zoom[1]), o: 1 }] }
  ]);
  window.StageD = { REPORT, TRUST, EXP, CL };
})();
