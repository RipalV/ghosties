## ADDED Requirements

### Requirement: Observe interaction for nearby NPCs
The game SHALL provide an Observe action that the player can start on a nearby target NPC using keyboard, mouse, and touch. Starting Observe SHALL NOT spend score or energy.

#### Scenario: Player starts observation in range
- **WHEN** the ghost is within the NPC's configured observation range and the player activates Observe
- **THEN** an observation session begins
- **AND** no score or energy is deducted

#### Scenario: Observation does not start out of range
- **WHEN** the ghost is farther than the configured observation range
- **AND** the player activates Observe
- **THEN** observation does not begin
- **AND** the UI explains that the player needs to move closer

### Requirement: Observation requires staying in range
Observation SHALL only progress while the ghost remains within the configured observation range. Leaving the range SHALL interrupt the in-progress observation according to the designed interrupt rule (cancel in-progress progress by default) without removing clues already discovered in the round.

#### Scenario: Observation progresses in range
- **GIVEN** an observation session is active and the ghost stays in range
- **WHEN** time elapses
- **THEN** observation progress advances toward completion

#### Scenario: Leaving range interrupts observation
- **GIVEN** an observation session is in progress
- **WHEN** the ghost moves outside observation range
- **THEN** the in-progress observation is interrupted
- **AND** clues already discovered this round remain discovered

### Requirement: Visible observation progress feedback
While observation is active, the game SHALL show clear, non-colour-only progress feedback so the player can tell that observation is happening and how far it has progressed.

#### Scenario: Player watches observation progress
- **WHEN** observation is in progress
- **THEN** readable progress feedback is visible
- **AND** the feedback does not rely on colour alone
- **AND** the feedback avoids rapid flashing

### Requirement: Observation range uses fixed world coordinates
Observation range SHALL be expressed in the same fixed world coordinates as scare ranges so behaviour is identical across devices and zoom levels.

#### Scenario: Zoom does not change observation range
- **GIVEN** the player has changed the camera zoom step
- **WHEN** observation range is evaluated at the same world distance from the NPC
- **THEN** whether observation may start is identical to the default zoom
