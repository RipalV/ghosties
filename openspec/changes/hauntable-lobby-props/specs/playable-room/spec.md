## ADDED Requirements

### Requirement: Scene coordinates props without owning combo rules
`GameScene` SHALL wire hauntable prop presentation to cast start/complete/cancel, visitor targetability, departure, and visit reset while delegating eligibility, linking, combo award, and once-per-visit tracking to pure prop modules. Prop visual effects SHALL live in a focused reusable presentation component rather than as permanent hard-coded effect trees inside the scene. Fixed world coordinates SHALL remain the source of truth for prop positions and radii.

#### Scenario: Cast near prop shows presentation via component
- **GIVEN** the ghost starts a compatible scare in a prop’s activation radius while the visitor is targetable
- **WHEN** the cast is active
- **THEN** the prop presentation component shows casting feedback
- **AND** combo award decisions come from pure rules, not scene-local maths

#### Scenario: Scene does not hard-code combo score
- **GIVEN** a valid environmental combo resolve
- **WHEN** score is updated
- **THEN** the bonus amount comes from typed content / pure helpers
- **AND** fear application still uses the existing fear engine path
