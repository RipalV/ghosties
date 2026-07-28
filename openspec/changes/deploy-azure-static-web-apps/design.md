## Context

Ghosties already has (or this change already delivered):

- CI validation in `.github/workflows/ci.yml` (Node 22)
- Azure Static Web Apps deploy workflow with Terraform plan/apply jobs
- GitHub Pages workflow removed
- Vite `base: './'`
- A generic `terraform.tfvars.example` and GitHub Variables for state backend placeholders

Operators provided concrete Azure production details. The plan now locks those values into the repo (non-secret naming) and removes the example-tfvars workflow.

## Goals / Non-Goals

**Goals:**

- Keep existing SWA deploy, PR preview/close, Node 22 validation, skip-app-build upload, Pages retirement, and CI workflow
- Pin Terraform app resources to:
  - Resource group region: `westeurope`
  - Static Web App region: `westeurope` (SWA unsupported in `uksouth`)
  - Resource group: `rg-ghosties-prod`
  - Static Web App: `swa-ghosties-prod`
  - SKU: Free (`sku_tier` / `sku_size` = `Free`)
- Commit `terraform/terraform.tfvars` with those values (Option A); delete `terraform.tfvars.example`
- Pin remote state to:
  - Resource group: `rg-uks-foundation`
  - Storage account: `stripalterraformproduks`
  - Container: `tfstate-ghosties`
  - Key: `ghosties.tfstate`
- Keep OIDC auth via GitHub secrets; document expected IDs:
  - Subscription: `9b624e2f-8326-44e6-953d-b251af487227` → secret `AZURE_SUBSCRIPTION_ID`
  - Tenant: `62aa5204-8b12-4ee2-aaee-38615e81bf68` → secret `AZURE_TENANT_ID`
  - Plus `AZURE_CLIENT_ID` and `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Never commit client secrets, deployment tokens, or `*.tfstate`

**Non-Goals:**

- Gameplay / Vite / Cursor / OpenSpec schema changes
- Azure Functions backends
- Committing OIDC client secrets or the SWA API token
- Multi-environment Terraform modules beyond this production SWA

## Decisions

### 1. Committed `terraform.tfvars` (no example file)

- **Decision:** Track `terraform/terraform.tfvars` with production naming/region/SKU. Remove `terraform.tfvars.example`. Adjust `.gitignore` so this committed tfvars is allowed while still ignoring ad-hoc secret tfvars if any.
- **Why:** Operator choice (Option A); removes copy-paste setup friction.
- **Alternatives considered:** Example-only file — rejected; defaults-only in `variables.tf` — rejected in favour of explicit committed tfvars.

### 2. Fixed remote state backend in the workflow

- **Decision:** Hard-code backend config in the GitHub Actions Terraform init step to `rg-uks-foundation` / `stripalterraformproduks` / `tfstate-ghosties` / `ghosties.tfstate`. Stop requiring `TF_STATE_*` GitHub Variables for routine deploys.
- **Why:** State location is known and stable for this project.
- **Alternatives considered:** Keep placeholder variables — rejected.

### 3. Subscription and tenant stay in GitHub secrets (OIDC)

- **Decision:** Do not put subscription or tenant IDs into committed Terraform provider files as the primary auth path. Operators set:
  - `AZURE_SUBSCRIPTION_ID` = `9b624e2f-8326-44e6-953d-b251af487227`
  - `AZURE_TENANT_ID` = `62aa5204-8b12-4ee2-aaee-38615e81bf68`
  - `AZURE_CLIENT_ID` = (app registration)
- Document these expected secret values in the README so setup is unambiguous.
- **Why:** Matches confirmed OIDC approach; avoids treating auth material as Terraform input while still specifying the target subscription.
- **Alternatives considered:** Hard-code IDs in `provider "azurerm"` — unnecessary when OIDC login already scopes the subscription.

### 4. Production deploy and apply are main-only

- **Decision:** Gate `terraform apply` and the production upload job on `github.ref == 'refs/heads/main'` for `push` and `workflow_dispatch`. Keep PR path as `terraform plan` + preview upload only (separate job). Push triggers remain limited to `main`.
- **Why:** Prevents accidental production Terraform apply or production SWA upload from PRs or `workflow_dispatch` on non-main branches.
- **Alternatives considered:** Rely on push branch filter alone — insufficient for `workflow_dispatch` from other branches.

### 5. Colocate resource group and Static Web App in westeurope

- **Decision:** Create both `rg-ghosties-prod` and `swa-ghosties-prod` in `westeurope`. Keep a separate `static_web_app_location` variable (validated against SWA-supported regions) even when it matches the RG location.
- **Why:** SWA cannot be created in `uksouth`; operators chose to colocate the RG in `westeurope` as well for a single production region.
- **Alternatives considered:** RG in `uksouth` + SWA in `westeurope` — rejected after operator preference for colocated `westeurope`.

### 6–7. Prior decisions retained

- Terraform owns RG + SWA; pipeline apply on main / plan on PR; SWA token via `AZURE_STATIC_WEB_APPS_API_TOKEN`; no gameplay changes.

## Risks / Trade-offs

- **[Risk] Globally unique SWA name clash** → Mitigation: name fixed as `swa-ghosties-prod`; rename via PR if Azure rejects.
- **[Risk] State storage account permissions** → Mitigation: document Contributor (or equivalent) for the OIDC identity on `rg-uks-foundation` and app RGs.
- **[Risk] Committed tfvars drifts from Azure** → Mitigation: PRs run `terraform plan` to surface drift.
- Prior risks (OIDC misconfig, sensitive outputs, duplicate CI cost) unchanged.

## Migration Plan

1. Replace example tfvars with committed production `terraform.tfvars`; update gitignore.
2. Bake state backend names into the workflow; update README secret tables with tenant/subscription IDs.
3. Align variable defaults with production values for local runs without tfvars if needed.
4. Re-validate `npm run check`; confirm no tokens/state committed.

## Open Questions

- None for naming/auth — resolved by operator answers on 2026-07-28.
