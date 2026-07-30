## Why

Ghosties now has a complete visit loop for one visitor, but that loop is still proven only with Nora. Adding a second authored visitor with a different fear profile, clues, route, and pacing proves the typed content architecture is reusable, adds replay variety, and forces players to investigate each guest rather than reuse one solution.

## What Changes

- Add one new family-friendly visitor with a unique id/name, different primary fear from Nora, optional secondary dislikes, ≥3 useful clues across ≥2 categories, one fair personality detail, distinct reactions, authored route (≥3 POIs) with different pacing, and a configured success condition — without new scare abilities.
- Add a typed visitor registry and deterministic visit sequence: Nora → new visitor → Nora → new visitor.
- Make **Next visit** advance the sequence and load that visitor’s content into arrival cue, objective, HUD, clue panel, results, off-screen indicator, and departure messaging.
- Enforce full session isolation between visits (fear, presence, route, score/energy, novelty, clues, observation, casts, temporary feedback) so no Nora data leaks into the other visitor’s session.
- Replace remaining Nora-specific scene branches with active-visitor abstractions where practical; keep pure rules Phaser-independent.
- Cover registry lookup, rotation, isolation, route/success/results per visitor, and next-visit after both outcomes with deterministic Vitest tests; validate with `npm run check` and `npm run build`.

## Capabilities

### New Capabilities
- `visitor-registry`: Typed visitor definitions registry, deterministic visit sequence, next-visitor selection, and active-visitor resolution for content-driven UI and rules.

### Modified Capabilities
- `visitor-route`: Route and presence progression select the active visitor’s authored visit config; support distinct pacing per visitor.
- `haunting-session`: Next visit advances the rotation; results and reset use the active visitor; session phases remain shared.
- `fear-clue-discovery`: Discovery and observation-bonus eligibility are scoped to the active visitor and cleared between visits.
- `npc-observation`: Observation and clue progression use the active visitor’s content, not Nora-hard-coded text.
- `playable-room`: Scene coordinates the active visitor without permanent visitor-name branching.
- `mobile-gameplay-presentation`: Arrival, departure, and results copy identify the active visitor on landscape phones.
- `core-gameplay`: Existing observe/scare/fear/score rules apply equally to both visitors during their visits.

## Impact

- New typed content module(s) for the second visitor (fear/clues + visit route) and a registry/rotation module under `src/game/`.
- Session, results, observation, and scene wiring read `activeVisitor` instead of Nora-only constants.
- HUD/results/cue strings parameterised by visitor display name and content.
- Vitest coverage for registry, rotation, isolation, and visitor-specific success/results.
- README player notes for alternating visitors.
- No random selection, simultaneous visitors, new abilities, rooms, multiplayer, persistence, or monetisation.
