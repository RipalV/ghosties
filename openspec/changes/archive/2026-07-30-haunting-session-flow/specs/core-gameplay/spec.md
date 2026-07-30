## ADDED Requirements

### Requirement: Visit-bounded core loop
The core gameplay loop SHALL be bounded by a visit: the ghost waits in the hotel, a visitor arrives and becomes targetable, the player observes and scares using existing rules, then the visitor departs haunted or unimpressed and results appear before the next visit. Existing fear profiles, informative outcomes, failed-scare glimpses, fear stage progression, and child-friendly content constraints SHALL remain in force during active haunting.

#### Scenario: Ghost waits before the visitor
- **WHEN** the hotel is location ready
- **THEN** the ghost is controllable in the hotel
- **AND** no visitor is targetable yet

#### Scenario: Existing scare rules apply during active haunting
- **GIVEN** Nora is visiting and targetable
- **WHEN** the player observes and performs scare casts
- **THEN** existing observation, clue, scare-cast exposure, fear, energy, score, and novelty rules still apply
