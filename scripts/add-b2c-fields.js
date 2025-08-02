import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the products.json file
const productsPath = path.join(__dirname, '../mock-data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Update each product
const updatedProducts = products.map(product => {
  // Add B2C fields
  const updatedProduct = {
    ...product,
    soldB2C: true,
    soldB2B: true,
    active: true
  };

  // Add retail price based on MSRP
  if (product.price?.msrp) {
    updatedProduct.retailPrice = {
      item: product.price.msrp,
      currency: product.price.currency || 'USD'
    };
  }

  // Ensure all required fields exist
  if (!updatedProduct.category) {
    updatedProduct.category = 'Skincare';
  }

  if (!updatedProduct.stockLevel) {
    updatedProduct.stockLevel = product.inStock ? 'in' : 'out';
  }

  if (!updatedProduct.volume) {
    updatedProduct.volume = '50ml'; // Default volume
  }

  if (!updatedProduct.packSize) {
    updatedProduct.packSize = String(product.itemsPerCarton || 12);
  }

  if (!updatedProduct.leadTime) {
    updatedProduct.leadTime = '3-5 days';
  }

  return updatedProduct;
});

// Write the updated products back to file
fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');

console.log(`✅ Updated ${updatedProducts.length} products with B2C fields`);
console.log('📝 Added fields: soldB2C, soldB2B, retailPrice, active');
console.log('💰 Retail prices set from MSRP values');