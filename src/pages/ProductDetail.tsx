import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Layout, Container, Section, Grid } from '../components/layout'
import { Button, Badge, Spinner, Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { brandService, productService, cartService } from '../services'
import { useCartStore } from '../stores/cart.store'
import { Product, Brand } from '../types'

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { refreshCart } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<number>(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  useEffect(() => {
    if (productId) {
      loadProductData()
    }
  }, [productId])
  
  const loadProductData = async () => {
    try {
      setIsLoading(true)
      
      // Load product details
      const productData = await productService.getProduct(productId!)
      
      if (!productData) {
        navigate('/brands')
        return
      }
      
      setProduct(productData)
      
      // Load brand details
      const brands = await brandService.getBrands()
      const brandData = brands.find(b => b.id === productData.brandId)
      setBrand(brandData || null)
    } catch (error) {
      console.error('Failed to load product data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      setIsAdding(true)
      // Store quantity as cartons, not individual items
      await cartService.addToCart(product, quantity)
      await refreshCart()
      
      // Show success message or redirect to cart
      navigate('/cart')
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }
  
  const formatPrice = (price: number) => {
    // Always use USD as all prices are stored in USD
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }
  
  // Helper to get item price from different structures
  const getItemPrice = () => {
    if (!product) return 0
    // Check for variant-based B2B pricing first
    const variant = product.variants?.[selectedVariant]
    if (variant?.pricing?.b2b?.wholesalePrice !== undefined) {
      return variant.pricing.b2b.wholesalePrice
    }
    // Check for wholesale price (legacy)
    if (product.price?.wholesale !== undefined) {
      return product.price.wholesale
    }
    // Fallback to retail price
    if (product.price?.retail !== undefined) {
      return product.price.retail
    }
    // Legacy support
    if (product.retailPrice?.item !== undefined) {
      return product.retailPrice.item
    }
    return 0
  }
  
  // Helper to get carton price from different structures
  const getCartonPrice = () => {
    if (!product) return 0
    const itemPrice = getItemPrice()
    const variant = product.variants?.[selectedVariant]
    const unitsPerCarton = variant?.pricing?.b2b?.unitsPerCarton || product.itemsPerCarton || 1
    return itemPrice * unitsPerCarton
  }
  
  // Get units per carton for current variant
  const getUnitsPerCarton = () => {
    const variant = product?.variants?.[selectedVariant]
    return variant?.pricing?.b2b?.unitsPerCarton || product?.itemsPerCarton || 1
  }
  
  // Get recommended retail price
  const getRetailPrice = () => {
    const variant = product?.variants?.[selectedVariant]
    if (variant?.pricing?.b2b?.recommendedRetailPrice !== undefined) {
      return variant.pricing.b2b.recommendedRetailPrice
    }
    if (product?.retailPrice?.item !== undefined) {
      return product.retailPrice.item
    }
    return null
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="large" />
      </div>
    )
  }
  
  if (!product) {
    return null
  }
  
  return (
    <Layout>
      <Section className="py-8">
        <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link to="/brands" className="hover:text-rose-gold">Brands</Link>
          <span>/</span>
          {brand && (
            <>
              <Link to={`/brands/${brand.id}`} className="hover:text-rose-gold">
                {brand.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-text-primary">{product.name}</span>
        </div>
        
        <Grid cols={2} gap="lg">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-soft-pink rounded-lg flex items-center justify-center">
              {product.images?.primary ? (
                <img 
                  src={product.images.primary} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-6xl text-medium-gray">📦</div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images?.gallery && product.images.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.gallery.slice(0, 4).map((image: string, index: number) => (
                  <div 
                    key={index}
                    className="aspect-square bg-soft-pink rounded cursor-pointer hover:opacity-80"
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {brand && (
                <Link 
                  to={`/brands/${brand.id}`}
                  className="text-rose-gold hover:text-rose-gold-dark mb-2 inline-block"
                >
                  {brand.name}
                </Link>
              )}
              <h1 className="text-3xl font-light text-deep-charcoal mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-text-secondary">{product.volume}</p>
            </div>
            
            {/* Variants Selection */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <h3 className="font-medium text-deep-charcoal mb-2">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => {
                    const isAvailable = (variant.inventory?.b2b?.available || 0) > 0
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(index)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                          selectedVariant === index
                            ? 'border-rose-gold bg-rose-gold/10 text-rose-gold'
                            : 'border-border-gray hover:border-rose-gold'
                        } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {variant.colorHex && (
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        <span>
                          {variant.color || variant.variantId || `Variant ${index + 1}`}
                          {variant.size && ` • ${variant.size}${variant.sizeUnit || ''}`}
                        </span>
                        {!isAvailable && (
                          <span className="text-xs text-gray-500">(Out of stock)</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Stock Status */}
            <div>
              {product.stockLevel === 'in' && (
                <Badge variant="success">In Stock</Badge>
              )}
              {product.stockLevel === 'low' && (
                <Badge variant="warning">Low Stock</Badge>
              )}
              {product.stockLevel === 'out' && (
                <Badge variant="error">Out of Stock</Badge>
              )}
            </div>
            
            {/* Description */}
            <div>
              <h3 className="font-medium text-deep-charcoal mb-2">Description</h3>
              <p className="text-text-secondary leading-relaxed">
                {product.description}
              </p>
            </div>
            
            {/* Ingredients - Check variant first, then product level */}
            {(() => {
              const variant = product.variants?.[selectedVariant]
              const ingredients = variant?.ingredients || product.ingredients
              if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
                return (
                  <div>
                    <h3 className="font-medium text-deep-charcoal mb-2">Key Ingredients</h3>
                    <p className="text-text-secondary">
                      {ingredients.join(', ')}
                    </p>
                  </div>
                )
              }
              return null
            })()}
            
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Wholesale Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Price per Item</p>
                    <p className="text-2xl font-medium text-rose-gold">
                      {formatPrice(getItemPrice())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Price per Carton</p>
                    <p className="text-2xl font-medium text-deep-charcoal">
                      {formatPrice(getCartonPrice())}
                    </p>
                  </div>
                </div>
                
                {/* Retail Price - Only show if available */}
                {getRetailPrice() !== null && (
                  <div className="pt-4 border-t border-border-gray">
                    <p className="text-sm text-text-secondary mb-1">Recommended Retail Price</p>
                    <p className="text-lg font-medium text-medium-gray">
                      {formatPrice(getRetailPrice()!)} per item
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-border-gray">
                  <p className="text-sm text-text-secondary mb-2">
                    • {getUnitsPerCarton()} items per carton
                  </p>
                  <p className="text-sm text-text-secondary mb-2">
                    • Minimum order: {product.variants?.[selectedVariant]?.pricing?.b2b?.minOrderQuantity || product.moq || 1} items
                  </p>
                  {product.leadTime && (
                    <p className="text-sm text-text-secondary">
                      • Lead time: {product.leadTime}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Specifications Card */}
            {product.specifications && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Certifications */}
                  {product.specifications.certifications && product.specifications.certifications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {product.specifications.certifications.map((cert, index) => (
                          <Badge key={index} variant="success" size="small">
                            {cert.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Features */}
                  {product.specifications.features && product.specifications.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-2">Key Features</p>
                      <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                        {product.specifications.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Product Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border-gray">
                    {product.specifications.origin && (
                      <div>
                        <p className="text-xs text-text-secondary">Origin</p>
                        <p className="text-sm font-medium">{product.specifications.origin}</p>
                      </div>
                    )}
                    {product.specifications.pao && (
                      <div>
                        <p className="text-xs text-text-secondary">Period After Opening</p>
                        <p className="text-sm font-medium">{product.specifications.pao}</p>
                      </div>
                    )}
                    {product.specifications.keyIngredient && (
                      <div>
                        <p className="text-xs text-text-secondary">Key Ingredient</p>
                        <p className="text-sm font-medium">{product.specifications.keyIngredient}</p>
                      </div>
                    )}
                    {product.specifications.expiryDate && (
                      <div>
                        <p className="text-xs text-text-secondary">Expiry Date</p>
                        <p className="text-sm font-medium">{product.specifications.expiryDate}</p>
                      </div>
                    )}
                    {product.specifications.setContents && (
                      <div className="col-span-2">
                        <p className="text-xs text-text-secondary">Set Contents</p>
                        <p className="text-sm font-medium">{product.specifications.setContents}</p>
                      </div>
                    )}
                    {product.specifications.treatmentDuration && (
                      <div>
                        <p className="text-xs text-text-secondary">Treatment Duration</p>
                        <p className="text-sm font-medium">{product.specifications.treatmentDuration}</p>
                      </div>
                    )}
                    {product.specifications.spf && (
                      <div>
                        <p className="text-xs text-text-secondary">SPF</p>
                        <p className="text-sm font-medium">SPF {product.specifications.spf}</p>
                      </div>
                    )}
                    {product.specifications.paRating && (
                      <div>
                        <p className="text-xs text-text-secondary">PA Rating</p>
                        <p className="text-sm font-medium">{product.specifications.paRating}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Order Section */}
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Number of Cartons
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-border-gray hover:border-rose-gold flex items-center justify-center"
                      disabled={product.stockLevel === 'out'}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center px-3 py-2 border border-border-gray rounded-lg"
                      disabled={product.stockLevel === 'out'}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-border-gray hover:border-rose-gold flex items-center justify-center"
                      disabled={product.stockLevel === 'out'}
                    >
                      +
                    </button>
                    <span className="text-sm text-text-secondary">
                      = {quantity * getUnitsPerCarton()} items
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Price</p>
                    <p className="text-2xl font-medium text-deep-charcoal">
                      {formatPrice(quantity * getCartonPrice())}
                    </p>
                  </div>
                  <Button
                    size="large"
                    onClick={handleAddToCart}
                    loading={isAdding}
                    disabled={isAdding || product.stockLevel === 'out'}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Container>
    </Section>
    </Layout>
  )
}