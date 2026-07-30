## Context

Ghosties already has scare-cast exposure, two authored visitor routes, session reset, and contextual coaching after first-visit onboarding. The lobby is storybook furniture in fixed world coordinates, but props are not gameplay targets. This change makes three furniture pieces hauntable combo targets that reward route anticipation without new abilities or rooms.

## Goals / Non-Goals

**Goals:**

- Three typed props (bell / Object Nudge, portrait / Whisper, fireplace-or-curtains / Cold Puff) with fixed world positions and radii.
- Link compatible scare casts started in ghost activation range to a prop; show cast feedback on that prop.
- Award a small once-per-prop-per-visit score bonus only when resolve has non-zero exposure, scare matches prop, and visitor is in reaction radius.
- Keep fear, energy, exposure, novelty, observation bonus, and success thresholds unchanged.
- Nora and Milo each pass at least one useful prop on their existing routes (small waypoint tweaks OK).
- Pure TypeScript rules; scene only coordinates; reusable prop presentation.
- Landscape-mobile-readable cues; optional coaching hint after guided onboarding ends.

**Non-Goals:**

- New scare abilities, visitors, rooms, inventory, traps, possession, multiplayer, persistence, achievements, monetisation.
- Free-form furniture movement or procedural props.
- New guided onboarding steps.
- Changing scare cast duration, ranges, or fear maths.

## Decisions

### 1. Typed prop content outside GameScene

- **Decision:** Store props as readonly typed definitions under `src/game/content/` (e.g. `lobbyProps.ts`) with: `id`, `displayName`, `position`, `compatibleCategory` (`ScareCategory`), `ghostActivationRadius`, `visitorReactionRadius`, visual reaction keys, default reaction copy, and optional per-visitor reaction overrides keyed by visitor id in content — not in `GameScene` branches.
- **Why:** Matches visitor/clue content pattern; keeps coordinates stable across devices.
- **Alternatives considered:** Hard-code props in scene — rejected (untestable, hard to reset).

### 2. Pure combo session + eligibility module

- **Decision:** Domain folder `src/game/props/` (or `environment/`) with pure helpers: create/reset visit prop state, select compatible prop for cast start (ghost distance + category + targetable), track linked prop for active cast, evaluate combo award on resolve, mark bonus used, clear link on cancel/departure. Combo score constant is typed content (small fixed bonus, e.g. +5–15) separate from `FearEngine`.
- **Why:** Deterministic tests; scene stays a coordinator.
- **Alternatives considered:** Fold into scare-cast session — rejected (keeps scare maths pure; combo is additive score only).

### 3. Cast linking at cast start

- **Decision:** On successful `tryStartScareCast` (or equivalent scene hook), if visitor targetable and a single best compatible prop is in ghost activation range, set `linkedPropId` for that cast. If multiple props qualify, pick nearest by world distance. Incompatible or out-of-range props are not linked. Leaving the prop mid-cast does **not** unlink (cast feedback may continue); award still requires visitor reaction radius at resolve.
- **Why:** Clear “I started a hotel trick” affordance; avoid flaky unlink mid-cast.
- **Alternatives considered:** Require ghost to stay in prop range whole cast — rejected (too punishing with cast slowdown).

### 4. Award conditions are strict and score-only

- **Decision:** Award only if: linked prop exists, scare category matches, exposure kind is not zero/miss, visitor distance ≤ reaction radius at resolve, and prop not yet awarded this visit. Apply `score += comboBonus` after existing scare score deltas. Status/toast: short mischievous “Hotel trick!” (or content string). No fear/energy/novelty changes.
- **Why:** Matches acceptance; teaches positioning without rewriting fear.
- **Alternatives considered:** Multiplier on scare score — rejected (harder to explain; couples to novelty).

### 5. Once per prop per visit

- **Decision:** Visit prop state holds `awardedPropIds: ReadonlySet` (or record). After award, further casts may still link and animate but `evaluateCombo` returns no bonus.
- **Why:** Prevents farming one prop; still allows fun re-animations.

### 6. Route tweaks, not a new route system

- **Decision:** Nudge Nora/Milo POI coordinates (and optionally place props near existing POIs) so each route’s path or pause brings the visitor within at least one prop’s reaction radius during active haunting. Document intended pairings in content comments (e.g. Nora near portrait + bell; Milo near fireplace). Keep `visitorRoute` progression API unchanged.
- **Why:** Minimal churn; proves both visitors can combo.
- **Alternatives considered:** New route legs solely for props — rejected (scope).

### 7. Presentation component

- **Decision:** Reusable Phaser (or DOM+world) prop presentation: idle silhouette, proximity cue (shape/icon + mild motion, not colour alone), casting pulse while linked, resolve burst + visitor reaction text from active visitor content. Ranges stay in world units; zoom-invariant.
- **Why:** Matches architecture rules; avoids packing effects into `GameScene`.

### 8. Coaching after guided mode only

- **Decision:** Add a coaching hint id (e.g. `propComboAvailable`) selectable when guided onboarding finished, visitor targetable, ghost near an unused compatible prop, and hint not yet shown. No new `first-visit-onboarding` steps.
- **Why:** Teaches hotel tricks without lengthening the six-step tutorial.

### 9. Lifecycle alignment

- **Decision:** Reset prop visit state in the same place as score/clue/novelty reset (`sessionReset` / Next visit). Clear linked prop presentation on departure cancel and cast cancel/switch. No combo while not targetable.
- **Why:** Matches existing session contracts.

## Risks / Trade-offs

- **[Risk] Props clutter the lobby** → Mitigation: three props only; subtle idle; proximity cue only when close; no permanent text labels covering HUD.
- **[Risk] Bonus feels like fear help** → Mitigation: copy and status say score “Hotel trick”; fear stage unchanged; tests assert fear deltas identical with/without combo path.
- **[Risk] Visitor never enters reaction radius** → Mitigation: playtest waypoint placement; Vitest geometric fixture for intended prop–POI pairs.
- **[Risk] Multiple props near ghost** → Mitigation: nearest compatible wins; documented.
- **[Risk] Mobile readability** → Mitigation: large enough prop silhouettes; ≥44 px is for controls, not props; toast for award; avoid rapid flash.

## Migration Plan

1. Add prop content + pure rules + tests.
2. Wire scene cast/resolve/reset + presentation component.
3. Tweak Nora/Milo POIs; playtest both visitors.
4. Add coaching hint + README note.
5. `npm run check` / `npm run build`; SWA PR preview.

## Open Questions

- Exact combo bonus points (prefer single constant ~10).
- Fireplace vs curtains as Cold Puff prop — pick one silhouette in implementation; content id stable (`drafty-fireplace` or `drafty-curtains`).
- Whether proximity cue appears only for scare category matching a held intent vs any unused compatible prop nearby (prefer: any unused prop in activation range while targetable).
