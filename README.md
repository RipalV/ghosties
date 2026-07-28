# Project Boo

A browser-first scaffold for a family-friendly ghost haunting game. The working game title is **Boo & Behold!**.

Players control a mischievous ghost, observe NPC behaviour, discover hidden fears, and combine playful scares. This first slice contains one room, one NPC, three abilities, fear progression, scoring, diminishing scare novelty, and a funny failed-scare ghost glimpse.

## Technology

- Phaser 4
- TypeScript
- Vite
- Vitest
- OpenSpec structure for Cursor
- GitHub Actions

## Run locally

Prerequisites: Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Open the local address printed by Vite.

## Controls

- Move: WASD, mouse click, or touch
- Whisper: 1
- Cold Puff: 2
- Object Nudge: 3
- The on-screen ability buttons also work with mouse or touch

## Validate

```bash
npm run check
```

## Cursor and OpenSpec

Open the repository in Cursor, then initialise or refresh OpenSpec integration:

```bash
npm install
npx openspec init --tools cursor --force
```

Start in Cursor chat with:

```text
/opsx:explore
```

Then propose the next small feature, for example:

```text
/opsx:propose Add an NPC clue bubble that appears after two failed scare attempts.
```

## First milestone

The first milestone is successful when a player can explain:

1. Why each scare worked or failed.
2. Why repeating a scare produces fewer points.
3. How Nora progresses from calm towards possessed.
4. What they should try next.

## Repository naming

Recommended repository name: `project-boo`

Working game title: **Boo & Behold!**

Names are working titles only and require proper trademark and store-name clearance before commercial release.

## Cursor rules

Project-specific Cursor rules are included in `.cursor/rules/` and apply automatically when the folder is opened in Cursor. They cover:

- Family-friendly product and safety constraints
- Phaser and TypeScript architecture
- OpenSpec-first feature development
- Testing, performance, accessibility, and validation
- NPC, progression, online safety, and monetisation boundaries

Cursor should read these rules together with `openspec/config.yaml` before making meaningful changes. The `.cursorignore` file excludes generated output and dependencies from AI indexing.
