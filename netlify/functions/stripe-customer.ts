import { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

export const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    }
  }

  try {
    switch (event.httpMethod) {
      case 'POST': {
        // Create or update customer
        const { email, name, metadata, customerId } = JSON.parse(event.body || '{}')

        let customer: Stripe.Customer

        if (customerId) {
          // Update existing customer
          customer = await stripe.customers.update(customerId, {
            email,
            name,
            metadata
          })
        } else {
          // Check if customer exists by email
          const existingCustomers = await stripe.customers.list({
            email,
            limit: 1
          })

          if (existingCustomers.data.length > 0) {
            // Update existing customer
            customer = await stripe.customers.update(existingCustomers.data[0].id, {
              name,
              metadata
            })
          } else {
            // Create new customer
            customer = await stripe.customers.create({
              email,
              name,
              metadata
            })
          }
        }

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            customerId: customer.id,
            email: customer.email,
            name: customer.name,
            metadata: customer.metadata
          })
        }
      }

      case 'GET': {
        // Get customer by ID or email
        const { customerId, email } = event.queryStringParameters || {}

        if (!customerId && !email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Customer ID or email required' })
          }
        }

        let customer: Stripe.Customer | null = null

        if (customerId) {
          customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        } else if (email) {
          const customers = await stripe.customers.list({
            email,
            limit: 1
          })
          customer = customers.data[0] || null
        }

        if (!customer) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Customer not found' })
          }
        }

        // Get customer's payment methods
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customer.id,
          type: 'card'
        })

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            customerId: customer.id,
            email: customer.email,
            name: customer.name,
            metadata: customer.metadata,
            paymentMethods: paymentMethods.data.map(pm => ({
              id: pm.id,
              brand: pm.card?.brand,
              last4: pm.card?.last4,
              expMonth: pm.card?.exp_month,
              expYear: pm.card?.exp_year
            }))
          })
        }
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error('Stripe customer error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process customer request',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}