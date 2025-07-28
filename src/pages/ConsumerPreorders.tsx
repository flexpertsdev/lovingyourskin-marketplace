import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/layout'
import { Card, CardContent, Badge, Button } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { productService } from '../services'
import { Product } from '../types'
import { ConsumerNav } from './ConsumerShop'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'

// Countdown Timer Component
const CountdownTimer: React.FC<{ endDate: string }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const distance = end - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex gap-2 text-center">
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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useConsumerCartStore()

  useEffect(() => {
    loadPreorderProducts()
  }, [])

  const loadPreorderProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await productService.getAll()
      // Filter only pre-order enabled products with retail pricing
      const preorderProducts = allProducts.filter(p => 
        p.preOrderEnabled && 
        p.retailPrice && 
        p.retailPrice.item > 0
      )
      setProducts(preorderProducts)
    } catch (error) {
      console.error('Failed to load pre-order products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreorder = (product: Product) => {
    addItem(product, 1)
    toast.success(`${product.name.en} added to cart for pre-order`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-pink">
        <ConsumerNav />
        <div className="flex justify-center items-center h-96">
          <Spinner size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-pink">
      <ConsumerNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-gold to-rose-gold-dark text-white py-12 md:py-20">
        <Container>
          <div className="text-center">
            <Badge variant="secondary" className="bg-white/20 text-white mb-4">
              LIMITED TIME
            </Badge>
            <h1 className="text-3xl md:text-5xl font-light mb-4">
              Exclusive Pre-Orders
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Be the first to get these upcoming K-beauty essentials. 
              Secure your favorites before they sell out!
            </p>
            
            {/* Featured Countdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <p className="text-sm uppercase tracking-wider mb-4">Pre-order ends in</p>
              <CountdownTimer endDate="2024-02-15T00:00:00" />
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="font-medium text-deep-charcoal mb-2">Exclusive Access</h3>
              <p className="text-sm text-text-secondary">Get products before anyone else</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-medium text-deep-charcoal mb-2">Special Pricing</h3>
              <p className="text-sm text-text-secondary">Pre-order discounts up to 20% off</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-medium text-deep-charcoal mb-2">Priority Shipping</h3>
              <p className="text-sm text-text-secondary">First to ship when stock arrives</p>
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
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="relative">
                    <Link to={`/consumer/products/${product.id}`}>
                      <img 
                        src={product.image} 
                        alt={product.name.en}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Pre-order Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-rose-gold text-white">
                        PRE-ORDER
                      </Badge>
                    </div>
                    
                    {/* Discount Badge */}
                    {product.preOrderPrice && product.retailPrice && 
                     product.preOrderPrice < product.retailPrice.item && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          {Math.round((1 - product.preOrderPrice / product.retailPrice.item) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                      {product.brandId}
                    </p>
                    <Link to={`/consumer/products/${product.id}`}>
                      <h3 className="font-medium text-deep-charcoal mb-2 hover:text-rose-gold transition-colors">
                        {product.name.en}
                      </h3>
                    </Link>
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                      {product.description.en}
                    </p>
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      {product.preOrderPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-light text-rose-gold">
                            £{product.preOrderPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-text-secondary line-through">
                            £{product.retailPrice?.item.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-light text-rose-gold">
                          £{product.retailPrice?.item.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Expected Date */}
                    <p className="text-sm text-text-secondary mb-4">
                      Expected: March 2024
                    </p>
                    
                    <Button
                      onClick={() => handlePreorder(product)}
                      className="w-full"
                    >
                      Pre-order Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg mb-4">
                No pre-order products available at the moment.
              </p>
              <Link to="/consumer/shop">
                <Button variant="secondary">
                  Shop Available Products
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </section>

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
                Pre-order items typically ship within 2-4 weeks. You'll receive an email notification when your order ships.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">Can I cancel my pre-order?</h3>
              <p className="text-text-secondary">
                Yes, you can cancel your pre-order anytime before it ships for a full refund.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">Will I be charged immediately?</h3>
              <p className="text-text-secondary">
                Payment is processed at checkout to secure your pre-order and guarantee the special pricing.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-deep-charcoal mb-2">What if the item sells out?</h3>
              <p className="text-text-secondary">
                Pre-ordering guarantees you'll receive the product. Once pre-orders close, availability is limited.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}