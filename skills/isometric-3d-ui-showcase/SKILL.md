---
name: isometric-3d-ui-showcase
description: This skill should be used when the user asks to "build an isometric UI showcase", "explode a UI into layers", "make an exploded-layer / layer-stack diagram", "animate a flat card tilting into an isometric view", "create an isometric architecture video", "build a blueprint-grid product mockup", "add annotation callouts with a focus pull", "make a platform / modules scene with a rack focus", "recreate the Natwest / IBM isometric motion studies", or "scale an isometric UI mockup to video or other aspect ratios". Covers a flat blueprint-grid card build-up, a defocus-and-callout annotation pass, a flat-to-dimetric tilt into a stack of docking layers, and an orbiting platform scene with lid pop-up modules, fade-only pills and a coupled rack focus — as scrubbable, frame-driven HTML stages that port to Remotion or Three.js.
version: 0.1.0
---

# Isometric 3D UI Showcase

Turn a flat product UI into a polished isometric story: a blueprint-grid card builds up, gets annotated under a focus pull, tilts into a
dimetric view, splits into a stack of labelled layers, then orbits onto a platform of modules. Everything is specified as **measured numbers**
(frames, px, easing curves, hex) from five reference clips, so the result can be rebuilt to scale — as an interactive mockup, a video, or both.

Look: IBM Carbon palette, IBM Plex Sans/Mono, blueprint grid, hard-offset shadows, translucent glass, restrained motion with **no overshoot**.

## When to use

- Showing a product/architecture as stacked layers ("UI → agents → models → data → infrastructure").
- A hero video or interactive mockup that moves from a flat screen into an isometric diagram.
- Annotating a UI with AI/analysis callouts without cluttering it (focus-pull annotation).
- Matching the Natwest/IBM motion-study look, or scaling it to another aspect ratio or product.

Not for: true-3D product renders, game-style isometric art, or generic card-flip hover effects (use `micro-interaction`).

## The five beats

```
01 BUILD   flat card builds on a blueprint grid            stage 01   (clips 01, 03)
02 FOCUS   push in · defocus + dim base · callouts · chips  stage 03   (clip 02)
03 TILT    flat → dimetric, layers rise from BELOW and dock  stage 02   (clip 04)
04 ORBIT   hold · move · hold · move · hold, lids, rack focus  stage 04  (clip 05)
```

| Stage file (`assets/stages/`) | What it demonstrates | Verified against footage |
|---|---|---|
| `01-flat-card-buildup.html` | wireframe → card → content rise, typewriter reply | text 0 px off; colours ±3 |
| `02-isometric-layer-stack.html` | tilt, 10-layer docking stack, shadow, side modules, pills | camera corners 2–7 px |
| `03-annotation-callouts.html` | focus pull, callouts from a dot, chip wipes, word stream, scroll | timing from report; scroll offsets approximate |
| `04-platform-modules.html` | orbit camera, lids, lattice wave, coupled rack focus, pills | camera + hero verified; module lid footprints within 1 px of the clip's measured x range |

Open any stage by double-clicking it. Controls: scrub bar, play/pause, loop, speed. Add `?f=N` to freeze on frame N, `?ui=0` to hide controls — this is how screenshots are taken.

## Decision tree

```
What are you building?
├─ A flat UI that needs to feel physical
│   └─ read §Flat card · size card in lattice cells · hard-offset shadow · build-up (stage 01)
├─ Callouts / analysis overlays on a UI
│   └─ read §Focus pull · base plane blurs + dims, callouts stay sharp and screen-space (stage 03)
├─ "Explode" a UI into layers
│   └─ read §Tilt and stack · layers CONVERGE from below, they do not fly outward (stage 02)
├─ Several modules on a platform / architecture view
│   └─ read §Platform · hold-move-hold-move-hold, lids not pop-ins, fade-only pills (stage 04)
└─ A different aspect ratio or a real video render
    └─ read §Scaling and §Porting
```

## Core rules (the ones that make it look right)

1. **Frame-driven, not CSS-transitioned.** Each stage is a pure `render(frame)`. That makes it scrubbable, deterministic, screenshot-testable and portable to Remotion (`useCurrentFrame` → `render`). Work at 1920×1080, 23.976 fps, scale the stage as a whole.
2. **Size the card in lattice cells.** Card = 4×4 crosshair cells (843 px); crosshair pitch = 8 × minor pitch (26.35 px). Card edges land on grid lines.
3. **Hard-offset shadows, not blurred drop shadows.** A same-size slab offset (+17 % W, +6.5 % W), `multiply`, ground × ~0.6 (blue-tinted), soft edge ≈ 9 px. Raised children cast ≈ 0.42 × that. **Shadow length encodes height** and later sets layer spacing.
4. **One light direction** (upper-left, ≈ 24° below +x) for every element in every scene.
5. **UI content rises in from below with expo-out, staggered by role** (bubble → text +5 f → avatar → label/dots). Cards materialise by **colour + shadow growth, never by scale or move**.
6. **Annotate with a focus pull, don't overlay.** Push the camera ≈ 24 % about a pivot *above* the frame, blur the base plane to σ ≈ 6 px and dim ≈ 13 %, keep the focal object and callouts sharp. Callouts are **screen-space** and scale from a dot (0.018 → 1, 11 f).
7. **Reveal words, not characters** in callouts (2.6 f/word, irregular). Type per-character only for the chat reply (22 ms/char). No caret anywhere.
8. **Highlight chips wipe with `clip-path`, never `scaleX`.** Yellow = problem/emotion, cyan = action. Start 5 f apart in reading order.
9. **Layers converge from below and dock with no overshoot.** Stagger ≈ 5 f inside a group, ≈ 20 f between big plates. Tiers are 2×2 grids of half-size tiles that end coplanar; only Z moves. Total stack height ≈ 1.0 W.
10. **Dimetric first, near-isometric in passing.** Tilt with one ≈ 1.25 s ease-in-out tween (rotZ 0 → 44°, elevation 90 → 23°, +6 % push). Let the elevation creep up while the stack assembles; **finish asymmetric** (yaw 55°, elev 37°).
11. **Hold · move · hold · move · hold.** Camera moves are **orbit + dolly**, not 2D scale (azimuth +16°, elevation −8° while zooming ×2.2). Animate objects in the holds. Couple the **rack focus** to the second move (focal plane swaps; the two cross at σ ≈ 3).
12. **Modules come out of the platform as lids** (same colour as their quadrant), not as pop-ups: flatten outline → lift → glass walls fade in → contents grow from the floor, `cubic-bezier(0,0,.3,1)`, stagger 10–16 f.
13. **Labels are screen-space capsules**, constant size, never scaled by the camera. In stack scenes: 61 px, 1 px stroke, beside the tile. In platform scenes: **fade-only**, transparent fill, 11 f in / 1.8 s hold / 11 f out.
14. **Keep micro-loops running through holds** (typing dots 26.7 f, connector dash 8.67 f, lattice colour wave) so a hold never feels frozen.
15. **Hard cut flat → 3D, don't dissolve.** Re-render the first 3D frame to match the 2D last frame in *position*, not lighting (drop the grid and cast shadow, tint the card grey).

Full numbers, easing vocabulary and the corrections to the raw analysis: [references/motion-spec.md](references/motion-spec.md).

## Scaling to other aspect ratios

Express everything as multiples of **W** (card side, 843 px) and keep the camera target at the card/stack centre.

| Target | Do |
|---|---|
| 16:9 | native |
| 1:1 | scale the stage by `min(w/1920, h/1080)` and letterbox, or crop to the card ±0.6 W |
| 9:16 | card ≈ 60–70 % of width; extend the grid; stack total = card + 1.0 W; put side modules **above/below** instead of left/right; anchor callouts to the card edge (they overhang 0.21 W left / 0.15 W right), not the frame |
| any | pills clamp to the visible frame; keep shadow offsets in card units; keep grid/crosshair pitch constant in absolute units so a larger canvas simply shows more grid |

## Porting

- **Remotion:** `stage.js` already separates `render(frame)` from playback. Replace `Stage.mount` with `useCurrentFrame()` → `render(frame)` inside an `AbsoluteFill` sized 1920×1080, `fps = 24000/1001`. Compose the camera and layers as in the stage; the easing functions are plain `cubic-bezier` and port to `Easing.bezier`.
- **Three.js:** worth it when you need true per-plane depth of field or real perspective parallax (stage 04's far plane blurs on a separate layer in CSS, which is an approximation). Use an orthographic-ish camera (vFOV ≈ 7°, 9000 px lens) for the stack scenes; match the `CAM_KF` tables rather than trusting a model FOV.
- **Interactive mockup:** drive `render(f)` from scroll or a slider instead of the clock. Keep the stage deterministic; add hover on top without touching `render`.

## Pitfalls (each one cost real time)

- **A CSS `filter` on a `preserve-3d` element flattens the entire scene.** Blur a *flat wrapper*, never the 3D world itself.
- **Do not convert a "target shift" to a camera origin** when orbit angles change; solve the origin from measured vertices.
- **PSNR is the wrong judge for 3D.** Verify the camera by projecting known corners against measured corners (≤ 7 px), then judge the look by eye.
- **Overview frames from `ffmpeg -vf fps=4` are time-shifted** by the dropped first decodes. Time from raw frames (`select=eq(n\,N)`).
- **Translucent plates need explicit back-to-front DOM order.**
- **Use two exponential terms** for a docking plate; one will not fit the fast-then-long-tail shape.
- **Don't add camera motion in flat establishing shots**, and don't use a native `<input>` or caret for the typed reply.
- Video-range colour: the clips use `#fcfcfc` for white and `#000` text; matching exactly matters more than "clean" `#fff`.

## Status of the stages (read before relying on one)

- **01, 02, 03** are structurally matched to the footage. 03's panel scroll offsets are approximate (the model is right; individual line positions are off by tens of px).
- **02** layer final heights are ±0.05 W; the floor shadow is fainter and less stair-stepped than the clip; glass is slightly too opaque.
- **04** has the verified camera, hero platform position, rack focus and module structure (lid, four glass walls, cavity, contents). Module footprints were solved from the clip's lid bounding boxes (x within 1 px). Still approximate: the lattice fills only the lower part of its walls (the clip's stack is taller), the bars are four slabs where the clip has three thin bars plus a front pane, the data box texture is static (the clip's morphs on a ~60 f loop), the far-plane blur is not separate from the hero blur, and **how far the card and tier 2 lift out during move 1 is a guess** (the clip only shows them leaving the frame).

## Provenance

`references/analysis/clip-0N.md` — the five forensic reports (element inventory, frame-indexed timelines, composition, transitions,
visual language, recreation recipe, open questions). Start there to extend the skill to a new shot.
