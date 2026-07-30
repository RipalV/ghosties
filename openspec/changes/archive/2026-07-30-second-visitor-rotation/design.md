## Context

Ghosties has a complete haunting visit loop (location ready → announce → enter → active haunting → depart → results → next visit) proven only with Nora. Fear profiles, clues, and visit routes already live in typed content (`NORA_CONTENT`, `NORA_VISIT`), but `GameScene`, HUD copy, gate messages, and the NPC entity still assume Nora by name and constant.

This change introduces one second visitor and a deterministic rotation so session, observation, scare, and results systems load **active visitor** content instead of Nora-only constants.

## Goals / Non-Goals

**Goals:**

- One new visitor with distinct id, name, primary fear (≠ Nora’s Whisper), clues, reactions, route (≥3 POIs), and pacing.
- Typed visitor registry + deterministic sequence Nora → new → Nora → new.
- Next visit advances the sequence; all player-facing copy uses the active visitor.
- Full session isolation between visits; ghost and hotel persist.
- Active-visitor abstractions in scene/HUD; pure registry/rotation/isolation tests.
- Preserve existing observe/cast/exposure/fear/score/energy/novelty rules and controls.

**Non-Goals:**

- More than one new visitor; simultaneous visitors; random selection.
- New scare abilities, rooms, procedural content, multiplayer, persistence, achievements, monetisation, content editors.

## Decisions

### 1. Second visitor identity: Milo (object primary)

- **Decision:** Add visitor **Milo** (`id: 'milo'`). Primary fear **`object`** (Object Nudge). Medium: **`cold`**. Ineffective: **`whisper`**. Personality: chatty / fidgety guest who steadies chairs nervously but laughs off soft voices.
- **Why:** Maximises strategic contrast with Nora (Whisper high / Object ineffective). Players who “solved” Nora must re-investigate.
- **Alternatives considered:** Cold-primary Bea — also valid; Object contrast is stronger for teaching investigation.

### 2. Unified visitor definition bundle

- **Decision:** Introduce `VisitorDefinition` (or equivalent) bundling `NpcContent` + `VisitorVisitConfig` (+ optional palette/reaction copy keys). Register Nora and Milo in a typed `VISITOR_REGISTRY`. Keep fear/clue and route files separate per visitor (`milo.ts`, `miloVisit.ts`) mirroring Nora.
- **Why:** Scene resolves one `activeVisitorId` → full content; no GameScene hard-coding.
- **Alternatives considered:** Single mega-file for all visitors — rejected (harder review; Nora/Milo stay independently authorable).

### 3. Deterministic rotation as pure state

- **Decision:** Pure module holds `visitIndex` / sequence `['nora', 'milo']` with `getVisitorIdForVisit(index)` and `advanceVisitIndex`. First boot uses index 0 (Nora). **Next visit** increments index (wrap or unbounded with modulo). No randomness.
- **Why:** Deterministic tests and predictable playtest; matches acceptance criteria.
- **Alternatives considered:** Random pick — rejected (non-goal). Weighted schedule — deferred.

### 4. Active visitor drives all presentation

- **Decision:** Parameterise status/cue/results/observe labels/off-screen indicator with `displayName` and visitor-specific reaction strings where already content-driven. Gate messages use active name (“{name} is on her/his way”) via simple templates or authored cue strings on the definition.
- **Why:** Acceptance requires no Nora leakage in UI.
- **Alternatives considered:** Keep Nora strings until content exists — rejected (fails acceptance).

### 5. NPC entity becomes visitor-swappable

- **Decision:** On next visit / visit start, reconfigure or recreate the NPC entity from active visitor content (fear profile, visual palette tint, route). Prefer `applyVisitor(definition)` / `resetForVisit(config)` over permanent Nora fields. One active NPC instance at a time.
- **Why:** Avoids Nora-name branching in GameScene; supports isolation.
- **Alternatives considered:** Two always-present sprites — rejected (simultaneous visitors out of scope).

### 6. Session isolation unchanged in shape, keyed by visit

- **Decision:** Reuse existing `createSessionReset` / reset helpers; additionally clear discovery keys and ensure clue IDs are visitor-prefixed so UI never mixes lists. Load new visit config + content when announcing the next visitor.
- **Why:** Existing reset already covers fear/score/energy/novelty/casts; registry switch must happen before targetable.
- **Alternatives considered:** Persist clues across visitors for a “dossier” — rejected (acceptance: no leak).

### 7. Milo route pacing

- **Decision:** Distinct POI set and pause lengths from Nora (e.g. shorter pauses ~7–9 s or longer travel with different waypoint order) while still allowing observe + scare opportunities. Reuse `visitTiming` maths with Milo’s observation duration.
- **Why:** Acceptance requires noticeably different pacing.
- **Alternatives considered:** Clone Nora route with different name — rejected (does not prove route content).

### 8. Success condition

- **Decision:** Default Milo success to same `successMinFearStage: 'possessed'` unless playtest later lowers it; keep per-visit config so thresholds can differ later without code change.
- **Why:** Consistent with Nora vertical slice; isolation of success detection is what we need to prove.
- **Alternatives considered:** Swoon for Milo only — optional later; not required for this change.

## Risks / Trade-offs

- **[Risk] GameScene still has Nora string leftovers** → Mitigation: grep for `Nora`/`NORA_` in scene/HUD/gates; parameterise or move to content; Vitest for cue/results builders.
- **[Risk] Visual palette still “Nora pink” for Milo** → Mitigation: visitor palette on definition; distinct silhouette colours without new art pipeline.
- **[Risk] Milo too hard/easy vs Nora** → Mitigation: same success stage; tune pauses; playtest task.
- **[Risk] Pronoun/copy awkwardness (“her way” for Milo)** → Mitigation: authored cue strings per visitor rather than gendered templates.
- **[Risk] Scope creep into content editor** → Mitigation: two hand-authored files only.

## Migration Plan

1. Add Milo content + visit route; introduce registry + rotation pure module.
2. Wire GameScene to resolve active visitor on boot and Next visit; reset + load content.
3. Parameterise HUD/cues/results/gates/indicator.
4. Soften NPC entity to accept visitor definition.
5. Tests + README + `npm run check` / `npm run build`.
6. Azure SWA PR preview for acceptance.

## Open Questions

- Exact Milo display copy and POI coordinates — lock friendly draft in implementation; playtest may tweak pauses.
- Whether Observe button aria/label should say “Observe {name}” vs generic “Observe” — prefer **“Observe {name}”** for clarity on mobile.
