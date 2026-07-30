## ADDED Requirements

### Requirement: Coaching may hint at prop combos after guided mode
After guided onboarding is completed or skipped, contextual coaching SHALL be able to show a brief hint when the ghost is near an unused hauntable prop while a visitor is targetable, encouraging trying a matching scare for a hotel trick. The hint SHALL NOT reveal visitor high fears, SHALL NOT pause the visitor, and SHALL NOT add new steps to the guided first Nora onboarding sequence.

#### Scenario: Prop combo hint after onboarding
- **GIVEN** guided onboarding is finished for the session and the visitor is targetable
- **WHEN** the ghost remains near an unused compatible prop and coaching eligibility runs
- **THEN** a brief hint MAY encourage a hotel prop scare
- **AND** the hint does not name the visitor’s high fear category

#### Scenario: No new guided onboarding steps
- **GIVEN** guided onboarding is still active
- **WHEN** the ghost nears a hauntable prop
- **THEN** the full guided step sequence does not insert a dedicated prop step
- **AND** existing welcome → motive → observe → clues → scare → repeat order remains unchanged
