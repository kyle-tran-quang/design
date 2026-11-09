/* =========================================================================
   V2 UI: the second version of the assessment, rebuilt as live HTML from the Figma layers (file 1r4UreOVeEqdcXvnD5cetk, frame "ver2" 69:101, 1682 x 925).
   Two pieces, cropped like the PNG pieces they sit on top of (chrome c2 = 588 x 925, form f2 = 892 x 925 from Figma x 588):

     Sidebar 69:103 (588 x 925, gradient)           -> sideHtml()   caption, heading, "Page 1 of 4", IBM logo, "v.1"
     Main Content 69:117 (746 col, x 197 in 1140)    -> mainHtml()   progress bar, section label, question, 6-column table, second section
       Frame 2 69:124  "Asset data maturity"            table: Themes + None / 10% / 10-20% / 20-50% / >50%, five rows of radios
       Frame 3 69:326  "Work management"                8 checkboxes. Starts at y 902, so only its label peeks above the 925px fold.
       Container 69:423 (Back / Next)                   y 1542, below the fold, not drawn.

   Drawn in SOURCE px inside a box scaled by k (same pattern as v1-ui.js). The PNG crops (assets/act2/v2.png) stay underneath: v2 -> v3 explodes those,
   so scene-data.js cross-fades this live layer out onto them while v2 rests.
   ========================================================================= */
(function () {
  const IBM = window.MG_BASE + "act2/ibm-logo.png", INFO = window.MG_BASE + "act2/info-v2.svg";           // Figma 69:114 (151 x 56 @ 51.2 x 19), icon 69:135
  const COLS = ["None", "10%", "10-20%", "20-50%", ">50%"];
  const ROWS = [
    ["Criticality ranking", "Formally rated by business impact (safety, compliance, downtime cost)"],
    ["Assets in a hierachy", "Structured parent-child links across locations, assets, and components"],          // "hierachy" is the Figma spelling
    ["Classification and specifications", "Standardized classes with technical attributes (manufacturer, model, ratings)."],
    ["Complete asset master data", "Core lifecycle details (install date, life, cost) with linked spare parts (BOMs)."],
    ["Assets with a default<br>health score", "Calculated health index based on age, work history, meters, or inspection logs."]
  ];
  const CAPS = ["Manage", "Health", "Monitor", "Predict", "Reliability Strategies", "Visual Inspection", "Scheduler", "Mobile"];

  const sideHtml = k => `<div class="v2s" style="--k:${k}"><div class="v2s-in">` +
    `<div class="v2s-cap">Maximo Application Suite growth Readiness assessment</div>` +
    `<div class="v2s-mid"><h1>Your maintenance operations</h1><div class="v2s-page">Page 1 of 4</div></div>` +
    `<div class="v2s-foot"><img src="${IBM}" alt="" width="51.23" height="19"><span>v.1</span></div></div></div>`;

  const rule = t => `<div class="v2m-rule"><span>${t}</span><i></i></div>`;
  const table = `<div class="v2m-tbl">` +
    `<div class="v2m-th l">Themes</div>${COLS.map(c => `<div class="v2m-th">${c}</div>`).join("")}` +
    ROWS.map(r => `<div class="v2m-td l"><b>${r[0]}</b><span>${r[1]}</span></div>${COLS.map(() => `<div class="v2m-td"><i></i></div>`).join("")}`).join("") + `</div>`;
  const mainHtml = k => `<div class="v2m" style="--k:${k}"><div class="v2m-in">` +
    `<div class="v2m-prog"><i></i></div>` +
    `<div class="v2m-s1">${rule("Asset data maturity")}<div class="v2m-q"><div class="v2m-qt">What percentage of your assets meet each<br>of the following criteria?</div>` +
    `<div class="v2m-info"><img src="${INFO}" alt="" width="20" height="20"></div></div>${table}</div>` +
    `<div class="v2m-s2">${rule("Work management")}<div class="v2m-q two"><div class="v2m-qt">Which Maximo capabilities do you use today?<span class="v2m-opt">(Optional)</span></div>` +
    `<div class="v2m-info"><img src="${INFO}" alt="" width="20" height="20"></div></div>` +
    CAPS.map(c => `<div class="v2m-cap"><i></i><span>${c}</span></div>`).join("") + `</div></div></div>`;

  window.V2UI = { sideHtml, mainHtml };
})();
