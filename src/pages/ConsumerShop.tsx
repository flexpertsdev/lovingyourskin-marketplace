import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/layout'
import { Layout } from '../components/layout'
import { Button, Input, Card, CardContent } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { productService } from '../services'
import { Product, Brand } from '../types'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import { useAuthStore } from '../stores/auth.store'
import toast from 'react-hot-toast'

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

const ChevronLeft = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// Brand Carousel Component
const BrandCarousel: React.FC<{ brands: Brand[] }> = ({ brands }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextBrand = () => {
    setCurrentIndex((prev) => (prev + 1) % brands.length)
  }

  const prevBrand = () => {
    setCurrentIndex((prev) => (prev - 1 + brands.length) % brands.length)
  }

  if (brands.length === 0) return null

  const currentBrand = brands[currentIndex]

  return (
    <div className="relative bg-gradient-to-br from-soft-pink to-white rounded-2xl overflow-hidden mb-12">
      {/* Brand Hero Image Background */}
      {currentBrand.heroImage && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${currentBrand.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      <div className="relative flex items-center justify-between p-8 md:p-12">
        <button 
          onClick={prevBrand}
          className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
        >
          <ChevronLeft />
        </button>

        <Link 
          to={`/consumer/brands/${currentBrand.id}`}
          className="flex-1 mx-8 group"
        >
          <div className="text-center">
            {currentBrand.logo && (
              <img 
                src={currentBrand.logo} 
                alt={typeof currentBrand.name === 'object' ? currentBrand.name.en : currentBrand.name}
                className="h-24 mx-auto mb-6 object-contain group-hover:scale-105 transition-transform"
              />
            )}
            <h3 className="text-2xl font-light text-deep-charcoal mb-3">
              {typeof currentBrand.name === 'object' ? currentBrand.name.en : currentBrand.name}
            </h3>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              {typeof currentBrand.description === 'object' ? currentBrand.description.en : currentBrand.description}
            </p>
            <Button variant="secondary">
              Explore Collection
            </Button>
          </div>
        </Link>

        <button 
          onClick={nextBrand}
          className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Brand indicators */}
      <div className="flex justify-center gap-2 pb-6 relative z-10">
        {brands.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-rose-gold' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Filter Component
const ShopFilters: React.FC<{
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
}> = ({ categories, selectedCategory, onCategoryChange, priceRange, onPriceRangeChange }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-deep-charcoal mb-6">Filters</h3>
      
      {/* Categories */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-deep-charcoal mb-4">Categories</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="all"
              checked={selectedCategory === 'all'}
              onChange={() => onCategoryChange('all')}
              className="text-rose-gold"
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
                className="text-rose-gold"
              />
              <span className="text-sm text-text-secondary">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-deep-charcoal mb-4">Price Range</h4>
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="text-sm text-text-secondary">
          £{priceRange[0]} - £{priceRange[1]}
        </div>
      </div>
    </div>
  )
}

// Main Shop Component
export const ConsumerShop: React.FC = () => {
  const navigate = useNavigate()
  const { addItem } = useConsumerCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [sortBy, setSortBy] = useState('featured')
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load products and brands
      const [allProducts, allBrands] = await Promise.all([
        productService.getAll(),
        productService.getBrands()
      ])
      
      console.log('Loaded products:', allProducts)
      console.log('Loaded brands:', allBrands)
      
      // Filter only retail products (products that have retail prices)
      const retailProducts = allProducts.filter(p => {
        const hasRetailPrice = p.retailPrice && p.retailPrice.item > 0
        const hasPrice = p.price && (p.price.retail > 0 || p.price.wholesale > 0)
        return hasRetailPrice || hasPrice
      })
      
      console.log('Retail products:', retailProducts)
      
      setProducts(retailProducts)
      setBrands(allBrands)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).sort()

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const name = typeof product.name === 'object' ? product.name.en : product.name
        const description = typeof product.description === 'object' ? product.description.en : product.description
        
        if (!name.toLowerCase().includes(query) &&
            !description.toLowerCase().includes(query)) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false
      }

      // Price filter - check both retailPrice and price fields
      const price = product.retailPrice?.item || product.price?.retail || 0
      if (price < priceRange[0] || price > priceRange[1]) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      const priceA = a.retailPrice?.item || a.price?.retail || 0
      const priceB = b.retailPrice?.item || b.price?.retail || 0
      
      switch (sortBy) {
        case 'price-low':
          return priceA - priceB
        case 'price-high':
          return priceB - priceA
        case 'name':
          const nameA = typeof a.name === 'object' ? a.name.en : a.name
          const nameB = typeof b.name === 'object' ? b.name.en : b.name
          return nameA.localeCompare(nameB)
        default:
          return 0
      }
    })

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    const productName = typeof product.name === 'object' ? product.name.en : product.name
    toast.success(`${productName} added to cart`)
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-soft-pink to-white py-16">
        <Container>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-deep-charcoal mb-4">
              Discover K-Beauty Essentials
            </h1>
            <p className="text-xl text-text-secondary">
              Curated collection of authentic Korean skincare from trusted brands
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-gold"
              />
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        {/* Brand Carousel */}
        {brands.length > 0 && <BrandCarousel brands={brands} />}

        {/* Shop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ShopFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
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
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const productName = typeof product.name === 'object' ? product.name.en : product.name
                  const productDescription = typeof product.description === 'object' ? product.description.en : product.description
                  const productPrice = product.retailPrice?.item || product.price?.retail || 0
                  
                  return (
                    <Card key={product.id} className="group overflow-hidden">
                      <div className="relative">
                        <Link to={`/consumer/products/${product.id}`}>
                          <img 
                            src={product.image} 
                            alt={productName}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        
                        {/* Badges */}
                        {product.preOrderEnabled && (
                          <span className="absolute top-4 left-4 bg-rose-gold text-white px-3 py-1 rounded-full text-sm">
                            Pre-order
                          </span>
                        )}
                        
                        {/* Wishlist */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-rose-gold hover:text-white transition-colors"
                        >
                          <HeartIcon filled={wishlist.includes(product.id)} />
                        </button>

                        {/* Quick Add */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="w-full"
                            size="small"
                          >
                            Quick Add +
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                          {product.brandId}
                        </p>
                        <Link to={`/consumer/products/${product.id}`}>
                          <h3 className="font-medium text-deep-charcoal mb-2 hover:text-rose-gold transition-colors">
                            {productName}
                          </h3>
                        </Link>
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                          {productDescription}
                        </p>
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
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">No products found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setPriceRange([0, 500])
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </Container>
    </Layout>
  )
}