## Why

Scare casts currently require the ghost to be in range to start and cancel if the ghost steps away, which surfaces a “missed — move closer” message instead of letting the scare play out. Players expect the ghost to **perform** the scare anywhere (progress + casting animation), while Nora only reacts when she is in range — and her response should reflect **how long she was exposed** plus how that scare matches her fears.

While performing a scare, the ghost should move at roughly **one-eighth** normal speed — an intentional wind-up — easing smoothly back to full speed when the cast ends.

## What Changes

- Allow a scare cast to **start when affordable**, even if the ghost is out of range (no more hard “missed” block that prevents the cast).
- **Advance cast progress regardless of range**; leaving range no longer cancels the cast.
- Keep **ghost casting presentation** for the full cast duration (in or out of range).
- Keep **Nora mid-cast reaction only while in range** (still being affected); clear it when she leaves range without cancelling the cast.
- Track **exposure** during the cast (time the ghost spent in that ability’s range while casting).
- On cast complete, apply an outcome that depends on **exposure** and existing fear matching (high / medium / ineffective): zero exposure → fizzle with status only (no energy, fear, score, or Nora reaction); partial → scaled effect with clear feedback; full → normal resolve. Energy is spent only when Nora had some exposure.
- Update HUD/README copy: out-of-range no longer means “cannot cast”; stay close to expose Nora.
- Extend Vitest for exposure tracking, out-of-range start, progress out of range, and scaled complete outcomes.
- **Slow ghost movement to ~one-eighth `MOVEMENT.ghostSpeed` while casting**, with a smooth speed transition when casting starts or ends — no instant snap between slow and fast.

## Capabilities

### New Capabilities
- `scare-cast`: Timed scare cast session (start when affordable, progress independent of range, exposure tracking while in range, resolve on complete with exposure-scaled outcome), per-ability lockout for the casting scare only, progress feedback, world-space cast presentation for the ghost plus in-range Nora, and reduced ghost movement speed during cast.

### Modified Capabilities
- `playable-room`: Scene coordinates scare casts without leave-range cancel; applies exposure-aware resolve through reusable components; ghost movement slows while casting.
- `mobile-gameplay-presentation`: Scare buttons show cast progress out of range; world cast visuals remain readable.
- `core-gameplay`: Scare performing phase can run out of range; Nora’s response strength reflects exposure and fear matching; child-friendly feedback remains; ghost movement is deliberately slower during perform.

## Impact

- Pure scare-cast helpers gain `exposureMs` / exposure ratio; tick no longer cancels on leave-range.
- `GameScene` starts casts without requiring range; complete path scales or skips fear/score by exposure; messaging updated.
- Ghost casting visual unchanged in spirit (always while casting); Nora mid-cast still range-gated.
- Ghost entity eases `ghostCastSpeedMultiplier` (0.125) via `tickGhostSpeedMultiplier`; pure helpers + Vitest.
- Tests and README updated for the new model.
- No new abilities; FearEngine category matching stays; exposure scales the applied fear/score rather than inventing new fear maths formulas where possible.
