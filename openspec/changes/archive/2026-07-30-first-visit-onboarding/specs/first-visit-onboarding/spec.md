## ADDED Requirements

### Requirement: Guided first-visit prompt sequence
The game SHALL provide a guided onboarding sequence during the first Nora visit of the current browser session using short OK/Skip prompts with a fun, mischievous tone suitable for ages 7+ and landscape mobile. The sequence SHALL introduce, in order: (1) welcome / game introduction before the guest arrives, (2) guest-arrival motive to achieve a high scare, (3) moving close and using Observe when the guest is targetable (Observe control highlighted), (4) opening the clues panel after Observe unlocks a clue (clues control highlighted), (5) choosing a scare and staying close while it casts after clues are reviewed (scare controls highlighted), and (6) repeating the observe → clues → scare process after a successful scare. Each guided tip SHALL appear as a prompt with **OK** and **Skip help** (both ≥44 CSS px). Invalid or unrelated events SHALL NOT advance the current step.

#### Scenario: Welcome prompt at session start
- **GIVEN** a new browser session begins and guided onboarding has not been finished
- **WHEN** the lobby is ready and the ghost is controllable
- **THEN** a short welcome / introduction prompt is shown
- **AND** the player can choose OK or Skip help

#### Scenario: Motive prompt on guest arrival
- **GIVEN** the welcome prompt was acknowledged (OK) and guided mode is still active
- **WHEN** Nora begins arriving for the first visit
- **THEN** a short prompt explains aiming for a high scare
- **AND** Skip help remains available

#### Scenario: Observe step when guest is targetable
- **GIVEN** guided onboarding is on the move-close-and-observe step
- **WHEN** Nora becomes targetable
- **THEN** a short prompt tells the player to move close and Observe
- **AND** the Observe control is highlighted

#### Scenario: Clues step after Observe unlocks a clue
- **GIVEN** onboarding is on the observe step and the observe prompt was acknowledged
- **WHEN** the player completes an Observe that unlocks a clue
- **THEN** onboarding advances to the review-clues prompt
- **AND** the clues control is highlighted

#### Scenario: Scare step after clues opened
- **GIVEN** onboarding is on the review-clues step
- **WHEN** the player opens the clues panel
- **THEN** onboarding advances to the choose-scare-and-stay-close prompt
- **AND** the scare controls are highlighted

#### Scenario: Repeat step after successful scare
- **GIVEN** onboarding is on the choose-scare step and that prompt was acknowledged
- **WHEN** a scare cast resolves with exposure (not zero/miss)
- **THEN** a short prompt asks the player to repeat the process
- **AND** unrelated miss/zero-exposure resolves do not advance to the repeat step

#### Scenario: Invalid event does not advance
- **GIVEN** onboarding is on the move-close-and-observe step
- **WHEN** the player activates Observe while still out of observation range
- **THEN** the step remains active
- **AND** fear, score, and energy are unchanged by the onboarding layer

### Requirement: OK dismisses prompt; Skip ends guided help
OK SHALL dismiss the current prompt and unlock player controls without advancing the step by itself. Skip help SHALL end the full guided sequence for the current browser session so it does not reappear on later visits. Reloading the page MAY reset onboarding. Tutorial state SHALL remain separate from haunting-session, visitor, clue, and fear state.

#### Scenario: OK clears the prompt without finishing the session
- **GIVEN** a guided prompt is visible on the observe step
- **WHEN** the player activates OK
- **THEN** the prompt closes and controls unlock
- **AND** the step remains observe until Observe completes with a clue

#### Scenario: Skip ends the full sequence for the session
- **GIVEN** guided onboarding is active
- **WHEN** the player activates Skip help
- **THEN** guided prompts clear
- **AND** the full guided sequence does not restart on later visits in the same browser session

#### Scenario: Completing the repeat prompt finishes guided mode
- **GIVEN** the repeat-process prompt is showing
- **WHEN** the player activates OK or Skip help
- **THEN** guided onboarding is marked finished for the session

#### Scenario: Milo does not run full onboarding
- **GIVEN** onboarding was completed or skipped during the first Nora visit
- **WHEN** Milo’s visit becomes active
- **THEN** the full guided step sequence does not appear

### Requirement: Onboarding does not mutate gameplay outcomes
Guided onboarding and its presentation SHALL NOT change fear, score, energy, route timing, clue discovery rules, scare-cast rules, exposure maths, or success conditions. Tutorial progression SHALL be implemented as pure TypeScript rules independent of Phaser.

#### Scenario: Same scare sequence yields same outcomes with tutorial active
- **GIVEN** identical scare and exposure inputs
- **WHEN** outcomes are resolved with guided onboarding active
- **THEN** fear, score, and energy deltas match the same inputs without onboarding
- **AND** visitor route timing is unchanged

### Requirement: Tutorial cleanup on session transitions
Active guided prompts and highlights SHALL clear when Skip help is used, when visitor departure begins (unless a later results-safe tip is specified), and when Next visit starts after guided mode has finished. Session completion/skip flags SHALL persist across Next visit within the browser session and SHALL NOT be cleared by haunting-session reset of fear, score, energy, clues, or novelty.

#### Scenario: Departure clears tutorial presentation
- **GIVEN** a guided prompt or highlight is visible during active haunting
- **WHEN** visitor departure begins
- **THEN** the prompt and highlights clear
- **AND** fear and score remain governed only by existing session rules

#### Scenario: Tutorial flag survives session reset
- **GIVEN** onboarding was skipped or completed
- **WHEN** Next visit resets session-scoped gameplay state
- **THEN** the onboarding completed-or-skipped flag remains set
- **AND** fear, clues, and novelty still reset normally

### Requirement: Mischievous short copy for mobile
Guided prompt copy SHALL be short (about one sentence), fun and mischievous, readable on landscape phones, and SHALL NOT reveal the visitor’s hidden high fear category by name.

#### Scenario: Copy stays short and spoiler-free
- **WHEN** any guided prompt is shown
- **THEN** the text is a brief family-friendly tip
- **AND** it does not name the visitor’s high fear category
