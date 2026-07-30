## ADDED Requirements

### Requirement: Scare casts may link hauntable props
Starting an affordable scare cast while the visitor is targetable MAY link a compatible hauntable lobby prop when the ghost is within that prop’s activation radius. Linking SHALL NOT change cast duration, leave-range exposure rules, same-scare lockout, switch-scare cancel, energy spend timing, or exposure-scaled resolve maths. Combo score evaluation SHALL occur after existing scare outcome application and SHALL NOT alter fear matching or exposure classification.

#### Scenario: Linked cast still resolves with exposure rules
- **GIVEN** a Whisper cast is linked to the crooked portrait
- **WHEN** the cast completes with partial exposure
- **THEN** energy, fear, and scare score follow existing partial-exposure rules
- **AND** any environmental combo bonus is evaluated separately afterward

#### Scenario: Unlinked cast behaviour unchanged
- **GIVEN** no prop is linked
- **WHEN** a scare cast completes
- **THEN** outcomes match existing scare-cast rules with no combo bonus
