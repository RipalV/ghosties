# Scare Cast Specification

## Purpose

Timed scare cast sessions: start when affordable (including out of range), progress independent of range, exposure tracking while in range, resolve on complete with exposure-scaled outcomes, per-ability lockout, and world-space cast presentation for the ghost plus in-range Nora.

## Requirements

### Requirement: Scare cast before resolve
When the player activates an affordable scare, the game SHALL start a timed cast for that ability rather than resolving immediately, whether or not the ghost is currently in that ability’s range. Cast progress SHALL advance for the shared cast duration even while out of range. The scare outcome SHALL apply when cast progress completes, scaled by how long Nora was exposed (time in range during the cast) and by existing fear matching.

#### Scenario: Affordable scare starts a cast out of range
- **WHEN** the ghost has enough energy and the player activates Whisper (or Cold / Object) via keyboard or HUD while farther than Whisper range
- **THEN** a cast session begins for that ability
- **AND** energy is not spent yet
- **AND** fear and score are not updated yet
- **AND** the UI does not treat the attempt as an immediate miss that prevents casting

#### Scenario: Cast progress continues out of range
- **GIVEN** a scare cast is in progress
- **WHEN** the ghost is outside that ability’s range
- **THEN** cast progress continues to advance
- **AND** the cast is not cancelled solely for being out of range

#### Scenario: Cast completion with full exposure
- **GIVEN** a scare cast completes and the ghost spent the full cast duration in range
- **WHEN** the outcome is applied
- **THEN** energy is spent
- **AND** the existing scare resolution, novelty, and feedback apply at full strength for that fear match

#### Scenario: Cast completion with zero exposure
- **GIVEN** a scare cast completes and the ghost was never in range during the cast
- **WHEN** the outcome is applied
- **THEN** no energy is spent
- **AND** no fear gain and no scare score delta from that scare are applied
- **AND** Nora does not show a resolve reaction
- **AND** the status UI explains that Nora was never in range

#### Scenario: Cast completion with partial exposure
- **GIVEN** a scare cast completes and the ghost was in range for only part of the cast
- **WHEN** the outcome is applied
- **THEN** energy is spent
- **AND** fear gain and scare score delta are reduced according to exposure
- **AND** fear matching (high / medium / ineffective) still determines the kind of effect being scaled
- **AND** the status UI explains that Nora was only partly caught

### Requirement: Same-scare lockout during cast
While a scare cast is active for an ability, the game SHALL prevent starting another cast of that **same** ability via HUD or keyboard. Other scare abilities SHALL remain activatable (starting a different scare cancels the previous cast without resolving it, then starts the new cast if eligible).

#### Scenario: Same scare cannot be re-triggered mid-cast
- **GIVEN** Whisper cast is in progress
- **WHEN** the player presses Whisper again (keyboard or HUD)
- **THEN** no second Whisper cast starts
- **AND** the existing Whisper cast continues

#### Scenario: Different scare remains usable
- **GIVEN** Whisper cast is in progress
- **WHEN** the player activates Cold Puff with enough energy
- **THEN** the Whisper cast is cancelled without resolving
- **AND** a Cold Puff cast begins

### Requirement: Exposure tracking while casting
While a scare cast is active, the game SHALL accumulate exposure for the time the ghost remains within that ability’s range. Leaving range SHALL stop accumulating exposure and SHALL clear Nora’s mid-cast reaction, but SHALL NOT cancel the cast or clear cast progress.

#### Scenario: Exposure accumulates in range
- **GIVEN** a scare cast is in progress and the ghost is in range
- **WHEN** time elapses
- **THEN** exposure for that cast increases

#### Scenario: Leaving range pauses exposure only
- **GIVEN** a scare cast is in progress with some exposure already accumulated
- **WHEN** the ghost moves outside that ability’s range
- **THEN** exposure stops increasing
- **AND** cast progress continues
- **AND** Nora’s mid-cast reaction clears
- **AND** the status UI briefly notes that Nora left the spooky zone

#### Scenario: Entering range mid-cast starts Nora reaction
- **GIVEN** a scare cast is in progress and the ghost was out of range at cast start
- **WHEN** the ghost or Nora moves into that ability’s range before the cast completes
- **THEN** Nora shows a mild mid-cast reaction
- **AND** exposure begins accumulating
- **AND** the status UI briefly notes that Nora is in the spooky zone

### Requirement: Shared cast duration and pure rules
All starting scare abilities SHALL share the same cast duration for this change. Cast start, progress, exposure, complete, same-scare lockout, and exposure-scaled outcome helpers SHALL be implemented as pure functions or domain modules independent of Phaser, covered by deterministic unit tests.

#### Scenario: Domain rules are unit-tested
- **WHEN** developers run the project's unit tests
- **THEN** affordable out-of-range start, progress out of range, exposure accumulation, zero/partial/full exposure completion signalling, same-scare lockout, and switch-scare cancel behaviour are covered without requiring Phaser

#### Scenario: Shared duration for all scares
- **WHEN** Whisper, Cold Puff, and Object Nudge casts are started
- **THEN** each uses the same configured cast duration

### Requirement: Ghost visual while casting
While a scare cast is in progress, the controllable ghost SHALL show a clear, non-colour-only casting presentation whether or not the ghost is in range. The casting look SHALL clear when the cast completes, is switched, or is cancelled by Observe.

#### Scenario: Ghost looks different during cast out of range
- **WHEN** a scare cast is in progress while the ghost is out of range
- **THEN** the ghost’s world visual still shows the casting presentation
- **AND** the change does not rely on colour alone

### Requirement: Nora mid-cast reaction while affected
While a scare cast is in progress and the ghost remains within that ability’s range, Nora SHALL show a mild, family-friendly mid-cast reaction. When the ghost leaves range, that mid-cast reaction SHALL clear without cancelling the cast. On cast complete, the resolve reaction (including miss / partial / full messaging) SHALL replace the mid-cast look.

#### Scenario: Nora reacts mid-cast while in range
- **GIVEN** Whisper cast is in progress and the ghost is within Whisper range
- **WHEN** the cast continues
- **THEN** Nora shows a mild mid-cast reaction

#### Scenario: Nora mid-cast clears without cancelling cast
- **GIVEN** a scare cast is in progress with Nora showing a mid-cast reaction
- **WHEN** the ghost moves outside that ability’s range
- **THEN** Nora’s mid-cast reaction clears
- **AND** the scare cast continues

### Requirement: Cast movement slowdown while performing
While a scare cast is in progress, the controllable ghost SHALL ease toward roughly one-eighth its normal world travel speed. When the cast completes, is switched, or is cancelled, movement speed SHALL ease back to normal over a short transition rather than changing instantly. Casting presentation SHALL remain visible during the slowdown.

#### Scenario: Ghost slows down during cast
- **GIVEN** the ghost is moving at normal speed while idle
- **WHEN** the player starts an affordable scare cast and continues moving
- **THEN** the ghost’s world travel speed eases down to approximately one-eighth the normal movement speed
- **AND** the casting presentation remains visible

#### Scenario: Ghost speed eases back after cast
- **GIVEN** a scare cast completes, is switched, or is cancelled by Observe
- **WHEN** the player moves the ghost
- **THEN** world travel speed eases back to the normal non-casting speed over a short transition
