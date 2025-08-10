import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize with default credentials (uses gcloud auth)
initializeApp({
  projectId: 'lovingyourskinshop'
});

const db = getFirestore();

// Read the brands backup file
const brandsData = JSON.parse(
  readFileSync(resolve(__dirname, '../brands.json'), 'utf-8')
);

// Helper function to convert old category format to new
function convertCategories(categories) {
  if (!categories) return [];
  
  // If it's already an array of strings, return as is
  if (Array.isArray(categories) && categories.length > 0 && typeof categories[0] === 'string') {
    return categories;
  }
  
  // If it's an array of objects with id field, extract the ids
  if (Array.isArray(categories) && categories.length > 0 && typeof categories[0] === 'object') {
    return categories.map(cat => cat.id || cat.name).filter(Boolean);
  }
  
  return [];
}

// Map old brand structure to current schema
function mapBrandData(oldBrand) {
  const brand = {
    id: oldBrand.id,
    slug: oldBrand.slug,
    name: oldBrand.name,
    tagline: oldBrand.tagline || '',
    description: oldBrand.description || '',
    logo: oldBrand.logo || '',
    heroImage: oldBrand.heroImage || '',
    heroImages: oldBrand.heroImages || [],
    establishedYear: oldBrand.establishedYear || 2020,
    productCount: oldBrand.productCount || 0,
    minimumOrder: oldBrand.minimumOrder || 100, // Default MOQ
    country: oldBrand.country || 'Korea', // Default country
    certifications: oldBrand.certifications || [],
    featureTags: oldBrand.featureTags || [],
    technologies: oldBrand.technologies || [],
    categories: convertCategories(oldBrand.categories),
    isExclusivePartner: oldBrand.isExclusivePartner !== false, // Default to true unless explicitly false
    stats: oldBrand.stats || {
      yearsInBusiness: new Date().getFullYear() - (oldBrand.establishedYear || 2020),
      productsSold: '1K+',
      customerSatisfaction: 90
    },
    active: oldBrand.active !== false, // Default to true
    featured: oldBrand.featured === true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  // Only add optional fields if they exist
  if (oldBrand.story) brand.story = oldBrand.story;
  if (oldBrand.clinicalResults) brand.clinicalResults = oldBrand.clinicalResults;
  if (oldBrand.logoStyle) brand.logoStyle = oldBrand.logoStyle;
  if (oldBrand.contactEmail) brand.contactEmail = oldBrand.contactEmail;
  
  return brand;
}

async function restoreBrands() {
  console.log('🔄 Starting brand restoration from backup...\n');
  
  const brands = brandsData.brands || [];
  console.log(`📦 Found ${brands.length} brands to restore\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const brand of brands) {
    try {
      const mappedBrand = mapBrandData(brand);
      
      // Use the brand's ID as the document ID
      await db.collection('brands').doc(brand.id).set(mappedBrand);
      
      console.log(`✅ Restored brand: ${brand.name} (${brand.id})`);
      if (mappedBrand.isExclusivePartner) {
        console.log(`   → Marked as exclusive partner`);
      }
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to restore brand ${brand.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Restoration Summary:');
  console.log(`   ✅ Successfully restored: ${successCount} brands`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount} brands`);
  }
  
  console.log('\n✨ Brand restoration complete!');
  console.log('You can now view them at:');
  console.log('   - Consumer Shop: http://localhost:5173/shop');
  console.log('   - Admin Brands: http://localhost:5173/admin/brands');
  
  process.exit(0);
}

// Run the restoration
restoreBrands().catch(error => {
  console.error('Fatal error during restoration:', error);
  process.exit(1);
});