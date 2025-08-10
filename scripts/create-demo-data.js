#!/usr/bin/env node

/**
 * Create Demo Data Script
 * Creates comprehensive demo records in Firebase Firestore
 * Run with: node scripts/create-demo-data.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'lovingyourskinshop'
});

const db = admin.firestore();
const auth = admin.auth();
const { Timestamp } = admin.firestore;

// Helper function to create timestamps
const now = Timestamp.now();
const futureDate = (days) => Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
const pastDate = (days) => Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

async function createDemoData() {
  console.log('🚀 Starting demo data creation...\n');

  try {
    // ============================
    // 1. CREATE DEMO USERS
    // ============================
    console.log('👥 Creating demo users...');

    // Demo Admin User
    const demoAdminUser = {
      id: 'demo-admin',
      email: 'demo-admin@lovingyourskin.test',
      displayName: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
      companyName: 'Loving Your Skin',
      language: 'en',
      address: {
        street: '123 Admin Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'UK'
      },
      phone: '+44 20 7946 0958',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };

    // Demo Retailer User
    const demoRetailerUser = {
      id: 'demo-retailer',
      email: 'demo-retailer@beautystore.test',
      displayName: 'Demo Retailer',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'retailer',
      status: 'active',
      companyId: 'beauty-store-ltd',
      companyName: 'Beauty Store Ltd',
      salesRepId: 'sales-rep-001',
      language: 'en',
      address: {
        street: '456 Retail Avenue',
        city: 'Manchester',
        postcode: 'M1 1AE',
        country: 'UK'
      },
      phone: '+44 161 234 5678',
      createdAt: pastDate(30),
      updatedAt: now,
      lastLoginAt: now
    };

    // Demo Brand User
    const demoBrandUser = {
      id: 'demo-brand-user',
      email: 'demo@demobrand.test',
      displayName: 'Demo Brand Manager',
      firstName: 'John',
      lastName: 'Smith',
      role: 'brand',
      status: 'active',
      companyId: 'demo-brand',
      brandId: 'demo-brand',
      companyName: 'DemoBrand International',
      language: 'en',
      address: {
        street: '789 Brand Plaza',
        city: 'Seoul',
        postcode: '06234',
        country: 'South Korea'
      },
      phone: '+82 2 1234 5678',
      createdAt: pastDate(60),
      updatedAt: now,
      lastLoginAt: now
    };

    // Demo Consumer User
    const demoConsumerUser = {
      id: 'demo-consumer',
      email: 'demo-consumer@gmail.test',
      displayName: 'Emma Wilson',
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'consumer',
      status: 'active',
      language: 'en',
      wishlist: ['demo-product-1', 'demo-product-2'],
      newsletter: true,
      address: {
        street: '321 Consumer Lane',
        city: 'Birmingham',
        postcode: 'B1 1AA',
        country: 'UK'
      },
      phone: '+44 121 987 6543',
      createdAt: pastDate(15),
      updatedAt: now,
      lastLoginAt: now
    };

    // Add users to Firestore
    await db.collection('users').doc('demo-admin').set(demoAdminUser);
    await db.collection('users').doc('demo-retailer').set(demoRetailerUser);
    await db.collection('users').doc('demo-brand-user').set(demoBrandUser);
    await db.collection('users').doc('demo-consumer').set(demoConsumerUser);
    console.log('✅ Demo users created\n');

    // ============================
    // 2. CREATE DEMO BRAND
    // ============================
    console.log('🏢 Creating demo brand...');

    const demoBrand = {
      id: 'demo-brand',
      slug: 'demo-brand',
      name: {
        en: 'DemoBrand',
        ko: '데모브랜드',
        zh: '演示品牌'
      },
      tagline: 'Excellence in Skincare Innovation',
      description: {
        en: 'DemoBrand is a leading innovator in K-beauty skincare, combining traditional Korean beauty secrets with cutting-edge science. Our products are designed to deliver visible results while being gentle on all skin types.',
        ko: '데모브랜드는 전통적인 한국 미용 비법과 최첨단 과학을 결합한 K-뷰티 스킨케어의 선도적인 혁신 기업입니다.',
        zh: '演示品牌是K-beauty护肤品的领先创新者，将传统的韩国美容秘诀与尖端科学相结合。'
      },
      logo: 'https://via.placeholder.com/200x80/D4A5A5/ffffff?text=DemoBrand',
      heroImage: 'https://via.placeholder.com/1920x600/FDF8F6/D4A5A5?text=DemoBrand+Hero',
      heroImages: [
        'https://via.placeholder.com/1920x600/FDF8F6/D4A5A5?text=Hero+1',
        'https://via.placeholder.com/1920x600/D4A5A5/ffffff?text=Hero+2',
        'https://via.placeholder.com/1920x600/1A1A1A/D4A5A5?text=Hero+3'
      ],
      establishedYear: 2015,
      productCount: 2,
      certifications: ['CPNP_UK', 'CPNP_EU', 'VEGAN', 'CRUELTY_FREE'],
      featureTags: [
        'Natural Ingredients',
        'Clinically Tested',
        'Vegan Friendly',
        'Sustainable Packaging'
      ],
      technologies: [
        {
          name: 'HydraLock Technology',
          description: 'Advanced moisture retention system that locks hydration for 72 hours',
          patent: 'KR-10-2020-123456'
        },
        {
          name: 'BioFerment Complex',
          description: 'Proprietary fermentation process enhancing ingredient bioavailability'
        }
      ],
      categories: ['Skincare', 'Anti-Aging', 'Hydration'],
      stats: {
        yearsInBusiness: 9,
        productsSold: '500K+',
        customerSatisfaction: 97
      },
      clinicalResults: {
        skinHydration: {
          value: 89,
          duration: '24 hours'
        },
        wrinkleReduction: {
          value: 76,
          duration: '8 weeks'
        },
        customerSatisfaction: {
          value: 97,
          unit: '%'
        }
      },
      active: true,
      featured: true,
      minimumOrder: 50,
      country: 'South Korea',
      logoStyle: {
        height: '40px',
        objectFit: 'contain',
        backgroundColor: 'transparent'
      },
      createdAt: pastDate(90),
      updatedAt: now
    };

    await db.collection('brands').doc('demo-brand').set(demoBrand);
    console.log('✅ Demo brand created\n');

    // ============================
    // 3. CREATE DEMO PRODUCTS
    // ============================
    console.log('📦 Creating demo products...');

    const demoProduct1 = {
      id: 'demo-product-1',
      brandId: 'demo-brand',
      brand: {
        id: 'demo-brand',
        name: 'DemoBrand'
      },
      name: 'Hydra Glow Serum',
      slug: 'hydra-glow-serum',
      description: 'A revolutionary hydrating serum that delivers intense moisture while brightening your complexion. Formulated with our patented HydraLock Technology and enriched with hyaluronic acid, niacinamide, and vitamin C.',
      shortDescription: 'Intensive hydrating and brightening serum',
      category: 'skincare',
      subcategory: 'serums',
      tags: ['hydrating', 'brightening', 'anti-aging', 'vegan', 'bestseller'],
      images: {
        primary: 'https://via.placeholder.com/600x600/FDF8F6/D4A5A5?text=Hydra+Glow+Serum',
        gallery: [
          'https://via.placeholder.com/600x600/FDF8F6/D4A5A5?text=Serum+1',
          'https://via.placeholder.com/600x600/D4A5A5/ffffff?text=Serum+2',
          'https://via.placeholder.com/600x600/1A1A1A/D4A5A5?text=Serum+3'
        ]
      },
      ingredients: 'Water, Glycerin, Niacinamide (5%), Sodium Hyaluronate, Ascorbic Acid, Panthenol, Allantoin, Adenosine',
      usage: 'Apply 2-3 drops to clean face and neck morning and evening. Gently pat for better absorption.',
      status: 'active',
      featured: true,
      isPreorder: false,
      specifications: {
        certifications: ['CPNP', 'VEGAN'],
        expiryDate: '36 months',
        features: [
          '72-hour hydration',
          'Brightens dark spots',
          'Improves skin texture',
          'Non-comedogenic'
        ],
        keyIngredient: 'Hyaluronic Acid Complex',
        origin: 'Korea',
        pao: '12M',
        setContents: '1 x 30ml bottle',
        treatmentDuration: '4 weeks for visible results'
      },
      variants: [
        {
          variantId: 'variant-30ml',
          sku: 'DEMO-HGS-30ML',
          color: null,
          colorHex: null,
          size: 30,
          sizeUnit: 'ml',
          isDefault: true,
          status: 'active',
          inventory: {
            b2b: {
              stock: 500,
              available: 450,
              reserved: 50
            },
            b2c: {
              stock: 200,
              available: 180,
              reserved: 20
            }
          },
          pricing: {
            b2b: {
              enabled: true,
              wholesalePrice: 25,
              minOrderQuantity: 10,
              unitsPerCarton: 24,
              currency: 'USD'
            },
            b2c: {
              enabled: true,
              retailPrice: 65,
              salePrice: null,
              currency: 'USD'
            }
          }
        }
      ],
      createdAt: pastDate(60),
      updatedAt: now
    };

    const demoProduct2 = {
      id: 'demo-product-2',
      brandId: 'demo-brand',
      brand: {
        id: 'demo-brand',
        name: 'DemoBrand'
      },
      name: 'Youth Restore Cream',
      slug: 'youth-restore-cream',
      description: 'A luxurious anti-aging cream that targets fine lines, wrinkles, and loss of elasticity. Features our exclusive BioFerment Complex with peptides and ceramides for complete skin renewal.',
      shortDescription: 'Anti-aging renewal cream with peptides',
      category: 'skincare',
      subcategory: 'moisturizers',
      tags: ['anti-aging', 'moisturizing', 'peptides', 'luxury', 'night-cream'],
      images: {
        primary: 'https://via.placeholder.com/600x600/FDF8F6/D4A5A5?text=Youth+Restore+Cream',
        gallery: [
          'https://via.placeholder.com/600x600/FDF8F6/D4A5A5?text=Cream+1',
          'https://via.placeholder.com/600x600/D4A5A5/ffffff?text=Cream+2'
        ]
      },
      ingredients: 'Water, Glycerin, Cetyl Alcohol, Peptide Complex, Ceramide NP, Retinol, Squalane, Shea Butter',
      usage: 'Apply to cleansed face and neck in upward motions. Use nightly for best results.',
      status: 'active',
      featured: false,
      isPreorder: true,
      preorderDiscount: 15,
      preorderEndDate: futureDate(30).toDate().toISOString(),
      specifications: {
        certifications: ['CPNP', 'DERMATOLOGIST_TESTED'],
        expiryDate: '24 months',
        features: [
          'Reduces wrinkles in 4 weeks',
          'Improves elasticity',
          'Deep moisturization',
          'Night repair formula'
        ],
        keyIngredient: 'Peptide Complex',
        origin: 'Korea',
        pao: '6M',
        setContents: '1 x 50ml jar'
      },
      variants: [
        {
          variantId: 'variant-50ml',
          sku: 'DEMO-YRC-50ML',
          color: null,
          colorHex: null,
          size: 50,
          sizeUnit: 'ml',
          isDefault: true,
          status: 'active',
          inventory: {
            b2b: {
              stock: 300,
              available: 280,
              reserved: 20
            },
            b2c: {
              stock: 150,
              available: 145,
              reserved: 5
            }
          },
          pricing: {
            b2b: {
              enabled: true,
              wholesalePrice: 40,
              minOrderQuantity: 6,
              unitsPerCarton: 12,
              currency: 'USD'
            },
            b2c: {
              enabled: true,
              retailPrice: 95,
              salePrice: 80.75,
              currency: 'USD'
            }
          }
        }
      ],
      createdAt: pastDate(30),
      updatedAt: now
    };

    await db.collection('products').doc('demo-product-1').set(demoProduct1);
    await db.collection('products').doc('demo-product-2').set(demoProduct2);
    console.log('✅ Demo products created\n');

    // ============================
    // 4. CREATE DEMO INVITE CODES
    // ============================
    console.log('🎫 Creating demo invite codes...');

    const demoInviteCodes = [
      {
        id: 'DEMO-RETAILER-ABC123',
        code: 'DEMO-RETAILER-ABC123',
        email: 'new-retailer@example.test',
        role: 'retailer',
        companyId: 'new-beauty-shop',
        salesRepId: 'sales-rep-001',
        createdBy: 'demo-admin',
        used: false,
        expiresAt: futureDate(30),
        createdAt: now
      },
      {
        id: 'DEMO-BRAND-XYZ789',
        code: 'DEMO-BRAND-XYZ789',
        email: 'new-brand@example.test',
        role: 'brand',
        companyId: 'new-cosmetics-brand',
        salesRepId: 'sales-rep-002',
        createdBy: 'demo-admin',
        used: true,
        usedBy: 'demo-brand-user',
        usedAt: pastDate(5),
        expiresAt: futureDate(25),
        createdAt: pastDate(10)
      }
    ];

    for (const inviteCode of demoInviteCodes) {
      await db.collection('inviteCodes').doc(inviteCode.id).set(inviteCode);
    }
    console.log('✅ Demo invite codes created\n');

    // ============================
    // 5. CREATE DEMO AFFILIATE CODE
    // ============================
    console.log('🏷️ Creating demo affiliate code...');

    const demoAffiliateCode = {
      id: 'DEMO10',
      code: 'DEMO10',
      affiliateId: 'demo-affiliate-partner',
      campaignId: 'summer-2025',
      discountPercent: 10,
      commissionPercent: 5,
      usageCount: 15,
      maxUsage: 100,
      active: true,
      expiresAt: futureDate(60),
      createdAt: pastDate(30)
    };

    await db.collection('affiliateCodes').doc('DEMO10').set(demoAffiliateCode);
    console.log('✅ Demo affiliate code created\n');

    // ============================
    // 6. CREATE DEMO B2B ORDER
    // ============================
    console.log('📋 Creating demo B2B order...');

    const demoB2BOrder = {
      id: 'order-b2b-001',
      orderNumber: 'ORD-B2B-2025-001',
      retailerId: 'demo-retailer',
      brandId: 'demo-brand',
      items: [
        {
          productId: 'demo-product-1',
          variantId: 'variant-30ml',
          productName: 'Hydra Glow Serum',
          sku: 'DEMO-HGS-30ML',
          quantity: 48,
          unitPrice: 25,
          total: 1200
        },
        {
          productId: 'demo-product-2',
          variantId: 'variant-50ml',
          productName: 'Youth Restore Cream',
          sku: 'DEMO-YRC-50ML',
          quantity: 24,
          unitPrice: 40,
          total: 960
        }
      ],
      status: 'processing',
      subtotal: 2160,
      shipping: 50,
      tax: 216,
      total: 2426,
      currency: 'USD',
      shippingAddress: {
        name: 'Beauty Store Ltd',
        street: '456 Retail Avenue',
        city: 'Manchester',
        postalCode: 'M1 1AE',
        country: 'UK',
        phone: '+44 161 234 5678'
      },
      billingAddress: {
        name: 'Beauty Store Ltd',
        street: '456 Retail Avenue',
        city: 'Manchester',
        postalCode: 'M1 1AE',
        country: 'UK',
        phone: '+44 161 234 5678'
      },
      notes: 'Please include product information cards for retail display',
      createdAt: pastDate(3),
      updatedAt: now
    };

    await db.collection('orders').doc('order-b2b-001').set(demoB2BOrder);
    console.log('✅ Demo B2B order created\n');

    // ============================
    // 7. CREATE DEMO B2C ORDER
    // ============================
    console.log('🛍️ Creating demo B2C consumer order...');

    const demoConsumerOrder = {
      id: 'order-b2c-001',
      orderNumber: 'ORD-B2C-2025-001',
      userId: 'demo-consumer',
      items: [
        {
          productId: 'demo-product-1',
          variantId: 'variant-30ml',
          productName: 'Hydra Glow Serum',
          sku: 'DEMO-HGS-30ML',
          quantity: 2,
          unitPrice: 65,
          total: 130
        }
      ],
      status: 'shipped',
      subtotal: 130,
      shipping: 5.99,
      tax: 13,
      discount: 13,
      affiliateCode: 'DEMO10',
      total: 135.99,
      currency: 'USD',
      shippingAddress: {
        name: 'Emma Wilson',
        street: '321 Consumer Lane',
        city: 'Birmingham',
        postalCode: 'B1 1AA',
        country: 'UK',
        phone: '+44 121 987 6543'
      },
      billingAddress: {
        name: 'Emma Wilson',
        street: '321 Consumer Lane',
        city: 'Birmingham',
        postalCode: 'B1 1AA',
        country: 'UK',
        phone: '+44 121 987 6543'
      },
      paymentMethod: 'card',
      paymentStatus: 'paid',
      trackingNumber: 'TRACK123456789',
      createdAt: pastDate(5),
      updatedAt: pastDate(2)
    };

    await db.collection('consumer-orders').doc('order-b2c-001').set(demoConsumerOrder);
    console.log('✅ Demo B2C order created\n');

    // ============================
    // 8. CREATE DEMO CART
    // ============================
    console.log('🛒 Creating demo cart...');

    const demoCart = {
      items: [
        {
          productId: 'demo-product-2',
          variantId: 'variant-50ml',
          quantity: 1,
          addedAt: now
        }
      ],
      lastUpdated: now
    };

    await db.collection('carts').doc('demo-consumer').set(demoCart);
    console.log('✅ Demo cart created\n');

    // ============================
    // 9. CREATE DEMO WISHLIST
    // ============================
    console.log('❤️ Creating demo wishlist...');

    const demoWishlist = {
      productIds: ['demo-product-1', 'demo-product-2'],
      lastUpdated: now
    };

    await db.collection('wishlists').doc('demo-consumer').set(demoWishlist);
    console.log('✅ Demo wishlist created\n');

    // ============================
    // 10. CREATE DEMO REVIEWS
    // ============================
    console.log('⭐ Creating demo reviews...');

    const demoReviews = [
      {
        id: 'review-001',
        productId: 'demo-product-1',
        userId: 'demo-consumer',
        userName: 'Emma Wilson',
        rating: 5,
        title: 'Amazing serum!',
        content: 'This serum has transformed my skin. The hydration lasts all day and my skin looks so much brighter. Highly recommend!',
        verified: true,
        helpful: 24,
        images: [],
        createdAt: pastDate(10),
        updatedAt: pastDate(10)
      },
      {
        id: 'review-002',
        productId: 'demo-product-1',
        userId: 'user-abc123',
        userName: 'Jennifer K.',
        rating: 4,
        title: 'Good but pricey',
        content: 'The product works well and my skin feels hydrated. The only downside is the price point, but quality is definitely there.',
        verified: true,
        helpful: 8,
        images: [],
        createdAt: pastDate(7),
        updatedAt: pastDate(7)
      }
    ];

    for (const review of demoReviews) {
      await db.collection('reviews').doc(review.id).set(review);
    }
    console.log('✅ Demo reviews created\n');

    // ============================
    // 11. CREATE DEMO MESSAGES
    // ============================
    console.log('💬 Creating demo messages...');

    const demoMessages = [
      // Message from retailer about B2B order
      {
        id: 'msg-001',
        senderId: 'demo-retailer',
        recipientId: 'demo-admin',
        subject: 'Order ORD-B2B-2025-001 - Urgent Delivery Request',
        content: 'Hi, I need order ORD-B2B-2025-001 expedited if possible. We have a special event next week and would really appreciate faster shipping. Happy to pay extra for express delivery. Can you please update the shipping method?',
        read: true,
        attachments: [],
        createdAt: pastDate(2)
      },
      // Admin response to retailer
      {
        id: 'msg-002',
        senderId: 'demo-admin',
        recipientId: 'demo-retailer',
        subject: 'RE: Order ORD-B2B-2025-001 - Urgent Delivery Request',
        content: 'Hi Sarah, I\'ve updated your order to express shipping. It will now arrive by Friday. The additional shipping cost of £25 has been added to your invoice. Tracking: EXP-TRACK-123456',
        read: true,
        attachments: [],
        createdAt: pastDate(2)
      },
      // Message from brand about the same B2B order
      {
        id: 'msg-003',
        senderId: 'demo-brand-user',
        recipientId: 'demo-admin',
        subject: 'Stock Update for Order ORD-B2B-2025-001',
        content: 'We\'ve packed order ORD-B2B-2025-001 for Beauty Store Ltd. All 48 units of Hydra Glow Serum and 24 units of Youth Restore Cream are ready. We\'ve included extra product samples and promotional materials as requested. Ready for pickup by courier.',
        read: true,
        attachments: ['https://example.com/packing-list.pdf'],
        createdAt: pastDate(1)
      },
      // Consumer inquiry about B2C order
      {
        id: 'msg-004',
        senderId: 'demo-consumer',
        recipientId: 'demo-admin',
        subject: 'Order ORD-B2C-2025-001 - Delivery Status',
        content: 'Hello, I placed order ORD-B2C-2025-001 five days ago and the tracking shows it\'s been in transit for 3 days. Could you please check the status? I need it before this weekend for a special occasion. Thanks!',
        read: false,
        attachments: [],
        createdAt: pastDate(1)
      },
      // Admin response to consumer
      {
        id: 'msg-005',
        senderId: 'demo-admin',
        recipientId: 'demo-consumer',
        subject: 'RE: Order ORD-B2C-2025-001 - Delivery Status',
        content: 'Hi Emma, Your order is currently with the local delivery partner and scheduled for delivery tomorrow (Thursday) between 10am-2pm. You\'ll receive an SMS notification in the morning with a 1-hour delivery window. The package is currently at the Birmingham distribution center.',
        read: false,
        attachments: [],
        createdAt: now
      },
      // Brand promotional message
      {
        id: 'msg-006',
        senderId: 'demo-brand-user',
        recipientId: 'demo-admin',
        subject: 'New Pre-Order Campaign - Youth Restore Cream',
        content: 'We\'re launching a pre-order campaign for Youth Restore Cream with 15% discount. Can we feature this on the homepage? We have marketing materials ready and can provide banner designs. Expected high demand based on our social media engagement.',
        read: false,
        attachments: ['https://example.com/marketing-pack.zip'],
        createdAt: now
      }
    ];

    for (const message of demoMessages) {
      await db.collection('messages').doc(message.id).set(message);
    }
    console.log('✅ Demo messages created\n');

    // ============================
    // 12. CREATE DEMO CONFIG
    // ============================
    console.log('⚙️ Creating demo config...');

    const demoConfigs = [
      {
        id: 'shipping-rates',
        value: {
          domestic: {
            standard: 5.99,
            express: 12.99,
            overnight: 24.99
          },
          international: {
            standard: 19.99,
            express: 39.99
          }
        },
        type: 'object',
        description: 'Shipping rate configuration',
        updatedAt: now,
        updatedBy: 'demo-admin'
      },
      {
        id: 'tax-rate',
        value: 0.10,
        type: 'number',
        description: 'Default tax rate (10%)',
        updatedAt: now,
        updatedBy: 'demo-admin'
      },
      {
        id: 'minimum-order-b2b',
        value: 500,
        type: 'number',
        description: 'Minimum order value for B2B orders in USD',
        updatedAt: now,
        updatedBy: 'demo-admin'
      }
    ];

    for (const config of demoConfigs) {
      await db.collection('config').doc(config.id).set(config);
    }
    console.log('✅ Demo config created\n');

    // ============================
    // 13. CREATE DEMO ANALYTICS
    // ============================
    console.log('📊 Creating demo analytics...');

    const demoAnalytics = [
      {
        id: 'sales-daily-20250109',
        type: 'sales',
        data: {
          revenue: 3547.89,
          orders: 12,
          averageOrderValue: 295.66,
          topProduct: 'demo-product-1',
          topBrand: 'demo-brand'
        },
        period: 'daily',
        timestamp: now
      },
      {
        id: 'traffic-daily-20250109',
        type: 'traffic',
        data: {
          visitors: 845,
          pageViews: 3420,
          bounceRate: 0.32,
          averageSessionDuration: 245,
          topPages: ['/products/hydra-glow-serum', '/brands/demo-brand']
        },
        period: 'daily',
        timestamp: now
      },
      {
        id: 'conversion-weekly-202502',
        type: 'conversion',
        data: {
          conversionRate: 0.034,
          cartAbandonment: 0.68,
          checkoutCompletion: 0.72,
          returnCustomerRate: 0.23
        },
        period: 'weekly',
        timestamp: now
      }
    ];

    for (const analytics of demoAnalytics) {
      await db.collection('analytics').doc(analytics.id).set(analytics);
    }
    console.log('✅ Demo analytics created\n');

    console.log('🎉 All demo data created successfully!');
    console.log('\nDemo Users:');
    console.log('  - Admin: demo-admin@lovingyourskin.test');
    console.log('  - Retailer: demo-retailer@beautystore.test');
    console.log('  - Brand: demo@demobrand.test');
    console.log('  - Consumer: demo-consumer@gmail.test');
    console.log('\nDemo Brand: demo-brand (DemoBrand)');
    console.log('Demo Products: demo-product-1, demo-product-2');
    console.log('Demo Affiliate Code: DEMO10 (10% off)');
    console.log('Demo Orders: order-b2b-001, order-b2c-001');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
createDemoData();