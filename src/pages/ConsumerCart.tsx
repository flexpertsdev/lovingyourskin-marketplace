import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { Layout, Container } from '../components/layout'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
// Icon components
const Trash2Icon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const MinusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

const ShoppingBagIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)
// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)
}
import { useAuthStore } from '../stores/auth.store'

export const ConsumerCart: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalItems,
    getSubtotal,
    getEstimatedShipping,
    getEstimatedTax,
    getPreOrderDiscount,
    getTotalAmount,
    isPreOrderCart
  } = useConsumerCartStore()

  const handleCheckout = () => {
    if (!user) {
      navigate('/shop/login')
    } else {
      navigate('/shop/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <Layout mode="consumer">
        <Container className="py-12">
          <div className="text-center">
            <div className="h-16 w-16 text-gray-300 mx-auto mb-4">
              <ShoppingBagIcon />
            </div>
            <h2 className="text-2xl font-light mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Discover our premium K-beauty products</p>
            <Link to="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </Container>
      </Layout>
    )
  }

  const subtotal = getSubtotal()
  const shipping = getEstimatedShipping()
  const tax = getEstimatedTax()
  const discount = getPreOrderDiscount()
  const total = getTotalAmount()
  const hasPreOrder = isPreOrderCart()

  return (
    <Layout mode="consumer">
      <Container className="py-8">
        <h1 className="text-3xl font-light mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {(() => {
                      const imageUrl = Array.isArray(item.product.images) 
                        ? item.product.images[0] 
                        : (typeof item.product.images === 'string' 
                          ? item.product.images 
                          : item.product.images?.primary || item.product.images?.gallery?.[0]);
                      
                      if (imageUrl) {
                        return (
                          <img
                            src={imageUrl}
                            alt={typeof item.product.name === 'string' ? item.product.name : item.product.name.en}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBagIcon />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-medium">
                          <Link to={`/shop/products/${item.product.id}`} className="hover:text-rose-gold">
                            {typeof item.product.name === 'string' ? item.product.name : item.product.name.en}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">{item.product.brandId}</p>
                        {item.product.preOrderEnabled && (
                          <p className="text-sm text-green-600 mt-1">
                            Pre-order: {item.preOrderDiscount}% off
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2Icon />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.product.retailQuantity !== undefined && 
                                   item.quantity >= item.product.retailQuantity}
                        >
                          <PlusIcon />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency((item.product.retailPrice?.item || 0) * item.quantity)}
                        </p>
                        {item.preOrderDiscount && (
                          <p className="text-sm text-green-600">
                            -{formatCurrency((item.product.retailPrice?.item || 0) * item.quantity * item.preOrderDiscount / 100)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Pre-order Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {hasPreOrder && (
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-blue-800">
                    This order contains pre-order items. Expected delivery date will be shown at checkout.
                  </p>
                </div>
              )}

              {shipping > 0 && (
                <p className="text-sm text-gray-600 mb-4">
                  Add {formatCurrency(50 - subtotal)} more for free shipping
                </p>
              )}

              <Button onClick={handleCheckout} className="w-full" size="large">
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <Link to="/shop" className="text-sm text-rose-gold hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
    </Layout>
  )
}