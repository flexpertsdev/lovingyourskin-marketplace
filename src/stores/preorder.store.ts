import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { preorderService } from '../services'
import { PreorderCampaign, PreorderItem, Preorder } from '../types/preorder'
import { getProductPrice } from '../lib/utils/pricing'
import toast from 'react-hot-toast'

interface PreorderState {
  // Active campaign
  activeCampaign: PreorderCampaign | null
  loading: boolean
  
  // Pre-order cart (separate from regular cart)
  preorderItems: PreorderItem[]
  
  // Actions
  fetchActiveCampaign: () => Promise<void>
  addToPreorderCart: (productId: string, product: any, quantity: number) => void
  removeFromPreorderCart: (productId: string) => void
  updatePreorderQuantity: (productId: string, quantity: number) => void
  clearPreorderCart: () => void
  getTotalWithDiscount: () => number
  getItemCount: () => number
  createPreorder: (shippingAddress: any, paymentMethod: string) => Promise<Preorder | null>
}

export const usePreorderStore = create<PreorderState>()(
  devtools(
    persist(
      (set, get) => ({
      activeCampaign: null,
      loading: false,
      preorderItems: [],

      fetchActiveCampaign: async () => {
        set({ loading: true })
        try {
          const campaign = await preorderService.getActiveCampaign()
          set({ activeCampaign: campaign })
        } catch (error) {
          console.error('Failed to fetch active campaign:', error)
          set({ activeCampaign: null })
        } finally {
          set({ loading: false })
        }
      },

      addToPreorderCart: (productId: string, product: any, quantity: number) => {
        const { preorderItems, activeCampaign } = get()
        
        if (!activeCampaign) {
          // Silently fail if no campaign
          return
        }

        // Check if product is available for pre-order
        if (activeCampaign.availableProducts.length > 0 && !activeCampaign.availableProducts.includes(productId)) {
          // Silently fail if product not available
          return
        }

        // Check if product has valid pricing
        const originalPrice = getProductPrice(product)
        if (originalPrice <= 0) {
          // Silently fail if no valid price
          return
        }

        const existingItem = preorderItems.find(item => item.productId === productId)
        
        if (existingItem) {
          set({
            preorderItems: preorderItems.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          const discountedPrice = originalPrice * (1 - activeCampaign.discountPercentage / 100)
          
          const newItem: PreorderItem = {
            productId,
            product,
            quantity,
            discountPercentage: activeCampaign.discountPercentage,
            pricePerItem: originalPrice,
            discountedPrice: discountedPrice
          }
          
          set({ preorderItems: [...preorderItems, newItem] })
        }
        
        toast.success('Added to pre-order cart')
      },

      removeFromPreorderCart: (productId: string) => {
        set(state => ({
          preorderItems: state.preorderItems.filter(item => item.productId !== productId)
        }))
        toast.success('Removed from pre-order cart')
      },

      updatePreorderQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromPreorderCart(productId)
          return
        }
        
        set(state => ({
          preorderItems: state.preorderItems.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },

      clearPreorderCart: () => {
        set({ preorderItems: [] })
      },

      getTotalWithDiscount: () => {
        const { preorderItems } = get()
        return preorderItems.reduce((total, item) => {
          return total + (item.discountedPrice * item.quantity)
        }, 0)
      },

      getItemCount: () => {
        const { preorderItems } = get()
        return preorderItems.reduce((count, item) => count + item.quantity, 0)
      },

      createPreorder: async (shippingAddress: any, paymentMethod: string) => {
        const { preorderItems, activeCampaign } = get()
        
        if (!activeCampaign || preorderItems.length === 0) {
          // Silently return null if no items
          return null
        }

        try {
          const preorder = await preorderService.createPreorder({
            campaignId: activeCampaign.id,
            items: preorderItems,
            shippingAddress,
            paymentMethod,
            totalAmount: get().getTotalWithDiscount()
          })
          
          // Clear cart after successful order
          set({ preorderItems: [] })
          
          return preorder
        } catch (error) {
          console.error('Failed to create pre-order:', error)
          // Return null on error, let calling component handle it
          return null
        }
      }
      }),
      {
        name: 'preorder-storage', // localStorage key
        partialize: (state) => ({ 
          preorderItems: state.preorderItems // Only persist cart items
        })
      }
    ),
    {
      name: 'preorder-store' // devtools name
    }
  )
)