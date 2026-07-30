## Context

Scare cast UI, same-scare lockout, ghost casting visuals, and Nora mid-cast cues were already in place under an earlier leave-range-cancel model. This change replaces that with **exposure tracking** and exposure-scaled outcomes so the ghost can perform a scare anywhere while Nora is only affected when close.

## Goals / Non-Goals

**Goals:**

- Start a scare cast when the ability is affordable, **with or without** being in range.
- Advance cast progress for the full shared duration even when out of range.
- Show ghost casting presentation for the whole cast.
- Show Nora mid-cast reaction only while in range; hide it when out of range without cancelling the cast.
- Accumulate exposure time while casting and in range; on complete, scale Nora’s scare outcome by exposure and keep fear-matching (high / medium / ineffective).
- Explain miss / partial / full outcomes in friendly status text.
- Slow ghost movement to ~one-eighth normal speed while performing a scare cast, with smooth speed transitions when casting starts or ends.
- Unit-test new rules; update README; playtest.

**Non-Goals:**

- Per-ability cast durations (still shared).
- Global lock on all scares while one casts.
- Changing Observe / clue panel / mobile HUD sizes.
- Rewriting FearEngine category math (scale applied fear/score after `resolveScare`, or equivalent pure helper).
- Multiplayer or new abilities.

## Decisions

### 1. Pure cast session with exposure

- **Decision:** `ScareCastSession` includes `status`, `abilityId`, `progress` (0–1), and `exposureMs` (time in range while casting). Tick always advances progress; when `inRange`, also add to `exposureMs` (capped by duration). Complete when progress ≥ 1; return idle session plus `exposureRatio = min(1, exposureMs / durationMs)`.
- **Why:** Separates “performing” from “affecting Nora”.
- **Alternatives considered:** Pause progress out of range — rejected (user wants progress anywhere); cancel on leave-range — previous model, rejected.

### 2. Start without range; energy only when exposed

- **Decision:** `tryStartScareCast` requires affordable only (not in-range). Unaffordable → existing energy message, no cast. Out of range → cast still starts. On complete, energy and scare application run **only when `exposureRatio > 0`**; zero exposure skips resolve (no energy, fear, score, Nora reaction, or scare history).
- **Why:** Removes the hard “missed” start block; remote wind-ups teach range without punishing with a fake Nora reaction or wasted energy.
- **Alternatives considered:** Always spend energy on finished cast even at zero exposure — rejected after playtest (felt unfair and prompted a false Nora reaction); spend on start — rejected earlier.

### 3. Same-scare lockout; switch; Observe mutual exclusion

- **Decision:** Unchanged: same ability blocked mid-cast; switching cancels previous without resolve (exposure discarded); Observe cancels scare cast and vice versa.
- **Why:** Still one readable progress meter.

### 4. Shared cast duration

- **Decision:** Keep `SCARE_CAST_DURATION_MS` (~1500) for all three.
- **Why:** Unchanged.

### 5. Exposure-scaled outcome on complete

- **Decision:** On complete, compute `exposureRatio`. If zero, skip resolve entirely (no energy, fear, score, Nora reaction, or scare history). Otherwise call existing `resolveScare` for category matching, then apply a pure scaler:
  - `exposureRatio <= 0`: no resolve — friendly status only (“fizzled — Nora was never in range”).
  - `0 < exposureRatio < 1`: multiply `fearGained` and scare `scoreDelta` by `exposureRatio` (round sensibly); keep strength label for messaging (“partly caught”); observation bonus only if exposure is “enough” (e.g. ≥ 0.5) **and** existing bonus eligibility — default **≥ 0.5**.
  - `exposureRatio >= 1`: full `resolveScare` application as today (including observation bonus rules).
- **Why:** “How long exposed” + “how scare affects them” (category match) without new fear tables.
- **Alternatives considered:** Binary in-range-at-complete-only — rejected (user asked for duration of exposure); three hard tiers only — softer continuous scale is clearer; always spend energy on zero exposure — rejected (see Decision 2).

### 6. Nora mid-cast vs ghost casting

- **Decision:** Ghost casting visual for entire cast. Nora mid-cast reaction toggles with live in-range during cast; does not cancel cast when cleared.
- **Why:** Matches user intent.

### 7. Presentation / messaging

- **Decision:** Out-of-range activation uses cast-start status (“Casting… get closer to affect Nora”) instead of “missed”. Leaving range mid-cast briefly notes Nora left the spooky zone without cancelling. Entering range mid-cast shows Nora’s mid-cast cue and a brief “in the spooky zone” status. Complete messaging distinguishes fizzle (zero exposure) / partial / full.
- **Why:** Teach the new model.
- **Zero-exposure presentation:** No ghost pulse and no Nora resolve reaction — status text only.

### 8. Cast movement slowdown while performing

- **Decision:** While a scare cast is active, ghost world travel speed SHALL ease toward `MOVEMENT.ghostSpeed * MOVEMENT.ghostCastSpeedMultiplier` (default multiplier **0.125**, i.e. one-eighth normal speed). When the cast ends, is switched, or is cancelled by Observe, speed SHALL ease back to full `ghostSpeed` over `MOVEMENT.ghostCastSpeedTransitionMs` (default **450 ms**) rather than snapping instantly. Casting presentation (face, marker, alpha) remains unchanged.
- **Why:** Performing a scare is a deliberate wind-up — very slow movement adds tension and makes exposure positioning more interesting. Smooth transitions avoid a jarring slow→fast snap when the cast finishes.
- **Implementation:** Pure `tickGhostSpeedMultiplier` + `ghostTravelSpeed` helpers; `Ghost.update` ticks multiplier each frame from casting presentation state. Tuning lives in `lobbyLayout`.
- **Alternatives considered:** Full speed while casting — rejected; instant speed snap — rejected (user asked for transition); fixed absolute cast speed — rejected (multiplier keeps tuning simple).

## Risks / Trade-offs

- **[Risk] Players cast from across the room with no effect** → Mitigation: clear cast-start and fizzle status; zero exposure spends no energy so remote practice is free; teach with copy.
- **[Risk] Partial scaling feels opaque** → Mitigation: status text states partial catch and reduced effect.
- **[Risk] Observation bonus with tiny exposure feels unfair** → Mitigation: bonus only when exposureRatio ≥ 0.5 and other eligibility holds.
- **[Risk] Switching mid-cast discards exposure** → Mitigation: same as today (free cancel); toast explains switch.
- **[Risk] Cast slowdown frustrates closing range in time** → Mitigation: cast can start out of range; exposure accumulates only while in range; player can plan approach before casting or switch scares.

## Migration Plan

1–4. Existing cast + visuals *(done under prior tasks)*.
5. Change pure session: drop leave-range cancel; add exposure; start without range.
6. Update GameScene start/tick/resolve paths and messaging.
7. Adjust tests; README; playtest miss / partial / full / mid-cast Nora.
8. Apply intentional cast movement slowdown; playtest cast + exposure positioning.

## Open Questions

- Observation-bonus exposure floor: locked at **0.5** for this change (revisit only if playtest prefers full exposure only).
- Zero-exposure soft ghost pulse: **no** — skip resolve entirely (Decision 5 / Decision 7).
- Cast movement multiplier: locked at **0.125**; transition duration at **450 ms** (revisit only if playtest prefers different values).
