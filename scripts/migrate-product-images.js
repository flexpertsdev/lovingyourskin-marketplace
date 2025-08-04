import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from 'fs';
import { resolve, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

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
const storage = getStorage(app);

// Progress tracking
const PROGRESS_FILE = resolve(__dirname, 'image-migration-progress.json');
const TEMP_DIR = resolve(__dirname, 'temp-images');

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

// Load progress
function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { processed: [], failed: [] };
}

// Save progress
function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Upload image to Firebase Storage
async function uploadToStorage(localPath, storagePath) {
  const fileBuffer = readFileSync(localPath);
  const storageRef = ref(storage, storagePath);
  
  const snapshot = await uploadBytes(storageRef, fileBuffer);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

// Process a single image
async function processImage(imageUrl, productId, imageName) {
  try {
    // Skip if not an external URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    console.log(`  Processing: ${imageName} from ${imageUrl}`);
    
    // Download image
    const ext = extname(new URL(imageUrl).pathname) || '.jpg';
    const tempPath = resolve(TEMP_DIR, `${productId}-${imageName}${ext}`);
    
    await downloadImage(imageUrl, tempPath);
    
    // Upload to Firebase Storage
    const storagePath = `products/${productId}/${imageName}${ext}`;
    const firebaseUrl = await uploadToStorage(tempPath, storagePath);
    
    console.log(`  ✅ Uploaded to: ${firebaseUrl}`);
    
    // Clean up temp file
    const fs = await import('fs/promises');
    await fs.unlink(tempPath);
    
    return firebaseUrl;
  } catch (error) {
    console.error(`  ❌ Failed to process ${imageName}: ${error.message}`);
    throw error;
  }
}

// Process all images for a product
async function processProductImages(product, productId) {
  const updatedImages = { ...product.images };
  let hasChanges = false;
  
  try {
    // Process primary image
    if (product.images?.primary) {
      const newUrl = await processImage(product.images.primary, productId, 'primary');
      if (newUrl !== product.images.primary) {
        updatedImages.primary = newUrl;
        hasChanges = true;
      }
    }
    
    // Process gallery images
    if (product.images?.gallery && Array.isArray(product.images.gallery)) {
      const updatedGallery = [];
      
      for (let i = 0; i < product.images.gallery.length; i++) {
        const imageUrl = product.images.gallery[i];
        const newUrl = await processImage(imageUrl, productId, `gallery-${i + 1}`);
        updatedGallery.push(newUrl);
        
        if (newUrl !== imageUrl) {
          hasChanges = true;
        }
      }
      
      updatedImages.gallery = updatedGallery;
    }
    
    return { updatedImages, hasChanges };
  } catch (error) {
    console.error(`Failed to process images for ${productId}: ${error.message}`);
    throw error;
  }
}

// Main migration function
async function migrateImages() {
  console.log('🚀 Starting product image migration...\n');
  
  const progress = loadProgress();
  
  try {
    // Read products from JSON file
    const jsonPath = resolve(__dirname, '../mock-data/firestore/products-1754297314.json');
    const jsonData = readFileSync(jsonPath, 'utf-8');
    const { data: products } = JSON.parse(jsonData);
    
    const productIds = Object.keys(products);
    console.log(`Found ${productIds.length} products to process\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;
    
    for (const productId of productIds) {
      // Skip if already processed
      if (progress.processed.includes(productId)) {
        console.log(`⏭️  Skipping ${productId} (already processed)`);
        skipCount++;
        continue;
      }
      
      const product = products[productId];
      console.log(`\n📦 Processing: ${productId} (${product.name})`);
      
      try {
        const { updatedImages, hasChanges } = await processProductImages(product, productId);
        
        if (hasChanges) {
          // Update Firestore document
          const productRef = doc(db, 'products', productId);
          await updateDoc(productRef, {
            images: updatedImages,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`  ✅ Updated Firestore document`);
        } else {
          console.log(`  ℹ️  No external images to migrate`);
        }
        
        // Mark as processed
        progress.processed.push(productId);
        saveProgress(progress);
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        progress.failed.push({ productId, error: error.message });
        saveProgress(progress);
        failCount++;
      }
    }
    
    // Summary
    console.log('\n\n📊 Migration Summary:');
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`⏭️  Skipped (already done): ${skipCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    if (failCount > 0) {
      console.log('\n❌ Failed products:');
      progress.failed.forEach(({ productId, error }) => {
        console.log(`  - ${productId}: ${error}`);
      });
    }
    
    // Clean up temp directory
    const fs = await import('fs/promises');
    const tempFiles = await fs.readdir(TEMP_DIR);
    for (const file of tempFiles) {
      await fs.unlink(resolve(TEMP_DIR, file));
    }
    
    console.log('\n✨ Migration complete!');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run migration
migrateImages().catch(console.error);