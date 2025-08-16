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

// Helper function to handle affiliate commission
async function handleAffiliateCommission(data: {
  affiliateCode: string
  orderId: string
  orderType: string
  orderValue: number
  customerEmail: string
  customerId: string
}) {
  const { affiliateCode, orderId, orderType, orderValue, customerEmail, customerId } = data
  
  // Find the affiliate code
  const affiliateSnapshot = await db.collection('affiliateCodes')
    .where('code', '==', affiliateCode.toUpperCase())
    .limit(1)
    .get()
  
  if (!affiliateSnapshot.empty) {
    const affiliateDoc = affiliateSnapshot.docs[0]
    const affiliateData = affiliateDoc.data()
    
    // Calculate commission
    const commissionType = affiliateData.commissionType || 'percentage'
    const commissionValue = affiliateData.commissionValue || 10
    const commission = commissionType === 'percentage' 
      ? orderValue * (commissionValue / 100)
      : commissionValue
    
    // Update affiliate stats
    await affiliateDoc.ref.update({
      currentUses: (affiliateData.currentUses || 0) + 1,
      totalRevenue: (affiliateData.totalRevenue || 0) + orderValue,
      totalOrders: (affiliateData.totalOrders || 0) + 1,
      updatedAt: Timestamp.now()
    })
    
    // Create commission record
    await db.collection('affiliateCommissions').add({
      affiliateCodeId: affiliateDoc.id,
      affiliateCode: affiliateCode,
      affiliateUserId: affiliateData.userId || null,
      orderId: orderId,
      orderType: orderType,
      orderValue: orderValue,
      commissionType: commissionType,
      commissionValue: commissionValue,
      commissionAmount: commission,
      status: 'pending',
      createdAt: Timestamp.now()
    })
    
    console.log(`Affiliate commission created for ${orderType}:`, commission)
  }
}

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
        
        // Retrieve the full session with line items and product metadata
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product', 'customer', 'payment_intent']
        })

        // Extract metadata
        const customerId = fullSession.metadata?.customerId || 'guest'
        const customerName = fullSession.metadata?.customerName || 'Guest Customer'
        const affiliateCode = fullSession.metadata?.affiliateCode
        const orderType = fullSession.metadata?.orderType || 'b2c'
        const preorderId = fullSession.metadata?.preorderId

        // Handle pre-order vs regular order
        if (orderType === 'preorder' && preorderId) {
          // Update existing pre-order with payment information
          const preorderRef = db.collection('preorders').doc(preorderId)
          await preorderRef.update({
            stripeSessionId: fullSession.id,
            stripePaymentIntentId: fullSession.payment_intent,
            paymentStatus: 'paid',
            status: 'confirmed',
            userId: customerId !== 'guest' ? customerId : '',
            userEmail: fullSession.customer_email || '',
            confirmedAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          })
          console.log('Pre-order payment confirmed:', preorderId)

          // Create commission record for pre-orders with affiliate codes
          if (affiliateCode) {
            await handleAffiliateCommission({
              affiliateCode,
              orderId: preorderId,
              orderType: 'preorder',
              orderValue: (fullSession.amount_total || 0) / 100,
              customerEmail: fullSession.customer_email || '',
              customerId
            })
          }
        } else {
          // Create regular order in Firestore
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
          items: fullSession.line_items?.data.map(item => {
            // Try to get productId from metadata if product is expanded
            let productId = ''
            if (typeof item.price?.product === 'object' && item.price.product?.metadata) {
              productId = item.price.product.metadata.productId || ''
            } else if (typeof item.price?.product === 'string') {
              productId = item.price.product
            }
            
            return {
              productId: productId,
              productName: item.description || '',
              quantity: item.quantity || 0,
              pricePerItem: (item.amount_subtotal || 0) / 100 / (item.quantity || 1),
              totalPrice: (item.amount_subtotal || 0) / 100
            }
          }) || [],
          
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

          // Update product stock (only for regular orders, not pre-orders)
          console.log('Updating product stock...')
          for (const item of orderData.items) {
          if (item.productId) {
            try {
              // Get the product document
              const productRef = db.collection('products').doc(item.productId)
              const productDoc = await productRef.get()
              
              if (productDoc.exists) {
                const productData = productDoc.data()
                const currentStock = productData?.stock || 0
                const newStock = Math.max(0, currentStock - item.quantity)
                
                // Update the stock
                await productRef.update({
                  stock: newStock,
                  updatedAt: Timestamp.now()
                })
                
                console.log(`Updated stock for product ${item.productId}: ${currentStock} -> ${newStock}`)
              }
            } catch (stockError) {
                console.error(`Error updating stock for product ${item.productId}:`, stockError)
                // Continue processing even if stock update fails
              }
            }
          }

          // Update affiliate tracking if applicable
          if (affiliateCode) {
          // Find the affiliate code (supporting both old and new structure)
          let affiliateSnapshot = await db.collection('affiliateCodes')
            .where('code', '==', affiliateCode.toUpperCase())
            .limit(1)
            .get()
          
          if (!affiliateSnapshot.empty) {
            const affiliateDoc = affiliateSnapshot.docs[0]
            const affiliateData = affiliateDoc.data()
            
            // Calculate commission based on the affiliate's commission settings
            const commissionType = affiliateData.commissionType || 'percentage'
            const commissionValue = affiliateData.commissionValue || 10
            const commission = commissionType === 'percentage' 
              ? orderData.totalAmount.items * (commissionValue / 100)
              : commissionValue
            
            // Update affiliate stats
            await affiliateDoc.ref.update({
              currentUses: (affiliateData.currentUses || 0) + 1,
              totalRevenue: (affiliateData.totalRevenue || 0) + orderData.totalAmount.items,
              totalOrders: (affiliateData.totalOrders || 0) + 1,
              updatedAt: Timestamp.now()
            })
            
            // Create commission record
            await db.collection('affiliateCommissions').add({
              affiliateCodeId: affiliateDoc.id,
              affiliateCode: affiliateCode,
              affiliateUserId: affiliateData.userId || null,
              orderId: orderRef.id,
              orderNumber: orderData.orderNumber,
              orderValue: orderData.totalAmount.items,
              commissionType: commissionType,
              commissionValue: commissionValue,
              commissionAmount: commission,
              status: 'pending',
              createdAt: Timestamp.now()
            })
            
            // Create or update affiliate tracking record
            const trackingQuery = await db.collection('affiliateTracking')
              .where('affiliateCode', '==', affiliateCode)
              .where('customerEmail', '==', fullSession.customer_email || '')
              .limit(1)
              .get()
            
            if (!trackingQuery.empty) {
              // Update existing tracking record
              await trackingQuery.docs[0].ref.update({
                status: 'purchased',
                orderId: orderRef.id,
                orderValue: orderData.totalAmount.items,
                commission: commission,
                purchasedAt: Timestamp.now()
              })
            } else {
              // Create new tracking record
              await db.collection('affiliateTracking').add({
                affiliateCodeId: affiliateDoc.id,
                affiliateCode: affiliateCode,
                sessionId: fullSession.id,
                customerId: customerId,
                customerEmail: fullSession.customer_email || '',
                orderId: orderRef.id,
                orderValue: orderData.totalAmount.items,
                commission: commission,
                status: 'purchased',
                clickedAt: Timestamp.now(),
                purchasedAt: Timestamp.now()
                })
              }
            }
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