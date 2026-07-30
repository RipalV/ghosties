## ADDED Requirements

### Requirement: Observe interaction for nearby NPCs
The game SHALL provide an Observe action that the player can start on a nearby target NPC using a keyboard shortcut or a dedicated HUD button usable with mouse and touch. Observe SHALL NOT be started by play-area / world-space pointer input (that input remains movement). Starting Observe SHALL NOT spend score or energy.

#### Scenario: Player starts observation in range via keyboard
- **WHEN** the ghost is within the NPC's configured observation range and the player activates Observe with the keyboard shortcut
- **THEN** an observation session begins
- **AND** no score or energy is deducted

#### Scenario: Player starts observation in range via HUD button
- **WHEN** the ghost is within the NPC's configured observation range and the player activates the dedicated Observe HUD button with mouse or touch
- **THEN** an observation session begins
- **AND** no score or energy is deducted

#### Scenario: Observation does not start out of range
- **WHEN** the ghost is farther than the configured observation range
- **AND** the player activates Observe via keyboard or the HUD button
- **THEN** observation does not begin
- **AND** the UI explains that the player needs to move closer

#### Scenario: Play-area pointer does not observe
- **WHEN** the player presses or taps on the play area (including near the NPC)
- **THEN** the input is treated as a move command for the ghost
- **AND** observation does not start from that pointer press

### Requirement: Observation requires staying in range
Observation SHALL only progress while the ghost remains within the configured observation range. Leaving the range SHALL cancel the in-progress observation by clearing in-progress progress and returning to idle. Already discovered clues for the active haunting session SHALL remain discovered. This change SHALL NOT pause or resume a half-finished observation.

#### Scenario: Observation progresses in range
- **GIVEN** an observation session is active and the ghost stays in range
- **WHEN** time elapses
- **THEN** observation progress advances toward completion

#### Scenario: Leaving range cancels in-progress observation
- **GIVEN** an observation session is in progress
- **WHEN** the ghost moves outside observation range
- **THEN** in-progress observation progress is cleared
- **AND** observation returns to idle
- **AND** clues already discovered in the active haunting session remain discovered
- **AND** the observation does not pause for later resume

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
