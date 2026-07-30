## ADDED Requirements

### Requirement: Contextual coaching after guided onboarding
After guided onboarding is completed or skipped, the game SHALL be able to show brief contextual hints when useful, including when: the player remains far from the visitor; Observe is attempted out of range; the player has discovered clues but has not reviewed them; a cast completes with zero exposure; the same ineffective scare is used repeatedly; or the visitor is close to finishing their route. Hints SHALL explain the next useful action in friendly language for ages 7+ without directly revealing the visitor’s hidden high fear. Hints SHALL NOT pause the visitor, alter fear/score/energy/route/cast outcomes, or penalise the player.

#### Scenario: Far-from-visitor hint
- **GIVEN** guided onboarding is finished for the session and the visitor is targetable
- **WHEN** the ghost remains outside useful observe/scare range for a sustained period
- **THEN** a brief hint encourages moving closer
- **AND** the hint does not name the visitor’s high fear category

#### Scenario: Observe out of range coaching
- **GIVEN** guided onboarding is finished
- **WHEN** the player attempts Observe while out of observation range
- **THEN** a brief hint explains getting closer to Observe
- **AND** observation rules themselves are unchanged

#### Scenario: Unreviewed clues coaching
- **GIVEN** at least one clue is discovered and the clue panel has not been reviewed
- **WHEN** coaching eligibility is evaluated
- **THEN** a brief hint encourages opening the clue panel
- **AND** the hint does not reveal which scare is best

#### Scenario: Zero-exposure coaching
- **GIVEN** guided onboarding is finished
- **WHEN** a scare cast completes with zero exposure
- **THEN** a brief hint explains staying closer while the scare casts
- **AND** energy, fear, and score follow existing zero-exposure rules only

#### Scenario: Repeated ineffective scare coaching
- **GIVEN** the same ineffective scare category has resolved successfully in range more than once this visit
- **WHEN** coaching eligibility is evaluated
- **THEN** a brief hint suggests trying a different scare or checking clues
- **AND** the hint does not directly state the visitor’s high fear

#### Scenario: Route nearly finished coaching
- **GIVEN** the visitor’s authored route is close to completion during active haunting
- **WHEN** coaching eligibility is evaluated
- **THEN** a brief hint encourages a timely observe or scare
- **AND** route timing is not paused or extended

### Requirement: Coaching available for Milo without full onboarding
Contextual coaching SHALL remain available during Milo’s visit when the session’s guided onboarding has already been completed or skipped. Coaching eligibility SHALL use the active visitor’s display name and ranges without Nora-only hard-coding.

#### Scenario: Milo receives range coaching
- **GIVEN** guided onboarding was skipped or completed earlier in the session
- **WHEN** the player attempts Observe out of range during Milo’s visit
- **THEN** a contextual hint may appear referring to Milo or the active visitor
- **AND** the full guided onboarding sequence does not start

### Requirement: Pure coaching eligibility
Contextual hint eligibility and selection SHALL be implemented as pure TypeScript functions independent of Phaser and SHALL NOT mutate discovery, fear, score, energy, novelty, or route state.

#### Scenario: Eligibility is deterministic
- **GIVEN** identical coaching input flags
- **WHEN** hint selection runs twice
- **THEN** the selected hint id is the same
- **AND** no gameplay state fields change as a side effect
