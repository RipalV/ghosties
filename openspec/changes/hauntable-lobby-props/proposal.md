## Why

Ghosties now has a complete, teachable two-visitor haunt loop, but almost all interaction is ghost-to-visitor. The Crooked Moon Hotel still reads mostly as a backdrop. Hauntable lobby props and environmental scare combos let the hotel feel like the ghost’s home and reward players for anticipating visitor routes and matching an existing scare with the right prop — without new abilities, visitors, or rooms.

## What Changes

- Add three typed hauntable lobby props outside `GameScene`:
  - reception bell — Object Nudge
  - crooked portrait — Whisper
  - drafty fireplace or curtains — Cold Puff
- Each prop carries id, display name, fixed world position, compatible scare category, ghost activation radius, visitor reaction radius, visual reaction config, family-friendly visitor reaction text, and per-visit combo availability.
- When a compatible scare cast starts with the ghost in a prop’s activation radius, link that prop to the cast and show clear casting feedback while existing cast/exposure rules continue.
- On cast complete, award a small environmental-combo score bonus only when exposure is non-zero, scare matches the prop, the visitor is in the prop’s reaction radius, and that prop’s bonus has not already been awarded this visit.
- Combo bonuses affect score only — they do not change fear, matching, energy, exposure scaling, novelty, observation bonus, or success thresholds.
- Each prop awards its combo bonus at most once per visit; later activations may still animate.
- Adjust Nora and Milo waypoints slightly so each passes close enough to at least one useful prop; keep the existing route system.
- Active-visitor reaction text and presentation; no permanent Nora/Milo branching in `GameScene`.
- Prop state resets with the existing per-visit session reset.
- Readable prop cues (non-colour-only proximity, cast feedback, concise “Hotel trick!”-style bonus message) that work on landscape mobile.
- Optional contextual coaching hint after guided onboarding ends — no new guided Nora steps.
- Pure TypeScript rules + deterministic Vitest coverage; `npm run check` / `npm run build`.

## Capabilities

### New Capabilities
- `hauntable-lobby-props`: Typed prop definitions, cast linking, eligibility, once-per-visit combo bonus, presentation cues, and visit reset for environmental scare combos.

### Modified Capabilities
- `scare-cast`: Compatible casts may link a prop; resolve still uses existing exposure/fear rules; combo bonus is awarded separately after a valid resolve.
- `haunting-session`: Prop/combo session state resets with visit reset; departure clears active prop-cast presentation.
- `visitor-route`: Small authored waypoint adjustments so Nora and Milo pass useful props.
- `visitor-registry`: Active visitor supplies environmental reaction copy without scene-level visitor branching.
- `playable-room`: Scene coordinates prop presentation with cast and visitor; rules stay pure outside Phaser.
- `mobile-gameplay-presentation`: Prop proximity, cast, and combo feedback remain readable on landscape phones.
- `storybook-hotel-lobby-visuals`: Lobby props are visible storybook furniture with readable silhouette reactions.
- `contextual-coaching`: Optional post-guided hint for the first available prop combo (no new guided onboarding steps).
- `core-gameplay`: Expanded loop (observe → fear → anticipate route → prop → scare → funny environment) without changing core fear rules.

## Impact

- New content under `src/game/content/` (prop definitions) and pure rules under a focused domain folder (e.g. `src/game/props/` or `src/game/environment/`).
- `GameScene` wires cast start/complete, visitor position, and prop presentation; reusable prop presentation component.
- Minor Nora/Milo visit POI coordinate tweaks.
- HUD/status messaging for combo award; optional coaching hint id/copy.
- Vitest suite for eligibility, radii, once-per-visit bonus, reset, and non-mutation of scare outcomes.
- No new abilities, visitors, rooms, persistence, multiplayer, inventory, or monetisation.
