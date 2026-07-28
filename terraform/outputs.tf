output "resource_group_name" {
  description = "Name of the Ghosties resource group."
  value       = azurerm_resource_group.ghosties.name
}

output "static_web_app_name" {
  description = "Name of the Azure Static Web App."
  value       = azurerm_static_web_app.ghosties.name
}

output "static_web_app_url" {
  description = "HTTPS URL of the Static Web App default hostname."
  value       = "https://${azurerm_static_web_app.ghosties.default_host_name}"
}

output "default_host_name" {
  description = "Default hostname of the Static Web App."
  value       = azurerm_static_web_app.ghosties.default_host_name
}

output "deployment_token" {
  description = "API key for Azure Static Web Apps GitHub Action. Store as AZURE_STATIC_WEB_APPS_API_TOKEN."
  value       = azurerm_static_web_app.ghosties.api_key
  sensitive   = true
}
