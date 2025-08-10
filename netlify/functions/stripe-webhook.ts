import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

const db = getFirestore()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const sig = event.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing signature or webhook secret' })
    }
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      sig,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' })
    }
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        
        // Retrieve the full session with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'customer', 'payment_intent']
        })

        // Extract metadata
        const customerId = fullSession.metadata?.customerId || 'guest'
        const customerName = fullSession.metadata?.customerName || 'Guest Customer'
        const affiliateCode = fullSession.metadata?.affiliateCode

        // Create order in Firestore
        const orderData = {
          // Order identifiers
          stripeSessionId: fullSession.id,
          stripePaymentIntentId: fullSession.payment_intent,
          orderNumber: `ORD-${Date.now()}`,
          
          // Customer info
          userId: customerId,
          userType: 'consumer' as const,
          customerEmail: fullSession.customer_email || '',
          customerName: customerName,
          
          // Order details
          status: 'confirmed' as const,
          paymentStatus: 'paid' as const,
          paymentMethod: 'stripe_card' as const,
          
          // Items from line items
          items: fullSession.line_items?.data.map(item => ({
            productId: item.price?.product || '',
            productName: item.description || '',
            quantity: item.quantity || 0,
            pricePerItem: (item.amount_subtotal || 0) / 100 / (item.quantity || 1),
            totalPrice: (item.amount_subtotal || 0) / 100
          })) || [],
          
          // Amounts
          totalAmount: {
            items: (fullSession.amount_subtotal || 0) / 100,
            shipping: (fullSession.total_details?.amount_shipping || 0) / 100,
            tax: (fullSession.total_details?.amount_tax || 0) / 100,
            discount: (fullSession.total_details?.amount_discount || 0) / 100,
            total: (fullSession.amount_total || 0) / 100,
            currency: fullSession.currency?.toUpperCase() || 'GBP'
          },
          
          // Shipping address
          shippingAddress: fullSession.shipping_details?.address ? {
            name: fullSession.shipping_details.name || '',
            street: fullSession.shipping_details.address.line1 || '',
            city: fullSession.shipping_details.address.city || '',
            postalCode: fullSession.shipping_details.address.postal_code || '',
            country: fullSession.shipping_details.address.country || '',
            phone: fullSession.customer_details?.phone || ''
          } : null,
          
          // Billing address
          billingAddress: fullSession.customer_details?.address ? {
            name: fullSession.customer_details.name || '',
            street: fullSession.customer_details.address.line1 || '',
            city: fullSession.customer_details.address.city || '',
            postalCode: fullSession.customer_details.address.postal_code || '',
            country: fullSession.customer_details.address.country || '',
            phone: fullSession.customer_details.phone || ''
          } : null,
          
          // Affiliate tracking
          affiliateCode: affiliateCode || null,
          
          // Timeline
          timeline: [
            {
              status: 'pending',
              timestamp: Timestamp.now(),
              note: 'Order created'
            },
            {
              status: 'confirmed',
              timestamp: Timestamp.now(),
              note: 'Payment confirmed via Stripe'
            }
          ],
          
          // Timestamps
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }

        // Save order to Firestore
        const orderRef = await db.collection('orders').add(orderData)
        console.log('Order created:', orderRef.id)

        // Update affiliate tracking if applicable
        if (affiliateCode) {
          // Find the affiliate code
          const affiliateSnapshot = await db.collection('affiliateCodes')
            .where('code', '==', affiliateCode)
            .limit(1)
            .get()
          
          if (!affiliateSnapshot.empty) {
            const affiliateDoc = affiliateSnapshot.docs[0]
            const affiliateData = affiliateDoc.data()
            
            // Calculate commission
            const commissionRate = affiliateData.commissionRate || 0.1 // 10% default
            const commission = orderData.totalAmount.items * commissionRate
            
            // Update affiliate stats
            await affiliateDoc.ref.update({
              currentUses: (affiliateData.currentUses || 0) + 1,
              totalRevenue: (affiliateData.totalRevenue || 0) + orderData.totalAmount.items,
              totalOrders: (affiliateData.totalOrders || 0) + 1,
              totalCommission: (affiliateData.totalCommission || 0) + commission,
              updatedAt: Timestamp.now()
            })
            
            // Create commission record
            await db.collection('affiliateCommissions').add({
              affiliateCodeId: affiliateDoc.id,
              affiliateCode: affiliateCode,
              orderId: orderRef.id,
              orderNumber: orderData.orderNumber,
              orderValue: orderData.totalAmount.items,
              commissionRate: commissionRate,
              commissionAmount: commission,
              status: 'pending',
              createdAt: Timestamp.now()
            })
          }
        }

        // Send order confirmation email (you can integrate with your email service here)
        // await sendOrderConfirmationEmail(orderData)

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        
        // You might want to update the order status in Firestore
        // or send a notification to the customer
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        console.log('Invoice paid:', invoice.id)
        
        // Update order payment status if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}