import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  Timestamp,
  limit,
  writeBatch
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'
import { Order, OrderStatus, OrderDocument, MessageThread, Message, OrderEvent, OrderItem } from '../../types'

class FirebaseOrderService {
  // ============================================
  // ORDER OPERATIONS
  // ============================================
  
  // Create a new order
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber()
      
      // Create order document
      const orderDoc = {
        ...orderData,
        orderNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        timeline: [{
          status: 'pending',
          timestamp: new Date(),
          description: 'Order created',
          userId: orderData.retailerId
        }]
      }
      
      const docRef = await addDoc(collection(db, 'orders'), orderDoc)
      
      // Create associated message thread
      await this.createOrderMessageThread(docRef.id, orderData)
      
      const newOrder = await getDoc(docRef)
      return { id: newOrder.id, ...newOrder.data() } as Order
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }
  
  // Generate unique order number
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `#${timestamp}-${random}`
  }
  
  // Get all orders with optional filters
  async getOrders(filters?: { status?: OrderStatus }): Promise<Order[]> {
    try {
      let ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      
      // Apply status filter if provided
      if (filters?.status) {
        ordersQuery = query(
          collection(db, 'orders'),
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc')
        )
      }
      
      const ordersSnapshot = await getDocs(ordersQuery)
      
      return ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[]
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw new Error('Failed to fetch orders')
    }
  }
  
  // Get orders by user
  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('retailerId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const ordersSnapshot = await getDocs(ordersQuery)
      return ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[]
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw new Error('Failed to fetch user orders')
    }
  }
  
  // Get orders by brand
  async getOrdersByBrand(brandId: string): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('brandId', '==', brandId),
        orderBy('createdAt', 'desc')
      )
      
      const ordersSnapshot = await getDocs(ordersQuery)
      return ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[]
    } catch (error) {
      console.error('Error fetching brand orders:', error)
      throw new Error('Failed to fetch brand orders')
    }
  }
  
  // Get single order
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId))
      
      if (!orderDoc.exists()) {
        return null
      }
      
      return {
        id: orderDoc.id,
        ...orderDoc.data(),
        createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: orderDoc.data().updatedAt?.toDate() || new Date()
      } as Order
    } catch (error) {
      console.error('Error fetching order:', error)
      throw new Error('Failed to fetch order')
    }
  }
  
  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus, description?: string): Promise<void> {
    try {
      const event: OrderEvent = {
        status,
        timestamp: new Date(),
        description: description || this.getStatusDescription(status)
      }
      
      const orderRef = doc(db, 'orders', orderId)
      const orderDoc = await getDoc(orderRef)
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found')
      }
      
      const currentTimeline = orderDoc.data().timeline || []
      
      await updateDoc(orderRef, {
        status,
        timeline: [...currentTimeline, event],
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }
  
  // Get status description
  private getStatusDescription(status: OrderStatus): string {
    const descriptions: Record<OrderStatus, string> = {
      pending: 'Order pending confirmation',
      confirmed: 'Order confirmed',
      processing: 'Order is being processed',
      invoiced: 'Invoice generated',
      paid: 'Payment received',
      preparing: 'Order is being prepared for shipment',
      shipped: 'Order shipped',
      delivered: 'Order delivered',
      completed: 'Order completed'
    }
    return descriptions[status] || 'Status updated'
  }
  
  // Update order
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating order:', error)
      throw new Error('Failed to update order')
    }
  }
  
  // Add document to order
  async addOrderDocument(orderId: string, document: Omit<OrderDocument, 'id' | 'uploadedAt'>): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId)
      const orderDoc = await getDoc(orderRef)
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found')
      }
      
      const currentDocuments = orderDoc.data().documents || []
      const newDocument: OrderDocument = {
        ...document,
        id: `doc-${Date.now()}`,
        uploadedAt: new Date()
      }
      
      await updateDoc(orderRef, {
        documents: [...currentDocuments, newDocument],
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error adding order document:', error)
      throw new Error('Failed to add order document')
    }
  }
  
  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'cancelled' as OrderStatus, `Order cancelled: ${reason}`)
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw new Error('Failed to cancel order')
    }
  }
  
  // ============================================
  // MESSAGE THREAD OPERATIONS
  // ============================================
  
  // Create message thread for order
  private async createOrderMessageThread(orderId: string, orderData: any): Promise<void> {
    try {
      const threadData = {
        orderId,
        participants: [
          {
            userId: orderData.retailerId,
            name: 'Retailer', // Should be fetched from user data
            role: 'buyer' as const,
          },
          {
            userId: 'lys-team',
            name: 'LYS Team',
            role: 'lys_team' as const,
          }
        ],
        unreadCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      await addDoc(collection(db, 'messageThreads'), threadData)
    } catch (error) {
      console.error('Error creating message thread:', error)
      // Don't throw - order creation should continue even if thread fails
    }
  }
  
  // Get message thread for order
  async getOrderMessageThread(orderId: string): Promise<MessageThread | null> {
    try {
      const threadQuery = query(
        collection(db, 'messageThreads'),
        where('orderId', '==', orderId),
        limit(1)
      )
      
      const threadSnapshot = await getDocs(threadQuery)
      
      if (threadSnapshot.empty) {
        return null
      }
      
      const threadDoc = threadSnapshot.docs[0]
      return {
        id: threadDoc.id,
        ...threadDoc.data(),
        createdAt: threadDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: threadDoc.data().updatedAt?.toDate() || new Date()
      } as MessageThread
    } catch (error) {
      console.error('Error fetching message thread:', error)
      throw new Error('Failed to fetch message thread')
    }
  }
  
  // Alias for getOrderMessageThread - for compatibility with UI
  async getMessageThread(orderId: string): Promise<MessageThread | null> {
    return this.getOrderMessageThread(orderId)
  }
  
  // Send message in thread
  async sendMessage(threadId: string, message: Omit<Message, 'id' | 'createdAt' | 'readBy'>): Promise<Message>
  async sendMessage(threadId: string, content: string): Promise<Message>
  async sendMessage(
    threadId: string, 
    messageOrContent: string | Omit<Message, 'id' | 'createdAt' | 'readBy'>
  ): Promise<Message> {
    try {
      let messageData: any
      
      // Handle both string content and full message object
      if (typeof messageOrContent === 'string') {
        // Simple message - assume from current user (retailer)
        messageData = {
          threadId,
          content: messageOrContent,
          senderId: 'user-1', // This should come from auth context
          senderName: 'Retailer',
          senderRole: 'buyer' as const,
          readBy: ['user-1'],
          createdAt: Timestamp.now()
        }
      } else {
        messageData = {
          ...messageOrContent,
          threadId,
          readBy: [messageOrContent.senderId],
          createdAt: Timestamp.now()
        }
      }
      
      const docRef = await addDoc(collection(db, 'messages'), messageData)
      
      // Update thread with last message
      await updateDoc(doc(db, 'messageThreads', threadId), {
        lastMessage: messageData,
        updatedAt: Timestamp.now(),
        unreadCount: 1 // Simple implementation - should track per user
      })
      
      const newMessage = await getDoc(docRef)
      return {
        id: newMessage.id,
        ...newMessage.data(),
        createdAt: newMessage.data().createdAt?.toDate() || new Date()
      } as Message
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }
  
  // Get messages for thread
  async getThreadMessages(threadId: string): Promise<Message[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('threadId', '==', threadId),
        orderBy('createdAt', 'asc')
      )
      
      const messagesSnapshot = await getDocs(messagesQuery)
      return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Message[]
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw new Error('Failed to fetch messages')
    }
  }
  
  // Alias for getThreadMessages - for compatibility with UI
  async getMessages(threadId: string): Promise<Message[]> {
    return this.getThreadMessages(threadId)
  }
  
  // Get messages for a specific order (using order ID instead of thread ID)
  async getOrderMessages(orderId: string): Promise<Message[]> {
    const thread = await this.getOrderMessageThread(orderId)
    if (!thread) {
      return []
    }
    return this.getThreadMessages(thread.id)
  }
  
  // Mark messages as read
  async markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Get unread messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('threadId', '==', threadId),
        where('readBy', 'array-contains', userId) // Inverse - not read by user
      )
      
      const messagesSnapshot = await getDocs(messagesQuery)
      
      messagesSnapshot.docs.forEach(doc => {
        const readBy = doc.data().readBy || []
        if (!readBy.includes(userId)) {
          batch.update(doc.ref, {
            readBy: [...readBy, userId]
          })
        }
      })
      
      // Update thread unread count
      batch.update(doc(db, 'messageThreads', threadId), {
        unreadCount: 0,
        updatedAt: Timestamp.now()
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw new Error('Failed to mark messages as read')
    }
  }
  
  // ============================================
  // ANALYTICS & REPORTING
  // ============================================
  
  // Get order statistics by date range
  async getOrderStats(startDate: Date, endDate: Date): Promise<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    ordersByStatus: Record<OrderStatus, number>
  }> {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      )
      
      const ordersSnapshot = await getDocs(ordersQuery)
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order)
      
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount.total, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<OrderStatus, number>)
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus
      }
    } catch (error) {
      console.error('Error fetching order stats:', error)
      throw new Error('Failed to fetch order statistics')
    }
  }

  // Create a new order (simplified alias)
  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    return this.createOrder(orderData)
  }

  // Update an order (simplified alias)
  async update(orderId: string, updates: Partial<Order>): Promise<void> {
    if (updates.status) {
      return this.updateOrderStatus(orderId, updates.status, 'Status updated')
    } else {
      return this.updateOrder(orderId, updates)
    }
  }

  // Calculate order total
  async calculateOrderTotal(
    items: OrderItem[], 
    _brandId: string, 
    manualDiscount?: ManualDiscount
  ): Promise<{
    subtotal: number
    shipping: number
    total: number
    currency: 'GBP' | 'EUR' | 'CHF'
  }> {
    try {
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
      
      // Apply manual discount if provided
      let total = subtotal
      if (manualDiscount) {
        switch (manualDiscount.type) {
          case 'percentage':
            total = subtotal * (1 - manualDiscount.value / 100)
            break
          case 'fixed':
            total = Math.max(0, subtotal - manualDiscount.value)
            break
          case 'free_shipping':
            // Just mark as free shipping, don't affect total here
            break
        }
      }
      
      return {
        subtotal,
        shipping: 0, // Calculate based on brand/location
        total,
        currency: 'GBP'
      }
    } catch (error) {
      console.error('Error calculating order total:', error)
      throw new Error('Failed to calculate order total')
    }
  }
}

// Define the ManualDiscount interface locally
interface ManualDiscount {
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
}

export const firebaseOrderService = new FirebaseOrderService()