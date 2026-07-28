## ADDED Requirements

### Requirement: Storybook haunted-hotel lobby presentation
The game SHALL present the playable room as a cohesive, original, family-friendly haunted-hotel lobby rather than a placeholder grid and rectangle composition. The lobby SHALL include readable walls, flooring, furniture, decorative props, and layered warm interior and soft moonlit illumination without realistic horror, violence, or distressing imagery.

#### Scenario: Lobby is visible at game start
- **WHEN** the playable scene starts
- **THEN** the player sees a coherent storybook haunted-hotel lobby
- **AND** the floor, walls, furniture, and props are visually distinct
- **AND** the lobby remains readable without relying on colour alone

### Requirement: Reusable visual composition
Lobby environment, ambience, character presentation, and HUD visuals SHALL be implemented as reusable focused Phaser components with typed visual configuration separate from fear rules, scoring, and NPC behavior.

#### Scenario: Scene coordinates reusable components
- **WHEN** the playable scene is created
- **THEN** it coordinates reusable environment, ambience, character, and HUD components
- **AND** it does not contain the permanent implementation of visual definitions or effect behavior
- **AND** existing gameplay rules remain in their current focused modules

### Requirement: Friendly character presentation and animation
The ghost and NPC SHALL use original vector-style or project-owned visuals with subtle idle and movement animation. Scare reactions SHALL remain readable, brief, funny, and non-violent.

#### Scenario: Character is idle
- **WHEN** the ghost or NPC is not moving
- **THEN** each character shows a subtle idle animation
- **AND** the animation does not rapidly flash or obscure the character

#### Scenario: Scare resolves
- **WHEN** the player uses a scare within range
- **THEN** the ghost and NPC show an ability-appropriate readable reaction
- **AND** an ineffective scare remains comedic and informative

### Requirement: Layered lobby ambience
The lobby SHALL include restrained warm lighting, soft moonlight, shadows, ghost glow, and subtle ambient particles that support the room mood without reducing text or control readability.

#### Scenario: Ambience runs during play
- **WHEN** the playable scene is active
- **THEN** layered ambience is visible behind or around the interactive characters
- **AND** effects do not conceal the HUD or interaction feedback
- **AND** ambient effects avoid rapid flashing
