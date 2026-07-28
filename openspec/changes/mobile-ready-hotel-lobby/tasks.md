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

## 5. Validation and preview review

- [x] 5.1 Run `npm run check` and retain existing fear-engine test coverage unchanged
- [x] 5.2 Manually playtest desktop and a narrow landscape viewport for HUD spacing, touch target size, reduced visual distraction, and clear NPC feedback
- [ ] 5.3 Open the Azure Static Web Apps pull-request preview and verify the lobby presentation and mobile viewport behavior on a physical mobile device
- [x] 5.4 Document mobile landscape play expectations and preview-review steps in the README if setup or player behavior changes
