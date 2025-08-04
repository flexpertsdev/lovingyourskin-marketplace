import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent } from '../components/ui'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { ConsumerCartItem } from '../types'

// Consumer cart doesn't have MOQ requirements

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { items, getSubtotal, getTotal, removeItem, updateQuantity } = useConsumerCartStore()
  
  useEffect(() => {
    // Consumer cart is already loaded from persisted state
  }, [])
  
  // Calculate subtotal
  const subtotal = getSubtotal()
  const taxRate = 0.2 // 20% VAT
  const tax = subtotal * taxRate
  const total = getTotal()
  
  const handleQuantityChange = (productId: string, variantId: string | null, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId, variantId)
    } else {
      updateQuantity(productId, variantId, newQuantity)
    }
  }
  
  if (items.length === 0) {
    return (
      <Layout>
        <Section className="text-center py-20">
          <Container size="sm">
            <h2 className="text-3xl font-light mb-4">Your cart is empty</h2>
            <p className="text-text-secondary mb-8">Discover amazing Korean beauty products</p>
            <Button onClick={() => navigate('/consumer/shop')}>Browse Products</Button>
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
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  {items.map((item, index) => {
                    const price = item.selectedVariant?.pricing?.b2c?.salePrice || 
                                 item.selectedVariant?.pricing?.b2c?.retailPrice || 
                                 item.product.price?.retail || 0
                    
                    return (
                      <div 
                        key={`${item.product.id}-${item.selectedVariant?.variantId || 'default'}`} 
                        className={`flex gap-4 p-6 ${index < items.length - 1 ? 'border-b border-border-gray' : ''}`}
                      >
                        {/* Product Image */}
                        <img 
                          src={item.product.images?.primary || item.product.images?.[0] || '/placeholder.png'}
                          alt={typeof item.product.name === 'string' ? item.product.name : item.product.name?.en || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {typeof item.product.name === 'string' ? item.product.name : item.product.name?.en}
                          </h4>
                          {item.selectedVariant && (
                            <p className="text-sm text-text-secondary">
                              {item.selectedVariant.size && `Size: ${item.selectedVariant.size}${item.selectedVariant.sizeUnit || ''}`}
                              {item.selectedVariant.color && ` • Color: ${item.selectedVariant.color}`}
                            </p>
                          )}
                          <p className="text-sm text-text-secondary mb-2">
                            {typeof item.product.brand?.name === 'string' ? item.product.brand.name : item.product.brand?.name?.en || 'Unknown Brand'}
                          </p>
                          <p className="text-rose-gold font-medium">
                            £{(price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.selectedVariant?.variantId || null, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-border-gray hover:bg-soft-pink-hover transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.selectedVariant?.variantId || null, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-border-gray hover:bg-soft-pink-hover transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
            
            {/* Summary */}
            <div>
              <Card>
                <CardContent>
                  <h3 className="text-xl font-medium mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (VAT 20%)</span>
                      <span>£{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border-gray pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-medium text-rose-gold">
                        £{total.toFixed(2)}
                      </span>
                    </div>
                    
                    <Button 
                      fullWidth 
                      onClick={() => navigate('/consumer/checkout')}
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      fullWidth 
                      className="mt-3"
                      onClick={() => navigate('/consumer/shop')}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}