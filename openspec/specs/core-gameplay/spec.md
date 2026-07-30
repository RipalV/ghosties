# Core Gameplay Specification

## Purpose

Define the stable rules for the first family-friendly ghost haunting prototype.

## Requirements

### Requirement: Ghost movement

The player SHALL control an invisible ghost using keyboard movement or pointer/touch movement.

### Requirement: NPC fear profile

Each target NPC SHALL have high-effect, medium-effect, and ineffective scare categories.

### Requirement: Informative outcomes

Every scare attempt SHALL visibly communicate whether it was effective, partially effective, out of range, repeated, or ineffective.

### Requirement: Failed scare glimpse

When an ineffective scare is used successfully within range, the NPC SHALL briefly see a comedic glimpse of the ghost and the player SHALL lose points.

### Requirement: Fear progression

NPC fear SHALL progress through calm, curious, uneasy, frightened, runaway, swoon, and possessed states.

### Requirement: Child-friendly content

The prototype SHALL NOT contain death, injury, combat, blood, weapons, or realistic violence.

### Requirement: Observation informs scare choice without replacing fear rules
The core gameplay loop SHALL allow players to observe NPCs and discover clues that inform scare selection. Existing fear profiles (high, medium, ineffective), informative scare outcomes, failed-scare glimpses, fear stage progression, and child-friendly content constraints SHALL remain in force. Observation SHALL NOT be required to complete a haunting.

#### Scenario: Player can still scare without observing
- **WHEN** the player uses a scare ability without having observed the NPC
- **THEN** existing fear resolution, energy spend, novelty, and scoring still apply
- **AND** the haunt can still progress through fear stages

#### Scenario: Child-friendly observation content
- **WHEN** observation clues or reactions are shown
- **THEN** content remains suitable for ages 7+
- **AND** it contains no death, injury, combat, blood, weapons, or realistic violence
- **AND** ghosts remain magical Boo Realm creatures rather than dead humans
