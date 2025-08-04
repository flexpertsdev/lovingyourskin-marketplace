import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services'
import { Product } from '../types'
import { ProductCard } from '../components/features/ProductCard'
import { Container } from '../components/layout'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useConsumerCartStore } from '../stores/consumer-cart.store'
import toast from 'react-hot-toast'

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'new'
type FilterOption = 'all' | 'in-stock' | 'pre-order'

// Icon components
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { addItem } = useConsumerCartStore()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await productService.getAll()
      // Filter only products with retail pricing
      const retailProducts = allProducts.filter((p: Product) => p.retailPrice && p.retailPrice.item > 0)
      setProducts(retailProducts)
    } catch (err) {
      console.error('Failed to load products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Stock/Pre-order filter
    if (filterBy === 'in-stock') {
      const b2cStock = product.variants?.[0]?.inventory?.b2c?.available || 0
      return b2cStock > 0 && !product.isPreorder
    } else if (filterBy === 'pre-order') {
      return product.isPreorder
    }

    return true
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-asc':
        return (a.retailPrice?.item || 0) - (b.retailPrice?.item || 0)
      case 'price-desc':
        return (b.retailPrice?.item || 0) - (a.retailPrice?.item || 0)
      case 'new':
        // Use brandId as a proxy for newness since createdAt doesn't exist
        return a.id.localeCompare(b.id)
      default:
        return 0
    }
  })

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  if (loading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center">
          <Spinner size="large" />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProducts}>Try Again</Button>
        </div>
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-soft-pink">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light mb-2">Shop K-Beauty Boutique</h1>
          <p className="text-text-secondary text-lg">Discover premium Korean beauty products for your personal skincare journey</p>
        </div>
        
        {/* Brand Collections Banner */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/boutique/collection/lalucell" className="group">
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
              <h3 className="font-medium text-deep-charcoal group-hover:text-rose-gold transition-colors">Lalucell</h3>
              <p className="text-sm text-text-secondary">Pregnancy Safe</p>
            </div>
          </Link>
          <Link to="/boutique/collection/sunnicorn" className="group">
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
              <h3 className="font-medium text-deep-charcoal group-hover:text-rose-gold transition-colors">Sunnicorn</h3>
              <p className="text-sm text-text-secondary">Sustainable Beauty</p>
            </div>
          </Link>
          <Link to="/boutique/collection/baohlab" className="group">
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
              <h3 className="font-medium text-deep-charcoal group-hover:text-rose-gold transition-colors">BAO H. LAB</h3>
              <p className="text-sm text-text-secondary">Hair Care Expert</p>
            </div>
          </Link>
          <Link to="/boutique/collection/thecelllab" className="group">
            <div className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
              <h3 className="font-medium text-deep-charcoal group-hover:text-rose-gold transition-colors">THE CELL LAB</h3>
              <p className="text-sm text-text-secondary">Advanced Skincare</p>
            </div>
          </Link>
        </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-gold"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="appearance-none pl-10 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-gold bg-white cursor-pointer"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="pre-order">Pre-order</option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <FilterIcon />
            </div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none px-4 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-gold bg-white cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="new">Newest First</option>
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 mb-6">
        {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
      </p>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="relative">
              <Link to={`/shop/products/${product.id}`}>
                <ProductCard product={product} />
              </Link>
              <div className="mt-4">
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full"
                  disabled={(product.variants?.[0]?.inventory?.b2c?.available || 0) === 0 && !product.isPreorder}
                >
                  {product.isPreorder ? 'Pre-order' : 
                        (product.variants?.[0]?.inventory?.b2c?.available || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </Container>
    </div>
  )
}