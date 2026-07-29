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
