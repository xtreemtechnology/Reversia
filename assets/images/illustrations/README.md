# Illustrations

Original flat-vector illustrations for Reversia — bold solid shapes,
smooth detailed curves, in the fresh theme's palette (soft sage green,
leaf green, deep green, white). They follow the flat-vector health-app
reference Daniel sent on 2026-11-20: subjects large and filling the
frame, illustration background matched to the surface it sits on.

They are original in-house artwork made for the app, so there is no
licence issue (unlike the food photos in `../foods/`, some of which are
blog-sourced and still need swapping before shipping).

This set replaces the first line-art watercolour set (2026-11-19).
Daniel rejected that set: the tall portraits left the subject small in
the frame with empty wash, and the sprout read as a cute cartoon. The
old files are superseded — their WebP sources remain in
`workspace/reversia-illustrations/line-art/` if ever needed.

## Files

| File | Used for | Background | Size |
| --- | --- | --- | --- |
| `welcome-hero.png` | Final onboarding slide ("Ready when you are") | Solid white (white card) | 1920 × 1280 landscape |
| `empty-meals.png` | "No meals logged yet" empty state (Repeat Meal) | Solid sage #E9F1E2 (exact — regenerated flat, then colour-matched) | 1920 × 1280 landscape |
| `empty-readings.png` | "Log your first glucose reading" empty state (Home chart) | Solid white (white card) | 1824 × 1376 landscape |
| `milestone-plant.png` | Reversal Plan milestones, once a milestone is reached | Solid white (white card) | 1824 × 1376 landscape |
| `guide-sprout.png` | Reversia Guide empty-chat companion, under the headline | Solid sage #E9F1E2 (exact — colour-matched) | 1824 × 1376 landscape |

## Format

All five are landscape, subjects filling the frame edge to edge — the
opposite of the old set. Display them with `resizeMode="contain"` at
their wired heights (170–260pt). The display boxes are all wider than
tall, so landscape art fills them instead of rendering as a thin strip.

Backgrounds are matched to their containers, exactly: white
(255, 255, 255) for the three white cards (hero, readings, milestone),
and the exact theme background `#E9F1E2` (233, 241, 226) for the two
sage screens (meals, sprout) — verified at all four corners of each
file, so the art merges with its background with no visible seam.

Colour-match notes: the generator cannot hit an exact hex — its first
flat attempt at `empty-meals` came out at (211, 227, 199) and the
sprout at (220, 230, 211). Both were fixed with PIL by replacing every
pixel within 12 per channel of the generated background colour with
exact (233, 241, 226). Spot-checked art pixels (fork, leaves, pot,
glass, stem, face) are unchanged; only background pixels moved.

## Onboarding art

Three more flat-vector illustrations in the same style, one per
onboarding slide (slides 1–3), all in white cards like the hero:

| File | Slide | Size |
| --- | --- | --- |
| `onboard-understand.png` | 01 — "Your body has a pattern." (person, glowing heart, pulse line, food/sleep/steps icons) | 1920 × 1200 landscape — regenerated 2026-11-20 (v2): both arms now complete, hands in frame |
| `onboard-local.png` | 02 — "Built for how you eat." (overhead spread of Nigerian foods) | 1920 × 1200 landscape, 1.15 MB — regenerated 2026-11-20 (v2): four large dishes with white space, nothing cut at the edges (was 1824 × 1376, 3.08 MB) |
| `onboard-reverse.png` | 03 — "Small shifts. Real change." (person climbing steps toward the sun, curve down from a red zone to a green zone) | 1920 × 1280 landscape — regenerated 2026-11-20 (v2): wide composition, woman large and central. Note: the red-to-green ribbon touches the top-left and bottom-right corners by design |

All three have solid white backgrounds (they sit in the same white
`heroCard` as `welcome-hero.png`).

## Setup flow art

Two more flat-vector figures for the stepped account-setup flow's
gender step (Figma kit screen 15), generated 2026-11-20 in the same
style and palette:

| File | Card | Size |
| --- | --- | --- |
| `gender-male.png` | Male — full-body man, leaf-green t-shirt with a leaf mark, deep green trousers | 1120 × 2240 portrait |
| `gender-female.png` | Female — full-body woman, ponytail, leaf-green top, deep green trousers | 1120 × 2240 portrait |

Both have solid white backgrounds and fill their 160 × 214 cards with
`resizeMode="contain"`. Unlike the landscape set, these two are
portraits — the figures are tall, so portrait fits the card shape.
