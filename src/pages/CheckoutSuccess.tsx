import React, { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Button } from '../components/ui/Button'
import { useConsumerCartStore } from '../stores/consumer-cart.store'

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { clearCart } = useConsumerCartStore()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart()
  }, [clearCart])

  return (
    <Layout mode="consumer">
      <Section>
        <Container className="text-center py-16">
          <div className="max-w-md mx-auto">
            {/* Success Icon */}
            <div className="mb-6">
              <svg 
                className="w-24 h-24 mx-auto text-green-500"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>

            <h1 className="text-3xl font-light mb-4">Order Confirmed!</h1>
            
            <p className="text-gray-600 mb-8">
              Thank you for your order. We've sent a confirmation email with your order details.
            </p>

            {sessionId && (
              <p className="text-sm text-gray-500 mb-8">
                Order reference: {sessionId.substring(0, 20)}...
              </p>
            )}

            <div className="space-y-4">
              <Link to="/shop/orders">
                <Button fullWidth>
                  View My Orders
                </Button>
              </Link>
              
              <Link to="/shop">
                <Button variant="secondary" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <div className="mt-12 p-6 bg-soft-pink rounded-lg">
              <h2 className="text-lg font-medium mb-2">What's Next?</h2>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-rose-gold mr-2">✓</span>
                  You'll receive an order confirmation email shortly
                </li>
                <li className="flex items-start">
                  <span className="text-rose-gold mr-2">✓</span>
                  We'll notify you when your order ships
                </li>
                <li className="flex items-start">
                  <span className="text-rose-gold mr-2">✓</span>
                  Track your order status in your account
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}