## ADDED Requirements

### Requirement: Prop combo feedback on landscape mobile
Hauntable prop proximity cues, casting feedback, visitor reaction text, and environmental combo award messages SHALL remain readable on landscape phones, communicate with text/shape/icons rather than colour alone, avoid rapid flashing, and respect safe-area insets. Props SHALL NOT permanently cover movement, Observe, or scare controls with large labels. Combo award feedback SHALL be concise (e.g. “Hotel trick!”) and family-friendly.

#### Scenario: Proximity cue without colour-only signal
- **GIVEN** the ghost is within a prop’s activation radius while a visitor is targetable
- **WHEN** proximity feedback is shown
- **THEN** the cue uses shape, icon, or motion in addition to any colour
- **AND** scare and Observe controls remain usable

#### Scenario: Combo message on landscape
- **WHEN** an environmental combo bonus is awarded on a landscape mobile viewport
- **THEN** a short readable award message appears
- **AND** it does not rely on colour alone
- **AND** it avoids rapid flashing
