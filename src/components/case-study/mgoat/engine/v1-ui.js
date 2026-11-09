/* =========================================================================
   V1 UI: the first version of the assessment, rebuilt as live HTML from the Figma layers (file 1r4UreOVeEqdcXvnD5cetk, frame "ver1" 102:2757, 1682 x 925).
   It replaces the old v1.png screenshot crops. The frame clips a 4163px tall Body; the part below the fold is what auto-scrolls in the Maximo World beat.

   Layers (Figma node -> here):
     Header 102:2759 (1682 x 125.5, #0043ce)          -> headerHtml()      chip, title, subtitle in a 900px column
     Section 102:2774 (900 wide, 4037.5 tall)          -> formHtml()        caption, two cards, CTA
       Card 102:3022 "Your current state"              -> CARD_1            one 4-column radio table + five radio questions
       Card 102:3385 "Your goals and growth plans"     -> CARD_2            checkbox grid + five radio questions
       CTA 102:3738                                    -> the "Compute my growth assessment" button

   Everything is drawn in SOURCE px (the Figma size) inside a box that is scaled by K, so the layout matches Figma 1:1.
   The crop is 1480 wide (Figma x 101..1581), so the 900px column sits at left 290 here.
   Auto-scroll is driven from outside: V1UI.apply(el, p) with p in 0..1 translates .v1-scroll up by p * (content height - window height).
   ========================================================================= */
(function () {
  const W = 1480, HEAD_H = 125.5, WIN_H = 925 - HEAD_H, COL_X = (W - 900) / 2;      // crop width, header height, form window height, column left
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const INFO = window.MG_BASE + "act2/info-v1.svg";                                            // Figma 102:3029 icon
  const info = `<span class="v1-info"><img src="${INFO}" alt="" width="16" height="16"></span>`;

  // ---- radio / checkbox options. `d` = description line (the growth-ambition options have one).
  const opt = (t, d) => `<div class="v1-ow"><div class="v1-o"><span class="v1-m"><i class="v1-radio"></i></span><span class="v1-ot">${d ? `<span class="v1-od-t">${esc(t)}</span><span class="v1-od-d">${esc(d)}</span>` : esc(t)}</span></div></div>`;
  const opts = list => `<div class="v1-opts">${list.map(o => Array.isArray(o) ? opt(o[0], o[1]) : opt(o)).join("")}</div>`;
  const head = (title, { optional, icon, tall, first } = {}) =>
    `<div class="v1-qh${tall ? " tall" : ""}"><span class="v1-qt">${esc(title)}</span>${optional ? `<span class="v1-optional">(optional)</span>` : ""}${icon ? info : ""}</div>`;
  const question = (title, body, o = {}) => `<div class="v1-q${o.first ? " first" : ""}">${head(title, o)}${o.help ? `<p class="v1-help">${esc(o.help)}</p>` : ""}${body}</div>`;

  // ---- card 1: Your current state (102:3022)
  const COLS = ["None", "Some assets", "Most assets", "All assets"];
  const ROWS = [
    ["Location hierarchy", "Site, facility, area, system — structured parent-child location tree"],
    ["Criticality scores", "Formal ranking of asset impact — safety, production, or cost of failure"],
    ["Technical specifications", "Manufacturer, model, operating parameters, sensor interfaces"],
    ["Condition & failure history", "Failure history, inspection results, or condition readings linked to assets"]
  ];
  const table = `<div class="v1-tw"><div class="v1-tbl"><div class="v1-th"></div>${COLS.map(c => `<div class="v1-th c">${c}</div>`).join("")}` +
    ROWS.map(r => `<div class="v1-td"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div>${COLS.map(() => `<div class="v1-td c"><i class="v1-radio"></i></div>`).join("")}`).join("") + `</div></div>`;
  const CARD_1 = `<section class="v1-card"><div class="v1-lab">Your current state</div>` +
    question("Asset data coverage", table, { first: true, icon: true }) +
    question("Most advanced maintenance approach in use", opts([
      "Reactive — run-to-failure, no planned maintenance",
      "Preventive — scheduled PMs based on time or usage",
      "Condition-based — maintenance triggered by asset condition data or health scores",
      "Condition insights / AI-assisted — using health scoring and analytics to anticipate failures before they occur",
      "Prescriptive — system recommends or automatically triggers the optimal maintenance action"]), { icon: true }) +
    question("Reliability practice documented (FMEA / RCM)", opts([
      "Not really — maintenance knowledge lives with experienced staff rather than in documented form",
      "Yes — failure modes are documented for at least some critical assets, formally or informally"]), { icon: true }) +
    question("Asset criticality classification", opts(["Yes, formally", "Informally / not consistently", "No"]), { icon: true }) +
    question("Inspection and condition capture", opts([
      "Nothing is recorded — observations stay in people's heads or verbal handoffs",
      "Recorded on paper or in a spreadsheet, not linked to any system",
      "Recorded in a digital system, but separate from Maximo",
      "Recorded in Maximo against the work order or inspection — but the asset itself isn't updated",
      "Recorded in Maximo and linked to the asset record — viewable as part of the asset history"]), { icon: true }) +
    question("Materials planning maturity", opts([
      "We don't plan materials in advance",
      "A storeroom exists but isn't linked to work orders",
      "Parts are added to work orders with reorder points set",
      "Materials are reserved as part of the work planning process",
      "Material demand is driven by work history and condition data"]), { icon: true, optional: true, tall: true }) +
    `</section>`;

  // ---- card 2: Your goals and growth plans (102:3385)
  const GOALS = ["Reduce unplanned downtime", "Reduce maintenance costs", "Improve technician productivity", "Improve MRO inventory efficiency",
                 "Extend asset lifespan", "Reduce compliance and safety risk", "Improve production quality and yield"];
  const goals = `<div class="v1-goals">${GOALS.map(g => `<div class="v1-g"><span class="v1-m"><i class="v1-check"></i></span><span class="v1-gt">${esc(g)}</span></div>`).join("")}</div>`;
  const CARD_2 = `<section class="v1-card"><div class="v1-lab">Your goals and growth plans</div>` +
    question("Top strategic goals (select up to 3)", `<p class="v1-help">What outcomes is your organization most focused on achieving? Select up to 3.</p><p class="v1-help s">Select up to 3</p>${goals}`, { first: true }) +
    question("APM growth ambition (next 12–18 months)", opts([
      ["Foundational health scoring", "Reliability Strategies active, health scores running in Maximo Health for critical assets, FMEA baseline in place."],
      ["Condition-based maintenance", "OT/IoT data feeding real-time health scores; maintenance triggered by asset condition, not schedules."],
      ["Predictive analytics", "Maximo Predict deployed for critical asset classes — failure modes modelled, time-to-failure estimates active."],
      ["AI-driven prescriptive operations", "AI recommends or triggers optimal actions; Asset Investment Planning connected to job plan definitions."],
      "No active plans at this time"]), { optional: true, icon: true,
      help: "Which of these asset management capabilities does your organization have active plans or goals to achieve in the next 12–18 months? Select the most advanced capability your team is actively working toward — even if plans are still exploratory." }) +
    question("FSM growth ambition (next 12–18 months)", opts([
      ["Coordinated scheduling", "Centralised scheduler active, work orders carry scheduled dates, workforce calendar in Maximo."],
      ["Structured forward planning", "Planning horizon extends to 2+ weeks; job plans enriched with materials, tools, and skill classifications."],
      ["Intelligent field coordination", "Constraint-based scheduling with long-term horizons; asset condition data feeds work prioritisation."],
      ["Optimised field operations", "Full automation, AI-driven prescriptive dispatch, lean inventory and spares optimisation."],
      "No active plans at this time"]), { optional: true, icon: true,
      help: "Which of these field service capabilities does your organization have active plans or goals to achieve in the next 12–18 months? Select the most advanced capability your team is actively working toward." }) +
    question("AI readiness", opts([
      "Not thinking about it yet", "Aware but not actively exploring", "Considering AI but not sure which use cases to prioritize yet",
      "Actively evaluating options", "Running a pilot or proof of concept", "Already using AI in our operations"]), { help: "When it comes to AI for maintenance and operations, we are…" }) +
    question("Budget for Maximo expansion", opts([
      "Yes — budget is committed for this fiscal year", "Maybe — budget is under discussion or pending approval", "No — no budget identified yet"]),
      { help: "Does your organization have budget allocated to expand your Maximo implementation?" }) +
    question("Executive sponsorship", opts([
      "Yes — a senior leader is actively sponsoring this", "Working on it — interest exists but no formal sponsor yet", "No — no leadership commitment yet"]),
      { help: "Does your organization have executive sponsorship for expanding your Maximo implementation?" }) +
    `</section>`;

  // ---- pieces. `k` = the stage scale of the act 2 content (K in scene-data.js).
  // `w` = crop width in source px (default 1480). Stage B draws the whole 1682px Figma frame (the landed v1 on slide 12), so the 900px column sits at (w - 900) / 2 = 391.
  const headerHtml = (k, w = W) => `<div class="v1h" style="--k:${k}"><div class="v1h-in" style="width:${w}px;height:${HEAD_H}px"><div class="v1h-col" style="left:${(w - 900) / 2}px">` +
    `<div class="v1h-chip"><span>IBM Maximo Application Suite</span></div><div class="v1h-title">Maximo Application Suite Growth Assessment</div>` +
    `<div class="v1h-sub">Milestone-first readiness assessment for APM and FSM</div></div></div></div>`;
  const formHtml = (k, w = W) => `<div class="v1f" style="--k:${k}"><div class="v1f-in" style="width:${w}px;height:${WIN_H}px"><div class="v1-scroll" style="left:${(w - 900) / 2}px">` +
    `<div class="v1-est">Estimated time: 5–8 minutes · All questions are about your current Maximo deployment and practices </div>${CARD_1}${CARD_2}` +
    `<div class="v1-cta"><div class="v1-btn">Compute my growth assessment →</div></div></div></div></div>`;

  // p in 0..1 -> translate the scroller up by p of its travel. offsetHeight is in source px (the scale lives on the parent), so this needs no measuring of the stage.
  const apply = (el, p) => { const travel = Math.max(0, el.offsetHeight - WIN_H); el.style.transform = `translate3d(0,${(-p * travel).toFixed(2)}px,0)`; };

  window.V1UI = { W, HEAD_H, WIN_H, headerHtml, formHtml, apply };
})();
