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
  deleteDoc,
  Timestamp,
  limit
} from 'firebase/firestore'
import { db } from '../../lib/firebase/config'

// Contact form message types
export interface ContactMessage {
  id: string
  type: 'general' | 'partnership' | 'brands' | 'support' | 'press' | 'other'
  senderName: string
  senderEmail: string
  senderCompany?: string
  senderPhone?: string
  subject: string
  content: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  priority?: 'normal' | 'urgent'
  createdAt: Date
  repliedAt?: Date
  repliedBy?: string
  replyMessage?: string
}

class FirebaseMessageService {
  // ============================================
  // CONTACT MESSAGE OPERATIONS
  // ============================================
  
  // Send a contact message (from contact form)
  async sendContactMessage(messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'status' | 'priority'>): Promise<ContactMessage> {
    try {
      const docRef = await addDoc(collection(db, 'contactMessages'), {
        ...messageData,
        status: 'unread',
        priority: 'normal',
        createdAt: Timestamp.now()
      })
      
      const newMessage = await getDoc(docRef)
      const data = newMessage.data()
      return {
        ...data,
        id: newMessage.id,
        createdAt: data?.createdAt?.toDate() || new Date()
      } as ContactMessage
    } catch (error) {
      console.error('Error sending contact message:', error)
      throw new Error('Failed to send message')
    }
  }
  
  // Get all contact messages
  async getContactMessages(filters?: {
    type?: ContactMessage['type']
    status?: ContactMessage['status']
    startDate?: Date
    endDate?: Date
  }): Promise<ContactMessage[]> {
    try {
      let messagesQuery = query(collection(db, 'contactMessages'))
      
      // Apply filters
      if (filters?.type) {
        messagesQuery = query(messagesQuery, where('type', '==', filters.type))
      }
      if (filters?.status) {
        messagesQuery = query(messagesQuery, where('status', '==', filters.status))
      }
      if (filters?.startDate) {
        messagesQuery = query(messagesQuery, where('createdAt', '>=', Timestamp.fromDate(filters.startDate)))
      }
      if (filters?.endDate) {
        messagesQuery = query(messagesQuery, where('createdAt', '<=', Timestamp.fromDate(filters.endDate)))
      }
      
      // Order by creation date (newest first)
      messagesQuery = query(messagesQuery, orderBy('createdAt', 'desc'))
      
      const messagesSnapshot = await getDocs(messagesQuery)
      return messagesSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          repliedAt: data.repliedAt?.toDate()
        }
      }) as ContactMessage[]
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      throw new Error('Failed to fetch messages')
    }
  }
  
  // Get single contact message
  async getContactMessage(messageId: string): Promise<ContactMessage | null> {
    try {
      const messageDoc = await getDoc(doc(db, 'contactMessages', messageId))
      
      if (!messageDoc.exists()) {
        return null
      }
      
      const data = messageDoc.data()
      return {
        ...data,
        id: messageDoc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        repliedAt: data.repliedAt?.toDate()
      } as ContactMessage
    } catch (error) {
      console.error('Error fetching contact message:', error)
      throw new Error('Failed to fetch message')
    }
  }
  
  // Update message status
  async updateMessageStatus(messageId: string, status: ContactMessage['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating message status:', error)
      throw new Error('Failed to update message status')
    }
  }
  
  // Update message priority
  async updateMessagePriority(messageId: string, priority: ContactMessage['priority']): Promise<void> {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        priority,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating message priority:', error)
      throw new Error('Failed to update message priority')
    }
  }
  
  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.updateMessageStatus(messageId, 'read')
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw new Error('Failed to mark message as read')
    }
  }
  
  // Reply to message
  async replyToMessage(messageId: string, replyData: {
    repliedBy: string
    replyMessage: string
  }): Promise<void> {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'replied',
        repliedAt: Timestamp.now(),
        repliedBy: replyData.repliedBy,
        replyMessage: replyData.replyMessage,
        updatedAt: Timestamp.now()
      })
      
      // TODO: Send email notification to the original sender
    } catch (error) {
      console.error('Error replying to message:', error)
      throw new Error('Failed to reply to message')
    }
  }
  
  // Archive message
  async archiveMessage(messageId: string): Promise<void> {
    try {
      await this.updateMessageStatus(messageId, 'archived')
    } catch (error) {
      console.error('Error archiving message:', error)
      throw new Error('Failed to archive message')
    }
  }
  
  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contactMessages', messageId))
    } catch (error) {
      console.error('Error deleting message:', error)
      throw new Error('Failed to delete message')
    }
  }
  
  // Get unread message count
  async getUnreadCount(): Promise<number> {
    try {
      const unreadQuery = query(
        collection(db, 'contactMessages'),
        where('status', '==', 'unread')
      )
      
      const unreadSnapshot = await getDocs(unreadQuery)
      return unreadSnapshot.size
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }
  
  // Get recent messages
  async getRecentMessages(limitCount: number = 10): Promise<ContactMessage[]> {
    try {
      const recentQuery = query(
        collection(db, 'contactMessages'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const messagesSnapshot = await getDocs(recentQuery)
      return messagesSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          repliedAt: data.repliedAt?.toDate()
        }
      }) as ContactMessage[]
    } catch (error) {
      console.error('Error fetching recent messages:', error)
      throw new Error('Failed to fetch recent messages')
    }
  }
  
  // ============================================
  // ANALYTICS & REPORTING
  // ============================================
  
  // Get message statistics
  async getMessageStats(startDate?: Date, endDate?: Date): Promise<{
    total: number
    byType: Record<ContactMessage['type'], number>
    byStatus: Record<ContactMessage['status'], number>
    responseRate: number
    averageResponseTime: number
  }> {
    try {
      let statsQuery = query(collection(db, 'contactMessages'))
      
      if (startDate) {
        statsQuery = query(statsQuery, where('createdAt', '>=', Timestamp.fromDate(startDate)))
      }
      if (endDate) {
        statsQuery = query(statsQuery, where('createdAt', '<=', Timestamp.fromDate(endDate)))
      }
      
      const messagesSnapshot = await getDocs(statsQuery)
      const messages = messagesSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          repliedAt: data.repliedAt?.toDate()
        }
      }) as ContactMessage[]
      
      // Calculate statistics
      const total = messages.length
      
      const byType = messages.reduce((acc, msg) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1
        return acc
      }, {} as Record<ContactMessage['type'], number>)
      
      const byStatus = messages.reduce((acc, msg) => {
        acc[msg.status] = (acc[msg.status] || 0) + 1
        return acc
      }, {} as Record<ContactMessage['status'], number>)
      
      const repliedMessages = messages.filter(msg => msg.status === 'replied' && msg.repliedAt)
      const responseRate = total > 0 ? (repliedMessages.length / total) * 100 : 0
      
      // Calculate average response time in hours
      let totalResponseTime = 0
      let validResponses = 0
      
      repliedMessages.forEach(msg => {
        if (msg.repliedAt) {
          const responseTime = msg.repliedAt.getTime() - msg.createdAt.getTime()
          totalResponseTime += responseTime
          validResponses++
        }
      })
      
      const averageResponseTime = validResponses > 0 
        ? (totalResponseTime / validResponses) / (1000 * 60 * 60) // Convert to hours
        : 0
      
      return {
        total,
        byType,
        byStatus,
        responseRate,
        averageResponseTime
      }
    } catch (error) {
      console.error('Error fetching message stats:', error)
      throw new Error('Failed to fetch message statistics')
    }
  }
  
  // Search messages
  async searchMessages(searchTerm: string): Promise<ContactMessage[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or Elasticsearch
      // This is a simple implementation that fetches all and filters client-side
      const allMessages = await this.getContactMessages()
      
      const searchLower = searchTerm.toLowerCase()
      return allMessages.filter(msg => {
        const searchableText = [
          msg.senderName,
          msg.senderEmail,
          msg.senderCompany || '',
          msg.subject,
          msg.content
        ].join(' ').toLowerCase()
        
        return searchableText.includes(searchLower)
      })
    } catch (error) {
      console.error('Error searching messages:', error)
      throw new Error('Failed to search messages')
    }
  }

  // Create message (alias for sendContactMessage)
  async create(messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'status' | 'priority'>): Promise<ContactMessage> {
    return this.sendContactMessage(messageData)
  }

  // Mark message as replied (simplified)
  async markAsReplied(messageId: string, repliedBy: string): Promise<void> {
    return this.replyToMessage(messageId, {
      repliedBy,
      replyMessage: 'Message has been replied to'
    })
  }

  // Get order-related messages (for compatibility)
  async getOrderMessages(orderId: string): Promise<ContactMessage[]> {
    try {
      // In the current implementation, we don't have order-specific messages
      // This is here for compatibility with the mock service
      // In a real implementation, you might filter messages by order ID
      console.warn(`getOrderMessages called for order ${orderId}, but order-specific messages are not yet implemented`)
      return []
    } catch (error) {
      console.error('Error fetching order messages:', error)
      return []
    }
  }
}

export const firebaseMessageService = new FirebaseMessageService()