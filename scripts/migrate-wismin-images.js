
import admin from 'firebase-admin';
import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Configuration ---
const wisminProductsToUpdate = [
  {
    productId: 'wismin-cotton-seed-barrier-cleansing-ball',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202502/7c928ed9150360e13ea694c6f623a6f2.jpg'
  },
  {
    productId: 'wismin-cotton-seed-cicafence-toner-150ml',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202502/d559e3b36141d4af106b79f4cdbffeda.jpg'
  },
  {
    productId: 'wismin-cotton-seed-cicafence-cream-50ml',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202502/840bcf0c789b92709b1d98760af57347.jpg'
  },
  {
    productId: 'wismin-bakuchiol-all-day-young-ampoule',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202502/2177ebef89667aee9b4bf0b066f5c407.jpg'
  },
  {
    productId: 'wismin-bakuchiol-all-day-young-ampoule-set',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202504/f0b99ca8201615ab2a117ef398fadf3e.jpg'
  },
  {
    productId: 'wismin-cotton-fruit-water-hawaiian-sun-cream',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202411/2b943f6435b1416f7c6006beccc6e4ff.jpg'
  },
  {
    productId: 'wismin-pore-tight-all-day-young-cream',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202502/79295d72d5f09ae5523e41d5bede8626.jpg'
  },
  {
    productId: 'wismin-bakuchiol-all-day-young-eye-cream',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202504/04f73e10962dbf8cb8c8def943163200.jpg'
  },
  {
    productId: 'wismin-all-day-young-real-deep-collagen-mask',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202411/7599e371b42cd0f97b29242871e21288.jpg'
  },
  {
    productId: 'wismin-all-day-young-real-deep-hydro-mask',
    imageUrl: 'https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/product/medium/202411/d646fe1b04dfa6e21ff623a771508982.jpg'
  }
];

// --- Firebase Initialization ---
const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json');
if (!existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account key not found at:', serviceAccountPath);
  process.exit(1);
}
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'lovingyourskinshop',
    storageBucket: 'lovingyourskinshop.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const TEMP_DIR = resolve(__dirname, 'temp-images');

if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

// --- Image Processing Functions (copied from migrate-product-images-admin.js) ---

async function downloadImage(url, filepath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await attemptDownload(url, filepath);
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`    Retry ${attempt}/${retries} after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

function attemptDownload(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(filepath);
        const protocol = url.startsWith('https') ? https : http;
        const request = protocol.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return attemptDownload(response.headers.location, filepath).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download: ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve(filepath)));
            file.on('error', (err) => {
                unlinkSync(filepath);
                reject(err);
            });
        });
        request.on('error', (err) => reject(err));
    });
}

function getContentType(filename) {
  const ext = extname(filename).toLowerCase();
  return {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml'
  }[ext] || 'image/jpeg';
}

async function uploadToStorage(localPath, storagePath) {
  const [file] = await bucket.upload(localPath, {
    destination: storagePath,
    metadata: { contentType: getContentType(storagePath) }
  });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

async function processImage(imageUrl, productId, imageName) {
  console.log(`  Processing: ${imageName} from ${imageUrl}`);
  const ext = extname(new URL(imageUrl).pathname) || '.jpg';
  const tempPath = resolve(TEMP_DIR, `${productId}-${imageName}${ext}`);
  
  await downloadImage(imageUrl, tempPath);
  
  const storagePath = `products/${productId}/${imageName}${ext}`;
  const firebaseUrl = await uploadToStorage(tempPath, storagePath);
  
  console.log(`  ✅ Uploaded to: ${firebaseUrl}`);
  unlinkSync(tempPath);
  return firebaseUrl;
}

// --- Main Migration Script ---

async function migrateWisminImages() {
  console.log('🚀 Starting Wismin product image migration...');
  
  let successCount = 0;
  let failCount = 0;

  for (const productInfo of wisminProductsToUpdate) {
    const { productId, imageUrl } = productInfo;
    console.log(`
📦 Processing: ${productId}`);

    try {
      const productRef = db.collection('products').doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new Error('Product document not found in Firestore.');
      }

      const newPrimaryUrl = await processImage(imageUrl, productId, 'primary');
      
      await productRef.update({
        'images.primary': newPrimaryUrl,
        'updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`  ✅ Updated Firestore document for ${productId}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to process ${productId}: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n\n📊 Migration Summary:');
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('\n✨ Migration complete!');
}

migrateWisminImages().catch(console.error);
