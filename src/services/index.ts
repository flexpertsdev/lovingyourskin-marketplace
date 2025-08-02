// Central export for all services
// Services use Firebase or Mock based on configuration

import { shouldUseFirebase } from '../config/services.config'

// Firebase services
import { firebaseAuthService } from './firebase/auth.service'
import { firebaseProductService } from './firebase/product.service'
import { firebaseCartService } from './firebase/cart.service'
import { firebaseOrderService } from './firebase/order.service'
import { firebaseDashboardService } from './firebase/dashboard.service'
import { firebaseMessageService } from './firebase/message.service'

// Mock services
import { productService as mockProductService } from './mock/product.service'

// Export services based on configuration
export const authService = firebaseAuthService
export const productService = shouldUseFirebase('products') ? firebaseProductService : mockProductService
export const cartService = firebaseCartService
export const orderService = firebaseOrderService
export const dashboardService = firebaseDashboardService
export const messageService = firebaseMessageService