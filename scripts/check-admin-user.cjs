const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://lovingyourskinshop.firebaseio.com`
});

const db = admin.firestore();

async function checkAdminUser() {
  try {
    // Find admin user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'admin@lovingyourskin.net')
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('Admin user not found in users collection');
      return;
    }

    const adminDoc = usersSnapshot.docs[0];
    console.log('Admin user ID:', adminDoc.id);
    console.log('Admin user data:', JSON.stringify(adminDoc.data(), null, 2));
    
    // Check if role is set correctly
    const userData = adminDoc.data();
    if (userData.role !== 'admin') {
      console.log('\n⚠️  WARNING: User role is not "admin", it is:', userData.role);
      console.log('Updating user role to admin...');
      
      await adminDoc.ref.update({ role: 'admin' });
      console.log('✅ User role updated to admin');
    } else {
      console.log('✅ User role is correctly set to admin');
    }

  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    process.exit();
  }
}

checkAdminUser();