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
import { firebaseDiscountService } from './firebase/discount.service'
import { firebaseAffiliateService } from './firebase/affiliate.service'
import { firebasePreorderService } from './firebase/preorder.service'
import { invoiceService as firebaseInvoiceService } from './invoice/invoice.service'

// Export Firebase services
export const authService = firebaseAuthService
export const brandService = firebaseBrandService
export const productService = firebaseProductService
export const cartService = firebaseCartService
export const orderService = firebaseOrderService
export const dashboardService = firebaseDashboardService
export const messageService = firebaseMessageService
export const storageService = firebaseStorageService
export const discountService = firebaseDiscountService
export const affiliateService = firebaseAffiliateService
export const preorderService = firebasePreorderService
export const invoiceService = firebaseInvoiceService