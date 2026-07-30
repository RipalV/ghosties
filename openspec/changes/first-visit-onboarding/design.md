## Context

Ghosties has a complete two-visitor visit loop (registry, rotation, observe, scare-cast exposure, results, next visit) with pure domain modules under `src/game/`. Presentation lives in `GameHud` / DOM controls and `GameScene` coordination. New players aged 7+ still learn the loop mainly from the README; there is no in-game teach-through-play path.

This change adds guided first-visit onboarding and light contextual coaching as **pure, non-mutating** layers that observe gameplay events and drive presentation only.

## Goals / Non-Goals

**Goals:**

- Guided sequence on the first Nora visit of the browser session teaching move-near → Observe → review clue → choose scare → stay in range → exposure outcomes → results → next visit.
- Steps advance only from real gameplay events; invalid events do not advance.
- One short instruction at a time, HUD/visitor highlights, Skip help (≥44 CSS px), keyboard/mouse/touch, landscape-mobile safe areas — no modal blocking active play.
- Contextual hints after complete/skip for stuck patterns without revealing hidden fears or changing outcomes.
- Tutorial state separate from haunting-session, fear, clues, score, energy; session-scoped only (reload may reset).
- Pure TypeScript rules + typed copy; Phaser/DOM present only; reuse active-visitor abstractions.
- Spec/README cleanup so generic systems say active visitor, not Nora-only.

**Non-Goals:**

- New visitors, abilities, props, possession, rooms, saved tutorial progress, accounts, voice, achievements, multiplayer, monetisation.

## Decisions

### 1. Pure tutorial state machine

- **Decision:** Add `src/game/onboarding/` (or `tutorial/`) with typed steps, events, and a pure reducer: `createOnboardingState` → `reduceOnboarding(state, event) → { state, presentation }`. Events mirror gameplay (visitor targetable, entered observe range, observe completed, clue panel opened, scare cast started/resolved with exposure band, results shown, next visit, skip).
- **Why:** Keeps progression out of `GameScene`; deterministic Vitest coverage; matches architecture rules.
- **Alternatives considered:** Step flags inside `GameScene` — rejected (hard to test; Nora branching risk). Phaser timelines — rejected (not pure).

### 2. First-Nora session gate

- **Decision:** Full guided sequence starts only when `visitIndex === 0` / active visitor is Nora and `onboardingCompletedOrSkipped === false` for the browser tab session. Completing the final step or Skip sets a session flag so later Nora/Milo visits never re-run the full sequence. Milo may still evaluate contextual coaching.
- **Why:** Matches acceptance; uses existing rotation without new persistence.
- **Alternatives considered:** localStorage persistence — out of scope. Tutorial on every first-of-type visitor — rejected (acceptance: first Nora only).

### 3. Non-mutating contract

- **Decision:** Onboarding/coaching modules MUST NOT call fear, score, energy, route, cast, or discovery mutators. They only emit presentation intents (instruction text, highlight target id, hint id). Scene applies presentation; gameplay systems unchanged.
- **Why:** Acceptance criteria 3 and 10; regression tests assert identical fear/score/energy for the same scare sequence with tutorial on/off.
- **Alternatives considered:** Soften energy during tutorial — rejected (changes outcomes).

### 4. Presentation via HUD overlay, not modals

- **Decision:** Compact instruction chip/banner + optional highlight ring on Observe / clue / scare / visitor / results, plus persistent Skip help control. Reuse toast/chip language where practical. No full-screen modal during active haunting.
- **Why:** Freedom to experiment; mobile HUD already crowded.
- **Alternatives considered:** Blocking modal checklist — rejected by acceptance.

### 5. Typed tutorial content

- **Decision:** Store step copy, highlight targets, and coaching messages in typed content (parameterised with active visitor `displayName`). First-visit sequence ids are fixed; coaching keys are enums. No fear category names that spoil the solution.
- **Why:** Spec requires content outside scene; visitor-agnostic coaching for Milo.
- **Alternatives considered:** Hard-coded strings in GameScene — rejected.

### 6. Contextual coaching eligibility

- **Decision:** Pure `selectContextualHint(input)` after guided mode ends (or was skipped). Inputs: distance/in-range flags, observe-out-of-range attempt, discovered-but-unreviewed clues, zero-exposure resolve, repeated ineffective category count, route progress near end. Cooldown / one-shot per hint type per visit to avoid spam. Hints never name the visitor’s high fear category.
- **Why:** Testable eligibility without Phaser.
- **Alternatives considered:** Always-on tips during guided steps — rejected (noise); reveal fear after N fails — rejected (spoils investigation).

### 7. Cleanup hooks

- **Decision:** On departure start, results enter, Skip, and Next visit: clear active instruction/highlight presentation; keep session `completedOrSkipped` flag. Do not reset that flag on session reset between visits.
- **Why:** Prevents stale UI over results; isolation from haunting reset helpers.
- **Alternatives considered:** Clear completion flag on Next visit — rejected (would re-show full sequence).

### 8. Spec/README Nora cleanup

- **Decision:** In modified specs, rewrite generic requirement prose and scenarios that incorrectly assume Nora is always the active visitor (off-screen indicator, fear chip, scare exposure messaging, Observe labels). Keep Nora named only where the first tutorial visit or Nora-specific content is under test.
- **Why:** Proposal acceptance criterion 11.

## Risks / Trade-offs

- **[Risk] Guided steps race the visitor route** → Mitigation: do not pause route; keep instructions short; coaching covers “almost leaving.”
- **[Risk] Highlight clutter on short landscape HUD** → Mitigation: one highlight at a time; ≥44 CSS px Skip; playtest task.
- **[Risk] Soft spoilers in coaching** → Mitigation: ban high-fear category names in hint copy; review in content file.
- **[Risk] Event wiring gaps in GameScene** → Mitigation: explicit event map in design/tasks; unit tests for each transition.
- **[Risk] Players skip immediately** → Mitigation: contextual coaching still available; Skip is required for freedom.

## Migration Plan

1. Add pure onboarding + coaching modules and content.
2. Wire GameScene events → reducer; HUD presentation + Skip.
3. Gate first Nora visit; cleanup on departure/results/next/skip.
4. Spec/README Nora→active visitor cleanup.
5. Vitest + `npm run check` / `npm run build`.
6. Playtest + Azure SWA PR preview.

## Open Questions

- Exact short copy for each of the eight steps — lock friendly drafts in content; playtest may tweak wording only.
- Whether “review a discovered clue” requires opening the clue panel vs. seeing the toast reveal — prefer **opening/toggling the clue panel** so the control is taught.
- Whether zero-exposure must be experienced during guided steps or only taught via copy after any resolve — prefer advancing the exposure-understanding step after **any** completed cast resolve that reports full, partial, or zero, with coaching reinforcing zero later if needed.
