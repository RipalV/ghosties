# Playable Room Delta Specification

## ADDED Requirements

### Requirement: Fear engine outcomes are unit-tested

Deterministic scare outcomes (fear gain, novelty multipliers, score deltas for in-range scares) SHALL be implemented in pure `FearEngine` functions and covered by Vitest unit tests. Scene/UI feedback that depends on Phaser SHALL be verified by playtesting, not by FearEngine unit tests.

#### Scenario: Discover a high fear

- **GIVEN** Nora has Whisper as a high fear
- **WHEN** Whisper is resolved for the first time (no prior uses of that category)
- **THEN** fear gained is 28
- **AND** the score delta includes a first-discovery bonus (fear gained + 5)
- **AND** the result reaction indicates a perfect scare

#### Scenario: Repeat a scare reduces novelty

- **GIVEN** a scare category has already been used once
- **WHEN** novelty is calculated for the next use of that category
- **THEN** the novelty multiplier is 0.7
- **AND** in-range fear gain is base fear multiplied by that novelty (FearEngine applies this when resolving a scare)

#### Scenario: Use an ineffective scare

- **GIVEN** Nora treats Object Nudge as ineffective
- **WHEN** Object Nudge is resolved
- **THEN** fear gained is 0
- **AND** the score delta is −5
- **AND** the result reaction indicates the scare was funny rather than frightening

### Requirement: Scene feedback for scares and range

`GameScene` SHALL coordinate energy spend, range checks, NPC reactions, novelty status text, failed-scare glimpses, and out-of-range messaging. These behaviours are verified by the completed playtest task rather than Phaser unit tests.

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
