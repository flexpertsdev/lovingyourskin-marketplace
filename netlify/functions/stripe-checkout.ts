import { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const {
      items,
      customerEmail,
      customerId,
      customerName,
      shippingAddress,
      successUrl,
      cancelUrl,
      affiliateCode,
      affiliateDiscount,
      metadata
    } = JSON.parse(event.body || '{}')

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          ...(item.productDescription && item.productDescription.trim() && { 
            description: item.productDescription 
          }),
          images: item.images ? [item.images[0]] : [],
          metadata: {
            productId: item.productId,
            brandId: item.brandId
          }
        },
        unit_amount: Math.round(item.pricePerItem * 100) // Convert to cents
      },
      quantity: item.quantity
    }))

    // Build session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT']
      },
      metadata: {
        customerId: customerId || 'guest',
        customerName: customerName || '',
        affiliateCode: affiliateCode || '',
        ...(metadata || {})
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'Thank you for your order from Loving Your Skin',
          footer: 'Premium K-Beauty products delivered to Europe',
          custom_fields: [
            {
              name: 'Order Type',
              value: metadata?.orderType === 'preorder' ? 'Pre-order' : 'B2C'
            }
          ],
          metadata: {
            orderType: metadata?.orderType || 'b2c',
            affiliateCode: affiliateCode || '',
            ...(metadata || {})
          }
        }
      }
    }

    // Apply affiliate discount if present
    if (affiliateDiscount && affiliateDiscount.value > 0) {
      // Create a coupon for the discount
      const coupon = await stripe.coupons.create({
        [affiliateDiscount.type === 'percentage' ? 'percent_off' : 'amount_off']: 
          affiliateDiscount.type === 'percentage' 
            ? affiliateDiscount.value 
            : Math.round(affiliateDiscount.value * 100), // Convert to pence for fixed amount
        duration: 'once',
        name: `Affiliate discount (${affiliateCode})`,
        currency: affiliateDiscount.type === 'fixed' ? 'usd' : undefined
      })

      sessionConfig.discounts = [{
        coupon: coupon.id
      }]
    }

    // Pre-fill shipping address if provided
    if (shippingAddress) {
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping
              currency: 'usd'
            },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3
              },
              maximum: {
                unit: 'business_day',
                value: 7
              }
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 999, // £9.99
              currency: 'usd'
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1
              },
              maximum: {
                unit: 'business_day',
                value: 3
              }
            }
          }
        }
      ]
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}