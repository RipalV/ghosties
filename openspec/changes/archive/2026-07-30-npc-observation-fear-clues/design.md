## Context

The vertical slice already has three scare abilities, Nora with a typed fear profile (Whisper high, Cold medium, Object ineffective), pure `FearEngine` scoring, and a mobile floating HUD. Play-area pointer input already means “move the ghost.” Scare choice is still poorly informed: the player mostly learns by spending energy. This change adds the intended observe → clue → infer → scare loop without rewriting fear maths, energy, novelty, or the lobby presentation, and without competing with tap-to-move.

## Goals / Non-Goals

**Goals:**

- Add a reusable Observe interaction gated by world-space range, started only from a keyboard shortcut or a dedicated HUD button (mouse/touch).
- Cancel in-progress observation when the ghost leaves range; keep already discovered clues; do not implement pause/resume.
- Author typed NPC fear + clue content; ship a complete Nora slice demonstrating progressive, multi-category clues.
- Keep observation, discovery state, and observation-bonus rules pure and unit-tested, separate from Phaser.
- Scope discovery and bonus eligibility to the active haunting session; reset when that session is restarted or a new scene session begins.
- Present discovered clues in a compact review panel that fits the existing floating HUD and stays clear of scare/move controls.
- Preserve existing scare outcomes; add only a small, optional observation bonus when a matching scare follows discovery.
- Document Observe and clue review in the README (mandatory).
- Keep tone family-friendly, funny, and mildly spooky.

**Non-Goals:**

- World-space / play-area pointer activation of Observe (would conflict with tap-to-move).
- Direct-NPC click-to-observe (optional future follow-up, not this change).
- Pause/resume of an in-progress observation meter.
- A new restart / “new round” player flow beyond existing scene/session lifecycle reset semantics.
- Extra NPCs, levels, abilities, multiplayer, accounts, persistence, cloud APIs, voice, procedural/AI dialogue, monetisation.
- Major lobby or HUD redesign beyond the clue panel and Observe HUD affordance.
- Making observation mandatory for scoring success.
- Changing Ghosties lore (ghosts remain Boo Realm creatures, not dead humans).

## Decisions

### 1. Pure observation session + discovery store

- **Decision:** Implement observation as a pure state machine with persisted statuses `idle` | `observing`. Leaving range or finishing a pass returns to `idle` with in-progress progress cleared (cancel is a transition, not a stored status). Clue unlocks happen when progress crosses authored thresholds while observing. Pair this with a discovery store scoped to the **active haunting session** that records clue IDs already revealed and whether the observation bonus has been granted. Phaser only starts/stops sessions and plays feedback.
- **Why:** Matches project architecture, enables deterministic tests, and keeps discovery serialisable later without shipping persistence now.
- **Reset boundary:** Discovery state and observation-bonus eligibility reset when the haunting session is restarted or a new scene session begins. This change does not add a dedicated restart UI; reset hooks into whatever session/scene recreate path already exists (and any future restart that recreates that session).
- **Alternatives considered:** Embedding timers and clue lists in `GameScene` — rejected as hard to test and Nora-specific; “round-scoped” wording without a round system — rejected as ambiguous.

### 2. Typed NPC content definitions, Nora as data

- **Decision:** Introduce readonly NPC content modules (e.g. under `src/game/content/`) carrying fear profile, primary fear category, optional secondary dislikes, ordered clue definitions (id, category, accessible text, optional personality flag, reveal condition), and observation tuning (range, duration). `Npc` presentation and `GameScene` consume Nora's definition rather than owning clue strings.
- **Why:** Proposal requires reusable definitions and forbids Nora logic living permanently in the scene; future NPCs become new data files.
- **Alternatives considered:** Extending `FearProfile` alone — insufficient for clues; hard-coding Nora dialogue in entity constructors — rejected as non-reusable.

### 3. Progressive reveal without spoiling the primary fear

- **Decision:** Clues unlock one-at-a-time as observation progress crosses authored thresholds. No clue text states “afraid of Whisper/Cold/Object” by name. The primary fear remains hidden until the player infers it; an explicit “fear revealed” UI is out of scope for this slice. A single personality detail may colour Nora without pointing at the wrong scare as if it were the answer.
- **Why:** Matches acceptance criteria and the investigation fantasy; keeps the loop readable for 7+.
- **Alternatives considered:** Unlocking the fear label after three clues — deferred; random clue order — rejected for Nora's authored demo sequence.

### 4. Observe input: keyboard + dedicated HUD only

- **Decision:** Expose Observe via a keyboard shortcut (e.g. `O` or `4`) and a dedicated HUD button near the ghost card / action cluster, sized for at least 44 CSS px, usable with mouse and touch. **Do not** bind Observe to play-area pointer presses; those remain tap-to-move. Direct click/tap on the NPC to observe is explicitly deferred to a future change.
- **Why:** The scene already uses world pointer input for movement; a second meaning on the same surface would fight the full-bleed camera design and confuse younger players.
- **Alternatives considered:** World-space pointer activation when in range — rejected due to movement conflict; auto-observe when idle near Nora — rejected as accidental and hard to explain; NPC click-to-observe — deferred.

### 5. Leave-range interrupt is cancel only (no pause/resume)

- **Decision:** While observing, if the ghost leaves observation range, **cancel** the in-progress observation: clear in-progress progress/meter and return to idle. **Already discovered clues stay discovered** for the active haunting session. This change does **not** implement pause/resume of a half-finished observation.
- **Why:** One clear rule for children; removes the open question that previously left cancel vs pause ambiguous.
- **Alternatives considered:** Pause-and-resume meter — rejected for this change (may be revisited later if cancel feels too harsh after playtest, as a new decision).

### 6. Observation bonus as a thin additive on top of FearEngine

- **Decision:** Keep `resolveScare` behaviour unchanged. After a scare resolves, a pure helper may add a small fixed score bonus (e.g. +5 once per active haunting session) when: (a) the scare category matches Nora's primary fear, (b) at least one non-personality clue was already discovered this session, and (c) the bonus has not already been granted this session. Incorrect / ineffective scares keep existing −5 / resistance / glimpse behaviour with no observation-related extra penalty.
- **Why:** Satisfies “earned” feeling without making observation mandatory or rewriting novelty/fear gain.
- **Alternatives considered:** Multiplying fear gain after observation — rejected as too strong; requiring all clues before any bonus — rejected as making observation feel mandatory.

### 7. Clue panel as a floating review surface

- **Decision:** Add a compact clue list toggled from the clues button beside the objective control. Discovered clues show accessible text plus a category icon/shape; undiscovered slots show locked placeholders (`???` + 🔒). The panel stacks **below** the top-left button row in the HTML HUD overlay so it never covers those controls (including in fullscreen). It must not cover the scare grid, Observe button, or bottom-left move/card region; dismissible and transient enough for landscape phones.
- **Why:** Fits `mobile-gameplay-presentation` floating HUD language and accessibility requirements.
- **Alternatives considered:** Full-screen journal — rejected for mobile play area; permanent side strip — rejected as shrinking the playfield; Phaser-rendered panel — rejected after playtest showed canvas/HTML stacking misalignment in fullscreen.

### 8. README documentation is mandatory

- **Decision:** Update the README controls / Mobile play sections to document Observe (keyboard + on-screen button), leave-range cancel behaviour at a player-facing level, and how to review clues. This is not optional.
- **Why:** New input and a new review surface change player-facing behaviour; project completion checklist requires docs when controls change.

### 9. Testing and validation path

- **Decision:** Vitest covers pure observation/clue/bonus rules, Nora content invariants, duplicate prevention, and session reset. Phaser wiring and HTML HUD hit targets are verified by local desktop playtest (keyboard, mouse, fullscreen) and Azure PR preview on a physical phone. `npm run check` and `npm run build` remain the gate.
- **Why:** Aligns with existing FearEngine testing policy and project quality rules; avoids brittle Phaser/DOM unit tests for presentation while still locking domain behaviour.
- **Manual checklist (6.2):** Observe in/out of range, progress meter, leave-range cancel, one clue per pass, clue panel toggle, observation bonus after useful clue + matching scare, ineffective scare unchanged, play-area tap moves ghost.
- **Preview checklist (6.3):** Open a PR targeting `main`, use the Azure SWA preview URL from the PR comment, repeat HUD checks on a landscape phone.

### 10. HTML overlay for edge HUD controls

- **Decision:** Render objective, clues, clue review panel, Observe, scare actions, and zoom as HTML elements inside `#dom-hud` (positioned over the canvas content box with shared `--hud-pad-*` / `--hud-edge-inset-*` CSS vars). Phaser continues to draw value chips, status toasts, and the off-screen NPC indicator only.
- **Why:** Device-pixel canvas scaling and fullscreen safe-area padding made Phaser hit-testing unreliable for top- and bottom-edge controls; HTML gives correct hit targets, pointer cursor, and flex layout for the clue panel below the top buttons.
- **Alternatives considered:** Phaser manual hit rects — rejected after repeated fullscreen misalignment; enlarging hit pads — caused wider-than-visible click areas.

### 11. Compact mobile HUD and scrollable clue panel

- **Decision:** On narrow or short landscape viewports, scale down **all** interactive HUD controls (objective, clues, Observe, scare action buttons, ghost card, zoom, fullscreen) from the current ~60px / ~46px sizes toward a **≥44 CSS px** floor (typically 44–48px). Spacious desktop / large landscape keeps the larger defaults. Cap the clue panel’s max height so it stops above the bottom action cluster; list content scrolls inside the panel with a non-colour-only “more below” cue (fade, chevron, or similar) rather than clipping behind scare buttons.
- **Why:** Playtest on short landscape phones showed 60px action buttons and an uncapped clue list covering the play area and hiding behind the ghost/scare cluster.
- **Out of scope here:** Scare cast/wind-up progress meters (tracked in a separate change).
- **Alternatives considered:** Allowing targets under 44px — rejected (accessibility); auto-closing the panel when it would overlap — rejected in favour of scroll-with-cue; relocating the panel away from top-left — deferred to keep toggle affordance next to the clues button.

## Risks / Trade-offs

- **[Risk] Observation feels mandatory if the bonus or UX over-emphasises it** → Mitigation: small once-per-session bonus; scares remain fully usable without observing; copy frames observation as helpful, not required.
- **[Risk] Clue panel or Observe button overlaps scare controls on narrow landscape phones** → Mitigation: max-height + scroll with “more below” cue; compact ≥44px HUD on short/narrow landscape; layout checks at phone sizes; toggle rather than always-on panel.
- **[Risk] Smaller HUD targets feel harder to tap** → Mitigation: never go below 44 CSS px; only shrink on constrained viewports; keep desktop sizes larger.
- **[Risk] Clues spoil the answer or feel cryptic** → Mitigation: authored Nora sequence reviewed against 7+ readability; personality detail must not unfairly imply Object Nudge as the “right” answer.
- **[Risk] Scene accumulates observation UI logic** → Mitigation: pure modules + content files; scene only coordinates.
- **[Risk] Cancel-on-exit frustrates players who briefly step out of range** → Mitigation: generous observation range relative to scare ranges; pause/resume is explicitly out of scope for this change (revisit only via a later design decision).

## Migration Plan

1. Add content types and Nora definition alongside existing `FearProfile`.
2. Add pure observation + discovery + bonus helpers with Vitest coverage (cancel-on-exit; session reset).
3. Wire Observe keyboard + HUD button, progress feedback, and clue panel through HUD/scene without changing scare resolution paths except the additive bonus; keep world pointer = move.
4. Retarget `Npc` to load fear profile from Nora content.
5. Reset discovery/bonus state on scene/session start (and any future haunting restart that recreates the session).
6. Update README controls documentation.
7. Playtest keyboard/mouse/touch on the HUD button; run `npm run check` / `npm run build`; review on Azure PR preview.
8. Rollback = remove Observe/clue UI and content modules; fear engine remains as today.

## Open Questions

- Exact observation duration and range numbers (seed from Whisper range ~180 as a starting point; tune in playtest).
- Whether the observation bonus triggers after any useful clue or only after two — default **any one non-personality clue** unless playtest shows it is too easy.
- ~~Exact keyboard shortcut letter (`O` vs `4`)~~ — resolved: **`O`**, documented in the README.
