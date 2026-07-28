## ADDED Requirements

### Requirement: Full-bleed play area
The lobby SHALL occupy the entire canvas on any viewport ratio. The HUD SHALL float over the play area and SHALL NOT reserve space that shrinks it, and no letterbox bars or empty margins SHALL surround the play area.

#### Scenario: Game runs on a wide landscape phone
- **WHEN** the game is viewed on a landscape mobile viewport
- **THEN** the lobby fills the canvas from edge to edge
- **AND** no empty bands or letterbox bars are visible beside or below the lobby
- **AND** the HUD is drawn over the lobby rather than beside it

#### Scenario: Landscape viewport is resized
- **WHEN** a landscape viewport changes size, or the window is resized on desktop
- **THEN** the play area continues to fill the canvas
- **AND** characters and HUD text remain a comparable readable size

### Requirement: Automatic camera framing
The game SHALL frame the lobby with an automatic camera that follows the player's ghost, clamped to the lobby world, with a deadzone so the camera only moves when the ghost leaves the middle of the view. Base camera zoom SHALL be derived from the viewport so a consistent slice of the world is visible across devices. The camera SHALL keep a single fixed isometric angle and SHALL NOT support rotation. The game SHALL NOT require the player to pan or zoom to play.

#### Scenario: Ghost moves across the lobby
- **WHEN** the player moves the ghost toward the edge of the view
- **THEN** the camera follows smoothly without abrupt jumps
- **AND** the camera stops at the edges of the lobby world rather than revealing unfinished space
- **AND** the ghost is never obscured by HUD elements

#### Scenario: Player never manages the camera
- **WHEN** the player presses or taps anywhere on the play area
- **THEN** the input is treated as a move command for the ghost
- **AND** no drag-to-pan or rotation gesture exists to interfere with it

### Requirement: Discrete camera zoom
The game SHALL offer a small fixed number of zoom steps around the base zoom, reachable by a visible on-screen control and optionally by a pinch gesture that snaps to the nearest step. The widest step SHALL be clamped so the view never extends beyond the lobby world. Zoom SHALL affect presentation only and SHALL NOT change ability ranges, movement speed, or any scare outcome.

#### Scenario: Player zooms out to see more of the lobby
- **WHEN** the player uses the zoom control or pinches outward
- **THEN** the view changes to the next zoom step rather than scaling freely
- **AND** the view stays within the lobby world
- **AND** HUD chips and controls remain the same readable size

#### Scenario: Zoom does not affect play
- **GIVEN** the player has changed the zoom step
- **WHEN** a scare is attempted at the same world distance from Nora
- **THEN** the outcome is identical to the outcome at the default zoom

### Requirement: NPC remains findable off-screen
When an NPC relevant to the current objective is outside the visible view, the game SHALL show a readable on-screen indicator giving the NPC's direction and approximate distance.

#### Scenario: Nora walks out of view
- **WHEN** Nora's routine takes her outside the current camera view
- **THEN** an indicator shows her direction and approximate distance
- **AND** the indicator identifies her by name or icon rather than colour alone
- **AND** the indicator disappears once she is visible again

### Requirement: Compact floating HUD of chips and corner controls
The HUD SHALL follow a floating-chip layout: resource and score values as small pill chips along the top edge, each pairing a round icon with its value; the current objective as a single rounded icon button in a top corner carrying a notification marker when it needs attention; and status feedback as a transient message rather than permanent full-width text. HUD elements SHALL respect safe-area insets, SHALL communicate state with text, shape, or icons rather than colour alone, and SHALL together occupy a small fraction of the screen so the play area stays dominant.

#### Scenario: Player reads status while playing
- **WHEN** the game is running on a phone
- **THEN** score, ghost energy, and Nora's fear are readable as top-edge chips
- **AND** the objective is reachable from a top-corner icon button
- **AND** HUD elements do not overlap each other, the safe areas, or the scare controls
- **AND** status feedback appears briefly and then clears

#### Scenario: Objective needs attention
- **WHEN** the objective changes or completes
- **THEN** the objective button shows a notification marker
- **AND** the marker is distinguishable by shape or icon rather than colour alone

### Requirement: Character card with a scare action grid
Scare controls SHALL be presented as a compact grid of square action buttons beside a character card in a bottom corner, in the style of a contextual action panel: the card identifies the acting ghost, and each action button shows an icon, its energy cost, and a selected or unavailable state. Each button SHALL have an effective touch target of at least 44 CSS pixels in each dimension, SHALL indicate state without relying on colour alone, and SHALL remain available alongside the existing keyboard shortcuts.

#### Scenario: Player activates a scare by touch
- **WHEN** a player taps a scare action in the grid
- **THEN** the corresponding existing scare ability is used
- **AND** the action briefly reads as selected
- **AND** the control does not require a precision tap
- **AND** the existing keyboard shortcut continues to work

#### Scenario: Ability cannot be afforded
- **WHEN** the ghost has too little energy for a scare
- **THEN** the action reads as unavailable through more than colour
- **AND** activating it explains why in friendly language instead of failing silently

#### Scenario: Panel stays clear of the play area
- **WHEN** the character card and action grid are visible
- **THEN** they occupy one bottom corner rather than a full-width band
- **AND** the rest of the play area remains tappable for movement

### Requirement: Landscape play with portrait guidance
The game SHALL be tuned for landscape play on phones and tablets. When the viewport is portrait or too narrow for comfortable play, the game SHALL show clear, friendly guidance to rotate the device and SHALL block gameplay beneath it until a usable landscape viewport is available.

#### Scenario: Phone is held in portrait
- **WHEN** the mobile viewport is portrait or below the defined usable width
- **THEN** friendly rotate-to-play guidance is visible
- **AND** game controls are not interactable beneath it

#### Scenario: Player rotates the device into landscape
- **WHEN** the device is rotated into a usable landscape viewport
- **THEN** the guidance disappears without needing a reload
- **AND** the play area and HUD lay out to the new viewport
- **AND** gameplay state, score, and NPC fear are preserved

### Requirement: Mobile browser interaction protection
The game page SHALL prevent browser scrolling, accidental text selection, and touch gesture interference during gameplay without preventing the game from receiving touch/pointer input. An optional user-activated full-screen control SHALL be available so players can hide browser chrome where the browser permits it.

#### Scenario: Player drags or taps while playing
- **WHEN** a player interacts with the game on a touch browser
- **THEN** the page does not scroll, select text, or perform a browser gesture
- **AND** intended game touch input continues to reach the game

#### Scenario: Player requests full screen
- **WHEN** the player activates the full-screen control on a browser that supports it
- **THEN** the game enters full screen and re-lays out to the new viewport
- **AND** the control can return the game to the normal view
- **AND** the game remains playable when the browser does not support full screen

### Requirement: Crisp rendering on high-density screens
The game SHALL render at the device pixel ratio, up to a sensible cap, so vector art and small HUD text stay sharp on high-density mobile screens without harming performance on ordinary phones.

#### Scenario: Game runs on a high-density phone
- **WHEN** the game is viewed on a screen with a device pixel ratio above 1
- **THEN** HUD text and character outlines render without visible softening
- **AND** the frame rate remains smooth during normal play

### Requirement: Desktop presentation remains usable
The same scene SHALL remain playable in a desktop browser with keyboard and pointer controls, without page scrollbars, and with the camera and HUD adapting to large windows.

#### Scenario: Player uses desktop browser
- **WHEN** the game is viewed in a desktop browser
- **THEN** keyboard movement and pointer movement continue to work
- **AND** the HUD remains legible and anchored to the window corners
- **AND** the page does not create browser scrollbars during normal gameplay
