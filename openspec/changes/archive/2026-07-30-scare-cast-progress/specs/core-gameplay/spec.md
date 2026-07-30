## ADDED Requirements

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
