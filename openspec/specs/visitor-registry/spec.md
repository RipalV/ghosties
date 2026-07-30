# visitor-registry Specification

## Purpose

Typed visitor definitions, deterministic visit sequence, and active-visitor resolution for content-driven UI and rules.

## Requirements

### Requirement: Typed visitor registry
The game SHALL maintain a typed visitor registry of visitor definitions keyed by stable visitor ids. Each definition SHALL include display name, fear/clue content reference, visit route/success configuration, and any authored cue strings needed for arrival and status copy. Registry lookup SHALL be a pure domain operation independent of Phaser.

#### Scenario: Lookup returns Nora and Milo
- **WHEN** the registry is queried for `nora` and for the second visitor id
- **THEN** each lookup returns a definition with a unique id and display name
- **AND** the second visitor’s primary fear differs from Nora’s

#### Scenario: Unknown id is rejected
- **WHEN** the registry is queried for an unknown visitor id
- **THEN** the lookup fails in a typed, testable way without throwing into Phaser

### Requirement: Deterministic visit sequence
The game SHALL select visitors from a fixed sequence Nora → second visitor → Nora → second visitor with no randomness. The first visit of a play session SHALL use Nora. The Next visit action SHALL advance to the next entry in the sequence.

#### Scenario: First visit is Nora
- **GIVEN** a new playable scene session begins
- **WHEN** the first visitor is announced
- **THEN** the active visitor is Nora

#### Scenario: Next visit alternates
- **GIVEN** the previous visit used Nora
- **WHEN** the player chooses Next visit
- **THEN** the next active visitor is the second registered visitor
- **AND** the following Next visit returns to Nora

#### Scenario: Rotation after either outcome
- **GIVEN** a visit ended haunted or unimpressed
- **WHEN** the player chooses Next visit
- **THEN** the sequence still advances to the next visitor id

### Requirement: Active visitor drives presentation
Arrival cue, objective/status copy, Observe labelling, clue panel, results summary, off-screen indicator, and departure messaging SHALL identify the active visitor using that visitor’s content. The UI SHALL NOT show another visitor’s name or clues during the active visit.

#### Scenario: Results name matches active visitor
- **WHEN** results are shown after a visit
- **THEN** the summary visitor name matches the active visitor for that visit

#### Scenario: Clues do not cross visitors
- **GIVEN** clues were discovered for Nora
- **WHEN** Next visit starts the second visitor’s session
- **THEN** Nora’s clues are not listed in the second visitor’s clue panel
