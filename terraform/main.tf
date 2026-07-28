resource "azurerm_resource_group" "ghosties" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_static_web_app" "ghosties" {
  name                = var.static_web_app_name
  resource_group_name = azurerm_resource_group.ghosties.name
  location            = azurerm_resource_group.ghosties.location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_size
  tags                = var.tags

  # Deployments use the API token from GitHub Actions, which updates these fields in Azure.
  lifecycle {
    ignore_changes = [
      repository_branch,
      repository_url,
    ]
  }
}
