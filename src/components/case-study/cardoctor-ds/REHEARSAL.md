# Rehearsal: CarDS hero

Source: the case study's art (`cardoctor-ds-hero.webp`), a grid of CarDS components round a "CarDS 1.0" tile, recomposed
for CaseStudyHero's art band. Gold: `hero-grid` (one picture of mixed tiles) with `form-error` and `controls` for the
field and button states. Changed: one stage for the band, so one cursor can tour the system across tiles; the treatment
of the CarDoctor hero (#e0e0e0 ground, white tiles); the "CarDS 1.0" tile keeps the original artwork, cropped from it as
a background; every other tile is live UI in CarDS blue (#3e65fe) and Inter.

Beats (desktop, about 12s): type "David Smith" into Full Name; Service Now goes pending, then Booked; Remember me ticks;
the tabs move to Read; hold; everything returns to rest in one reverse stagger. Tablets and phones: the brand tile over
the field and button; type, book, hold, reset. Poster (reduced motion, and until the loading curtain lifts): every
component finished.

The page opts the hero into CaseStudyHero's `tallArt` band (600px on desktop, 476px elsewhere on the site), so the
grid has room and reads calm on first view. Designs, each drawn as tall as the band and centred: 1400 x 600 from
1280px (two rows, seven tiles: field, brand, buttons; tooltip, contact, tabs and menu, checkbox group); 860 x 412 from
640px; a 358 x 260 phone stage, 1:1 at 390.

Captured: stills at 390, 768, 1024, 1280 and 1440 (reduced motion); loops at 390, 1024 and 1440. Film `--gate` passes
at all three. At 1024 to 1279 the compact design sits in the middle of the 600px band with ground above and below. Notes left on purpose: `touching` for the required asterisk beside "Full Name"; `jump` for the value
growing as it is typed and the spinner turning; `steps in its box` from the hero band's entrance slide. The tooltip,
contact card and side menu run off their tiles by design (marked `data-crop`).

Not checked: Safari; 1920px and wider, where the 1400px design sits centred with ground either side.

# Rehearsal: CarDS order mockup (CarDSOrderArt)

Source: the Figma "DS-Mockup" frame (RyZAivKDXMz4gAgBM6XHuz, node 56:15638), CarDoctor's workshop dashboard built with
CarDS, replacing the static shot under "Approach & impact". Gold: `table-edit` (a value edited in place, then what it
feeds updates a beat later) with `linear` for the menu. Built at the product's own sizes (the frame's values divided by
its 1.0497 scale); the panel is the app's own surface, as the frame draws it, without window chrome.

Beats (about 11s): Maintenance's status opens and is marked Completed; Blinker repair's (its menu opening upward, so it
stays in frame) likewise; with every service complete the order stepper steps on to "Ready to complete"; hold; the
statuses return in one reverse stagger. Poster (reduced motion): every service completed, the order ready.

Designs: desktop 1600 x 914 (the band's 1.75 shape; the panel at 85% width, 44px below the top, running off the foot
under the services); tablets 760 x 820, the order, stepper and services only (no sidebar, assignees or notes); phones
their own 358 x 441 stage, the services and the order's state. The menus sit at the table's level, placed from their
pills' measured boxes.

Captured: stills at 390, 768 and 1440 (reduced motion); loops at 390, 768 and 1440. Film `--gate` passes at all three.
Notes left on purpose: `touching` for the avatar stacks' +N chips (they overlap as the frame draws them); `lopsided`
for the shorter "Completed" pill in its menu; `steps in its box` from fonts settling on load.

Not drawn: the frame's parts list and the sidebar's footer sit below the crop on desktop.
Not checked: Safari.

# Rehearsal: CarDS order board (CarDSBoardArt)

Source: the Figma "DS-Mockup 2" frame (RyZAivKDXMz4gAgBM6XHuz, node 57:9389), CarDoctor's "Current orders" board built
with CarDS, replacing the first wide shot under "Along with the Devs". Gold: `controls` (Slot: a card carried between
lists) with `freeform-drag` for the grab offset. Built at the product's own sizes (the frame's values divided by its
1.0514 scale); the panel is the app's own surface, without window chrome.

Beats (about 12s): "Assign mechanic" on Laura Palmer's card becomes the mechanic and the dates; Audrey Horne's card is
picked up off centre from In Progress (its place closing behind it) and carried to the top of Ready to Collect (a
dashed slot opening at the ready card's height); in the carry's last part it takes the ready look ("3 services",
"€200"), settles flat and swaps for the real card; hold; it fades back into In Progress and the assignment clears.
Poster (reduced motion): Laura assigned, Audrey ready to collect.

Designs: desktop 1600 x 910 (the band's 1.758 shape; the panel at 90% width, fading out at its foot over the lower,
filler cards); tablets 760 x 790, the last three columns without the sidebar, each showing only the cards that sit
whole in the frame; phones their own 358 x 660 stage, the Checked In column's first two cards. Chip lines are set per
card from measured widths, so they never wrap on their own.

Captured: stills at 390, 768 and 1440 (reduced motion); loops at 390, 768 and 1440. Film `--gate` passes at all three.

Not drawn: on desktop the sidebar's account row and the columns' last cards sit in the fade or below the crop.
Not checked: Safari.
