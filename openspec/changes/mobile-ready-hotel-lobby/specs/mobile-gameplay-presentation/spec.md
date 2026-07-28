## ADDED Requirements

### Requirement: Landscape mobile HUD layout
The game SHALL provide a landscape-mobile-ready HUD that keeps score and objective at the top-left, fear and energy at the top-right, and touch-friendly scare controls at the bottom. HUD content SHALL respect mobile safe-area insets and remain separate from the playable lobby area.

#### Scenario: Game runs on a landscape phone
- **WHEN** the game is viewed on a landscape mobile viewport
- **THEN** score and objective appear at the top-left
- **AND** fear and energy appear at the top-right
- **AND** scare controls are reachable along the bottom
- **AND** HUD elements do not overlap each other, safe areas, or the lobby interaction area

### Requirement: Touch-safe scare controls
Each on-screen scare control SHALL have a comfortably touchable target of at least 44 CSS pixels in each dimension, include a concise text label or icon-plus-label, and remain available alongside keyboard shortcuts.

#### Scenario: Player activates a scare by touch
- **WHEN** a player taps a scare control on a landscape touch device
- **THEN** the corresponding existing scare ability is used
- **AND** the control does not require a precision tap
- **AND** the existing keyboard shortcut continues to work

### Requirement: Mobile browser interaction protection
The game page SHALL prevent browser scrolling, accidental text selection, and touch gesture interference during gameplay without preventing the game from receiving touch/pointer input.

#### Scenario: Player drags or taps while playing
- **WHEN** a player interacts with the game on a touch browser
- **THEN** the page does not scroll, select text, or perform a browser gesture
- **AND** intended game touch input continues to reach the game

### Requirement: Portrait guidance
When the available viewport is too narrow for comfortable landscape play, the game SHALL show a clear, friendly portrait-orientation guidance message and block gameplay beneath it until sufficient landscape space is available.

#### Scenario: Phone is held in portrait
- **WHEN** the mobile viewport is in portrait orientation or below the defined usable width
- **THEN** a “rotate to play” guidance message is visible
- **AND** game controls are not interactable beneath the message
- **AND** the message disappears when a usable landscape viewport is restored

### Requirement: Desktop presentation remains usable
The same scene SHALL remain playable in a desktop browser with keyboard and pointer controls, without horizontal page scrolling.

#### Scenario: Player uses desktop browser
- **WHEN** the game is viewed in a desktop browser
- **THEN** keyboard movement and pointer movement continue to work
- **AND** the HUD remains legible
- **AND** the page does not create browser scrollbars during normal gameplay
