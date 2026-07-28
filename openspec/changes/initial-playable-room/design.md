# Design

The prototype separates deterministic fear rules from rendering:

- `FearEngine.ts` contains pure calculations suitable for unit testing and later server authority.
- `GameScene.ts` coordinates input, feedback, scoring, and scene objects.
- `Ghost.ts` and `Npc.ts` own visual behaviour only.
- Placeholder graphics are generated at runtime so the project has no external asset dependency.

The visual scene is isometric-inspired rather than a true tilemap. This keeps the first slice small while preserving the intended presentation direction.
