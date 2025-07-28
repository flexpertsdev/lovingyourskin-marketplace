import { 
  doc, 
  getDoc, 
  setDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { Cart, CartItem } from '../../types'
import type { Product } from '../../types'

// Cart service with local storage and optional Firebase sync
// Firebase sync is optional to allow anonymous shopping
class FirebaseCartService {
  private readonly CART_STORAGE_KEY = 'lys-cart'
  
  // ============================================
  // LOCAL STORAGE OPERATIONS
  // ============================================
  
  // Get cart from local storage
  private getLocalCart(): Cart {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY)
      if (stored) {
        const cart = JSON.parse(stored) as Cart
        // Convert date strings back to Date objects
        cart.lastUpdated = new Date(cart.lastUpdated)
        cart.items.forEach(item => {
          item.addedAt = new Date(item.addedAt)
        })
        return cart
      }
    } catch (error) {
      console.error('Error reading local cart:', error)
    }
    
    return {
      items: [],
      lastUpdated: new Date()
    }
  }
  
  // Save cart to local storage
  private saveLocalCart(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving local cart:', error)
    }
  }
  
  // ============================================
  // FIREBASE SYNC OPERATIONS (OPTIONAL)
  // ============================================
  
  // Sync cart to Firebase (for logged-in users)
  async syncCartToFirebase(userId: string): Promise<void> {
    try {
      const localCart = this.getLocalCart()
      
      if (localCart.items.length === 0) {
        // Delete Firebase cart if local cart is empty
        await deleteDoc(doc(db, 'carts', userId))
      } else {
        // Save cart to Firebase
        await setDoc(doc(db, 'carts', userId), {
          ...localCart,
          userId,
          lastUpdated: Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Error syncing cart to Firebase:', error)
      // Don't throw - cart should work even if sync fails
    }
  }
  
  // Load cart from Firebase (when user logs in)
  async loadCartFromFirebase(userId: string): Promise<Cart> {
    try {
      const cartDoc = await getDoc(doc(db, 'carts', userId))
      
      if (cartDoc.exists()) {
        const firebaseCart = cartDoc.data() as Cart
        
        // Convert Firestore timestamps
        firebaseCart.lastUpdated = firebaseCart.lastUpdated instanceof Timestamp 
          ? firebaseCart.lastUpdated.toDate() 
          : new Date(firebaseCart.lastUpdated)
          
        firebaseCart.items.forEach(item => {
          item.addedAt = item.addedAt instanceof Timestamp 
            ? item.addedAt.toDate() 
            : new Date(item.addedAt)
        })
        
        // Merge with local cart (local takes precedence)
        const localCart = this.getLocalCart()
        if (localCart.items.length > 0) {
          // Merge carts, avoiding duplicates
          const mergedCart = this.mergeCarts(localCart, firebaseCart)
          this.saveLocalCart(mergedCart)
          await this.syncCartToFirebase(userId)
          return mergedCart
        }
        
        // Use Firebase cart
        this.saveLocalCart(firebaseCart)
        return firebaseCart
      }
    } catch (error) {
      console.error('Error loading cart from Firebase:', error)
    }
    
    // Return local cart if Firebase fails
    return this.getLocalCart()
  }
  
  // Merge two carts (used when user logs in)
  private mergeCarts(cart1: Cart, cart2: Cart): Cart {
    const mergedItems = [...cart1.items]
    
    // Add items from cart2 that aren't in cart1
    cart2.items.forEach(item2 => {
      const existingIndex = mergedItems.findIndex(
        item1 => item1.product.id === item2.product.id
      )
      
      if (existingIndex === -1) {
        mergedItems.push(item2)
      } else {
        // Update quantity to the maximum
        mergedItems[existingIndex].quantity = Math.max(
          mergedItems[existingIndex].quantity,
          item2.quantity
        )
      }
    })
    
    return {
      items: mergedItems,
      lastUpdated: new Date()
    }
  }
  
  // ============================================
  // PUBLIC CART OPERATIONS
  // ============================================
  
  // Get current cart
  async getCart(userId?: string): Promise<Cart> {
    if (userId) {
      // Try to load from Firebase for logged-in users
      return await this.loadCartFromFirebase(userId)
    }
    
    // Return local cart for anonymous users
    return this.getLocalCart()
  }
  
  // Add item to cart
  async addToCart(product: Product, quantity: number, userId?: string): Promise<Cart> {
    const cart = this.getLocalCart()
    
    // Check if product already in cart
    const existingIndex = cart.items.findIndex(
      item => item.product.id === product.id
    )
    
    if (existingIndex >= 0) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}`,
        product,
        quantity,
        addedAt: new Date()
      }
      cart.items.push(newItem)
    }
    
    cart.lastUpdated = new Date()
    
    // Save to local storage
    this.saveLocalCart(cart)
    
    // Sync to Firebase if user is logged in
    if (userId) {
      await this.syncCartToFirebase(userId)
    }
    
    return cart
  }
  
  // Update item quantity
  async updateQuantity(productId: string, quantity: number, userId?: string): Promise<Cart> {
    const cart = this.getLocalCart()
    
    const itemIndex = cart.items.findIndex(
      item => item.product.id === productId
    )
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1)
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity
      }
      
      cart.lastUpdated = new Date()
      
      // Save to local storage
      this.saveLocalCart(cart)
      
      // Sync to Firebase if user is logged in
      if (userId) {
        await this.syncCartToFirebase(userId)
      }
    }
    
    return cart
  }
  
  // Remove item from cart
  async removeFromCart(productId: string, userId?: string): Promise<Cart> {
    return await this.updateQuantity(productId, 0, userId)
  }
  
  // Clear entire cart
  async clearCart(userId?: string): Promise<Cart> {
    const emptyCart: Cart = {
      items: [],
      lastUpdated: new Date()
    }
    
    // Clear local storage
    this.saveLocalCart(emptyCart)
    
    // Clear Firebase cart if user is logged in
    if (userId) {
      try {
        await deleteDoc(doc(db, 'carts', userId))
      } catch (error) {
        console.error('Error clearing Firebase cart:', error)
      }
    }
    
    return emptyCart
  }
  
  // Get cart item count
  async getItemCount(userId?: string): Promise<number> {
    const cart = await this.getCart(userId)
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }
  
  // Get cart total
  async getCartTotal(userId?: string): Promise<{
    subtotal: number
    itemCount: number
    currency: string
  }> {
    const cart = await this.getCart(userId)
    
    const subtotal = cart.items.reduce((total, item) => {
      // Handle both old and new price structures
      const price = item.product.price?.item || item.product.retailPrice?.item || 0
      return total + (price * item.quantity)
    }, 0)
    
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)
    
    return {
      subtotal,
      itemCount,
      currency: 'GBP' // Default currency
    }
  }
  
  // Validate cart items (check stock, prices, etc.)
  async validateCart(userId?: string): Promise<{
    valid: boolean
    errors: string[]
    updatedCart?: Cart
  }> {
    const cart = await this.getCart(userId)
    const errors: string[] = []
    let hasChanges = false
    
    // Validate each item
    for (const item of cart.items) {
      // Check if product is still active
      if (!item.product.active) {
        errors.push(`${item.product.name.en} is no longer available`)
        hasChanges = true
      }
      
      // Check stock level
      if (item.product.stockLevel === 'out') {
        errors.push(`${item.product.name.en} is out of stock`)
        hasChanges = true
      }
      
      // Check if quantity meets MOQ
      if (item.quantity < item.product.moq) {
        errors.push(
          `${item.product.name.en} requires minimum order of ${item.product.moq} ${item.product.moqUnit}`
        )
      }
    }
    
    // Remove invalid items if needed
    if (hasChanges) {
      cart.items = cart.items.filter(item => 
        item.product.active && item.product.stockLevel !== 'out'
      )
      cart.lastUpdated = new Date()
      
      this.saveLocalCart(cart)
      if (userId) {
        await this.syncCartToFirebase(userId)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      updatedCart: hasChanges ? cart : undefined
    }
  }
}

export const firebaseCartService = new FirebaseCartService()