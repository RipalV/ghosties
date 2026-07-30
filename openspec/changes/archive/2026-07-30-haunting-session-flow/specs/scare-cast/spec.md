## ADDED Requirements

### Requirement: Scare cast cancelled on visit departure
When visitor departing begins, any active scare cast SHALL be cancelled without resolving. Cancelled casts SHALL NOT spend energy, SHALL NOT apply fear or score changes, SHALL NOT update scare history, and SHALL NOT show a resolve reaction. New scare casts SHALL NOT start while departing or during results.

#### Scenario: Departure cancels cast without energy or outcome
- **GIVEN** a scare cast is in progress during active haunting
- **WHEN** visitor departing begins
- **THEN** the cast session returns to idle
- **AND** no energy is spent for that cast
- **AND** no scare outcome is applied

#### Scenario: Cannot start cast while departing
- **GIVEN** the session is visitor departing or results
- **WHEN** the player activates a scare via keyboard or HUD
- **THEN** no scare cast starts
