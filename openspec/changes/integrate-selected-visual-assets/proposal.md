# Integrate selected hotel, ghost, and Nora visual assets

## Motivation

Ghosties has a complete gameplay loop, but the current lobby and character presentation are difficult to read and do not yet deliver the intended playful haunted-hotel experience.

This change integrates the selected visual direction already approved for the project:

- a detailed Crooked Moon Hotel lobby with a large open gameplay floor
- a spooky, semi-transparent ghost with expressive animation poses
- an expressive stylised Nora whose reactions are entertaining and readable

The supplied images are approved visual source assets. Cursor must use them as the starting point rather than inventing a different art direction.

## Supplied assets

Use the files documented in `public/assets/selected-visuals/README.md`:

- `crooked-moon-hotel-lobby.png`
- `ghost-animation-source.png`
- `nora-reaction-source.png`

Treat these as source/reference assets. Prepare production-ready derivatives where necessary, while preserving their visual identity.

## Requirements

### Lobby

- Replace the current placeholder lobby presentation with the supplied lobby artwork.
- Preserve a large navigable floor and the existing world-coordinate gameplay model.
- Keep the entrance, reception, luggage, crooked portrait, fireplace/draft area, hotel bell, seating, and staircase visually recognisable.
- Do not use the artwork as a stretched screen-space backdrop that changes gameplay coordinates across devices.
- Define a stable world-space fit, crop, scale, collision/walkable region, camera bounds, prop anchors, route anchors, and safe HUD composition.
- Support laptop, tablet, and landscape mobile viewports without distorting the image.

### Ghost

- Prepare the supplied ghost source into production-ready transparent frames or an atlas.
- Preserve the spooky sheet-like silhouette, pale blue-white palette, dark expressive face, semi-transparency, and compatibility with the warm dark lobby.
- Map distinct animation states for:
  - idle/hover
  - movement
  - observing
  - scare casting
  - successful scare reaction
  - failed scare reaction
- Use animation timing, tweening, glow, squash/stretch, and subtle trailing effects to make motion feel lively.
- Keep the ghost family-friendly and readable at gameplay scale.

### Nora

- Prepare the supplied Nora reaction source into production-ready transparent frames or an atlas.
- Preserve the stylised proportions, purple/brown palette, and exaggerated readable facial expressions.
- Map distinct states for:
  - idle/walking
  - observing/investigating
  - suspicious after a failed scare
  - scared
  - fleeing
  - possessed
- Prioritise entertaining expressions and body language over realism.
- Possession must remain comedic and suitable for ages 7+.

### Asset preparation

- Remove source-sheet backgrounds cleanly and preserve transparent edges.
- Crop frames consistently around a shared logical origin and foot/hover anchor.
- Produce deterministic frame dimensions and an atlas or frame manifest.
- Document frame names, source rectangles, pivots, scale, animation order, frame rate, looping, and transition rules.
- Optimise production files for browser delivery while retaining source assets for traceability.
- Do not introduce watermarked, unlicensed, or unrelated replacement art.

### Architecture

- Keep asset metadata and gameplay-state-to-animation mapping typed and data-driven.
- Keep animation selection outside fear, clue, route, scoring, and session rules.
- Avoid putting all asset and animation logic directly into `GameScene`.
- Add reusable presentation components for the lobby, ghost, and visitor.
- Preserve existing gameplay behaviour, routes, props, onboarding, controls, and mobile safe areas.

## Validation

Verify on desktop, tablet-sized responsive emulation, and a physical landscape phone through the Azure preview deployment.

Run:

- `npm run check`
- `npm run build`

## Acceptance criteria

1. The supplied lobby artwork is integrated without stretching or changing gameplay geometry by viewport.
2. Existing visitor routes and hauntable prop anchors align with recognisable lobby landmarks.
3. The supplied ghost visual direction is used for all required ghost animation states.
4. The supplied Nora visual direction is used for all required Nora reaction states.
5. Ghost and Nora frames use clean transparency and stable pivots without visible jumping.
6. Expressions and reactions remain readable at normal gameplay zoom on laptop, tablet, and mobile.
7. Visual state transitions correctly follow existing gameplay events and reset between visits.
8. Existing movement, observation, clues, casting, exposure, fear, score, energy, novelty, onboarding, and session behaviour remain unchanged.
9. Asset metadata and animation mappings are reusable and not monolithic scene code.
10. Production assets are optimised and their frame/atlas metadata is documented.
11. `npm run check` and `npm run build` pass.
12. The feature is reviewable through an Azure Static Web Apps preview.

## Non-goals

Do not add new visitors, rooms, scare abilities, gameplay systems, multiplayer, persistence, monetisation, or a full HUD redesign.
