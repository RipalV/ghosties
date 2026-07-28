## 1. Visual foundation

- [x] 1.1 Define typed, readonly storybook lobby palette, dimensions, and prop/layout data separate from gameplay rules
- [x] 1.2 Create reusable Phaser components for lobby architecture, floor, furniture, and decorative props
- [x] 1.3 Replace placeholder room grid and rectangles with the composed haunted-hotel lobby while preserving gameplay coordinates

## 2. Ambience and characters

- [x] 2.1 Add reusable warm lighting, moonlight, soft shadow, ghost-glow, and fixed-pool ambient particle components with safe reduced visual intensity
- [x] 2.2 Restyle Ghost with original vector-style presentation and idle/movement animation without changing its control or movement contract
- [x] 2.3 Restyle Nora with original vector-style presentation and idle/movement/reaction animation without changing fear profile or routine
- [x] 2.4 Connect existing scare outcomes to readable, funny visual reactions and preserve status feedback

## 3. Responsive mobile HUD

- [x] 3.1 Extract a reusable HUD component that anchors score/objective top-left and fear/energy top-right
- [x] 3.2 Redesign ability controls as labelled, touch-friendly bottom controls while retaining existing number-key shortcuts
- [x] 3.3 Handle Phaser resize events so HUD zones remain readable on landscape phones and desktop browsers

## 4. Mobile viewport behavior

- [x] 4.1 Update page and game-container styles to prevent scrolling, selection, and unintended touch gestures while respecting safe-area insets
- [x] 4.2 Add a friendly, accessible portrait-orientation overlay that blocks gameplay until a usable landscape viewport is available
- [x] 4.3 Verify desktop pointer/keyboard movement and landscape touch-to-move remain functional without browser console errors
- [x] 4.4 Fill the viewport on any landscape ratio by resizing the canvas and fitting the fixed lobby, removing letterbox bars
- [x] 4.5 Add an optional user-activated full-screen control that degrades gracefully when the browser does not support it

## 5. Validation and preview review

- [x] 5.1 Run `npm run check` and retain existing fear-engine test coverage unchanged
- [x] 5.2 Manually playtest desktop and a narrow landscape viewport for HUD spacing, touch target size, reduced visual distraction, and clear NPC feedback
- [ ] 5.3 Open the Azure Static Web Apps pull-request preview and verify the lobby presentation and mobile viewport behavior on a physical mobile device
- [x] 5.4 Document mobile landscape play expectations and preview-review steps in the README if setup or player behavior changes

## 6. Full-bleed camera layout

Playtesting on a physical phone showed the play area filling only about a quarter of the screen, because the whole room was fitted into the space left after reserving HUD bands. These tasks give the lobby the full canvas.

- [x] 6.1 Extend the lobby world to roughly 1760×880 world units and furnish the added space with readable architecture and props, keeping ability range values unchanged
- [x] 6.2 Replace the fit-to-leftover-space container with an automatic camera: bounds set to the lobby world, base zoom derived so viewport height shows a constant world slice, and a soft follow with a deadzone that keeps the ghost clear of the HUD corners
- [x] 6.3 Restore world-space pointer conversion so every tap on the play area moves the ghost, with no drag-to-pan handling
- [x] 6.4 Rework the HUD into floating chips, a ghost card, and an action grid of at least 44 effective CSS pixels per button, plus transient status toasts, keeping state readable without relying on colour
- [x] 6.5 Add an off-screen indicator giving Nora's direction and approximate distance whenever she leaves the view
- [x] 6.6 Keep the rotate-to-play overlay for portrait and confirm it clears without a reload once a usable landscape viewport is restored
- [x] 6.7 Render at `min(devicePixelRatio, 2)` and derive camera zoom and HUD metrics from the same factor so small labels stay sharp
- [x] 6.8 Review ghost speed and NPC pacing in the larger lobby and record any tuning decision in the design document
- [x] 6.9 Add about three discrete zoom steps with a visible control and optional snap-to-step pinch, clamped so the view never leaves the lobby world, and confirm zoom does not alter scare outcomes
- [ ] 6.10 Run `npm run check`, then playtest landscape phone sizes plus desktop for readability, touch reach, camera comfort, zoom behaviour, and console cleanliness
- [x] 6.11 Update the README mobile section for the automatic camera, the zoom control, and landscape play

## 7. Isometric visual language

Adopts the presentation reference recorded in design decision 8, using 2D vector drawing only.

- [x] 7.1 Redraw the floor in isometric projection at a single fixed angle and replace the front-facing wall rectangles with the two far cutaway walls, keeping gameplay coordinates unchanged
- [x] 7.2 Redraw props as isometric volumes with visible tops and sides, one consistent light direction, and soft contact shadows
- [x] 7.3 Remove permanent text labels from props and make each recognisable by silhouette and detailing
- [x] 7.4 Add night-time exterior context beyond the walls — garden, path, hedge or fence, trees, moonlit sky — so view edges look intentional
- [x] 7.5 Strengthen interior lighting so lamps and windows cast warm pools against the cooler exterior
- [x] 7.6 Replace Nora's persistent name label with a head marker plus a slim fear bar, keeping reactions transient and readable without colour alone
- [x] 7.7 Rebuild the HUD chips as top-edge pills pairing a round icon with its value, and add a top-corner objective button with a notification marker
- [x] 7.8 Rebuild scare controls as a square action grid beside a bottom-corner ghost card, with selected and unavailable states readable without colour alone
- [ ] 7.9 Playtest the isometric read at phone size for depth clarity, prop recognition without labels, and character legibility against the lit floor

## Validation notes

`npm run check` passes (19 tests, clean build). The three open tasks above are the
hands-on parts of validation. What has been verified so far by driving a real
browser over the DevTools Protocol at 892×325 (at 1× and 2× device pixel ratio)
and 1440×813:

- No console errors, warnings, or uncaught exceptions on load or during play.
- The canvas covers the viewport exactly, the page cannot scroll, and `touch-action`
  is disabled, at every size tested.
- The drawing buffer is 2 device pixels per CSS pixel at a device pixel ratio of 2,
  and the HUD keeps its CSS size, confirming the crisp-rendering decision.
- Touch taps move the ghost, trigger a scare from the action grid, and change zoom
  steps; the keyboard shortcut produces the same scare as the button.
- Out-of-range and insufficient-energy attempts explain themselves and spend no energy.
- The rotate overlay stays hidden in landscape.

Fixed while verifying: a favicon request and Phaser's audio context were the only
console noise, and Nora's head marker and reaction bubble could be clipped by the
top of the view or hidden behind the chips, so overhead badges now drop below the
character when the view crowds them (`overheadPlacement.ts`, unit-tested).

Still needs a human: touch reach and camera comfort in the hand (6.10), the
subjective isometric read and prop recognition (7.9), and the Azure preview on a
physical device (5.3). The luggage trolley and the reception desk are the two props
whose silhouettes read least clearly in captures, so they are worth a close look.
