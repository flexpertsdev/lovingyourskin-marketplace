import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Container, Section, Grid } from '../components/layout'
import { Button, Select, Badge, Spinner, Card, CardContent } from '../components/ui'
import { ProductCard } from '../components/features/ProductCard'
import { HeroCarousel } from '../components/features/HeroCarousel'
import { brandService, productService } from '../services'
import { Brand, Product } from '../types'

export const BrandDetail: React.FC = () => {
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
      const brands = await brandService.getBrands()
      const brandData = brands.find(b => b.id === brandId)
      
      if (!brandData) {
        navigate('/brands')
        return
      }
      
      setBrand(brandData)
      
      // Load products for this brand
      const productsData = await productService.getProductsByBrand(brandId!)
      // Filter only products with isB2B flag (default to true for backward compatibility)
      const b2bProducts = productsData.filter(p => p.isB2B !== false)
      setProducts(b2bProducts)
    } catch (error) {
      console.error('Failed to load brand data:', error)
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
    
    // Sort with featured products always first
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => {
          // Featured products first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        break
      case 'price-low':
        filtered.sort((a, b) => {
          // Featured products first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          // Then sort by price
          const aPrice = a.price?.wholesale ?? a.price?.retail ?? a.retailPrice?.item ?? 0
          const bPrice = b.price?.wholesale ?? b.price?.retail ?? b.retailPrice?.item ?? 0
          return aPrice - bPrice
        })
        break
      case 'price-high':
        filtered.sort((a, b) => {
          // Featured products first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          // Then sort by price
          const aPrice = a.price?.wholesale ?? a.price?.retail ?? a.retailPrice?.item ?? 0
          const bPrice = b.price?.wholesale ?? b.price?.retail ?? b.retailPrice?.item ?? 0
          return bPrice - aPrice
        })
        break
      case 'newest':
        filtered.sort((a, b) => {
          // Featured products first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        // Reverse only the non-featured products
        const featuredProducts = filtered.filter(p => p.featured)
        const nonFeaturedProducts = filtered.filter(p => !p.featured).reverse()
        filtered = [...featuredProducts, ...nonFeaturedProducts]
        break
    }
    
    setFilteredProducts(filtered)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="large" />
      </div>
    )
  }
  
  if (!brand) {
    return null
  }
  
  return (
    <Layout>
      {/* Brand Header */}
      <Section background="pink" className="text-center">
        <Container>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => navigate('/brands')}
            className="mb-6"
          >
            ← Back to Brands
          </Button>
          
          <div className="max-w-3xl mx-auto">
            {brand.logo && (
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="h-20 mx-auto mb-6 object-contain"
              />
            )}
            <p className="text-xl text-text-secondary mb-6">
              {brand.description}
            </p>
            
            {/* Brand Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-medium text-rose-gold">{brand.productCount}</div>
                <div className="text-sm text-text-secondary">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-rose-gold">{brand.minimumOrder}</div>
                <div className="text-sm text-text-secondary">Min. Order</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-rose-gold">{brand.country}</div>
                <div className="text-sm text-text-secondary">Origin</div>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="flex flex-wrap justify-center gap-2">
              {brand.certifications?.map((cert, index) => (
                <Badge key={index} variant="success">
                  {cert} Certified
                </Badge>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Hero Carousel */}
      {(brand.heroImages && brand.heroImages.length > 0) && (
        <HeroCarousel
          images={brand.heroImages}
          alt={brand.name}
        />
      )}
      
      {/* Brand Story */}
      {brand.story && (
        <Section background="white">
          <Container size="md">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-light text-deep-charcoal mb-4">Brand Story</h2>
                <div className="text-text-secondary leading-relaxed">
                  {brand.story}
                </div>
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
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(cat => ({ value: cat, label: cat }))
                ]}
                className="w-full sm:w-48"
              />
              
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
                <ProductCard key={product.id} product={product} />
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