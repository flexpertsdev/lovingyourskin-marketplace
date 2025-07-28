// src/services/firebase/index.ts

// Export all Firebase services
export { firebaseAuthService } from './auth.service'
export { firebaseProductService } from './product.service'
export { firebaseOrderService } from './order.service'
export { firebaseCartService } from './cart.service'
export { firebaseDashboardService } from './dashboard.service'
export { firebaseMessageService } from './message.service'

// Legacy exports for backward compatibility (can be removed after migration)
import { 
  getDocs, 
  addDoc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { 
  collections, 
  queries, 
  docRefs,
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

// ============================================
// USER SERVICES
// ============================================

export const userService = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const docRef = await addDoc(collections.users, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as any)
    
    const doc = await getDoc(docRef)
    const data = doc.data()
    return { ...data, id: doc.id } as User
  },

  async update(userId: string, updates: Partial<User>): Promise<void> {
    await updateDoc(docRefs.user(userId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async getByEmail(email: string): Promise<User | null> {
    const snapshot = await getDocs(queries.users.byEmail(email))
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    return { ...data, id: doc.id } as User
  },

  async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(docRefs.user(userId), {
      lastLogin: serverTimestamp()
    })
  }
}

// ============================================
// PRODUCT SERVICES
// ============================================

export const productService = {
  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const docRef = await addDoc(collections.products, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as any)
    
    const doc = await getDoc(docRef)
    const data = doc.data()
    return { ...data, id: doc.id } as Product
  },

  async update(productId: string, updates: Partial<Product>): Promise<void> {
    await updateDoc(docRefs.product(productId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async getByBrand(brandId: string): Promise<Product[]> {
    const snapshot = await getDocs(queries.products.byBrand(brandId))
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Product
    })
  },

  async getActive(): Promise<Product[]> {
    const snapshot = await getDocs(queries.products.active())
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Product
    })
  },

  async getPresale(): Promise<Product[]> {
    const snapshot = await getDocs(queries.products.presale())
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Product
    })
  },

  async bulkUpdatePrices(updates: { productId: string; wholesalePrice: number; retailPrice: number }[]): Promise<void> {
    const promises = updates.map(({ productId, wholesalePrice, retailPrice }) =>
      updateDoc(docRefs.product(productId), {
        wholesalePrice,
        retailPrice,
        updatedAt: serverTimestamp()
      })
    )
    await Promise.all(promises)
  }
}

// ============================================
// BRAND SERVICES
// ============================================

export const brandService = {
  async create(brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> {
    const docRef = await addDoc(collections.brands, {
      ...brandData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as any)
    
    const doc = await getDoc(docRef)
    const data = doc.data()
    return { ...data, id: doc.id } as Brand
  },

  async update(brandId: string, updates: Partial<Brand>): Promise<void> {
    await updateDoc(docRefs.brand(brandId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async getAll(): Promise<Brand[]> {
    const snapshot = await getDocs(collections.brands)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Brand
    })
  },

  async getActive(): Promise<Brand[]> {
    const snapshot = await getDocs(queries.brands.active())
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Brand
    })
  }
}

// ============================================
// ORDER SERVICES
// ============================================

export const orderService = {
  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const docRef = await addDoc(collections.orders, {
      ...orderData,
      orderNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as any)
    
    const doc = await getDoc(docRef)
    const data = doc.data()
    return { ...data, id: doc.id } as Order
  },

  async update(orderId: string, updates: Partial<Order>): Promise<void> {
    await updateDoc(docRefs.order(orderId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async getByUser(userId: string): Promise<Order[]> {
    const snapshot = await getDocs(queries.orders.byUser(userId))
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Order
    })
  },

  async getPending(): Promise<Order[]> {
    const snapshot = await getDocs(queries.orders.pending())
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Order
    })
  },

  async calculateOrderTotal(
    items: OrderItem[], 
    brandId: string, 
    manualDiscount?: ManualDiscount
  ): Promise<{ subtotal: number; discount: number; total: number; volumeDiscount: number }> {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    
    // Get brand for volume discount
    const brandDoc = await getDoc(docRefs.brand(brandId))
    const brandData = brandDoc.data()
    const brand = { ...brandData, id: brandDoc.id } as Brand
    
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
  }
}

// ============================================
// MESSAGE SERVICES
// ============================================

export const messageService = {
  async create(messageData: Omit<Message, 'id' | 'createdAt' | 'status'>): Promise<Message> {
    // Determine type based on email
    let type: Message['type'] = 'general'
    if (messageData.email) {
      if (messageData.subject?.toLowerCase().includes('partnership')) {
        type = 'partnership'
      } else if (messageData.subject?.toLowerCase().includes('order') || 
                 messageData.subject?.toLowerCase().includes('sales')) {
        type = 'sales'
      }
    }

    const docRef = await addDoc(collections.messages, {
      ...messageData,
      type,
      status: 'new',
      createdAt: serverTimestamp()
    } as any)
    
    const doc = await getDoc(docRef)
    const data = doc.data()
    return { ...data, id: doc.id } as Message
  },

  async markAsRead(messageId: string): Promise<void> {
    await updateDoc(docRefs.message(messageId), {
      status: 'read'
    })
  },

  async markAsReplied(messageId: string, repliedBy: string): Promise<void> {
    await updateDoc(docRefs.message(messageId), {
      status: 'replied',
      repliedAt: serverTimestamp(),
      repliedBy
    })
  },

  async getUnread(): Promise<Message[]> {
    const snapshot = await getDocs(queries.messages.unread())
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Message
    })
  },

  async getByType(type: Message['type']): Promise<Message[]> {
    const snapshot = await getDocs(queries.messages.byType(type))
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { ...data, id: doc.id } as Message
    })
  }
}

// ============================================
// INVITE SERVICES
// ============================================

export const inviteService = {
  async create(inviteData: {
    email: string;
    role: User['role'];
    createdBy: string;
  }): Promise<Invite> {
    // Generate unique invite code
    const code = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    const docRef = await addDoc(collections.invites, {
      ...inviteData,
      code,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt)
    } as any)
    
    const doc = await getDoc(docRef)
    const data = doc.data()
    return { ...data, id: doc.id } as Invite
  },

  async validateCode(code: string): Promise<Invite | null> {
    const snapshot = await getDocs(queries.invites.byCode(code))
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    const invite = { ...data, id: doc.id } as Invite
    
    // Check if expired
    if (invite.expiresAt.toDate() < new Date() || invite.status !== 'pending') {
      return null
    }
    
    return invite
  },

  async markAsUsed(inviteId: string, userId: string): Promise<void> {
    await updateDoc(docRefs.invite(inviteId), {
      status: 'used',
      usedAt: serverTimestamp(),
      usedBy: userId
    })
  },

  async getPendingByEmail(email: string): Promise<Invite[]> {
    const snapshot = await getDocs(queries.invites.byEmail(email))
    return snapshot.docs
      .map(doc => {
        const data = doc.data()
        return { ...data, id: doc.id } as Invite
      })
      .filter(invite => 
        invite.status === 'pending' && 
        invite.expiresAt.toDate() > new Date()
      )
  }
}

// ============================================
// INITIALIZATION SERVICE
// ============================================

export const initializeFirebaseData = {
  async createDefaultBrands(): Promise<void> {
    const defaultBrands: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'The Cell Lab',
        logo: '/brands/the-cell-lab-logo.png',
        description: 'Premium K-beauty skincare with advanced cell technology',
        country: 'South Korea',
        certifications: ['CPNP'],
        moqDefault: 1,
        volumeDiscounts: [
          { threshold: 3000, discount: 5 },
          { threshold: 5000, discount: 8 },
          { threshold: 10000, discount: 10 },
          { threshold: 20000, discount: 12 },
          { threshold: 50000, discount: 15 }
        ],
        status: 'active'
      },
      {
        name: 'Wismin',
        logo: '/brands/wismin-logo.png',
        description: 'Innovative cotton-based skincare solutions',
        country: 'South Korea',
        certifications: ['CPNP'],
        moqDefault: 100,
        volumeDiscounts: [
          { threshold: 3000, discount: 5 },
          { threshold: 5000, discount: 8 },
          { threshold: 10000, discount: 10 },
          { threshold: 20000, discount: 12 },
          { threshold: 50000, discount: 15 }
        ],
        status: 'active'
      },
      {
        name: 'Baohlab',
        logo: '/brands/baohlab-logo.png',
        description: 'Natural Korean skincare innovation',
        country: 'South Korea',
        certifications: ['CPNP'],
        moqDefault: 100,
        volumeDiscounts: [],
        status: 'active'
      },
      {
        name: 'Lalucell',
        logo: '/brands/lalucell-logo.png',
        description: 'Advanced cellular beauty solutions',
        country: 'South Korea',
        certifications: ['CPNP'],
        moqDefault: 50,
        volumeDiscounts: [],
        status: 'active'
      },
      {
        name: 'Sunnicorn',
        logo: '/brands/sunnicorn-logo.png',
        description: 'Sun protection and skincare excellence',
        country: 'South Korea',
        certifications: ['CPNP'],
        moqDefault: 50,
        volumeDiscounts: [],
        status: 'active'
      }
    ]

    for (const brand of defaultBrands) {
      await brandService.create(brand)
    }
  }
}