// Central export for all Firebase services

// Firebase services
import { firebaseAuthService } from './firebase/auth.service'
import { firebaseProductService } from './firebase/product.service'
import { firebaseCartService } from './firebase/cart.service'
import { firebaseOrderService } from './firebase/order.service'
import { firebaseDashboardService } from './firebase/dashboard.service'
import { firebaseMessageService } from './firebase/message.service'

// Export Firebase services
export const authService = firebaseAuthService
export const productService = firebaseProductService
export const cartService = firebaseCartService
export const orderService = firebaseOrderService
export const dashboardService = firebaseDashboardService
export const messageService = firebaseMessageService