// Mock order service with order management and messaging
import { Order, OrderStatus, OrderDocument, MessageThread, Message } from '../../types'
import { useAuthStore } from '../../stores/auth.store'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: '#12345',
    retailerId: 'user-1',
    retailerCompanyId: 'company-1',
    brandId: 'innisfree',
    brandName: 'INNISFREE',
    status: 'processing',
    items: [
      {
        productId: 'prod-1',
        productName: 'Green Tea Seed Serum',
        quantity: 9,
        pricePerItem: 12.50,
        pricePerCarton: 150,
        totalPrice: 1350
      },
      {
        productId: 'prod-2',
        productName: 'Volcanic Pore Clay Mask',
        quantity: 2,
        pricePerItem: 8.00,
        pricePerCarton: 192,
        totalPrice: 384
      }
    ],
    totalAmount: {
      items: 1734,
      shipping: 0, // To be calculated
      total: 1734,
      currency: 'GBP'
    },
    shippingAddress: {
      name: 'Beauty Store Ltd.',
      company: 'Beauty Store Ltd.',
      street: '123 High Street',
      city: 'London',
      postalCode: 'EC1A 1BB',
      country: 'United Kingdom'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: new Date('2024-01-15T10:00:00'),
        description: 'Order submitted'
      },
      {
        status: 'confirmed',
        timestamp: new Date('2024-01-15T10:30:00'),
        description: 'Order confirmed by LYS team'
      },
      {
        status: 'processing',
        timestamp: new Date('2024-01-15T14:00:00'),
        description: 'Order sent to INNISFREE for processing'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        type: 'invoice',
        name: 'Invoice #INV-12345',
        url: '/documents/invoice-12345.pdf',
        uploadedAt: new Date('2024-01-15T16:00:00')
      }
    ],
    messageThreadId: 'thread-1',
    createdAt: new Date('2024-01-15T10:00:00'),
    updatedAt: new Date('2024-01-15T16:00:00')
  },
  {
    id: 'order-2',
    orderNumber: '#12344',
    retailerId: 'user-1',
    retailerCompanyId: 'company-1',
    brandId: 'laneige',
    brandName: 'LANEIGE',
    status: 'delivered',
    items: [
      {
        productId: 'prod-3',
        productName: 'Water Bank Moisture Cream',
        quantity: 5,
        pricePerItem: 9.00,
        pricePerCarton: 180,
        totalPrice: 900
      }
    ],
    totalAmount: {
      items: 900,
      shipping: 45,
      total: 945,
      currency: 'GBP'
    },
    shippingAddress: {
      name: 'Beauty Store Ltd.',
      company: 'Beauty Store Ltd.',
      street: '123 High Street',
      city: 'London',
      postalCode: 'EC1A 1BB',
      country: 'United Kingdom'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: new Date('2024-01-10T10:00:00'),
        description: 'Order submitted'
      },
      {
        status: 'confirmed',
        timestamp: new Date('2024-01-10T11:00:00'),
        description: 'Order confirmed'
      },
      {
        status: 'processing',
        timestamp: new Date('2024-01-10T15:00:00'),
        description: 'Processing started'
      },
      {
        status: 'invoiced',
        timestamp: new Date('2024-01-11T09:00:00'),
        description: 'Invoice generated'
      },
      {
        status: 'paid',
        timestamp: new Date('2024-01-11T14:00:00'),
        description: 'Payment received'
      },
      {
        status: 'preparing',
        timestamp: new Date('2024-01-12T09:00:00'),
        description: 'Order being prepared'
      },
      {
        status: 'shipped',
        timestamp: new Date('2024-01-13T10:00:00'),
        description: 'Shipped via DHL Express'
      },
      {
        status: 'delivered',
        timestamp: new Date('2024-01-14T15:00:00'),
        description: 'Delivered successfully'
      }
    ],
    documents: [
      {
        id: 'doc-2',
        type: 'invoice',
        name: 'Invoice #INV-12344',
        url: '/documents/invoice-12344.pdf',
        uploadedAt: new Date('2024-01-11T09:00:00')
      },
      {
        id: 'doc-3',
        type: 'shipping_label',
        name: 'Shipping Label DHL-789456',
        url: '/documents/shipping-12344.pdf',
        uploadedAt: new Date('2024-01-13T10:00:00')
      }
    ],
    messageThreadId: 'thread-2',
    createdAt: new Date('2024-01-10T10:00:00'),
    updatedAt: new Date('2024-01-14T15:00:00')
  },
  {
    id: 'order-3',
    orderNumber: '#12346',
    retailerId: 'user-1',
    retailerCompanyId: 'company-1',
    brandId: 'etude',
    brandName: 'ETUDE',
    status: 'invoiced',
    items: [
      {
        productId: 'prod-4',
        productName: 'Double Lasting Foundation',
        quantity: 8,
        pricePerItem: 7.50,
        pricePerCarton: 180,
        totalPrice: 1440
      }
    ],
    totalAmount: {
      items: 1440,
      shipping: 0,
      total: 1440,
      currency: 'GBP'
    },
    shippingAddress: {
      name: 'Beauty Store Ltd.',
      company: 'Beauty Store Ltd.',
      street: '123 High Street',
      city: 'London',
      postalCode: 'EC1A 1BB',
      country: 'United Kingdom'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: new Date('2024-01-14T10:00:00'),
        description: 'Order submitted'
      },
      {
        status: 'confirmed',
        timestamp: new Date('2024-01-14T11:00:00'),
        description: 'Order confirmed'
      },
      {
        status: 'processing',
        timestamp: new Date('2024-01-14T15:00:00'),
        description: 'Processing started'
      },
      {
        status: 'invoiced',
        timestamp: new Date('2024-01-15T09:00:00'),
        description: 'Invoice generated - awaiting payment'
      }
    ],
    documents: [
      {
        id: 'doc-4',
        type: 'invoice',
        name: 'Invoice #INV-12346',
        url: '/documents/invoice-12346.pdf',
        uploadedAt: new Date('2024-01-15T09:00:00')
      }
    ],
    messageThreadId: 'thread-3',
    createdAt: new Date('2024-01-14T10:00:00'),
    updatedAt: new Date('2024-01-15T09:00:00')
  }
]

// Mock message threads
const mockThreads: Map<string, MessageThread> = new Map([
  ['thread-1', {
    id: 'thread-1',
    orderId: 'order-1',
    participants: [
      { userId: 'user-1', name: 'You', role: 'buyer' },
      { userId: 'lys-team', name: 'LYS Team', role: 'lys_team' },
      { userId: 'innisfree-rep', name: 'INNISFREE Brand Rep', role: 'brand' }
    ],
    lastMessage: {
      id: 'msg-5',
      threadId: 'thread-1',
      senderId: 'system',
      senderName: 'System',
      senderRole: 'lys_team',
      content: '📎 Invoice #INV-12345 has been generated and attached.',
      readBy: ['user-1'],
      createdAt: new Date('2024-01-15T16:00:00')
    },
    unreadCount: 0,
    createdAt: new Date('2024-01-15T10:00:00'),
    updatedAt: new Date('2024-01-15T16:00:00')
  }],
  ['thread-2', {
    id: 'thread-2',
    orderId: 'order-2',
    participants: [
      { userId: 'user-1', name: 'You', role: 'buyer' },
      { userId: 'lys-team', name: 'LYS Team', role: 'lys_team' },
      { userId: 'laneige-rep', name: 'LANEIGE Brand Rep', role: 'brand' }
    ],
    lastMessage: {
      id: 'msg-10',
      threadId: 'thread-2',
      senderId: 'system',
      senderName: 'System',
      senderRole: 'lys_team',
      content: 'Order delivered successfully!',
      readBy: ['user-1'],
      createdAt: new Date('2024-01-14T15:00:00')
    },
    unreadCount: 0,
    createdAt: new Date('2024-01-10T10:00:00'),
    updatedAt: new Date('2024-01-14T15:00:00')
  }]
])

// Mock messages
const mockMessages: Map<string, Message[]> = new Map([
  ['thread-1', [
    {
      id: 'msg-1',
      threadId: 'thread-1',
      senderId: 'system',
      senderName: 'System',
      senderRole: 'lys_team',
      content: 'Order #12345 has been confirmed. We\'re processing your order with the manufacturer.',
      readBy: ['user-1'],
      createdAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: 'msg-2',
      threadId: 'thread-1',
      senderId: 'lys-team',
      senderName: 'LYS Team',
      senderRole: 'lys_team',
      content: 'Hi! We\'ve received your order and forwarded it to INNISFREE. You should receive confirmation within 24-48 hours.',
      readBy: ['user-1'],
      createdAt: new Date('2024-01-15T10:31:00')
    },
    {
      id: 'msg-3',
      threadId: 'thread-1',
      senderId: 'user-1',
      senderName: 'You',
      senderRole: 'buyer',
      content: 'Great, thanks! Can you confirm the estimated delivery date?',
      readBy: ['lys-team', 'innisfree-rep'],
      createdAt: new Date('2024-01-15T14:30:00')
    },
    {
      id: 'msg-4',
      threadId: 'thread-1',
      senderId: 'innisfree-rep',
      senderName: 'INNISFREE Brand Rep',
      senderRole: 'brand',
      content: 'Hello! We\'ve received your order. Based on current stock, we can ship within 3 business days. Estimated delivery to your location is 7-10 days after shipment.',
      readBy: ['user-1'],
      createdAt: new Date('2024-01-15T15:30:00')
    },
    {
      id: 'msg-5',
      threadId: 'thread-1',
      senderId: 'system',
      senderName: 'System',
      senderRole: 'lys_team',
      content: '📎 Invoice #INV-12345 has been generated and attached.',
      attachments: [{
        id: 'attach-1',
        name: 'Invoice-INV-12345.pdf',
        type: 'application/pdf',
        size: 245000,
        url: '/documents/invoice-12345.pdf'
      }],
      readBy: ['user-1'],
      createdAt: new Date('2024-01-15T16:00:00')
    }
  ]]
])

export const orderService = {
  // Get all orders for current user
  getOrders: async (filters?: {
    status?: OrderStatus
    brandId?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<Order[]> => {
    await delay(300)
    
    // Get current user from auth store
    const currentUser = useAuthStore.getState().user
    if (!currentUser) return []
    
    let filtered = [...mockOrders]
    
    // Filter based on user role
    if (currentUser.role === 'retailer') {
      // Retailers only see their own orders
      filtered = filtered.filter(order => order.retailerId === currentUser.id)
    } else if (currentUser.role === 'brand') {
      // Brands only see orders for their brand
      filtered = filtered.filter(order => order.brandId === currentUser.companyId)
    }
    // Admins see all orders (no filtering needed)
    
    if (filters?.status) {
      filtered = filtered.filter(order => order.status === filters.status)
    }
    
    if (filters?.brandId) {
      filtered = filtered.filter(order => order.brandId === filters.brandId)
    }
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(order => order.createdAt >= filters.dateFrom!)
    }
    
    if (filters?.dateTo) {
      filtered = filtered.filter(order => order.createdAt <= filters.dateTo!)
    }
    
    // Sort by date, newest first
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },
  
  // Get single order by ID
  getOrder: async (orderId: string): Promise<Order | null> => {
    await delay(200)
    
    const currentUser = useAuthStore.getState().user
    if (!currentUser) return null
    
    const order = mockOrders.find(order => order.id === orderId)
    if (!order) return null
    
    // Check permissions
    if (currentUser.role === 'retailer' && order.retailerId !== currentUser.id) {
      return null // Retailer can only see their own orders
    } else if (currentUser.role === 'brand' && order.brandId !== currentUser.companyId) {
      return null // Brand can only see orders for their brand
    }
    // Admins can see all orders
    
    return order
  },
  
  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus, description: string): Promise<Order | null> => {
    await delay(300)
    
    const order = mockOrders.find(o => o.id === orderId)
    if (!order) return null
    
    order.status = status
    order.timeline.push({
      status,
      timestamp: new Date(),
      description
    })
    order.updatedAt = new Date()
    
    return order
  },
  
  // Add document to order
  addDocument: async (orderId: string, document: Omit<OrderDocument, 'id' | 'uploadedAt'>): Promise<Order | null> => {
    await delay(200)
    
    const order = mockOrders.find(o => o.id === orderId)
    if (!order) return null
    
    const newDoc: OrderDocument = {
      ...document,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date()
    }
    
    order.documents.push(newDoc)
    order.updatedAt = new Date()
    
    return order
  },
  
  // Get message thread for order
  getMessageThread: async (orderId: string): Promise<MessageThread | null> => {
    await delay(200)
    
    const order = mockOrders.find(o => o.id === orderId)
    if (!order) return null
    
    return mockThreads.get(order.messageThreadId) || null
  },
  
  // Get messages for thread
  getMessages: async (threadId: string): Promise<Message[]> => {
    await delay(200)
    return mockMessages.get(threadId) || []
  },
  
  // Send message
  sendMessage: async (threadId: string, content: string, attachments?: any[]): Promise<Message> => {
    await delay(300)
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: 'user-1',
      senderName: 'You',
      senderRole: 'buyer',
      content,
      attachments,
      readBy: ['user-1'],
      createdAt: new Date()
    }
    
    // Add to messages
    const threadMessages = mockMessages.get(threadId) || []
    threadMessages.push(newMessage)
    mockMessages.set(threadId, threadMessages)
    
    // Update thread
    const thread = mockThreads.get(threadId)
    if (thread) {
      thread.lastMessage = newMessage
      thread.updatedAt = new Date()
    }
    
    return newMessage
  },
  
  // Mark messages as read
  markMessagesAsRead: async (threadId: string, userId: string): Promise<void> => {
    await delay(100)
    
    const messages = mockMessages.get(threadId) || []
    messages.forEach(msg => {
      if (!msg.readBy.includes(userId)) {
        msg.readBy.push(userId)
      }
    })
    
    const thread = mockThreads.get(threadId)
    if (thread) {
      thread.unreadCount = 0
    }
  },
  
  // Create new order (from checkout)
  createOrder: async (orderData: {
    brandId: string
    brandName: string
    items: any[]
    shippingAddress: any
    notes?: string
  }): Promise<Order> => {
    await delay(500)
    
    const orderId = `order-${Date.now()}`
    const orderNumber = `#${12346 + mockOrders.length}`
    const threadId = `thread-${Date.now()}`
    
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      retailerId: 'user-1',
      retailerCompanyId: 'company-1',
      brandId: orderData.brandId,
      brandName: orderData.brandName,
      status: 'pending',
      items: orderData.items,
      totalAmount: {
        items: orderData.items.reduce((sum, item) => sum + item.totalPrice, 0),
        shipping: 0,
        total: orderData.items.reduce((sum, item) => sum + item.totalPrice, 0),
        currency: 'GBP'
      },
      shippingAddress: orderData.shippingAddress,
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        description: 'Order submitted'
      }],
      documents: [],
      messageThreadId: threadId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Create thread
    const newThread: MessageThread = {
      id: threadId,
      orderId,
      participants: [
        { userId: 'user-1', name: 'You', role: 'buyer' },
        { userId: 'lys-team', name: 'LYS Team', role: 'lys_team' }
      ],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    mockOrders.push(newOrder)
    mockThreads.set(threadId, newThread)
    mockMessages.set(threadId, [])
    
    return newOrder
  }
}