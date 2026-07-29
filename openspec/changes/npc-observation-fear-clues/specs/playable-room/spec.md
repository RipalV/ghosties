## MODIFIED Requirements

### Requirement: Scene feedback for scares and range

`GameScene` SHALL coordinate energy spend, range checks, NPC reactions, novelty status text, failed-scare glimpses, out-of-range messaging, Observe sessions, clue reveal feedback, and optional observation-bonus messaging while delegating visual presentation, camera framing, responsive HUD layout, and clue-panel presentation to focused reusable components. Ability and observation range values and NPC routines SHALL remain expressed in fixed world coordinates so they behave identically on every device. Nora-specific clue text and fear content SHALL come from typed content definitions rather than permanent scene hard-coding. These behaviours are verified by playtesting and pure unit tests for observation/clue rules rather than Phaser unit tests for rendering.

#### Scenario: Ineffective scare shows laugh and glimpse

- **GIVEN** an ineffective scare resolves within range
- **WHEN** the scene applies the result
- **THEN** Nora shows a laughing reaction
- **AND** the ghost becomes fully visible for a short comedic glimpse
- **AND** the status UI reports the ineffective outcome

#### Scenario: Repeated scare UI explains novelty

- **GIVEN** a scare resolves with noveltyMultiplier below 1
- **WHEN** the scene applies the result
- **THEN** the status UI explains that novelty has fallen

#### Scenario: Attempt from out of range

- **GIVEN** the ghost is farther away than the ability range
- **WHEN** the ability is used
- **THEN** no energy is spent
- **AND** the UI asks the player to move closer

#### Scenario: Observation and scare coordination

- **GIVEN** the ghost is within observation range
- **WHEN** the player starts Observe and later uses a scare
- **THEN** the scene applies pure observation and scare results through reusable components
- **AND** any observation bonus is reported in friendly status text without changing energy rules
