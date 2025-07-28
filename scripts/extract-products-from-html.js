const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Helper function to clean text
function cleanText(text) {
  return text ? text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ') : '';
}

// Helper function to parse price
function parsePrice(priceText) {
  const match = priceText.match(/\$?\s*([\d,]+\.?\d*)/);
  return match ? parseFloat(match[1].replace(',', '')) : 0;
}

// Helper function to parse volume
function parseVolume(volumeText) {
  const match = volumeText.match(/(\d+)\s*(ml|g|sheet|oz)/i);
  return {
    amount: match ? parseInt(match[1]) : 0,
    unit: match ? match[2].toLowerCase() : ''
  };
}

// Extract products from HTML file
function extractProductsFromHTML(htmlContent, brandName) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  const rows = document.querySelectorAll('tbody tr');
  const products = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    
    // Skip empty rows
    if (cells.length < 10 || !cells[0].textContent.trim()) continue;

    const productName = cleanText(cells[0].textContent);
    const volumeText = cleanText(cells[1].textContent);
    const description = cleanText(cells[2].textContent);
    const retailPrice = parsePrice(cleanText(cells[3].textContent));
    const supplierPrice = parsePrice(cleanText(cells[4].textContent));
    const expiryDate = cleanText(cells[5].textContent);
    const pao = cleanText(cells[6].textContent);
    const unitsPerCarton = parseInt(cleanText(cells[7].textContent)) || 0;
    const stock = parseInt(cleanText(cells[8].textContent)) || 0;
    const certifications = cleanText(cells[9].textContent);
    const origin = cleanText(cells[10].textContent);
    const ingredients = cleanText(cells[11].textContent)
      .split(/\s*<br>\s*|\s*,\s*/)
      .filter(ing => ing.length > 0)
      .map(ing => ing.trim());
    const remarks = cleanText(cells[12].textContent);

    const volume = parseVolume(volumeText);

    const product = {
      id: `${brandName.toLowerCase().replace(/\s+/g, '-')}-${productName.toLowerCase().replace(/\s+/g, '-')}`,
      brandId: brandName.toLowerCase().replace(/\s+/g, '-'),
      brandName: brandName,
      name: productName,
      volume: {
        amount: volume.amount,
        unit: volume.unit,
        display: volumeText
      },
      description: description,
      prices: {
        retail: {
          currency: 'USD',
          amount: retailPrice
        },
        wholesale: {
          currency: 'USD',
          amount: supplierPrice,
          moq: 1, // 1 carton
          moqUnit: 'carton'
        }
      },
      inventory: {
        stock: stock,
        unitsPerCarton: unitsPerCarton,
        expiryDate: expiryDate,
        pao: pao
      },
      regulatory: {
        origin: origin,
        certifications: certifications.split(/[,;]/).map(c => c.trim()).filter(c => c.length > 0),
        ingredients: ingredients
      },
      status: remarks.toLowerCase().includes('discontinued') ? 'discontinued' : 'active',
      remarks: remarks,
      categories: determineCategories(productName),
      tags: determineTags(productName, description)
    };

    products.push(product);
  }

  return products;
}

// Determine product categories based on name
function determineCategories(productName) {
  const categories = [];
  const nameLower = productName.toLowerCase();

  if (nameLower.includes('cleanser') || nameLower.includes('cleansing')) {
    categories.push('cleansers');
  }
  if (nameLower.includes('toner')) {
    categories.push('toners');
  }
  if (nameLower.includes('ampoule') || nameLower.includes('serum')) {
    categories.push('serums-ampoules');
  }
  if (nameLower.includes('cream') && !nameLower.includes('sun')) {
    categories.push('moisturizers');
  }
  if (nameLower.includes('sun') || nameLower.includes('spf')) {
    categories.push('sun-care');
  }
  if (nameLower.includes('mask') || nameLower.includes('sheet')) {
    categories.push('masks');
  }
  if (nameLower.includes('body')) {
    categories.push('body-care');
  }

  return categories.length > 0 ? categories : ['other'];
}

// Determine product tags
function determineTags(productName, description) {
  const tags = [];
  const text = (productName + ' ' + description).toLowerCase();

  if (text.includes('sensitive')) tags.push('sensitive-skin');
  if (text.includes('hydrat')) tags.push('hydrating');
  if (text.includes('soothing')) tags.push('soothing');
  if (text.includes('anti-aging') || text.includes('peptide')) tags.push('anti-aging');
  if (text.includes('brightening') || text.includes('niacinamide')) tags.push('brightening');
  if (text.includes('natural') || text.includes('naturally')) tags.push('natural');
  if (text.includes('gentle')) tags.push('gentle');
  if (text.includes('mineral')) tags.push('mineral');

  return tags;
}

// Process all brand HTML files
async function processAllBrands() {
  const mockDataDir = path.join(__dirname, '..', 'mock-data', 'B2B Website infos-2');
  const brandFiles = [
    { file: 'The Cell Lab.html', name: 'The Cell Lab' },
    { file: 'Lalucell.html', name: 'Lalucell' },
    { file: 'Sunnicorn.html', name: 'Sunnicorn' },
    { file: 'Baohlab.html', name: 'Baohlab' },
    { file: 'Wismin.html', name: 'Wismin' }
  ];

  const allProducts = [];
  const brands = {};

  for (const brand of brandFiles) {
    try {
      const htmlPath = path.join(mockDataDir, brand.file);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const products = extractProductsFromHTML(htmlContent, brand.name);
      
      allProducts.push(...products);
      
      // Create brand entry
      const brandId = brand.name.toLowerCase().replace(/\s+/g, '-');
      brands[brandId] = {
        id: brandId,
        name: brand.name,
        productCount: products.length,
        categories: [...new Set(products.flatMap(p => p.categories))],
        origin: 'South Korea',
        isActive: true
      };

      console.log(`Extracted ${products.length} products from ${brand.name}`);
    } catch (error) {
      console.error(`Error processing ${brand.file}:`, error);
    }
  }

  // Save to JSON files
  const outputDir = path.join(__dirname, '..', 'mock-data', 'extracted');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save all products
  fs.writeFileSync(
    path.join(outputDir, 'all-products.json'),
    JSON.stringify(allProducts, null, 2)
  );

  // Save brands
  fs.writeFileSync(
    path.join(outputDir, 'all-brands.json'),
    JSON.stringify(brands, null, 2)
  );

  // Save products by brand
  for (const brandId in brands) {
    const brandProducts = allProducts.filter(p => p.brandId === brandId);
    fs.writeFileSync(
      path.join(outputDir, `${brandId}-products.json`),
      JSON.stringify(brandProducts, null, 2)
    );
  }

  console.log(`\nTotal products extracted: ${allProducts.length}`);
  console.log(`Total brands: ${Object.keys(brands).length}`);
  console.log(`\nFiles saved to: ${outputDir}`);

  // Generate summary report
  const summary = {
    totalProducts: allProducts.length,
    totalBrands: Object.keys(brands).length,
    productsByBrand: {},
    productsByCategory: {},
    priceRanges: {
      retail: { min: Infinity, max: 0 },
      wholesale: { min: Infinity, max: 0 }
    }
  };

  for (const product of allProducts) {
    // Count by brand
    summary.productsByBrand[product.brandName] = (summary.productsByBrand[product.brandName] || 0) + 1;
    
    // Count by category
    for (const category of product.categories) {
      summary.productsByCategory[category] = (summary.productsByCategory[category] || 0) + 1;
    }
    
    // Update price ranges
    if (product.prices.retail.amount > 0) {
      summary.priceRanges.retail.min = Math.min(summary.priceRanges.retail.min, product.prices.retail.amount);
      summary.priceRanges.retail.max = Math.max(summary.priceRanges.retail.max, product.prices.retail.amount);
    }
    if (product.prices.wholesale.amount > 0) {
      summary.priceRanges.wholesale.min = Math.min(summary.priceRanges.wholesale.min, product.prices.wholesale.amount);
      summary.priceRanges.wholesale.max = Math.max(summary.priceRanges.wholesale.max, product.prices.wholesale.amount);
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'extraction-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  return { products: allProducts, brands, summary };
}

// Run the extraction
if (require.main === module) {
  processAllBrands().catch(console.error);
}

module.exports = { extractProductsFromHTML, processAllBrands };
