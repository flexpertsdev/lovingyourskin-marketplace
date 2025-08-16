import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Card, CardContent, Button, Badge } from '../components/ui'
import { usePreorderStore } from '../stores/preorder.store'
import { formatPrice } from '../lib/utils/pricing'
import toast from 'react-hot-toast'

export const ConsumerPreorderCart: React.FC = () => {
  const navigate = useNavigate()
  const {
    preorderItems,
    activeCampaign,
    fetchActiveCampaign,
    updatePreorderQuantity,
    removeFromPreorderCart,
    getTotalWithDiscount,
    getItemCount,
    clearPreorderCart
  } = usePreorderStore()

  useEffect(() => {
    // Fetch active campaign if not loaded
    if (!activeCampaign) {
      fetchActiveCampaign()
    }
  }, [activeCampaign, fetchActiveCampaign])

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromPreorderCart(productId)
    } else {
      updatePreorderQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: string) => {
    removeFromPreorderCart(productId)
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear all pre-order items?')) {
      clearPreorderCart()
      toast.success('Pre-order cart cleared')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Calculate totals
  const subtotal = preorderItems.reduce((total, item) => 
    total + (item.pricePerItem * item.quantity), 0
  )
  const discount = subtotal - getTotalWithDiscount()
  const total = getTotalWithDiscount()

  if (preorderItems.length === 0) {
    return (
      <Layout mode="consumer">
        <Section>
          <Container>
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="w-24 h-24 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🛒</span>
              </div>
              <h1 className="text-3xl font-light mb-4">Your Pre-order Cart is Empty</h1>
              <p className="text-text-secondary text-lg mb-8">
                Browse our pre-order campaign to add items at exclusive discounted prices.
              </p>
              <Link to="/shop/preorders">
                <Button variant="primary" size="large">
                  View Pre-order Campaign
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout mode="consumer">
      <Section>
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2">Pre-order Cart</h1>
              {activeCampaign && (
                <div className="flex items-center gap-4">
                  <Badge variant="info" className="bg-rose-gold text-white">
                    {activeCampaign.name}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    {activeCampaign.discountPercentage}% discount applied to all items
                  </span>
                </div>
              )}
            </div>

            {/* Campaign Info Bar */}
            {activeCampaign && (
              <Card className="bg-soft-pink/50 border-rose-gold mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-text-secondary">Campaign Ends</p>
                        <p className="font-medium">{formatDate(activeCampaign.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Processing Date</p>
                        <p className="font-medium">{formatDate(activeCampaign.preorderDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Delivery</p>
                        <p className="font-medium">{activeCampaign.deliveryTimeframe}</p>
                      </div>
                    </div>
                    <Link to="/shop/preorders">
                      <Button variant="secondary" size="small">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">
                    Items ({getItemCount()})
                  </h2>
                  {preorderItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-text-secondary hover:text-rose-gold transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {preorderItems.map((item) => (
                    <Card key={item.productId}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link to={`/shop/products/${item.productId}`}>
                            <img
                              src={item.product.images?.primary || '/placeholder-product.png'}
                              alt={item.product.name}
                              className="w-24 h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                            />
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Link 
                                  to={`/shop/products/${item.productId}`}
                                  className="font-medium text-deep-charcoal hover:text-rose-gold transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="text-sm text-text-secondary">
                                  {item.product.brandId}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-text-secondary hover:text-rose-gold transition-colors"
                                title="Remove item"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Price Info */}
                            <div className="flex items-center gap-2 mb-3">
                              {item.pricePerItem > 0 ? (
                                <>
                                  <span className="text-lg font-light text-rose-gold">
                                    {formatPrice(item.discountedPrice)}
                                  </span>
                                  <span className="text-sm text-text-secondary line-through">
                                    {formatPrice(item.pricePerItem)}
                                  </span>
                                  <Badge variant="success" className="text-xs">
                                    {item.discountPercentage}% OFF
                                  </Badge>
                                </>
                              ) : (
                                <span className="text-sm text-text-secondary">Price not available</span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-border-gray hover:border-rose-gold transition-colors flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-border-gray hover:border-rose-gold transition-colors flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-right">
                                {item.pricePerItem > 0 ? (
                                  <>
                                    <p className="font-medium">
                                      {formatPrice(item.discountedPrice * item.quantity)}
                                    </p>
                                    <p className="text-xs text-success-green">
                                      Save {formatPrice((item.pricePerItem - item.discountedPrice) * item.quantity)}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-text-secondary">-</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-4">
                  <CardContent>
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({getItemCount()} items)</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-success-green">
                        <span>Pre-order Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-success-green">FREE</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total</span>
                        <div className="text-right">
                          <p className="text-2xl font-light text-rose-gold">
                            {formatPrice(total)}
                          </p>
                          <p className="text-xs text-success-green">
                            You save {formatPrice(discount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full mb-3"
                      size="large"
                      onClick={() => navigate('/shop/preorder-checkout')}
                    >
                      Proceed to Checkout
                    </Button>

                    <Link to="/shop/preorders">
                      <Button variant="secondary" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>

                    {/* Info Box */}
                    <div className="mt-4 p-3 bg-soft-pink/30 rounded-lg">
                      <p className="text-xs text-text-secondary">
                        <span className="font-medium">Note:</span> Pre-orders will be processed on{' '}
                        {activeCampaign && formatDate(activeCampaign.preorderDate)} and delivered within{' '}
                        {activeCampaign?.deliveryTimeframe}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}