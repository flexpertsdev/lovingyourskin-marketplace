import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

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

// Products to set as preorder (you can modify this list)
const PREORDER_PRODUCTS = [
  // Add specific product IDs here that should be on preorder
  // For now, let's randomly set some products as preorder for demo
];

async function addPreorderField() {
  console.log('🚀 Adding isPreorder field to all products...\n');
  
  try {
    // Get all products
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`Found ${snapshot.size} products to update\n`);
    
    // Use batched writes for better performance
    let batch = writeBatch(db);
    let count = 0;
    let preorderCount = 0;
    
    for (const doc of snapshot.docs) {
      const productId = doc.id;
      const productData = doc.data();
      
      // Check if product already has isPreorder field
      if (productData.isPreorder !== undefined) {
        console.log(`⏭️  Skipping ${productId} - already has isPreorder field`);
        continue;
      }
      
      // Determine if product should be preorder
      // For demo, let's make products from certain brands preorder
      const isPreorder = productData.brandId === 'wismin' || 
                        productData.brandId === 'sunnicorn' ||
                        PREORDER_PRODUCTS.includes(productId);
      
      // Add preorder discount if it's a preorder item
      const updates = {
        isPreorder,
        updatedAt: new Date().toISOString()
      };
      
      if (isPreorder) {
        // Add 15% preorder discount
        updates.preorderDiscount = 15;
        updates.preorderEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
        preorderCount++;
      }
      
      batch.update(doc.ref, updates);
      count++;
      
      console.log(`${isPreorder ? '🎯' : '📦'} ${productId}: isPreorder = ${isPreorder}`);
      
      // Firestore has a limit of 500 operations per batch
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`\nCommitted batch of 500 products...`);
        batch = writeBatch(db);
      }
    }
    
    // Commit any remaining updates
    if (count % 500 !== 0) {
      await batch.commit();
    }
    
    console.log(`\n✅ Successfully updated ${count} products`);
    console.log(`🎯 ${preorderCount} products marked as preorder`);
    console.log(`📦 ${count - preorderCount} products marked as regular\n`);
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
}

// Run the update
addPreorderField().then(() => {
  console.log('✨ All done!');
  process.exit(0);
}).catch(console.error);