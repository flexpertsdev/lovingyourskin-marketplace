import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQCPEInFepojLQ2cyqPWH6MXMvT5kLeXI",
  authDomain: "lovingyourskinshop.firebaseapp.com",
  projectId: "lovingyourskinshop",
  storageBucket: "lovingyourskinshop.firebasestorage.app",
  messagingSenderId: "922199206156",
  appId: "1:922199206156:web:bda2e44f957baf5eb1e0c5",
  measurementId: "G-3GPVVHMHT1"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample orders data
const sampleOrders = [
  {
    orderNumber: 'ORD-2024-001',
    userType: 'consumer',
    status: 'delivered',
    customerEmail: 'emma.wilson@email.com',
    shippingAddress: {
      name: 'Emma Wilson',
      street: '123 Beauty Lane',
      city: 'London',
      state: 'England',
      zip: 'SW1A 1AA',
      country: 'United Kingdom',
      phone: '+44 20 1234 5678'
    },
    items: [
      {
        productId: 'prod-001',
        productName: 'Hydrating Face Serum',
        brandName: 'Dewyface',
        quantity: 2,
        pricePerItem: 45.00,
        totalPrice: 90.00,
        variant: '30ml',
        product: { isPreorder: false }
      },
      {
        productId: 'prod-002',
        productName: 'Rose Gold Cleanser',
        brandName: 'Bellay Blom',
        quantity: 1,
        pricePerItem: 28.00,
        totalPrice: 28.00,
        variant: '150ml',
        product: { isPreorder: false }
      }
    ],
    totalAmount: {
      items: 118.00,
      tax: 23.60,
      shipping: 5.99,
      total: 147.59
    },
    paymentMethod: 'card',
    createdAt: Timestamp.fromDate(new Date('2024-01-15T10:30:00')),
    estimatedDelivery: Timestamp.fromDate(new Date('2024-01-20T12:00:00')),
    trackingNumber: 'GB123456789',
    notes: 'Gift wrapping requested'
  },
  {
    orderNumber: 'ORD-2024-002',
    userType: 'retailer',
    status: 'shipped',
    customerEmail: 'sophie@beautyboutique.com',
    retailerName: 'Beauty Boutique Ltd',
    shippingAddress: {
      name: 'Beauty Boutique',
      street: '456 High Street',
      city: 'Manchester',
      state: 'England',
      zip: 'M1 1AD',
      country: 'United Kingdom',
      phone: '+44 161 123 4567'
    },
    items: [
      {
        productId: 'prod-003',
        productName: 'Vitamin C Brightening Cream',
        brandName: 'Glowtonic',
        quantity: 24,
        pricePerItem: 32.00,
        totalPrice: 768.00,
        variant: '50ml',
        product: { isPreorder: false }
      },
      {
        productId: 'prod-004',
        productName: 'Snail Mucin Essence',
        brandName: 'Hyaluronia',
        quantity: 36,
        pricePerItem: 18.50,
        totalPrice: 666.00,
        variant: '100ml',
        product: { isPreorder: false }
      }
    ],
    totalAmount: {
      items: 1434.00,
      tax: 286.80,
      shipping: 15.00,
      total: 1735.80
    },
    paymentMethod: 'invoice',
    createdAt: Timestamp.fromDate(new Date('2024-01-18T14:45:00')),
    estimatedDelivery: Timestamp.fromDate(new Date('2024-01-25T12:00:00')),
    trackingNumber: 'GB987654321',
    notes: 'B2B wholesale order - net 30 terms'
  },
  {
    orderNumber: 'ORD-2024-003',
    userType: 'consumer',
    status: 'processing',
    customerEmail: 'lisa.kim@email.com',
    shippingAddress: {
      name: 'Lisa Kim',
      street: '789 Skincare Avenue',
      city: 'Birmingham',
      state: 'England',
      zip: 'B1 1AA',
      country: 'United Kingdom',
      phone: '+44 121 234 5678'
    },
    items: [
      {
        productId: 'prod-005',
        productName: 'Green Tea Toner - Limited Edition',
        brandName: 'Meloso',
        quantity: 1,
        pricePerItem: 22.00,
        totalPrice: 22.00,
        variant: '200ml',
        product: { isPreorder: true }
      },
      {
        productId: 'prod-006',
        productName: 'Centella Soothing Mask (Pre-order)',
        brandName: 'Mixim',
        quantity: 3,
        pricePerItem: 4.50,
        totalPrice: 13.50,
        variant: 'Pack of 5',
        product: { isPreorder: true }
      }
    ],
    totalAmount: {
      items: 35.50,
      tax: 7.10,
      shipping: 5.99,
      total: 48.59
    },
    paymentMethod: 'card',
    createdAt: Timestamp.fromDate(new Date('2024-01-20T09:15:00')),
    notes: 'Contains pre-order items - ship when available'
  },
  {
    orderNumber: 'ORD-2024-004',
    userType: 'consumer',
    status: 'pending',
    customerEmail: 'sarah.jones@email.com',
    shippingAddress: {
      name: 'Sarah Jones',
      street: '321 Glow Road',
      city: 'Leeds',
      state: 'England',
      zip: 'LS1 1AA',
      country: 'United Kingdom',
      phone: '+44 113 234 5678'
    },
    items: [
      {
        productId: 'prod-007',
        productName: 'Retinol Night Cream',
        brandName: 'Oy',
        quantity: 1,
        pricePerItem: 58.00,
        totalPrice: 58.00,
        variant: '30ml',
        product: { isPreorder: false }
      }
    ],
    totalAmount: {
      items: 58.00,
      tax: 11.60,
      shipping: 5.99,
      total: 75.59
    },
    paymentMethod: 'card',
    createdAt: Timestamp.fromDate(new Date('2024-01-22T16:30:00')),
    notes: 'Customer requested evening delivery'
  },
  {
    orderNumber: 'ORD-2024-005',
    userType: 'retailer',
    status: 'pending',
    customerEmail: 'orders@kbeautysupply.com',
    retailerName: 'K-Beauty Supply Co',
    shippingAddress: {
      name: 'K-Beauty Supply Co',
      street: '555 Commerce Park',
      city: 'Glasgow',
      state: 'Scotland',
      zip: 'G1 1AA',
      country: 'United Kingdom',
      phone: '+44 141 234 5678'
    },
    items: [
      {
        productId: 'prod-008',
        productName: 'Collagen Boost Ampoule (Pre-order)',
        brandName: 'Srum',
        quantity: 48,
        pricePerItem: 25.00,
        totalPrice: 1200.00,
        variant: '15ml',
        product: { isPreorder: true }
      },
      {
        productId: 'prod-009',
        productName: 'Hyaluronic Acid Serum',
        brandName: 'Toktok',
        quantity: 60,
        pricePerItem: 15.00,
        totalPrice: 900.00,
        variant: '30ml',
        product: { isPreorder: false }
      }
    ],
    totalAmount: {
      items: 2100.00,
      tax: 420.00,
      shipping: 20.00,
      total: 2540.00
    },
    paymentMethod: 'invoice',
    createdAt: Timestamp.fromDate(new Date('2024-01-23T11:00:00')),
    notes: 'Mixed order with pre-order items - partial shipment acceptable'
  },
  {
    orderNumber: 'ORD-2024-006',
    userType: 'consumer',
    status: 'cancelled',
    customerEmail: 'mike.brown@email.com',
    shippingAddress: {
      name: 'Mike Brown',
      street: '999 Cancel Street',
      city: 'Bristol',
      state: 'England',
      zip: 'BS1 1AA',
      country: 'United Kingdom',
      phone: '+44 117 234 5678'
    },
    items: [
      {
        productId: 'prod-010',
        productName: 'Facial Oil Blend',
        brandName: 'Dewyface',
        quantity: 1,
        pricePerItem: 42.00,
        totalPrice: 42.00,
        variant: '30ml',
        product: { isPreorder: false }
      }
    ],
    totalAmount: {
      items: 42.00,
      tax: 8.40,
      shipping: 5.99,
      total: 56.39
    },
    paymentMethod: 'card',
    createdAt: Timestamp.fromDate(new Date('2024-01-19T13:20:00')),
    notes: 'Customer cancelled - payment refunded'
  }
]

async function createSampleOrders() {
  console.log('Creating sample orders in Firebase...')
  
  try {
    for (const order of sampleOrders) {
      const docRef = await addDoc(collection(db, 'orders'), order)
      console.log(`Created order ${order.orderNumber} with ID: ${docRef.id}`)
    }
    
    console.log('\n✅ Successfully created all sample orders!')
    console.log('You can now view them in the admin orders page.')
    process.exit(0)
  } catch (error) {
    console.error('Error creating sample orders:', error)
    process.exit(1)
  }
}

// Run the script
createSampleOrders()