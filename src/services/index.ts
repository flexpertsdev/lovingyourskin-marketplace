// Central export for all Firebase services

// Firebase services
import { firebaseAuthService } from './firebase/auth.service'
import { firebaseBrandService } from './firebase/brand.service'
import { firebaseProductService } from './firebase/product.service'
import { firebaseCartService } from './firebase/cart.service'
import { firebaseOrderService } from './firebase/order.service'
import { firebaseDashboardService } from './firebase/dashboard.service'
import { firebaseMessageService } from './firebase/message.service'
import { firebaseStorageService } from './firebase/storageService'

// Export Firebase services
export const authService = firebaseAuthService
export const brandService = firebaseBrandService
export const productService = firebaseProductService
export const cartService = firebaseCartService
export const orderService = firebaseOrderService
export const dashboardService = firebaseDashboardService
export const messageService = firebaseMessageService
export const storageService = firebaseStorageService