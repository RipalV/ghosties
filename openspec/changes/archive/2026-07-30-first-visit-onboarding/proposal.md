## Why

New players aged 7+ still need a short, mischievous teach-through-play path for the haunt loop without reading the README. Playtesting showed floating mid-game help banners are easy to miss and hard to follow; step prompts with OK / Skip fit mobile better and let the player acknowledge each tip before acting.

## What Changes

- **BREAKING (tutorial UX):** Replace the eight-step mid-play banner sequence with six short OK/Skip prompt steps and a fun, mischievous tone sized for landscape phones.
- Start the session with a **welcome / game introduction** prompt before the first guest arrives.
- On guest arrival, explain the **motive**: stack scares to push fear high.
- When the guest becomes targetable: prompt to **move close and Observe** (highlight Observe).
- When Observe unlocks a clue: prompt to **open clues** (highlight 🧩).
- When clues are opened: prompt to **pick a scare and stay close** while it casts (highlight scare buttons).
- On a **successful scare** (cast resolves with exposure): prompt to **repeat** the observe → clues → scare loop.
- Player can **Skip help** on any prompt; that ends the full guided sequence for the browser session.
- Keep onboarding non-mutating (no fear/score/energy/route changes); pure TypeScript rules + typed copy; contextual coaching after skip/complete remains.
- Limit full guided sequence to the first Nora visit of the session.

## Capabilities

### New Capabilities
- `first-visit-onboarding`: Six-step guided prompt sequence (welcome → motive → observe → clues → scare → repeat), OK/Skip lifecycle, session gate, non-mutating rules.
- `contextual-coaching`: Brief post-guided hints for stuck states without revealing high fear.

### Modified Capabilities
- `mobile-gameplay-presentation`: Guided steps use centered OK/Skip prompts (≥44 CSS px); coaching may use a compact banner; active-visitor wording where generic.
- `playable-room`: Scene wires prompt events and highlights without hard-coding step logic.
- `npc-observation`: Observe complete feeds the clues step.
- `scare-cast`: Successful in-range resolve feeds the repeat step.
- `haunting-session`: Welcome before first visit; cleanup on skip/departure/next; flag survives session reset.
- `visitor-registry`: Visitor display name in copy; first-Nora gate only for full sequence.
- `core-gameplay`: Onboarding teaches the visit loop without changing core rules.

## Impact

- Revise `src/game/onboarding/` steps, events, copy, and reducer for the six-step prompt model.
- HUD already has OK/Skip prompt chrome; align step content, highlights, and welcome timing.
- `GameScene` starts welcome at session start; wire arrival, observe, clues, scare-success, skip.
- README + Vitest updates for the new flow.
- No new visitors, abilities, rooms, persistence, accounts, or monetisation.
