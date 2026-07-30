## 1. Pure prop content and combo rules

- [x] 1.1 Add typed lobby prop definitions (bell / Object Nudge, portrait / Whisper, fireplace-or-curtains / Cold Puff) with id, display name, world position, categories, radii, visual keys, reaction copy, and combo bonus constant outside `GameScene`
- [x] 1.2 Implement pure visit prop state: create/reset, select nearest compatible prop for cast start, link/clear link, evaluate combo award (exposure, compatibility, visitor radius, once-per-prop), mark awarded
- [x] 1.3 Ensure combo evaluation never mutates fear, energy, novelty, exposure classification, or discovery; score bonus is additive only

## 2. Scene wiring and presentation

- [x] 2.1 Add reusable prop presentation component (idle silhouette, proximity cue non-colour-only, casting feedback, resolve reaction)
- [x] 2.2 Wire `GameScene` cast start/complete/cancel, targetable gate, departure, and visit reset to pure prop helpers and presentation
- [x] 2.3 Show concise “Hotel trick!” (or content) status when combo awards; keep HUD clear of permanent prop labels

## 3. Visitor routes and coaching

- [x] 3.1 Adjust Nora and Milo POI waypoints/prop placement so each route enters at least one prop reaction radius during active haunting
- [x] 3.2 Add active-visitor reaction copy (no permanent Nora/Milo branching in `GameScene`)
- [x] 3.3 Add optional contextual coaching hint for first available prop combo after guided onboarding ends (no new guided steps)
- [x] 3.4 Update README with hotel-trick / prop combo player guidance

## 4. Tests and validation

- [x] 4.1 Add Vitest coverage: compatible selection, incompatible rejection, ghost activation radius, visitor reaction radius, zero-exposure rejection, successful bonus, once-per-prop, unchanged scare outcome, reset between visits, Nora/Milo isolation, not-targetable block, departure cancel
- [x] 4.2 Run `npm run check` and `npm run build`; fix regressions

## 5. Playtest and preview

- [ ] 5.1 Playtest desktop + landscape mobile: proximity cue, linked cast, combo award, once-per-prop, both visitors, reset on Next visit
- [ ] 5.2 Open/verify Azure Static Web Apps PR preview for acceptance review
