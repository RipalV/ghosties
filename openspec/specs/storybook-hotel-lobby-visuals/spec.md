# Storybook Hotel Lobby Visuals Specification

## Purpose

Define the family-friendly haunted-hotel lobby presentation: isometric cutaway art, lighting and ambience, character visuals, and reusable Phaser components that stay separate from gameplay rules.

## Requirements

### Requirement: Storybook haunted-hotel lobby presentation
The game SHALL present the playable room as a cohesive, original, family-friendly haunted-hotel lobby rather than a placeholder grid and rectangle composition. The lobby SHALL include readable walls, flooring, furniture, decorative props, and layered warm interior and soft moonlit illumination without realistic horror, violence, or distressing imagery.

#### Scenario: Lobby is visible at game start
- **WHEN** the playable scene starts
- **THEN** the player sees a coherent storybook haunted-hotel lobby
- **AND** the floor, walls, furniture, and props are visually distinct
- **AND** the lobby remains readable without relying on colour alone

### Requirement: Isometric cutaway room presentation
The lobby SHALL be presented as an isometric cutaway interior: the floor drawn in isometric projection, exactly the two far walls drawn so the interior stays visible, and furniture drawn as volumes with visible tops and sides lit from one consistent direction, each with a soft contact shadow. This look SHALL be achieved with project-owned 2D vector drawing that evokes depth; the game SHALL NOT introduce a 3D renderer, 3D models, or a physics engine.

#### Scenario: Lobby is viewed during play
- **WHEN** the playable scene is running
- **THEN** the floor reads as an isometric plane rather than a flat front-on rectangle
- **AND** only the two far walls are drawn, so furniture and characters are never hidden behind a near wall
- **AND** furniture reads as solid volumes with consistent light direction and contact shadows

### Requirement: Exterior context frames the lobby
The world SHALL extend beyond the lobby walls with a readable night-time exterior — for example garden, path, hedge or fence, trees, and moonlit sky — so that the edges of the view always look deliberate rather than like the room has run out.

#### Scenario: Camera reaches a lobby edge
- **WHEN** the ghost travels to the edge of the lobby in either orientation
- **THEN** the view shows intentional exterior surroundings beyond the walls
- **AND** no blank or unfinished area becomes visible
- **AND** the exterior remains calm and friendly, with no frightening or violent imagery

### Requirement: Lobby world larger than a single view
The lobby SHALL be composed at a world size larger than any single camera view so that the play area can fill any supported viewport without stretching or cropping the room's architecture. The additional space SHALL be furnished with readable architecture and props rather than left empty.

#### Scenario: Extra space is furnished
- **WHEN** the player explores parts of the lobby away from the starting position
- **THEN** those areas contain distinct, readable furniture or props
- **AND** the lobby still reads as one coherent haunted-hotel space

### Requirement: Props read by silhouette rather than labels
Furniture and props SHALL be recognisable from their shape, scale, and detail without permanent on-object text labels. Object names MAY appear only in transient interaction feedback.

#### Scenario: Player looks at the lobby
- **WHEN** the lobby is visible
- **THEN** each prop is identifiable from its silhouette and detailing
- **AND** no permanent text label is drawn on furniture or props

### Requirement: Character markers instead of persistent text
Characters SHALL carry a small floating marker above the head conveying current state, and the NPC SHALL show a slim fear or progress bar. Markers SHALL pair shape or icon with text or numbers rather than relying on colour alone, and detailed reactions SHALL remain transient.

#### Scenario: Nora's state changes
- **WHEN** Nora's fear stage changes
- **THEN** her head marker and fear bar update
- **AND** the change is readable without relying on colour alone
- **AND** any reaction speech remains brief and clears on its own

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
The lobby SHALL include restrained warm lighting, soft moonlight, shadows, ghost glow, and subtle ambient particles that support the room mood without reducing text or control readability. Interior lamps and windows SHALL cast visible warm pools of light against a cooler night-time exterior so the room reads as lit from within.

#### Scenario: Ambience runs during play
- **WHEN** the playable scene is active
- **THEN** layered ambience is visible behind or around the interactive characters
- **AND** interior light pools contrast with the cooler exterior
- **AND** effects do not conceal the HUD or interaction feedback
- **AND** ambient effects avoid rapid flashing
