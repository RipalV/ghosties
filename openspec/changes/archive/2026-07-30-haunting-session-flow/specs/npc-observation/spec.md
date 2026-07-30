## ADDED Requirements

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
