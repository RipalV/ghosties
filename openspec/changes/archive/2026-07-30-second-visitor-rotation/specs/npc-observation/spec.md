## ADDED Requirements

### Requirement: Observation uses active visitor content
Observe progress, clue reveals, and observation range SHALL use the active visitor’s typed content (clues, observation tuning, display name). Status copy SHALL refer to the active visitor rather than hard-coding Nora when another visitor is active.

#### Scenario: Observing the second visitor unlocks their clues
- **GIVEN** the second visitor is targetable and in observation range
- **WHEN** the player completes Observe progress thresholds
- **THEN** that visitor’s authored clues are revealed in order
- **AND** Nora’s clue texts are not shown

#### Scenario: Observe label names the active visitor
- **WHEN** the second visitor is the active visitor
- **THEN** Observe control labelling or status copy identifies that visitor
