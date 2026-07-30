## ADDED Requirements

### Requirement: Cast and exposure events feed onboarding and coaching
Scare cast start, in-range stay during cast, and resolve with full, partial, or zero exposure SHALL emit events consumable by pure onboarding and coaching modules without changing cast duration, exposure maths, energy spend, or fear resolution.

#### Scenario: Cast resolve informs exposure teaching step
- **GIVEN** guided onboarding is on the exposure-understanding step
- **WHEN** a scare cast completes with full, partial, or zero exposure
- **THEN** onboarding may advance using that resolve event
- **AND** fear, score, and energy follow existing exposure rules only

#### Scenario: Zero-exposure resolve informs coaching
- **GIVEN** guided onboarding is finished or skipped
- **WHEN** a scare cast completes with zero exposure
- **THEN** coaching eligibility may select a zero-exposure hint
- **AND** no energy is spent and no fear is applied per existing rules

## MODIFIED Requirements

### Requirement: Scare cast before resolve
When the player activates an affordable scare, the game SHALL start a timed cast for that ability rather than resolving immediately, whether or not the ghost is currently in that ability’s range. Cast progress SHALL advance for the shared cast duration even while out of range. The scare outcome SHALL apply when cast progress completes, scaled by how long the active visitor was exposed (time in range during the cast) and by existing fear matching.

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
- **AND** the active visitor does not show a resolve reaction
- **AND** the status UI explains that the visitor was never in range

#### Scenario: Cast completion with partial exposure
- **GIVEN** a scare cast completes and the ghost was in range for only part of the cast
- **WHEN** the outcome is applied
- **THEN** energy is spent
- **AND** fear gain and scare score delta are reduced according to exposure
- **AND** fear matching (high / medium / ineffective) still determines the kind of effect being scaled
- **AND** the status UI explains that the visitor was only partly caught

### Requirement: Exposure tracking while casting
While a scare cast is active, the game SHALL accumulate exposure for the time the ghost remains within that ability’s range. Leaving range SHALL stop accumulating exposure and SHALL clear the active visitor’s mid-cast reaction, but SHALL NOT cancel the cast or clear cast progress.

#### Scenario: Exposure accumulates in range
- **GIVEN** a scare cast is in progress and the ghost is in range
- **WHEN** time elapses
- **THEN** exposure for that cast increases

#### Scenario: Leaving range pauses exposure only
- **GIVEN** a scare cast is in progress with some exposure already accumulated
- **WHEN** the ghost moves outside that ability’s range
- **THEN** exposure stops increasing
- **AND** cast progress continues
- **AND** the visitor’s mid-cast reaction clears
- **AND** the status UI briefly notes that the visitor left the spooky zone

#### Scenario: Entering range mid-cast starts visitor reaction
- **GIVEN** a scare cast is in progress and the ghost was out of range at cast start
- **WHEN** the ghost or visitor moves into that ability’s range before the cast completes
- **THEN** the visitor shows a mild mid-cast reaction
- **AND** exposure begins accumulating
- **AND** the status UI briefly notes that the visitor is in the spooky zone

### Requirement: Nora mid-cast reaction while affected
While a scare cast is in progress and the ghost remains within that ability’s range, the active visitor SHALL show a mild, family-friendly mid-cast reaction. When the ghost leaves range, that mid-cast reaction SHALL clear without cancelling the cast. On cast complete, the resolve reaction (including miss / partial / full messaging) SHALL replace the mid-cast look. Scenarios that explicitly test the first Nora tutorial visit MAY name Nora.

#### Scenario: Visitor reacts mid-cast while in range
- **GIVEN** a scare cast is in progress and the ghost is within that ability’s range
- **WHEN** the cast continues
- **THEN** the active visitor shows a mild mid-cast reaction

#### Scenario: Mid-cast clears without cancelling cast
- **GIVEN** a scare cast is in progress with the visitor showing a mid-cast reaction
- **WHEN** the ghost moves outside that ability’s range
- **THEN** the visitor’s mid-cast reaction clears
- **AND** the scare cast continues

#### Scenario: Nora reacts mid-cast during first tutorial visit
- **GIVEN** Whisper cast is in progress during the first Nora visit and the ghost is within Whisper range
- **WHEN** the cast continues
- **THEN** Nora shows a mild mid-cast reaction
