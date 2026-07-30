# Core Gameplay Specification

## Purpose

Define the stable rules for the first family-friendly ghost haunting prototype.
## Requirements
### Requirement: Ghost movement

The player SHALL control an invisible ghost using keyboard movement or pointer/touch movement.

### Requirement: NPC fear profile

Each target NPC SHALL have high-effect, medium-effect, and ineffective scare categories.

### Requirement: Informative outcomes

Every scare attempt SHALL visibly communicate whether it was effective, partially effective, out of range, repeated, or ineffective.

### Requirement: Failed scare glimpse

When an ineffective scare is used successfully within range, the NPC SHALL briefly see a comedic glimpse of the ghost and the player SHALL lose points.

### Requirement: Fear progression

NPC fear SHALL progress through calm, curious, uneasy, frightened, runaway, swoon, and possessed states.

### Requirement: Child-friendly content

The prototype SHALL NOT contain death, injury, combat, blood, weapons, or realistic violence.

### Requirement: Observation informs scare choice without replacing fear rules
The core gameplay loop SHALL allow players to observe NPCs and discover clues that inform scare selection. Existing fear profiles (high, medium, ineffective), informative scare outcomes, failed-scare glimpses, fear stage progression, and child-friendly content constraints SHALL remain in force. Observation SHALL NOT be required to complete a haunting.

#### Scenario: Player can still scare without observing
- **WHEN** the player uses a scare ability without having observed the NPC
- **THEN** existing fear resolution, energy spend, novelty, and scoring still apply
- **AND** the haunt can still progress through fear stages

#### Scenario: Child-friendly observation content
- **WHEN** observation clues or reactions are shown
- **THEN** content remains suitable for ages 7+
- **AND** it contains no death, injury, combat, blood, weapons, or realistic violence
- **AND** ghosts remain magical Boo Realm creatures rather than dead humans

### Requirement: Scare performing phase before outcome
Scare activation SHALL include a brief performing (cast) phase with visible progress before fear resolution, energy spend, and scoring apply. The performing phase SHALL be startable when the scare is affordable even if the ghost is out of range. Child-friendly content constraints SHALL remain in force.

#### Scenario: Player sees a scare being performed out of range
- **WHEN** the player activates an affordable scare while out of range
- **THEN** progress feedback shows the scare is being performed
- **AND** the scare outcome applies only after the cast completes
- **AND** Nora is unaffected unless she was exposed during the cast

#### Scenario: Exposure shapes the outcome
- **GIVEN** a scare cast completes
- **WHEN** Nora was exposed for only part of the cast
- **THEN** her fear/score response is reduced relative to a full-exposure cast of the same scare
- **AND** fear matching still determines whether the scare is high, medium, or ineffective before scaling
- **AND** the UI explains the partial effect in friendly language

### Requirement: Performing scare is visible in the world
During the scare performing phase, the ghost SHALL look like it is casting whether or not it is in range. Nora SHALL show a mild mid-cast reaction only while she remains in range of the casting ability. Content SHALL remain child-friendly.

#### Scenario: Ghost and Nora during a valid cast
- **WHEN** an affordable scare cast is in progress and the ghost stays in range
- **THEN** the ghost shows a casting presentation
- **AND** Nora shows a mild mid-cast reaction
- **AND** both remain suitable for ages 7+

#### Scenario: Movement slows while performing
- **GIVEN** the ghost can move at normal speed before casting
- **WHEN** a scare cast is in progress and the player keeps moving
- **THEN** ghost world travel speed eases down to roughly one-eighth the non-casting speed
- **AND** the casting presentation remains visible

#### Scenario: Speed eases back after cast
- **GIVEN** a scare cast completes, is switched, or is cancelled
- **WHEN** the player keeps moving
- **THEN** ghost world travel speed eases back to normal over a short transition rather than snapping instantly

### Requirement: Visit-bounded core loop
The core gameplay loop SHALL be bounded by a visit: the ghost waits in the hotel, a visitor from the deterministic registry arrives and becomes targetable, the player observes and scares using existing rules against that visitor’s fear profile, then the visitor departs haunted or unimpressed and results appear before the next visit in the sequence. Existing fear profiles, informative outcomes, failed-scare glimpses, fear stage progression, and child-friendly content constraints SHALL remain in force during active haunting for every registered visitor. The second visitor SHALL require a different successful scare strategy from Nora (different primary fear).

#### Scenario: Ghost waits before the visitor
- **WHEN** the hotel is location ready
- **THEN** the ghost is controllable in the hotel
- **AND** no visitor is targetable yet

#### Scenario: Existing scare rules apply during active haunting
- **GIVEN** Nora is visiting and targetable
- **WHEN** the player observes and performs scare casts
- **THEN** existing observation, clue, scare-cast exposure, fear, energy, score, and novelty rules still apply

#### Scenario: Second visitor uses the same core rules with a different primary fear
- **GIVEN** the second visitor is visiting and targetable
- **WHEN** the player observes and performs scare casts
- **THEN** existing observation, scare-cast exposure, fear, energy, score, and novelty rules still apply
- **AND** that visitor’s primary fear differs from Nora’s Whisper

