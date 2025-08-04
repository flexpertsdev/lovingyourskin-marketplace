import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout'
import { Container, Section } from '../components/layout'
import { Button, Card, CardContent } from '../components/ui'
import { useCartStore } from '../stores/cart.store'
import { useBrands } from '../hooks/useBrands'
import { CartItem } from '../types'

interface BrandGroup {
  brandId: string
  brandName: string
  items: CartItem[]
  subtotal: number
  totalItems: number
  moq: number
  moqStatus: 'met' | 'warning' | 'error'
}

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { cart, moqStatuses, loadCart, removeFromCart, updateQuantity, getTotalPrice } = useCartStore()
  const { brands } = useBrands()
  
  useEffect(() => {
    loadCart()
  }, [loadCart])
  
  // Group cart items by brand
  const brandGroups: BrandGroup[] = React.useMemo(() => {
    const groups: Record<string, BrandGroup> = {}
    
    cart.items.forEach(item => {
      if (!groups[item.product.brandId]) {
        const brand = brands.find(b => b.id === item.product.brandId)
        const moqStatus = moqStatuses.find(s => s.brandId === item.product.brandId)
        
        groups[item.product.brandId] = {
          brandId: item.product.brandId,
          brandName: brand?.name.en || 'Unknown Brand',
          items: [],
          subtotal: 0,
          totalItems: 0,
          moq: brand?.minimumOrder || 0,
          moqStatus: moqStatus?.status || 'error'
        }
      }
      
      groups[item.product.brandId].items.push(item)
      const itemPrice = item.product.price.wholesale ?? item.product.price.retail ?? item.product.retailPrice?.item ?? 0
      groups[item.product.brandId].subtotal += itemPrice * item.quantity
      groups[item.product.brandId].totalItems += item.quantity
    })
    
    return Object.values(groups)
  }, [cart.items, brands, moqStatuses])
  
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }
  
  const canCheckout = brandGroups.every(group => group.moqStatus === 'met')
  
  if (cart.items.length === 0) {
    return (
      <Layout>
        <Section className="text-center py-20">
          <Container size="sm">
            <h2 className="text-3xl font-light mb-4">Your cart is empty</h2>
            <p className="text-text-secondary mb-8">Discover verified Korean beauty brands</p>
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
              {brandGroups.map((group) => (
                <Card key={group.brandId} className="overflow-hidden">
                  {/* Brand Header */}
                  <div className="bg-soft-pink px-6 py-4">
                    <h3 className="text-xl font-medium">{group.brandName}</h3>
                    <p className="text-sm text-text-secondary">
                      Minimum order: {group.moq} items
                    </p>
                  </div>
                  
                  <CardContent className="p-0">
                    {/* Items */}
                    {group.items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`flex gap-4 p-6 ${index < group.items.length - 1 ? 'border-b border-border-gray' : ''}`}
                      >
                        <div className="w-20 h-20 bg-soft-pink rounded-lg flex items-center justify-center text-xs text-text-secondary">
                          Image
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name.en}</h4>
                          <p className="text-sm text-text-secondary mb-2">
                            {item.quantity} × {item.product.packSize} items/pack = {item.quantity * parseInt(item.product.packSize)} items
                          </p>
                          <p className="text-rose-gold font-medium">
                            £{((item.product.price.wholesale ?? item.product.price.retail ?? item.product.retailPrice?.item ?? 0) * item.quantity).toFixed(2)}
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
                      </div>
                    ))}
                    
                    {/* MOQ Status */}
                    <div className="p-6 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-text-secondary mb-2">
                            MOQ Progress: {group.totalItems}/{group.moq} items
                          </p>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                group.moqStatus === 'met' ? 'bg-success-green' :
                                group.moqStatus === 'warning' ? 'bg-warning-amber' :
                                'bg-error-red'
                              }`}
                              style={{ width: `${Math.min((group.totalItems / group.moq) * 100, 100)}%` }}
                            />
                          </div>
                          {group.moqStatus !== 'met' && (
                            <p className="text-sm text-warning-amber mt-2">
                              ⚠️ Add {group.moq - group.totalItems} more items to meet minimum order
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-text-secondary">Subtotal</p>
                          <p className="text-xl font-medium">£{group.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Summary */}
            <div>
              <Card>
                <CardContent>
                  <h3 className="text-xl font-medium mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    {brandGroups.map((group) => (
                      <div key={group.brandId} className="flex justify-between text-sm">
                        <span>{group.brandName} ({group.items.length} products)</span>
                        <span>£{group.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border-gray pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-medium">Total ({brandGroups.length} brands)</span>
                      <span className="text-2xl font-medium text-rose-gold">
                        £{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    
                    {!canCheckout && (
                      <p className="text-sm text-warning-amber mb-4">
                        ⚠️ Some brands do not meet minimum order requirements
                      </p>
                    )}
                    
                    <Button 
                      fullWidth 
                      disabled={!canCheckout}
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      fullWidth 
                      className="mt-3"
                      onClick={() => navigate('/brands')}
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