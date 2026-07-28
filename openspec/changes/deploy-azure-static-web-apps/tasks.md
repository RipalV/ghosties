## 1. Azure Static Web Apps workflow

- [x] 1.1 Add `.github/workflows/deploy-azure-static-web-apps.yml` triggered on `push` to `main`, `pull_request` (`opened`, `synchronize`, `reopened`, `closed`) targeting `main`, and `workflow_dispatch`
- [x] 1.2 Configure the build job to use Node.js 26, run `npm ci`, run `npm run check`, and run `npm run build` to produce `dist` (skip install/check/build on PR close)
- [x] 1.3 Deploy with Azure/static-web-apps-deploy using `AZURE_STATIC_WEB_APPS_API_TOKEN`, upload existing `dist`, and set skip-app-build so the action does not rebuild
- [x] 1.4 On pull_request `closed`, run the Azure action in close mode to remove the preview environment
- [x] 1.5 Ensure the workflow fails before Azure upload when `npm ci`, `npm run check`, or the Vite build fails

## 2. Retire GitHub Pages deployment

- [x] 2.1 Delete `.github/workflows/deploy-pages.yml` so GitHub Pages no longer deploys
- [x] 2.2 Confirm `.github/workflows/ci.yml` remains unchanged

## 3. Documentation (initial SWA)

- [x] 3.1 Add a README section for Azure Portal Static Web Apps setup and creating the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [x] 3.2 Document how to find the production deployed URL and PR preview URLs
- [x] 3.3 Document how to trigger a manual production redeployment from GitHub Actions
- [x] 3.4 Note that CI validation remains separate and that GitHub Pages deployment is retired

## 4. Validation (initial SWA)

- [x] 4.1 Run `npm run check` locally and confirm gameplay toolchain still passes with no game-code changes
- [x] 4.2 Review workflow files and README to confirm no Azure secrets, tokens, or subscription IDs are committed
- [x] 4.3 Spot-check that Phaser, TypeScript, Vite, Vitest, Cursor rules, and OpenSpec setup are unchanged aside from deployment docs/workflows

## 5. Terraform infrastructure

- [x] 5.1 Add Terraform root module (e.g. `terraform/`) with `azurerm` provider creating a resource group and Azure Static Web App for Ghosties
- [x] 5.2 Configure remote state backend (Azure Storage) via partial/backend config suitable for CI; gitignore local state, `.terraform/`, and secret tfvars
- [x] 5.3 Expose non-secret outputs (hostname / default URL) and a sensitive deployment-token output for operator/secret setup
- [x] 5.4 Add example `terraform.tfvars.example` (no secrets) documenting variables (name, region, SKU)

## 6. Pipeline integration for Terraform

- [x] 6.1 Add a production-path job/steps: Azure login (OIDC preferred), `terraform init`, `terraform apply` before build/deploy; fail the workflow if apply fails
- [x] 6.2 On pull requests targeting `main`, run `terraform plan` (do not apply shared production infra changes as part of ordinary PR preview)
- [x] 6.3 Wire required GitHub secrets/variables for Terraform Azure auth without committing credential values
- [x] 6.4 Keep `AZURE_STATIC_WEB_APPS_API_TOKEN` as the deploy action secret; document populating it from Terraform output after first apply

## 7. Documentation and validation (Terraform scope)

- [x] 7.1 Update README: replace Portal-only create steps with Terraform + pipeline setup, backend bootstrap, and required secrets
- [x] 7.2 Re-run `npm run check` and confirm no gameplay/toolchain regressions
- [x] 7.3 Confirm no Azure secrets, tokens, or state files are committed

## 8. Production Azure naming (no example tfvars)

- [x] 8.1 Add committed `terraform/terraform.tfvars` with `uksouth`, `rg-ghosties-prod`, `swa-ghosties-prod`, Free SKU; delete `terraform.tfvars.example`
- [x] 8.2 Allow tracking `terraform/terraform.tfvars` in `.gitignore` while still ignoring other secret tfvars/state
- [x] 8.3 Align Terraform variable defaults with the same production names/region/SKU
- [x] 8.4 Hard-code Terraform backend init to `rg-uks-foundation` / `stripalterraformproduks` / `tfstate-ghosties` / `ghosties.tfstate` (remove `TF_STATE_*` variable placeholders)
- [x] 8.5 Update README with fixed resource names, state backend, and OIDC secret setup for subscription `9b624e2f-8326-44e6-953d-b251af487227` and tenant `62aa5204-8b12-4ee2-aaee-38615e81bf68`
- [x] 8.6 Re-run `npm run check` and confirm no client secrets, deployment tokens, or state files are committed

## 9. Production path main-only gating

- [x] 9.1 Gate Terraform apply and production deploy jobs on `refs/heads/main` (push or workflow_dispatch); keep PR plan + preview deploy separate
- [x] 9.2 Document main-only production deploy and manual redeploy branch requirement in README
- [x] 9.3 Update OpenSpec delta spec/design for production-path main-only scenarios

## 10. Static Web App region fix

- [x] 10.1 Place SWA in `westeurope` (supported region); update tfvars, variables, README, and OpenSpec

## 11. Colocate RG and SWA in westeurope

- [x] 11.1 Set resource group `location` to `westeurope` alongside SWA; update Terraform defaults, README, and OpenSpec artifacts

## 12. RG uksouth and SWA eastus2

- [x] 12.1 Set resource group to `uksouth` and Static Web App to `eastus2`; update Terraform, README, and OpenSpec artifacts

## 13. SWA deploy action inputs and token

- [x] 13.1 Remove unsupported `skip_api_build` from the Azure Static Web Apps deploy action
- [x] 13.2 Pass production deploy token from Terraform output after apply; keep `AZURE_STATIC_WEB_APPS_API_TOKEN` for PR preview/close; document the secret requirement

## 14. Fetch live SWA API key from Azure

- [x] 14.1 Fetch deployment token via `az staticwebapp secrets list` after OIDC login for production, preview, and close jobs (avoid stale GitHub secret)
