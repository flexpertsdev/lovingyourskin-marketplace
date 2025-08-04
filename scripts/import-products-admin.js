import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with service account
// You'll need to download the service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../serviceAccountKey.json'), 'utf-8')
);

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'lovingyourskinshop'
});

const db = getFirestore();

// Helper function to convert date strings to Firestore Timestamps
function convertDates(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && isISODateString(value)) {
      // Convert ISO date strings to Firestore Timestamps
      converted[key] = Timestamp.fromDate(new Date(value));
    } else if (typeof value === 'object' && value !== null) {
      // Recursively convert nested objects
      converted[key] = convertDates(value);
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

// Check if a string is an ISO date string
function isISODateString(str) {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(str);
}

// Function to flatten the nested product structure
function flattenProducts(data, brandId) {
  const products = [];
  
  // Handle different naming conventions
  const possibleKeys = [
    `${brandId}_products`,
    `${brandId.replace(/-/g, '_')}_products`
  ];
  
  let brandProducts = null;
  for (const key of possibleKeys) {
    if (data[key]) {
      brandProducts = data[key];
      console.log(`Found products under key: ${key}`);
      break;
    }
  }
  
  if (brandProducts) {
    for (const [productId, product] of Object.entries(brandProducts)) {
      // Convert date strings to Timestamps
      const convertedProduct = convertDates(product);
      
      products.push({
        ...convertedProduct,
        brandId,
        id: productId,
        // Ensure these are Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  }
  
  return products;
}

// Function to import products from a single JSON file
async function importProductsFromFile(filePath, brandId) {
  console.log(`\nImporting products from ${brandId}...`);
  
  try {
    // Read the JSON file
    const jsonData = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    
    // Flatten the product structure
    const products = flattenProducts(data, brandId);
    console.log(`Found ${products.length} products for ${brandId}`);
    
    if (products.length === 0) {
      console.log(`No products found for ${brandId}, checking JSON structure...`);
      console.log('Available keys in JSON:', Object.keys(data));
      return 0;
    }
    
    // Use batched writes for better performance
    let batch = db.batch();
    let count = 0;
    let batchCount = 0;
    
    for (const product of products) {
      const docRef = db.collection('products').doc(product.id);
      batch.set(docRef, product, { merge: true });
      count++;
      batchCount++;
      
      // Firestore has a limit of 500 operations per batch
      if (batchCount === 500) {
        await batch.commit();
        console.log(`Committed batch of 500 products...`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit any remaining products
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`✅ Successfully imported ${count} products for ${brandId}`);
    return count;
    
  } catch (error) {
    console.error(`❌ Error importing ${brandId} products:`, error);
    return 0;
  }
}

// Main import function
async function importAllProducts() {
  console.log('🚀 Starting product import to Firestore with Admin SDK...\n');
  
  const brands = [
    { id: 'baohlab', file: 'baohlab-products-json.json' },
    { id: 'lalucell', file: 'lalucell-products-json.json' },
    { id: 'sunnicorn', file: 'sunnicorn-products-json.json' },
    { id: 'the-cell-lab', file: 'the-cell-lab-products-json.json' },
    { id: 'wismin', file: 'wismin-products-json.json' }
  ];
  
  let totalImported = 0;
  
  // Import products from each brand file
  for (const brand of brands) {
    const filePath = resolve(__dirname, `../mock-data/firestore/${brand.file}`);
    const imported = await importProductsFromFile(filePath, brand.id);
    totalImported += imported;
  }
  
  console.log(`\n✅ Import complete! Total products imported: ${totalImported}`);
  process.exit(0);
}

// Run the import
importAllProducts().catch((error) => {
  console.error('Fatal error during import:', error);
  process.exit(1);
});