# Project Ghosties

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

Prerequisites: Node.js 20.19 or newer. The repo includes an `.nvmrc` file pinned to Node 22 (matching CI).

### Using nvm (recommended)

Install [nvm](https://github.com/nvm-sh/nvm) if you do not already have it:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Restart your terminal, then from the repository root:

```bash
nvm install   # reads .nvmrc
nvm use
npm install
npm run dev
```

Open the local address printed by Vite.

### Without nvm

Install Node.js 20.19 or newer from [nodejs.org](https://nodejs.org/), then run `npm install` and `npm run dev` as above.

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

Open the repository in Cursor, then run the setup script to install OpenSpec with the [expanded/full workflow](https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md#expandedfull-workflow-custom-selection) for Cursor (`propose`, `explore`, `new`, `continue`, `apply`, `update`, `ff`, `sync`, `archive`, `bulk-archive`, `verify`, `onboard`):

```bash
./setup-openspec.sh
```

Or use the npm script:

```bash
npm run setup:openspec
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

Recommended repository name: `ghosties`

Working game title: **Ghosties**

Names are working titles only and require proper trademark and store-name clearance before commercial release.

## Cursor rules

Project-specific Cursor rules are included in `.cursor/rules/` and apply automatically when the folder is opened in Cursor. They cover:

- Family-friendly product and safety constraints
- Phaser and TypeScript architecture
- OpenSpec-first feature development
- Testing, performance, accessibility, and validation
- NPC, progression, online safety, and monetisation boundaries

Cursor should read these rules together with `openspec/config.yaml` before making meaningful changes. The `.cursorignore` file excludes generated output and dependencies from AI indexing.
