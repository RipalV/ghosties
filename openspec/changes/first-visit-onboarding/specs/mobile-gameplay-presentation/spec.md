## ADDED Requirements

### Requirement: Tutorial instruction presentation on mobile
Guided onboarding instructions, contextual coaching hints, relevant control or visitor highlights, and Skip help SHALL remain readable on landscape phones, communicate with text and icons rather than colour alone, avoid rapid flashing, respect safe-area insets, and keep interactive targets at least 44 CSS pixels. Tutorial UI SHALL NOT use a blocking modal during active gameplay and SHALL NOT permanently cover movement, Observe, or scare controls.

#### Scenario: Instruction chip on landscape
- **WHEN** a guided onboarding instruction is shown on a landscape mobile viewport
- **THEN** the instruction text is readable
- **AND** Skip help is at least 44 CSS px
- **AND** Observe and scare controls remain usable

#### Scenario: Highlight without colour-only meaning
- **WHEN** onboarding highlights the Observe control
- **THEN** the highlight uses shape or icon affordance in addition to any colour
- **AND** gameplay input is not blocked

## MODIFIED Requirements

### Requirement: NPC remains findable off-screen
When an NPC relevant to the current objective is outside the visible view, the game SHALL show a readable on-screen indicator giving the NPC's direction and approximate distance. The indicator SHALL identify the active visitor by name or icon rather than colour alone.

#### Scenario: Active visitor walks out of view
- **WHEN** the active visitor’s routine takes them outside the current camera view
- **THEN** an indicator shows their direction and approximate distance
- **AND** the indicator identifies them by name or icon rather than colour alone
- **AND** the indicator disappears once they are visible again

#### Scenario: Nora walks out of view during first tutorial visit
- **GIVEN** guided onboarding is active during the first Nora visit
- **WHEN** Nora's routine takes her outside the current camera view
- **THEN** an indicator shows her direction and approximate distance
- **AND** the indicator identifies her by name or icon rather than colour alone

### Requirement: Compact floating HUD of chips and corner controls
The HUD SHALL follow a floating-chip layout: resource and score values as small pill chips along the top edge, each pairing a round icon with its value; the current objective as a single rounded icon button in a top corner carrying a notification marker when it needs attention; and status feedback as a transient message rather than permanent full-width text. HUD elements SHALL respect safe-area insets, SHALL communicate state with text, shape, or icons rather than colour alone, and SHALL together occupy a small fraction of the screen so the play area stays dominant. Fear chip labelling SHALL refer to the active visitor rather than always saying Nora.

#### Scenario: Player reads status while playing
- **WHEN** the game is running on a phone
- **THEN** score, ghost energy, and the active visitor’s fear are readable as top-edge chips
- **AND** the objective is reachable from a top-corner icon button
- **AND** HUD elements do not overlap each other, the safe areas, or the scare controls
- **AND** status feedback appears briefly and then clears

#### Scenario: Objective needs attention
- **WHEN** the objective changes or completes
- **THEN** the objective button shows a notification marker
- **AND** the marker is distinguishable by shape or icon rather than colour alone
