## 1. Pure onboarding and coaching rules

- [x] 1.1 Add typed onboarding steps, events, and pure reducer (`createOnboardingState` / `reduceOnboarding`) covering the eight first-visit steps with advance-only-on-matching-event behaviour
- [x] 1.2 Add session gate helpers (first Nora visit only; complete/skip flag survives Next visit; no full sequence on Milo or later Nora visits in-session)
- [x] 1.3 Add pure contextual coaching eligibility/selection (far away, Observe out of range, unreviewed clues, zero exposure, repeated ineffective, route nearly done) without revealing high fear
- [x] 1.4 Add typed tutorial/coaching copy content parameterised by active visitor display name

## 2. Presentation and scene wiring

- [x] 2.1 Add HUD/DOM instruction chip, one-at-a-time highlight targets, and Skip help (≥44 CSS px) without blocking modals during active play
- [x] 2.2 Wire GameScene gameplay events into onboarding/coaching reducers; apply presentation intents only; no hard-coded step progression in the scene
- [x] 2.3 Clear tutorial presentation on departure, results, skip, and Next visit while preserving the session complete/skip flag across haunting-session reset
- [x] 2.4 Ensure keyboard, mouse/pointer, and touch still drive Observe/scares/movement; landscape mobile + safe-area fit for tutorial chrome

## 3. Spec and README cleanup

- [x] 3.1 Update README so Observe, scare exposure, off-screen indicator, and NPC counts refer to the active visitor / both visitors rather than Nora-only where generic
- [x] 3.2 Align any remaining generic in-game status strings that still assume Nora is always active (keep Nora naming for first-tutorial content)

## 4. Tests and validation

- [x] 4.1 Add Vitest coverage for onboarding init, step progression, invalid events, skip, complete, no full onboarding on Milo, coaching eligibility, zero-exposure coaching, cleanup, independence from fear/session state, and non-mutation of score/fear/energy
- [x] 4.2 Run `npm run check` and `npm run build`; fix regressions

## 5. Playtest and preview

- [ ] 5.1 Playtest desktop + landscape mobile: first Nora guided path, Skip path, later visits without full sequence, Milo contextual hints, keyboard/mouse/touch
- [ ] 5.2 Open/verify Azure Static Web Apps PR preview for acceptance review
