## ADDED Requirements

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

## MODIFIED Requirements

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
