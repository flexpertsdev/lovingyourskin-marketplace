// Central export for all services
// Uses configuration to switch between mock and Firebase implementations

import { shouldUseFirebase } from '../config/services.config'
import { authService as mockAuthService } from './mock/auth.service'
import { firebaseAuthService } from './firebase/auth.service'
import { productService as mockProductService } from './mock/product.service'
import { cartService as mockCartService } from './mock/cart.service'
import { orderService as mockOrderService } from './mock/order.service'
import { dashboardService as mockDashboardService } from './mock/dashboard.service'

// Auth service - can switch between mock and Firebase
export const authService = shouldUseFirebase('auth') ? firebaseAuthService : mockAuthService

// Other services - still using mock for now
export const productService = mockProductService
export const cartService = mockCartService
export const orderService = mockOrderService
export const dashboardService = mockDashboardService