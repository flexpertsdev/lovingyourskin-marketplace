import { loadStripe, Stripe } from '@stripe/stripe-js'
import { 
  Order, 
  ConsumerCartItem,
  User,
  Address,
  InvoiceItem 
} from '../../types'

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')
  }
  return stripePromise
}

export class StripeService {
  private apiUrl = '/.netlify/functions' // Netlify Functions endpoint

  /**
   * Create a Stripe checkout session for B2C customers
   * Immediate payment with auto-generated invoice
   */
  async createB2CCheckoutSession(data: {
    items: ConsumerCartItem[]
    customer: {
      email: string
      name: string
      id?: string
    }
    shippingAddress?: Address
    successUrl: string
    cancelUrl: string
    affiliateCode?: string
    affiliateDiscount?: {
      type: 'percentage' | 'fixed'
      value: number
    }
  }): Promise<{
    sessionId: string
    sessionUrl: string
  }> {
    try {
      // Transform cart items to the format expected by the API
      const transformedItems = data.items.map(item => {
        // Handle different image formats
        let imageUrl = ''
        if (Array.isArray(item.product.images)) {
          imageUrl = item.product.images[0] || ''
        } else if (typeof item.product.images === 'string') {
          imageUrl = item.product.images
        } else if (item.product.images?.primary) {
          imageUrl = item.product.images.primary
        }

        // Calculate price considering pre-order discount
        const basePrice = item.product.retailPrice?.item || item.product.price?.retail || 0
        const pricePerItem = item.preOrderDiscount 
          ? basePrice * (1 - item.preOrderDiscount / 100)
          : basePrice

        return {
          productId: item.product.id,
          productName: item.product.name,
          productDescription: item.product.description || undefined,
          brandId: item.product.brandId,
          images: imageUrl ? [imageUrl] : [],
          pricePerItem,
          quantity: item.quantity
        }
      })

      const response = await fetch(`${this.apiUrl}/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: transformedItems,
          customerEmail: data.customer.email,
          customerId: data.customer.id,
          customerName: data.customer.name,
          shippingAddress: data.shippingAddress,
          successUrl: data.successUrl,
          cancelUrl: data.cancelUrl,
          affiliateCode: data.affiliateCode,
          affiliateDiscount: data.affiliateDiscount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to create checkout session')
      }

      const session = await response.json()
      return {
        sessionId: session.sessionId,
        sessionUrl: session.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  /**
   * Create a B2B invoice for manual processing
   * No immediate payment - sent to customer with payment terms
   */
  async createB2BInvoice(data: {
    order: Order
    customer: User
    paymentTerms: number // Days (e.g., 30 for NET 30)
    items: InvoiceItem[]
  }): Promise<{
    invoiceId: string
    invoicePdf: string
    stripeInvoiceId: string
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/stripe/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            email: data.customer.email,
            name: data.customer.name,
            metadata: {
              companyId: data.customer.companyId,
              role: 'retailer'
            }
          },
          collection_method: 'send_invoice',
          days_until_due: data.paymentTerms,
          description: `Order #${data.order.orderNumber}`,
          metadata: {
            orderId: data.order.id,
            orderType: 'b2b'
          },
          line_items: data.items.map(item => ({
            price_data: {
              currency: data.order.totalAmount.currency.toLowerCase(),
              product_data: {
                name: item.productName,
                description: item.description
              },
              unit_amount: Math.round(item.unitPrice * 100)
            },
            quantity: item.quantity
          })),
          // Add shipping as a line item if present
          ...(data.order.totalAmount.shipping > 0 && {
            shipping_cost: {
              shipping_rate_data: {
                display_name: 'Shipping & Handling',
                type: 'fixed_amount',
                fixed_amount: {
                  amount: Math.round(data.order.totalAmount.shipping * 100),
                  currency: data.order.totalAmount.currency.toLowerCase()
                }
              }
            }
          })
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const invoice = await response.json()
      return {
        invoiceId: invoice.id,
        invoicePdf: invoice.pdf,
        stripeInvoiceId: invoice.stripe_invoice_id
      }
    } catch (error) {
      console.error('Error creating B2B invoice:', error)
      throw error
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await getStripe()
    if (!stripe) throw new Error('Stripe not loaded')

    const { error } = await stripe.redirectToCheckout({ sessionId })
    if (error) {
      throw error
    }
  }

  /**
   * Create a pre-order discount coupon
   * @deprecated Not currently used - pre-order discounts handled differently
   */
  // private async createPreOrderCoupon(percentOff: number): Promise<string> {
  //   const response = await fetch(`${this.apiUrl}/stripe/create-coupon`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       percent_off: percentOff,
  //       duration: 'once',
  //       name: `Pre-Order ${percentOff}% Discount`
  //     })
  //   })

  //   if (!response.ok) {
  //     throw new Error('Failed to create coupon')
  //   }

  //   const coupon = await response.json()
  //   return coupon.id
  // }

  /**
   * Retrieve a checkout session by ID
   */
  async retrieveSession(sessionId: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/stripe/session/${sessionId}`)
    if (!response.ok) {
      throw new Error('Failed to retrieve session')
    }
    return response.json()
  }

  /**
   * Send an invoice to customer
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/stripe/send-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoiceId })
    })

    if (!response.ok) {
      throw new Error('Failed to send invoice')
    }
  }

  /**
   * Create or update a Stripe customer
   */
  async createOrUpdateCustomer(data: {
    email: string
    name: string
    metadata?: Record<string, string>
    customerId?: string
  }): Promise<{
    customerId: string
    email: string
    name: string
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/stripe-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create/update customer')
      }

      return response.json()
    } catch (error) {
      console.error('Error creating/updating customer:', error)
      throw error
    }
  }

  /**
   * Get customer details including payment methods
   */
  async getCustomer(customerId?: string, email?: string): Promise<any> {
    try {
      const params = new URLSearchParams()
      if (customerId) params.append('customerId', customerId)
      if (email) params.append('email', email)

      const response = await fetch(`${this.apiUrl}/stripe-customer?${params}`)
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to get customer')
      }

      return response.json()
    } catch (error) {
      console.error('Error getting customer:', error)
      throw error
    }
  }
}

export const stripeService = new StripeService()