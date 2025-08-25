import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'lovingyourskinshop'
  });
}

const db = admin.firestore();

async function updateBrandImages() {
  const brandsData = {
    baohlab: {
      heroImage: '/assets/baohlab/baohlab-hero-1.jpg',
      heroImages: [
        '/assets/baohlab/baohlab-hero-1.jpg',
        '/assets/baohlab/baohlab-hero-2.jpg'
      ]
    },
    lalucell: {
      heroImage: '/assets/lalucell/lalucell-hero-1.png',
      heroImages: [
        '/assets/lalucell/lalucell-hero-1.png',
        '/assets/lalucell/lalucell-hero-2.jpg'
      ]
    },
    sunnicorn: {
      heroImage: '/assets/sunnicorn/sunnicorn-hero-1.jpg',
      heroImages: [
        '/assets/sunnicorn/sunnicorn-hero-1.jpg',
        '/assets/sunnicorn/sunnicorn-hero-2.jpg',
        '/assets/sunnicorn/sunnicorn-hero-3.jpg'
      ]
    },
    thecelllab: {
      heroImage: '/assets/thecelllab/thecelllab-hero-1.jpg',
      heroImages: [
        '/assets/thecelllab/thecelllab-hero-1.jpg',
        '/assets/thecelllab/thecelllab-hero-2.jpg',
        '/assets/thecelllab/thecelllab-hero-3.jpg'
      ]
    }
  };

  console.log('=== Updating Firestore documents ===\n');
  
  for (const [brandId, imageData] of Object.entries(brandsData)) {
    try {
      await db.collection('brands').doc(brandId).update({
        heroImage: imageData.heroImage,
        heroImages: imageData.heroImages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✓ Updated ${brandId}:`);
      console.log(`  heroImage: ${imageData.heroImage}`);
      console.log(`  heroImages: ${imageData.heroImages.length} images`);
    } catch (error) {
      console.error(`✗ Failed to update ${brandId}:`, error.message);
    }
  }

  // Save results to JSON file
  const outputPath = path.join(__dirname, '..', 'docs', 'workspace', 'brand-images-firestore-update.json');
  fs.writeFileSync(outputPath, JSON.stringify(brandsData, null, 2));
  console.log(`\n✓ Results saved to ${outputPath}`);
  
  return brandsData;
}

// Run the update
updateBrandImages()
  .then(results => {
    console.log('\n=== Update Complete ===');
    console.log('Brand images now point to local paths in /public/assets/');
    process.exit(0);
  })
  .catch(error => {
    console.error('Update failed:', error);
    process.exit(1);
  });