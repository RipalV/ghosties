## ADDED Requirements

### Requirement: Active visitor supplies prop reaction copy
Environmental prop reactions and combo status copy SHALL use the active visitor’s display name and authored reaction text (or shared defaults with visitor-specific overrides in typed content). `GameScene` SHALL NOT gain permanent Nora/Milo branching for prop behaviour. Nora and Milo SHALL keep independent session prop state through the existing visit reset.

#### Scenario: Milo prop reaction uses Milo naming
- **GIVEN** Milo is the active visitor and a valid prop combo awards
- **WHEN** visitor reaction text is shown
- **THEN** the copy refers to Milo or the active visitor appropriately
- **AND** `GameScene` does not hard-code Milo-only prop branches

#### Scenario: Separate visits keep separate prop awards
- **GIVEN** Nora’s visit awarded a portrait combo
- **WHEN** Milo’s visit begins after reset
- **THEN** Milo’s prop award state starts empty
- **AND** Nora’s prior award does not block Milo
