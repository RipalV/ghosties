## Why

The current playable room proves the scare loop, but its placeholder geometry and desktop-first HUD do not yet communicate the warm, playful haunted-hotel fantasy or provide a comfortable mobile playtest experience. A focused visual lobby prototype will make the existing game clearer, more inviting, and ready to review through Azure Static Web Apps previews without changing its game rules.

## What Changes

- Replace the placeholder room grid and rectangles with a cohesive, original storybook haunted-hotel lobby using reusable Phaser visual components.
- Add readable lobby architecture, furniture, props, layered warm and moonlit lighting, soft shadows, ghost glow, and restrained ambient particles.
- Restyle the ghost and Nora with project-owned vector-style Phaser shapes plus gentle idle, movement, and reaction animation.
- Redesign the HUD for landscape touch play: score/objective top-left, fear/energy top-right, and large scare controls across the bottom.
- Add safe-area-aware viewport styling, prevent browser gesture/selection interference, and show a clear portrait-orientation prompt when the game is too narrow.
- Preserve all current fear rules, scoring, NPC routine, scare abilities, keyboard controls, and touch-to-move behavior.
- Document mobile landscape playtesting and verify the rendered result in an Azure pull-request preview.

## Capabilities

### New Capabilities
- `storybook-hotel-lobby-visuals`: Family-friendly lobby presentation, reusable visual components, lighting, effects, and character animation.
- `mobile-gameplay-presentation`: Safe-area-aware responsive HUD, touch-sized controls, orientation guidance, and browser-interaction protection.

### Modified Capabilities
- `playable-room`: The playable room's presentation and responsive input surface are upgraded while preserving its existing gameplay outcomes and controls.

## Impact

- Phaser scene composition, entities, UI components, and client styles under `src/`.
- `index.html` mobile web-app and viewport metadata as needed.
- Pure fear rules and their tests remain unchanged unless a regression test is needed.
- Azure PR preview workflow is used for visual review; no deployment infrastructure changes are required.
