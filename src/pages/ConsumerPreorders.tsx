import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout, Container } from '../components/layout'
import { Card, CardContent, Badge, Button } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { productService, preorderService } from '../services'
import { Product } from '../types'
import { PreorderCampaign } from '../types/preorder'
import { usePreorderStore } from '../stores/preorder.store'
import { getProductPrice, calculateDiscountedPrice as calculateDiscount, formatPrice, calculateSavings } from '../lib/utils/pricing'
import toast from 'react-hot-toast'

// Countdown Timer Component
const CountdownTimer: React.FC<{ endDate: any }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = endDate.toDate ? endDate.toDate().getTime() : new Date(endDate).getTime()
      const distance = end - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex gap-2 text-center justify-center">
      <div className="bg-white rounded-lg p-2 md:p-3 min-w-[50px]">
        <div className="text-lg md:text-2xl font-bold text-rose-gold">{timeLeft.days}</div>
        <div className="text-xs text-text-secondary">Days</div>
      </div>
      <div className="bg-white rounded-lg p-2 md:p-3 min-w-[50px]">
        <div className="text-lg md:text-2xl font-bold text-rose-gold">{timeLeft.hours}</div>
        <div className="text-xs text-text-secondary">Hours</div>
      </div>
      <div className="bg-white rounded-lg p-2 md:p-3 min-w-[50px]">
        <div className="text-lg md:text-2xl font-bold text-rose-gold">{timeLeft.minutes}</div>
        <div className="text-xs text-text-secondary">Mins</div>
      </div>
      <div className="bg-white rounded-lg p-2 md:p-3 min-w-[50px]">
        <div className="text-lg md:text-2xl font-bold text-rose-gold">{timeLeft.seconds}</div>
        <div className="text-xs text-text-secondary">Secs</div>
      </div>
    </div>
  )
}

export const ConsumerPreorders: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<PreorderCampaign | null>(null)
  const { 
    addToPreorderCart, 
    preorderItems, 
    getTotalWithDiscount, 
    getItemCount,
    fetchActiveCampaign,
    activeCampaign 
  } = usePreorderStore()

  useEffect(() => {
    loadPreorderData()
  }, [])

  const loadPreorderData = async () => {
    try {
      setLoading(true)
      
      // Fetch active campaign
      await fetchActiveCampaign()
      const activeCampaign = await preorderService.getActiveCampaign()
      setCampaign(activeCampaign)
      
      if (activeCampaign) {
        // Load all products
        const allProducts = await productService.getAll()
        
        let campaignProducts: Product[] = []
        
        // If specific products are selected in campaign, use only those (trust admin selection)
        if (activeCampaign.availableProducts && activeCampaign.availableProducts.length > 0) {
          // Admin has explicitly selected products - show exactly those
          campaignProducts = allProducts.filter(p => 
            activeCampaign.availableProducts.includes(p.id)
          )
        } else {
          // No specific products selected - show all B2C products with valid pricing
          campaignProducts = allProducts.filter(p => 
            p.isB2C !== false &&
            ((p.retailPrice?.item && p.retailPrice.item > 0) || p.variants?.[0]?.pricing?.b2c?.retailPrice > 0)
          )
        }
        
        setProducts(campaignProducts)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to load pre-order data:', error)
      toast.error('Failed to load pre-order campaign')
    } finally {
      setLoading(false)
    }
  }

  const handlePreorder = (product: Product) => {
    if (!campaign) {
      toast.error('No active pre-order campaign')
      return
    }
    
    addToPreorderCart(product.id, product, 1)
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


  if (loading) {
    return (
      <Layout mode="consumer">
        <div className="flex justify-center items-center h-96">
          <Spinner size="large" />
        </div>
      </Layout>
    )
  }

  if (!campaign) {
    return (
      <Layout mode="consumer">
        <section className="py-20">
          <Container>
            <div className="text-center">
              <div className="w-24 h-24 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📅</span>
              </div>
              <h1 className="text-3xl font-light mb-4">No Active Pre-order Campaign</h1>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                There are no pre-order campaigns running at the moment. 
                Check back soon for exclusive early access to new products!
              </p>
              <Link to="/shop">
                <Button variant="primary" size="large">
                  Shop Available Products
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      </Layout>
    )
  }

  return (
    <Layout mode="consumer">
      {/* Hero Section with Campaign Info */}
      <section className="bg-gradient-to-br from-rose-gold to-rose-gold-dark text-white py-12 md:py-20">
        <Container>
          <div className="text-center">
            <Badge variant="info" className="bg-white/20 text-white mb-4">
              {campaign.discountPercentage}% OFF PRE-ORDER SPECIAL
            </Badge>
            <h1 className="text-3xl md:text-5xl font-light mb-4">
              {campaign.name}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Exclusive pre-order pricing on selected K-beauty products. 
              Order now and receive your items in {campaign.deliveryTimeframe}!
            </p>
            
            {/* Campaign Countdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <p className="text-sm uppercase tracking-wider mb-4">Campaign ends in</p>
              <CountdownTimer endDate={campaign.endDate} />
              <p className="text-sm mt-4 opacity-90">
                Pre-order processing date: {formatDate(campaign.preorderDate)}
              </p>
            </div>

            {/* Pre-order Cart Info */}
            {getItemCount() > 0 && (
              <div className="mt-6">
                <p className="text-sm mb-2">
                  {getItemCount()} items in pre-order cart
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/shop/preorder-checkout')}
                  className="bg-white text-rose-gold hover:bg-white/90"
                >
                  Go to Pre-order Checkout (${getTotalWithDiscount().toFixed(2)})
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-medium text-deep-charcoal mb-2">
                {campaign.discountPercentage}% Discount
              </h3>
              <p className="text-sm text-text-secondary">
                Exclusive pre-order pricing on all campaign products
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-medium text-deep-charcoal mb-2">
                {campaign.deliveryTimeframe} Delivery
              </h3>
              <p className="text-sm text-text-secondary">
                Estimated delivery after {formatDate(campaign.preorderDate)}
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="font-medium text-deep-charcoal mb-2">First Access</h3>
              <p className="text-sm text-text-secondary">
                Get products before general availability
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Pre-order Products */}
      <section className="py-8 md:py-12">
        <Container>
          <h2 className="text-2xl md:text-3xl font-light text-deep-charcoal text-center mb-8">
            Available for Pre-order
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => {
                const isInCart = preorderItems.some(item => item.productId === product.id)
                const price = getProductPrice(product)
                const discountedPrice = calculateDiscount(price, campaign.discountPercentage)
                
                return (
                  <Card key={product.id} className="overflow-hidden group">
                    <div className="relative">
                      <Link to={`/shop/products/${product.id}`}>
                        <img 
                          src={product.images?.primary || '/placeholder-product.png'} 
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      
                      {/* Pre-order Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge variant="info" className="bg-rose-gold text-white">
                          PRE-ORDER
                        </Badge>
                      </div>
                      
                      {/* Discount Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="info" className="bg-success-green text-white">
                          {campaign.discountPercentage}% OFF
                        </Badge>
                      </div>

                      {/* In Cart Indicator */}
                      {isInCart && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                            <span className="text-sm font-medium text-success-green">
                              ✓ Added to Pre-order Cart
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                        {product.brandId}
                      </p>
                      <Link to={`/shop/products/${product.id}`}>
                        <h3 className="font-medium text-deep-charcoal mb-2 hover:text-rose-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Pricing */}
                      <div className="mb-4">
                        {price > 0 ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-light text-rose-gold">
                                {formatPrice(discountedPrice)}
                              </span>
                              <span className="text-sm text-text-secondary line-through">
                                {formatPrice(price)}
                              </span>
                            </div>
                            <p className="text-xs text-success-green mt-1">
                              Save {formatPrice(calculateSavings(price, discountedPrice))}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-text-secondary">Price not available</p>
                        )}
                      </div>
                      
                      {/* Expected Date */}
                      <p className="text-sm text-text-secondary mb-4">
                        Ships: {formatDate(campaign.preorderDate)}
                      </p>
                      
                      <Button
                        onClick={() => handlePreorder(product)}
                        className="w-full"
                        variant={isInCart ? "secondary" : "primary"}
                        disabled={price <= 0}
                      >
                        {price <= 0 ? 'Price Not Available' : isInCart ? 'Add Another' : 'Add to Pre-order Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg mb-4">
                No products available in this pre-order campaign.
              </p>
              <Link to="/shop">
                <Button variant="primary">
                  Shop Available Products
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* Pre-order Cart Summary */}
      {getItemCount() > 0 && (
        <section className="bg-soft-pink py-8">
          <Container>
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Pre-order Cart Summary</h3>
                      <p className="text-text-secondary">
                        {getItemCount()} items • Total savings: ${' '}
                        {preorderItems.reduce((total, item) => {
                          const originalPrice = item.pricePerItem * item.quantity
                          const discountedTotal = item.discountedPrice * item.quantity
                          return total + (originalPrice - discountedTotal)
                        }, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Total with discount</p>
                        <p className="text-2xl font-light text-rose-gold">
                          ${getTotalWithDiscount().toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="large"
                        onClick={() => navigate('/shop/preorder-checkout')}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      )}

      {/* FAQ Section */}
      <section className="bg-white py-12">
        <Container>
          <h2 className="text-2xl md:text-3xl font-light text-deep-charcoal text-center mb-8">
            Pre-order FAQs
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">When will I receive my pre-order?</h3>
              <p className="text-text-secondary">
                Pre-orders will be processed on {formatDate(campaign?.preorderDate)} and delivered within {campaign?.deliveryTimeframe}. 
                You'll receive tracking information once your order ships.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">Can I cancel my pre-order?</h3>
              <p className="text-text-secondary">
                Yes, you can cancel your pre-order anytime before the processing date ({formatDate(campaign?.preorderDate)}) for a full refund.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">Will I be charged immediately?</h3>
              <p className="text-text-secondary">
                Payment is processed at checkout to secure your pre-order and guarantee the {campaign?.discountPercentage}% discount.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">Can I combine pre-orders with regular products?</h3>
              <p className="text-text-secondary">
                Pre-orders are processed separately from regular orders. You'll need to checkout separately for pre-order items and regular items.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  )
}