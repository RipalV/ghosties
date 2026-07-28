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

Prerequisites: Node.js 26 or newer. The repo includes an `.nvmrc` file pinned to Node 26 (matching CI).

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

Install Node.js 26 or newer from [nodejs.org](https://nodejs.org/), then run `npm install` and `npm run dev` as above.

## Controls

- Move: WASD, mouse click, or tap anywhere on the lobby floor
- Whisper: 1
- Cold Puff: 2
- Object Nudge: 3
- The square scare buttons beside the ghost card work with mouse or touch
- Zoom: the **＋** and **－** buttons on the right edge, or a pinch (both snap to fixed zoom steps)

## Mobile play

- Play in **landscape**. Portrait (viewport taller than wide) shows a “Rotate to play” message and pauses interaction; it clears on rotation without a reload.
- The lobby fills the whole canvas on any ratio. The camera follows the ghost automatically inside a larger lobby world, so there are no letterbox bars and no panning to manage. When Nora walks out of view, an edge marker gives her direction and distance.
- Zoom has three fixed steps and is clamped to the lobby, so the view can never end up somewhere unusable. Zoom changes the view only — scare ranges and outcomes are unaffected.
- Rendering uses the device pixel ratio (capped at 2×), so small HUD text stays sharp on high-density screens.
- Tap the **⛶** button in the top-right corner for full screen, which hides the browser address bar. Browsers only allow this from a tap, and iPhone Safari does not support it — the game still fills the viewport there.
- The HUD floats over the play area: objective button and value chips along the top, ghost card with the scare grid in the bottom-left, zoom on the right edge, all clear of safe-area insets.
- Prefer reviewing visuals on a physical phone via the Azure Static Web Apps **pull-request preview** URL after opening a PR.

## Validate

```bash
npm run check
```

The existing CI workflow (`.github/workflows/ci.yml`) still runs this validation on every pull request and every push to `main`. It is separate from deployment. The Azure deploy workflow also re-runs `npm ci` and `npm run check` before uploading so a failed check blocks deployment.

## Deploy to Azure Static Web Apps

Ghosties is hosted on [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/overview). Infrastructure is managed with Terraform in `terraform/`. GitHub Pages deployment has been retired; do not re-enable `.github/workflows/deploy-pages.yml`.

### Production Azure resources (Terraform)

Committed `terraform/terraform.tfvars` pins:

| Setting | Value |
|---------|--------|
| Resource group region | `uksouth` |
| Static Web App region | `eastus2` (SWA is not available in `uksouth`; supported: `westus2`, `centralus`, `eastus2`, `eastasia`) |
| Resource group | `rg-ghosties-prod` |
| Static Web App | `swa-ghosties-prod` |
| SKU | Free |

### Terraform remote state

The deploy workflow initialises Terraform against this existing Azure Storage backend:

| Setting | Value |
|---------|--------|
| Resource group | `rg-uks-foundation` |
| Storage account | `stripalterraformproduks` |
| Container | `tfstate-ghosties` |
| State key | `ghosties.tfstate` |

Grant the GitHub Actions OIDC identity permission to use that storage account and to create/manage `rg-ghosties-prod` and `swa-ghosties-prod` (for example Contributor on the subscription or on those resource groups).

### GitHub Actions secrets

**Secrets** (Settings → Secrets and variables → Actions → Secrets):

| Name | Expected value / purpose |
|------|--------------------------|
| `AZURE_CLIENT_ID` | App registration client ID for GitHub OIDC login |
| `AZURE_TENANT_ID` | `62aa5204-8b12-4ee2-aaee-38615e81bf68` |
| `AZURE_SUBSCRIPTION_ID` | `9b624e2f-8326-44e6-953d-b251af487227` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Optional backup only — the deploy workflow reads the live API key from Azure after OIDC login |

Configure [Azure Login with OpenID Connect](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect) for the app registration (federated credential for this repository). Never commit client secrets, deployment tokens, or Terraform state into the repo.

### First apply and deployment token

After OIDC secrets are set, either run the deploy workflow on `main` or apply locally:

```bash
cd terraform
az login
terraform init \
  -backend-config="resource_group_name=rg-uks-foundation" \
  -backend-config="storage_account_name=stripalterraformproduks" \
  -backend-config="container_name=tfstate-ghosties" \
  -backend-config="key=ghosties.tfstate"
terraform apply
terraform output -raw deployment_token
```

The workflow fetches the current API key from Azure **inside each deploy job** after OIDC login (`az staticwebapp secrets list`). Masked tokens cannot be passed between jobs via outputs, so the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` is optional. Do not commit the token or Terraform state files.

### What the workflow does

The workflow `.github/workflows/deploy-azure-static-web-apps.yml`:

- **Production (main only):** On push to `main` or manual `workflow_dispatch` while on `main`: Azure OIDC login → `terraform apply` → Node 26 `npm ci` / `npm run check` / `npm run build` → upload existing `dist` to production (no rebuild inside the Azure action). Production Terraform apply and production deploy never run for pull requests or non-`main` branches.
- **Pull request preview:** On PRs targeting `main`: `terraform plan` (no apply) → same build → Azure **preview** environment only
- On pull request close: closes the Azure preview environment
- Fails before upload if Terraform apply (production path), `npm ci`, `npm run check`, or the Vite build fails

### Find the deployed URL

- **Production:** `terraform output static_web_app_url`, or Azure Portal → Static Web App `swa-ghosties-prod` → **Overview** → URL (also in the GitHub Actions job summary after a successful deploy).
- **Pull request preview:** Open the pull request on GitHub; Azure Static Web Apps comments with the preview URL (or check the workflow run logs / summary).

### Manual production redeployment

1. Open the repository on GitHub → **Actions**.
2. Select **Deploy Ghosties to Azure Static Web Apps**.
3. Click **Run workflow**, choose the **`main`** branch, and run it. Running the workflow from any other branch does not deploy production.

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
