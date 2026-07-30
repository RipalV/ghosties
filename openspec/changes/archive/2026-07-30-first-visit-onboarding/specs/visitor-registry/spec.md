## ADDED Requirements

### Requirement: Tutorial presentation uses active visitor naming
Guided onboarding and contextual coaching presentation SHALL resolve visitor display names from the active visitor definition. Full guided onboarding SHALL gate on the first Nora visit of the browser session; later visits SHALL use active-visitor naming for any coaching without re-running the full sequence.

#### Scenario: Coaching names Milo when Milo is active
- **GIVEN** guided onboarding was completed or skipped and Milo is the active visitor
- **WHEN** a contextual hint is shown
- **THEN** copy identifies Milo or uses a visitor-neutral phrasing
- **AND** the hint does not incorrectly call the visitor Nora

## MODIFIED Requirements

### Requirement: Active visitor drives presentation
Arrival cue, objective/status copy, Observe labelling, clue panel, results summary, off-screen indicator, departure messaging, and tutorial/coaching copy SHALL identify the active visitor using that visitor’s content. The UI SHALL NOT show another visitor’s name or clues during the active visit. Guided onboarding MAY name Nora during the first Nora visit only.

#### Scenario: Results name matches active visitor
- **WHEN** results are shown after a visit
- **THEN** the summary visitor name matches the active visitor for that visit

#### Scenario: Clues do not cross visitors
- **GIVEN** clues were discovered for Nora
- **WHEN** Next visit starts the second visitor’s session
- **THEN** Nora’s clues are not listed in the second visitor’s clue panel

#### Scenario: Tutorial copy follows active visitor after first Nora visit
- **GIVEN** guided onboarding is finished and Milo is visiting
- **WHEN** a contextual coaching hint appears
- **THEN** the hint does not label Milo as Nora
