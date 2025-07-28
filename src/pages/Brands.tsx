import React, { useState, useEffect } from 'react'
import { Layout, Container, Section, PageHeader } from '../components/layout'
import { Spinner } from '../components/ui'
import { BrandCardHero } from '../components/features/BrandCardHero'
import { productService } from '../services'
import { Brand } from '../types'

export const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadBrands()
  }, [])
  
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
          {/* Brands Grid */}
          {brands.length > 0 ? (
            <div className="space-y-8">
              {brands.map(brand => (
                <BrandCardHero key={brand.id} brand={brand} variant="side-by-side" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">No brands available at the moment.</p>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}