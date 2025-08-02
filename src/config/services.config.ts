// Service configuration to switch between mock and Firebase implementations
export const SERVICE_CONFIG = {
  // Set to true to use Firebase services, false for mock services
  useFirebase: {
    auth: true,     // Firebase auth is enabled
    products: false, // Using mock for now to test B2C products
    brands: false,   // Using mock for now to test B2C products
    orders: true,   // Firebase orders service is enabled
    storage: true,  // Firebase storage service is enabled
    cart: true,     // Firebase cart service is enabled
    dashboard: true,// Firebase dashboard service is enabled
    messages: true  // Firebase messages service is enabled
  }
}

// Helper to check if we should use Firebase for a specific service
export const shouldUseFirebase = (service: keyof typeof SERVICE_CONFIG.useFirebase): boolean => {
  return SERVICE_CONFIG.useFirebase[service]
}