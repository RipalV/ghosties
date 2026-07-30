## 1. Pure session and presence rules

- [x] 1.1 Add typed session phases (`locationReady` → `results`) and pure transition helpers under `src/game/session/`
- [x] 1.2 Add typed visitor presence (`offsite` | `entering` | `visiting` | `departing` | `departed`) kept separate from `FearStage`
- [x] 1.3 Add targetable gate helpers (Observe/scare allowed only while visiting / active haunting)
- [x] 1.4 Add success detection (default: fear stage `possessed`) and unimpressed route-complete departure triggers
- [x] 1.5 Add session reset helper (fear, score, energy, scare history, discovery, observation, scare cast, temporary feedback)
- [x] 1.6 Add pure `buildVisitResults` summary builder (outcome, stage, score, bonus, novelty/ineffective notes, clues, tip)
- [x] 1.7 Add Vitest coverage for phases, presence vs fear, targetable gate, success/unimpressed, reset, and results

## 2. Authored Nora visit route

- [x] 2.1 Add typed Nora visit content (spawn, entrance, ≥3 POIs with pauseMs, exit, success config) outside `GameScene` and separate from fear/clue defs
- [x] 2.2 Add pure route progression helpers (waypoint index, pause timers, enter → visiting, exit walk)
- [x] 2.3 Ensure route continues during scare casts while visiting
- [x] 2.4 Add Vitest for entrance→POIs→exit progression, pauses, and presence transitions

## 3. Scene and entity wiring

- [x] 3.1 Boot `GameScene` in location ready with resident ghost; Nora offsite until announce/enter
- [x] 3.2 Wire announce → enter → targetable active haunting; gate Observe and scare on targetable with friendly status copy
- [x] 3.3 Drive Nora movement from visit route content (replace/extend current in-lobby-only loop for visits)
- [x] 3.4 On departure: cancel observation and scare casts without energy/outcome; clear mid-cast visuals; keep clues for results
- [x] 3.5 Trigger departure on success mid-route or on route completion; walk to exit then results

## 4. Results and next visit UI

- [x] 4.1 Add mobile-friendly results overlay (haunted/unimpressed, stage, score, bonus, novelty/ineffective, clues, tip)
- [x] 4.2 Add ≥44 CSS px Next visit control; reset session and start a new visit without reload; ghost stays in hotel
- [x] 4.3 Ensure arrival, departure, and results cues work on landscape phones without colour-only state

## 5. Docs and validation

- [x] 5.1 Update README for visit flow (arrival, haunting, departure, results, next visit)
- [x] 5.2 Run `npm run check` and `npm run build`; fix regressions
- [ ] 5.3 Playtest desktop + landscape mobile: resident ghost, Nora enter/route/pauses, observe/scare, success and unimpressed paths, departure cancels, results, next visit
- [ ] 5.4 Open/verify Azure Static Web Apps PR preview for acceptance review
