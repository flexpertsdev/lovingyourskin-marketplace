import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Container, Section, Grid } from '../components/layout'
import { Button, Select, Badge, Spinner, Card, CardContent } from '../components/ui'
import { HeroCarousel } from '../components/features/HeroCarousel'
import { productService } from '../services'
import { Brand, Product } from '../types'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'

// Consumer Product Card Component
const ConsumerProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useConsumerCartStore()
  const navigate = useNavigate()
  
  const productName = typeof product.name === 'object' ? product.name.en : product.name
  const productDescription = typeof product.description === 'object' ? product.description.en : product.description
  const productPrice = product.retailPrice?.item || product.price?.retail || 0
  
  const handleAddToCart = () => {
    addItem(product, 1)
    toast.success(`${productName} added to cart`)
  }
  
  return (
    <Card className="group overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => navigate(`/consumer/products/${product.id}`)}
        />
        {product.preOrderEnabled && (
          <Badge variant="primary" className="absolute top-4 left-4">
            Pre-order
          </Badge>
        )}
      </div>
      
      <CardContent className="flex-1 flex flex-col">
        <h3 
          className="font-medium text-deep-charcoal mb-2 hover:text-rose-gold transition-colors cursor-pointer"
          onClick={() => navigate(`/consumer/products/${product.id}`)}
        >
          {productName}
        </h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2 flex-1">
          {productDescription}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl font-light text-rose-gold">
              £{productPrice.toFixed(2)}
            </span>
            {product.volume && (
              <span className="text-sm text-text-secondary">
                {product.volume}
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleAddToCart}
            size="small" 
            fullWidth
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const ConsumerBrandDetail: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>()
  const navigate = useNavigate()
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('popular')
  const [filterCategory, setFilterCategory] = useState('all')
  
  // Get unique categories from products
  const categories = Array.from(
    new Set(products.map(product => product.category))
  ).sort()
  
  useEffect(() => {
    if (brandId) {
      loadBrandData()
    }
  }, [brandId])
  
  useEffect(() => {
    filterAndSortProducts()
  }, [products, sortBy, filterCategory])
  
  const loadBrandData = async () => {
    try {
      setIsLoading(true)
      
      // Load brand details
      const brandData = await productService.getBrand(brandId!)
      
      if (!brandData) {
        navigate('/consumer/brands')
        return
      }
      
      setBrand(brandData)
      
      // Load products for this brand
      const allProducts = await productService.getAll()
      const brandProducts = allProducts.filter(p => p.brandId === brandId)
      
      // Filter only retail products
      const retailProducts = brandProducts.filter(p => {
        const hasRetailPrice = p.retailPrice && p.retailPrice.item > 0
        const hasPrice = p.price && (p.price.retail > 0 || p.price.wholesale > 0)
        return hasRetailPrice || hasPrice
      })
      
      setProducts(retailProducts)
    } catch (error) {
      console.error('Failed to load brand data:', error)
      toast.error('Failed to load brand information')
    } finally {
      setIsLoading(false)
    }
  }
  
  const filterAndSortProducts = () => {
    let filtered = [...products]
    
    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory)
    }
    
    // Sort
    switch (sortBy) {
      case 'popular':
        // In a real app, this would be sorted by sales/popularity
        break
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.retailPrice?.item || a.price?.retail || 0
          const priceB = b.retailPrice?.item || b.price?.retail || 0
          return priceA - priceB
        })
        break
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.retailPrice?.item || a.price?.retail || 0
          const priceB = b.retailPrice?.item || b.price?.retail || 0
          return priceB - priceA
        })
        break
      case 'newest':
        // In a real app, this would use creation date
        filtered.reverse()
        break
    }
    
    setFilteredProducts(filtered)
  }
  
  if (isLoading) {
    return (
      <Layout mode="consumer">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="large" />
        </div>
      </Layout>
    )
  }
  
  if (!brand) {
    return null
  }
  
  const brandName = typeof brand.name === 'object' ? brand.name.en : brand.name
  const brandDescription = typeof brand.description === 'object' ? brand.description.en : brand.description
  const brandStory = brand.story && (typeof brand.story === 'object' ? brand.story.en : brand.story)
  
  return (
    <Layout mode="consumer">
      {/* Brand Header */}
      <Section background="pink" className="text-center">
        <Container>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => navigate('/consumer/brands')}
            className="mb-6"
          >
            ← Back to Brands
          </Button>
          
          <div className="max-w-3xl mx-auto">
            {brand.logo && (
              <img 
                src={brand.logo} 
                alt={brandName}
                className="h-20 mx-auto mb-6 object-contain"
              />
            )}
            <h1 className="text-3xl md:text-4xl font-light text-deep-charcoal mb-4">
              {brandName}
            </h1>
            <p className="text-xl text-text-secondary mb-6">
              {brandDescription}
            </p>
            
            {/* Brand Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {brand.featureTags?.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Certifications */}
            {brand.certifications && brand.certifications.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {brand.certifications.map((cert, index) => (
                  <Badge key={index} variant="success">
                    {cert} Certified
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Hero Images */}
      {brand.heroImage && (
        <div className="relative h-96 overflow-hidden">
          <img 
            src={brand.heroImage} 
            alt={brandName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Brand Story */}
      {brandStory && (
        <Section background="white">
          <Container size="md">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-light text-deep-charcoal mb-4">Brand Story</h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {brandStory}
                </p>
              </CardContent>
            </Card>
          </Container>
        </Section>
      )}
      
      {/* Products Section */}
      <Section>
        <Container>
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-light text-deep-charcoal">
              All Products ({filteredProducts.length})
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {categories.length > 1 && (
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  className="w-full sm:w-48"
                />
              )}
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'popular', label: 'Sort by: Popular' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'newest', label: 'Newest First' }
                ]}
                className="w-full sm:w-48"
              />
            </div>
          </div>
          
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <Grid cols={4} gap="md">
              {filteredProducts.map(product => (
                <ConsumerProductCard key={product.id} product={product} />
              ))}
            </Grid>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">No products found in this category.</p>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}