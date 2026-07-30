## MODIFIED Requirements

### Requirement: Visit-bounded core loop
The core gameplay loop SHALL be bounded by a visit: the ghost waits in the hotel, a visitor from the deterministic registry arrives and becomes targetable, the player observes and scares using existing rules against that visitor’s fear profile, then the visitor departs haunted or unimpressed and results appear before the next visit in the sequence. Existing fear profiles, informative outcomes, failed-scare glimpses, fear stage progression, and child-friendly content constraints SHALL remain in force during active haunting for every registered visitor. The second visitor SHALL require a different successful scare strategy from Nora (different primary fear).

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
