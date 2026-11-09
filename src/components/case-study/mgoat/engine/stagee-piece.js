/* =========================================================================
   STAGE E PIECE: the "Next steps" card (Figma slide 20a 239:6833 > stage 239:6834 > card 239:6835) and its zoom into "How to implement" (slide 20b 239:6889 > 239:6890 > 239:6891),
   rebuilt as LIVE HTML (all sizes in Figma px, so the camera zoom is a real zoom, not a raster upscale). ONE engine piece covering the whole stage (720 x 1024).
   update(body, k, t) is a PURE FUNCTION of scroll progress t: no timers, no clock, no CSS transitions, no state kept between calls. Scrolling backward plays it in reverse.
   Contract: assembly-engine.js piece.html / piece.update (m-goat change 3).

   API    StageePiece.make({ vh, T }) -> { html, update(body, k, t) }
            vh(t)  -> LOCAL vh of scroll (0 = the first vh after Stage D's final rest). Use  t => t * TIMING.MAX - startVh  when wired.
            T      -> the windows (defaults to STAGEE.TIMING)
          StageePiece.state(v, T) -> the numeric pose at local vh v (pure; used by the reports and tests)

   WHAT MOVES (everything below is a pure function of the eased progress of its window; see stagee-data.js for the worksheet)
     arrive  card y: +1024 -> 0              one conveyor pan; D's card leaves in lockstep (keys on D's piece, STAGEE.handover.d)
     zoom    card x, y, s: 20a pose -> 20b pose   interpolated LINEARLY in one eased progress, which is exactly a scale about the fixed point (191.5, 1194.4)
             3 blocks dim to 25%             same window, same easing (lockstep: they change for the same reason). Built as a card-coloured SCRIM (#393939) over the three blocks whose
                                             opacity goes 0 -> 0.75. Over the uniform card that is pixel-identical to group opacity 1 -> 0.25 (0.25 p + 0.75 card), but the text stays in the
                                             card's own layer. Real group opacity (a render surface per group, under the engine's will-change:transform chain) keeps the raster scale it had
                                             at 1.0: scrubbing in leaves the dimmed text soft. Measured with the page's own engine: 2.6x less edge energy than a fresh load at the same pose.
             per-block settle (<= 1.6px)     Figma re-lays the card out at 1.4x (integer text-box heights); the measured deltas ease in with the zoom so the end pose is Figma's
             tag pills (<= 0.9px wide)       likewise (Figma rounds each label to a whole px at each scale): the pill background is scaled in x, label and icon do not move
     hl      highlight rectangle opacity 0 -> 1 and scale 0.98 -> 1 (about its centre)   the one supporter, starts after the zoom's first third

   GEOMETRY (use_figma, read-only, stage px; card-local = 20a scale). Card 562 x 666.331 at (79, 179.305) in 20a; 786.8 x 930.663 at (34, -226.734) in 20b (x1.4).
     header 239:6836 (17.563, 17.562) 251.7 x 80.5: icon 23.417 + 5 lines of 16.099 | enables 239:6843 | modules 239:6846 | implement 239:6851 | highlight 239:6888 (5.5, 366) 470 x 297
   COLOUR: stage #262626, card #393939, text #f4f4f4 (header text #fff), blue tag #0043ce / #d0e2ff, green tag #0e6027 / #a7f0ba, highlight #0f62ff (10% fill, 2px inside stroke, r 8).
   TEXT: IBM Plex Sans (already loaded by the page); headings 600 10.2448px / ls .1171px; body 400 11.7083px / 17.5625; tag labels 400 8.78125px / ls .2342px (Figma's node value; the .32px
   in get_design_context's code is the unscaled token).
   The copy strings live in stagee-data.js (COPY.card), verbatim from the Figma text nodes (U+2028 / U+000A = a forced line break = <br>).
   Hidden Figma nodes are not drawn (tooltip instances 239:6854 / 239:6910, second-role tags 239:6870 / 239:6926).
   ========================================================================= */
(function () {
  const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  const ASSET = n => window.MG_BASE + "stagee/" + n;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const win = (v, w) => clamp((v - w[0]) / (w[1] - w[0]), 0, 1);
  const sine = u => .5 - .5 * Math.cos(Math.PI * u);          // inOutSine: peak slope 1.57 (cubic 3.0). Starts and ends at zero velocity.
  const smooth = u => u * u * (3 - 2 * u);                      // smoothstep: peak slope 1.5
  const f3 = v => String(Math.round(v * 1000) / 1000);
  const f4 = v => String(Math.round(v * 10000) / 10000);
  const f6 = v => String(Math.round(v * 1e6) / 1e6);
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const br = s => esc(s).replace(/[\u2028\n]/g, "<br>");

  /* ---- the pure pose. v = local vh. Returns the numbers update() writes. */
  function state(v, T) {
    const D = window.STAGEE, G = D.GEO;
    T = T || D.TIMING;
    const a = sine(win(v, T.arrive)), z = sine(win(v, T.zoom)), h = smooth(win(v, T.hl));
    return {
      a, z, h,
      x: lerp(G.A.x, G.B.x, z), y: lerp(G.A.y, G.B.y, z) + (1 - a) * G.PAN, s: lerp(1, G.B.s, z),
      dim: lerp(1, G.dim, z), veil: (1 - G.dim) * z,                 // group-equivalent opacity of the 3 blocks, and the scrim opacity that gives it
      shellK: lerp(1, G.cardH_B / G.card.h, z),                       // the card is 1.572 card px shorter in 20b's own layout: a scaleY of the shell (transform, never a height write)
      hlO: h, hlS: lerp(G.hl.pre, 1, h)
    };
  }

  function make({ vh, T }) {
    const D = window.STAGEE, G = D.GEO, C = D.COPY.card;
    T = T || D.TIMING;

    /* ---- the markup. Card-local px, copied from the Figma node tree (absolute positions, so a Chromium-vs-Figma text-height rounding can never move a block). */
    const X = 17.562;                                                    // left edge of every content block
    // BASELINE. Figma puts the first baseline at  (lineHeight - 1.3 fs) / 2 + 1.025 fs  from the box top (IBM Plex Sans ascent 1025, descent 275 per 1000). Chromium floors the half-leading and
    // rounds the ascent to whole px, so it lands 0.15 to 1.2 px higher. BL is (Figma - Chromium) per text class; adding it to `top` makes both engines round the same baseline the same way.
    const BL = { h: 1.16, h2: 0.43, step: 0.44, p: 0.17 };
    const txt = (cls, st, s) => `<div class="se-a ${cls}" style="${st}">${s}</div>`;
    // tags: Figma's widths (239:6849, 6859, 6860, 6864, 6865, 6869) are the 20a widths; G.tagW[label] is the 20b / 20a ratio. The pill background is its own child, so only IT is scaled in x.
    const W = { "Manage": 62.271, "Reliability engineer": 109.271, "System administrator": 118.271, "Technician": 74.271 };
    const tag = (label, kind, left) =>
      `<div class="se-tag ${kind}" style="left:${left}px;width:${W[label]}px"><i class="se-pill" data-pill="${esc(label)}"></i>` +
      `<img src="${ASSET(kind === "b" ? "checkmark-outline.svg" : "user.svg")}" alt="" width="11.708" height="11.708"><span>${esc(label)}</span></div>`;
    const row = (st, top, tags) => `<div class="se-row" data-st="${st}" style="left:${X}px;top:${top}px">${tags}</div>`;
    const roleRow = roles => roles.map((r, i) => tag(r, "g", i ? 115.125 : 0)).join("");               // the second tag starts 5.854 after the first one (109.271 + 5.854)
    const [s1, s2, s3] = C.steps;

    const html =
      `<div class="se-root" data-se><div class="se-card" data-card>` +
        `<div class="se-shell" data-shell></div>` +
        // ---- the three blocks that dim: the header (239:6836), What this enables (239:6843), Required Maximo modules (239:6846)
        `<img class="se-ico" src="${ASSET("data-scientist.svg")}" alt="" width="23.417" height="23.417" style="left:17.563px;top:17.562px">` +
        txt("se-step", `left:60.005px;top:${f3(17.562 + BL.step)}px;width:209.286px`, `<span class="sb">${esc(C.stepHead)}</span>${br(C.stepBody)}`) +
        txt("se-h", `left:${X}px;top:${f3(121.474 + BL.h)}px;line-height:14.6354px`, esc(C.enablesH)) +
        txt("se-p", `left:${X}px;top:${f3(148.183 + BL.p)}px;width:310.271px`, esc(C.enables)) +
        `<div class="se-a se-h" data-st="h2" style="left:${X}px;top:${f3(224.599 + BL.h2)}px;line-height:13.1719px">${esc(C.modulesH)}</div>` +
        row("rowM", 250.308, tag(C.module, "b", 0)) +
        `<div class="se-a se-p" data-st="list" style="left:${X}px;top:${f3(285.433 + BL.p)}px;width:427.354px">${br(C.modulesList)}</div>` +
        // ---- the scrim: dims everything above it and nothing below it (the highlight starts at 366, the implement block at 379.8). Inset 6px so it never touches the rounded corners.
        `<div class="se-veil" data-veil style="left:6px;top:6px;width:${G.card.w - 12}px;height:${G.veilH - 6}px"></div>` +
        // ---- How to implement (239:6851): stays at full opacity
        `<div class="se-a se-h" data-st="h3" style="left:${X}px;top:${f3(379.849 + BL.h)}px;line-height:14.6354px">${esc(C.implH)}</div>` +
        `<div class="se-a se-p" data-st="it1" style="left:${X}px;top:${f3(406.558 + BL.p)}px;width:427.354px">${br(s1.text)}</div>` + row("row1", 436.267, roleRow(s1.roles)) +
        `<div class="se-a se-p" data-st="it2" style="left:${X}px;top:${f3(483.101 + BL.p)}px;width:427.354px">${br(s2.text)}</div>` + row("row2", 530.81, roleRow(s2.roles)) +
        `<div class="se-a se-p" data-st="it3" style="left:${X}px;top:${f3(577.642 + BL.p)}px;width:427.354px">${br(s3.text)}</div>` + row("row3", 625.351, roleRow(s3.roles)) +
        // ---- the highlight (239:6888 / 239:6927): the same card-local rectangle in both slides; positioned by update() (a transform), see the CSS
        `<div class="se-hl" data-hl style="width:${G.hl.w}px;height:${G.hl.h}px"></div>` +
      `</div></div>`;

    // refs are kept ON the body element (the page mounts the same scene twice: the under-stage and the main stage), never in the closure
    const bind = body => {
      const q = s => body.querySelector(s);
      return { card: q("[data-card]"), shell: q("[data-shell]"), veil: q("[data-veil]"), hl: q("[data-hl]"),
               st: Object.keys(G.settle).map(k => [q(`[data-st="${k}"]`), G.settle[k]]),
               pills: [...body.querySelectorAll("[data-pill]")].map(el => [el, G.tagW[el.dataset.pill] || 1]) };      // [element, width in 20b / width in 20a]
    };

    function update(body, k, t) {
      const R = body.__se || (body.__se = bind(body));
      const S = state(vh(t), T);
      R.card.style.transform = `translate(${f3(S.x)}px,${f3(S.y)}px) scale(${f4(S.s)})`;
      R.shell.style.transform = `scaleY(${f6(S.shellK)})`;
      R.veil.style.opacity = f3(S.veil);                                                                             // the 3 blocks dim to 25%, in lockstep with the zoom
      R.st.forEach(p => { p[0].style.transform = `translateY(${f3(p[1] * S.z)}px)`; });                              // Figma's per-block re-layout at 1.4x, eased with the zoom
      R.pills.forEach(p => { p[0].style.transform = `scaleX(${f4(lerp(1, p[1], S.z))})`; });                          // Figma's per-tag re-layout at 1.4x, eased with the zoom
      R.hl.style.opacity = f3(S.hlO);
      R.hl.style.transform = `translate(${f3(G.hl.x + G.hl.w / 2 * (1 - S.hlS))}px,${f3(G.hl.y + G.hl.h / 2 * (1 - S.hlS))}px) scale(${f4(S.hlS)})`;   // scale about the rect's centre; a transform, so no whole-pixel snapping of the 5.5px offset
    }
    return { html, update };
  }

  window.StageePiece = { make, state };
})();
