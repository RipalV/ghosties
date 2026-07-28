# Remote state is configured at init time via -backend-config flags in CI/local docs.
# Do not commit access keys or subscription-specific backend values here.
terraform {
  backend "azurerm" {}
}
