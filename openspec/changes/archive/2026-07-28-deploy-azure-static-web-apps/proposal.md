## Why

Ghosties needs a reliable hosted preview of the Vite/Phaser build so playtesters and reviewers can try the game without running it locally. GitHub Pages is already wired, but the project now standardises on Azure Static Web Apps for production and pull-request preview environments with safer secret handling and automatic preview cleanup. Manual Portal-only resource creation is easy to drift from; Terraform must create and manage the required Azure resources as part of the deployment pipeline so infrastructure stays repeatable and versioned with the app. Resource names and region are fixed for the Ghosties production subscription so operators do not rely on a copy-from-example tfvars workflow.

## What Changes

- Add a GitHub Actions workflow that deploys the Vite `dist` output to Azure Static Web Apps.
- Deploy production automatically from `main`, and create temporary Azure preview environments for pull requests targeting `main`.
- Close Azure preview environments when pull requests are closed.
- Validate with `npm ci` and `npm run check` before deployment; fail the workflow if checks fail.
- Build with Node.js 26, then upload the existing `dist` directory without rebuilding inside the Azure Static Web Apps action.
- Add Terraform under version control to create the required Azure resources (resource group `rg-ghosties-prod` in `uksouth` and Static Web App `swa-ghosties-prod` in `eastus2`, Free SKU).
- Commit a real `terraform/terraform.tfvars` with those non-secret values; remove `terraform.tfvars.example`.
- Use fixed Terraform remote state locations: resource group `rg-uks-foundation`, storage account `stripalterraformproduks`, container `tfstate-ghosties` (baked into the workflow / docs — not placeholder GitHub variables).
- Run Terraform as part of the deployment pipeline so infrastructure is applied (or planned) before the app is uploaded.
- Authenticate via GitHub OIDC using secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` (`62aa5204-8b12-4ee2-aaee-38615e81bf68`), and `AZURE_SUBSCRIPTION_ID` (`9b624e2f-8326-44e6-953d-b251af487227`); never commit client secrets, deployment tokens, or Terraform state.
- Store the Azure Static Web Apps deployment token only in GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
- Remove or disable `.github/workflows/deploy-pages.yml` so GitHub Pages no longer deploys.
- Keep `.github/workflows/ci.yml` intact for ongoing validation.
- Document Terraform usage, required GitHub secrets (including the target tenant/subscription IDs for secret setup), how to find the deployed URL, and how to trigger a manual redeployment in the README.
- Do not change gameplay, visuals, game logic, mobile controls, Cursor rules, or OpenSpec project structure.

## Capabilities

### New Capabilities
- `azure-static-web-apps-deployment`: Hosting and CI/CD behaviour for deploying Ghosties to Azure Static Web Apps, including Terraform-managed Azure resources with committed production naming for subscription `9b624e2f-8326-44e6-953d-b251af487227`, pipeline apply/plan, PR previews, secret handling, GitHub Pages retirement, and operator documentation.

### Modified Capabilities
- (none) — existing `core-gameplay` requirements are unchanged.

## Impact

- Terraform under `terraform/` with committed `terraform.tfvars` (no example file)
- GitHub Actions workflows under `.github/workflows/` (fixed state backend config + app deploy)
- README setup and deployment documentation
- GitHub Actions secrets for OIDC and Static Web Apps deploy token (values configured in GitHub, not committed as secret files)
- No changes to Phaser scenes, entities, fear rules, Vite gameplay config, Vitest tests, Cursor rules, or OpenSpec schemas
