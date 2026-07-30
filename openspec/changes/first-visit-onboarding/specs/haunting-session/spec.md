## ADDED Requirements

### Requirement: Tutorial cleanup aligns with visit transitions
When visitor departing begins, when results are shown, and when Next visit starts, the game SHALL clear active guided-instruction and highlight presentation per onboarding rules. Completing or skipping onboarding SHALL prevent the full guided sequence from starting on subsequent visits in the same browser session while contextual coaching MAY continue. Haunting-session reset of fear, score, energy, clues, and novelty SHALL NOT clear the session onboarding completed-or-skipped flag.

#### Scenario: Results step can complete onboarding
- **GIVEN** guided onboarding is on the read-results step
- **WHEN** the visit results summary is shown
- **THEN** onboarding may advance to the start-next-visit step
- **AND** results content still follows existing visit-results rules

#### Scenario: Next visit does not re-run full onboarding
- **GIVEN** onboarding was completed or skipped in the first Nora visit
- **WHEN** Next visit starts the next visitor
- **THEN** the full guided sequence does not start
- **AND** session gameplay state still resets normally

## MODIFIED Requirements

### Requirement: Visit results summary and next visit
After departure completes, the game SHALL show a mobile-friendly results summary including the active visitor’s name, haunted or unimpressed outcome, final fear stage, total session score, clue-informed bonus contribution, novelty and ineffective-scare effects in friendly language, clues discovered for that visit, and a short improvement tip. A touch-friendly Next visit action (≥44 CSS px) SHALL start the next visitor in the deterministic sequence without reloading the browser while the ghost remains in the hotel. Guided onboarding MAY highlight the results summary and Next visit control during the first Nora visit without changing results content.

#### Scenario: Results explain the visit
- **WHEN** the session enters results after a visitor departs
- **THEN** the summary shows the required outcome fields in readable family-friendly language
- **AND** interactive targets meet the ≥44 CSS px touch floor on landscape phones

#### Scenario: Next visit without reload
- **GIVEN** results are showing
- **WHEN** the player activates Next visit
- **THEN** session-scoped state resets for a new visit
- **AND** the ghost and hotel remain present
- **AND** the browser does not reload
- **AND** the next visitor in the deterministic sequence becomes the active visitor

#### Scenario: Results name the active visitor
- **WHEN** results are shown after the second visitor departs
- **THEN** the summary uses that visitor’s display name
- **AND** does not label the visit as Nora’s

#### Scenario: First tutorial visit results may teach Next visit
- **GIVEN** guided onboarding is on the read-results or start-next-visit step after Nora departs
- **WHEN** results are shown
- **THEN** onboarding may highlight the results or Next visit control
- **AND** results fields remain unchanged by the tutorial layer

### Requirement: Session-scoped reset between visits
When a new visit becomes active (visitor targetable) or when Next visit prepares a fresh visit, the game SHALL reset fear, session score, energy to the configured starting value, scare usage and novelty history, discovered clues, observation progress and bonus eligibility, active casts, scare history, and temporary reactions or messages. The ghost position and hotel world SHALL persist. Reset SHALL clear the previous visitor’s discovery and route progress so no clue, fear, route, score, cast, or reaction state leaks into the next visitor’s session. Tutorial completed-or-skipped state for the browser session SHALL NOT be cleared by this reset.

#### Scenario: Reset clears session state
- **GIVEN** a previous visit ended with score, clues, and scare history
- **WHEN** the next visit begins and a visitor becomes targetable
- **THEN** those session-scoped values are reset
- **AND** the ghost remains in the hotel

#### Scenario: No state leaks across different visitors
- **GIVEN** Nora’s visit ended with discovered clues and scare novelty history
- **WHEN** Next visit starts the second visitor and they become targetable
- **THEN** discovery, novelty, fear, route progress, and observation bonus eligibility start fresh for the second visitor
- **AND** Nora’s clues do not appear in the second visitor’s session

#### Scenario: Onboarding flag survives reset
- **GIVEN** guided onboarding was skipped or completed
- **WHEN** Next visit resets session-scoped gameplay state
- **THEN** the onboarding completed-or-skipped flag remains set
