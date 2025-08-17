import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConsumerCartItem, Product } from '../types'
import toast from 'react-hot-toast'

interface ConsumerCartStore {
  items: ConsumerCartItem[]
  lastUpdated: Date
  affiliateCode?: string
  affiliateDiscount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
  
  // Actions
  addItem: (productOrData: Product | {
    productId: string
    productName: string
    variantId: string
    price: number
    quantity: number
    image: string
    brandId: string
  }, quantity?: number) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  setAffiliateCode: (code?: string, discount?: { type: 'percentage' | 'fixed', value: number }) => void
  
  // Getters
  getTotalItems: () => number
  getSubtotal: () => number
  getEstimatedShipping: () => number
  getEstimatedTax: () => number
  getTotalAmount: () => number
  getPreOrderDiscount: () => number
  getAffiliateDiscount: () => number
  isPreOrderCart: () => boolean
  getCheckoutData: () => {
    items: ConsumerCartItem[]
    summary: {
      subtotal: number
      shipping: number
      tax: number
      discount: number
      affiliateDiscount: number
      total: number
      isPreOrder: boolean
      affiliateCode?: string
    }
  }
}

// Shipping is always free for consumers
const calculateShipping = (_subtotal: number): number => {
  return 0 // Free shipping for all consumer orders
}

// VAT is included in prices (UK/EU standard)
// This calculates the VAT portion that's already included in the price
const calculateIncludedTax = (subtotal: number): number => {
  // VAT is 20% of the pre-tax amount
  // If price is £120 (inc VAT), then VAT portion is £20 (£100 + £20 VAT = £120)
  // Formula: VAT = Price - (Price / 1.2)
  return subtotal - (subtotal / 1.2)
}

export const useConsumerCartStore = create<ConsumerCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: new Date(),
      
      addItem: (productOrData, quantity = 1) => {
        // Handle both Product object and individual fields
        if ('variantId' in productOrData) {
          // New format with individual fields
          const data = productOrData
          
          set((state) => {
            const existingItem = state.items.find(item => 
              item.product.id === data.productId && 
              (item as any).variantId === data.variantId
            )
            
            if (existingItem) {
              // Update quantity if item already exists
              const newQuantity = existingItem.quantity + data.quantity
              
              return {
                items: state.items.map(item =>
                  item.id === existingItem.id
                    ? { ...item, quantity: newQuantity }
                    : item
                ),
                lastUpdated: new Date()
              }
            } else {
              // Create a minimal product object for the cart item
              const product: any = {
                id: data.productId,
                name: data.productName,
                brandId: data.brandId,
                images: { primary: data.image },
                retailPrice: { item: data.price }
              }
              
              // Add new item
              const newItem: ConsumerCartItem = {
                id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                product,
                quantity: data.quantity,
                addedAt: new Date()
              }
              
              // Store variant info on the item
              ;(newItem as any).variantId = data.variantId
              ;(newItem as any).price = data.price
              
              return {
                items: [...state.items, newItem],
                lastUpdated: new Date()
              }
            }
          })
        } else {
          // Old format with Product object
          const product = productOrData as Product
          
          if (!product.retailPrice) {
            // Silently fail if product not available for retail
            return
          }
          
          // Check stock availability
          const b2cStock = product.variants?.[0]?.inventory?.b2c?.available || 0
        if (b2cStock > 0 && b2cStock < quantity) {
          // Adjust quantity to available stock instead of showing error
          quantity = b2cStock
          }
          
          set((state) => {
            const existingItem = state.items.find(item => item.product.id === product.id)
            
            if (existingItem) {
              // Update quantity if item already exists
              let newQuantity = existingItem.quantity + quantity
              
              // Check stock limit - using B2C inventory from variants
              const b2cStock = product.variants?.[0]?.inventory?.b2c?.available || 0
              if (b2cStock > 0 && newQuantity > b2cStock) {
                // Cap at available stock instead of showing error
                newQuantity = b2cStock
              }
              
              return {
                items: state.items.map(item =>
                  item.id === existingItem.id
                    ? { ...item, quantity: newQuantity }
                    : item
                ),
                lastUpdated: new Date()
              }
            } else {
              // Add new item
              const newItem: ConsumerCartItem = {
                id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                product,
                quantity,
                preOrderDiscount: product.isPreorder ? product.preorderDiscount : undefined,
                addedAt: new Date()
              }
              
              // Note: Toast is shown by the calling component, not here
              // to avoid duplicate toasts
              
              return {
                items: [...state.items, newItem],
                lastUpdated: new Date()
              }
            }
          })
        }
      },
      
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }
        
        set((state) => {
          const item = state.items.find(i => i.id === itemId)
          if (!item) return state
          
          // Check stock limit - using B2C inventory from variants if available
          // If variants don't exist (simplified cart items), allow reasonable quantity
          const b2cStock = item.product.variants?.[0]?.inventory?.b2c?.available || 99
          if (quantity > b2cStock) {
            // Cap at available stock instead of showing error
            quantity = b2cStock
          }
          
          return {
            items: state.items.map(i =>
              i.id === itemId ? { ...i, quantity } : i
            ),
            lastUpdated: new Date()
          }
        })
      },
      
      removeItem: (itemId: string) => {
        set((state) => {
          const item = state.items.find(i => i.id === itemId)
          if (item) {
            const productName = item.product.name || 'Product'
            toast.success(`${productName} removed from cart`)
          }
          
          return {
            items: state.items.filter(item => item.id !== itemId),
            lastUpdated: new Date()
          }
        })
      },
      
      clearCart: () => {
        set((state) => ({
          items: [],
          lastUpdated: new Date(),
          // Keep affiliate code when clearing cart
          affiliateCode: state.affiliateCode,
          affiliateDiscount: state.affiliateDiscount
        }))
        toast.success('Cart cleared')
      },
      
      setAffiliateCode: (code?: string, discount?: { type: 'percentage' | 'fixed', value: number }) => {
        set({
          affiliateCode: code,
          affiliateDiscount: discount
        })
      },
      
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          // Get price from either retailPrice or unified price structure
          const price = item.product.retailPrice?.item || 
                       item.product.price?.retail || 
                       item.product.price?.wholesale || 
                       0
          return total + (price * item.quantity)
        }, 0)
      },
      
      getEstimatedShipping: () => {
        const subtotal = get().getSubtotal()
        return calculateShipping(subtotal)
      },
      
      getEstimatedTax: () => {
        const subtotal = get().getSubtotal()
        const preOrderDiscount = get().getPreOrderDiscount()
        const affiliateDiscount = get().getAffiliateDiscount()
        // VAT is included in prices, so we calculate the VAT portion
        return calculateIncludedTax(subtotal - preOrderDiscount - affiliateDiscount)
      },
      
      getTotalAmount: () => {
        const subtotal = get().getSubtotal()
        const shipping = get().getEstimatedShipping() // Always 0 for consumers
        const preOrderDiscount = get().getPreOrderDiscount()
        const affiliateDiscount = get().getAffiliateDiscount()
        // Tax is already included in subtotal, so don't add it again
        return subtotal + shipping - preOrderDiscount - affiliateDiscount
      },
      
      getPreOrderDiscount: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          if (item.preOrderDiscount) {
            const price = item.product.retailPrice?.item || 
                         item.product.price?.retail || 
                         item.product.price?.wholesale || 
                         0
            const discountAmount = (price * item.quantity * item.preOrderDiscount) / 100
            return total + discountAmount
          }
          return total
        }, 0)
      },
      
      getAffiliateDiscount: () => {
        const state = get()
        if (!state.affiliateDiscount) return 0
        
        const subtotal = state.getSubtotal()
        const { type, value } = state.affiliateDiscount
        
        if (type === 'percentage') {
          return (subtotal * value) / 100
        } else {
          // Fixed discount, but not more than subtotal
          return Math.min(value, subtotal)
        }
      },
      
      isPreOrderCart: () => {
        const { items } = get()
        return items.some(item => item.product.isPreorder)
      },
      
      getCheckoutData: () => {
        const state = get()
        const subtotal = state.getSubtotal()
        const shipping = state.getEstimatedShipping() // Always 0 for consumers
        const tax = state.getEstimatedTax() // VAT portion already included in subtotal
        const discount = state.getPreOrderDiscount()
        const affiliateDiscount = state.getAffiliateDiscount()
        const total = state.getTotalAmount()
        const isPreOrder = state.isPreOrderCart()
        
        return {
          items: state.items,
          summary: {
            subtotal,
            shipping,
            tax, // This is the VAT portion that's included in subtotal
            discount,
            affiliateDiscount,
            total,
            isPreOrder,
            affiliateCode: state.affiliateCode
          }
        }
      }
    }),
    {
      name: 'consumer-cart-storage',
      partialize: (state) => ({
        items: state.items,
        lastUpdated: state.lastUpdated,
        affiliateCode: state.affiliateCode,
        affiliateDiscount: state.affiliateDiscount
      })
    }
  )
)