## MODIFIED Requirements

### Requirement: Scene feedback for scares and range

`GameScene` SHALL coordinate energy spend, range checks, NPC reactions, novelty status text, failed-scare glimpses, and out-of-range messaging while delegating visual presentation and responsive HUD layout to focused reusable components. These behaviours are verified by playtesting rather than Phaser unit tests.

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
