import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../serviceAccountKey.json'), 'utf-8')
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: 'lovingyourskinshop'
});

const db = getFirestore();

// Helper function to generate timeline based on status
function generateTimeline(status, createdDate) {
  const timeline = [];
  const statusOrder = ['pending', 'confirmed', 'processing', 'invoiced', 'paid', 'preparing', 'shipped', 'delivered', 'completed'];
  
  // Handle cancelled status specially
  if (status === 'cancelled') {
    timeline.push({
      status: 'pending',
      description: 'Order pending',
      timestamp: Timestamp.fromDate(createdDate)
    });
    const cancelDate = new Date(createdDate);
    cancelDate.setHours(cancelDate.getHours() + 2);
    timeline.push({
      status: 'cancelled',
      description: 'Order cancelled',
      timestamp: Timestamp.fromDate(cancelDate)
    });
    return timeline;
  }
  
  const currentIndex = statusOrder.indexOf(status);
  
  if (currentIndex >= 0) {
    // Add all statuses up to the current one
    for (let i = 0; i <= currentIndex; i++) {
      const date = new Date(createdDate);
      date.setHours(date.getHours() + (i * 24)); // Each status 1 day apart
      
      timeline.push({
        status: statusOrder[i],
        description: `Order ${statusOrder[i]}`,
        timestamp: Timestamp.fromDate(date)
      });
    }
  }
  
  return timeline;
}

// Sample orders
const orders = [
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
      }
    ],
    totalAmount: {
      items: 90.00,
      tax: 18.00,
      shipping: 5.99,
      total: 113.99
    },
    paymentMethod: 'card',
    createdAt: Timestamp.fromDate(new Date('2024-01-15')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-22')),
    timeline: generateTimeline('delivered', new Date('2024-01-15')),
    trackingNumber: 'GB123456789',
    notes: 'Gift wrapping requested',
    documents: []
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
      country: 'United Kingdom'
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
      }
    ],
    totalAmount: {
      items: 768.00,
      tax: 153.60,
      shipping: 15.00,
      total: 936.60
    },
    paymentMethod: 'invoice',
    createdAt: Timestamp.fromDate(new Date('2024-01-18')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-23')),
    timeline: generateTimeline('shipped', new Date('2024-01-18')),
    trackingNumber: 'GB987654321',
    documents: []
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
      country: 'United Kingdom'
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
    createdAt: Timestamp.fromDate(new Date('2024-01-20')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-21')),
    timeline: generateTimeline('processing', new Date('2024-01-20')),
    notes: 'Contains pre-order items - ship when available',
    documents: []
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
      country: 'United Kingdom'
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
    createdAt: Timestamp.fromDate(new Date('2024-01-22')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-22')),
    timeline: generateTimeline('pending', new Date('2024-01-22')),
    documents: []
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
      country: 'United Kingdom'
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
    createdAt: Timestamp.fromDate(new Date('2024-01-23')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-23')),
    timeline: generateTimeline('pending', new Date('2024-01-23')),
    notes: 'Mixed order with pre-order items - partial shipment acceptable',
    documents: []
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
      country: 'United Kingdom'
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
    createdAt: Timestamp.fromDate(new Date('2024-01-19')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-19')),
    timeline: generateTimeline('cancelled', new Date('2024-01-19')),
    notes: 'Customer cancelled - payment refunded',
    documents: []
  }
];

async function addOrders() {
  console.log('Adding sample orders to Firestore...\n');
  
  for (const order of orders) {
    try {
      const docRef = await db.collection('orders').add(order);
      console.log(`✅ Added ${order.orderNumber} (${order.status}) - ID: ${docRef.id}`);
    } catch (error) {
      console.error(`❌ Failed to add ${order.orderNumber}:`, error.message);
    }
  }
  
  console.log('\nDone! Check the admin orders page to see the orders.');
  process.exit(0);
}

addOrders();