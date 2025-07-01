// Mock cart service with MOQ validation and per-brand grouping
import { Cart, CartItem, Product, MOQStatus } from '../../types'

const CART_STORAGE_KEY = 'lys_shopping_cart'
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Initialize empty cart
let mockCart: Cart = {
  items: [],
  lastUpdated: new Date(),
}

// Load cart from localStorage on init
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      mockCart = {
        items: parsed.items,
        lastUpdated: new Date(parsed.lastUpdated),
      }
    }
  } catch (error) {
    console.error('Failed to load cart from storage:', error)
  }
}

// Save cart to localStorage
const saveCartToStorage = () => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mockCart))
}

// Initialize
loadCartFromStorage()

export const cartService = {
  // Get current cart
  getCart: async (): Promise<Cart> => {
    await delay(100)
    return { ...mockCart }
  },
  
  // Add item to cart
  addToCart: async (product: Product, quantity: number): Promise<Cart> => {
    await delay(200)
    
    // Check if product already in cart
    const existingIndex = mockCart.items.findIndex(item => item.product.id === product.id)
    
    if (existingIndex >= 0) {
      // Update quantity
      mockCart.items[existingIndex].quantity += quantity
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}`,
        product,
        quantity,
        addedAt: new Date(),
      }
      mockCart.items.push(newItem)
    }
    
    mockCart.lastUpdated = new Date()
    saveCartToStorage()
    
    return { ...mockCart }
  },
  
  // Update item quantity
  updateQuantity: async (itemId: string, quantity: number): Promise<Cart> => {
    await delay(150)
    
    const itemIndex = mockCart.items.findIndex(item => item.id === itemId)
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item
        mockCart.items.splice(itemIndex, 1)
      } else {
        // Update quantity
        mockCart.items[itemIndex].quantity = quantity
      }
      
      mockCart.lastUpdated = new Date()
      saveCartToStorage()
    }
    
    return { ...mockCart }
  },
  
  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<Cart> => {
    await delay(150)
    
    mockCart.items = mockCart.items.filter(item => item.id !== itemId)
    mockCart.lastUpdated = new Date()
    saveCartToStorage()
    
    return { ...mockCart }
  },
  
  // Clear entire cart
  clearCart: async (): Promise<Cart> => {
    await delay(100)
    
    mockCart = {
      items: [],
      lastUpdated: new Date(),
    }
    saveCartToStorage()
    
    return { ...mockCart }
  },
  
  // Get items grouped by brand
  getCartByBrand: async (): Promise<Map<string, CartItem[]>> => {
    await delay(100)
    
    const brandGroups = new Map<string, CartItem[]>()
    
    mockCart.items.forEach(item => {
      const brandId = item.product.brandId
      if (!brandGroups.has(brandId)) {
        brandGroups.set(brandId, [])
      }
      brandGroups.get(brandId)!.push(item)
    })
    
    return brandGroups
  },
  
  // Validate MOQ for a specific brand
  validateMOQ: async (brandId: string): Promise<MOQStatus> => {
    await delay(150)
    
    const brandItems = mockCart.items.filter(item => item.product.brandId === brandId)
    
    if (brandItems.length === 0) {
      return {
        brandId,
        brandName: '',
        status: 'error',
        met: false,
        current: 0,
        required: 0,
        percentage: 0,
        remainingItems: 0,
      }
    }
    
    // Calculate total items for this brand
    const totalItems = brandItems.reduce((sum, item) => sum + item.quantity, 0)
    
    // Get MOQ requirement (using the first product's MOQ as brand MOQ)
    const moqRequired = brandItems[0].product.moq
    const brandName = brandItems[0].product.brandId // In real app, get brand name
    
    const percentage = Math.min((totalItems / moqRequired) * 100, 100)
    const remainingItems = Math.max(moqRequired - totalItems, 0)
    
    const met = totalItems >= moqRequired
    const status = met ? 'met' : percentage >= 80 ? 'warning' : 'error'
    
    return {
      brandId,
      brandName,
      status,
      met,
      current: totalItems,
      required: moqRequired,
      percentage,
      remainingItems,
    }
  },
  
  // Validate MOQ for all brands in cart
  validateAllMOQ: async (): Promise<MOQStatus[]> => {
    await delay(200)
    
    const brandGroups = await cartService.getCartByBrand()
    const validationPromises: Promise<MOQStatus>[] = []
    
    brandGroups.forEach((_, brandId) => {
      validationPromises.push(cartService.validateMOQ(brandId))
    })
    
    return Promise.all(validationPromises)
  },
  
  // Check if checkout is allowed (all MOQs met)
  canCheckout: async (): Promise<boolean> => {
    await delay(150)
    
    const moqStatuses = await cartService.validateAllMOQ()
    return moqStatuses.every(status => status.met)
  },
  
  // Get cart summary
  getCartSummary: async (): Promise<{
    totalItems: number
    totalPrice: number
    brandCount: number
    canCheckout: boolean
  }> => {
    await delay(100)
    
    const brandGroups = await cartService.getCartByBrand()
    const canCheckout = await cartService.canCheckout()
    
    const totalItems = mockCart.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = mockCart.items.reduce((sum, item) => 
      sum + (item.product.price.item * item.quantity), 0
    )
    
    return {
      totalItems,
      totalPrice,
      brandCount: brandGroups.size,
      canCheckout,
    }
  },
  
  // Clear items for a specific brand
  clearBrandItems: async (brandId: string): Promise<Cart> => {
    await delay(150)
    
    mockCart.items = mockCart.items.filter(item => item.product.brandId !== brandId)
    mockCart.lastUpdated = new Date()
    saveCartToStorage()
    
    return { ...mockCart }
  },
}