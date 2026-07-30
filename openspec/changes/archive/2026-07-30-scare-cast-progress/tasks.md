## 1. Pure scare-cast rules

- [x] 1.1 Add typed scare-cast session state and pure helpers (start when affordable, tick progress + exposure, complete → idle + exposureRatio) under `src/game/`
- [x] 1.2 Enforce same-ability lockout while casting; allow switching to a different scare (cancel previous without resolve, then start new if eligible); mutual exclusion with Observe (starting one cancels the other without resolve)
- [x] 1.3 Add a shared `castDurationMs` used by all starting scare abilities
- [x] 1.4 Add Vitest coverage for out-of-range start, unaffordable rejection, progress out of range, exposure accumulate/pause, zero/partial/full complete signalling, same-scare lockout, and switch-scare cancel

## 2. Scene and HUD wiring

- [x] 2.1 Change `GameScene.useAbility` to start a scare cast instead of resolving immediately; apply energy/`resolveScare` only when cast completes with exposure
- [x] 2.2 Tick scare cast each frame with world-space ability range; continue progress out of range (no leave-range cancel); track exposure while in range
- [x] 2.3 Show Observe-like progress on the casting scare HTML button; block re-activation of that scare via HUD and keyboard without colour-only lockout
- [x] 2.4 Keep other scare buttons usable; wire switch-scare and Observe mutual exclusion per design

## 3. Validation and documentation

- [x] 3.1 Run `npm run check` and fix regressions
- [x] 3.2 Playtest cast progress, same-scare lockout, other-scare switch, out-of-range progress, resolve-on-complete with exposure, ineffective/high scare feedback unchanged after complete
- [x] 3.3 Update README controls to note scare cast progress and exposure (cast from anywhere; stay close to affect Nora)

## 4. World cast visuals (follow-up)

- [x] 4.1 Add a Ghost casting presentation (glow / face / marker — not colour alone) that turns on while a scare cast is in progress and clears on complete, switch-scare, or Observe cancel
- [x] 4.2 Add a mild Nora mid-cast reaction that shows only while a cast is active and the ghost remains in that ability’s range; clear immediately on leave-range / switch / Observe cancel; do not block the normal resolve reaction on complete
- [x] 4.3 Wire `GameScene` cast ticks to update ghost and Nora presentation each frame (or on state transitions) so visuals stay in sync with live range
- [x] 4.4 Playtest: casting ghost look, Nora mid-cast only in range, leave-range clears Nora cue without cancelling cast, resolve still uses existing reactions; update README if player-facing visuals need a short note
- [x] 4.5 Re-run `npm run check` after visual wiring

## 5. Exposure-based cast (range no longer required)

- [x] 5.1 Update pure scare-cast session: start when affordable (range not required); tick progress always; accumulate `exposureMs` while in range; remove leave-range cast cancel; expose `exposureRatio` on complete
- [x] 5.2 Add pure helper to scale scare fear/score by exposure (0 = miss, partial = scaled, 1 = full) while preserving fear-match category; observation bonus only when exposureRatio ≥ 0.5 and existing eligibility
- [x] 5.3 Rewrite Vitest for out-of-range start, progress out of range, exposure accumulate/pause, zero/partial/full complete signalling; remove leave-range-cancel expectations
- [x] 5.4 Update `GameScene`: allow cast start out of range; stop cancelling cast on leave-range; apply exposure-scaled resolve + friendly miss/partial/full messaging; keep Nora mid-cast range-gated and ghost casting for full cast
- [x] 5.5 Update README: casting works out of range; stay close to expose Nora; remove “cancel when out of range” cast wording
- [x] 5.6 Playtest miss / partial / full exposure, mid-cast Nora only in range, ghost casting out of range; run `npm run check`
- [x] 5.7 Zero-exposure complete skips resolve (no energy, fear, score, or Nora reaction); status explains fizzle
- [x] 5.8 Align proposal/design/tasks wording with skip-resolve zero-exposure model; add mid-cast leave-range status note
- [x] 5.9 Fix Nora mid-cast reaction when entering range mid-cast (do not block on resolve pause; clear mid-cast visuals on leave-range)

## 6. Cast movement slowdown while performing

- [x] 6.1 Add `MOVEMENT.ghostCastSpeedMultiplier` and pure `ghostTravelSpeed` helper with Vitest
- [x] 6.2 Apply cast slowdown in `Ghost.update` while casting presentation is active; restore full speed when cast ends, switches, or Observe cancels
- [x] 6.3 Update README and delta specs for intentional cast slowdown; run `npm run check`
- [x] 6.4 Tune `ghostCastSpeedMultiplier` to 0.25 (half of previous cast speed)
- [x] 6.5 Tune cast multiplier to 0.125 and add `ghostCastSpeedTransitionMs` with `tickGhostSpeedMultiplier` easing
- [x] 6.6 Wire Ghost speed multiplier tick; update specs/README; run `npm run check`
