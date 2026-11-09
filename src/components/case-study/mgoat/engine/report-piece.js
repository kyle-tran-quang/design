/* =========================================================================
   REPORT PIECE: Figma 208:8301 "16 Report 3 acts" > stage 208:8302 > window 208:8303 (680 x 576 at stage (20, 285)), rebuilt as LIVE HTML / SVG so the next beat can pull it apart.
   update(body, k, t) is a PURE FUNCTION of scroll progress t (scrolling backward plays in reverse).

   WHAT IT DRAWS (all geometry / copy read from Figma nodes, window-local px, + (20, 285) = stage):
     illustration strip  208:8304  (0, 0) 680 x 109.36, fill #333333. Exported SVG of the node (paths copied verbatim), burst curves are the two transparent PNGs
                         208:8319 / 208:8318 (assets/report/burst-b.png, burst-a.png). The half-disc 208:8306 has a shader fill: stops #BB99FF -> #9EBBFF, drawn as a linear gradient.
     title block         logo 208:8352 (33.2), heading 208:8353 (IBM Plex Serif Light 24.88), meta 208:8355 / 8356 / 8357
     nav                 208:8358  five vertical tab items (85 x 33.17 each), first selected (indicator #4589ff, label #f4f4f4 SemiBold), others #c6c6c6 / indicator #525252
     buttons             208:8360 "Talk to a seller" #0f62fe, 208:8361 "Download" (0.52 white outline + chevron)
     kpi-bars            208:8364 > 208:8365: "Where you are today", paragraph, 2 x 4 meters 208:8372..8381 (bar 190.5 x 4, track #262626, fills #24a148 / #f1c21b / #33b1ff)
     tab-panel           208:8382: "Established capabilities", paragraph, bordered panel 208:8386 with 3 tabs + body copy, clipped by the window at y = 576 (as in Figma)
   The window clips its content (clipsContent = true in Figma), so the panel text is cut at the window's bottom edge exactly like the design.

   REGIONS (data-region): window, illustration, title, nav, buttons, kpi-bars, tab-panel. Each is an absolutely positioned wrapper at its stage rect (see ReportPiece.regions).
   Children are placed in region-local coordinates, so a sibling beat can move / clone / re-parent a region without touching its insides.

   ENTRANCE (UI morph, no blueprint), p = local progress 0..1 across enter = [t0, t1] (fractions of the scene t):
     p 0 pose = the previous beat's empty shell: dark window 680 x 420 at (20, 326.4) (Figma 208:7718, #161616) + its grey sidebar 231.2 x 419.6 (#333333, 208:7720).
     0.00-0.36  the window grows to 680 x 576 (top edge up 41, bottom edge down 115) and the grey sidebar sheet stretches into the illustration strip (231 x 420 -> 680 x 109)  [the HERO]
     0.28-0.60  illustration draws: half-disc, lines left -> right, pills pop in order, node, blue rings grow
     0.34-0.72  left column staggers in: logo, heading, meta, nav items one by one, buttons
     0.44-0.93  right column: heading, paragraph, then the 8 meters row by row; each bar fills left -> right
     0.74-1.00  "Established capabilities", the panel frame, tabs, body copy
   Reduced motion: make({ reduced: true }) renders the finished report (p = 1).
   ========================================================================= */
(function () {
  const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  const ASSET = n => window.MG_BASE + "report/" + n;

  // IBM Plex Sans and Plex Serif Light are self-hosted by the app (src/index.css), so there is nothing to request here.

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const f2 = v => (Math.round(v * 100) / 100).toFixed(2);
  const seg = (a, b, p) => clamp((p - a) / (b - a), 0, 1);
  const sm = (a, b, p) => { const u = seg(a, b, p); return u * u * (3 - 2 * u); };
  const outC = u => 1 - Math.pow(1 - u, 3);
  const inOutS = u => 0.5 - 0.5 * Math.cos(Math.PI * u);
  const inOutC = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const outBack = u => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };

  // ---- the window, in stage coordinates
  const OX = 20, OY = 285, WW = 680, WH = 576;
  const PREV = { y: 326.4, h: 420, sideW: 231.2, sideH: 419.6 };           // previous beat's shell (Figma 208:7718 / 208:7720)
  const STRIP_H = 109.36;

  const REGIONS = {
    "window":       { x: OX,          y: OY,           w: WW,    h: WH },
    "illustration": { x: OX,          y: OY,           w: WW,    h: STRIP_H },
    "title":        { x: OX + 16.6,   y: OY + 142.5,   w: 210.9, h: 177.5 },
    "nav":          { x: OX + 16.6,   y: OY + 337.1,   w: 85,    h: 165.9 },
    "buttons":      { x: OX + 16.6,   y: OY + 520.1,   w: 174.2, h: 25.5 },
    "kpi-bars":     { x: OX + 265.4,  y: OY + 146.7,   w: 398,   h: 256.7 },
    "tab-panel":    { x: OX + 265.4,  y: OY + 436.5,   w: 398,   h: WH - 436.5 }      // visible part (the panel continues below the window in Figma)
  };

  // ---- text helpers
  const S8 = "font-size:8.2927px;line-height:11.4024px;", S7 = "font-size:7.2561px;line-height:9.3293px;letter-spacing:.0829px;", S14 = "font-size:14.5122px;line-height:18.6585px;";
  const T = (k, x, y, w, css, inner) => `<div data-k="${k}" class="rpt" style="left:${x}px;top:${y}px;width:${w}px;${css}">${inner}</div>`;
  const R = (key, rg, inner) => `<div data-region="${key}" style="position:absolute;left:${rg.x}px;top:${rg.y}px;width:${rg.w}px;height:${rg.h}px;overflow:visible">${inner}</div>`;

  // ---- logo 208:8352 (Figma SVG export, ids prefixed)
  const LOGO = `<svg data-k="logo" viewBox="0 0 34 34" width="33.17" height="33.17" style="position:absolute;left:0;top:0" fill="none"><mask id="rp-m0" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="1" y="2" width="32" height="30"><path d="M32.0036 16.0836L28.0335 8.93843C29.1561 9.27739 30.4954 9.67647 30.4954 9.67647L31.0976 7.69245L25.1455 5.88672L23.3398 11.8388L25.3238 12.441L26.1303 9.78117L29.9045 16.575L23.2455 27.9898H10.3649V30.063H23.8405C24.0217 30.0631 24.1997 30.0156 24.3569 29.9254C24.514 29.8352 24.6448 29.7054 24.7361 29.5489L31.9922 17.1098C32.0829 16.9546 32.1316 16.7784 32.1335 16.5986C32.1353 16.4188 32.0902 16.2417 32.0026 16.0846L32.0036 16.0836Z" fill="#fff"/><path d="M9.32922 31.2988V26.1159H18.6585V31.2988H9.32922Z" fill="url(#rp-l0)"/><path d="M9.32928 3.11145C9.14809 3.11139 8.97004 3.15884 8.81289 3.24905C8.65575 3.33926 8.525 3.46909 8.43367 3.62559L1.17758 16.0646C1.08682 16.2198 1.03813 16.396 1.03631 16.5758C1.03449 16.7556 1.07961 16.9328 1.16721 17.0898L5.13733 24.235C4.01471 23.896 2.67544 23.4969 2.67544 23.4969L2.07319 25.481L8.02526 27.2867L9.83099 21.3346L7.84697 20.7324L7.0405 23.3912L3.2663 16.5974L9.92532 5.18255H22.8059V3.10938H9.33032L9.32928 3.11145Z" fill="#fff"/><path d="M23.8414 2.41016V7.59308L14.5122 7.59308V2.41016L23.8414 2.41016Z" fill="url(#rp-l1)"/></mask><g mask="url(#rp-m0)"><rect width="33.1707" height="33.1707" fill="url(#rp-l2)"/></g><path d="M16.5854 21.7682C13.7275 21.7682 11.4025 19.4431 11.4025 16.5853C11.4025 13.7274 13.7275 11.4023 16.5854 11.4023C19.4433 11.4023 21.7683 13.7274 21.7683 16.5853C21.7683 19.4431 19.4433 21.7682 16.5854 21.7682ZM16.5854 13.4755C14.8709 13.4755 13.4756 14.8708 13.4756 16.5853C13.4756 18.2998 14.8709 19.695 16.5854 19.695C18.2999 19.695 19.6951 18.2998 19.6951 16.5853C19.6951 14.8708 18.2999 13.4755 16.5854 13.4755Z" fill="#001D6C"/><defs><linearGradient id="rp-l0" x1="18.6585" y1="28.7074" x2="9.32922" y2="28.7074" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="0.9"/></linearGradient><linearGradient id="rp-l1" x1="14.5122" y1="5.00162" x2="23.8414" y2="5.00162" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="0.9"/></linearGradient><linearGradient id="rp-l2" x1="0" y1="33.1707" x2="33.1707" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0.1" stop-color="#A56EFF"/><stop offset="0.9" stop-color="#0043CE"/></linearGradient></defs></svg>`;

  // ---- illustration strip 208:8304. Paths are verbatim from the Figma export (a few are written start -> end in the direction the flow runs so that the draw-in goes left to right).
  const ST = (d, w, extra) => `<path ${extra || ""} d="${d}" stroke="#6F6F6F" stroke-width="${w}" stroke-miterlimit="10" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>`;
  const ARC = "M45.0916 20.7598C26.1345 20.7598 10.366 36.0162 10.366 54.7886C10.366 73.5609 26.1345 89.1744 45.0916 89.1744";
  const PILLS = [
    ["M67.9048 72.0968C64.7559 72.0968 62.2021 69.5431 62.2021 66.3941C62.2021 63.2451 64.7559 60.6914 67.9048 60.6914H79.3102C82.4592 60.6914 85.0129 63.2451 85.0129 66.3941C85.0129 69.5431 82.4592 72.0968 79.3102 72.0968H67.9048Z", "#FF7EB6", 73.6, 66.4],
    ["M90.7159 26.4777C87.5669 26.4777 85.0132 23.9239 85.0132 20.775C85.0132 17.626 87.5669 15.0723 90.7159 15.0723H102.121C105.27 15.0723 107.824 17.626 107.824 20.775C107.824 23.9239 105.27 26.4777 102.121 26.4777H90.7159Z", "#E8DAFF", 96.4, 20.8],
    ["M90.7158 117.72C87.5668 117.72 85.0131 115.166 85.0131 112.017C85.0131 108.868 87.5668 106.314 90.7158 106.314H102.121C105.27 106.314 107.824 108.868 107.824 112.017C107.824 115.166 105.27 117.72 102.121 117.72H90.7158Z", "#4589FF", 96.4, 112],
    ["M119.229 49.2882C116.08 49.2882 113.527 46.7345 113.527 43.5855C113.527 40.4366 116.08 37.8828 119.229 37.8828H130.635C133.784 37.8828 136.338 40.4366 136.338 43.5855C136.338 46.7345 133.784 49.2882 130.635 49.2882H119.229Z", "#A6C8FF", 125, 43.6],
    ["M130.635 26.4777C127.486 26.4777 124.932 23.9239 124.932 20.775C124.932 17.626 127.486 15.0723 130.635 15.0723H142.04C145.189 15.0723 147.743 17.626 147.743 20.775C147.743 23.9239 145.189 26.4777 142.04 26.4777H130.635Z", "#4589FF", 136.3, 20.8],
    ["M147.743 72.0968C144.594 72.0968 142.04 69.5431 142.04 66.3941C142.04 63.2451 144.594 60.6914 147.743 60.6914H159.148C162.297 60.6914 164.851 63.2451 164.851 66.3941C164.851 69.5431 162.297 72.0968 159.148 72.0968H147.743Z", "#BE95FF", 153.4, 66.4]
  ];
  const RINGS = [["M615.214 1.03516C645.126 1.03516 669.375 25.2846 669.375 55.1967C669.375 85.1089 645.126 109.358 615.214 109.358", "#0F62FE"],
                 ["M615.214 16.5098C636.58 16.5098 653.9 33.8306 653.9 55.1966C653.9 76.5626 636.58 93.8835 615.214 93.8835", "#4589FF"],
                 ["M615.214 31.9844C628.033 31.9844 638.426 42.3766 638.426 55.1965C638.426 68.0163 628.033 78.4086 615.214 78.4086", "#A6C8FF"]];
  const STRIP = `<svg viewBox="0 0 680 109.36" width="680" height="109.36" style="position:absolute;left:0;top:0;display:block;overflow:hidden" fill="none" aria-hidden="true">` +
    `<defs><linearGradient id="rp-arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BB99FF"/><stop offset="1" stop-color="#9EBBFF"/></linearGradient></defs>` +
    `<g data-k="i-arc" ><path d="${ARC}" fill="url(#rp-arc)"/><path d="${ARC}" stroke="#6F6F6F" stroke-width=".425848"/></g>` +
    ST("M45.094 20.7754H164.851", .356419, 'data-k="i-l0"') + ST("M44.3812 43.5859H164.851", .356419, 'data-k="i-l1"') + ST("M44.3812 66.3965H164.851", .356419, 'data-k="i-l2"') + ST("M44.5731 89.1426H176.219", .356419, 'data-k="i-l3"') +
    `<image data-k="i-bb" href="${ASSET("burst-a.png")}" x="164.85" y="54.8125" width="102.649" height="34.5726" preserveAspectRatio="none"/>` +
    `<image data-k="i-ba" href="${ASSET("burst-b.png")}" x="159.148" y="-2.21484" width="108.351" height="57.3834" preserveAspectRatio="none"/>` +
    ST("M164.85 20.7734H178.394C222.959 20.7734 222.934 54.9896 267.499 54.9896", .356419, 'data-k="i-c0"') + ST("M164.85 43.584H178.394C222.959 43.584 222.934 54.9894 267.499 54.9894", .356419, 'data-k="i-c1"') +
    ST("M164.85 66.3956H178.394C222.959 66.3956 222.934 54.9902 267.499 54.9902", .356419, 'data-k="i-c2"') + ST("M164.138 112.017H178.395C222.959 112.017 222.934 54.9902 267.499 54.9902", .356419, 'data-k="i-c3"') +
    ST("M267.439 54.9355H615.214", .356419, 'data-k="i-main"') +
    `<g data-k="i-node"><path d="M278.064 65.8464C283.932 65.8464 288.689 60.9734 288.689 54.9623C288.689 48.9511 283.932 44.0781 278.064 44.0781C272.196 44.0781 267.439 48.9511 267.439 54.9623C267.439 60.9734 272.196 65.8464 278.064 65.8464Z" fill="#BE95FF"/>` +
      `<path d="M278.064 60.6634C281.069 60.6634 283.506 58.2269 283.506 55.2214C283.506 52.2158 281.069 49.7793 278.064 49.7793C275.058 49.7793 272.622 52.2158 272.622 55.2214C272.622 58.2269 275.058 60.6634 278.064 60.6634Z" fill="#E8DAFF"/></g>` +
    `<g data-k="i-inner"><path d="M45.0944 43.584C38.8535 43.584 33.689 48.7485 33.689 54.9894C33.689 61.2303 38.8535 66.3948 45.0944 66.3948" fill="#fff"/><path d="M45.0944 43.584C38.8535 43.584 33.689 48.7485 33.689 54.9894C33.689 61.2303 38.8535 66.3948 45.0944 66.3948" stroke="#6F6F6F" stroke-width=".356419" stroke-miterlimit="10"/>` +
      `<path d="M45.0945 60.6945C48.2441 60.6945 50.7972 58.1413 50.7972 54.9918C50.7972 51.8422 48.2441 49.2891 45.0945 49.2891C41.945 49.2891 39.3918 51.8422 39.3918 54.9918C39.3918 58.1413 41.945 60.6945 45.0945 60.6945Z" fill="#E0E0E0"/></g>` +
    ST("M45.0945 60.6934V112.018C45.0945 118.248 50.2697 123.423 56.4999 123.423L295.983 123.354", .356419, 'data-k="i-b1"') +
    ST("M45.0914 49.2738V-2.03953C45.0914 -8.2684 56.3389 -13.4425 69.8793 -13.4425H590.425C598.688 -13.783 615.213 -11.9792 615.213 -2.03953C615.213 6.75592 615.213 71.5231 615.213 109.895C615.213 117.337 609.18 123.349 601.738 123.349H590.278", .356419, 'data-k="i-loop"') +
    `<g data-k="i-dots"><path d="M45.0942 42.9619C45.4387 42.9619 45.7183 43.2415 45.7183 43.5859C45.7182 43.9304 45.4387 44.2099 45.0942 44.21C44.7498 44.21 44.4702 43.9304 44.4702 43.5859C44.4702 43.2415 44.7498 42.9619 45.0942 42.9619Z" fill="#6F6F6F" stroke="#6F6F6F" stroke-width=".178209"/><path d="M45.0942 65.7725C45.4387 65.7725 45.7183 66.052 45.7183 66.3965C45.7182 66.7409 45.4387 67.0205 45.0942 67.0205C44.7498 67.0205 44.4702 66.7409 44.4702 66.3965C44.4702 66.052 44.7498 65.7725 45.0942 65.7725Z" fill="#6F6F6F" stroke="#6F6F6F" stroke-width=".178209"/></g>` +
    PILLS.map((p, i) => `<path data-k="i-p${i}" d="${p[0]}" fill="${p[1]}"/>`).join("") +
    RINGS.map((r, i) => `<g data-k="i-r${i}"><path d="${r[0]}" fill="${r[1]}" stroke="#fff" stroke-width=".241793" stroke-miterlimit="10"/></g>`).join("") +
    `</svg>`;
  // the shader half-disc sits under the white inner disc; the outer loop path draws from the disc round the whole strip

  // ---- title block (region-local; origin = window (16.6, 142.5))
  const TITLE = LOGO +
    T("t-h", 0, 50.3, 210.9, "font:300 24.878px/27.366px 'IBM Plex Serif',Georgia,serif;", "Your Maximo<br>growth roadmap") +
    T("t-beta", 0, 121.4, 210.9, S7 + "opacity:.5;", "beta v3") +
    T("t-contact", 0, 137.5, 210.9, S7 + "line-height:11.61px;letter-spacing:.0363px;", "Contact name: <b>Michael Scott</b><br>Industry/Organization: <b>Utilities &amp; Energy</b>") +
    T("t-based", 0, 165.6, 210.9, S7 + "opacity:.5;", "Based on assessment results on 9/12/26");

  // ---- nav (origin (16.6, 337.1)); every item 85 x 33.17
  const NAV = [["Where you are<br>today", 2], ["Opportunities to<br>increase ROI", 2], ["Your action plan", 1], ["Additional<br>resources", 2], ["Help us improve", 1]];
  const NAVH = 33.17;
  const NAV_HTML = NAV.map((n, i) => `<div data-k="n${i}" style="position:absolute;left:0;top:${f2(i * NAVH)}px;width:85px;height:${NAVH}px;background:#161616">` +
      `<div data-k="n${i}-i" style="position:absolute;left:0;top:0;width:1.55px;height:100%;background:${i === 0 ? "#4589ff" : "#525252"}"></div>` +
      `<div class="rpt" style="left:8.3px;top:${n[1] === 2 ? 7.1 : 11.6}px;width:68.4px;${S7}color:${i === 0 ? "#f4f4f4" : "#c6c6c6"};font-weight:${i === 0 ? 600 : 400}">${n[0]}</div></div>`).join("");

  // ---- buttons (origin (16.6, 520.1))
  const BTNS = `<div data-k="b0" style="position:absolute;left:0;top:0;width:90.5px;height:25.5px;background:#0f62fe"><div class="rpt" style="left:8.3px;top:7.77px;${S7}color:#fff">Talk to a seller</div></div>` +
    `<div data-k="b1" style="position:absolute;left:98.7px;top:0;width:75.5px;height:25.5px;box-sizing:border-box;border:.52px solid #fff"><div class="rpt" style="left:7.8px;top:7.25px;${S7}color:#fff">Download</div>` +
    `<svg width="8.3" height="8.3" viewBox="0 0 16 16" style="position:absolute;left:58.2px;top:8.5px" fill="#fff"><path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z"/></svg></div>`;

  // ---- kpi bars (origin (265.4, 146.7)); the 8 meters are Figma 208:8372..8381
  const GY = 95.4, COLX = [0, 207.3], ROWY = [0, 36.9, 84.8, 121.7];
  const G = "#24a148", Y = "#f1c21b", B = "#33b1ff";
  const METERS = [
    [0, 0, "Asset data", "Established", 138.4, G], [0, 1, "Work management", "Established", 138.4, G],
    [1, 0, "Inspections and<br>condition capture", "Emerging", 25.9, Y], [1, 1, "Supply chain and<br>inventory", "Growing", 103.7, B],
    [2, 0, "Scheduling", "Growing", 116.6, B], [2, 1, "Reliability practices", "Emerging", 4.7, Y],
    [3, 0, "Condition monitoring<br>and prediction", "Emerging", 30.6, Y], [3, 1, "Assignment<br>and dispatch", "Growing", 82.9, B]
  ];
  const KPI = T("k-h", 0, 0, 398, S14, "Where you are today") +
    T("k-p", 0, 43.9, 200, S8, "Your strongest capabilities are creating value<br>today, while several areas offer opportunities<br>for growth.") +
    METERS.map((m, i) => { const two = m[2].includes("<br>"), x = COLX[m[1]], y = GY + ROWY[m[0]], by = two ? 31.3 : 20.3;
      return `<div data-k="m${i}" style="position:absolute;left:${x}px;top:${f2(y)}px;width:190.7px;height:${f2(by + 4.1)}px">` +
        `<div data-k="m${i}-t" class="rpt" style="left:0;top:0;width:190.7px;${S8}font-weight:600">${m[2]}</div>` +
        `<div data-k="m${i}-v" class="rpt" style="left:0;top:${two ? 11 : 0}px;width:190.7px;${S8}text-align:right;color:#c6c6c6">${m[3]}</div>` +
        `<div data-k="m${i}-bg" style="position:absolute;left:0;top:${by}px;width:190.5px;height:4px;background:#262626"></div>` +
        `<div data-k="m${i}-f" style="position:absolute;left:0;top:${by}px;width:${m[4]}px;height:4.1px;background:${m[5]}"></div></div>`; }).join("");

  // ---- tab panel (origin (265.4, 436.5)); panel frame at y 66.9 (Figma 208:8386, 398 x 255.4, continues below the window)
  const TABS = [[0.5, 53.6, "Asset data", "#262626", "#f4f4f4", 600], [54.1, 79.6, "Work management", "#393939", "#c6c6c6", 400], [133.7, 53.6, "Scheduling", "#393939", "#c6c6c6", 400]];
  const PANEL = T("p-h", 0, 0, 398, S14, "Established capabilities") +
    T("p-p", 0, 27.3, 200, S8, "These capabilities provide a strong foundation for<br>future growth.") +
    `<div data-k="p-frame" style="position:absolute;left:0;top:66.9px;width:398px;height:255.4px;box-sizing:border-box;border:.52px solid #525252">` +
      `<div style="position:absolute;left:0;top:0;width:397px;height:25.5px;border-bottom:.52px solid #525252;box-sizing:content-box"></div>` +
      TABS.map((t, i) => `<div data-k="p-t${i}" style="position:absolute;left:${t[0] - .52}px;top:-.52px;width:${t[1]}px;height:25.5px;background:${t[3]};box-sizing:border-box;${i === 0 ? "border-top:1.04px solid #4589ff;" : ""}"><div class="rpt" style="left:8.3px;top:${i === 0 ? 6.7 : 7.2}px;${S7}color:${t[4]};font-weight:${t[5]}">${t[2]}</div></div>`).join("") +
      `<div data-k="p-body" class="rpt" style="left:8.3px;top:35.9px;width:223.4px;${S8}white-space:normal">Your asset register is a trusted, governed single source of truth—work order linkage, job plan reuse, and any analytics built on asset data are reliable because the foundation underneath them is clean and consistent.  This positions you to build classification, hierarchy, and relationship structure on top of data you can trust.</div>` +
    `</div>`;

  const CSS = `.rp{position:absolute;left:0;top:0;width:720px;height:1024px;font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:#f4f4f4;-webkit-font-smoothing:antialiased}` +
    `.rp .rpt{position:absolute;white-space:nowrap;margin:0;font-weight:400}.rp .rpt b{font-weight:700}`;

  function make({ enter = [0, 1], reduced = false } = {}) {
    const rg = REGIONS;
    const loc = key => { const r = rg[key]; return { x: r.x, y: r.y, w: r.w, h: r.h }; };
    const html = `<div class="rp" aria-label="Your Maximo growth roadmap report: eight capability bars and a tab panel"><style>${CSS}</style>` +
      `<div data-region="window" data-k="win" style="position:absolute;left:${OX}px;top:${OY}px;width:${WW}px;height:${WH}px;background:#161616;box-shadow:0 1px 1.8px rgba(0,0,0,.09),0 4px 5.5px rgba(0,0,0,.065),0 8px 10.5px rgba(0,0,0,.047),0 24px 32px rgba(0,0,0,.018)"></div>` +
      `<div data-region="illustration" data-k="illo" style="position:absolute;left:${OX}px;top:${OY}px;width:${WW}px;height:${STRIP_H}px;background:#333;overflow:hidden">${STRIP}</div>` +
      `<div data-k="clip" style="position:absolute;left:0;top:0;width:720px;height:1024px">` +
        R("title", loc("title"), TITLE) + R("nav", loc("nav"), NAV_HTML) + R("buttons", loc("buttons"), BTNS) +
        R("kpi-bars", loc("kpi-bars"), KPI) + R("tab-panel", loc("tab-panel"), PANEL) +
      `</div></div>`;

    let Q = null;
    const bind = body => { Q = { body }; body.querySelectorAll("[data-k]").forEach(el => { Q[el.getAttribute("data-k")] = el; }); };
    // reveal: opacity + a small rise (px)
    const rev = (el, u, dy, max) => { el.style.opacity = f2(u * (max === undefined ? 1 : max)); el.style.transform = u >= 1 ? "none" : `translateY(${f2((1 - u) * (dy === undefined ? 5 : dy))}px)`; };
    const draw = (el, u) => { el.setAttribute("stroke-dashoffset", f2(1 - u)); el.style.opacity = u > 0 ? 1 : 0; };
    const scaleAbout = (el, cx, cy, sx, sy) => el.setAttribute("transform", `translate(${f2(cx)} ${f2(cy)}) scale(${f2(sx)} ${f2(sy)}) translate(${f2(-cx)} ${f2(-cy)})`);

    function update(body, k, t) {
      if (!Q || Q.body !== body) bind(body);
      const p = reduced ? 1 : clamp((t - enter[0]) / (enter[1] - enter[0]), 0, 1);

      // ---- HERO: the previous screen's shell (dark window + grey sidebar) grows into the report frame
      const u = inOutS(seg(0, 0.40, p));      // sine in-out: peak slope 1.57 (cubic was 3), so the hero never outruns the scroll
      const wy = lerp(PREV.y, OY, u), wh = lerp(PREV.h, WH, u);
      Q.win.style.top = f2(wy) + "px"; Q.win.style.height = f2(wh) + "px";
      Q.illo.style.top = f2(wy) + "px"; Q.illo.style.width = f2(lerp(PREV.sideW, WW, u)) + "px"; Q.illo.style.height = f2(lerp(PREV.sideH, STRIP_H, u)) + "px";
      Q.clip.style.clipPath = `inset(${f2(wy)}px ${f2(720 - OX - WW)}px ${f2(1024 - wy - wh)}px ${OX}px)`;

      // ---- illustration (everything draws in strip-local coordinates)
      const a = sm(0.28, 0.42, p);
      Q["i-arc"].style.opacity = f2(a); scaleAbout(Q["i-arc"], 45.09, 54.99, lerp(0.4, 1, outC(seg(0.28, 0.42, p))), 1);
      Q["i-inner"].style.opacity = f2(sm(0.32, 0.44, p)); scaleAbout(Q["i-inner"], 45.09, 54.99, lerp(0.4, 1, outC(seg(0.32, 0.44, p))), lerp(0.4, 1, outC(seg(0.32, 0.44, p))));
      ["i-l0", "i-l1", "i-l2", "i-l3"].forEach((id, i) => draw(Q[id], inOutC(seg(0.30 + 0.015 * i, 0.46 + 0.015 * i, p))));
      ["i-c0", "i-c1", "i-c2", "i-c3"].forEach((id, i) => draw(Q[id], inOutC(seg(0.36 + 0.02 * i, 0.56 + 0.02 * i, p))));
      draw(Q["i-main"], inOutC(seg(0.40, 0.60, p)));
      draw(Q["i-b1"], inOutC(seg(0.34, 0.54, p)));
      draw(Q["i-loop"], inOutC(seg(0.34, 0.60, p)));
      Q["i-ba"].style.opacity = f2(sm(0.44, 0.60, p)); Q["i-bb"].style.opacity = f2(sm(0.46, 0.62, p));
      Q["i-dots"].style.opacity = f2(sm(0.34, 0.44, p));
      const nu = seg(0.48, 0.60, p);
      Q["i-node"].style.opacity = f2(sm(0.48, 0.54, p)); scaleAbout(Q["i-node"], 278.06, 54.96, lerp(0.3, 1, outBack(nu)), lerp(0.3, 1, outBack(nu)));
      PILLS.forEach((pl, i) => { const e = seg(0.38 + 0.028 * i, 0.50 + 0.028 * i, p), s = lerp(0.4, 1, outBack(e));
        Q["i-p" + i].style.opacity = f2(sm(0.38 + 0.028 * i, 0.44 + 0.028 * i, p)); scaleAbout(Q["i-p" + i], pl[2] - 8 * (1 - e), pl[3], s, s); });
      RINGS.forEach((r, i) => { const e = seg(0.40 + 0.05 * i, 0.56 + 0.05 * i, p); Q["i-r" + i].style.opacity = f2(sm(0.40 + 0.05 * i, 0.46 + 0.05 * i, p)); scaleAbout(Q["i-r" + i], 615.214, 55.197, lerp(0.5, 1, outC(e)), lerp(0.5, 1, outC(e))); });

      // ---- left column
      rev(Q.logo, sm(0.34, 0.46, p), 4);
      rev(Q["t-h"], sm(0.38, 0.52, p), 7);
      rev(Q["t-beta"], sm(0.46, 0.56, p), 4, 0.5); rev(Q["t-contact"], sm(0.48, 0.58, p), 4); rev(Q["t-based"], sm(0.50, 0.60, p), 4, 0.5);
      for (let i = 0; i < 5; i++) { const e = sm(0.44 + 0.035 * i, 0.56 + 0.035 * i, p); Q["n" + i].style.opacity = f2(e); Q["n" + i].style.transform = e >= 1 ? "none" : `translateX(${f2((1 - e) * -6)}px)`; }
      rev(Q.b0, sm(0.58, 0.68, p), 4); rev(Q.b1, sm(0.62, 0.72, p), 4);

      // ---- right column
      rev(Q["k-h"], sm(0.44, 0.56, p), 6); rev(Q["k-p"], sm(0.48, 0.60, p), 5);
      METERS.forEach((m, i) => {
        const s = 0.52 + 0.05 * m[0] + 0.015 * m[1], e = sm(s, s + 0.12, p), g = outC(seg(s + 0.04, s + 0.24, p));
        Q["m" + i + "-t"].style.opacity = f2(e); Q["m" + i + "-v"].style.opacity = f2(e);
        Q["m" + i + "-bg"].style.opacity = f2(sm(s, s + 0.10, p));
        Q["m" + i + "-f"].style.width = f2(m[4] * g) + "px";
      });
      rev(Q["p-h"], sm(0.74, 0.84, p), 6); rev(Q["p-p"], sm(0.77, 0.87, p), 5);
      rev(Q["p-frame"], sm(0.80, 0.92, p), 6);
      Q["p-body"].style.opacity = f2(sm(0.88, 1.0, p));
      for (let i = 0; i < 3; i++) Q["p-t" + i].style.opacity = f2(sm(0.84 + 0.02 * i, 0.94 + 0.02 * i, p));
    }
    return { html, update, regions: REGIONS };
  }
  window.ReportPiece = { make, regions: REGIONS, FIGMA: { slide: "208:8301", stage: "208:8302", window: "208:8303", strip: "208:8304", title: "208:8353", nav: "208:8358", buttons: "208:8359", kpi: "208:8365", panel: "208:8382", copy: "208:8763" } };
})();
