variable "location" {
  type        = string
  description = "Azure region for the resource group and Static Web App."
  default     = "uksouth"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the Azure resource group to create."
  default     = "rg-ghosties-prod"
}

variable "static_web_app_name" {
  type        = string
  description = "Globally unique name for the Azure Static Web App."
  default     = "swa-ghosties-prod"
}

variable "sku_tier" {
  type        = string
  description = "Static Web App SKU tier (Free or Standard)."
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "sku_tier must be Free or Standard."
  }
}

variable "sku_size" {
  type        = string
  description = "Static Web App SKU size (Free or Standard). Must match sku_tier."
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_size)
    error_message = "sku_size must be Free or Standard."
  }
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to Azure resources."
  default = {
    project     = "ghosties"
    managed_by  = "terraform"
    environment = "prod"
  }
}
