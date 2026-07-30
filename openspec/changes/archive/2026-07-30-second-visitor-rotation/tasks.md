## 1. Visitor content and registry

- [x] 1.1 Add Milo typed fear/clue content (`id: milo`, primary fear `object`, medium `cold`, ineffective `whisper`, ≥3 useful clues across ≥2 categories, one personality-only clue)
- [x] 1.2 Add Milo visit route content (≥3 POIs, distinct pacing from Nora, spawn/entrance/exit, success stage)
- [x] 1.3 Add `VisitorDefinition` bundle type and typed `VISITOR_REGISTRY` for Nora and Milo
- [x] 1.4 Add pure deterministic rotation helpers (sequence Nora → Milo → Nora → Milo; lookup; advance on Next visit)

## 2. Session isolation and active visitor wiring

- [x] 2.1 Resolve active visitor from registry on boot (Nora first) and on Next visit
- [x] 2.2 Ensure session reset clears fear, presence/route progress, score, energy, novelty, clues, observation, bonus eligibility, casts, and temporary feedback before loading the next visitor
- [x] 2.3 Parameterise results, success detection, and gate/status builders to use active visitor display name and content
- [x] 2.4 Reconfigure NPC entity (fear profile, route, palette) from active visitor without permanent display-name branching in `GameScene`

## 3. Presentation and controls

- [x] 3.1 Update arrival cue, departure cue, Observe label/status, off-screen indicator, clue panel, and results to identify the active visitor
- [x] 3.2 Verify keyboard, mouse/pointer, and touch controls still start Observe/scares against the active targetable visitor only
- [x] 3.3 Ensure landscape-mobile cues/results remain readable with ≥44 CSS px Next visit

## 4. Tests and docs

- [x] 4.1 Add Vitest coverage for registry lookup, rotation order, active visitor selection, isolation (no Nora clue leak), route selection, visitor-specific success, results naming, and Next visit after both outcomes
- [x] 4.2 Update README for alternating visitors and Milo’s different strategy hint (without spoiling the solution bluntly if preferred — at least note two visitors rotate)
- [x] 4.3 Run `npm run check` and `npm run build`; fix regressions

## 5. Playtest and preview

- [x] 5.1 Playtest desktop + landscape mobile: Nora visit, Next visit → Milo, observe/scare both, success and unimpressed paths, no cross-visitor state leak
- [x] 5.2 Open/verify Azure Static Web Apps PR preview for acceptance review
