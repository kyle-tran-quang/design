# Rehearsal: CarDoctor hero art

Source: Figma "Hero" (RyZAivKDXMz4gAgBM6XHuz, node 40:340), three of the app's screens on #eee. Gold: `window-row`
(one height, one gap, the middle one is the story), with `phone-touch` for the taps and `loading` for rows resolving
from their skeleton. Changed: kit `Phone` (bare frame, so the Figma's frameless screens) instead of windows; each phone
is cropped at the part of its screen its beat happens in, since the 476px band is shorter than the Figma frame; the
neighbours are grey bars except where the story touches them (the provider card, the work rows, the total).

Beats (wide, about 12s): rest over the map; tap Northside Road Assist (indigo edge, its marker turns indigo and shows
its ETA); 00 rolls to 03 and the service total fades in rolling; tap "See what was done"; the three rows resolve top
to bottom, the note tints, 2.90M₫ rolls in and View receipt fills; hold; the record clears to its skeleton in one
reverse stagger and the pick is released; the figures fade, reset unseen, fade back (seam). Compact: the completion
phone alone, the figures roll, hold, the same unseen reset. Poster (reduced motion, and before the page's loading
curtain lifts): everything complete.

Widths: 1280 and up, the row at 1x (Figma sizes); 1024 to 1279, the row scaled to 0.8 so the side phones' real words
stay inside the narrower band (each crop starts higher, so the middle phone also shows "All done."); under 1024 the
compact design; under 374 the compact phone scales down to keep its side gutters.

Captured: stills at 320, 360, 375, 390, 768, 1024, 1280, 1440, 1920 (reduced motion); loops at 390, 1024 and 1440.
Film `--gate` passes at 390, 1024 and 1440. `near-empty frames` is the figures' Count strips hidden during the reset
fade, not a blank screen. `small text` at 390: the completion summary renders at 8.5px (the Figma sets it at 9.85px).

Not checked: the WebGPU shader in the completion header (headless Chromium here has no adapter, so the header showed
its indigo fallback); the Figma-hosted font files (the sandbox's Chromium rejects static.figma.com's certificate, so the
self-hosted Be Vietnam Pro stood in); Safari; real touch devices.
