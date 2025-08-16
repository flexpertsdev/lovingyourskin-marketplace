import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout, Container, Section } from '../components/layout'
import { Card, CardContent, Button, Badge } from '../components/ui'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { usePreorderStore } from '../stores/preorder.store'
import { ShoppingCart, Package, Trash2, Plus, Minus, ChevronRight, AlertCircle } from 'lucide-react'
import { getProductPrice } from '../lib/utils/pricing'

export const ConsumerUnifiedCart: React.FC = () => {
  const navigate = useNavigate()
  
  // Regular cart store
  const { 
    items: regularItems, 
    updateQuantity: updateRegularQuantity,
    removeItem: removeRegularItem,
    getSubtotal: getRegularSubtotal,
    getAffiliateDiscount,
    getTotalAmount: getRegularTotal,
    affiliateCode
  } = useConsumerCartStore()
  
  // Pre-order cart store
  const {
    preorderItems,
    activeCampaign,
    updatePreorderQuantity,
    removeFromPreorderCart,
    getTotalWithDiscount: getPreorderTotal,
    getItemCount: getPreorderCount
  } = usePreorderStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
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

  // Calculate regular items totals
  const regularSubtotal = getRegularSubtotal()
  const affiliateDiscount = getAffiliateDiscount()
  const regularTotal = getRegularTotal()

  // Calculate pre-order totals
  const preorderSubtotal = preorderItems.reduce((total, item) => 
    total + (item.pricePerItem * item.quantity), 0
  )
  const preorderDiscount = preorderSubtotal - getPreorderTotal()
  const preorderTotal = getPreorderTotal()

  const hasRegularItems = regularItems.length > 0
  const hasPreorderItems = preorderItems.length > 0

  if (!hasRegularItems && !hasPreorderItems) {
    return (
      <Layout mode="consumer">
        <Section>
          <Container>
            <div className="max-w-4xl mx-auto text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-12 h-12 text-rose-gold" />
                </div>
                <h2 className="text-2xl font-light mb-2">Your cart is empty</h2>
                <p className="text-text-secondary">
                  Browse our products and add items to your cart
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link to="/shop">
                  <Button variant="primary">
                    Shop Regular Products
                  </Button>
                </Link>
                {activeCampaign && (
                  <Link to="/shop/preorders">
                    <Button variant="secondary">
                      View Pre-order Campaign
                    </Button>
                  </Link>
                )}
              </div>
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
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-light">Your Shopping Cart</h1>
              <p className="text-text-secondary mt-2">
                Review your items and proceed to checkout
              </p>
            </div>

            <div className="space-y-8">
              {/* Regular Items Section */}
              {hasRegularItems && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Package className="w-5 h-5 text-rose-gold" />
                      <h2 className="text-xl font-medium">Regular Items</h2>
                      <Badge variant="default">{regularItems.length} items</Badge>
                    </div>

                    <div className="space-y-4 mb-6">
                      {regularItems.map((item) => {
                        const price = getProductPrice(item.product)
                        return (
                          <div key={item.id} className="flex gap-4 p-4 bg-background rounded-lg">
                            <img
                              src={item.product.images?.primary || '/placeholder-product.png'}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">{item.product.name}</h3>
                              <p className="text-sm text-text-secondary">
                                {formatPrice(price)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateRegularQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-soft-pink rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateRegularQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-soft-pink rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(price * item.quantity)}</p>
                              <button
                                onClick={() => removeRegularItem(item.id)}
                                className="text-red-500 hover:text-red-600 text-sm mt-1"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(regularSubtotal)}</span>
                      </div>
                      {affiliateDiscount > 0 && (
                        <div className="flex justify-between text-sm text-success-green">
                          <span>Affiliate Discount ({affiliateCode})</span>
                          <span>-{formatPrice(affiliateDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-success-green">FREE</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-rose-gold">{formatPrice(regularTotal)}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      size="lg"
                      onClick={() => navigate('/shop/checkout')}
                    >
                      Checkout Regular Items
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pre-order Items Section */}
              {hasPreorderItems && (
                <Card className="border-rose-gold/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🎯</span>
                      <h2 className="text-xl font-medium">Pre-order Items</h2>
                      <Badge variant="info" className="bg-rose-gold text-white">
                        {preorderItems.length} items
                      </Badge>
                    </div>

                    {/* Campaign Info */}
                    {activeCampaign && (
                      <div className="bg-soft-pink/50 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-rose-gold mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activeCampaign.name}</p>
                            <p className="text-sm text-text-secondary mt-1">
                              {activeCampaign.discountPercentage}% discount applied
                            </p>
                            <p className="text-sm text-text-secondary">
                              Processing: {formatDate(activeCampaign.preorderDate)}
                            </p>
                            <p className="text-sm text-text-secondary">
                              Estimated delivery: {activeCampaign.deliveryTimeframe} after processing
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 mb-6">
                      {preorderItems.map((item) => (
                        <div key={item.productId} className="flex gap-4 p-4 bg-background rounded-lg">
                          <img
                            src={item.product.images?.primary || '/placeholder-product.png'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-rose-gold">
                                {formatPrice(item.discountedPrice)} each
                              </span>
                              <span className="text-xs text-text-secondary line-through">
                                {formatPrice(item.pricePerItem)}
                              </span>
                              <Badge variant="success" className="text-xs">
                                {item.discountPercentage}% off
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePreorderQuantity(item.productId, item.quantity - 1)}
                              className="p-1 hover:bg-soft-pink rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updatePreorderQuantity(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-soft-pink rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.discountedPrice * item.quantity)}
                            </p>
                            <button
                              onClick={() => removeFromPreorderCart(item.productId)}
                              className="text-red-500 hover:text-red-600 text-sm mt-1"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(preorderSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-success-green">
                        <span>Pre-order Discount</span>
                        <span>-{formatPrice(preorderDiscount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span className="text-success-green">FREE</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-rose-gold">{formatPrice(preorderTotal)}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      size="lg"
                      variant="primary"
                      onClick={() => navigate('/shop/preorder-checkout')}
                    >
                      Checkout Pre-order Items
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>

                    <p className="text-xs text-text-secondary text-center mt-3">
                      Pre-orders will be processed on {formatDate(activeCampaign?.preorderDate)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}