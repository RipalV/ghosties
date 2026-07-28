location                = "uksouth"
static_web_app_location = "eastus2"
resource_group_name     = "rg-ghosties-prod"
static_web_app_name     = "swa-ghosties-prod"
sku_tier                = "Free"
sku_size                = "Free"

tags = {
  project     = "ghosties"
  managed_by  = "terraform"
  environment = "prod"
}
