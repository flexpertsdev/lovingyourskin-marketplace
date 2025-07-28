import React, { useEffect, useState } from 'react'
import { productService } from '../services'
import { Product, Brand } from '../types'

export const TestFirebase: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Test Firebase connection
        console.log('Testing Firebase connection...')
        
        const [allProducts, allBrands] = await Promise.all([
          productService.getAll(),
          productService.getBrands()
        ])
        
        console.log('Raw products from Firebase:', allProducts)
        console.log('Raw brands from Firebase:', allBrands)
        
        setProducts(allProducts)
        setBrands(allBrands)
      } catch (err) {
        console.error('Firebase error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) return <div className="p-8">Loading Firebase data...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Brands ({brands.length})</h2>
        {brands.length === 0 ? (
          <p className="text-gray-500">No brands found in Firebase</p>
        ) : (
          <div className="space-y-2">
            {brands.map(brand => (
              <div key={brand.id} className="p-4 border rounded">
                <h3 className="font-semibold">{brand.name.en}</h3>
                <p className="text-sm text-gray-600">ID: {brand.id}</p>
                <p className="text-sm text-gray-600">Products: {brand.productCount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found in Firebase</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="p-4 border rounded">
                <h3 className="font-semibold">{product.name.en}</h3>
                <p className="text-sm text-gray-600">Brand: {product.brandId}</p>
                <p className="text-sm text-gray-600">Price: {product.price?.item || 'N/A'}</p>
                <p className="text-sm text-gray-600">MOQ: {product.moq}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}