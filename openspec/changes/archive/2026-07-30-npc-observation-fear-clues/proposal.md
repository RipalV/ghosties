## Why

Scare selection currently feels like guessing: the player has little information before pressing an ability. Ghosties' core fantasy is a clever, mischievous ghost who watches people, notices funny details, and earns the perfect scare. An observation and fear-clue loop turns trial-and-error into playful investigation that stays understandable for ages 7+.

## What Changes

- Add an Observe interaction for nearby NPCs, started only via a keyboard shortcut or a dedicated HUD button (mouse and touch). Play-area pointer input remains movement-only; direct-NPC click-to-observe is out of scope and reserved for a future change.
- Require the ghost to stay in observation range for a short duration with clear progress feedback. Leaving range cancels in-progress observation progress; already discovered clues remain. This change does not include pause/resume.
- Reveal authored clues progressively (dialogue, body language, nearby objects, environmental reactions) without stating the hidden fear outright.
- Store fears and clues in typed, reusable NPC content definitions separate from Phaser.
- Keep observation progress, clue discovery state, and fear-matching / observation-bonus rules in pure domain modules.
- Record discovered clues and observation-bonus eligibility for the active haunting session; reset them when the haunting session is restarted or a new scene session begins (this change does not add a separate restart/new-round UI flow).
- Add a compact, mobile-friendly clue review panel that does not cover essential touch controls.
- On narrow/short landscape viewports, shrink HUD controls (objective, clues, Observe, scare grid, ghost card, zoom, fullscreen) toward a ≥44 CSS px floor so they obstruct less of the play area; keep larger sizes on spacious desktop viewports.
- Cap the clue panel height on short landscape viewports and allow scrolling with a clear “more below” cue so the panel never hides behind the bottom action cluster.
- Implement a complete Nora vertical slice: one primary fear matching an existing scare, at least three useful clues from at least two categories, one fair personality detail, and family-friendly reactions.
- Award a small observation bonus when a scare matching the hidden fear is used after relevant clues were discovered in the active session; observing itself costs no score or energy.
- Preserve existing scare abilities, scoring, energy, diminishing returns, failed-scare penalties, resistance, and success outcomes.
- Update README player controls and play notes for Observe and clue review (mandatory).
- Cover observation, cancellation, progressive discovery, matching, bonus eligibility, and session reset with deterministic unit tests; validate with `npm run check`, `npm run build`, and Azure PR preview review.

## Capabilities

### New Capabilities
- `npc-observation`: Nearby Observe interaction via keyboard and dedicated HUD control, range gating, timed progress, leave-range cancel rules (no pause/resume), and observation feedback contracts independent of rendering.
- `fear-clue-discovery`: Typed clue definitions and categories, progressive reveal without spoiling the primary fear, active-haunting-session discovery state, accessible clue text, compact review UI, and observation-bonus eligibility when a matching scare is used after discovery.

### Modified Capabilities
- `core-gameplay`: Extend the fear-discovery fantasy so observation and clues inform scare choice while existing fear profiles, outcomes, and child-safety constraints remain.
- `playable-room`: Scene coordinates Observe, clue presentation, and the observation bonus alongside existing scare feedback without embedding Nora-specific content in the scene.
- `mobile-gameplay-presentation`: Clue review UI and Observe HUD button fit the floating-chip HUD language and stay clear of essential scare and movement controls on landscape phones; HUD and clue-panel sizing respond to short/narrow landscape viewports without dropping below the ≥44 CSS px touch floor.

## Impact

- New pure modules under `src/game/` (observation rules, clue discovery / matching, typed NPC content).
- Nora content moves from hard-coded `Npc` fear arrays toward reusable definitions (profile + clues).
- `GameScene`, `GameHud`, and NPC presentation gain Observe keyboard + HUD button, progress feedback, and a clue panel; world pointer input stays reserved for movement.
- Vitest coverage for observation and clue rules; existing `FearEngine` behaviour preserved aside from an additive observation bonus path.
- README controls documentation must be updated.
- No multiplayer, persistence, new abilities, new NPCs beyond Nora's authored clues, monetisation, major visual redesign, or click-NPC-to-observe.
