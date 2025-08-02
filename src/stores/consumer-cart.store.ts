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
  addItem: (product: Product, quantity?: number) => void
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

// Calculate estimated shipping based on order value
const calculateShipping = (subtotal: number): number => {
  if (subtotal >= 50) return 0 // Free shipping over £50
  if (subtotal >= 30) return 4.99
  return 6.99
}

// Calculate estimated tax (20% VAT)
const calculateTax = (subtotal: number): number => {
  return subtotal * 0.20
}

export const useConsumerCartStore = create<ConsumerCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: new Date(),
      
      addItem: (product: Product, quantity = 1) => {
        if (!product.retailPrice) {
          toast.error('This product is not available for retail purchase')
          return
        }
        
        // Check stock availability
        if (product.retailQuantity !== undefined && product.retailQuantity < quantity) {
          toast.error(`Only ${product.retailQuantity} units available`)
          return
        }
        
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            // Update quantity if item already exists
            const newQuantity = existingItem.quantity + quantity
            
            // Check stock limit
            if (product.retailQuantity !== undefined && newQuantity > product.retailQuantity) {
              toast.error(`Cannot add more. Only ${product.retailQuantity} units available`)
              return state
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
              preOrderDiscount: product.preOrderEnabled ? product.preOrderDiscount : undefined,
              addedAt: new Date()
            }
            
            toast.success(`${product.name.en} added to cart`)
            
            return {
              items: [...state.items, newItem],
              lastUpdated: new Date()
            }
          }
        })
      },
      
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }
        
        set((state) => {
          const item = state.items.find(i => i.id === itemId)
          if (!item) return state
          
          // Check stock limit
          if (item.product.retailQuantity !== undefined && quantity > item.product.retailQuantity) {
            toast.error(`Only ${item.product.retailQuantity} units available`)
            return state
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
            toast.success(`${item.product.name.en} removed from cart`)
          }
          
          return {
            items: state.items.filter(item => item.id !== itemId),
            lastUpdated: new Date()
          }
        })
      },
      
      clearCart: () => {
        set({
          items: [],
          lastUpdated: new Date(),
          affiliateCode: undefined,
          affiliateDiscount: undefined
        })
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
        return calculateTax(subtotal - preOrderDiscount - affiliateDiscount)
      },
      
      getTotalAmount: () => {
        const subtotal = get().getSubtotal()
        const shipping = get().getEstimatedShipping()
        const tax = get().getEstimatedTax()
        const preOrderDiscount = get().getPreOrderDiscount()
        const affiliateDiscount = get().getAffiliateDiscount()
        return subtotal + shipping + tax - preOrderDiscount - affiliateDiscount
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
        return items.some(item => item.product.preOrderEnabled)
      },
      
      getCheckoutData: () => {
        const state = get()
        const subtotal = state.getSubtotal()
        const shipping = state.getEstimatedShipping()
        const tax = state.getEstimatedTax()
        const discount = state.getPreOrderDiscount()
        const affiliateDiscount = state.getAffiliateDiscount()
        const total = state.getTotalAmount()
        const isPreOrder = state.isPreOrderCart()
        
        return {
          items: state.items,
          summary: {
            subtotal,
            shipping,
            tax,
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
        lastUpdated: state.lastUpdated
      })
    }
  )
)