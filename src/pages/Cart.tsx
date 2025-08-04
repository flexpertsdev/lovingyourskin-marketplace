import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent, Badge } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { getProductName, getProductPrimaryImage } from '../utils/product-helpers'

// Retailer cart with MOQ requirements

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { 
    cart, 
    moqStatuses,
    getTotalPrice, 
    removeFromCart, 
    updateQuantity,
    loadCart,
    validateAllMOQ,
    clearBrandItems
  } = useCartStore()
  
  useEffect(() => {
    loadCart()
  }, [loadCart])
  
  useEffect(() => {
    validateAllMOQ()
  }, [cart.items, validateAllMOQ])
  
  const isCheckoutEnabled = moqStatuses.every(status => status.met)
  
  // Calculate totals
  const subtotal = getTotalPrice()
  const taxRate = 0.2 // 20% VAT
  const tax = subtotal * taxRate
  const total = subtotal + tax
  
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }
  
  if (cart.items.length === 0) {
    return (
      <Layout>
        <Section className="text-center py-20">
          <Container size="sm">
            <h2 className="text-3xl font-light mb-4">Your cart is empty</h2>
            <p className="text-text-secondary mb-8">Discover amazing brands for your business</p>
            <Button onClick={() => navigate('/brands')}>Browse Brands</Button>
          </Container>
        </Section>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Section>
        <Container>
          <h1 className="text-3xl font-light mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* MOQ Status */}
              {moqStatuses.map(status => (
                <Card key={status.brandId} className={status.met ? '' : 'border-warning-orange'}>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">{status.brandName}</h3>
                      <Badge variant={status.met ? 'success' : 'warning'}>
                        {status.met ? 'MOQ Met' : `£${status.remainingItems.toFixed(2)} to MOQ`}
                      </Badge>
                    </div>
                    
                    {!status.met && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-text-secondary mb-1">
                          <span>Progress to MOQ</span>
                          <span>£{status.current.toFixed(2)} / £{status.required.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Brand items */}
                    {cart.items.filter(item => item.product.brandId === status.brandId).map((item, index) => {
                      const price = item.product.price?.wholesale || 0
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`flex gap-4 py-4 ${index > 0 ? 'border-t border-border-gray' : ''}`}
                        >
                          {/* Product Image */}
                          <img 
                            src={getProductPrimaryImage(item.product) || '/placeholder.png'}
                            alt={getProductName(item.product)}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {getProductName(item.product)}
                            </h4>
                            <p className="text-sm text-text-secondary">
                              {item.product.volume} • {item.product.itemsPerCarton} items per carton
                            </p>
                            <p className="text-sm text-text-secondary">
                              £{price.toFixed(2)} per carton
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-border-gray hover:bg-soft-pink-hover transition-colors"
                            >
                              -
                            </button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-border-gray hover:bg-soft-pink-hover transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <p className="text-rose-gold font-medium">
                            £{(price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                    
                    {!status.met && (
                      <div className="mt-4 pt-4 border-t border-border-gray">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => clearBrandItems(status.brandId)}
                        >
                          Remove Brand Items
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent>
                  <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (VAT 20%)</span>
                      <span>£{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-xl font-medium text-rose-gold">
                        £{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {!isCheckoutEnabled && (
                    <div className="mb-4 p-4 bg-warning-light rounded-lg text-sm">
                      <p className="font-medium mb-1">Minimum order requirements not met</p>
                      <p className="text-text-secondary">
                        Please meet the minimum order quantity for all brands before checkout.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    fullWidth 
                    onClick={() => navigate('/checkout')}
                    disabled={!isCheckoutEnabled}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}