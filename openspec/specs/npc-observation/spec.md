# NPC Observation Specification

## Purpose

Define nearby Observe interaction for NPCs: keyboard and HUD activation, range gating, timed progress, leave-range cancel rules, and feedback contracts independent of rendering.
## Requirements
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

### Requirement: Observation blocked and cancelled on departure
Observe SHALL NOT start when there is no targetable visitor or when the session is visitor departing or results. When departure begins, any in-progress observation SHALL be cancelled (progress cleared, return to idle) while already discovered clues for that visit remain available until results are dismissed or the next visit resets discovery.

#### Scenario: Observe blocked before visitor is targetable
- **GIVEN** the session is location ready or visitor entering
- **WHEN** the player activates Observe via keyboard or HUD
- **THEN** observation does not begin
- **AND** the UI explains there is no active visitor to observe

#### Scenario: Departure cancels in-progress observation
- **GIVEN** observation is in progress during active haunting
- **WHEN** visitor departing begins
- **THEN** in-progress observation progress is cleared
- **AND** observation returns to idle
- **AND** clues already discovered this visit remain available for results

### Requirement: Observation uses active visitor content
Observe progress, clue reveals, and observation range SHALL use the active visitor’s typed content (clues, observation tuning, display name). Status copy SHALL refer to the active visitor rather than hard-coding Nora when another visitor is active. Guided onboarding copy during the first Nora visit MAY name Nora explicitly.

#### Scenario: Observing the second visitor unlocks their clues
- **GIVEN** the second visitor is targetable and in observation range
- **WHEN** the player completes Observe progress thresholds
- **THEN** that visitor’s authored clues are revealed in order
- **AND** Nora’s clue texts are not shown

#### Scenario: Observe label names the active visitor
- **WHEN** the second visitor is the active visitor
- **THEN** Observe control labelling or status copy identifies that visitor

#### Scenario: First tutorial visit may name Nora
- **GIVEN** guided onboarding is active during the first Nora visit
- **WHEN** an Observe instruction is shown
- **THEN** the copy may refer to Nora by name
- **AND** Observe still uses Nora’s typed content

### Requirement: Observation events feed onboarding and coaching
Starting Observe, completing Observe with a clue unlock, and attempting Observe out of range SHALL emit events consumable by pure onboarding and coaching modules without changing observation range, progress, or discovery rules.

#### Scenario: Successful Observe advances tutorial when on that step
- **GIVEN** guided onboarding is on the Observe step and Nora is in range
- **WHEN** the player completes Observe and unlocks a clue
- **THEN** onboarding may advance to the review-clue step
- **AND** clue discovery still follows existing observation rules only

#### Scenario: Out-of-range Observe attempt informs coaching
- **GIVEN** guided onboarding is finished or skipped
- **WHEN** the player activates Observe out of range
- **THEN** coaching eligibility may select an out-of-range Observe hint
- **AND** observation does not begin

