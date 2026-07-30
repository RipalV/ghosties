## MODIFIED Requirements

### Requirement: Scene feedback for scares and range

`GameScene` SHALL coordinate energy spend, range checks, NPC reactions, novelty status text, failed-scare glimpses, out-of-range messaging, Observe sessions started from keyboard or the dedicated HUD button, clue reveal feedback, optional observation-bonus messaging, scare cast sessions (start from keyboard or HUD when affordable even out of range, progress ticks without leave-range cancel, exposure tracking while in range, resolve on complete with exposure-scaled outcomes, ghost casting presentation for the full cast, and active-visitor mid-cast reaction while still in range), and **haunting-session visit flow** (location ready with resident ghost, visitor announce/enter via the deterministic visitor registry, targetable active haunting, departure that cancels observation and scare casts without energy or outcomes, results summary, and next-visit reset that advances the visitor sequence) while delegating visual presentation, camera framing, responsive HUD layout, clue-panel presentation, and results/next-visit UI to focused reusable components. Play-area pointer input SHALL remain movement-only and SHALL NOT start Observe or scare casts. Ability and observation range values and NPC visit routes SHALL remain expressed in fixed world coordinates so they behave identically on every device. Active-visitor clue text, fear content, and visit route/success configuration SHALL come from typed content definitions and the visitor registry rather than permanent scene visitor-name branching. Discovery state and observation-bonus eligibility SHALL reset when the haunting visit is restarted via Next visit or when the next visitor becomes targetable. These behaviours are verified by playtesting and pure unit tests for observation/clue/scare-cast/session/route/registry rules rather than Phaser unit tests for rendering.

#### Scenario: Ineffective scare shows laugh and glimpse

- **GIVEN** an ineffective scare cast completes with enough exposure in range
- **WHEN** the scene applies the result
- **THEN** Nora shows a laughing reaction
- **AND** the ghost becomes fully visible for a short comedic glimpse
- **AND** the status UI reports the ineffective outcome

#### Scenario: Repeated scare UI explains novelty

- **GIVEN** a scare resolves with noveltyMultiplier below 1
- **WHEN** the scene applies the result
- **THEN** the status UI explains that novelty has fallen

#### Scenario: Out-of-range activation still casts

- **GIVEN** the ghost is farther away than the ability range but has enough energy and Nora is targetable
- **WHEN** the ability is used
- **THEN** a scare cast begins
- **AND** the UI encourages getting closer to affect Nora rather than blocking the cast as an immediate miss

#### Scenario: Observation and scare coordination

- **GIVEN** the ghost is within observation range and Nora is targetable
- **WHEN** the player starts Observe via keyboard or the HUD button and later uses a scare
- **THEN** the scene applies pure observation and scare results through reusable components
- **AND** any observation bonus is reported in friendly status text without changing energy rules
- **AND** play-area pointer presses continue to move the ghost rather than observe

#### Scenario: Scare cast then resolve with exposure

- **GIVEN** the ghost activates Whisper with enough energy while Nora is targetable
- **WHEN** the player stays in range for the full cast
- **THEN** the scene shows cast progress on the Whisper control
- **AND** the ghost shows a casting presentation during the cast
- **AND** Nora shows a mild mid-cast reaction while the ghost stays in range
- **AND** energy is spent and the full scare outcome is applied at completion

#### Scenario: Zero-exposure complete

- **GIVEN** a scare cast completes with no time spent in ability range
- **WHEN** the scene applies the result
- **THEN** no energy is spent
- **AND** Nora does not gain fear from that scare
- **AND** Nora does not show a resolve reaction
- **AND** the status UI explains she was never in range

#### Scenario: Reduced movement speed while casting

- **GIVEN** a scare cast is in progress
- **WHEN** the player moves the ghost with keyboard or pointer
- **THEN** the ghost travels at roughly one-eighth the world speed used when not casting

#### Scenario: Cast end eases speed back

- **GIVEN** a scare cast ends
- **WHEN** the player moves the ghost
- **THEN** travel speed eases back to normal over a short transition

#### Scenario: Resident ghost before Nora arrives

- **GIVEN** the scene has just started
- **WHEN** the hotel is location ready
- **THEN** the ghost is controllable in the lobby
- **AND** Nora is not yet targetable

#### Scenario: Departure cancels active systems

- **GIVEN** observation or a scare cast is active
- **WHEN** Nora’s departure begins
- **THEN** observation and scare casts are cancelled without energy spend or scare outcome
- **AND** the scene advances toward results after departure completes

#### Scenario: Next visit keeps the hotel

- **GIVEN** results are showing after Nora left
- **WHEN** the player chooses Next visit
- **THEN** the ghost remains in the hotel without a page reload
- **AND** session-scoped state resets for the new visit

#### Scenario: Second visitor works without scene name branching
- **GIVEN** the active visitor is the second registered visitor
- **WHEN** the player observes and completes a scare cast using that visitor’s primary fear
- **THEN** fear, score, and reactions apply using that visitor’s content
- **AND** `GameScene` does not require permanent hard-coded branches on the visitor’s display name
