## 1. Revise pure onboarding rules for six-step prompts

- [x] 1.1 Replace step ids with `welcome` → `guestMotive` → `moveNearObserve` → `reviewClues` → `chooseScareStayClose` → `repeatLoop`; update events (session ready, guest arriving, observe complete, clues opened, successful scare, OK, skip)
- [x] 1.2 Rewrite reducer transitions: OK only clears presentation; gameplay/session events advance steps; Skip or OK on `repeatLoop` finishes the session; first-Nora gate unchanged
- [x] 1.3 Rewrite typed prompt copy — short, mischievous, mobile-friendly; parameterise visitor name; no high-fear spoilers
- [x] 1.4 Keep contextual coaching after skip/complete; adjust if step ids or finish conditions change

## 2. Presentation and scene wiring

- [x] 2.1 Show welcome prompt when the lobby is ready (before Nora); show guest-motive prompt on first-visit arrival; show observe prompt when Nora is targetable (highlight Observe after OK)
- [x] 2.2 Advance to clues prompt on observe-with-clue (highlight 🧩); advance to scare prompt on clues opened (highlight scare grid); advance to repeat prompt on successful scare (exposed resolve)
- [x] 2.3 Preserve Skip help + OK (≥44 CSS px), input lock and **game pause** while prompt open, cleanup on departure/skip/next visit, session flag across reset
- [x] 2.4 Update README for the six-step OK/Skip prompt flow

## 3. Tests and validation

- [x] 3.1 Update Vitest for new step order, welcome/motive timing, OK vs advance, successful-scare → repeat, skip/complete, Milo gate, non-mutation
- [x] 3.2 Run `npm run check` / `npm run build`; fix regressions

## 4. Playtest and preview

- [x] 4.1 Playtest desktop + landscape mobile: welcome → motive → observe → clues → scare → repeat, Skip path, later visits without full sequence
- [x] 4.2 Open/verify Azure Static Web Apps PR preview for acceptance review

## 5. Visit pacing (first-session comfort)

- [x] 5.1 Increase standard visit POI pause budgets (~87 s Nora repeat, ~69 s Milo) and add first-Nora visit bonus (~99 s) for guided onboarding
