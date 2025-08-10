import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/layout'
import { Layout } from '../components/layout'
import { Button, Card, CardContent } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase/config'
import { Product, Brand } from '../types'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'
import { getLocalizedString } from '../lib/utils/cn'

// Icon components
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const HeartIcon = ({ filled = false }) => (
  <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

// Brand showcase component with infinite smooth scrolling
const BrandShowcase: React.FC<{ brands: Brand[] }> = ({ brands }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  
  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands, ...brands]

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement || isPaused) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame

    const animate = () => {
      if (!isPaused && scrollElement) {
        scrollPosition += scrollSpeed
        
        // Reset position when we've scrolled through one full set
        const oneSetWidth = scrollElement.scrollWidth / 3
        if (scrollPosition >= oneSetWidth) {
          scrollPosition = 0
          scrollElement.scrollLeft = 0
        }
        
        scrollElement.scrollLeft = scrollPosition
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPaused, brands.length])

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-light text-deep-charcoal mb-6 flex items-center gap-2">
        <SparkleIcon />
        Our Exclusive Partners
      </h2>
      
      <div className="relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedBrands.map((brand, index) => (
            <Link
              key={`${brand.id}-${index}`}
              to={`/consumer/brands/${brand.id}`}
              className="flex-shrink-0 w-48 bg-white rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              {brand.heroImage ? (
                <img 
                  src={brand.heroImage} 
                  alt={getLocalizedString(brand.name)}
                  className="w-full h-24 object-cover rounded mb-3 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-rose-gold/20 to-rose-gold/10 rounded mb-3 flex items-center justify-center">
                  <span className="text-2xl font-light text-rose-gold">
                    {getLocalizedString(brand.name).charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-sm font-medium text-deep-charcoal text-center">
                {getLocalizedString(brand.name)}
              </h3>
            </Link>
          ))}
        </div>
        
        {/* Gradient overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

// Enhanced filter component
const ShopFilters: React.FC<{
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedBrand: string
  onBrandChange: (brand: string) => void
  brands: string[]
  skinTypes: string[]
  selectedSkinType: string
  onSkinTypeChange: (type: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  showCertified: boolean
  onCertifiedChange: (show: boolean) => void
}> = ({ 
  categories, selectedCategory, onCategoryChange,
  selectedBrand, onBrandChange, brands,
  skinTypes, selectedSkinType, onSkinTypeChange,
  priceRange, onPriceRangeChange,
  showCertified, onCertifiedChange
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
      <h3 className="text-lg font-medium text-deep-charcoal mb-6 flex items-center gap-2">
        <FilterIcon />
        Refine Your Search
      </h3>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-charcoal mb-3">Categories</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="all"
              checked={selectedCategory === 'all'}
              onChange={() => onCategoryChange('all')}
              className="text-rose-gold focus:ring-rose-gold"
            />
            <span className="text-sm text-text-secondary">All Products</span>
          </label>
          {categories.map(category => (
            <label key={category} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="text-rose-gold focus:ring-rose-gold"
              />
              <span className="text-sm text-text-secondary capitalize">{category.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-charcoal mb-3">Brands</h4>
        <select
          value={selectedBrand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-rose-gold focus:border-rose-gold"
        >
          <option value="all">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Skin Type */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-charcoal mb-3">Skin Type</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="skinType"
              value="all"
              checked={selectedSkinType === 'all'}
              onChange={() => onSkinTypeChange('all')}
              className="text-rose-gold focus:ring-rose-gold"
            />
            <span className="text-sm text-text-secondary">All Skin Types</span>
          </label>
          {skinTypes.map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="skinType"
                value={type}
                checked={selectedSkinType === type}
                onChange={() => onSkinTypeChange(type)}
                className="text-rose-gold focus:ring-rose-gold"
              />
              <span className="text-sm text-text-secondary">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-charcoal mb-3">Price Range</h4>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-rose-gold focus:border-rose-gold"
          />
          <span className="self-center">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange[1] || ''}
            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-rose-gold focus:border-rose-gold"
          />
        </div>
        <div className="text-xs text-text-secondary">
          ${priceRange[0]} - ${priceRange[1] || '∞'}
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-deep-charcoal mb-3">Certifications</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showCertified}
            onChange={(e) => onCertifiedChange(e.target.checked)}
            className="text-rose-gold focus:ring-rose-gold rounded"
          />
          <span className="text-sm text-text-secondary">K-Beauty Certified Only</span>
        </label>
      </div>
    </div>
  )
}

// Main Shop Component
export const ConsumerShop: React.FC = () => {
  const { addItem } = useConsumerCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedSkinType, setSelectedSkinType] = useState('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showCertified, setShowCertified] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [wishlist, setWishlist] = useState<string[]>([])
  const toastIdRef = useRef<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load products from Firestore
      const productsQuery = query(
        collection(db, 'products'),
        where('status', '==', 'active')
      )
      const productsSnapshot = await getDocs(productsQuery)
      
      const fetchedProducts: Product[] = []
      productsSnapshot.forEach((doc) => {
        const data = doc.data()
        // Only include products with B2C pricing
        if (data.variants?.some((v: any) => v.pricing?.b2c?.enabled)) {
          fetchedProducts.push({ id: doc.id, ...data } as Product)
        }
      })
      
      // Load brands
      const brandsSnapshot = await getDocs(collection(db, 'brands'))
      const fetchedBrands: Brand[] = []
      brandsSnapshot.forEach((doc) => {
        fetchedBrands.push({ id: doc.id, ...doc.data() } as Brand)
      })
      
      setProducts(fetchedProducts)
      setBrands(fetchedBrands)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Get unique values for filters
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean).sort()
  const brandNames = Array.from(new Set(products.map(p => p.brandId))).filter(Boolean).sort()
  const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive']

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const name = (product.name || '').toLowerCase()
        const description = (product.description || '').toLowerCase()
        
        if (!name.includes(query) && !description.includes(query)) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false
      }

      // Brand filter
      if (selectedBrand !== 'all' && product.brandId !== selectedBrand) {
        return false
      }

      // Skin type filter
      if (selectedSkinType !== 'all' && !product.tags?.includes(selectedSkinType.toLowerCase())) {
        return false
      }

      // Price filter - get B2C price from variants
      const b2cVariant = product.variants?.find(v => v.pricing?.b2c?.enabled)
      const price = b2cVariant?.pricing?.b2c?.retailPrice || 0
      if (price < priceRange[0] || (priceRange[1] && price > priceRange[1])) {
        return false
      }

      // Certification filter
      if (showCertified && !product.specifications?.certifications?.length) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      const priceA = a.variants?.[0]?.pricing?.b2c?.retailPrice || 0
      const priceB = b.variants?.[0]?.pricing?.b2c?.retailPrice || 0
      
      switch (sortBy) {
        case 'price-low':
          return priceA - priceB
        case 'price-high':
          return priceB - priceA
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        default:
          return 0
      }
    })

  const handleAddToCart = (product: Product) => {
    const b2cVariant = product.variants?.[0]
    if (!b2cVariant) return

    addItem({
      productId: product.id,
      productName: product.name || 'Product',
      variantId: b2cVariant.variantId,
      price: b2cVariant.pricing?.b2c?.retailPrice || 0,
      quantity: 1,
      image: product.images?.primary || '',
      brandId: product.brandId
    })
    
    // Cancel previous toast if exists
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
    }
    
    // Show new toast and save its ID
    toastIdRef.current = toast.success(`${product.name || 'Product'} added to cart`, {
      duration: 2000,
      id: 'add-to-cart'
    })
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
    
    const isAdding = !wishlist.includes(productId)
    toast.success(isAdding ? 'Added to wishlist' : 'Removed from wishlist', {
      duration: 2000,
      id: 'wishlist-update'
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

  return (
    <Layout mode="consumer">
      {/* Hero Section with Beauty Focus */}
      <section className="relative bg-gradient-to-br from-rose-gold/10 via-soft-pink to-white py-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-soft-pink/30 rounded-full blur-3xl" />
        
        <Container className="relative">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal mb-4 tracking-tight">
              Discover Your Perfect K-Beauty Routine
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Authentic Korean skincare curated for radiant, healthy skin. 
              From cleansers to serums, find your glow.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search for your favorite K-beauty products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-gold shadow-sm"
              />
            </div>
          </div>

          {/* Beauty Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-rose-gold">✓</span> Cruelty-Free
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-rose-gold">✓</span> Natural Ingredients
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-rose-gold">✓</span> Dermatologist Tested
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-rose-gold">✓</span> K-Beauty Innovation
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        {/* Brand Showcase */}
        {brands.length > 0 && <BrandShowcase brands={brands} />}

        {/* Shop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ShopFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              brands={brandNames}
              skinTypes={skinTypes}
              selectedSkinType={selectedSkinType}
              onSkinTypeChange={setSelectedSkinType}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              showCertified={showCertified}
              onCertifiedChange={setShowCertified}
            />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {/* Sort and Results */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-text-secondary">
                {filteredProducts.length} products found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-rose-gold focus:border-rose-gold"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const b2cVariant = product.variants?.[0]
                  const price = b2cVariant?.pricing?.b2c?.retailPrice || 0
                  
                  return (
                    <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <Link to={`/consumer/products/${product.id}`}>
                          <div className="aspect-square overflow-hidden bg-gray-50">
                            <img 
                              src={product.images?.primary || '/placeholder.png'} 
                              alt={product.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.tags?.includes('bestseller') && (
                            <span className="bg-rose-gold text-white px-3 py-1 rounded-full text-xs">
                              Bestseller
                            </span>
                          )}
                          {product.tags?.includes('new') && (
                            <span className="bg-deep-charcoal text-white px-3 py-1 rounded-full text-xs">
                              New
                            </span>
                          )}
                        </div>
                        
                        {/* Wishlist */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-rose-gold hover:text-white transition-colors shadow-sm"
                        >
                          <HeartIcon filled={wishlist.includes(product.id)} />
                        </button>

                        {/* Quick Add */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="w-full"
                            size="small"
                          >
                            Quick Add to Cart
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <p className="text-xs text-rose-gold uppercase tracking-wider mb-1">
                          {product.brandId}
                        </p>
                        <Link to={`/consumer/products/${product.id}`}>
                          <h3 className="font-medium text-deep-charcoal mb-2 hover:text-rose-gold transition-colors line-clamp-1">
                            {product.name || 'Product'}
                          </h3>
                        </Link>
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                          {product.shortDescription || product.description || ''}
                        </p>
                        
                        {/* Price and Size */}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-light text-deep-charcoal">
                            ${price.toFixed(2)}
                          </span>
                          {b2cVariant?.size && (
                            <span className="text-sm text-text-secondary">
                              {b2cVariant.size}{b2cVariant.sizeUnit}
                            </span>
                          )}
                        </div>

                        {/* Skin benefits */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-soft-pink px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-soft-pink rounded-full flex items-center justify-center">
                  <SearchIcon />
                </div>
                <p className="text-text-secondary mb-4">No products found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedBrand('all')
                  setSelectedSkinType('all')
                  setPriceRange([0, 500])
                  setShowCertified(false)
                }}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </Container>
    </Layout>
  )
}