## Context

The vertical slice already has three scare abilities, Nora with a typed fear profile (Whisper high, Cold medium, Object ineffective), pure `FearEngine` scoring, and a mobile floating HUD. Scare choice is still poorly informed: the player mostly learns by spending energy. This change adds the intended observe → clue → infer → scare loop without rewriting fear maths, energy, novelty, or the lobby presentation.

## Goals / Non-Goals

**Goals:**

- Add a reusable Observe interaction gated by world-space range with clear progress and interrupt behaviour.
- Author typed NPC fear + clue content; ship a complete Nora slice demonstrating progressive, multi-category clues.
- Keep observation, discovery state, and observation-bonus rules pure and unit-tested, separate from Phaser.
- Present discovered clues in a compact review panel that fits the existing floating HUD and stays clear of scare/move controls.
- Preserve existing scare outcomes; add only a small, optional observation bonus when a matching scare follows discovery.
- Keep tone family-friendly, funny, and mildly spooky.

**Non-Goals:**

- Extra NPCs, levels, abilities, multiplayer, accounts, persistence, cloud APIs, voice, procedural/AI dialogue, monetisation.
- Major lobby or HUD redesign beyond the clue panel and Observe affordance.
- Making observation mandatory for scoring success.
- Changing Ghosties lore (ghosts remain Boo Realm creatures, not dead humans).

## Decisions

### 1. Pure observation session + discovery store

- **Decision:** Implement observation as a pure state machine (`idle` | `observing` | `paused` | `complete-for-tick`) driven by range checks and elapsed time, with a separate round-scoped discovery store that records clue IDs already revealed. Phaser only starts/stops sessions and plays feedback.
- **Why:** Matches project architecture (fear maths already pure), enables deterministic tests for start, progress, interrupt, duplicates, and round reset, and keeps discovery serialisable later without shipping persistence now.
- **Alternatives considered:** Embedding timers and clue lists in `GameScene` — rejected as hard to test and Nora-specific; revealing all clues instantly on button press — rejected because it skips the observation fantasy.

### 2. Typed NPC content definitions, Nora as data

- **Decision:** Introduce readonly NPC content modules (e.g. under `src/game/content/`) carrying fear profile, primary fear category, optional secondary dislikes, ordered clue definitions (id, category, accessible text, optional personality flag, reveal condition), and observation tuning (range, duration). `Npc` presentation and `GameScene` consume Nora's definition rather than owning clue strings.
- **Why:** Proposal requires reusable definitions and forbids Nora logic living permanently in the scene; future NPCs become new data files.
- **Alternatives considered:** Extending `FearProfile` alone — insufficient for clues; hard-coding Nora dialogue in entity constructors — rejected as non-reusable.

### 3. Progressive reveal without spoiling the primary fear

- **Decision:** Clues unlock one-at-a-time as observation progress crosses authored thresholds (or sequential ticks of the observe duration). No clue text states “afraid of Whisper/Cold/Object” by name. The primary fear remains hidden until the player infers it; an explicit “fear revealed” UI is out of scope for this slice. A single personality detail may colour Nora without pointing at the wrong scare as if it were the answer.
- **Why:** Matches acceptance criteria and the investigation fantasy; keeps the loop readable for 7+.
- **Alternatives considered:** Unlocking the fear label after three clues — deferred; random clue order — rejected for Nora's authored demo sequence.

### 4. Observe input as a first-class action beside scares

- **Decision:** Expose Observe via a keyboard shortcut (e.g. `O` / `4`), an on-screen control near the ghost card sized for 44 CSS px touch targets, and pointer activation when in range. Observation does not spend energy or score. Leaving range pauses or cancels the current observe tick per a single pure rule (prefer cancel with progress reset for simplicity unless playtesting shows pause feels better — default **cancel + clear in-progress progress**, keep already-discovered clues).
- **Why:** Multi-input parity with existing abilities; cancel-on-exit is easier for children than a half-finished meter that resumes ambiguously.
- **Alternatives considered:** Auto-observe when idle near Nora — rejected as accidental and hard to explain; pause-and-resume meter — deferred if cancel feels too harsh in playtest.

### 5. Observation bonus as a thin additive on top of FearEngine

- **Decision:** Keep `resolveScare` behaviour unchanged. After a scare resolves, a pure helper may add a small fixed score bonus (e.g. +5 once per haunting round) when: (a) the scare category matches Nora's primary fear, (b) at least one non-personality clue was already discovered this round, and (c) the bonus has not already been granted. Incorrect / ineffective scares keep existing −5 / resistance / glimpse behaviour with no observation-related extra penalty.
- **Why:** Satisfies “earned” feeling without making observation mandatory or rewriting novelty/fear gain.
- **Alternatives considered:** Multiplying fear gain after observation — rejected as too strong and harder to reason about; requiring all clues before any bonus — rejected as making observation feel mandatory.

### 6. Clue panel as a floating review surface

- **Decision:** Add a compact clue list (toggle from a top-edge icon or objective-adjacent control) listing discovered clue accessible text plus category icon/shape. Undiscovered slots may show locked placeholders. Panel must not cover the scare grid or bottom-left move/card region; dismissible and transient enough for landscape phones.
- **Why:** Fits `mobile-gameplay-presentation` floating HUD language and accessibility requirements (text for non-text clues).
- **Alternatives considered:** Full-screen journal — rejected for mobile play area; permanent side strip — rejected as shrinking the playfield against recent full-bleed work.

### 7. Testing and validation path

- **Decision:** Vitest covers pure observation/clue/bonus rules; Phaser wiring verified by playtest and Azure PR preview. `npm run check` and `npm run build` remain the gate.
- **Why:** Aligns with existing FearEngine testing policy and project quality rules.

## Risks / Trade-offs

- **[Risk] Observation feels mandatory if the bonus or UX over-emphasises it** → Mitigation: small once-per-round bonus; scares remain fully usable without observing; copy frames observation as helpful, not required.
- **[Risk] Clue panel overlaps scare controls on narrow landscape phones** → Mitigation: anchored away from the action grid; layout tests at phone sizes; toggle rather than always-on.
- **[Risk] Clues spoil the answer or feel cryptic** → Mitigation: authored Nora sequence reviewed against 7+ readability; personality detail must not unfairly imply Object Nudge as the “right” answer.
- **[Risk] Scene accumulates observation UI logic** → Mitigation: pure modules + content files; scene only coordinates.
- **[Risk] Cancel-on-exit frustrates players who briefly step out of range** → Mitigation: generous observation range relative to scare ranges; if playtest complains, switch to pause without losing progress (same pure API, different interrupt mode).

## Migration Plan

1. Add content types and Nora definition alongside existing `FearProfile`.
2. Add pure observation + discovery + bonus helpers with Vitest coverage.
3. Wire Observe input, progress feedback, and clue panel through HUD/scene without changing scare resolution paths except the additive bonus.
4. Retarget `Npc` to load fear profile from Nora content.
5. Playtest keyboard/mouse/touch; run `npm run check` / `npm run build`; review on Azure PR preview.
6. Rollback = remove Observe/clue UI and content modules; fear engine remains as today.

## Open Questions

- Exact observation duration and range numbers (seed from Whisper range ~180 as a starting point; tune in playtest).
- Whether interrupt mode stays cancel or becomes pause after first playtest.
- Whether the observation bonus triggers after any useful clue or only after two — default **any one non-personality clue** unless playtest shows it is too easy.
