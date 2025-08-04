// TODO: Install @stripe/stripe-js
// import { loadStripe, Stripe } from '@stripe/stripe-js'
import { 
  Order, 
  ConsumerCartItem,
  User,
  Address,
  InvoiceItem 
} from '../../types'

// Initialize Stripe
let stripePromise: Promise<any | null> | null = null

const getStripe = () => {
  if (!stripePromise) {
    // stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')
    stripePromise = Promise.resolve(null) // TODO: Uncomment above when stripe is installed
  }
  return stripePromise
}

export class StripeService {
  private apiUrl = '/api' // TODO: Use import.meta.env.VITE_API_URL when available

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
    shippingAddress: Address
    successUrl: string
    cancelUrl: string
  }): Promise<{
    sessionId: string
    sessionUrl: string
  }> {
    try {
      const lineItems = data.items.map(item => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.product.name,
        description: item.product.description,
            images: [item.product.images.primary], // Stripe accepts max 8 images
            metadata: {
              productId: item.product.id,
              brandId: item.product.brandId
            }
          },
          unit_amount: Math.round(item.product.retailPrice?.item || 0) * 100 // Convert to pence
        },
        quantity: item.quantity
      }))

      // Calculate any pre-order discounts
      const discount = data.items.some(item => item.preOrderDiscount) ? {
        coupon: await this.createPreOrderCoupon(data.items[0].preOrderDiscount || 20)
      } : undefined

      const response = await fetch(`${this.apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'payment',
          lineItems,
          customerEmail: data.customer.email,
          metadata: {
            orderType: 'b2c',
            customerId: data.customer.id || 'guest',
            customerName: data.customer.name
          },
          shippingAddress: {
            name: data.shippingAddress.name,
            address: {
              line1: data.shippingAddress.street,
              city: data.shippingAddress.city,
              postal_code: data.shippingAddress.postalCode,
              country: data.shippingAddress.country
            }
          },
          successUrl: data.successUrl,
          cancelUrl: data.cancelUrl,
          discounts: discount ? [discount] : [],
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: 'Thank you for your order from Loving Your Skin',
              footer: 'K-Beauty products delivered to Europe',
              metadata: {
                orderType: 'b2c'
              }
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      return {
        sessionId: session.id,
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
   */
  private async createPreOrderCoupon(percentOff: number): Promise<string> {
    const response = await fetch(`${this.apiUrl}/stripe/create-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        percent_off: percentOff,
        duration: 'once',
        name: `Pre-Order ${percentOff}% Discount`
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create coupon')
    }

    const coupon = await response.json()
    return coupon.id
  }

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
}

export const stripeService = new StripeService()