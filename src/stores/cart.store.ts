// Zustand store for shopping cart with MOQ validation and discount support
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, CartItem, Product, MOQStatus, Brand } from '../types'
import { DiscountValidationResult } from '../types/discount'
import { cartService } from '../services'
import { 
  calculateVolumeDiscount, 
  calculateMOQStatus, 
  generateUpsellMessage,
  applyDiscountCodes,
  canProceedToCheckout
} from '../utils/discount-helpers'

interface BrandCartSummary {
  brandId: string
  brandName: string
  items: CartItem[]
  subtotal: number
  moqStatus: ReturnType<typeof calculateMOQStatus>
  volumeDiscount?: {
    discount: { threshold: number; discountPercentage: number } | null
    discountAmount: number
    savings: number
    nextTier?: { threshold: number; discountPercentage: number; amountNeeded: number }
  }
  appliedDiscountCodes: DiscountValidationResult[]
  total: number // After all discounts
  canCheckout: boolean
  upsellMessage?: string
}

interface CartState {
  cart: Cart
  isLoading: boolean
  moqStatuses: MOQStatus[]
  appliedDiscounts: DiscountValidationResult[]
  brands: Brand[] // Cached brand data for calculations
  
  // Actions
  loadCart: () => Promise<void>
  refreshCart: () => Promise<void>
  addToCart: (product: Product, quantity: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  clearBrandItems: (brandId: string) => Promise<void>
  
  // Brand data management
  loadBrandData: () => Promise<void>
  setBrands: (brands: Brand[]) => void
  
  // Discount management
  applyDiscountCode: (discountValidation: DiscountValidationResult) => void
  removeDiscountCode: (discountCodeId: string) => void
  clearDiscountCodes: () => void
  
  // MOQ validation
  validateMOQ: (brandId: string) => Promise<MOQStatus>
  validateAllMOQ: () => Promise<void>
  canCheckout: () => Promise<boolean>
  
  // Enhanced computed values
  getItemsByBrand: (brandId: string) => CartItem[]
  getBrandCartSummary: (brandId: string) => BrandCartSummary | null
  getAllBrandCartSummaries: () => BrandCartSummary[]
  getTotalItems: () => number
  getTotalPrice: () => number
  getTotalWithDiscounts: () => number
  getCheckoutEligibility: () => ReturnType<typeof canProceedToCheckout>
  getFilteredCartItems: (brandIds?: string[]) => CartItem[]
  getBrandSubtotal: (brandId: string) => number
  
  // Upsell and messaging
  getUpsellMessage: (brandId: string) => string | null
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
      appliedDiscounts: [],
      brands: [],
      
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
      
      updateQuantity: async (productId, quantity) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.updateQuantity(productId, quantity)
          set({ cart, isLoading: false })
          // Re-validate all MOQ
          await get().validateAllMOQ()
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to update quantity:', error)
        }
      },

      removeFromCart: async (productId) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.removeFromCart(productId)
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
          set({ 
            cart, 
            isLoading: false, 
            moqStatuses: [], 
            appliedDiscounts: [] 
          })
        } catch (error) {
          set({ isLoading: false })
          console.error('Failed to clear cart:', error)
        }
      },
      
      clearBrandItems: async (brandId) => {
        set({ isLoading: true })
        try {
          const cart = await cartService.clearBrandItems(brandId)
          // Remove applied discounts for this brand
          const { appliedDiscounts } = get()
          const filteredDiscounts = appliedDiscounts.filter(discount => {
            return !discount.discountCode?.conditions?.specificBrands?.includes(brandId)
          })
          set({ cart, appliedDiscounts: filteredDiscounts, isLoading: false })
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
      
      // Brand data management
      loadBrandData: async () => {
        // This would be implemented to load brand data from the service
        // For now, it's a placeholder since we're using mock data
        console.log('Brand data loading would be implemented here')
      },
      
      setBrands: (brands) => {
        set({ brands })
      },
      
      // Discount management
      applyDiscountCode: (discountValidation) => {
        const { appliedDiscounts } = get()
        
        // Check if discount already applied
        const alreadyApplied = appliedDiscounts.some(d => 
          d.discountCode?.id === discountValidation.discountCode?.id
        )
        
        if (!alreadyApplied) {
          set({ appliedDiscounts: [...appliedDiscounts, discountValidation] })
        }
      },
      
      removeDiscountCode: (discountCodeId) => {
        const { appliedDiscounts } = get()
        const filtered = appliedDiscounts.filter(d => d.discountCode?.id !== discountCodeId)
        set({ appliedDiscounts: filtered })
      },
      
      clearDiscountCodes: () => {
        set({ appliedDiscounts: [] })
      },
      
      // Enhanced computed values
      getBrandSubtotal: (brandId) => {
        const { cart } = get()
        return cart.items
          .filter(item => item.product.brandId === brandId)
          .reduce((sum, item) => {
            const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                         item.product.price?.wholesale || 
                         item.product.price?.retail ||
                         item.product.retailPrice?.item || 0
            const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                   item.product.itemsPerCarton || 1
            const pricePerCarton = pricePerItem * unitsPerCarton
            return sum + (pricePerCarton * item.quantity)
          }, 0)
      },
      
      getBrandCartSummary: (brandId) => {
        const { cart, brands, appliedDiscounts } = get()
        const brand = brands.find(b => b.id === brandId)
        
        if (!brand) return null
        
        const items = cart.items.filter(item => item.product.brandId === brandId)
        if (items.length === 0) return null
        
        const subtotal = get().getBrandSubtotal(brandId)
        const moqStatus = calculateMOQStatus(brand, items, appliedDiscounts)
        const volumeDiscount = calculateVolumeDiscount(brand, subtotal)
        const upsellMessage = generateUpsellMessage(brand, subtotal)
        
        // Filter applicable discount codes
        const brandDiscountCodes = appliedDiscounts.filter(discount => {
          if (!discount.valid || !discount.discountCode) return false
          const conditions = discount.discountCode.conditions
          if (conditions?.specificBrands?.length) {
            return conditions.specificBrands.includes(brandId)
          }
          return true // General discounts apply to all brands
        })
        
        // Apply discount codes to get total
        const discountApplication = applyDiscountCodes(items, brandDiscountCodes)
        let total = subtotal - volumeDiscount.savings - discountApplication.totalDiscount
        
        return {
          brandId,
          brandName: brand.name,
          items,
          subtotal,
          moqStatus,
          volumeDiscount,
          appliedDiscountCodes: brandDiscountCodes,
          total,
          canCheckout: moqStatus.canCheckout,
          upsellMessage: upsellMessage || undefined
        }
      },
      
      getAllBrandCartSummaries: () => {
        const { cart } = get()
        const brandIds = [...new Set(cart.items.map(item => item.product.brandId))]
        
        return brandIds
          .map(brandId => get().getBrandCartSummary(brandId))
          .filter(summary => summary !== null) as BrandCartSummary[]
      },
      
      getFilteredCartItems: (brandIds) => {
        const { cart } = get()
        if (!brandIds || brandIds.length === 0) return cart.items
        return cart.items.filter(item => brandIds.includes(item.product.brandId))
      },
      
      getTotalPrice: () => {
        const { cart } = get()
        return cart.items.reduce((sum, item) => {
          const pricePerItem = item.product.variants?.[0]?.pricing?.b2b?.wholesalePrice || 
                       item.product.variants?.[0]?.pricing?.b2c?.retailPrice || 
                       item.product.retailPrice?.item || 0
          const unitsPerCarton = item.product.variants?.[0]?.pricing?.b2b?.unitsPerCarton || 
                                 item.product.itemsPerCarton || 1
          const pricePerCarton = pricePerItem * unitsPerCarton
          return sum + (pricePerCarton * item.quantity)
        }, 0)
      },
      
      getTotalWithDiscounts: () => {
        const summaries = get().getAllBrandCartSummaries()
        return summaries.reduce((sum, summary) => sum + summary.total, 0)
      },
      
      getCheckoutEligibility: () => {
        const { cart, brands, appliedDiscounts } = get()
        return canProceedToCheckout(cart.items, brands, appliedDiscounts)
      },
      
      getUpsellMessage: (brandId) => {
        const { brands } = get()
        const brand = brands.find(b => b.id === brandId)
        if (!brand) return null
        
        const subtotal = get().getBrandSubtotal(brandId)
        return generateUpsellMessage(brand, subtotal)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        cart: state.cart,
        appliedDiscounts: state.appliedDiscounts 
      }), // Persist cart data and applied discounts
    }
  )
)