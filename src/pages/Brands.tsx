import React, { useState, useEffect } from 'react'
import { Layout, Container, Section, PageHeader } from '../components/layout'
import { Input, Select, Spinner } from '../components/ui'
import { BrandCardHero } from '../components/features/BrandCardHero'
import { productService } from '../services/mock/product.service'
import { Brand } from '../types'

export const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterCategory, setFilterCategory] = useState('all')
  
  // Get unique categories from brands
  const categories = Array.from(
    new Set(brands.flatMap(brand => brand.categories || []))
  ).sort()
  
  useEffect(() => {
    loadBrands()
  }, [])
  
  useEffect(() => {
    filterAndSortBrands()
  }, [brands, searchQuery, sortBy, filterCategory])
  
  const loadBrands = async () => {
    try {
      setIsLoading(true)
      const data = await productService.getBrands()
      setBrands(data)
    } catch (error) {
      console.error('Failed to load brands:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const filterAndSortBrands = () => {
    let filtered = [...brands]
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(brand => 
        brand.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.en.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(brand => 
        brand.categories?.includes(filterCategory)
      )
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.en.localeCompare(b.name.en))
        break
      case 'products':
        filtered.sort((a, b) => b.productCount - a.productCount)
        break
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.establishedYear).getTime() - new Date(a.establishedYear).getTime()
        )
        break
    }
    
    setFilteredBrands(filtered)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="large" />
      </div>
    )
  }
  
  return (
    <Layout>
      <PageHeader
        title="Discover K-Beauty Brands"
        subtitle="Connect with verified Korean beauty brands. All CPNP certified for UK/EU markets."
        variant="hero"
      />
      
      <Section>
        <Container>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              className="w-full md:w-48"
            />
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'name', label: 'Sort by Name' },
                { value: 'products', label: 'Most Products' },
                { value: 'newest', label: 'Newest First' }
              ]}
              className="w-full md:w-48"
            />
          </div>
          
          {/* Results count */}
          <p className="text-text-secondary mb-6">
            Showing {filteredBrands.length} of {brands.length} brands
          </p>
          
          {/* Brands Grid */}
          {filteredBrands.length > 0 ? (
            <div className="space-y-8">
              {filteredBrands.map(brand => (
                <BrandCardHero key={brand.id} brand={brand} variant="side-by-side" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">No brands found matching your criteria.</p>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}