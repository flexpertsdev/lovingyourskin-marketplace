import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { productService } from '../services'
import { Product } from '../types'
import { Layout, Container } from '../components/layout'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { useAuthStore } from '../stores/auth.store'
import { authService } from '../services'
import toast from 'react-hot-toast'

// Icon components
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0l-5.464 0" />
  </svg>
)

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const TruckIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)
}

export const ConsumerProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { addItem } = useConsumerCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'usage'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId])
  
  useEffect(() => {
    if (product && user?.wishlist) {
      setIsWishlisted(user.wishlist.includes(product.id))
    }
  }, [product, user])
  
  const loadProduct = async (id: string) => {
    try {
      setLoading(true)
      const data = await productService.getById(id)
      if (data && data.retailPrice && data.retailPrice.item > 0) {
        setProduct(data)
      } else {
        setError('Product not available for retail')
      }
    } catch (err) {
      console.error('Failed to load product:', err)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddToCart = () => {
    if (!product) return
    
    addItem(product, quantity)
    toast.success(`${typeof product.name === 'object' ? product.name.en : product.name} added to cart`)
  }
  
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (product?.retailQuantity || 99)) {
      setQuantity(newQuantity)
    }
  }
  
  const handleWishlistToggle = async () => {
    if (!user || !product) {
      navigate('/consumer/login', { state: { from: location } })
      return
    }
    
    if (user.role !== 'consumer') {
      toast.error('Only consumers can use wishlist')
      return
    }
    
    try {
      if (isWishlisted) {
        await authService.removeFromWishlist(user.id, product.id)
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await authService.addToWishlist(user.id, product.id)
        setIsWishlisted(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }
  
  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name.en,
          text: product.description.en,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled or share failed
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href)
          toast.success('Link copied to clipboard')
        }
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }
  
  if (loading) {
    return (
      <Layout mode="consumer">
        <Container className="py-12">
          <div className="flex justify-center">
            <Spinner size="large" />
          </div>
        </Container>
      </Layout>
    )
  }
  
  if (error || !product) {
    return (
      <Layout mode="consumer">
        <Container className="py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
            <Button onClick={() => navigate('/consumer/shop')}>Back to Shop</Button>
          </div>
        </Container>
      </Layout>
    )
  }
  
  const isInStock = product.retailQuantity && product.retailQuantity > 0
  const isPreOrder = product.preOrderEnabled
  const effectivePrice = product.retailPrice?.item || 0
  const discountedPrice = isPreOrder && product.preOrderDiscount 
    ? effectivePrice * (1 - product.preOrderDiscount / 100)
    : effectivePrice
  
  return (
    <Layout mode="consumer">
      <Container className="py-8">
        {/* Back Button */}
        <Link to="/consumer/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeftIcon />
        <span>Back to Shop</span>
      </Link>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name.en}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center text-gray-400">
                <ShoppingBagIcon />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-rose-gold' : 'border-transparent'
                  } hover:border-rose-gold transition-colors`}
                >
                  <img
                    src={image}
                    alt={`${product.name.en} ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">Brand: {product.brandId}</span>
              {product.isNew && <Badge variant="info">New</Badge>}
              {product.preOrderEnabled && <Badge variant="warning">Pre-order</Badge>}
            </div>
            <h1 className="text-3xl font-light mb-2">{product.name.en}</h1>
            {product.name.ko && (
              <p className="text-lg text-gray-600 mb-4">{product.name.ko}</p>
            )}
          </div>
          
          {/* Price */}
          <div className="mb-6">
            {isPreOrder && product.preOrderDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium text-rose-gold">
                  {formatCurrency(discountedPrice)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(effectivePrice)}
                </span>
                <Badge variant="success">{product.preOrderDiscount}% OFF</Badge>
              </div>
            ) : (
              <span className="text-3xl font-medium text-rose-gold">
                {formatCurrency(effectivePrice)}
              </span>
            )}
            <p className="text-sm text-gray-500 mt-1">VAT included</p>
            {isPreOrder && product.launchDate && (
              <p className="text-sm text-blue-600 mt-2">
                Expected delivery: {new Date(product.launchDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Short Description */}
          <p className="text-gray-700 mb-6">{product.description.en}</p>
          
          {/* Actions */}
          <div className="space-y-4 mb-6">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <MinusIcon />
                </button>
                <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.retailQuantity || 99)}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <PlusIcon />
                </button>
              </div>
              {isInStock && (
                <span className="text-sm text-gray-500">
                  {product.retailQuantity} in stock
                </span>
              )}
            </div>
            
            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              fullWidth
              size="large"
              disabled={!isInStock && !isPreOrder}
            >
              {isPreOrder ? 'Pre-order Now' : 
               !isInStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            
            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleWishlistToggle}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <HeartIcon filled={isWishlisted} />
                {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4"
              >
                <ShareIcon />
                Share
              </Button>
            </div>
          </div>
          
          {/* Key Benefits */}
          {product.keyBenefits && product.keyBenefits.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {product.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-rose-gold mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((cert, index) => (
                <Badge key={index} variant="default">{cert}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed Information Tabs */}
      <div className="mt-12">
        <div className="border-b">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'description'
                  ? 'text-rose-gold border-b-2 border-rose-gold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'text-rose-gold border-b-2 border-rose-gold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'usage'
                  ? 'text-rose-gold border-b-2 border-rose-gold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              How to Use
            </button>
          </div>
        </div>
        
        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700">{product.description.en}</p>
            </div>
          )}
          
          {activeTab === 'ingredients' && (
            <div>
              <h3 className="font-medium mb-4">Full Ingredients</h3>
              <p className="text-sm text-gray-700">{product.ingredients}</p>
            </div>
          )}
          
          {activeTab === 'usage' && (
            <div>
              <h3 className="font-medium mb-4">How to Use</h3>
              <p className="text-gray-700">
                Apply an appropriate amount to clean skin. Gently massage until fully absorbed.
                Use morning and evening for best results.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="grid grid-cols-3 gap-4 py-6 border-t mt-8">
        <div className="text-center">
          <ShieldIcon />
          <p className="text-sm mt-2">Authentic K-Beauty</p>
        </div>
        <div className="text-center">
          <TruckIcon />
          <p className="text-sm mt-2">Free Shipping over £50</p>
        </div>
        <div className="text-center">
          <RefreshIcon />
          <p className="text-sm mt-2">30-Day Returns</p>
        </div>
      </div>
      </Container>
    </Layout>
  )
}