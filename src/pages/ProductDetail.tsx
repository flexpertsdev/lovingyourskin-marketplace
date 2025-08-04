import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Layout, Container, Section, Grid } from '../components/layout'
import { Button, Badge, Spinner, Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { productService, cartService } from '../services'
import { useCartStore } from '../stores/cart.store'
import { Product, Brand } from '../types'

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { refreshCart } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [brand, setBrand] = useState<Brand | null>(null)
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
      const brands = await productService.getBrands()
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
      await cartService.addToCart(product, quantity * (product.itemsPerCarton || 1))
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
    const currency = product?.price?.currency || 'GBP'
    const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'en-EU' : 'en-GB'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(price)
  }
  
  // Helper to get item price from different structures
  const getItemPrice = () => {
    if (!product) return 0
    // Check for wholesale price
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
    return itemPrice * (product.itemsPerCarton || 1)
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
                {brand.name.en}
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
                  {brand.name.en}
                </Link>
              )}
              <h1 className="text-3xl font-light text-deep-charcoal mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-text-secondary">{product.volume}</p>
            </div>
            
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
            
            {/* Ingredients */}
            {product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
              <div>
                <h3 className="font-medium text-deep-charcoal mb-2">Key Ingredients</h3>
                <p className="text-text-secondary">
                  {product.ingredients.join(', ')}
                </p>
              </div>
            )}
            
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
                {product.retailPrice && (
                  <div className="pt-4 border-t border-border-gray">
                    <p className="text-sm text-text-secondary mb-1">Recommended Retail Price</p>
                    <p className="text-lg font-medium text-medium-gray">
                      {formatPrice(product.retailPrice?.item || 0)} per item
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-border-gray">
                  <p className="text-sm text-text-secondary mb-2">
                    • {product.itemsPerCarton || 1} items per carton
                  </p>
                  <p className="text-sm text-text-secondary mb-2">
                    • Minimum order: {product.moq || 1} items ({Math.ceil((product.moq || 1) / (product.itemsPerCarton || 1))} cartons)
                  </p>
                  <p className="text-sm text-text-secondary">
                    • Lead time: {product.leadTime}
                  </p>
                </div>
              </CardContent>
            </Card>
            
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
                      = {quantity * (product.itemsPerCarton || 1)} items
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