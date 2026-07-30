## Context

Scare cast UI, same-scare lockout, ghost casting visuals, and Nora mid-cast cues are implemented. Current rules still require range to **start** a cast and **cancel** the cast when leaving range, which blocks the “perform scare anywhere, expose Nora when close” fantasy. This revision replaces leave-range cancel with **exposure tracking** and exposure-scaled outcomes.

## Goals / Non-Goals

**Goals:**

- Start a scare cast when the ability is affordable, **with or without** being in range.
- Advance cast progress for the full shared duration even when out of range.
- Show ghost casting presentation for the whole cast.
- Show Nora mid-cast reaction only while in range; hide it when out of range without cancelling the cast.
- Accumulate exposure time while casting and in range; on complete, scale Nora’s scare outcome by exposure and keep fear-matching (high / medium / ineffective).
- Explain miss / partial / full outcomes in friendly status text.
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

### 2. Start without range; energy on complete

- **Decision:** `tryStartScareCast` requires affordable only (not in-range). Unaffordable → existing energy message, no cast. Out of range → cast still starts. Energy and scare application happen on complete (as today), with exposure gating how much effect applies.
- **Why:** Removes the hard “missed” start block; performing always costs energy when finished.
- **Alternatives considered:** Spend energy only if exposure > 0 — rejected as allowing free remote wind-ups; spend on start — rejected earlier.

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
- **Alternatives considered:** Binary in-range-at-complete-only — rejected (user asked for duration of exposure); three hard tiers only — softer continuous scale is clearer.

### 6. Nora mid-cast vs ghost casting

- **Decision:** Ghost casting visual for entire cast. Nora mid-cast reaction toggles with live in-range during cast; does not cancel cast when cleared.
- **Why:** Matches user intent.

### 7. Presentation / messaging

- **Decision:** Out-of-range activation uses cast-start status (“Casting… get closer to affect Nora”) instead of “missed”. Leave-range during cast may briefly note she’s out of the spooky zone without cancelling. Complete messaging distinguishes miss / partial / full.
- **Why:** Teach the new model.

## Risks / Trade-offs

- **[Risk] Players cast from across the room and waste energy** → Mitigation: clear status; zero-exposure miss still spends energy; teach with copy.
- **[Risk] Partial scaling feels opaque** → Mitigation: status text states partial catch and reduced effect.
- **[Risk] Observation bonus with tiny exposure feels unfair** → Mitigation: bonus only when exposureRatio ≥ 0.5 and other eligibility holds.
- **[Risk] Switching mid-cast discards exposure** → Mitigation: same as today (free cancel); toast explains switch.

## Migration Plan

1–4. Existing cast + visuals *(done under prior tasks)*.
5. Change pure session: drop leave-range cancel; add exposure; start without range.
6. Update GameScene start/tick/resolve paths and messaging.
7. Adjust tests; README; playtest miss / partial / full / mid-cast Nora.

## Open Questions

- Observation-bonus exposure floor: default **0.5** unless playtest prefers full exposure only.
- Whether zero-exposure complete should still play a soft ghost pulse (no Nora laugh) — default **yes**, subtle cast-complete pulse only.
