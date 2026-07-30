# visitor-route Specification

## Purpose
TBD - created by archiving change haunting-session-flow. Update Purpose after archive.
## Requirements
### Requirement: Visitor presence separate from fear
Visitor presence SHALL use a distinct typed state: offsite, entering, visiting, departing, and departed. Emotional fear stages SHALL remain the existing calm, curious, uneasy, frightened, runaway, swoon, and possessed progression. Presence and fear SHALL NOT be combined into one enum.

#### Scenario: Visiting while calm
- **GIVEN** Nora has just become targetable
- **WHEN** her fear is still at calm
- **THEN** her presence is visiting
- **AND** her fear stage is calm

#### Scenario: Departing while haunted
- **GIVEN** Nora reached the success condition
- **WHEN** departure begins
- **THEN** her presence is departing
- **AND** her fear stage remains the successful haunted stage (for example possessed)

### Requirement: Authored Nora visit route
The vertical slice SHALL include one authored Nora visit that begins outside the playable lobby, enters through a configured entrance (targetable point), visits at least three fixed-coordinate points of interest with short pauses, and ends at a configured exit. Route data SHALL use fixed world coordinates, SHALL be stored outside `GameScene`, and SHALL remain separate from Nora’s fear and clue definitions. Routing SHALL be deterministic with no randomness required.

#### Scenario: Entrance then three points of interest
- **WHEN** Nora’s visit runs
- **THEN** she moves from an offsite spawn through the entrance point
- **AND** she visits at least three authored points of interest with brief pauses
- **AND** she proceeds toward the exit when departure begins

#### Scenario: Route content is not scene-hard-coded
- **WHEN** developers inspect Nora visit configuration
- **THEN** entrance, waypoints, pauses, and exit come from typed content outside `GameScene`
- **AND** that content is separate from Nora’s fear profile and clue list

### Requirement: Route continues during scare casts
While presence is visiting and the session is active haunting, Nora SHALL continue route and pause progression during scare casts so partial and full exposure remain possible.

#### Scenario: Nora keeps walking during a cast
- **GIVEN** Nora is visiting a waypoint path during active haunting
- **WHEN** the player starts a scare cast
- **THEN** Nora continues moving or pausing according to her route
- **AND** exposure still accumulates only while the ghost remains in ability range

### Requirement: Unhurried family-friendly pacing
Nora’s visit pacing SHALL remain readable and unhurried for players aged 7+. Arrival and departure cues SHALL be funny and mildly spooky without implying death, injury, trauma, or realistic danger.

#### Scenario: Arrival cue is child-friendly
- **WHEN** a visitor is announced
- **THEN** the UI shows a short family-friendly arrival cue
- **AND** the copy does not imply death, injury, or realistic danger

