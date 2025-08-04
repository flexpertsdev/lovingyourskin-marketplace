import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa6w0J5JkI5D_X9pTY1vMf7h5MYRmPscI",
  authDomain: "lovingyourskinshop.firebaseapp.com",
  projectId: "lovingyourskinshop",
  storageBucket: "lovingyourskinshop.firebasestorage.app",
  messagingSenderId: "815024796468",
  appId: "1:815024796468:web:5eb4b973dd7dc5b1b98139",
  measurementId: "G-9CQTFGSG8H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to flatten the nested product structure
function flattenProducts(data, brandId) {
  const products = [];
  const brandProducts = data[`${brandId}_products`];
  
  if (brandProducts) {
    for (const [productId, product] of Object.entries(brandProducts)) {
      products.push({
        ...product,
        brandId,
        id: productId
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
    
    // Use batched writes for better performance
    let batch = writeBatch(db);
    let count = 0;
    
    for (const product of products) {
      const docRef = doc(db, 'products', product.id);
      batch.set(docRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      count++;
      
      // Firestore has a limit of 500 operations per batch
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed batch of 500 products...`);
        batch = writeBatch(db);
      }
    }
    
    // Commit any remaining products
    if (count % 500 !== 0) {
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
  console.log('🚀 Starting product import to Firestore...\n');
  
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