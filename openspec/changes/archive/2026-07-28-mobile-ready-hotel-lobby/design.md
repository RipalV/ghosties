## Context

The current Phaser scene draws its entire room, HUD, props, and placeholder characters directly in `GameScene`. It preserves a proven solo scare loop, but a 960×600 desktop-first presentation makes visual composition and touch layout difficult to evolve independently. The lobby needs a clear storybook identity without third-party art, new gameplay systems, or a performance cost that harms ordinary phones.

## Goals / Non-Goals

**Goals:**

- Create a consistent, family-friendly haunted-hotel lobby using project-owned vector-style Phaser graphics.
- Separate static environment art, character presentation, ambience, and HUD into reusable focused components.
- Give the lobby the entire canvas on any screen ratio, with the HUD floating over it rather than taking reserved space from it.
- Keep fixed world coordinates so fear ranges and NPC routes stay device-independent.
- Keep all existing deterministic rules and game inputs intact.
- Tune the presentation for landscape phones and desktop browsers, guiding portrait players to rotate.

**Non-Goals:**

- New NPCs, abilities, audio, monetisation, accounts, networking, or procedural content.
- External art packs, runtime-downloaded assets, WebGL-only filters, or a physics engine.
- Changing fear calculations, scores, range values, or ability effects.
- Free-form camera control: no drag-to-pan and no rotation. The camera follows automatically, and zoom is limited to a few discrete steps so a young player cannot reach an unusable scale.
- Portrait tuning; portrait shows rotate guidance instead.
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

### 3. Frame a larger lobby world with an automatic camera

- **Decision:** Keep fixed world coordinates, but stop fitting the whole room into the viewport. The canvas resizes to the viewport (see decision 7 for the scale mode this uses), the base camera zoom is derived so the **viewport height shows a constant slice of about 560 world units**, camera bounds are the lobby world, and the camera follows the ghost with a soft lerp and a deadzone that keeps it clear of the HUD corners. Zoom offers about three discrete steps around that base, and the widest step is clamped so the view never exceeds the world bounds. The lobby world is extended to roughly 1760×880 world units, which covers the widest step on a wide desktop window.
- **Why:** Fitting the entire room meant the leftover band (about 892×224 CSS px on a landscape phone) was far wider than the room's 1.92:1 ratio, so height bound the scale to 0.448 and the play area collapsed to roughly a quarter of the screen. A camera over a larger world fills any ratio by construction, and a constant world-units-per-screen target keeps characters and text a consistent physical size across devices.
- **Worked example:** on an 892×412 landscape phone the base zoom is 412/560 ≈ 0.735, giving a view of about 1213×560 world units; the widest step at 0.75 of base shows about 1617×747, which still fits a 1760×880 world.
- **Consequences accepted:** A bigger lobby means longer walks between props, so ghost speed and NPC pacing may need a small review even though ability range values are unchanged. Nora can be outside the current view, which is why an off-screen indicator is required (decision 6).
- **Implementation notes:** The floor is an isometric diamond of 1400×640 world units centred in the world, and positions are kept on it by a pure clamp that projects an out-of-bounds point back onto the diamond edge; that clamp and the zoom resolution are unit-tested. Pacing was reviewed against the larger lobby: ghost speed moved from 220 to 300 world units per second and Nora's from 65 to 70, and her route was kept near the middle of the lobby so she stays findable. Ability ranges (180/150/210) are unchanged.
- **Alternatives considered:** Cover-scaling the existing 960×500 room — rejected because it only zooms the same room and crops its architecture; regenerating the room to the exact viewport — rejected because device-dependent playfield bounds would make the fixed 180/150/210 ability ranges mean different things on different phones. An earlier revision sized the world near-square (about 1280×1280) to serve portrait as well; that is no longer needed now that play is landscape-only (decision 4).

### 4. Play in landscape and guide portrait players to rotate

- **Decision:** Tune the game for landscape and keep the portrait rotate-to-play overlay, which must re-evaluate after an orientation change. Full screen remains an optional button rather than forced, because browsers only honour it from a user gesture and iPhone Safari does not support element full screen at all.
- **Why:** The visual reference for this work is played in landscape, and a single tuned orientation keeps the isometric composition, camera slice, and HUD reach decisions unambiguous for a prototype.
- **Consequences accepted:** Portrait players see guidance rather than a playable game, so the overlay's copy and its re-check on rotation matter more than they would otherwise.
- **History:** An earlier revision of this change supported both orientations and retired the overlay. That was reversed once the landscape reference screenshots were reviewed; the world no longer needs to be near-square to serve a portrait slice (decision 3).
- **Alternatives considered:** Both orientations — deferred rather than rejected, since the camera makes it feasible later; requesting an orientation lock — rejected because browsers may deny it and it removes player choice.

### 5. Verify visual work through the PR deployment path

- **Decision:** Validate `npm run check`, desktop keyboard and pointer input, narrow landscape touch controls, portrait guidance, browser-console cleanliness, and the Azure PR preview URL.
- **Why:** Visual and input behaviors are not effectively covered by pure unit tests, while the existing fear-engine tests retain rule regression coverage.
- **Alternatives considered:** Rendering unit tests — rejected because Phaser rendering does not provide enough user-facing confidence compared with focused playtesting.

### 6. Float a compact HUD over the world and keep Nora findable

- **Decision:** The HUD reserves no space from the world. Score/objective and Nora's fear/energy become compact pills (about 150×40) in the top corners, the three scares become a thumb-reach cluster of round buttons of at least 44 effective CSS pixels in a bottom corner with icon, short label, and an energy-cost badge, and status feedback becomes a transient toast instead of a permanent full-width strip. A small edge indicator points toward Nora with her distance whenever she is outside the view. Target total HUD footprint is under 12% of screen area, down from roughly 24% plus 46% of reserved height.
- **Why:** This is the layout language of comparable mobile games: full-bleed world, a few floating chips, and contextual controls under the thumbs. It also keeps every HUD state readable without relying on colour, using text, shape, and badges.
- **Consequences accepted:** Because the camera follows automatically and there is no manual panning, every pointer press on the world remains an unambiguous tap-to-move, so no tap-versus-drag gesture threshold is needed. The camera deadzone must keep the ghost away from the HUD corners.
- **Alternatives considered:** Keeping the wide labelled button bar — rejected because it consumed about 600×64 px of a 892×412 screen; drag-to-pan and pinch-zoom — rejected as manual camera management for a 7+ audience, and it would put panning and tap-to-move on the same surface.

### 7. Render at device pixel ratio

- **Decision:** Size the drawing buffer using `min(devicePixelRatio, 2)` while keeping the CSS size equal to the viewport, and derive camera zoom and HUD metrics from the same factor.
- **Why:** The canvas currently draws one device pixel per CSS pixel, so on a phone with a ratio near 3 the vector edges and small HUD text are visibly soft — which matters most for the smallest labels a young reader needs.
- **Implementation notes:** Phaser's `RESIZE` scale mode is defined as a 1:1 map between canvas pixels and CSS pixels, so it cannot deliver this. The game therefore uses `NONE` with the game size set to viewport × render scale and `zoom` set to its inverse, resizing from the container's CSS size on a `ResizeObserver`. Game units are consequently device pixels, so the scene reads the render scale back as `1 / scale.zoom` and multiplies every HUD metric by it; the 44-pixel touch minimum is therefore honoured in CSS pixels. The HUD is drawn by a second camera at zoom 1 so world zoom never resizes it.
- **Alternatives considered:** Leaving it at 1× — rejected because the compact HUD makes text smaller, not larger; capping at full ratio with no limit — rejected for fill-rate cost on ordinary phones.

### 8. Follow a named mobile visual reference, adapted to 2D and to a 7+ audience

- **Decision:** Use a mainstream isometric life-simulation mobile game as the presentation reference, adopting its full-bleed world, isometric cutaway interior, night lighting with warm interior pools, unlabelled volumetric furniture, head markers with slim bars, top-edge pill chips, and a bottom-corner character card with a square action grid. Adapt or reject the parts that do not suit this project.
- **Adopted:** full-bleed world; isometric floor with only the two far walls drawn; furniture as volumes with one light direction and contact shadows; exterior context (garden, path, hedge, trees, moonlit sky) framing the lot; no text labels on props; character head marker plus a slim state bar; top-edge chips pairing icon and value; objective as a top-corner icon button with a notification marker; scares as a square action grid beside a character card in a bottom corner.
- **Adapted:** the reference is rendered in 3D, while this project stays 2D — the isometric look is drawn with vector graphics only, since the project boundary forbids introducing full 3D. Discrete zoom steps are preferred over free-form zoom so a younger player cannot end up at an unusable scale.
- **Rejected:** currency, VIP, and store chips (the project forbids monetisation mechanics); build/buy mode, floor and layer selectors, and mailbox controls (out of scope for a single-room prototype).
- **Deferred:** camera rotation. The reference rotates a 3D scene freely, but rotating a 2D isometric room means authoring the walls, furniture, and shadows from four angles, which multiplies the art for this prototype. Revisit only if the art direction proves worth it.

## Risks / Trade-offs

- **[Risk] Too many visual objects reduce phone frame rate** → Mitigation: static layers are created once, tweens are limited, and ambient particles use a fixed small pool.
- **[Risk] HUD overlaps browser safe areas or gameplay** → Mitigation: explicit anchored HUD zones, safe-area CSS, and physical-device landscape verification.
- **[Risk] Art changes obscure interaction feedback** → Mitigation: preserve existing concise textual status, distinct icons/shapes, and readable contrast.
- **[Risk] Losing track of Nora once she can leave the view** → Mitigation: an edge indicator with direction and distance, and a camera slice wide enough that she is usually visible in landscape.
- **[Risk] A larger lobby makes the loop feel slow or empty** → Mitigation: fill the extra space with readable props and review ghost speed during playtesting; ability range values stay unchanged.
- **[Risk] Camera motion feels uncomfortable for younger players** → Mitigation: soft follow lerp plus a deadzone so the camera only moves when the ghost leaves the middle of the view, and zoom changes only between a few discrete steps.
- **[Risk] Zoom controls confuse or strand a young player** → Mitigation: a few discrete steps only, clamped so the view stays inside the world, with a visible control rather than gesture-only discovery.
- **[Risk] Portrait overlay makes first-time users think the game is broken** → Mitigation: clear “Rotate to play” copy, a friendly illustrated cue, and a re-check after orientation changes.
- **[Risk] Isometric depth makes characters hard to pick out against a busy floor** → Mitigation: contact shadows, head markers, and a ghost glow that separates characters from the lit floor.

## Migration Plan

1. Add visual data and reusable lobby/HUD components alongside the existing scene.
2. Swap the scene’s placeholder presentation for those components without changing fear or input contracts.
3. Add responsive document styling.
4. Extend the lobby world, introduce the automatic camera with discrete zoom steps, and move the HUD to floating chips, a ghost card, and an action grid.
5. Redraw the lobby in the isometric cutaway language with exterior context, keeping a single fixed angle.
6. Keep the rotate-to-play overlay and confirm it re-evaluates after an orientation change.
7. Validate locally at landscape phone sizes and desktop and in an Azure PR preview; revert by restoring the prior scene presentation if visual playtesting reveals a regression.

## Open Questions

- Does the extended lobby need a second readable zone (reception nook, staircase, corridor) to justify its size, or is a single larger room enough for this prototype? To be answered by playtesting the camera before committing more art.
