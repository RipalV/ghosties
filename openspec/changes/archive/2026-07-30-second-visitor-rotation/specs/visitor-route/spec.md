## MODIFIED Requirements

### Requirement: Authored Nora visit route
The vertical slice SHALL include authored visit routes for each registered visitor (Nora and one additional visitor). Each visit SHALL begin outside the playable lobby, enter through a configured entrance (targetable point), visit at least three fixed-coordinate points of interest with pauses, and end at a configured exit. Route data SHALL use fixed world coordinates, SHALL be stored outside `GameScene`, and SHALL remain separate from that visitor’s fear and clue definitions. Routing SHALL be deterministic with no randomness required. The second visitor’s route and pause lengths SHALL be noticeably different from Nora’s.

#### Scenario: Entrance then three points of interest
- **WHEN** Nora’s visit runs
- **THEN** she moves from an offsite spawn through the entrance point
- **AND** she visits at least three authored points of interest with brief pauses
- **AND** she proceeds toward the exit when departure begins

#### Scenario: Route content is not scene-hard-coded
- **WHEN** developers inspect Nora visit configuration
- **THEN** entrance, waypoints, pauses, and exit come from typed content outside `GameScene`
- **AND** that content is separate from Nora’s fear profile and clue list

#### Scenario: Second visitor has a distinct authored route
- **WHEN** the second visitor’s visit runs
- **THEN** they move through a configured entrance and at least three authored points of interest
- **AND** their pause lengths or waypoint layout differ from Nora’s visit
- **AND** that route content lives outside `GameScene` and outside Nora’s content files

### Requirement: Route continues during scare casts
While presence is visiting and the session is active haunting, the active visitor SHALL continue route and pause progression during scare casts so partial and full exposure remain possible.

#### Scenario: Nora keeps walking during a cast
- **GIVEN** Nora is visiting a waypoint path during active haunting
- **WHEN** the player starts a scare cast
- **THEN** Nora continues moving or pausing according to her route
- **AND** exposure still accumulates only while the ghost remains in ability range

#### Scenario: Second visitor keeps walking during a cast
- **GIVEN** the second visitor is on their waypoint path during active haunting
- **WHEN** the player starts a scare cast
- **THEN** that visitor continues moving or pausing according to their route

### Requirement: Unhurried family-friendly pacing
Each registered visitor’s visit pacing SHALL remain readable and unhurried for players aged 7+. Arrival and departure cues SHALL be funny and mildly spooky without implying death, injury, trauma, or realistic danger, and SHALL name or clearly identify the active visitor.

#### Scenario: Arrival cue is child-friendly
- **WHEN** a visitor is announced
- **THEN** the UI shows a short family-friendly arrival cue
- **AND** the copy does not imply death, injury, or realistic danger
- **AND** the cue identifies the active visitor
