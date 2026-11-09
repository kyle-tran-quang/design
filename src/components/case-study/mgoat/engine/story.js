/* =========================================================================
   STORY: the single source of truth for the timeline (M-GOAT case study, v2 revised page).
   Source: Figma file 1r4UreOVeEqdcXvnD5cetk, section 241:9902, frame 208:5718 ("Case study / full page (v2 revised)"). Each slide is 1440 x 1024:
   left half = stage, right half = copy. Where a Figma frame exists, its wording wins (decision by the author).

   - range / snap / pose / theme / title drive BOTH halves (scene engine and text column).
       snap = where the beat's text is centred in the viewport.   pose = scene state used with prefers-reduced-motion (defaults to snap).
   - chapter = which of the 12 progress ticks is active (Figma SectionNav: several slides share a tick).
   - eyebrow + copy[] is the right-hand text. copy[] strings may carry inline markup: <span class="hl-o"> (orange), <i> (italic).

   BUILD STATUS (staged build; each stage is checked in a browser before the next):
     Stage A  beats 1-7   leaf ring -> dashboard -> tiles -> city art -> ALM skeleton -> hand card -> capabilities diagram     <- this file
     Stage B  beats 8-10  7-layer stack (blueprint) -> journey simulator -> first iteration (blueprint)
     Stage C  beat 11     second iteration: a one-off clock-based intro (stage-c-intro.js) lands on the dark window; then scroll the form, zoom on question 1     <- stage-c.js
     Stage D  beats 12-15 report -> trust + disclosure -> APM expansion card (hover loop) -> numbers zoom     <- stage-d.js
     Stage E  beats 16-17 next steps card -> zoom on "How to implement" (slides 20a, 20b)     <- stage-e.js   (slides 21 maturity maps, 22 to be continued: not built yet)

   PACING (see the worksheet shown at Gate 3): every text anchor sits in a REST (stage still), sized 20vh + 0.6vh per word (cap 60). All motion windows live in
   TIMING below (vh of scroll); scene-data.js reads them from there.
     anchors  numbers 0 | curve 75 | ninety 145 | opportunity 220 | problem 295 | goal 370 | purpose 445 | capabilities 525 (everything after shifted +75vh)
   ========================================================================= */
(function () {
  window.TIMING = {
    MAX: 2129,                                       // MAX = scrollable distance (scrollVh - 100). Stage A ends at 547, Stage B (TIMING.B) runs 547-853, Stage C (TIMING.C) 853-1181, Stage D (TIMING.D) 1181-1555, Stage E (TIMING.E) 1555-1695, Stage F (TIMING.F) 1695-2129.
    // beat 1: the ring DRAWS IN during the hero dissolve (INTRO time: 0..1 across the hero's introVh scroll, rendered by the under-stage in index.html), so it is complete
    // when the layout takes over at t = 0 and the first sentence is read over a finished, still graphic.
    ring: { drawIntro: [0.62, 0.92], dim: [21, 50] },      // dim = the whole graphic eases to 50% (layout time, vh) as the dashboard arrives on top
    dash:  [21, 55],                                 // dashboard slides up over the ring            -> rest 55-95  (curve, anchor 75)
    tiles: [95, 130],                                // AppPoints, Entitlement, Usage fade in         -> rest 130-160 (ninety, anchor 145)
    // ONE hero per beat: the dashboard + tiles leave together (156-172) while the ring MORPHS into the city's shapes (leaves grow into the city leaves, the 13 dots travel
    // to the 6 city nodes, the white circle fades) over 162-226. The city piece then takes over at the same positions (224-228 handoff). The morph is deliberately STRETCHED past the 'opportunity' anchor (220): the leaves
    // bloom and the dots arc in while the sentence is read, and the last squash-settle (ring-piece.js: the final 20% of the window, 213-226) is still ringing as the text crosses the
    // centre, landing just after it. Rest 228-246 (a short rest by the 20vh + 0.6vh/word rule: 18vh instead of 40; the beat's `pose` is a landed frame for reduced motion).
    toCity: { dash: [156, 172], tiles: [156, 172], ring: [162, 226], city: [162, 228], handoff: [224, 228] },       // city art grows in left to right across the ring morph; at `handoff` its own leaves + nodes replace the ring's identical ones (see capabilities.js i0/i1/th)
    // per-tile exit windows (AppPoints, Entitlement, Usage), in vh. Each tile is pulled toward the stage centre with its own mass: Entitlement is the biggest, so it starts last and takes longest
    // (physics.js: back.in wind-up, then acceleration). They must end before `toCity.handoff` (194) and may outlast the dashboard (172) only a little.
    tileExit: [[156, 167], [161.5, 175], [159, 170]],
    toAlm: { city: [246, 270], alm: [252, 279] },    // city art out, ALM skeleton in                 -> rest 279-311 (problem, anchor 295)
    // wireframe -> hand card (311-345vh). One hero: the wireframe's six grey blocks TRAVEL and become the six pills (stagger 12% of the window), while the window shrinks into the card's
    // frame and the card's lines / rings / hand fade up beneath. The pill loop (Figma, 4s, free-running clock) starts when the morph lands; the text anchor (370) is inside the loop's rest.
    toHand: [311, 345],
    toDiagram: [380, 505],                           // hand card -> capabilities diagram. PLACEHOLDER cross-fade: the card-by-card morph you chose is a later step (needs new seed geometry). The morph is spread across THREE text beats: it starts inside 'goal' (anchor 370, starts 380), is mid-way at 'purpose' (anchor 445) and lands inside 'capabilities' (starts 485, lands 505). Rest 505-547 (anchor 525). The pill loop runs on its free clock 345-380
    capPrime: [345, 347],                            // the capabilities piece runs its own p 0 -> 1 here, while it is invisible (under the hand card), so it is already the finished diagram when it fades in

    /* ---- STAGE B (stage-b.js). Anchors: milestones 553 | simulator 633 | first 738 (gaps from the previous anchor 450: 103, 80, 105).
       Beat 8 milestones   Cue 472-482 (diagram text/connectors fade) | Hero 482-522 (tilt + the 7 lilac cards stack, blue cards fall away) | Land: card drops 508-534, labels 527-541 | Rest 541-565 (anchor 553)
       Beat 9 simulator    Hero 565-628 (the layers light up smoothly one by one, starting after milestones passes center) | Rest 628-654 (anchor 633; the video slot sits in the text column); labels leave 646-654
       Beat 10 first       Hero 654-694 (camera flattens, the card grows into the v1, the layers fold under it) | Land: live v1 crossfade 694-702, notes 700-712 | Rest 712-778 (anchor 738, ~65 words -> needs 59)
       Text swaps happen at the midpoint between anchors, where the outgoing text has just left the viewport (103vh gap) or is at its edge. */
    B: {
      cue: [547, 557],                               // the diagram's text, bars, connectors and red node fade, leaving 14 plain cards
      tilt: [557, 597],                              // camera flat -> isometric (40vh: 3 rotations' worth of travel on a 60 degree tilt). The lilac cards travel into the stack inside this window.
      leftStart: 559, leftStep: 3, leftLen: 20,      // the 7 blue module cards sink and fade (staggered 3vh, 20vh each: last one ends 522)
      layerStart: 559, layerStep: 3, layerLen: 20,   // the 7 lilac cards fly to their layer, bottom layer first (last one lands 522, in step with the tilt)
      wire: [571, 597],                              // pastel card colours -> grey wireframe
      card: [583, 611],                              // the v1 card drops onto the stack (28vh: 150 z-units at outBack's 4.4x peak needs >= 21vh to stay under 6x; the overshoot lands in the last third)
      labels: [602, 616], labelStep: 1.2, labelLen: 6, labelsOff: [721, 729],                 // leader labels draw in top to bottom (done 540); they leave just before the flatten
      scan: [640, 703], scanStep: 7.0, scanLen: 21.0, // the layers light up in turn (top to bottom) after milestones text passes center (553): 565-628, then rest.
      flatten: [729, 769],                           // camera isometric -> flat; the stack folds and the card grows into the v1 (lockstep, 40vh: the card travels ~480 screen px at inOutCubic peak 3x, so it needs >= 40vh to stay under 6x)
      live: [769, 777],                              // the live v1 (HTML) crossfades over the wireframe card AFTER it has landed at the v1's rect
      notes: [775, 787], noteStep: 3, noteLen: 8     // the three feedback notes, a pure fade (a drift this short reads as a glitch), staggered 3vh (done 712)
    },


    /* ---- STAGE C (stage-c.js + stagec-piece.js; beats 11a-11c = Figma slides 13, 14, 15). Local source: stagec-data.js. Anchors: second 872 | simplify 945 | goals 1050 (gaps 134 from B's 738, then 73, 105).
       C1 is NOT scroll-driven any more. When the scroll reaches `intro.trigger` (778) a clock-based, scroll-locked intro plays ONCE (stage-c-intro.js / .css: the full-screen generation, the frame
       sliding into the left half, ~7s) and the reader then lands at `intro.land` (872). The page underneath (stage-c.js) therefore shows Stage C's LANDED layout, still, from 778 on: dark theme, the dark
       questionnaire window at its rest pose in the left half (backdrop #262626), the dark text column on the right. No replay: after the intro, scrolling back below 778 hard-cuts to Stage B and
       forward again shows the landed state directly (778-893 is a still pose on a revisit). The old scroll windows (cover 768-778, draw 781-808, reveal 802-819, bg 819-827, camera 827-852) are retired.
       C1  Rest 778-893 (anchor 872, 30 words -> needs 38)
       C2  scroll the questionnaire 893-926 | Rest 926-964 (anchor 945, 24 words -> needs 34)
       C3  zoom on question 1 964-994 | cursor ticks 3 options 994-1022 | Rest 1022-1078 (anchor 1050, 56 words -> needs 54) | out: zoom back to the rest pose 1078-1106 (Stage D's report morphs from the LAST frame) */
    C: {
      start: 853,                                      // global vh of the beat's local 0 (= the end of Stage B = intro.trigger): the overlay (#stageC) is shown from here, already landed
      intro: { trigger: 853, land: 947 },              // read by stage-c-intro.js: the intro starts when the scroll reaches `trigger`, and the reader is landed on `land` (the first text anchor) when it ends
      morph: [853, 883],                                // v1 -> dark v2 on a revisit (and after the intro has played): scroll-driven, plays backwards too (stage-c.js, stagec-piece.js)
      scroll: [968, 1001], zoom: [1039, 1069], ticks: [1069, 1097], out: [1153, 1181],
      peers: [888, 966],                               // the collaborators' cursors (stagec-piece.js): fade in 888-902 (after the morph), drift on the free clock, fade out 952-966 (before the form scrolls)
      end: 1181                                        // last vh of Stage C: the overlay is shown up to and including this, then hands the stage to whatever follows
    },

    /* ---- STAGE D (stage-d.js + report-piece.js, trust-piece.js, expansion-piece.js; beats 12-15 = Figma slides 16, 17, 18, 19). Anchors: report 1155 | trust 1262 | expansion 1372 | numbers 1458.
       Gaps 105 (from C's 1050), 107, 110, 86. The first gap is long because C's own exit (1078-1106) and the report's entrance (36vh) sit between the two texts.
       12 report     entrance 1106-1142 | Rest 1142-1184 (anchor 1155, 32 words -> 39)
       13 trust      cue 1184-1192 | cards pull apart 1192-1238 | Rest 1238-1286 (anchor 1262, 46 words -> 48) | tab cycle 1286-1336 (cursor; its leaving overlaps the next beat)
       14 expansion  cards converge 1324-1352 | Rest 1352-1392 (anchor 1372, 29 words -> 37); the hover loop runs on a free clock
       15 numbers    zoom 1.6x onto Potential outcomes 1392-1437 | Rest 1437-1480 (anchor 1458, 35 words -> 41). End pose = Stage E's start. */
    D: {
      cLast: [1165, 1175],                             // the frozen Stage C last frame + the report shell fade in UNDER Stage C's overlay (opaque until 1106.05)
      fade: [1181, 1189],                              // the frozen last frame fades out as the report grows
      report: [1181, 1217],
      trust: [1255, 1411],                             // trust-piece.js window = its TOTAL_VH (156): see trust-piece.js TM
      exp: [1399, 1427],
      zoom: [1467, 1512],
      end: 1555
    },

    /* ---- STAGE E (stage-e.js + stagee-piece.js; beats 16-17 = Figma slides 20a, 20b). Local windows live in stagee-data.js (STAGEE.TIMING, local vh); start = the first vh after Stage D's final rest.
       Anchors: e1 1533 | e2 1600 (gaps 75 from D's 1458, then 67).
       16 next steps  arrive 1480-1514 (D's card leaves up, E's card rises: one pan) | Rest 1514-1552 (anchor 1533, 23 words)
       17 implement   zoom 1.4x onto "How to implement" 1552-1580, highlight 1562-1576 | Rest 1580-1620 (anchor 1600, 26 words) */
    E: { start: 1555 },
    F: { start: 1695 }
  };
})();

const f = vh => +(vh / TIMING.MAX).toFixed(5);       // TIMING vh -> beat progress
window.STORY = {
  id: "m-goat-v2",
  title: "M-GOAT: Maximo Growth Opportunities Assessment Tool",
  introVh: 180,              // extra scroll (vh) for the hero -> stage transition, before the beats start (hero-transition.js). 0 = none.
  scrollVh: 2229,            // MAX + 100
  chapters: 12,              // number of progress ticks (Figma SectionNav)
  smoothing: 140,            // ms. The scene eases toward the scroll position (time constant). 0 = 1:1 with scroll.
  mode: "continuous",
  beats: [
    {
      id: "numbers", hold: true, chapter: 0, range: [0, f(37.5)], snap: 0, pose: 0, theme: "light", title: "Maximo",
      copy: [
        "IBM Maximo is a 40+ years old asset lifecycle management software suite.",
        "It’s being used by <span class=\"hl-o\">7,200 companies</span> worldwide to manage assets, manufacturing, maintenance, and running the world."
      ],
      motion: "The Figma leaf-in-a-ring graphic holds on the stage (Figma 208:5854)."
    },
    {
      id: "curve", hold: true, chapter: 1, range: [f(37.5), f(110)], snap: f(75), pose: f(75), theme: "light", title: "Learning curve",
      copy: [
        "Being 40+ years old means Maximo has a really steep learning curve.",
        "And it’s not going to change anytime soon, considering how many clients respected and were used to the way it is."
      ],
      motion: "The Operational dashboard slides up over the ring (21-55vh). The ring's dots stay visible around it, as in Figma 208:5897."
    },
    {
      id: "ninety", hold: true, chapter: 1, range: [f(110), f(182.5)], snap: f(145), pose: f(145), theme: "light", title: "90% / 10%",
      copy: [
        "Our research and intelligence has shown that:",
        "90% of clients use only <span class=\"hl-o\">10% of it</span>."
      ],
      motion: "Three tiles (AppPoints, Entitlement, Usage) fade in around the dashboard (95-130vh), staggered. Tiles are Figma exports (rotation and shadow baked in)."
    },
    {
      id: "opportunity", hold: true, chapter: 2, range: [f(182.5), f(257.5)], snap: f(220), pose: f(232), theme: "light", title: "The opportunity",
      copy: [
        "The opportunity is you can utilize at least 10-15% more of Maximo, to get <span class=\"hl-o\">40% more ROI benefit</span>.",
        "But…that sounds like a huge step for big clients with complex operations."
      ],
      motion: "UI morph (156-228vh): the dashboard sinks and the tiles are pulled away (156-175), while the ring blooms into the city illustration (Figma 208:6199) with spring physics. The morph runs on past the text anchor (220) and settles at 228. Reduced motion shows the landed frame (232)."
    },
    {
      id: "problem", hold: true, chapter: 2, range: [f(257.5), f(332.5)], snap: f(295), pose: f(295), theme: "light", title: "The problem",
      eyebrow: "THE PROBLEM",
      copy: [
        "And also, sellers had a huge knowledge base, with no focus on expansion and maximizing utilization for existing clients."
      ],
      motion: "UI morph (246-279vh): the city art fades out as the tilted ALM homepage skeleton (Figma 208:6309) eases in."
    },
    {
      id: "goal", hold: true, chapter: 3, range: [f(332.5), f(410)], snap: f(370), pose: f(370), theme: "light", title: "The goal",
      copy: [
        "That is the business problem we’re trying to solve, with the Maximo Growth Opportunities Assessment tool."
      ],
      motion: "UI morph (311-343vh): the skeleton grows into the hand-and-flow card (Figma 235:7773) and straightens."
    },
    {
      id: "purpose", hold: true, chapter: 3, range: [f(410), f(485)], snap: f(445), pose: f(445), theme: "light", title: "The purpose",
      copy: [
        "The purpose we had in mind was to help clients know where they are with their Maximo operations, and IBM client teams drive better utilization & expansion, to help them reach their goals and ROI faster."
      ],
      motion: "The hand-and-flow card turns into the capabilities diagram (morph 380-505vh, spread over goal, purpose and capabilities): the lines and pills travel into the 14 cards."
    },
    {
      id: "capabilities", hold: true, chapter: 4, range: [f(485), f(576.5)], snap: f(525), pose: f(525), theme: "light", title: "Capabilities",
      copy: [
        "We broke down complexity into a big picture with manageable steps:",
        "Maximo has 13 core applications (modules)",
        "And many pathways tailored to each industry (manufacturing, transportation, oil & gas, nuclear, etc…)"
      ],
      motion: "The hand card hands over to the capabilities diagram (Figma 208:6706): 7 modules on the left, 7 industry cards on the right, 'and 76 more…'. Cross-fade for now; the card-by-card morph is a later step."
    },

    /* ---------------- STAGE B. Copy is the author's Figma wording (slides 10, 11, 12 of frame 208:5718). Stage: stage-b.js, windows: TIMING.B. ---------------- */
    {
      id: "milestones", hold: true, chapter: 5, range: [f(576.5), f(671)], snap: f(628), pose: f(628), theme: "light", title: "76 milestones",
      copy: [
        "We identified 76 milestones to reach full value with Maximo.",
        "Each milestone has 5-10 core actions, involving roles like supervisors, technicians, admins, and so on."
      ],
      motion: "Blueprint (472-541vh): the diagram's text and connectors fade; the camera tilts back into an isometric view as the seven industry cards stack into seven wireframe layers (the seven blue module cards fall away), the assessment card drops on top, and each layer gets a leader label (Figma 219:6843)."
    },
    {
      id: "simulator", hold: true, chapter: 5, range: [f(671), f(761)], snap: f(708), pose: f(708), theme: "light", title: "Journey simulator",
      // The simulator is a VIDEO fill in Figma (219:6877), which the Figma tools cannot export; the poster still stands in. To use the real video: replace the <img> with
      //   <video class="sb-vid" src="assets/stageb/simulator.mp4" poster="assets/stageb/simulator@3x.png" muted loop playsinline autoplay></video>
      copy: [
        "This was the hard and painful part.",
        "We even had to build a journey simulator to validate these by hand." +
          "<span class=\"sb-sim\"><img class=\"sb-vid\" src=\"" + window.MG_BASE + "stageb/simulator@3x.png\" alt=\"The journey simulator: a dark interface with a milestone map and a report panel showing the stage a client is in.\" width=\"536\" height=\"302\"></span>" +
          "<span class=\"sb-cap\">Thanks for Tanushri for the support!</span>"
      ],
      motion: "The seven layers light up smoothly one at a time, top to bottom, as the validation is read (565-628vh). The stack then holds."
    },
    {
      id: "first", hold: true, chapter: 6, range: [f(761), f(853)], snap: f(813), pose: f(813), theme: "light", title: "The first iteration",
      eyebrow: "THE FIRST ITERATION",
      copy: [
        "And we mapped them into initially 40 questions, and we launched the first demo in MaximoWorld in Nashville, TN to get the first round of usage and feedback.",
        "I thought, <i>“this will need to be simpler”</i>.",
        "<span class=\"sb-quote\">“We’d really want to see what’s the next step after this. Reading through all of these seem novel, but I’m not sure what to do yet...”</span><span class=\"sb-cite\">— MaximoWorld participant, 2026</span>"
      ],
      motion: "Blueprint (654-698vh): the camera flattens as the assessment card grows into the real first version (Figma 208:7016) and the layers fold away beneath it; three feedback notes pin on (696-708vh)."
    },
    /* ---------------- STAGE C. Copy is the author's Figma wording (slides 13, 14, 15 of frame 208:5718). Stage: stage-c.js + stagec-piece.js, windows: TIMING.C. ---------------- */
    {
      id: "second", hold: true, chapter: 7, range: [f(853), f(1181)], snap: f(947), pose: f(947), theme: "dark", title: "The second iteration",
      // one beat, three text slots (index.html `texts`): the stage never stops between them, the copy changes at the midpoints (908 and 998)
      texts: [
        { id: "second-1", snap: f(947), chapter: 7, eyebrow: "THE SECOND ITERATION",      // no `from`: it defaults to the beat start (778), like any other beat's text. The frame is already landed, so the copy just scrolls up from the bottom to its anchor (872)
          copy: ["After that, we refined the assessment and the recommendation engine for the clients.",
                 "This version was shown and demoed at the <span class=\"hl-g\">Maximo Advisory Council in Lowell, MA</span>"] },
        { id: "second-2", snap: f(1020), chapter: 8,
          copy: ["As a lot of customers don\u2019t know about the listed concepts.",
                 "Then, the revised assessment was cut down from 40 to 10 core questions."] },
        // the first paragraph is the overhanging layer 208:8300 on Figma slide 15 (author: put it at the very top of C3, it reduces the dead space)
        { id: "second-3", snap: f(1125), chapter: 8,
          copy: ["I and my colleagues went back to Figma to define the visuals, then the question flow, before building it again with IBM Bob (our AI coding agent).",
                 "The customer now would focus first on their business goals, and their challenges, before being asked how they are using Maximo and their operational details, to reduce cognitive load."] }
      ],
      copy: [],
      motion: "C1 (778vh): a clock-based, scroll-locked intro plays once (stage-c-intro.js: a full-screen generation, then the frame slides into the left half) and lands the reader on 872; from 778 the page underneath shows the landed layout, still (dark page, the dark window at rest in the left half), and there is no replay. C2 (893-926): the questionnaire scrolls inside its clipped frame. C3 (964-1022): the camera zooms on question 1 and a cursor ticks three options; 1078-1106 zooms back to the rest pose (Stage D morphs from it)."
    },

    /* ---------------- STAGE D. Copy is the author's Figma wording (slides 16, 17, 18, 19 of frame 208:5718). Stage: stage-d.js, windows: TIMING.D. ---------------- */
    {
      id: "report", hold: true, chapter: 9, range: [f(1181), f(1283.5)], snap: f(1230), pose: f(1230), theme: "dark", title: "The report",
      eyebrow: "THE REPORT",
      copy: [
        "After that, they get the next steps report.",
        "This was built with 3 acts so that an executive can scan it within 20 seconds, and their teams to know what to act on."
      ],
      motion: "UI morph (1106-1142vh): the dark window grows into the roadmap report; the illustration strip draws in, the capability bars fill (Figma 208:8302)."
    },
    {
      id: "trust", hold: true, chapter: 9, range: [f(1283.5), f(1392)], snap: f(1337), pose: f(1337), theme: "dark", title: "Trust first",
      // Figma lists the 'trust first' paragraph (208:9365, y 214) above the 'progressive disclosure' one (208:9362, y 547): same order here
      copy: [
        "I aligned this to build trust first (acknowledging what the client has already achieved) before introducing gaps and recommendations.",
        "The structure was also built with progressive disclosure in mind, to hide complexity until it is needed, and clear actions will be surfaced once they read it."
      ],
      motion: "Light blueprint (1184-1238vh): the report pulls apart into the maturity score card, the capability bars and the navigation + tab panel (Figma 208:9293); the tabs then switch under a cursor (1286-1336vh)."
    },
    {
      id: "expansion", hold: true, chapter: 10, range: [f(1392), f(1490)], snap: f(1447), pose: f(1447), theme: "dark", title: "Value of expansion",
      copy: [
        "After that, we needed to show the value of expansion.",
        "For example, the Asset Performance Management journey has 5 stages. Each stages define the maturity level of the customer."
      ],
      motion: "Flat morph (1324-1352vh): the three cards converge into the APM expansion card (Figma 231:6367); stage 01 then stage 02 open under a cursor, looping on a free clock while the card is on stage."
    },
    {
      id: "numbers-zoom", hold: true, chapter: 10, range: [f(1490), f(1555)], snap: f(1533), pose: f(1533), theme: "dark", title: "Value in numbers",
      copy: [
        "For each maturity stage, I made sure that every action displays clear financial impact, benefits and ROI metrics (based on IBM Institute for Business Value) so the reader has instant proof to secure leadership buy-in."
      ],
      motion: "Flat zoom (1392-1437vh): the card scales 1.6x onto the Potential outcomes numbers (Figma 231:6650). The right edge clipping is the author's known Figma quirk."
    },

    /* ---------------- STAGE E. Copy is the author's Figma wording (slides 20a, 20b of frame 208:5718). Stage: stage-e.js, windows: STAGEE.TIMING shifted by TIMING.E.start. ---------------- */
    {
      id: "next-steps", hold: true, chapter: 10, range: [f(1555), f(1695)], snap: f(1608), pose: f(1608), theme: "dark", title: "Next steps",
      // one beat, two text slots (index.html `texts`): the stage never stops between them. The sentence changes as each hero starts (1480, 1552), see stagee-data.js "text swaps".
      texts: [
        { id: "e1", snap: f(1608), from: f(1555), to: f(1627), chapter: 10,
          copy: ["In the next action steps, the system highlights a single top priority alongside two secondary steps so you always know where to start."] },
        { id: "e2", snap: f(1675), from: f(1627), to: f(1695), chapter: 10,
          copy: ["Each step explicitly tags responsible roles, like Asset Manager or Sys Admin, making it clear as to how to set up Maximo tasks with your team."] }
      ],
      copy: [],
      motion: "Conveyor pan (1480-1514vh): the APM expansion card leaves upward as the Next steps card rises into place. Zoom (1552-1580vh): the card scales 1.4x onto How to implement, the other blocks dim to 25% and a blue frame appears (Figma 239:6833, 239:6889)."
    },
    {
      id: "maturity", hold: true, chapter: 11, range: [f(1695), 1], snap: f(1763), pose: f(1763), theme: "light", title: "Maturity maps",
      // six text slots (Figma 208:9517, 333:5958, 333:6577, 235:8230, 208:9575). The beat theme is "light"; stage-f.js holds the dark colours inline (--bg/--page/--text/--line) and eases them to light
      // over STAGEF.TIMING.flip, so the page turns light inside the beat. f2 carries the old map as a static image, f5 is the full-bleed "To be continued...".
      texts: [
        { id: "f1", snap: f(1763), from: f(1733), to: f(1793), chapter: 11,
          copy: ["Another part of the sales enablement kit is the maturity maps for each pathway."] },
        { id: "f1b", snap: f(1823), from: f(1793), to: f(1853), chapter: 11,
          copy: ["Our focus was on asset performance management and field service management maturity content for sellers and clients for the first phase."] },
        { id: "f2", snap: f(1898), from: f(1853), to: f(1943), chapter: 11,
          copy: ["Initially, we had this maturity map which was comprehensive but too complex and hard to follow."],
          image: { src: window.MG_BASE + "stagef/f21-old-map-4e1678.png", w: 536, h: 561, alt: "The original maturity map: five stage columns for each pathway, comprehensive but dense." } },
        { id: "f3", snap: f(1995), from: f(1943), to: f(2008), chapter: 11,
          copy: ["To give readers clarity without forcing the whole map with 5 stages into one view, I split the content into one single stage view at a time."] },
        { id: "f4", snap: f(2071), from: f(2008), to: f(2103), chapter: 11,
          copy: ["This helps executives pinpoint exact gaps in their hardware monitoring, versus on-the-ground execution.",
                 "A comparison view helps them guide the conversation to the customer about where they\u2019re at and the target stage."] },
        { id: "f5", snap: f(2118), from: f(2103), to: 1, chapter: 11, full: true,
          copy: ["To be continued..."] }
      ],
      copy: [],
      motion: "Zoom out + flip (1620-1682vh): the dark Next steps card zooms back out, turns over and the page goes light on the Maturity pathways card. Expand (1682-1730vh): the five blocks open left to right, then their labels. Rest 1 (1740-1780vh): pathways card expanded. Rest 1b (1780-1840vh): APM/FSM focus. Blueprint (1840-1876vh): the card tilts and breaks into outline slabs. Assemble (1926-1992vh): the slabs travel into the Plan your customers' next move window and the dark cells fall away. Compare (2068-2106vh): Stage 1 narrows and Stage 2 arrives. Exit (2164-2198vh): the window folds back to outlines and leaves an empty stage."
    }
  ]
};
