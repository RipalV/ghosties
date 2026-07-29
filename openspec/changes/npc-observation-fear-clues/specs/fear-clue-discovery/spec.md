## ADDED Requirements

### Requirement: Typed NPC fear and clue definitions
Each target NPC SHALL be defined with strongly typed, reusable content that includes a primary hidden fear matching a scare category, optional secondary dislikes, and multiple authored clues. Each clue SHALL include a category (dialogue, body language, nearby objects, or environmental reaction), accessible text, reveal order or reveal conditions, and MAY include a fair personality detail that does not unfairly imply the wrong scare as the answer. Definitions SHALL live outside Phaser scene code.

#### Scenario: Nora content is data-driven
- **WHEN** the playable scene loads Nora
- **THEN** her primary fear, clue list, and observation tuning come from typed content definitions
- **AND** the scene does not hard-code Nora's clue strings as permanent scene logic

### Requirement: Progressive clue discovery
Observation SHALL reveal clues progressively rather than all at once. The game SHALL NOT display the NPC's primary hidden fear label as a direct spoiler before the player has had the chance to discover the authored useful clues. Duplicate discovery of the same clue in a round SHALL be prevented.

#### Scenario: Clues unlock over observation progress
- **GIVEN** Nora has multiple authored clues with reveal thresholds
- **WHEN** observation progress crosses the next threshold
- **THEN** exactly the next undiscovered eligible clue is revealed
- **AND** previously discovered clues are not re-awarded as new discoveries

#### Scenario: Primary fear is not labelled early
- **GIVEN** the player has not yet discovered Nora's useful authored clues
- **WHEN** the clue UI is shown
- **THEN** it does not directly name Nora's primary fear as a completed answer label

### Requirement: Round-scoped discovery state
Discovered clues SHALL be recorded for the current haunting round and remain available for review until the round resets. Starting a new haunting round SHALL clear discovery state.

#### Scenario: Clues persist for the round
- **GIVEN** the player has discovered one or more clues
- **WHEN** they stop observing and continue playing in the same round
- **THEN** those clues remain available for review

#### Scenario: New round clears discoveries
- **GIVEN** clues were discovered in a previous round
- **WHEN** a new haunting round begins
- **THEN** discovery state is reset
- **AND** the observation bonus eligibility for that round is reset

### Requirement: Compact accessible clue review
The game SHALL present discovered clues in a compact, mobile-friendly review panel with accessible text for every clue, including clues that also use animation, symbols, or body language. The panel SHALL NOT cover essential scare controls or block primary movement input on landscape phones.

#### Scenario: Player reviews clues before a scare
- **WHEN** the player opens the clue review UI after discovering clues
- **THEN** each discovered clue shows accessible text and a non-colour-only category cue
- **AND** the scare action grid remains reachable
- **AND** the play area remains usable for movement outside the panel

### Requirement: Observation bonus for informed matching scare
When the player uses a scare that matches the NPC's primary hidden fear after discovering at least one useful (non-personality-only) clue this round, the game SHALL award a small observation score bonus at most once per round. The bonus SHALL NOT change fear gain, novelty, energy spend, or ineffective-scare penalties. Observation itself SHALL never deduct score or energy.

#### Scenario: Matching scare after observation earns a small bonus
- **GIVEN** the player has discovered at least one useful clue about Nora this round
- **AND** the observation bonus has not yet been granted this round
- **WHEN** they successfully use the scare matching Nora's primary fear within range
- **THEN** the existing successful-scare outcome still applies
- **AND** a small additional observation score bonus is granted once

#### Scenario: Incorrect scare behaviour unchanged
- **GIVEN** the player has discovered clues
- **WHEN** they use an ineffective or mismatched scare within range
- **THEN** existing penalty, resistance, novelty, and failed-scare glimpse behaviour still apply
- **AND** no observation bonus is granted

#### Scenario: Bonus not granted twice in one round
- **GIVEN** the observation bonus was already granted this round
- **WHEN** the player again uses the matching primary-fear scare
- **THEN** no second observation bonus is granted
- **AND** normal scare scoring and novelty still apply

### Requirement: Pure clue and matching logic
Observation bonus eligibility, clue progression, and discovery state updates SHALL be implemented as pure functions or domain modules independent of Phaser, covered by deterministic unit tests.

#### Scenario: Domain rules are unit-tested
- **WHEN** developers run the project's unit tests
- **THEN** progressive discovery, duplicate prevention, round reset, fear matching for bonus eligibility, and interrupt behaviour are covered without requiring Phaser
