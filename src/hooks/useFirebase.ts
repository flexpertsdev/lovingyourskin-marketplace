// src/hooks/useFirebase.ts

import { useState, useEffect, useCallback } from 'react'
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore'
import { 
  collections, 
  queries,
  User,
  Product,
  Brand,
  Order,
  Message,
  Invite,
  OrderItem,
  ManualDiscount,
  calculateVolumeDiscount
} from '@/lib/firebase/collections'
import type { ContactMessage } from '@/types'
import { 
  authService as userService,
  productService,
  orderService,
  messageService
} from '@/services'

// Temporary invite service implementation
const inviteService = {
  create: async (inviteData: any) => {
    // Placeholder implementation
    return inviteData
  },
  validateCode: async (_code: string) => {
    // Placeholder implementation
    return { valid: true }
  },
  markAsUsed: async (_inviteId: string, _userId: string) => {
    // Placeholder implementation
    return true
  }
}

// Temporary brand service implementation
const brandService = {
  create: async (brandData: any) => {
    // Placeholder implementation
    return brandData
  },
  update: async (_brandId: string, _updates: any) => {
    // Placeholder implementation
    return true
  }
}

// ============================================
// GENERIC HOOKS
// ============================================

function useCollection<T>(
  queryFn: () => any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      queryFn(),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[]
        setData(items)
        setLoading(false)
      },
      (err) => {
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, dependencies)

  return { data, loading, error }
}

// ============================================
// USER HOOKS
// ============================================

export function useUsers(role?: User['role']) {
  return useCollection<User>(
    () => role ? queries.users.byRole(role) : collections.users,
    [role]
  )
}

export function useActiveUsers() {
  return useCollection<User>(() => queries.users.active())
}

export function useAllUsers() {
  return useCollection<User>(() => collections.users)
}

// ============================================
// PRODUCT HOOKS
// ============================================

export function useProducts(brandId?: string) {
  return useCollection<Product>(
    () => brandId ? queries.products.byBrand(brandId) : collections.products,
    [brandId]
  )
}

export function useActiveProducts() {
  return useCollection<Product>(() => queries.products.active())
}

export function usePresaleProducts() {
  return useCollection<Product>(() => queries.products.presale())
}

export function useProductsByCategory(category: string) {
  return useCollection<Product>(
    () => queries.products.byCategory(category),
    [category]
  )
}

// ============================================
// BRAND HOOKS
// ============================================

export function useBrands() {
  return useCollection<Brand>(() => collections.brands)
}

export function useActiveBrands() {
  return useCollection<Brand>(() => queries.brands.active())
}

// ============================================
// ORDER HOOKS
// ============================================

export function useOrders(userId?: string) {
  return useCollection<Order>(
    () => userId ? queries.orders.byUser(userId) : collections.orders,
    [userId]
  )
}

export function usePendingOrders() {
  return useCollection<Order>(() => queries.orders.pending())
}

export function useRecentOrders(limit = 10) {
  return useCollection<Order>(
    () => queries.orders.recent(limit),
    [limit]
  )
}

// ============================================
// MESSAGE HOOKS
// ============================================

export function useMessages(type?: Message['type']) {
  return useCollection<Message>(
    () => type ? queries.messages.byType(type) : collections.messages,
    [type]
  )
}

export function useUnreadMessages() {
  return useCollection<Message>(() => queries.messages.unread())
}

export function useUnreadMessageCount() {
  const { data } = useUnreadMessages()
  return data.length
}

// ============================================
// INVITE HOOKS
// ============================================

export function usePendingInvites() {
  return useCollection<Invite>(() => queries.invites.pending())
}

export function useInviteCodes() {
  return useCollection<Invite>(() => collections.invites)
}

// ============================================
// ACTION HOOKS
// ============================================

export function useFirebaseActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeAction = useCallback(async (
    action: () => Promise<any>
  ) => {
    setLoading(true)
    setError(null)
    try {
      const result = await action()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    // User actions
    createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeAction(() => userService.create({
        ...userData,
        lastLoginAt: new Date()
      } as any)),
    updateUser: (userId: string, updates: Partial<User>) =>
      executeAction(() => userService.update(userId, updates as any)),
    updateUserRole: (userId: string, role: User['role']) =>
      executeAction(() => userService.update(userId, { role } as any)),
    suspendUser: (userId: string, suspend: boolean) =>
      executeAction(() => userService.update(userId, { role: suspend ? 'retailer' : 'retailer' } as any)),
    deleteUser: (userId: string) =>
      executeAction(() => userService.delete(userId)),
    
    // Product actions
    createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeAction(() => productService.create(productData as any)),
    updateProduct: (productId: string, updates: Partial<Product>) =>
      executeAction(() => productService.update(productId, updates as any)),
    bulkUpdatePrices: (updates: { productId: string; wholesalePrice: number; retailPrice: number }[]) =>
      executeAction(() => productService.bulkUpdatePrices(updates)),
    
    // Brand actions
    createBrand: (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeAction(() => brandService.create(brandData)),
    updateBrand: (brandId: string, updates: Partial<Brand>) =>
      executeAction(() => brandService.update(brandId, updates)),
    
    // Order actions
    createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>) =>
      executeAction(() => orderService.create(orderData as any)),
    updateOrder: (orderId: string, updates: Partial<Order>) =>
      executeAction(() => orderService.update(orderId, updates as any)),
    calculateOrderTotal: (items: any[], brandId: string, manualDiscount?: any) =>
      executeAction(() => orderService.calculateOrderTotal(items, brandId, manualDiscount as any)),
    
    // Message actions
    createMessage: (messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'status' | 'priority'>) =>
      executeAction(() => messageService.create(messageData)),
    markMessageAsRead: (messageId: string) =>
      executeAction(() => messageService.markAsRead(messageId)),
    markMessageAsReplied: (messageId: string, repliedBy: string) =>
      executeAction(() => messageService.markAsReplied(messageId, repliedBy)),
    
    // Invite actions
    createInviteCode: (inviteData: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeAction(() => inviteService.create(inviteData)),
    createInvite: (inviteData: { email: string; role: User['role']; createdBy: string }) =>
      executeAction(() => inviteService.create(inviteData)),
    validateInviteCode: (code: string) =>
      executeAction(() => inviteService.validateCode(code)),
    markInviteAsUsed: (inviteId: string, userId: string) =>
      executeAction(() => inviteService.markAsUsed(inviteId, userId)),
  }
}

// ============================================
// ORDER CALCULATION HOOK
// ============================================

export function useOrderCalculation() {
  const { data: brands } = useBrands()
  
  const calculateTotal = useCallback((
    items: OrderItem[],
    brandId: string,
    manualDiscount?: ManualDiscount
  ) => {
    const brand = brands.find(b => b.id === brandId)
    if (!brand) return { subtotal: 0, discount: 0, total: 0, volumeDiscount: 0 }
    
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const volumeDiscountPercent = calculateVolumeDiscount(brand, subtotal)
    const volumeDiscount = subtotal * (volumeDiscountPercent / 100)
    
    let finalTotal = subtotal - volumeDiscount
    
    if (manualDiscount) {
      const { type, value } = manualDiscount
      switch (type) {
        case 'percentage':
          finalTotal = finalTotal * (1 - value / 100)
          break
        case 'flat':
          finalTotal = Math.max(0, finalTotal - value)
          break
        case 'override':
          finalTotal = value
          break
      }
    }
    
    return {
      subtotal,
      discount: subtotal - finalTotal,
      total: finalTotal,
      volumeDiscount: volumeDiscountPercent
    }
  }, [brands])
  
  return calculateTotal
}