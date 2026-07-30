# Playable Room Specification

## Purpose

Define the first playable hotel-room slice: pure fear-engine outcomes, scene feedback for scares and range, and how those behaviours are verified.

## Requirements

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

`GameScene` SHALL coordinate energy spend, range checks, NPC reactions, novelty status text, failed-scare glimpses, out-of-range messaging, Observe sessions started from keyboard or the dedicated HUD button, clue reveal feedback, optional observation-bonus messaging, and **scare cast sessions** (start from keyboard or HUD when affordable even out of range, progress ticks without leave-range cancel, exposure tracking while in range, resolve on complete with exposure-scaled outcomes, ghost casting presentation for the full cast, and Nora mid-cast reaction while still in range) while delegating visual presentation, camera framing, responsive HUD layout, and clue-panel presentation to focused reusable components. Play-area pointer input SHALL remain movement-only and SHALL NOT start Observe or scare casts. Ability and observation range values and NPC routines SHALL remain expressed in fixed world coordinates so they behave identically on every device. Nora-specific clue text and fear content SHALL come from typed content definitions rather than permanent scene hard-coding. Discovery state and observation-bonus eligibility SHALL reset when the haunting session is restarted or a new scene session begins. These behaviours are verified by playtesting and pure unit tests for observation/clue/scare-cast rules rather than Phaser unit tests for rendering.

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

- **GIVEN** the ghost is farther away than the ability range but has enough energy
- **WHEN** the ability is used
- **THEN** a scare cast begins
- **AND** the UI encourages getting closer to affect Nora rather than blocking the cast as an immediate miss

#### Scenario: Observation and scare coordination

- **GIVEN** the ghost is within observation range
- **WHEN** the player starts Observe via keyboard or the HUD button and later uses a scare
- **THEN** the scene applies pure observation and scare results through reusable components
- **AND** any observation bonus is reported in friendly status text without changing energy rules
- **AND** play-area pointer presses continue to move the ghost rather than observe

#### Scenario: Scare cast then resolve with exposure

- **GIVEN** the ghost activates Whisper with enough energy
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
