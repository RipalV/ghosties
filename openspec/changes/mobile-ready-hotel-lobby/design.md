## Context

The current Phaser scene draws its entire room, HUD, props, and placeholder characters directly in `GameScene`. It preserves a proven solo scare loop, but a 960×600 desktop-first presentation makes visual composition and touch layout difficult to evolve independently. The lobby needs a clear storybook identity without third-party art, new gameplay systems, or a performance cost that harms ordinary phones.

## Goals / Non-Goals

**Goals:**

- Create a consistent, family-friendly haunted-hotel lobby using project-owned vector-style Phaser graphics.
- Separate static environment art, character presentation, ambience, and HUD into reusable focused components.
- Keep the 960×600 logical playfield, while using Phaser scale management and CSS safe areas for landscape mobile and desktop.
- Keep all existing deterministic rules and game inputs intact.
- Provide a visible, non-interactive portrait guidance screen when usable landscape width is unavailable.

**Non-Goals:**

- New rooms, NPCs, abilities, audio, monetisation, accounts, networking, or procedural content.
- External art packs, runtime-downloaded assets, WebGL-only filters, or a physics engine.
- Changing fear calculations, scores, NPC routes, range checks, or ability effects.
- Forcing fullscreen or device rotation; browser capabilities and user preferences remain in control.

## Decisions

### 1. Compose the lobby from reusable graphics components

- **Decision:** Introduce components for lobby layers (walls, floor, furniture/props), ambience (lighting, particles), character presentation, and responsive HUD rather than expanding `GameScene`.
- **Why:** Keeps scene coordination small and permits later rooms to reuse an art language without duplicating code.
- **Alternatives considered:** A single illustrated background image — rejected because it is harder to keep project-owned, responsive, and layered with lighting; adding all rendering to `GameScene` — rejected because it compounds existing presentation and gameplay responsibilities.

### 2. Use original vector-style Phaser drawing and reusable effects

- **Decision:** Build visual definitions as typed, readonly colour/layout data and draw with Phaser Graphics, Containers, and tweens. Reuse a small fixed pool of particles/effects; do not allocate presentation objects every frame.
- **Why:** Keeps the download small, gives the prototype an original storybook look, and supports sharp scaling at mobile resolutions.
- **Alternatives considered:** New raster/image dependencies — rejected until the visual direction is proven; per-frame particle creation — rejected for mobile performance.

### 3. Keep gameplay coordinates stable; make presentation responsive

- **Decision:** Preserve the current logical scene dimensions and gameplay coordinates. HUD components use layout anchors, safe-area CSS variables, and Phaser scale resize events; touch buttons meet a 44 CSS-pixel minimum effective target.
- **Why:** This protects fear/range behavior while making the controls readable on landscape phones and browsers.
- **Alternatives considered:** Rewriting scene coordinates for each viewport — rejected as high risk to gameplay; using colour alone for HUD states — rejected for accessibility.

### 4. Handle portrait with an HTML/CSS overlay

- **Decision:** Use a responsive orientation overlay outside the Phaser scene when the viewport is too narrow or portrait, with a concise instruction to rotate. It blocks gameplay beneath it.
- **Why:** It is dependable across mobile browsers and does not require the game to draw at impractically narrow dimensions.
- **Alternatives considered:** Requesting fullscreen/orientation lock — rejected because browsers may deny it and it removes player choice.

### 5. Verify visual work through the PR deployment path

- **Decision:** Validate `npm run check`, desktop keyboard and pointer input, narrow landscape touch controls, portrait guidance, browser-console cleanliness, and the Azure PR preview URL.
- **Why:** Visual and input behaviors are not effectively covered by pure unit tests, while the existing fear-engine tests retain rule regression coverage.
- **Alternatives considered:** Rendering unit tests — rejected because Phaser rendering does not provide enough user-facing confidence compared with focused playtesting.

## Risks / Trade-offs

- **[Risk] Too many visual objects reduce phone frame rate** → Mitigation: static layers are created once, tweens are limited, and ambient particles use a fixed small pool.
- **[Risk] HUD overlaps browser safe areas or gameplay** → Mitigation: explicit anchored HUD zones, safe-area CSS, and physical-device landscape verification.
- **[Risk] Art changes obscure interaction feedback** → Mitigation: preserve existing concise textual status, distinct icons/shapes, and readable contrast.
- **[Risk] Portrait overlay makes first-time users think the game is broken** → Mitigation: clear “Rotate to play” copy and a friendly illustrated cue.

## Migration Plan

1. Add visual data and reusable lobby/HUD components alongside the existing scene.
2. Swap the scene’s placeholder presentation for those components without changing fear or input contracts.
3. Add responsive document styling and the portrait overlay.
4. Validate locally and in an Azure PR preview; revert by restoring the prior scene presentation if visual playtesting reveals a regression.

## Open Questions

- None. This is intentionally a single visual prototype, so later art/audio direction can be evaluated after playtesting.
