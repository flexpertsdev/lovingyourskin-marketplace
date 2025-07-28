import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase/config'
import { Order, Invoice } from '../../types'
import { generateInvoicePDF } from '../../utils/invoice-pdf'

export class InvoiceService {
  private collectionName = 'invoices'
  private invoiceCounters = 'invoiceCounters'

  /**
   * Generate invoice for an order
   */
  async generateInvoice(order: Order, autoSend = false): Promise<Invoice> {
    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(order.userType)
      
      // Calculate totals
      const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const taxRate = 0.20 // 20% VAT
      const tax = subtotal * taxRate
      const total = subtotal + tax + order.totalAmount.shipping - (order.totalAmount.discount || 0)

      // Create invoice object
      const invoice: Invoice = {
        id: doc(collection(db, this.collectionName)).id,
        orderId: order.id,
        invoiceNumber,
        type: order.userType === 'consumer' ? 'b2c' : 'b2b',
        status: order.userType === 'consumer' ? 'paid' : 'draft',
        customerInfo: {
          name: order.shippingAddress.name,
          email: '', // Will be populated from user data
          company: order.shippingAddress.company,
          address: order.shippingAddress
        },
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.pricePerItem,
          totalPrice: item.totalPrice
        })),
        subtotal,
        tax,
        taxRate,
        shipping: order.totalAmount.shipping,
        discount: order.totalAmount.discount ? {
          amount: order.totalAmount.discount,
          description: 'Pre-order discount'
        } : undefined,
        total,
        currency: order.totalAmount.currency,
        paymentTerms: order.userType === 'retailer' ? 30 : undefined,
        createdAt: new Date(),
        ...(order.userType === 'retailer' && {
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        })
      }

      // Generate PDF
      const pdfBlob = await generateInvoicePDF(invoice)
      const pdfUrl = await this.uploadInvoicePDF(pdfBlob, invoice.invoiceNumber)
      invoice.pdfUrl = pdfUrl

      // Save to Firestore
      await setDoc(doc(db, this.collectionName, invoice.id), {
        ...invoice,
        createdAt: Timestamp.fromDate(invoice.createdAt),
        ...(invoice.dueDate && { dueDate: Timestamp.fromDate(invoice.dueDate) })
      })

      // Update order with invoice info
      await updateDoc(doc(db, 'orders', order.id), {
        invoice: {
          id: invoice.id,
          number: invoice.invoiceNumber,
          status: invoice.status,
          pdfUrl: invoice.pdfUrl,
          ...(invoice.dueDate && { dueDate: invoice.dueDate })
        }
      })

      // Auto-send for B2C orders
      if (autoSend && invoice.type === 'b2c') {
        await this.sendInvoice(invoice.id)
      }

      return invoice
    } catch (error) {
      console.error('Error generating invoice:', error)
      throw new Error('Failed to generate invoice')
    }
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(orderType: 'consumer' | 'retailer'): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = orderType === 'consumer' ? 'AUTO' : 'INV'
    
    // Get current counter
    const counterDoc = doc(db, this.invoiceCounters, `${prefix}-${year}`)
    const counterSnapshot = await getDoc(counterDoc)
    
    let nextNumber = 1
    if (counterSnapshot.exists()) {
      nextNumber = counterSnapshot.data().count + 1
    }
    
    // Update counter
    await setDoc(counterDoc, { count: nextNumber }, { merge: true })
    
    // Format number with leading zeros
    const formattedNumber = nextNumber.toString().padStart(4, '0')
    return `${prefix}-${year}-${formattedNumber}`
  }

  /**
   * Upload invoice PDF to Firebase Storage
   */
  private async uploadInvoicePDF(pdfBlob: Blob, invoiceNumber: string): Promise<string> {
    const fileName = `invoices/${invoiceNumber}.pdf`
    const storageRef = ref(storage, fileName)
    
    await uploadBytes(storageRef, pdfBlob, {
      contentType: 'application/pdf',
      customMetadata: {
        invoiceNumber
      }
    })
    
    return getDownloadURL(storageRef)
  }

  /**
   * Send invoice to customer (mark as sent)
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, invoiceId), {
        status: 'sent',
        sentAt: Timestamp.now()
      })
      
      // TODO: Integrate with email service to actually send the invoice
    } catch (error) {
      console.error('Error sending invoice:', error)
      throw new Error('Failed to send invoice')
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, invoiceId), {
        status: 'paid',
        paidAt: Timestamp.now()
      })
      
      // Update related order payment status
      const invoiceDoc = await getDoc(doc(db, this.collectionName, invoiceId))
      if (invoiceDoc.exists()) {
        const invoice = invoiceDoc.data() as Invoice
        await updateDoc(doc(db, 'orders', invoice.orderId), {
          paymentStatus: 'paid',
          'invoice.status': 'paid'
        })
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      throw new Error('Failed to mark invoice as paid')
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const invoiceDoc = await getDoc(doc(db, this.collectionName, invoiceId))
      if (!invoiceDoc.exists()) return null
      
      const data = invoiceDoc.data()
      return {
        ...data,
        id: invoiceDoc.id,
        createdAt: data.createdAt?.toDate(),
        sentAt: data.sentAt?.toDate(),
        paidAt: data.paidAt?.toDate(),
        dueDate: data.dueDate?.toDate()
      } as Invoice
    } catch (error) {
      console.error('Error getting invoice:', error)
      throw new Error('Failed to get invoice')
    }
  }

  /**
   * Get invoices with filters
   */
  async getInvoices(filters: {
    type?: 'b2b' | 'b2c'
    status?: Invoice['status']
    orderId?: string
    limit?: number
  } = {}): Promise<Invoice[]> {
    try {
      let q = query(collection(db, this.collectionName))
      
      if (filters.type) {
        q = query(q, where('type', '==', filters.type))
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters.orderId) {
        q = query(q, where('orderId', '==', filters.orderId))
      }
      
      q = query(q, orderBy('createdAt', 'desc'))
      
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        sentAt: doc.data().sentAt?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      } as Invoice))
    } catch (error) {
      console.error('Error getting invoices:', error)
      throw new Error('Failed to get invoices')
    }
  }
}

export const invoiceService = new InvoiceService()