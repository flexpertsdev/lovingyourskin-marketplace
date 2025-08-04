import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load progress
const progressFile = resolve(__dirname, 'image-migration-progress.json');
const progress = JSON.parse(readFileSync(progressFile, 'utf-8'));

// Load products
const jsonPath = resolve(__dirname, '../mock-data/firestore/products-1754297314.json');
const jsonData = readFileSync(jsonPath, 'utf-8');
const { data: products } = JSON.parse(jsonData);

console.log('📊 Image Migration Summary\n');
console.log(`✅ Successfully migrated: ${progress.processed.length} products`);
console.log(`❌ Failed: ${progress.failed.length} products\n`);

// Group failed products by brand
const failedByBrand = {};
const uniqueFailed = [...new Set(progress.failed.map(f => f.productId))];

uniqueFailed.forEach(productId => {
  const product = products[productId];
  if (product) {
    const brandName = product.brand || 'Unknown Brand';
    if (!failedByBrand[brandName]) {
      failedByBrand[brandName] = [];
    }
    failedByBrand[brandName].push({
      id: productId,
      name: product.name,
      error: progress.failed.find(f => f.productId === productId)?.error
    });
  }
});

console.log('❌ Products that need manual image upload:\n');
Object.entries(failedByBrand).forEach(([brand, products]) => {
  console.log(`\n${brand}:`);
  products.forEach(p => {
    console.log(`  - ${p.name} (${p.id})`);
    console.log(`    Error: ${p.error}`);
  });
});

console.log('\n💡 Next steps:');
console.log('1. For 404 errors: Find alternative image sources or use placeholder images');
console.log('2. For 403 errors: Download images manually and upload to Firebase Storage');
console.log('3. Update Firestore documents with new image URLs');