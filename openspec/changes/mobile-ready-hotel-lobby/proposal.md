## Why

The current playable room proves the scare loop, but its placeholder geometry and desktop-first HUD do not yet communicate the warm, playful haunted-hotel fantasy or provide a comfortable mobile playtest experience. A focused visual lobby prototype will make the existing game clearer, more inviting, and ready to review through Azure Static Web Apps previews without changing its game rules.

## What Changes

- Replace the placeholder room grid and rectangles with a cohesive, original storybook haunted-hotel lobby using reusable Phaser visual components.
- Add readable lobby architecture, furniture, props, layered warm and moonlit lighting, soft shadows, ghost glow, and restrained ambient particles.
- Restyle the ghost and Nora with project-owned vector-style Phaser shapes plus gentle idle, movement, and reaction animation.
- Give the lobby the full canvas: a camera that follows the ghost frames a slice of a larger lobby world, so the play area fills the screen instead of shrinking to fit reserved HUD bands, with a few discrete zoom steps and a single fixed isometric angle.
- Redraw the lobby in an isometric cutaway style with volumetric unlabelled furniture, warm interior light pools, and night-time exterior context framing the building.
- Extend the lobby world so it is larger than any single view, and add an on-screen indicator so Nora can always be located when she is outside the current view.
- Redesign the HUD in a floating-chip language — top-edge pill chips for score, energy, and fear, a top-corner objective button, a bottom-corner ghost card with a square scare action grid, and transient status toasts.
- Add safe-area-aware viewport styling and prevent browser gesture/selection interference.
- Keep landscape as the tuned orientation, with friendly rotate guidance in portrait.
- Preserve all current fear rules, scoring, NPC routine, scare abilities, keyboard controls, and touch-to-move behavior.
- Document mobile landscape playtesting and verify the rendered result in an Azure pull-request preview.

## Capabilities

### New Capabilities
- `storybook-hotel-lobby-visuals`: Family-friendly lobby presentation, reusable visual components, lighting, effects, and character animation.
- `mobile-gameplay-presentation`: Full-bleed camera framing, safe-area-aware floating HUD, touch-sized controls, both-orientation support, and browser-interaction protection.

### Modified Capabilities
- `playable-room`: The playable room's presentation and responsive input surface are upgraded while preserving its existing gameplay outcomes and controls.

## Impact

- Phaser scene composition, entities, UI components, and client styles under `src/`.
- `index.html` mobile web-app and viewport metadata as needed.
- Pure fear rules and their tests remain unchanged unless a regression test is needed.
- Azure PR preview workflow is used for visual review; no deployment infrastructure changes are required.
