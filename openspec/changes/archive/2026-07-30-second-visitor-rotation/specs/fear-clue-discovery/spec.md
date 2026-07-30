## MODIFIED Requirements

### Requirement: Active-haunting-session discovery state
Discovered clues SHALL be recorded for the active haunting visit and remain available for review through that visit’s results. Discovery state and observation-bonus eligibility SHALL reset when the player starts the next visit (Next visit) or when the next visitor becomes targetable after reset. The Next visit control provides the player-facing restart flow for a new haunting visit without reloading the browser. Clues discovered for one visitor SHALL NOT appear during another visitor’s visit.

#### Scenario: Clues persist for the active session
- **GIVEN** the player has discovered one or more clues
- **WHEN** they stop observing and continue playing in the same active haunting visit
- **THEN** those clues remain available for review

#### Scenario: Session restart clears discoveries
- **GIVEN** clues were discovered in the previous visit
- **WHEN** the player chooses Next visit and a new visit begins, or the next visitor becomes targetable after reset
- **THEN** discovery state is reset
- **AND** observation bonus eligibility for the new visit is reset

#### Scenario: Clues remain through results
- **GIVEN** clues were discovered before Nora departed
- **WHEN** results are showing
- **THEN** those clues remain listed or summarised for the visit

#### Scenario: Nora clues do not appear for the second visitor
- **GIVEN** Nora clues were discovered in the previous visit
- **WHEN** the second visitor’s visit is active
- **THEN** the clue panel does not list Nora’s clues
