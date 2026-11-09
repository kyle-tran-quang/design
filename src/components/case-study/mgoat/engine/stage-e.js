/* =========================================================================
   STAGE E (beats 16-17 = Figma slides 20a + 20b): the "Next steps" card rises in as the APM expansion card leaves, then zooms onto "How to implement".
   Loaded AFTER stage-d.js. It only APPENDS one piece + extras to the main SCENE and appends exit keys to Stage D's "expansion" piece; nothing of Stages A-D is rewritten.
   Piece: stagee-piece.js (StageePiece); local windows: stagee-data.js (STAGEE.TIMING, local vh); global position: TIMING.E.start (story.js).
   Slides 21 (maturity maps) and 22 (to be continued) are not built yet.

   BEAT SHEET (vh)                                   anchors: e1 1533 | e2 1600
     16 next-steps / e1  arrive 1480-1514 (one conveyor pan: D's card leaves up, E's card rises) | Rest 1514-1552 (anchor 1533, 23 words)
     17 next-steps / e2  zoom 1.4x onto "How to implement" 1552-1580, highlight 1562-1576 | Rest 1580-1620 (anchor 1600, 26 words)
   ========================================================================= */
(function () {
  const TT = window.TIMING, E = TT && TT.E, SC = window.SCENE, SE = window.STAGEE, EP = window.StageePiece;
  if (!E || !SC || !SE || !EP) return;

  const S = E.start, G = SE.toGlobal(S);
  const V = vh => vh / TT.MAX;
  const FULL = { x: 0, y: 0, w: 720, h: 1024 };

  // ---- E's card: transparent, covers the stage; the animation lives in update(). Pushed AFTER Stage D's pieces (z-order = array order).
  const P = EP.make({ vh: t => t * TT.MAX - S, T: SE.TIMING });
  SC.pieces.push({
    id: "stagee", label: "Next steps card", kind: "media", depth: 22, rects: { r: FULL }, html: P.html, update: P.update,
    keys: [{ t: 0, x: 0, y: 0, z: 0, o: 0, f: 1, rect: "r" }].concat(G.eKeys.map(k => ({ t: V(k.vh), o: k.o })))
  });

  // ---- D's card leaves in lockstep with E's arrival. "expansion" is the only Stage D piece still on stage at 1480 (c-last, report and trust are keyed to 0 by stage-d.js).
  const exp = SC.pieces.find(p => p.id === "expansion");
  if (exp) G.dKeys.forEach(k => { const key = { t: V(k.vh) }; ["y", "o", "e"].forEach(p => { if (k[p] !== undefined) key[p] = k[p]; }); exp.keys.push(key); });

  SC.ariaLabel += " The card then rises as a next steps card: one top priority step and two secondary steps, each tagged with the roles responsible. The card zooms onto the How to implement block.";

  // activity inside update() hooks, declared so the pacing audit sees it
  SC.extras = (SC.extras || []).concat([
    { id: "next steps: card arrives (pan)", keys: [{ t: V(G.arrive[0]), o: 0 }, { t: V(G.arrive[1]), o: 1 }] },
    { id: "next steps: zoom onto How to implement", keys: [{ t: V(G.zoom[0]), o: 0 }, { t: V(G.zoom[1]), o: 1 }] },
    { id: "next steps: highlight", keys: [{ t: V(G.hl[0]), o: 0 }, { t: V(G.hl[1]), o: 1 }] }
  ]);
  window.StageE = { P, G };
})();
