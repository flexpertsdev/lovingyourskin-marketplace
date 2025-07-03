// Service configuration to switch between mock and Firebase implementations
export const SERVICE_CONFIG = {
  // Set to true to use Firebase services, false for mock services
  useFirebase: {
    auth: false, // Start with false, we'll enable gradually
    products: false,
    brands: false,
    orders: false,
    storage: false
  }
}

// Helper to check if we should use Firebase for a specific service
export const shouldUseFirebase = (service: keyof typeof SERVICE_CONFIG.useFirebase): boolean => {
  return SERVICE_CONFIG.useFirebase[service]
}