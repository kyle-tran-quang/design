/* =========================================================================
   STAGE C DATA: beat 11, "the second iteration" (Figma slides 13 > 14 > 15 of frame 208:5718, file 1r4UreOVeEqdcXvnD5cetk).
   One continuous beat with three text slots. The stage never stops between them; the text changes only at rests.

     C1  slide 13  208:7716  THE SECOND ITERATION   dotted wireframe is traced, the dark UI is revealed
     C2  slide 14  208:7911  "Simplify 40 to 10"    the questionnaire scrolls inside its clipped frame
     C3  slide 15  208:8106  "Simplify goals first" camera flies back up and zooms on question 1; a cursor ticks up to 3 options

   Every window is in vh of scroll, LOCAL to the beat (0 = the beat starts). STAGEC.toGlobal(startVh) shifts them to the beat's real position once Stage B settles.
   Rests are sized 20vh + 0.6vh per word (cap 60), the same rule as story.js:
     words  C1 28 -> 37 | C2 24 -> 34 | C3 56 -> 54 (trimmed to 50 to hold the anchor gap)
     anchors C1 94 | C2 167 | C3 272   (gaps 73 and 105vh; the budget is about 55-105)
   ========================================================================= */
(function () {
  const T = {
    MAX: 328,                              // local scrollable distance of the beat (vh)
    // C1 runs on the FULL SCREEN (1440 x 1024 reference = the whole Figma slide): the UI frame is 70% of the screen width, centred, on a light backdrop.
    //   generate -> reveal the polished UI -> backdrop turns dark -> the frame slides and scales down into the left half. Motion 0-74, rest 74-115 (anchor 94).
    cover:  [-10, 0],                      // wiring only: a light cover fades in over the LAST 10vh of Stage B's rest, hiding the v1 + notes, so C1 starts from a blank full screen
    draw:   [3, 30],                       // the dotted wireframe is traced (outline first, then every box and text line in document order)
    reveal: [24, 41],                      // the real (dark) UI comes in top to bottom behind a scan line; the wireframe is wiped. 17vh (the scan crosses ~420 px): overlaps the draw tail so it chases the last lines
    bg:     [41, 49],                      // only when the polished UI is done: the backdrop turns light -> dark (left #262626, right #161616 = the copy column)
    camera: [49, 74],                      // the frame slides left and scales from 70% of the screen into its Figma pose; 25vh keeps the peak under 6x the scroll that drives it
    // C2: motion 115-148, rest 148-186 (anchor 167)
    scroll: [115, 148],                    // the form scrolls up inside the clip (the frame also settles from y 326 to 302, as in Figma)
    // C3: zoom 186-216, cursor 216-244, rest 244-300 (anchor 272), then the exit
    zoom:   [186, 216],                    // fly back up to question 1 and push in (30vh)
    ticks:  [216, 244],                    // cursor ticks three options (three presses, 9.3vh each: 6 to travel, 3 to press)
    // Stage D's report morphs from the REST pose (680x420 dark window at (20, 326.4), 1x, sidebar visible), so the last frame must be that pose.
    peers:  [35, 113],                     // collaborators' cursors: fade in over the first 14vh, out over the last 14vh (free-clock drift in between)
    out:    [300, 328],                    // zoom out and scroll back to the top; the cursor leaves; ends exactly on the rest pose. 28vh = a glide, not a snap
  };

  const COPY = {
    c1: { eyebrow: "THE SECOND ITERATION",
          copy: ["After that, we refined the assessment and the recommendation engine for the clients.",
                 "This version was shown and demoed at the <span class=\"hl-g\">Maximo Advisory Council in Lowell, MA</span>"] },
    c2: { copy: ["As a lot of customers don’t know about the listed concepts.",
                 "Then, the revised assessment was cut down from 40 to 10 core questions."] },
    // the first line is the overhanging layer 208:8300 on Figma slide 15 (author: put it at the very top of C3, it reduces the dead space)
    c3: { copy: ["I and my colleagues went back to Figma to define the visuals, then the question flow, before building it again with IBM Bob (our AI coding agent).",
                 "The customer now would focus first on their business goals, and their challenges, before being asked how they are using Maximo and their operational details, to reduce cognitive load."] }
  };

  window.STAGEC = {
    TIMING: T, COPY,
    anchors: { c1: 94, c2: 167, c3: 272 },        // gaps 73 and 105vh (budget 55-105)
    toGlobal(startVh) {
      const shift = v => Array.isArray(v) ? v.map(x => x + startVh) : v + startVh;
      const out = {}; Object.keys(T).forEach(k => { out[k] = k === "MAX" ? T[k] : shift(T[k]); });
      out.anchors = {}; Object.keys(this.anchors).forEach(k => { out.anchors[k] = this.anchors[k] + startVh; });
      return out;
    }
  };
})();
