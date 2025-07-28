import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Section, Grid } from '../components/layout'
import { Button, Badge, Spinner, Card, CardContent } from '../components/ui'
import { HeroCarousel } from '../components/features/HeroCarousel'
import { productService } from '../services/mock/product.service'
import { Brand, Product } from '../types'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'

// Icon component
const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

export const BoutiqueCollection: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>()
  const navigate = useNavigate()
  const { addItem } = useConsumerCartStore()
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (brandId) {
      loadBrandData()
    }
  }, [brandId])
  
  const loadBrandData = async () => {
    try {
      setIsLoading(true)
      
      // Load brand details
      const brandData = await productService.getBrand(brandId!)
      
      if (!brandData) {
        navigate('/shop')
        return
      }
      
      setBrand(brandData)
      
      // Load products for this brand - only retail enabled ones
      const allProducts = await productService.getProductsByBrand(brandId!)
      const retailProducts = allProducts.filter(p => p.retailPrice && p.retailPrice.item > 0)
      setProducts(retailProducts)
    } catch (error) {
      console.error('Failed to load brand data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    toast.success(`${product.name.en} added to cart`)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-pink flex items-center justify-center">
        <Spinner size="large" />
      </div>
    )
  }
  
  if (!brand) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-soft-pink">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link to="/shop" className="flex items-center gap-2 text-deep-charcoal hover:text-rose-gold transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shop
            </Link>
            
            <Link to="/consumer-cart" className="flex items-center gap-2 text-deep-charcoal hover:text-rose-gold transition-colors">
              <ShoppingBagIcon />
              <span>Cart</span>
            </Link>
          </div>
        </Container>
      </div>

      {/* Brand Header */}
      <Section background="white" className="text-center py-12">
        <Container>
          <div className="max-w-3xl mx-auto">
            {brand.logo && (
              <img 
                src={brand.logo} 
                alt={brand.name.en}
                className="h-24 mx-auto mb-6 object-contain"
              />
            )}
            <h1 className="text-4xl font-light text-deep-charcoal mb-4">
              {brand.name.en}
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              {brand.description.en}
            </p>
            
            {/* Brand Features */}
            {brand.featureTags && brand.featureTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {brand.featureTags.map((tag, index) => (
                  <Badge key={index} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
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

      {/* Hero Carousel */}
      {brand.heroImages && brand.heroImages.length > 0 && (
        <HeroCarousel
          images={brand.heroImages}
          alt={brand.name.en}
        />
      )}
      
      {/* Brand Story */}
      {brand.story && (
        <Section background="pink">
          <Container size="md">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-light text-deep-charcoal mb-6 text-center">Our Story</h2>
                <p className="text-text-secondary leading-relaxed text-lg">
                  {brand.story.en}
                </p>
              </CardContent>
            </Card>
          </Container>
        </Section>
      )}
      
      {/* Products Section */}
      <Section background="white">
        <Container>
          <h2 className="text-3xl font-light text-deep-charcoal text-center mb-12">
            Shop the Collection
          </h2>
          
          {/* Products Grid */}
          {products.length > 0 ? (
            <Grid cols={3} gap="lg">
              {products.map(product => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300">
                  <Link to={`/shop/products/${product.id}`}>
                    <div className="relative overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name.en}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.preOrderEnabled && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-4 right-4"
                        >
                          Pre-order
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-6">
                    <Link to={`/shop/products/${product.id}`}>
                      <h3 className="text-lg font-medium text-deep-charcoal mb-2 hover:text-rose-gold transition-colors">
                        {product.name.en}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                      {product.description.en}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-light text-rose-gold">
                          £{product.retailPrice?.item.toFixed(2)}
                        </span>
                        {product.volume && (
                          <span className="text-sm text-text-secondary ml-2">
                            {product.volume}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full"
                      disabled={product.retailQuantity === 0 && !product.preOrderEnabled}
                    >
                      {product.preOrderEnabled ? 'Pre-order' : 
                       product.retailQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">
                No products available for retail at this time.
              </p>
              <Link to="/shop">
                <Button variant="secondary" className="mt-4">
                  Browse All Products
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </Section>

      {/* Call to Action */}
      <Section background="pink" className="text-center">
        <Container>
          <h3 className="text-2xl font-light text-deep-charcoal mb-4">
            Love {brand.name.en}?
          </h3>
          <p className="text-text-secondary mb-6">
            Explore more premium K-beauty brands in our boutique
          </p>
          <Link to="/shop">
            <Button size="large">
              Discover More Brands
            </Button>
          </Link>
        </Container>
      </Section>
    </div>
  )
}