## Context

Ghosties already has a resident ghost in the Crooked Moon Hotel lobby with observation, clues, timed scare casts, exposure, fear stages, energy, scoring, and novelty. Nora currently loops a simple in-lobby path from scene start and becomes “haunting complete” when fear reaches `possessed`, but there is no visit lifecycle: no arrival, no departure, no results screen, and no next-visit reset that keeps the ghost and hotel present.

This change wraps the existing active haunting rules in a pure session + visitor-route layer. Phaser remains a coordinator.

## Goals / Non-Goals

**Goals:**

- Typed session phases from location-ready through results and next visit.
- Visitor presence separate from fear stages.
- One authored Nora visit (entrance → ≥3 POIs with pauses → exit).
- Active haunting starts only when Nora becomes targetable.
- Safe departure: cancel observe and scare casts without energy or outcomes.
- Mobile-friendly results + Next visit without page reload.
- Pure rules + Vitest; preserve existing gameplay systems.

**Non-Goals:**

- Extra visitors, simultaneous visitors, extra rooms, random routes.
- New scare abilities, major possession mechanics, multiplayer, accounts, saves, achievements, monetisation, major visual redesign.

## Decisions

### 1. Session phase machine as pure state

- **Decision:** `HauntingSession` holds `phase`: `locationReady` | `visitorAnnounced` | `visitorEntering` | `activeHaunting` | `visitorDeparting` | `results`. Transitions are pure functions driven by route/presence events and success checks.
- **Why:** Keeps GameScene thin and unit-testable.
- **Alternatives considered:** Encode phases only in Phaser scene flags — rejected (hard to test, mixes concerns).

### 2. Presence ≠ fear

- **Decision:** `VisitorPresence`: `offsite` | `entering` | `visiting` | `departing` | `departed`. Fear stages remain `FearStage` from FearEngine. Never merge into one enum.
- **Why:** A visitor can be visiting while calm, or departing while swoon/possessed.
- **Alternatives considered:** Single status enum — rejected (user requirement; conflates emotion with location).

### 3. Targetable gate

- **Decision:** Nora is targetable only in `visiting` (active haunting). Observe and scare start require targetable. While `locationReady` / announced / entering / departing / departed / results, controls show friendly “no active visitor” (or departure/results copy).
- **Why:** Matches “session begins when she reaches entry point.”
- **Alternatives considered:** Targetable during entering — rejected (player could scare off-screen arrival).

### 4. Authored Nora visit content

- **Decision:** Typed `NoraVisit` (or `VisitorVisitConfig`) separate from `NORA_CONTENT` fear/clues: spawn outside playable floor, entrance point (becomes targetable), ≥3 POI waypoints with pauseMs, exit point, success condition (default: fear stage ≥ `swoon` or fear ≥ configured threshold — prefer **fear stage reaches `possessed`** to match current “haunting complete”, or configurable `minFearStageForSuccess` defaulting to `swoon`/`possessed`). Store under `src/game/content/` or `src/game/session/` content module; replace/extend `NORA_ROUTE` in lobbyLayout for visit use.
- **Why:** Route data must stay out of GameScene and out of fear/clue defs.
- **Success default:** **`getFearStage(fear) === 'possessed'`** (fear ≥ 100) for successful haunted departure mid-route; else unimpressed when route completes. Document in open questions if playtest prefers `swoon`.
- **Alternatives considered:** Keep route only in lobbyLayout as today — rejected (needs entrance/exit/pauses/success metadata).

### 5. Route progression while casting

- **Decision:** During `activeHaunting` / `visiting`, Nora continues waypoint + pause progression even during scare casts (exposure still works). Departure path uses a short exit walk then `departed`.
- **Why:** Matches acceptance criteria and exposure model.
- **Alternatives considered:** Freeze Nora during cast — rejected (hurts exposure play).

### 6. Departure cancels

- **Decision:** On transition to `visitorDeparting`: `cancelObservation` and `cancelScareCast` (existing helpers). No energy spend, no `resolveScare`, no scare history update for cancelled casts. Clue discovery remains until results dismissed / next visit reset.
- **Why:** Safe teardown without punishing the player.
- **Alternatives considered:** Let cast finish on departure — rejected (visitor leaving mid-resolve is confusing).

### 7. Results summary

- **Decision:** Pure `buildVisitResults(sessionStats)` → visitor name, `haunted` | `unimpressed`, final fear stage, total score, observation-bonus total, novelty/ineffective notes (aggregated from session counters), clues discovered, short friendly tip. HUD/DOM overlay ≥44px Next visit; dismissible clue panel still usable until Next visit if already open.
- **Why:** Readable on landscape phones; no reload.
- **Alternatives considered:** Full-screen Phaser-only panel — prefer HTML overlay consistent with DomHudControls.

### 8. Session reset on next visit / becoming targetable

- **Decision:** When starting a new visit (announce→enter→targetable), reset: fear, session score, energy to starting value (100), scare history/novelty, discovery + observation bonus eligibility, observation session, scare cast, temporary reactions/status. Ghost position and hotel world persist. Between results and next visit, ghost remains controllable in `locationReady` (or brief ready after results).
- **Why:** Matches acceptance criteria; hotel feels persistent.
- **Alternatives considered:** Soft-reset only fear — rejected (novelty/clues would leak across visits).

### 9. Initial boot

- **Decision:** Scene create starts in `locationReady` with ghost at `GHOST_START`, Nora `offsite` (hidden or outside). Auto-advance after short delay to `visitorAnnounced` → `visitorEntering` for the vertical slice (or a “Bell rings…” cue then enter). No visitor targetable until entry point reached.
- **Why:** Ghost is resident before Nora arrives.
- **Alternatives considered:** Nora already mid-lobby at boot — rejected (breaks acceptance #1).

## Risks / Trade-offs

- **[Risk] Success only at possessed is hard for first playtest** → Mitigation: configurable `minFearStageForSuccess`; default possessed; playtest may lower to swoon.
- **[Risk] Route finishes before player learns the loop** → Mitigation: unhurried pauses; friendly unimpressed results with tips.
- **[Risk] Results UI blocks HUD** → Mitigation: overlay with scroll; Next visit ≥44px; landscape playtest.
- **[Risk] Departure cancel feels like a bug** → Mitigation: status copy: “Nora’s leaving — scare cancelled.”
- **[Risk] GameScene grows again** → Mitigation: pure session/route modules; scene only wires events.

## Migration Plan

1. Add pure session + presence + route + results modules and Nora visit content.
2. Wire GameScene: boot ready → announce → enter → active → depart → results → next visit.
3. Gate observe/scare on targetable; cancel on departure.
4. Results + Next visit HUD.
5. Tests + README + `npm run check` / `npm run build`.
6. Azure SWA PR preview for acceptance #15.

## Open Questions

- Successful-haunting threshold: locked default **`possessed`** for this change; revisit to `swoon` only if playtest finds possessed too hard for one short route.
- Auto-start first visit after a short location-ready beat vs requiring a “Ring the lobby bell” button: prefer **auto-announce after brief ready** for the vertical slice (button optional later).
