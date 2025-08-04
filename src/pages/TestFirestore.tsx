import React, { useState } from 'react'
import { productService } from '../services'
import { Brand, Product } from '../types'
import { Button } from '../components/ui'

export const TestFirestore: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBrands = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getBrands()
      setBrands(data)
      console.log('Brands loaded:', data)
    } catch (err) {
      console.error('Error loading brands:', err)
      setError(err instanceof Error ? err.message : 'Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getProducts()
      setProducts(data)
      console.log('Products loaded:', data)
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firestore Test Page</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Button onClick={loadBrands} disabled={loading}>
            {loading ? 'Loading...' : 'Load Brands'}
          </Button>
          <div className="mt-4">
            <h2 className="font-semibold">Brands ({brands.length}):</h2>
            <ul className="list-disc pl-6">
              {brands.map(brand => (
                <li key={brand.id}>{String(brand.name.en || brand.name)} - ID: {brand.id}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <Button onClick={loadProducts} disabled={loading}>
            {loading ? 'Loading...' : 'Load Products'}
          </Button>
          <div className="mt-4">
            <h2 className="font-semibold">Products ({products.length}):</h2>
            <ul className="list-disc pl-6">
              {products.slice(0, 10).map(product => (
                <li key={product.id}>
                  {product.name} - Brand: {product.brandId} - Variants: {product.variants?.length || 0}
                </li>
              ))}
              {products.length > 10 && <li>... and {products.length - 10} more</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}