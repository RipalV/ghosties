## ADDED Requirements

### Requirement: Clue review fits floating HUD
The clue review surface SHALL follow the floating-chip HUD language: compact, dismissible or toggleable, safe-area aware, and clear of the bottom-corner scare action grid, the Observe HUD button, and the primary movement area on landscape phones. Clue state SHALL be communicated with text and shape or icons rather than colour alone.

#### Scenario: Clue panel on a landscape phone
- **WHEN** the player opens the clue review UI on a landscape mobile viewport
- **THEN** discovered clues are readable
- **AND** the scare action grid remains usable
- **AND** the Observe HUD button remains usable
- **AND** HUD elements do not rely on colour alone to show locked versus discovered clues

### Requirement: Observe control is touch-friendly
The on-screen Observe control SHALL be a dedicated HUD button with an effective touch target of at least 44 CSS pixels in each dimension, remain available alongside the keyboard Observe shortcut, and indicate unavailable or out-of-range state without relying on colour alone. Observe SHALL NOT be activated by play-area pointer input.

#### Scenario: Player observes by touch on the HUD button
- **WHEN** a player taps the dedicated Observe HUD button while in range
- **THEN** observation starts
- **AND** the control does not require a precision tap
- **AND** the existing keyboard Observe shortcut continues to work

#### Scenario: Play-area tap still moves
- **WHEN** a player taps the play area while in observation range of Nora
- **THEN** the ghost receives a move command
- **AND** observation does not start from that tap

### Requirement: Compact HUD on short landscape viewports
On narrow or short landscape viewports, interactive HUD controls (objective, clues, Observe, scare action grid, ghost card, zoom, and fullscreen) SHALL shrink toward a minimum effective touch target of 44 CSS pixels in each dimension so they obstruct less of the play area. Larger default sizes MAY remain on spacious desktop or large landscape viewports.

#### Scenario: Short landscape phone uses compact controls
- **WHEN** the game is viewed on a short landscape mobile viewport
- **THEN** objective, clues, Observe, scare, ghost card, zoom, and fullscreen controls are smaller than the spacious-desktop defaults
- **AND** each interactive control remains at least 44 CSS pixels in each dimension
- **AND** more of the lobby play area remains visible than with the large default sizes

### Requirement: Clue panel scrolls instead of covering scare controls
The clue review panel SHALL enforce a max height that keeps it clear of the bottom-corner scare action grid and Observe control on landscape phones. When clue content exceeds that height, the list SHALL scroll inside the panel and SHALL show a non-colour-only cue that more content is available below.

#### Scenario: Long clue list on a short landscape phone
- **WHEN** the player opens the clue review UI with enough entries to exceed the panel max height on a short landscape viewport
- **THEN** the scare action grid remains fully visible and usable
- **AND** the Observe HUD button remains fully visible and usable
- **AND** the player can scroll within the panel to read remaining clues
- **AND** a shape or text cue indicates that more clues are available below
