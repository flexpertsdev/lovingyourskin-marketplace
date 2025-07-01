// Zustand store for shopping cart with MOQ validation
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, CartItem, Product, MOQStatus } from '../types'
import { cartService } from '../services/mock/cart.service'

interface CartState {
  cart: Cart
  isLoading: boolean
  moqStatuses: MOQStatus[]
  
  // Actions
  loadCart: () => Promise<void>
  refreshCart: () => Promise<void>
  addToCart: (product: Product, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  clearBrandItems: (brandId: string) => Promise<void>
  
  // MOQ validation
  validateMOQ: (brandId: string) => Promise<MOQStatus>
  validateAllMOQ: () => Promise<void>
  canCheckout: () => Promise<boolean>
  
  // Computed values
  getItemsByBrand: (brandId: string) => CartItem[]
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        lastUpdated: new Date(),
      },
      isLoading: false,
      moqStatuses: [],
      
      loadCart: async () => {
        set({ isLoading: true })
        try {
          const cart = await cartService.getCart()
          set({ cart, isLoading: false })
          // Validate MOQ on load
          get().validateAllMOQ()
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to load cart:', error)
        }
      },
      
      refreshCart: async () => {
        await get().loadCart()
      },
      
      addToCart: async (product, quantity) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.addToCart(product, quantity)
          set({ cart, isLoading: false })
          // Re-validate MOQ for this brand
          await get().validateMOQ(product.brandId)
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to add to cart:', error)
          throw error
        }
      },
      
      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.updateQuantity(itemId, quantity)
          set({ cart, isLoading: false })
          // Re-validate all MOQ
          await get().validateAllMOQ()
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to update quantity:', error)
        }
      },
      
      removeFromCart: async (itemId) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.removeFromCart(itemId)
          set({ cart, isLoading: false })
          // Re-validate all MOQ
          await get().validateAllMOQ()
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to remove from cart:', error)
        }
      },
      
      clearCart: async () => {
        set({ isLoading: true })
        try {
          const cart = await cartService.clearCart()
          set({ cart, isLoading: false, moqStatuses: [] })
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to clear cart:', error)
        }
      },
      
      clearBrandItems: async (brandId) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.clearBrandItems(brandId)
          set({ cart, isLoading: false })
          // Re-validate remaining MOQ
          await get().validateAllMOQ()
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to clear brand items:', error)
        }
      },
      
      validateMOQ: async (brandId) => {
        try {
          const status = await cartService.validateMOQ(brandId)
          const { moqStatuses } = get()
          const updated = moqStatuses.filter(s => s.brandId !== brandId)
          updated.push(status)
          set({ moqStatuses: updated })
          return status
        } catch (error) {
          console.error('Failed to validate MOQ:', error)
          throw error
        }
      },
      
      validateAllMOQ: async () => {
        try {
          const statuses = await cartService.validateAllMOQ()
          set({ moqStatuses: statuses })
        } catch (error) {
          console.error('Failed to validate all MOQ:', error)
        }
      },
      
      canCheckout: async () => {
        try {
          return await cartService.canCheckout()
        } catch (error) {
          console.error('Failed to check checkout status:', error)
          return false
        }
      },
      
      getItemsByBrand: (brandId) => {
        const { cart } = get()
        return cart.items.filter(item => item.product.brandId === brandId)
      },
      
      getTotalItems: () => {
        const { cart } = get()
        return cart.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        const { cart } = get()
        return cart.items.reduce((sum, item) => 
          sum + (item.product.price.item * item.quantity), 0
        )
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }), // Only persist cart data
    }
  )
)