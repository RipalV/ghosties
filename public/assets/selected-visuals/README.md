# Approved visual source assets

This directory is reserved for the three approved visual sources used by the `integrate-selected-visual-assets` OpenSpec change.

Expected files:

| File | Source dimensions | Purpose |
|---|---:|---|
| `crooked-moon-hotel-lobby.png` | 1672 × 941 | Approved lobby composition and visual direction |
| `ghost-animation-source.png` | 1536 × 1024 | Approved spooky ghost poses and palette |
| `nora-reaction-source.png` | 1536 × 1024 | Approved expressive Nora reactions and palette |

## Production preparation

These images are visual source sheets, not guaranteed drop-in atlases. During implementation:

1. Keep the source files unchanged in this directory.
2. Create optimised production derivatives under `public/assets/production/`.
3. Remove sheet backgrounds from character frames and preserve clean transparency.
4. Use consistent frame boxes, pivots, logical anchors, naming, and atlas metadata.
5. Keep the lobby in stable world coordinates; do not stretch it to each viewport.
6. Document any crop, colour, scale, or frame edits in the OpenSpec design.

Cursor must use these approved files as the starting point and must not replace them with an unrelated art direction.
