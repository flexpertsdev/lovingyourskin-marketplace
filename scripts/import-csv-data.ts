import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import { Product, Brand } from '../src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read and parse CSV
const csvPath = path.join(__dirname, '../B2B Website infos - ALL-PRODUCTS.csv')
const csvContent = fs.readFileSync(csvPath, 'utf-8')

// Parse CSV with flexible options
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true,
  trim: true
})

// Clean column names (remove newlines and extra spaces)
const cleanRecords = records.map((record: any) => {
  const cleanedRecord: any = {}
  for (const [key, value] of Object.entries(record)) {
    const cleanKey = key.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    cleanedRecord[cleanKey] = value
  }
  return cleanedRecord
})

// Group products by brand
const brandMap = new Map<string, {
  brand: Partial<Brand>
  products: Product[]
}>()

let productIdCounter = 1
let skippedProducts = 0

cleanRecords.forEach((record: any) => {
  try {
    const brandName = record['brand']?.trim()
    if (!brandName || brandName === 'brand') return // Skip header row or empty brands
    
    const productName = record['Product name']?.trim()
    if (!productName) return
    
    // Parse boolean fields
    const isB2C = record['Sold B2C']?.toLowerCase()?.includes('yes') || false
    const isB2B = record['Sold B2B']?.toLowerCase()?.includes('yes') || false
    
    // Parse prices - handle various formats
    const retailPriceStr = record['Retail Price (USD) => to review with Claude'] || 
                          record['Retail Price (USD)'] || 
                          record['Retail Price USD'] || ''
    const supplierPriceStr = record['SUPPLIER PRICE'] || record['SUPPLIER PRICE '] || ''
    
    const retailPrice = parseFloat(retailPriceStr.replace(/[^0-9.]/g, '') || '0')
    const wholesalePrice = parseFloat(supplierPriceStr.replace(/[^0-9.]/g, '') || '0')
    
    // Parse stock
    const stockWholesale = parseInt(record['STOCK WHOLESALE'] || '0')
    const stockRetail = parseInt(record['STOCK RETAIL'] || '0')
    const totalStock = stockWholesale + stockRetail
    
    // Parse size/volume
    const size = record['size'] || ''
    const sizeType = record['size type'] || ''
    const volume = size && sizeType ? `${size}${sizeType}` : '50ml' // Default if missing
    
    // Parse MOQ
    const moqStr = record['MOQ/ sku'] || record['MOQ'] || '1'
    const moq = parseInt(moqStr.replace(/[^0-9]/g, '') || '1')
    
    // Parse units per carton
    const unitsPerCarton = parseInt(record['units_per_carton'] || '1')
    
    // Parse certifications
    const certifications: string[] = []
    const certStr = record['Certifications'] || ''
    if (certStr) {
      certStr.split(',').forEach((cert: string) => {
        const trimmedCert = cert.trim()
        if (trimmedCert) certifications.push(trimmedCert)
      })
    }
    
    // Get description
    const description = record['Description (please make them sound more appealing because some are really bad lol)'] || 
                       record['Description'] || 
                       productName
    
    // Create product object
    const product: Product = {
      id: `prod_${productIdCounter++}`,
      brandId: brandName.toLowerCase().replace(/\s+/g, '_'),
      categoryId: 'skincare',
      category: 'Skincare',
      name: {
        en: productName,
        ko: productName, // Would need translation
        zh: productName  // Would need translation
      },
      description: {
        en: description.trim(),
        ko: description.trim(),
        zh: description.trim()
      },
      images: [],
      
      // Unified pricing
      price: {
        wholesale: wholesalePrice,
        retail: retailPrice,
        currency: 'USD'
      },
      
      // Legacy retail price support
      retailPrice: isB2C && retailPrice > 0 ? {
        item: retailPrice,
        currency: 'USD'
      } : undefined,
      
      // Sales channels
      soldB2C: isB2C,
      soldB2B: isB2B,
      
      // Stock
      stock: totalStock,
      stockLevel: totalStock > 10 ? 'in' : totalStock > 0 ? 'low' : 'out',
      inStock: totalStock > 0,
      
      // MOQ and packaging
      moq: moq,
      itemsPerCarton: unitsPerCarton,
      packSize: unitsPerCarton.toString(),
      volume: volume,
      
      // Other required fields
      leadTime: '3-5 days',
      certifications: certifications as any,
      featured: false,
      active: true,
      
      // Additional metadata
      ingredients: record['ingredients']?.split(',').map((i: string) => i.trim()).filter(Boolean),
      countryOfOrigin: record['ORIGIN'] || 'Korea',
      expiryDate: record['Expiry Date'] || undefined
    }
    
    // Add to brand map
    if (!brandMap.has(brandName)) {
      brandMap.set(brandName, {
        brand: {
          id: brandName.toLowerCase().replace(/\s+/g, '_'),
          name: {
            en: brandName,
            ko: brandName,
            zh: brandName
          },
          slug: brandName.toLowerCase().replace(/\s+/g, '-'),
          description: {
            en: `Premium beauty brand ${brandName}`,
            ko: `프리미엄 뷰티 브랜드 ${brandName}`,
            zh: `高级美容品牌 ${brandName}`
          },
          logo: '/placeholder-logo.png',
          coverImage: '/placeholder-cover.jpg',
          country: record['ORIGIN'] || 'South Korea',
          website: '',
          categories: ['Skincare'],
          certifications: [],
          active: true,
          featured: false,
          productCount: 0,
          minimumOrder: 100,
          averageRating: 0,
          totalReviews: 0,
          tags: []
        },
        products: []
      })
    }
    
    const brandData = brandMap.get(brandName)!
    brandData.products.push(product)
    
    // Update brand certifications
    const brandCerts = new Set(brandData.brand.certifications || [])
    certifications.forEach(cert => brandCerts.add(cert))
    brandData.brand.certifications = Array.from(brandCerts)
    
  } catch (error) {
    console.error('Error processing record:', error, record)
    skippedProducts++
  }
})

// Calculate product counts and write output
const brands: Brand[] = []
const allProducts: Product[] = []

brandMap.forEach(({ brand, products }) => {
  const finalBrand: Brand = {
    ...brand,
    productCount: products.length,
    technologies: [],
    stats: {
      products: products.length,
      categories: brand.categories?.length || 0,
      countries: 1,
      certifications: brand.certifications?.length || 0
    }
  } as Brand
  
  brands.push(finalBrand)
  allProducts.push(...products)
})

// Write output files
const outputDir = path.join(__dirname, '../src/data/imported')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Write brands
fs.writeFileSync(
  path.join(outputDir, 'brands-imported.json'),
  JSON.stringify(brands, null, 2)
)

// Write products
fs.writeFileSync(
  path.join(outputDir, 'products-imported.json'),
  JSON.stringify(allProducts, null, 2)
)

// Create a summary
const summary = {
  totalBrands: brands.length,
  totalProducts: allProducts.length,
  b2cProducts: allProducts.filter(p => p.soldB2C).length,
  b2bProducts: allProducts.filter(p => p.soldB2B).length,
  activeProducts: allProducts.filter(p => p.active).length,
  featuredProducts: allProducts.filter(p => p.featured).length,
  productsWithRetailPrice: allProducts.filter(p => p.price?.retail && p.price.retail > 0).length,
  productsWithWholesalePrice: allProducts.filter(p => p.price?.wholesale && p.price.wholesale > 0).length,
  skippedProducts,
  timestamp: new Date().toISOString()
}

fs.writeFileSync(
  path.join(outputDir, 'import-summary.json'),
  JSON.stringify(summary, null, 2)
)

console.log('Import completed!')
console.log(summary)