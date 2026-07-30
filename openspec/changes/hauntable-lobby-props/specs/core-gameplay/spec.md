## ADDED Requirements

### Requirement: Environmental combos extend the haunt loop without changing fear rules
Players MAY deepen the visit loop by anticipating the visitor’s route, positioning near a matching hauntable lobby prop, and performing a compatible scare to trigger a funny environmental reaction and optional score bonus. Environmental combos SHALL NOT modify fear profiles, exposure scaling, energy rules, novelty, observation bonuses, failed-scare glimpses, fear stage progression, or child-friendly content constraints.

#### Scenario: Combo path still uses existing scare resolve
- **GIVEN** the ghost starts Object Nudge near the reception bell with the visitor nearby
- **WHEN** the cast completes with exposure
- **THEN** fear and energy follow existing scare-cast and fear-engine rules
- **AND** any hotel-trick score bonus is additive only

#### Scenario: Haunt succeeds without using props
- **GIVEN** the player never links a prop during a visit
- **WHEN** they observe and scare using existing rules
- **THEN** the visit can still reach success or unimpressed results
- **AND** core fear progression remains available
