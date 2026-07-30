## Why

Ghosties now has a complete two-visitor gameplay loop (arrive → observe → clues → scare casts with exposure → depart → results → next visit), but a new player aged 7+ still needs to learn that loop without reading the README. The next priority is teach-through-play onboarding that advances only after real actions, plus light contextual coaching when the player gets stuck—without changing fear, score, energy, route timing, or success rules.

## What Changes

- Add a guided first-visit onboarding sequence during the first Nora visit of the current browser session that teaches: move near the visitor, Observe, review a clue, choose a scare from a clue, stay in range while casting, understand full/partial/zero exposure, read results, and start the next visit.
- Advance each onboarding step only after the corresponding gameplay action or outcome; never alter fear, score, energy, route timing, clue rules, cast rules, or success conditions.
- Present one short instruction at a time with HUD/visitor highlights (no modal blocking active play), Skip help (≥44 CSS px), keyboard/mouse/touch support, and landscape-mobile HUD/safe-area compatibility.
- After guided steps (or skip), show brief contextual hints for common stuck states (far away, Observe out of range, unreviewed clues, zero exposure, repeated ineffective scare, route nearly finished) without revealing hidden fears or pausing/altering outcomes.
- Limit full guided onboarding to the first Nora visit of the session; completing or skipping prevents re-showing the full sequence later in that session. Milo may still receive contextual hints. Session-only state (reload may reset); no persistence.
- Keep onboarding/coaching as typed pure TypeScript rules + typed content; Phaser/DOM only present and wire events. Reuse active-visitor abstractions; clean up on departure, results, skip, and next visit.
- Clean generic specs and README so systems refer to the active visitor rather than Nora-only wording, except scenarios that explicitly test the first tutorial visit.

## Capabilities

### New Capabilities
- `first-visit-onboarding`: Guided step sequence, step transitions from gameplay events, skip/complete lifecycle, session-scoped tutorial state separate from haunting/fear/clue state, and non-mutating teach-through-play rules.
- `contextual-coaching`: Eligibility and copy for brief post-onboarding hints (range, clues, exposure, repeated ineffective, route nearly done) that never reveal hidden fears or change outcomes.

### Modified Capabilities
- `mobile-gameplay-presentation`: Tutorial instruction UI, highlights, and Skip help must fit landscape mobile HUD/safe-area rules with ≥44 CSS px targets; generic “Nora” HUD wording should refer to the active visitor where appropriate.
- `playable-room`: Scene coordinates tutorial presentation and event wiring without hard-coding tutorial progression or Nora-only branches for coaching.
- `npc-observation`: Observation start/complete/out-of-range events feed onboarding steps and coaching without changing observation rules.
- `scare-cast`: Cast start, exposure progress, and resolve outcomes feed onboarding/coaching without changing cast or exposure rules.
- `haunting-session`: Tutorial cleanup on departure/results/next visit; first-Nora-only full sequence; next visit does not re-run guided onboarding in the same session.
- `visitor-registry`: Active visitor naming for tutorial copy; no Nora hard-coding in generic tutorial presentation beyond the first-visit gate.
- `core-gameplay`: Document that onboarding teaches the visit-bounded loop without mutating core rules.

## Impact

- New pure modules under `src/game/` for onboarding steps/transitions and coaching eligibility, plus typed tutorial copy content.
- HUD/DOM presentation for one-at-a-time instructions, highlights, Skip help, and contextual hint messages.
- `GameScene` wires gameplay events into pure tutorial reducers and cleans up on session transitions—no progression logic hard-coded in the scene.
- README and generic specs updated for active-visitor wording.
- Deterministic Vitest coverage for init, progression, invalid events, skip, complete, no full onboarding on Milo, hint eligibility, cleanup, and non-mutation of fear/score/energy.
- Azure Static Web Apps PR preview for acceptance review.
- No new visitors, abilities, rooms, persistence, accounts, voice, achievements, multiplayer, or monetisation.
