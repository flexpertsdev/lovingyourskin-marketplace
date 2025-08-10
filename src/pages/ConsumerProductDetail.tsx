import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase/config'
import { Product } from '../types'
import { Layout, Container } from '../components/layout'
import { Button } from '../components/ui/Button'

import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'
import { getProductPrimaryImage, getProductImageGallery } from '../utils/product-helpers'
import { formatCurrency } from '../utils/currency'

// Icon components
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
// formatCurrency is now imported from utils/currency

export const ConsumerProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { addItem } = useConsumerCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'usage'>('description')
  
  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId])
  
  const loadProduct = async (id: string) => {
    try {
      setLoading(true)
      const productDoc = await getDoc(doc(db, 'products', id))
      
      if (!productDoc.exists()) {
        setError('Product not found')
        return
      }
      
      const data = productDoc.data()
      const product = { id: productDoc.id, ...data } as Product
      
      // Check if product has B2C-enabled variants
      const b2cVariants = product.variants?.filter(v => v.pricing?.b2c?.enabled) || []
      
      if (b2cVariants.length === 0) {
        setError('Product not available for retail purchase')
        return
      }
      
      setProduct(product)
      
      // Set the default selected variant to the first B2C-enabled one
      const defaultVariantIndex = product.variants?.findIndex(v => v.pricing?.b2c?.enabled) || 0
      setSelectedVariantIndex(defaultVariantIndex)
    } catch (err) {
      console.error('Failed to load product:', err)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddToCart = () => {
    if (!product || !product.variants) return
    
    const selectedVariant = product.variants[selectedVariantIndex]
    if (!selectedVariant || !selectedVariant.pricing?.b2c?.enabled) {
      toast.error('This variant is not available for retail purchase')
      return
    }
    
    const productName = product.name || 'Product'
    
    // Use the same pattern as ConsumerShop and ConsumerBrandDetail
    addItem({
      productId: product.id,
      productName: productName,
      variantId: selectedVariant.variantId,
      price: selectedVariant.pricing.b2c.retailPrice || 0,
      quantity: quantity,
      image: getProductPrimaryImage(product) || '',
      brandId: product.brandId
    })
    
    toast.success(`${productName} added to cart`)
  }
  
  const handleQuantityChange = (delta: number) => {
    if (!product || !product.variants) return
    
    const selectedVariant = product.variants[selectedVariantIndex]
    const maxQuantity = selectedVariant?.inventory?.b2c?.available || 99
    
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }
  
  // const handleWishlistToggle = async () => {
  //   // Wishlist feature not implemented yet
  //   toast.info('Wishlist feature coming soon!')
  // }
  
  const handleShare = async () => {
    if (navigator.share && product) {
      const productName = product.name || 'Product'
      const productDescription = product.description || ''
      
      try {
        await navigator.share({
          title: productName,
          text: productDescription,
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
            <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
          </div>
        </Container>
      </Layout>
    )
  }
  
  // Get selected variant info
  const selectedVariant = product.variants?.[selectedVariantIndex]
  const b2cPricing = selectedVariant?.pricing?.b2c
  const isInStock = (selectedVariant?.inventory?.b2c?.available || 0) > 0
  const isPreOrder = product.isPreorder
  const effectivePrice = b2cPricing?.retailPrice || 0
  const discountedPrice = isPreOrder && product.preorderDiscount 
    ? effectivePrice * (1 - product.preorderDiscount / 100)
    : effectivePrice
  
  // Get product name and description safely
  const productName = product.name || 'Product'
  const productDescription = product.description || ''
  const productNameKo = undefined // Remove Korean name support
  
  return (
    <Layout mode="consumer">
      <Container className="py-8">
        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeftIcon />
        <span>Back to Shop</span>
      </Link>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden">
            {getProductPrimaryImage(product) ? (
              <img
                src={
                  selectedImage === 0 
                    ? getProductPrimaryImage(product)
                    : getProductImageGallery(product)[selectedImage] || getProductPrimaryImage(product)
                }
                alt={productName}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center text-gray-400">
                <ShoppingBagIcon />
              </div>
            )}
          </div>
          {getProductImageGallery(product) && getProductImageGallery(product).length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {getProductImageGallery(product).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-rose-gold' : 'border-transparent'
                  } hover:border-rose-gold transition-colors`}
                >
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
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

              {product.isPreorder && <Badge variant="warning">Pre-order</Badge>}
            </div>
            <h1 className="text-3xl font-light mb-2">{productName}</h1>
            {productNameKo && (
              <p className="text-lg text-gray-600 mb-4">{productNameKo}</p>
            )}
          </div>
          
          {/* Variant Selection */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Select Variant:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => {
                  const isB2CEnabled = variant.pricing?.b2c?.enabled
                  const isAvailable = (variant.inventory?.b2c?.available || 0) > 0
                  
                  return (
                    <button
                      key={variant.variantId}
                      onClick={() => setSelectedVariantIndex(index)}
                      disabled={!isB2CEnabled || !isAvailable}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        selectedVariantIndex === index
                          ? 'border-rose-gold bg-rose-gold text-white'
                          : 'border-gray-300 hover:border-rose-gold'
                      } ${(!isB2CEnabled || !isAvailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {variant.colorHex && (
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        <span>{variant.color || variant.variantId}</span>
                        {variant.size && <span>• {variant.size}{variant.sizeUnit || ''}</span>}
                      </div>
                      {!isAvailable && <span className="text-xs text-gray-500 block">Out of stock</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Price */}
          <div className="mb-6">
            {isPreOrder && product.preorderDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium text-rose-gold">
                  {formatCurrency(discountedPrice)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(effectivePrice)}
                </span>
                <Badge variant="success">{product.preorderDiscount}% OFF</Badge>
              </div>
            ) : (
              <span className="text-3xl font-medium text-rose-gold">
                {formatCurrency(effectivePrice)}
              </span>
            )}
            <p className="text-sm text-gray-500 mt-1">VAT included</p>

          </div>
          
          {/* Short Description */}
          <p className="text-gray-700 mb-6">{productDescription}</p>
          
          {/* Selected Variant Info - only show if multiple variants */}
          {selectedVariant && product.variants && product.variants.length > 1 && (
            <div className="mb-6 p-4 bg-soft-pink rounded-lg">
              <h3 className="text-sm font-medium mb-2">Selected Variant:</h3>
              <div className="text-sm text-text-secondary space-y-1">
                {selectedVariant.color && <p>Color: {selectedVariant.color}</p>}
                {selectedVariant.size && <p>Size: {selectedVariant.size}{selectedVariant.sizeUnit || ''}</p>}
                <p>SKU: {selectedVariant.sku}</p>
                <p className="font-medium text-text-primary">Stock: {selectedVariant.inventory?.b2c?.available || 0} available</p>
              </div>
            </div>
          )}
          
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
                  disabled={quantity >= (selectedVariant?.inventory?.b2c?.available || 99)}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <PlusIcon />
                </button>
              </div>
              {isInStock && selectedVariant && (
                <span className="text-sm text-gray-500">
                  {selectedVariant.inventory?.b2c?.available} in stock
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
            
            {/* Share Button */}
            <Button
              variant="secondary"
              onClick={handleShare}
              className="flex items-center justify-center gap-2"
              fullWidth
            >
              <ShareIcon />
              Share
            </Button>
          </div>
          

          
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
      <div className="mt-12 bg-white rounded-lg shadow-sm">
        <div className="border-b border-border-gray">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-4 px-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'description'
                  ? 'text-rose-gold border-rose-gold'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`py-4 px-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'ingredients'
                  ? 'text-rose-gold border-rose-gold'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-4 px-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'usage'
                  ? 'text-rose-gold border-rose-gold'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              How to Use
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-text-secondary leading-relaxed">{productDescription}</p>
            </div>
          )}
          
          {activeTab === 'ingredients' && (
            <div>
              <h3 className="font-medium text-deep-charcoal mb-4">Full Ingredients</h3>
              <p className="text-sm text-text-secondary">
                {product.ingredients || 'Ingredients information not available'}
              </p>

            </div>
          )}
          
          {activeTab === 'usage' && (
            <div>
              <h3 className="font-medium text-deep-charcoal mb-4">How to Use</h3>
              <p className="text-text-secondary">
                Apply an appropriate amount to clean skin. Gently massage until fully absorbed. Use morning and evening for best results.
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
          <p className="text-sm mt-2">Free Shipping</p>
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