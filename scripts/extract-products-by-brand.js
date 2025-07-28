const fs = require('fs').promises;
const path = require('path');

async function extractProductsByBrand() {
  const mockDataPath = path.join(__dirname, '..', 'mock-data');
  
  // Read brands data
  const brandsData = JSON.parse(await fs.readFile(path.join(mockDataPath, 'brands.json'), 'utf8'));
  
  // Initialize products by brand structure
  const productsByBrand = {};
  
  // Set up brand structure
  brandsData.brands.forEach(brand => {
    productsByBrand[brand.id] = {
      brandId: brand.id,
      brandName: brand.name,
      brandSlug: brand.slug,
      tagline: brand.tagline,
      description: brand.description,
      logo: brand.logo,
      establishedYear: brand.establishedYear,
      certifications: brand.certifications,
      featureTags: brand.featureTags,
      products: []
    };
  });
  
  // Read main products.json
  try {
    const mainProducts = JSON.parse(await fs.readFile(path.join(mockDataPath, 'products.json'), 'utf8'));
    mainProducts.forEach(product => {
      if (product.brandId && productsByBrand[product.brandId]) {
        productsByBrand[product.brandId].products.push(product);
      }
    });
    console.log(`✓ Processed ${mainProducts.length} products from products.json`);
  } catch (error) {
    console.log('× Could not read products.json');
  }
  
  // Read brand-specific product files
  const brandProductFiles = [
    { file: 'lalucell_products.json', brandId: 'lalucell' },
    { file: 'lalucell_sunnicorn_products.json', brandIds: ['lalucell', 'sunnicorn'] },
    { file: 'thecelllab-products.json', brandId: 'thecelllab' },
    { file: 'vanhalla-products.json', brandId: 'vanhalla' },
    { file: 'wismin_products_standard_format.json', brandId: 'wismin' }
  ];
  
  for (const { file, brandId, brandIds } of brandProductFiles) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(mockDataPath, file), 'utf8'));
      
      if (Array.isArray(data)) {
        if (brandIds) {
          // Handle files with multiple brands
          data.forEach(product => {
            // Determine brand from product data or filename
            brandIds.forEach(bid => {
              if (product.brand?.toLowerCase().includes(bid) || 
                  product.brandId === bid ||
                  (product.name && file.toLowerCase().includes(bid))) {
                if (productsByBrand[bid]) {
                  // Check if product already exists
                  const exists = productsByBrand[bid].products.some(p => 
                    p.id === product.id || 
                    (p.name?.en === product.name?.en && p.name?.en)
                  );
                  if (!exists) {
                    productsByBrand[bid].products.push(product);
                  }
                }
              }
            });
          });
        } else if (brandId && productsByBrand[brandId]) {
          // Single brand file
          data.forEach(product => {
            // Check if product already exists
            const exists = productsByBrand[brandId].products.some(p => 
              p.id === product.id || 
              (p.name?.en === product.name?.en && p.name?.en)
            );
            if (!exists) {
              productsByBrand[brandId].products.push(product);
            }
          });
        }
        console.log(`✓ Processed ${data.length} products from ${file}`);
      }
    } catch (error) {
      console.log(`× Could not read ${file}: ${error.message}`);
    }
  }
  
  // Create summary
  console.log('\n=== PRODUCTS BY BRAND SUMMARY ===');
  let totalProducts = 0;
  Object.entries(productsByBrand).forEach(([brandId, brandData]) => {
    console.log(`${brandData.brandName}: ${brandData.products.length} products`);
    totalProducts += brandData.products.length;
  });
  console.log(`\nTotal unique products: ${totalProducts}`);
  
  // Save to file
  const outputPath = path.join(mockDataPath, 'products-by-brand.json');
  await fs.writeFile(outputPath, JSON.stringify(productsByBrand, null, 2));
  console.log(`\n✓ Saved complete data to ${outputPath}`);
  
  // Also create a simplified version
  const simplified = {};
  Object.entries(productsByBrand).forEach(([brandId, brandData]) => {
    simplified[brandId] = {
      brandName: brandData.brandName,
      productCount: brandData.products.length,
      products: brandData.products.map(p => ({
        id: p.id,
        name: p.name?.en || p.name || p.title,
        price: p.price?.msrp || p.price?.wholesale?.price || p.price,
        category: p.categoryId || p.category,
        inStock: p.inStock !== false
      }))
    };
  });
  
  const simplifiedPath = path.join(mockDataPath, 'products-by-brand-summary.json');
  await fs.writeFile(simplifiedPath, JSON.stringify(simplified, null, 2));
  console.log(`✓ Saved summary to ${simplifiedPath}`);
}

// Run the extraction
extractProductsByBrand().catch(console.error);
