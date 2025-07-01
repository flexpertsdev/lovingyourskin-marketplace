// Central export for all services
// Currently using mock services, will be swapped for Firebase later

export { authService } from './mock/auth.service'
export { productService } from './mock/product.service'
export { cartService } from './mock/cart.service'
export { orderService } from './mock/order.service'
export { dashboardService } from './mock/dashboard.service'

// When switching to Firebase, just change the imports:
// export { authService } from './firebase/auth.service'
// export { productService } from './firebase/product.service'
// export { cartService } from './firebase/cart.service'