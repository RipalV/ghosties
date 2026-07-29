## Why

Scare selection currently feels like guessing: the player has little information before pressing an ability. Ghosties' core fantasy is a clever, mischievous ghost who watches people, notices funny details, and earns the perfect scare. An observation and fear-clue loop turns trial-and-error into playful investigation that stays understandable for ages 7+.

## What Changes

- Add an Observe interaction for nearby NPCs, usable with keyboard, mouse, and touch.
- Require the ghost to stay in observation range for a short, progress-feedback duration; cancel or pause when the player leaves range.
- Reveal authored clues progressively (dialogue, body language, nearby objects, environmental reactions) without stating the hidden fear outright.
- Store fears and clues in typed, reusable NPC content definitions separate from Phaser.
- Keep observation progress, clue discovery state, and fear-matching / observation-bonus rules in pure domain modules.
- Add a compact, mobile-friendly clue review panel that does not cover essential touch controls.
- Implement a complete Nora vertical slice: one primary fear matching an existing scare, at least three useful clues from at least two categories, one fair personality detail, and family-friendly reactions.
- Award a small observation bonus when a scare matching the hidden fear is used after relevant clues were discovered; observing itself costs no score or energy.
- Preserve existing scare abilities, scoring, energy, diminishing returns, failed-scare penalties, resistance, and success outcomes.
- Cover observation, interruption, progressive discovery, matching, bonus eligibility, and round reset with deterministic unit tests; validate with `npm run check`, `npm run build`, and Azure PR preview review.

## Capabilities

### New Capabilities
- `npc-observation`: Nearby Observe interaction, range gating, timed progress, interrupt/cancel rules, and observation feedback contracts independent of rendering.
- `fear-clue-discovery`: Typed clue definitions and categories, progressive reveal without spoiling the primary fear, round discovery state, accessible clue text, compact review UI, and observation-bonus eligibility when a matching scare is used after discovery.

### Modified Capabilities
- `core-gameplay`: Extend the fear-discovery fantasy so observation and clues inform scare choice while existing fear profiles, outcomes, and child-safety constraints remain.
- `playable-room`: Scene coordinates Observe, clue presentation, and the observation bonus alongside existing scare feedback without embedding Nora-specific content in the scene.
- `mobile-gameplay-presentation`: Clue review UI fits the floating-chip HUD language and stays clear of essential scare and movement controls on landscape phones.

## Impact

- New pure modules under `src/game/` (observation rules, clue discovery / matching, typed NPC content).
- Nora content moves from hard-coded `Npc` fear arrays toward reusable definitions (profile + clues).
- `GameScene`, `GameHud`, and NPC presentation gain Observe controls, progress feedback, and a clue panel.
- Vitest coverage for observation and clue rules; existing `FearEngine` behaviour preserved aside from an additive observation bonus path.
- No multiplayer, persistence, new abilities, new NPCs beyond Nora's authored clues, monetisation, or major visual redesign.
