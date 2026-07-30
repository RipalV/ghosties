## ADDED Requirements

### Requirement: Guided first-visit step sequence
The game SHALL provide a guided onboarding sequence during the first Nora visit of the current browser session that introduces, in order: (1) moving the ghost near Nora, (2) using Observe, (3) reviewing a discovered clue, (4) choosing a scare informed by that clue, (5) remaining in range while the scare casts, (6) understanding full, partial, and zero exposure outcomes, (7) reading the visit result, and (8) starting the next visit. Each step SHALL show one short family-friendly instruction at a time and SHALL advance only after the corresponding gameplay action or outcome occurs. Invalid or unrelated events SHALL NOT advance the current step.

#### Scenario: First Nora visit initializes onboarding
- **GIVEN** a new browser session begins and the first visit is Nora
- **WHEN** Nora becomes targetable for active haunting
- **THEN** guided onboarding starts at the move-near step
- **AND** a short instruction is shown without a blocking modal

#### Scenario: Step advances only on the matching event
- **GIVEN** onboarding is on the Observe step
- **WHEN** the player completes an Observe that unlocks a clue
- **THEN** onboarding advances to the review-clue step
- **AND** unrelated scare events do not skip ahead

#### Scenario: Invalid event does not advance
- **GIVEN** onboarding is on the move-near step
- **WHEN** the player activates Observe while still out of observation range
- **THEN** the move-near step remains active
- **AND** fear, score, and energy are unchanged by the onboarding layer

### Requirement: Onboarding does not mutate gameplay outcomes
Guided onboarding and its presentation SHALL NOT change fear, score, energy, route timing, clue discovery rules, scare-cast rules, exposure maths, or success conditions. Tutorial progression SHALL be implemented as pure TypeScript rules independent of Phaser.

#### Scenario: Same scare sequence yields same outcomes with tutorial active
- **GIVEN** identical scare and exposure inputs
- **WHEN** outcomes are resolved with guided onboarding active
- **THEN** fear, score, and energy deltas match the same inputs without onboarding
- **AND** visitor route timing is unchanged

### Requirement: Skip and complete lifecycle
The player SHALL be able to skip guided onboarding at any time via a visible Skip help control. Completing the final step or skipping SHALL mark onboarding finished for the current browser session so the full guided sequence does not appear again during later visits in that session. Reloading the page MAY reset onboarding because persistence is out of scope. Tutorial state SHALL remain separate from haunting-session, visitor, clue, and fear state.

#### Scenario: Skip ends the full sequence for the session
- **GIVEN** guided onboarding is active during the first Nora visit
- **WHEN** the player activates Skip help
- **THEN** guided instructions and highlights clear
- **AND** the full guided sequence does not restart on later visits in the same browser session

#### Scenario: Completion prevents re-show on later visits
- **GIVEN** the player completed the guided sequence including Next visit
- **WHEN** a later visit begins in the same browser session
- **THEN** the full guided onboarding sequence does not start

#### Scenario: Milo does not run full onboarding
- **GIVEN** onboarding was completed or skipped during the first Nora visit
- **WHEN** Milo’s visit becomes active
- **THEN** the full guided step sequence does not appear

### Requirement: Tutorial cleanup on session transitions
Active guided instruction and highlight presentation SHALL clear when visitor departure begins, when results are shown, when Skip help is used, and when Next visit starts. Session completion/skip flags SHALL persist across Next visit within the browser session and SHALL NOT be cleared by haunting-session reset of fear, score, energy, clues, or novelty.

#### Scenario: Departure clears tutorial presentation
- **GIVEN** a guided instruction is visible during active haunting
- **WHEN** visitor departure begins
- **THEN** the instruction and highlights clear
- **AND** fear and score remain governed only by existing session rules

#### Scenario: Tutorial flag survives session reset
- **GIVEN** onboarding was skipped or completed
- **WHEN** Next visit resets session-scoped gameplay state
- **THEN** the onboarding completed-or-skipped flag remains set
- **AND** fear, clues, and novelty still reset normally
