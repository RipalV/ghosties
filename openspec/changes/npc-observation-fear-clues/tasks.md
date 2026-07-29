## 1. Domain model and Nora content

- [ ] 1.1 Add typed observation and clue domain types (clue categories, clue definition, NPC content, active-haunting-session discovery state, observation session state) in a focused module under `src/game/`
- [ ] 1.2 Author Nora's content definition: primary fear matching an existing scare (Whisper), fear profile aligned with current behaviour, at least three useful clues from at least two categories, one fair personality detail, observation range/duration, and family-friendly accessible clue text
- [ ] 1.3 Retarget `Npc` / scene fear profile loading to consume Nora's typed content without embedding clue strings in `GameScene`

## 2. Pure observation and discovery rules

- [ ] 2.1 Implement pure helpers to start observation only when in range, advance progress while in range, and cancel in-progress progress when leaving range (no pause/resume); already discovered clues remain
- [ ] 2.2 Implement progressive clue reveal from observation progress / thresholds with duplicate-discovery prevention within the active haunting session
- [ ] 2.3 Implement active-haunting-session discovery store that resets when the haunting session is restarted or a new scene session begins
- [ ] 2.4 Implement pure observation-bonus eligibility (matching primary fear + at least one useful clue + once per active haunting session) as an additive score helper that does not alter `resolveScare` fear/novelty maths
- [ ] 2.5 Add Vitest coverage for in-range start, out-of-range rejection, progress, leave-range cancel, progressive reveal, duplicates, session discovery state, fear matching for bonus, unchanged incorrect-scare path assumptions, bonus once-per-session, and session reset

## 3. Scene and input wiring

- [ ] 3.1 Wire Observe for keyboard shortcut and a dedicated HUD button (≥44 CSS px, mouse and touch) without spending energy or score; do not bind Observe to play-area pointer input
- [ ] 3.2 Drive observation sessions from `GameScene` using pure helpers and fixed world-space range checks (zoom-independent); cancel on leave-range
- [ ] 3.3 Show clear non-colour-only observation progress feedback and friendly out-of-range messaging
- [ ] 3.4 Apply observation bonus after a matching scare when eligible and report it in status text; keep ineffective / mismatched scare penalties and glimpses unchanged
- [ ] 3.5 Reset discovery state and observation-bonus eligibility on scene/session start (haunting session restart or new scene session)

## 4. Clue review UI

- [ ] 4.1 Add a compact, dismissible/toggleable clue panel listing discovered clues with accessible text and category cues that do not rely on colour alone
- [ ] 4.2 Layout the panel within the floating HUD so it does not cover the scare action grid, Observe button, or block primary movement on landscape phones
- [ ] 4.3 Show locked placeholders or empty state for undiscovered clues without spoiling the primary fear label early

## 5. Presentation polish for Nora

- [ ] 5.1 Add brief family-friendly observation reactions for Nora (and optional subtle body-language / object / environment feedback tied to clue categories)
- [ ] 5.2 Ensure observation and clue presentation stay consistent with Boo Realm tone (no death/gore/violence; funny and mildly spooky)

## 6. Validation and documentation

- [ ] 6.1 Run `npm run check` and `npm run build` and fix any regressions
- [ ] 6.2 Playtest Observe with keyboard and the HUD button (mouse and touch): range gating, progress, leave-range cancel, progressive clues, clue review, matching bonus, incorrect scare unchanged, play-area tap still moves
- [ ] 6.3 Review the feature on an Azure Static Web Apps pull-request preview URL
- [ ] 6.4 Update the README controls and Mobile play sections to document Observe (keyboard + HUD button), leave-range cancel at a player-facing level, and clue review
