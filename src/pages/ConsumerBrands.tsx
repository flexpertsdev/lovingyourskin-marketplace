import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Container } from '../components/layout'
import { Card, CardContent, Badge } from '../components/ui'
import { Spinner } from '../components/ui/Spinner'
import { productService } from '../services'
import { Brand } from '../types'

export const ConsumerBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const allBrands = await productService.getBrands()
      setBrands(allBrands)
    } catch (error) {
      console.error('Failed to load brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBrands = brands.filter(brand => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return brand.name.en.toLowerCase().includes(query) ||
           brand.description.en.toLowerCase().includes(query)
  })

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
      <section className="bg-gradient-to-br from-soft-pink to-white py-12 md:py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-light text-deep-charcoal mb-4">
              Our Curated Brands
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Discover authentic Korean beauty brands, each carefully selected for quality and innovation
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-gold"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Brands Grid */}
      <section className="py-8 md:py-12">
        <Container>
          {filteredBrands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredBrands.map(brand => (
                <Link 
                  key={brand.id} 
                  to={`/consumer/brands/${brand.id}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Brand Image */}
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-soft-pink to-white overflow-hidden">
                      {brand.heroImage ? (
                        <img 
                          src={brand.heroImage} 
                          alt={brand.name.en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : brand.logo ? (
                        <div className="flex items-center justify-center h-full">
                          <img 
                            src={brand.logo} 
                            alt={brand.name.en}
                            className="h-24 md:h-32 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-4xl font-light text-rose-gold">
                            {brand.name.en.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl md:text-2xl font-light text-deep-charcoal mb-3 group-hover:text-rose-gold transition-colors">
                        {brand.name.en}
                      </h3>
                      
                      <p className="text-text-secondary mb-4 line-clamp-3">
                        {brand.description.en}
                      </p>
                      
                      {/* Brand Features */}
                      {brand.featureTags && brand.featureTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {brand.featureTags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Brand Info */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">
                          {brand.productCount} Products
                        </span>
                        <span className="text-rose-gold group-hover:underline">
                          Explore →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No brands found matching your search.</p>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-light text-deep-charcoal mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-text-secondary mb-6">
              Browse our complete collection of K-beauty products
            </p>
            <Link to="/consumer/shop">
              <button className="px-8 py-3 bg-rose-gold text-white rounded-full hover:bg-rose-gold-dark transition-colors">
                Shop All Products
              </button>
            </Link>
          </div>
        </Container>
      </section>
    </Layout>
  )
}