## ADDED Requirements

### Requirement: Visit arrival, departure, and results on mobile
Arrival cues, departure feedback, the results summary, and the Next visit control SHALL remain readable on landscape phones, communicate state without colour alone, avoid rapid flashing, and keep interactive targets at least 44 CSS pixels. The results overlay SHALL NOT permanently block keyboard, mouse, or touch movement once dismissed or after Next visit.

#### Scenario: Results usable on a landscape phone
- **WHEN** results are shown on a landscape mobile viewport
- **THEN** outcome text is readable
- **AND** the Next visit control is at least 44 CSS px
- **AND** the overlay does not rely on colour alone for the haunted vs unimpressed outcome

#### Scenario: Arrival cue on landscape
- **WHEN** a visitor is announced on a landscape phone
- **THEN** the arrival cue is readable without covering essential movement controls
