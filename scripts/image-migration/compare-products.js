const fs = require('fs').promises;
const path = require('path');

async function compareProducts() {
  try {
    // Read both files
    const backupPath = path.join(__dirname, '../../mock-data/products_backup.json');
    const currentPath = path.join(__dirname, '../../mock-data/products.json');
    
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    const currentData = JSON.parse(await fs.readFile(currentPath, 'utf8'));
    
    console.log('=== PRODUCT COUNT COMPARISON ===');
    console.log(`Total products in backup: ${backupData.length}`);
    console.log(`Total products in current: ${currentData.length}`);
    console.log('');
    
    // Count by brand
    const brands = ['wismin', 'lalucell', 'sunnicorn', 'vanhalla', 'thecelllab', 'baohlab'];
    
    console.log('=== COUNT BY BRAND ===');
    brands.forEach(brand => {
      const backupCount = backupData.filter(p => p.brandId === brand).length;
      const currentCount = currentData.filter(p => p.brandId === brand).length;
      const diff = currentCount - backupCount;
      console.log(`${brand}: backup=${backupCount}, current=${currentCount}${diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : ''}`);
    });
    
    // Specifically check Wismin products
    console.log('\n=== WISMIN PRODUCTS DETAILS ===');
    const wisminBackup = backupData.filter(p => p.brandId === 'wismin');
    const wisminCurrent = currentData.filter(p => p.brandId === 'wismin');
    
    console.log('In products_backup.json:');
    wisminBackup.forEach(p => console.log(`  - ${p.id}: ${p.name.en}`));
    
    console.log('\nIn products.json:');
    wisminCurrent.forEach(p => console.log(`  - ${p.id}: ${p.name.en}`));
    
    // Check for missing products
    const backupIds = new Set(wisminBackup.map(p => p.id));
    const currentIds = new Set(wisminCurrent.map(p => p.id));
    
    console.log('\nMissing from products.json:');
    let missingCount = 0;
    backupIds.forEach(id => {
      if (!currentIds.has(id)) {
        const product = wisminBackup.find(p => p.id === id);
        console.log(`  - ${id}: ${product.name.en}`);
        missingCount++;
      }
    });
    if (missingCount === 0) console.log('  None');
    
    console.log('\nAdded to products.json (not in backup):');
    let addedCount = 0;
    currentIds.forEach(id => {
      if (!backupIds.has(id)) {
        const product = wisminCurrent.find(p => p.id === id);
        console.log(`  - ${id}: ${product.name.en}`);
        addedCount++;
      }
    });
    if (addedCount === 0) console.log('  None');
    
    // Count all images to fetch
    console.log('\n=== IMAGE COUNT ===');
    let totalImages = 0;
    let httpImages = 0;
    let localImages = 0;
    
    // Count from brands.json
    const brandsPath = path.join(__dirname, '../../mock-data/brands.json');
    const brandsData = JSON.parse(await fs.readFile(brandsPath, 'utf8'));
    
    brandsData.brands.forEach(brand => {
      if (brand.logo && brand.logo.startsWith('http')) httpImages++;
      if (brand.heroImage) {
        if (brand.heroImage.startsWith('http')) httpImages++;
        else localImages++;
      }
      if (brand.heroImages) {
        brand.heroImages.forEach(img => {
          if (img.startsWith('http')) httpImages++;
          else localImages++;
        });
      }
    });
    
    // Count from products
    currentData.forEach(product => {
      if (product.images) {
        product.images.forEach(img => {
          if (img.startsWith('http')) httpImages++;
          else localImages++;
        });
      }
    });
    
    console.log(`Total HTTP images to fetch: ${httpImages}`);
    console.log(`Total local images: ${localImages}`);
    console.log(`Total images: ${httpImages + localImages}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

compareProducts();
