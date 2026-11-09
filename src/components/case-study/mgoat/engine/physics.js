/* =========================================================================
   PHYSICS EASES (GSAP). The scene is a pure function of scroll progress, so it can be scrubbed and played backwards. GSAP's time-integrating physics plugins
   (Physics2D, Inertia) cannot do that. GSAP's ease curves can: they are stateless functions of progress 0..1 that carry the physical shape (mass pulling away,
   a spring settling) without any clock. This module exposes them two ways:

     MGPhysics.ease("back.in(1.4)")   -> u => eased u, for piece code (ring-piece.js)
     AssemblyScene.E.gsapTilePull ... -> named eases usable as a key's `e` in scene-data.js

   Every ease is clamped so 0 -> 0 and 1 -> 1 EXACTLY. Overshoot happens in between, never at the endpoints, so rests and hand-offs land on identical pixels.
   Must load after assembly-engine.js (it patches AssemblyScene.E) and before ring-piece.js / scene-data.js.
   ========================================================================= */
import { gsap } from "gsap";

const cache = new Map();
function ease(spec) {
  if (!cache.has(spec)) {
    const fn = gsap.parseEase(spec);
    cache.set(spec, u => (u <= 0 ? 0 : u >= 1 ? 1 : fn(u)));
  }
  return cache.get(spec);
}

window.MGPhysics = { ease };

// Named eases for scene-data keys (the engine looks up `key.e` in AssemblyScene.E).
Object.assign(window.AssemblyScene.E, {
  gsapTilePull: ease("back.in(1.8)"),   // a card is pulled away: a small wind-up against the pull, then it accelerates
  gsapSink: ease("power2.in"),          // the heavy dashboard sinks: slow to start, gaining speed
  gsapSettle: ease("elastic.out(1, 0.45)")
});
