## ADDED Requirements

### Requirement: Scare buttons show cast progress
While a scare cast is active, the corresponding scare HUD button SHALL show clear, non-colour-only progress feedback (comparable to Observe), including when the ghost is out of range. The casting scare’s control SHALL read as unavailable for re-activation without relying on colour alone. Other scare buttons MAY remain available.

#### Scenario: Player watches scare cast progress
- **WHEN** a scare cast is in progress
- **THEN** readable progress feedback is visible on that scare’s action button
- **AND** the feedback does not rely on colour alone
- **AND** the feedback avoids rapid flashing
- **AND** activating that same scare again does not start a second cast

#### Scenario: Other scare buttons stay usable
- **GIVEN** Whisper cast progress is showing
- **WHEN** the player looks at Cold Puff and Object Nudge controls
- **THEN** those controls remain activatable (subject to energy)
- **AND** they are not locked solely because Whisper is casting

### Requirement: World cast visuals stay readable
Ghost casting presentation (for the full cast) and Nora’s in-range mid-cast reaction SHALL remain readable on landscape phones, communicate state without colour alone, avoid rapid flashing, and clear appropriately when the cast ends or when Nora leaves range (without cancelling the cast).

#### Scenario: Casting visuals on a landscape phone
- **WHEN** a scare cast is in progress on a landscape mobile viewport
- **THEN** the ghost casting look is distinguishable from the idle ghost even if out of range
- **AND** if the ghost is in range, Nora’s mid-cast cue is readable
- **AND** neither cue relies on colour alone
- **AND** neither cue uses rapid flashing
