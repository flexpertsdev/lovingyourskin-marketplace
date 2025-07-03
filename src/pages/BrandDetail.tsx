import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Container, Section, Grid } from '../components/layout'
import { Button, Select, Badge, Spinner, Card, CardContent } from '../components/ui'
import { ProductCard } from '../components/features/ProductCard'
import { HeroCarousel } from '../components/features/HeroCarousel'
import { productService } from '../services/mock/product.service'
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
      const brands = await productService.getBrands()
      const brandData = brands.find(b => b.id === brandId)
      
      if (!brandData) {
        navigate('/brands')
        return
      }
      
      setBrand(brandData)
      
      // Load products for this brand
      const productsData = await productService.getProductsByBrand(brandId!)
      setProducts(productsData)
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
    
    // Sort
    switch (sortBy) {
      case 'popular':
        // In a real app, this would be sorted by sales/popularity
        break
      case 'price-low':
        filtered.sort((a, b) => a.price.item - b.price.item)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price.item - a.price.item)
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
                alt={brand.name.en}
                className="h-20 mx-auto mb-6 object-contain"
              />
            )}
            <p className="text-xl text-text-secondary mb-6">
              {brand.description.en}
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
          alt={brand.name.en}
        />
      )}
      
      {/* Brand Story */}
      {brand.story && (
        <Section background="white">
          <Container size="md">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-light text-deep-charcoal mb-4">Brand Story</h2>
                <p className="text-text-secondary leading-relaxed">
                  {brand.story.en}
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