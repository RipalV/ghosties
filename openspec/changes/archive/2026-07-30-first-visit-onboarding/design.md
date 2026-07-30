## Context

Ghosties already has a two-visitor haunt loop and a partially implemented first-visit onboarding layer (`src/game/onboarding/`, OK/Skip prompt overlay in `DomHudControls`). Playtesting showed mid-play banner instructions were hard to follow. The product direction is: **short mischievous prompts** the player dismisses with **OK** (or **Skip help**), then they perform the taught action; the next prompt appears when that action succeeds.

## Goals / Non-Goals

**Goals:**

- Six guided prompts on the first Nora visit of the browser session:
  1. Welcome / game intro (before guest arrives)
  2. Guest arrival motive (aim for a high scare / fear climb)
  3. Move close + Observe (highlight Observe) when guest is targetable
  4. Open clues (highlight 🧩) when Observe unlocks a clue
  5. Choose a scare and stay close (highlight scare grid) after clues opened
  6. Repeat the loop after a successful scare
- Fun, mischievous, short copy that fits landscape mobile.
- Skip help ends the full sequence for the session; OK only dismisses the current prompt.
- Steps advance only from real gameplay events after the matching prompt was acknowledged (or after skip ends guidance).
- Non-mutating tutorial layer; pure rules + typed content; highlights on Observe / clues / scare grid.
- Contextual coaching after skip/complete for stuck patterns (no fear spoilers).

**Non-Goals:**

- Pausing Nora’s route timing permanently (prompts briefly pause simulation only while open).
- Teaching results / Next visit as dedicated guided steps (results UI already explains itself).
- Persistence across reloads; accounts; new visitors/abilities; fear spoiling.

## Decisions

### 1. Six-step prompt sequence (replaces eight-step banner)

- **Decision:** Steps = `welcome` → `guestMotive` → `moveNearObserve` → `reviewClues` → `chooseScareStayClose` → `repeatLoop`. Presentation = centered prompt with OK + Skip (≥44 CSS px). After OK, hide prompt and unlock controls; highlight the relevant control when useful.
- **Why:** Matches accepted playtest flow; mobile-readable; one tip at a time.
- **Alternatives considered:** Persistent banner — rejected (easy to ignore). Blocking checklist of all steps — rejected (overwhelming).

### 2. Welcome before guest; motive on arrival

- **Decision:** Fire `sessionStarted` / welcome when the lobby is ready (ghost controllable, no visitor yet). Fire `guestArriving` when the first Nora visit begins entering (or when visit cue shows). Advance to `moveNearObserve` when Nora becomes targetable (after motive was shown/acknowledged).
- **Why:** Introduces fantasy and goal before action pressure.
- **Alternatives considered:** Start only on targetable — rejected (misses welcome).

### 3. Combined observe and scare tips

- **Decision:** One prompt covers “get close + Observe”; one covers “pick scare + stay close while casting.” Advance observe→clues on `observeCompletedWithClue`; scare→repeat on successful scare (`scareCastResolved` with exposure that applies an outcome, i.e. not zero/miss).
- **Why:** Fewer interruptions; matches player language.
- **Alternatives considered:** Separate stay-in-range and exposure lessons — dropped for brevity.

### 4. Repeat loop ends guided mode

- **Decision:** After a successful scare, show the repeat prompt. OK (or Skip) marks guided onboarding finished for the session. Player may keep haunting freely; contextual coaching may still tip if stuck. Later visits never re-run the full sequence.
- **Why:** Teaches the loop without trapping the player in endless prompts.
- **Alternatives considered:** Re-queue observe prompt forever — rejected (spam).

### 5. Prompt acknowledgement vs progression

- **Decision:** `promptAcknowledged` only clears `presentationVisible`. Step id advances only on matching gameplay events (or visit lifecycle for welcome→motive→targetable). Invalid events do not advance.
- **Why:** Player must try the action; OK is not “next slide.”
- **Exception:** Welcome → guestMotive advances on guest arrival event (not a player action). Motive → moveNearObserve advances when visitor becomes targetable.

### 6. Copy tone and length

- **Decision:** Typed content strings, mischievous/comedic, ~1 short sentence each, parameterised by visitor `displayName` where needed. No high-fear category names.
- **Why:** Ages 7+; mobile banner width.

### 7. Non-mutating + first-Nora gate (unchanged intent)

- **Decision:** Onboarding never mutates fear/score/energy/route/cast maths. Full sequence only when `visitIndex === 0` / Nora and session not finished.
- **Why:** Existing acceptance criteria.

### 8. Longer visit pauses for first-session learning

- **Decision:** Increase default visit pacing margins (`REPOSITION_BUFFER_MS`, `COMFORT_MARGIN_MS`, and Milo overrides) for all visits. Add `FIRST_VISIT_COMFORT_BONUS_MS` on Nora’s **first session visit only** (`visitIndex === 0`) via `noraVisitForIndex` — ~87 s standard Nora/Milo visits, ~99 s first Nora visit.
- **Why:** Playtesting with OK/Skip prompts showed routes finished before new players finished the taught loop; the first visit needs the most breathing room.

## Risks / Trade-offs

- **[Risk] Nora walks while prompts are open** → Mitigation: keep copy short; player input locked while prompt open; **haunt simulation pauses** (visitor route, timers, observe/cast progress) until OK or Skip.
- **[Risk] “Successful scare” definition unclear** → Mitigation: define as cast resolve with applied exposure (not zero/miss); ineffective-but-exposed still counts as “landed” for teaching the loop.
- **[Risk] Player skips welcome** → Mitigation: Skip ends all guided help; coaching still available.
- **[Risk] Clue panel already open when observe completes** → Mitigation: if panel open, still require a toggle/open event or treat already-open as satisfying after acknowledge—prefer requiring an open/toggle so the control is taught.

## Migration Plan

1. Rewrite onboarding step ids, content, and reducer transitions.
2. Wire welcome at scene start; guest arriving; targetable; observe; clues; successful scare.
3. Align HUD highlights (observe / clues / scareGrid) with prompts.
4. Update Vitest + README; run `npm run check`.
5. Playtest mobile landscape.

## Open Questions

- Exact mischievous one-liners — draft in content; tweak in playtest only.
- Whether “successful scare” requires fear gain vs any exposed resolve — prefer **any exposed resolve** so first Whisper-ish attempts still teach the loop.
