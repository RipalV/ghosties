## ADDED Requirements

### Requirement: Typed haunting session phases
The game SHALL model a haunting visit with typed phases: location ready, visitor announced, visitor entering, active haunting, visitor departing, and results. Phase transitions SHALL be implemented as pure domain rules independent of Phaser. The ghost SHALL remain present and controllable in the hotel across visits without a browser reload.

#### Scenario: Boot starts location ready
- **GIVEN** a new playable scene session begins
- **WHEN** the hotel loads
- **THEN** the session phase is location ready
- **AND** the ghost is present and controllable
- **AND** no visitor is targetable

#### Scenario: Phase order through one visit
- **WHEN** a Nora visit proceeds from announcement through results
- **THEN** phases advance in order through visitor announced, visitor entering, active haunting, visitor departing, and results
- **AND** illegal skips that would start active haunting before the visitor is targetable are rejected by the domain rules

### Requirement: Active haunting starts when visitor is targetable
The active haunting phase SHALL begin only when the visitor reaches the configured entry point and becomes targetable. Observe and scare activation SHALL require an active targetable visitor.

#### Scenario: Controls blocked before targetable
- **GIVEN** the session is location ready, visitor announced, or visitor entering
- **WHEN** the player activates Observe or a scare
- **THEN** the action does not start against Nora
- **AND** the UI indicates there is no active visitor yet

#### Scenario: Session becomes active at entry
- **GIVEN** Nora is entering
- **WHEN** she reaches the configured entry point
- **THEN** presence becomes visiting
- **AND** the session phase becomes active haunting
- **AND** Observe and scare may start subject to existing range and energy rules

### Requirement: Successful or unimpressed departure
Departure SHALL begin when the configured successful-haunting condition is met during active haunting, or when the authored visit route completes without that condition. Successful visits SHALL report a haunted outcome; route-complete failures SHALL report an unimpressed outcome. Content SHALL remain family-friendly and SHALL NOT use harsh game-over language.

#### Scenario: Successful haunted departure
- **GIVEN** active haunting is in progress
- **WHEN** Nora reaches the configured success condition
- **THEN** the session enters visitor departing
- **AND** the eventual results outcome is haunted

#### Scenario: Unimpressed route completion
- **GIVEN** active haunting is in progress and success has not been met
- **WHEN** Nora finishes her authored visit route
- **THEN** the session enters visitor departing
- **AND** the eventual results outcome is unimpressed

### Requirement: Departure cancels observation and scare casts safely
When visitor departing begins, the game SHALL prevent starting new observations and scare casts, SHALL cancel any in-progress observation, and SHALL cancel any active scare cast without spending energy and without applying fear, score, scare history, or resolve reactions for that cast.

#### Scenario: Departure cancels observation
- **GIVEN** observation is in progress during active haunting
- **WHEN** departure begins
- **THEN** observation returns to idle with progress cleared
- **AND** already discovered clues remain available until results are dismissed or the next visit resets

#### Scenario: Departure cancels scare cast without outcome
- **GIVEN** a scare cast is in progress during active haunting
- **WHEN** departure begins
- **THEN** the cast is cancelled
- **AND** no energy is spent for that cast
- **AND** no scare outcome is applied

### Requirement: Visit results summary and next visit
After departure completes, the game SHALL show a mobile-friendly results summary including visitor name, haunted or unimpressed outcome, final fear stage, total session score, clue-informed bonus contribution, novelty and ineffective-scare effects in friendly language, clues discovered, and a short improvement tip. A touch-friendly Next visit action (≥44 CSS px) SHALL start another visit without reloading the browser while the ghost remains in the hotel.

#### Scenario: Results explain the visit
- **WHEN** the session enters results after Nora departs
- **THEN** the summary shows the required outcome fields in readable family-friendly language
- **AND** interactive targets meet the ≥44 CSS px touch floor on landscape phones

#### Scenario: Next visit without reload
- **GIVEN** results are showing
- **WHEN** the player activates Next visit
- **THEN** session-scoped state resets for a new visit
- **AND** the ghost and hotel remain present
- **AND** the browser does not reload

### Requirement: Session-scoped reset between visits
When a new visit becomes active (visitor targetable) or when Next visit prepares a fresh visit, the game SHALL reset fear, session score, energy to the configured starting value, scare usage and novelty history, discovered clues, observation progress and bonus eligibility, active casts, scare history, and temporary reactions or messages. The ghost position and hotel world SHALL persist.

#### Scenario: Reset clears session state
- **GIVEN** a previous visit ended with score, clues, and scare history
- **WHEN** the next visit begins and Nora becomes targetable
- **THEN** those session-scoped values are reset
- **AND** the ghost remains in the hotel
