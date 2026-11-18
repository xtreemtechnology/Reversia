# Reversia lavender redesign — first pass

This pass establishes the new purple/lavender visual identity without changing navigation, data models, Firebase calls, or health-tracking logic.

## Updated
- Shared theme tokens now use lavender/purple, warm near-white surfaces, and dark plum text.
- Light mode is now the default to match the agreed reference direction.
- Dark mode now has its own distinct purple-toned palette instead of duplicating light mode.
- The introductory onboarding experience now uses a native Expo LinearGradient background and lavender accents.
- Existing hard-coded legacy brown/amber theme values across screens were migrated to the new palette for visual consistency.
- Status-bar text was adjusted for light surfaces; the purple-gradient onboarding keeps light status-bar content.

## Deliberately unchanged
- Existing routes and navigation structure.
- Authentication and profile persistence.
- Health logging, analytics, charts, and Firebase behavior.
- Existing illustrations/assets. No AI-generated assets were added.

## Validation
- `ThemeProvider.js` and `tokens.js` passed Node syntax checks.
- A full Expo lint/build check was not run because dependency installation (`npm ci`) timed out in this environment. Run `npm ci`, then `npm run lint` and `npx expo start` locally before shipping.
