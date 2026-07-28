## ADDED Requirements

### Requirement: Production deploys from main to Azure Static Web Apps
The project SHALL deploy the built Vite `dist` output to the production Azure Static Web Apps site only when changes are pushed to the `main` branch (or when `workflow_dispatch` runs on `main`), after successful validation and build with Node.js 22. Pull requests and non-`main` refs MUST NOT update production.

#### Scenario: Push to main deploys production
- **WHEN** a commit is pushed to `main`
- **THEN** the deployment workflow installs dependencies with `npm ci`
- **AND** runs `npm run check`
- **AND** builds the application into `dist`
- **AND** uploads the existing `dist` output to Azure Static Web Apps without rebuilding inside the Azure action
- **AND** the production Azure Static Web Apps site is updated

#### Scenario: Manual production redeploy
- **WHEN** a maintainer triggers the deployment workflow manually from GitHub Actions on the `main` branch
- **THEN** the same validation, build, and Azure Static Web Apps upload path runs for production

#### Scenario: Production path is main-only
- **WHEN** a pull request targets `main`, or the workflow runs on any ref other than `refs/heads/main`
- **THEN** Terraform apply against production infrastructure does not run
- **AND** the production Azure Static Web Apps site is not updated
- **AND** pull requests MAY still create or update a separate preview environment only

### Requirement: Terraform creates required Azure resources
The project SHALL include Terraform configuration that creates Azure resource group `rg-ghosties-prod` and Static Web App `swa-ghosties-prod` in region `uksouth` with Free SKU, using committed non-secret variable values (no `terraform.tfvars.example` workflow).

#### Scenario: Terraform defines Static Web App with production names
- **WHEN** an operator inspects the repository Terraform configuration
- **THEN** it targets resource group `rg-ghosties-prod` and Static Web App `swa-ghosties-prod` in `uksouth` with Free SKU
- **AND** those values are present in committed `terraform/terraform.tfvars`
- **AND** it does not hard-code deployment tokens or client secrets in tracked files

### Requirement: Fixed Terraform remote state backend
The deployment pipeline MUST initialise Terraform against Azure Storage state in resource group `rg-uks-foundation`, storage account `stripalterraformproduks`, container `tfstate-ghosties`, and state key `ghosties.tfstate`.

#### Scenario: Pipeline uses known state backend
- **WHEN** the deployment workflow runs Terraform init
- **THEN** it configures the azurerm backend to the fixed Ghosties state storage locations above
- **AND** it does not require placeholder GitHub Variables for those backend names

### Requirement: Terraform runs in the deployment pipeline
The deployment pipeline MUST run Terraform against Azure subscription `9b624e2f-8326-44e6-953d-b251af487227` (via OIDC / `AZURE_SUBSCRIPTION_ID`) as part of production deployment so required resources are created or updated before the application package is uploaded.

#### Scenario: Main branch applies infrastructure then deploys
- **WHEN** a push to `main` or a manual workflow dispatch on `main` runs the deployment pipeline
- **THEN** the pipeline authenticates to Azure with OIDC using GitHub secrets (including tenant `62aa5204-8b12-4ee2-aaee-38615e81bf68` via `AZURE_TENANT_ID`)
- **AND** runs Terraform to apply (or equivalently ensure) the required Azure resources
- **AND** only after successful infrastructure provisioning continues to build and upload `dist` to the production Azure Static Web Apps site

#### Scenario: Pull request plans infrastructure without mutating production
- **WHEN** a pull request targeting `main` is opened or updated
- **THEN** the pipeline MAY run `terraform plan`
- **AND** MUST NOT apply destructive or shared-infrastructure changes that replace the production Static Web App as part of ordinary PR preview validation

### Requirement: Validation gates deployment
The deployment workflow MUST fail before uploading to Azure when dependency install, `npm run check`, the Vite build, or required Terraform apply (on the production path) fails.

#### Scenario: Failed checks block deployment
- **WHEN** `npm run check` fails during a deployment workflow run
- **THEN** the workflow fails
- **AND** no Azure Static Web Apps upload occurs

#### Scenario: Failed build blocks deployment
- **WHEN** the Vite production build fails during a deployment workflow run
- **THEN** the workflow fails
- **AND** no Azure Static Web Apps upload occurs

#### Scenario: Failed Terraform apply blocks production deployment
- **WHEN** Terraform apply fails on the production deployment path
- **THEN** the workflow fails
- **AND** no Azure Static Web Apps upload occurs for that run

### Requirement: Pull request preview environments
The project SHALL create or update a temporary Azure Static Web Apps preview environment for pull requests that target `main`, using the same Node.js 22 validation and build steps as production.

#### Scenario: Open or update PR creates preview
- **WHEN** a pull request targeting `main` is opened or updated with new commits
- **THEN** the deployment workflow runs `npm ci`, `npm run check`, and the Vite build
- **AND** uploads the existing `dist` output to an Azure Static Web Apps preview environment for that pull request

### Requirement: Preview cleanup on pull request close
The project SHALL close the Azure Static Web Apps preview environment when a pull request targeting `main` is closed.

#### Scenario: Closed PR removes preview
- **WHEN** a pull request targeting `main` is closed
- **THEN** the workflow closes the associated Azure Static Web Apps preview environment

### Requirement: Secure Azure deployment credentials
The deployment workflow MUST authenticate to Azure Static Web Apps using the GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN` and MUST authenticate Terraform via GitHub Actions OIDC secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`). The repository MUST NOT store Azure deployment tokens, client secrets, or Terraform state files containing secrets in tracked source files. Committed `terraform.tfvars` MAY contain non-secret resource names, region, and SKU only.

#### Scenario: Token comes from GitHub secret
- **WHEN** the deployment workflow uploads to Azure Static Web Apps
- **THEN** it reads the deployment token only from the GitHub Actions secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **AND** no Azure client secret or deployment token appears as a committed secret value in repository files

#### Scenario: Terraform state and credentials stay out of git
- **WHEN** Terraform is used in CI or locally
- **THEN** `terraform.tfstate` and Azure client secrets are gitignored or otherwise excluded from commits
- **AND** committed `terraform.tfvars` contains only non-secret configuration

### Requirement: GitHub Pages deployment is retired
The previous GitHub Pages deployment workflow MUST no longer run, so only Azure Static Web Apps performs hosted deployments.

#### Scenario: GitHub Pages workflow inactive
- **WHEN** a push to `main` or a manual workflow dispatch occurs
- **THEN** the previous GitHub Pages deployment workflow does not deploy
- **AND** Azure Static Web Apps remains the active hosting path

### Requirement: Existing CI validation remains
The existing GitHub Actions validation workflow SHALL remain intact and continue to validate pull requests and pushes to `main` independently of the Azure deployment workflow.

#### Scenario: CI continues to validate
- **WHEN** a pull request is opened or a commit is pushed to `main`
- **THEN** the existing CI validation workflow still runs
- **AND** its presence is retained unless duplication is explicitly documented and justified in project documentation

### Requirement: Deployment documentation
The README MUST document Terraform-based Azure resource setup with the production names and fixed state backend, required GitHub Actions secrets (including that `AZURE_SUBSCRIPTION_ID` and `AZURE_TENANT_ID` must match the Ghosties production IDs), how to find the deployed URL, and how to trigger a manual redeployment from GitHub Actions.

#### Scenario: Operator can follow README setup
- **WHEN** an operator reads the README deployment section
- **THEN** they can configure OIDC secrets for the documented tenant and subscription
- **AND** understand the fixed Terraform state backend and committed `terraform.tfvars`
- **AND** configure the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **AND** locate the production deployed URL
- **AND** trigger a manual redeployment from GitHub Actions

### Requirement: Gameplay and toolchain unchanged
This deployment change MUST NOT alter gameplay behaviour, visual assets, game logic, mobile controls, Cursor rules, or the OpenSpec project structure beyond deployment workflows, Terraform infrastructure, and documentation needed for Azure Static Web Apps.

#### Scenario: Game and toolchain preserved
- **WHEN** the Azure Static Web Apps deployment change is applied
- **THEN** existing Phaser, TypeScript, Vite, and Vitest setup continues to work
- **AND** gameplay, visual assets, game logic, and mobile controls are unchanged
- **AND** `npm run check` continues to pass for the game codebase
