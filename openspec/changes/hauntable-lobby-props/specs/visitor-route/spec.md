## ADDED Requirements

### Requirement: Routes pass useful hauntable props
Authored Nora and Milo visit routes SHALL place the visitor close enough during active haunting to enter at least one hauntable prop’s visitor reaction radius (via existing POIs or small waypoint adjustments). Route progression SHALL remain the existing deterministic visitor-route system; this change SHALL NOT replace route presence or pause logic. Prop positions remain in fixed world coordinates.

#### Scenario: Nora can reach a useful prop
- **GIVEN** Nora is visiting and following her authored route
- **WHEN** she pauses or travels near a hauntable prop
- **THEN** she enters that prop’s visitor reaction radius at least once during the visit
- **AND** route progression still uses the existing visitor-route helpers

#### Scenario: Milo can reach a useful prop
- **GIVEN** Milo is visiting and following his authored route
- **WHEN** he pauses or travels near a hauntable prop
- **THEN** he enters that prop’s visitor reaction radius at least once during the visit
- **AND** his path or pause lengths remain distinct from Nora’s
