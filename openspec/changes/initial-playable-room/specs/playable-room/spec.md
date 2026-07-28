# Playable Room Delta Specification

## Scenario: Discover a high fear

- GIVEN Nora has Whisper as a high fear
- WHEN the player uses Whisper within range for the first time
- THEN Nora gains 28 fear
- AND the player gains a first-discovery score bonus
- AND the UI reports a perfect scare

## Scenario: Repeat a scare

- GIVEN the player has already used Whisper once
- WHEN Whisper is used again
- THEN the fear gain is multiplied by 0.7
- AND the UI explains that novelty has fallen

## Scenario: Use an ineffective scare

- GIVEN Nora is not frightened by Object Nudge
- WHEN Object Nudge is used within range
- THEN Nora gains no fear
- AND the player loses five points
- AND Nora laughs
- AND the ghost becomes fully visible for a short comedic glimpse

## Scenario: Attempt from out of range

- GIVEN the ghost is farther away than the ability range
- WHEN the ability is used
- THEN no energy is spent
- AND the UI asks the player to move closer
