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

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'lovingyourskinshop',
    storageBucket: 'lovingyourskinshop.appspot.com'
  });
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

async function uploadImage(localPath, remotePath) {
  try {
    console.log(`Uploading ${localPath} to ${remotePath}...`);
    
    // Upload file
    await bucket.upload(localPath, {
      destination: remotePath,
      metadata: {
        contentType: localPath.endsWith('.png') ? 'image/png' : 'image/jpeg',
      }
    });
    
    // Make file publicly accessible
    const file = bucket.file(remotePath);
    await file.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
    console.log(`✓ Uploaded: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    throw error;
  }
}

async function uploadBrandImages() {
  const brandsData = {
    baohlab: {
      images: [
        'baohlab-hero-1.jpg',
        'baohlab-hero-2.jpg'
      ]
    },
    lalucell: {
      images: [
        'lalucell-hero-1.png',
        'lalucell-hero-2.jpg'
      ]
    },
    sunnicorn: {
      images: [
        'sunnicorn-hero-1.jpg',
        'sunnicorn-hero-2.jpg',
        'sunnicorn-hero-3.jpg'
      ]
    },
    thecelllab: {
      images: [
        'thecelllab-hero-1.jpg',
        'thecelllab-hero-2.jpg',
        'thecelllab-hero-3.jpg'
      ]
    }
  };

  const results = {};

  for (const [brandId, brandData] of Object.entries(brandsData)) {
    console.log(`\nProcessing ${brandId}...`);
    const brandUrls = [];
    
    for (const imageName of brandData.images) {
      const localPath = path.join(__dirname, '..', 'public', 'assets', brandId, imageName);
      const remotePath = `brands/${imageName}`;
      
      if (fs.existsSync(localPath)) {
        try {
          const url = await uploadImage(localPath, remotePath);
          brandUrls.push(url);
        } catch (error) {
          console.error(`Failed to upload ${imageName}`);
        }
      } else {
        console.warn(`File not found: ${localPath}`);
      }
    }
    
    results[brandId] = brandUrls;
  }

  // Update Firestore documents
  console.log('\n=== Updating Firestore documents ===\n');
  
  for (const [brandId, urls] of Object.entries(results)) {
    if (urls.length > 0) {
      try {
        await db.collection('brands').doc(brandId).update({
          heroImage: urls[0],
          heroImages: urls,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✓ Updated Firestore document for ${brandId}`);
        console.log(`  heroImage: ${urls[0]}`);
        console.log(`  heroImages: ${urls.length} images`);
      } catch (error) {
        console.error(`Failed to update Firestore for ${brandId}:`, error);
      }
    }
  }

  // Save results to JSON file
  const outputPath = path.join(__dirname, '..', 'docs', 'workspace', 'brand-images-upload-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Results saved to ${outputPath}`);
  
  return results;
}

// Run the upload
uploadBrandImages()
  .then(results => {
    console.log('\n=== Upload Complete ===');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Upload failed:', error);
    process.exit(1);
  });