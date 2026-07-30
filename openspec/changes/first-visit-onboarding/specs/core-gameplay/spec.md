## ADDED Requirements

### Requirement: Onboarding teaches the visit loop without changing rules
Guided first-visit onboarding and contextual coaching SHALL teach the visit-bounded core loop (welcome, guest motive, move near, observe, review clues, scare while close, repeat) without modifying fear profiles, informative outcomes, failed-scare glimpses, fear stage progression, energy, score, route timing, or child-friendly content constraints.

#### Scenario: Tutorial does not bypass fear rules
- **GIVEN** guided onboarding is active during the first Nora visit
- **WHEN** the player performs Observe and scare casts
- **THEN** existing observation, scare-cast exposure, fear, energy, score, and novelty rules still apply
- **AND** onboarding only advances presentation state

## MODIFIED Requirements

### Requirement: Visit-bounded core loop
The core gameplay loop SHALL be bounded by a visit: the ghost waits in the hotel, a visitor from the deterministic registry arrives and becomes targetable, the player observes and scares using existing rules against that visitor’s fear profile, then the visitor departs haunted or unimpressed and results appear before the next visit in the sequence. Existing fear profiles, informative outcomes, failed-scare glimpses, fear stage progression, and child-friendly content constraints SHALL remain in force during active haunting for every registered visitor. The second visitor SHALL require a different successful scare strategy from Nora (different primary fear). The first Nora visit of a browser session MAY include guided onboarding that teaches this loop without changing those rules.

#### Scenario: Ghost waits before the visitor
- **WHEN** the hotel is location ready
- **THEN** the ghost is controllable in the hotel
- **AND** no visitor is targetable yet

#### Scenario: Existing scare rules apply during active haunting
- **GIVEN** Nora is visiting and targetable
- **WHEN** the player observes and performs scare casts
- **THEN** existing observation, clue, scare-cast exposure, fear, energy, score, and novelty rules still apply

#### Scenario: Second visitor uses the same core rules with a different primary fear
- **GIVEN** the second visitor is visiting and targetable
- **WHEN** the player observes and performs scare casts
- **THEN** existing observation, scare-cast exposure, fear, energy, score, and novelty rules still apply
- **AND** that visitor’s primary fear differs from Nora’s Whisper

#### Scenario: First Nora visit may include guided onboarding
- **GIVEN** a new browser session’s first visit is Nora
- **WHEN** the lobby is ready or Nora becomes targetable
- **THEN** guided onboarding MAY show welcome and subsequent prompts
- **AND** core fear and score rules remain unchanged

### Requirement: Performing scare is visible in the world
During the scare performing phase, the ghost SHALL look like it is casting whether or not it is in range. The active visitor SHALL show a mild mid-cast reaction only while they remain in range of the casting ability. Content SHALL remain child-friendly. Scenarios that explicitly test the first Nora tutorial visit MAY name Nora.

#### Scenario: Ghost and visitor during a valid cast
- **WHEN** an affordable scare cast is in progress and the ghost stays in range
- **THEN** the ghost shows a casting presentation
- **AND** the active visitor shows a mild mid-cast reaction
- **AND** both remain suitable for ages 7+

#### Scenario: Movement slows while performing
- **GIVEN** the ghost can move at normal speed before casting
- **WHEN** a scare cast is in progress and the player keeps moving
- **THEN** ghost world travel speed eases down to roughly one-eighth the non-casting speed
- **AND** the casting presentation remains visible

#### Scenario: Speed eases back after cast
- **GIVEN** a scare cast completes, is switched, or is cancelled
- **WHEN** the player keeps moving
- **THEN** ghost world travel speed eases back to normal over a short transition rather than snapping instantly

#### Scenario: Nora mid-cast during first tutorial visit
- **GIVEN** an affordable scare cast is in progress during the first Nora visit and the ghost stays in range
- **WHEN** the cast continues
- **THEN** Nora shows a mild mid-cast reaction
