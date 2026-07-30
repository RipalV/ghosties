## ADDED Requirements

### Requirement: Prop combo state resets with visit session
When session-scoped gameplay state resets for Next visit or a new visitor becomes targetable, the game SHALL reset hauntable prop visit state including awarded combo flags and any linked prop presentation. Completing or skipping guided onboarding SHALL NOT prevent prop combos on later visits. Departure SHALL clear active prop-cast presentation without awarding a combo for a cancelled cast.

#### Scenario: Next visit clears prop awards
- **GIVEN** a prop combo was awarded in the previous visit
- **WHEN** Next visit resets session-scoped state
- **THEN** prop combo eligibility starts fresh for the next visitor
- **AND** fear, clues, and novelty still reset normally

#### Scenario: Departure does not award combo
- **GIVEN** a prop-linked cast is active
- **WHEN** visitor departure begins
- **THEN** the cast cancels without combo bonus
- **AND** prop casting presentation clears
