## Why

The ghost already lives in the Crooked Moon Hotel and can observe, cast scares, and build fear on Nora, but the prototype has no complete visit structure. Without arrival, departure, results, and a clean next-visit restart, the hotel does not feel persistent and the haunting loop never begins or ends in a readable way for ages 7+.

## What Changes

- Add typed session phases: location ready → visitor announced → visitor entering → active haunting → visitor departing → results.
- Keep visitor **presence** (offsite / entering / visiting / departing / departed) separate from existing emotional **fear stages**.
- Author one Nora visit: enter from outside the playable lobby, follow at least three fixed-coordinate points of interest with short pauses, then exit when successfully haunted or when the route finishes unimpressed.
- Begin the active haunting session only when Nora becomes targetable at her entry point.
- On departure: cancel observation and active scare casts without spending energy or applying outcomes; keep discovered clues available until results are dismissed.
- Show a mobile-friendly results summary (outcome, fear stage, score, bonuses, clues, friendly feedback) with a touch-friendly **Next visit** action that resets session-scoped state without reloading the browser.
- Preserve existing movement, observation, clues, scare-cast exposure, fear, energy, scoring, novelty, HUD, and fixed world-coordinate ranges.
- Cover session, route, presence, reset, and results rules with deterministic Vitest tests; validate with `npm run check` and `npm run build`.

## Capabilities

### New Capabilities
- `haunting-session`: Session phases and transitions, success vs unimpressed departure, session-scoped reset, results calculation and presentation contracts, and next-visit restart while the ghost remains resident.
- `visitor-route`: Visitor presence states (separate from fear), authored Nora entrance / points of interest / pauses / exit, becoming targetable, and deterministic route progression during active haunting.

### Modified Capabilities
- `playable-room`: Scene coordinates arrival, route following, departure cancellations, results overlay, and next-visit restart alongside existing scare/observe systems without owning pure session rules.
- `core-gameplay`: The active haunting loop is bounded by visit start (targetable) and visit end (departure → results); child-safety and fear rules remain.
- `mobile-gameplay-presentation`: Arrival cue, departure feedback, results summary, and Next visit control remain readable and ≥44 CSS px on landscape phones.
- `npc-observation`: Observation cannot start during departure; in-progress observation is cancelled on departure.
- `scare-cast`: Active scare casts are cancelled on departure without energy spend or scare outcome.
- `fear-clue-discovery`: Discovered clues remain reviewable through results, then reset with the next visit.

## Impact

- New pure modules under `src/game/` for session phases, visitor presence, route progression, success detection, reset, and results.
- Nora visit route and success configuration as typed content separate from fear/clue definitions and from `GameScene`.
- `GameScene` / HUD gain arrival, departure, results, and next-visit coordination; ghost and hotel remain present between visits.
- Vitest coverage for phase transitions, presence vs fear, route/pause, reset, departure cancellations, and results.
- README player-facing notes for visit flow.
- No additional visitors, rooms, random routes, new abilities, multiplayer, accounts, achievements, or monetisation.
