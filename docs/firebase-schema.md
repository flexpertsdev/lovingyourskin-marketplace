# Firebase Firestore Schema Documentation

> **Project ID**: `lovingyourskinshop`  
> **Last Updated**: January 2025  
> **Purpose**: Single source of truth for Firestore database schema

## Overview

This document defines the complete schema for all Firestore collections in the Loving Your Skin application. It serves as the authoritative reference for field structures, data types, relationships, and validation rules.

## Collections

### 1. `brands` ✅ (Active)

Brand information for all suppliers in the platform.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique brand identifier (slug format) |
| `slug` | string | Yes | URL-friendly identifier |
| `name` | object | Yes | Multi-language brand name |
| `tagline` | string | No | Brand tagline/slogan |
| `description` | string | Yes | Multi-language descriptions |
| `logo` | string | Yes | Logo image URL |
| `heroImage` | string | No | Primary hero image URL |
| `heroImages` | string[] | No | Array of hero image URLs |
| `establishedYear` | number | No | Year brand was established |
| `productCount` | number | Yes | Number of products |
| `certifications` | string[] | No | Array of certification codes |
| `featureTags` | string[] | No | Key features/benefits |
| `technologies` | object[] | No | Proprietary technologies |
| `technologies[].name` | string | Yes | Technology name |
| `technologies[].description` | string | Yes | Technology description |
| `technologies[].patent` | string | No | Patent number |
| `categories` | string[] | Yes | Product categories |
| `stats` | object | No | Brand statistics |
| `stats.yearsInBusiness` | number | No | Years operating |
| `stats.productsSold` | string | No | Total products sold |
| `stats.customerSatisfaction` | number | No | Satisfaction percentage |
| `active` | boolean | Yes | Brand active status |
| `featured` | boolean | No | Featured brand flag |
| `minimumOrder` | number | Yes | MOQ for B2B orders |
| `country` | string | Yes | Country of origin |
| `createdAt` | timestamp | Yes | Creation timestamp |
| `updatedAt` | timestamp | Yes | Last update timestamp |

### 2. `products` ✅ (Active)

Product catalog with variants and pricing for both B2B and B2C.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique product identifier |
| `brandId` | string | Yes | Reference to brand |
| `brand` | object | Yes | Brand reference object |
| `brand.id` | string | Yes | Brand ID |
| `brand.name` | string | Yes | Brand display name |
| `name` | string | Yes | Product name |
| `slug` | string | Yes | URL-friendly identifier |
| `description` | string | Yes | Full product description |
| `shortDescription` | string | No | Brief description |
| `category` | string | Yes | Primary category |
| `subcategory` | string | No | Secondary category |
| `tags` | string[] | Yes | Product tags |
| `images` | object | Yes | Product images |
| `images.primary` | string | Yes | Main product image URL |
| `images.gallery` | string[] | Yes | Additional image URLs |
| `ingredients` | string | No | Product ingredients |
| `usage` | string | No | Usage instructions |
| `status` | string | Yes | `active`, `presale`, `discontinued`, `out-of-stock` |
| `featured` | boolean | Yes | Featured product flag |
| `isPreorder` | boolean | Yes | Pre-order availability |
| `preorderDiscount` | number | No | Pre-order discount percentage |
| `preorderEndDate` | string | No | Pre-order end date (ISO) |
| `specifications` | object | No | Product specifications |
| `specifications.certifications` | string[] | No | Product certifications |
| `specifications.expiryDate` | string | No | Expiry date |
| `specifications.features` | string[] | No | Key features |
| `specifications.keyIngredient` | string | No | Main ingredient |
| `specifications.origin` | string | No | Country of origin |
| `specifications.pao` | string | No | Period after opening |
| `specifications.setContents` | string | No | Set contents description |
| `specifications.treatmentDuration` | string | No | Treatment duration |
| `variants` | ProductVariant[] | Yes | Product variants array |
| `createdAt` | timestamp | Yes | Creation timestamp |
| `updatedAt` | timestamp/string | Yes | Last update timestamp |

#### ProductVariant Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `variantId` | string | Yes | Unique variant identifier |
| `sku` | string | Yes | Stock keeping unit |
| `color` | string/null | No | Color name |
| `colorHex` | string/null | No | Color hex code |
| `size` | number/null | No | Size value |
| `sizeUnit` | string/null | No | Size unit (ml, g, etc.) |
| `isDefault` | boolean | Yes | Default variant flag |
| `status` | string | Yes | `active` or `inactive` |
| `inventory` | object | Yes | Inventory tracking |
| `inventory.b2b` | object | Yes | B2B inventory |
| `inventory.b2b.stock` | number | Yes | Total B2B stock |
| `inventory.b2b.available` | number | Yes | Available B2B stock |
| `inventory.b2b.reserved` | number | Yes | Reserved B2B stock |
| `inventory.b2c` | object | Yes | B2C inventory |
| `inventory.b2c.stock` | number | Yes | Total B2C stock |
| `inventory.b2c.available` | number | Yes | Available B2C stock |
| `inventory.b2c.reserved` | number | Yes | Reserved B2C stock |
| `pricing` | object | Yes | Pricing structure |
| `pricing.b2b` | object | Yes | B2B pricing |
| `pricing.b2b.enabled` | boolean | Yes | B2B availability |
| `pricing.b2b.wholesalePrice` | number | Yes | Wholesale price |
| `pricing.b2b.minOrderQuantity` | number | Yes | MOQ |
| `pricing.b2b.unitsPerCarton` | number/null | No | Units per carton |
| `pricing.b2b.currency` | string | Yes | Currency code |
| `pricing.b2c` | object | Yes | B2C pricing |
| `pricing.b2c.enabled` | boolean | Yes | B2C availability |
| `pricing.b2c.retailPrice` | number | Yes | Retail price |
| `pricing.b2c.salePrice` | number/null | No | Sale price |
| `pricing.b2c.currency` | string | Yes | Currency code |

### 3. `users` ✅ (Active)

User accounts with role-based access control.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Firebase Auth UID |
| `email` | string | Yes | User email address |
| `displayName` | string | No | Display name |
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `role` | string | Yes | `admin`, `retailer`, `brand`, `consumer` |
| `status` | string | Yes | `active`, `suspended`, `pending` |
| `companyId` | string | No | Associated company ID |
| `companyName` | string | No | Company name |
| `brandId` | string | No | Associated brand ID (for brand users) |
| `salesRepId` | string | No | Linked sales representative |
| `language` | string | No | `en`, `ko`, `zh` |
| `address` | object | No | User address |
| `address.street` | string | No | Street address |
| `address.city` | string | No | City |
| `address.postcode` | string | No | Postal code |
| `address.country` | string | No | Country |
| `phone` | string | No | Phone number |
| `wishlist` | string[] | No | Product IDs (consumers) |
| `newsletter` | boolean | No | Newsletter subscription |
| `createdAt` | timestamp | Yes | Account creation |
| `updatedAt` | timestamp | Yes | Last profile update |
| `lastLoginAt` | timestamp | No | Last login time |

### 4. `inviteCodes` ✅ (Active)

Invite codes for B2B user registration.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique code ID |
| `code` | string | Yes | Invite code string |
| `email` | string | Yes | Intended recipient email |
| `role` | string | Yes | User role to assign |
| `companyId` | string | No | Company to associate |
| `salesRepId` | string | No | Sales rep to link |
| `createdBy` | string | Yes | Creator's user ID |
| `used` | boolean | Yes | Usage status |
| `usedBy` | string | No | User ID who used code |
| `usedAt` | timestamp | No | Usage timestamp |
| `expiresAt` | timestamp | Yes | Expiration timestamp |
| `createdAt` | timestamp | Yes | Creation timestamp |

### 5. `affiliateCodes` 🔄 (Planned)

Affiliate tracking codes for marketing.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique code ID |
| `code` | string | Yes | Affiliate code |
| `affiliateId` | string | Yes | Affiliate user ID |
| `campaignId` | string | No | Marketing campaign ID |
| `discountPercent` | number | No | Discount percentage |
| `commissionPercent` | number | Yes | Affiliate commission |
| `usageCount` | number | Yes | Times used |
| `maxUsage` | number | No | Maximum usage limit |
| `active` | boolean | Yes | Active status |
| `expiresAt` | timestamp | No | Expiration date |
| `createdAt` | timestamp | Yes | Creation timestamp |

### 6. `orders` 🔄 (Planned - B2B)

B2B wholesale orders.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Order ID |
| `orderNumber` | string | Yes | Human-readable order number |
| `retailerId` | string | Yes | Retailer user ID |
| `brandId` | string | Yes | Brand ID |
| `items` | OrderItem[] | Yes | Order items |
| `status` | string | Yes | Order status (see statuses below) |
| `subtotal` | number | Yes | Subtotal amount |
| `shipping` | number | Yes | Shipping cost |
| `tax` | number | Yes | Tax amount |
| `total` | number | Yes | Total amount |
| `currency` | string | Yes | Currency code |
| `shippingAddress` | Address | Yes | Shipping details |
| `billingAddress` | Address | Yes | Billing details |
| `notes` | string | No | Order notes |
| `createdAt` | timestamp | Yes | Order date |
| `updatedAt` | timestamp | Yes | Last update |

**Order Statuses**: `pending`, `confirmed`, `processing`, `packed`, `shipped`, `delivered`, `cancelled`, `refunded`, `disputed`

### 7. `consumer-orders` 🔄 (Planned - B2C)

B2C consumer orders.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Order ID |
| `orderNumber` | string | Yes | Human-readable order number |
| `userId` | string | Yes | Consumer user ID |
| `items` | ConsumerOrderItem[] | Yes | Order items |
| `status` | string | Yes | Order status |
| `subtotal` | number | Yes | Subtotal amount |
| `shipping` | number | Yes | Shipping cost |
| `tax` | number | Yes | Tax amount |
| `discount` | number | No | Discount amount |
| `affiliateCode` | string | No | Applied affiliate code |
| `total` | number | Yes | Total amount |
| `currency` | string | Yes | Currency code |
| `shippingAddress` | Address | Yes | Shipping details |
| `billingAddress` | Address | Yes | Billing details |
| `paymentMethod` | string | Yes | Payment method |
| `paymentStatus` | string | Yes | Payment status |
| `trackingNumber` | string | No | Shipment tracking |
| `createdAt` | timestamp | Yes | Order date |
| `updatedAt` | timestamp | Yes | Last update |

### 8. `carts` 🔄 (Planned)

Shopping carts for B2C users.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID (document ID) |
| `items` | CartItem[] | Yes | Cart items |
| `lastUpdated` | timestamp | Yes | Last modification |

### 9. `wishlists` 🔄 (Planned)

User wishlists for B2C.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User ID (document ID) |
| `productIds` | string[] | Yes | Array of product IDs |
| `lastUpdated` | timestamp | Yes | Last modification |

### 10. `reviews` 🔄 (Planned)

Product reviews and ratings.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Review ID |
| `productId` | string | Yes | Product ID |
| `userId` | string | Yes | Reviewer user ID |
| `userName` | string | Yes | Reviewer display name |
| `rating` | number | Yes | Rating (1-5) |
| `title` | string | No | Review title |
| `content` | string | Yes | Review text |
| `verified` | boolean | Yes | Verified purchase |
| `helpful` | number | Yes | Helpful votes count |
| `images` | string[] | No | Review image URLs |
| `createdAt` | timestamp | Yes | Review date |
| `updatedAt` | timestamp | Yes | Last edit |

### 11. `messages` 🔄 (Planned)

Internal messaging system.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Message ID |
| `senderId` | string | Yes | Sender user ID |
| `recipientId` | string | Yes | Recipient user ID |
| `subject` | string | Yes | Message subject |
| `content` | string | Yes | Message body |
| `read` | boolean | Yes | Read status |
| `attachments` | string[] | No | Attachment URLs |
| `createdAt` | timestamp | Yes | Send timestamp |

### 12. `config` 🔄 (Planned)

System configuration settings.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Config key |
| `value` | any | Yes | Config value |
| `type` | string | Yes | Value type |
| `description` | string | No | Setting description |
| `updatedAt` | timestamp | Yes | Last update |
| `updatedBy` | string | Yes | Admin who updated |

### 13. `analytics` 🔄 (Planned)

Analytics and metrics data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Metric ID |
| `type` | string | Yes | Metric type |
| `data` | object | Yes | Metric data |
| `period` | string | Yes | Time period |
| `timestamp` | timestamp | Yes | Record time |

## Indexes

### Required Composite Indexes

1. **products**
   - `brandId` + `status` + `createdAt DESC`
   - `category` + `status` + `featured DESC`
   - `status` + `featured` + `createdAt DESC`

2. **orders**
   - `retailerId` + `status` + `createdAt DESC`
   - `brandId` + `status` + `createdAt DESC`

3. **consumer-orders**
   - `userId` + `status` + `createdAt DESC`
   - `status` + `createdAt DESC`

4. **reviews**
   - `productId` + `rating DESC` + `createdAt DESC`
   - `userId` + `createdAt DESC`

## Security Rules Summary

- **Public Read**: `products`, `brands`, `inviteCodes`
- **Authenticated Read**: `users` (own profile), `orders` (own orders)
- **Admin Write**: All collections
- **User Write**: Own profile, cart, wishlist, reviews
- **Role-Based**: Order updates based on status and role

## Data Relationships

```
brands (1) ←→ (N) products
users (1) ←→ (N) orders
users (1) ←→ (N) consumer-orders
users (1) ←→ (1) carts
users (1) ←→ (1) wishlists
products (1) ←→ (N) reviews
inviteCodes (1) → (1) users (on registration)
affiliateCodes (1) ←→ (N) consumer-orders
```

## Migration Notes

- `products2` collection exists temporarily during migration
- Legacy fields in `products` maintained for backward compatibility
- Gradual migration from mock data to Firebase

## Validation Rules

### Email Format
- Must be valid email format
- Lowercase enforced on write

### Timestamps
- Use Firestore server timestamps for `createdAt`
- Use `FieldValue.serverTimestamp()` for updates

### Currency Codes
- Supported: `GBP`, `EUR`, `CHF`, `USD`

### Language Codes
- Supported: `en`, `ko`, `zh`

### User Roles
- Enum: `admin`, `retailer`, `brand`, `consumer`

### Order Statuses
- B2B: 9-step workflow
- B2C: Standard e-commerce flow

## Best Practices

1. **Always use transactions** for inventory updates
2. **Batch writes** for bulk operations (max 500)
3. **Paginate** large collections (limit 20-50)
4. **Cache** frequently accessed data (brands, config)
5. **Denormalize** for read performance where appropriate
6. **Use subcollections** for large nested data
7. **Index** all query patterns
8. **Monitor** usage and costs regularly

## Version History

- **v1.0.0** (Jan 2025): Initial schema documentation
- Collections marked ✅ are currently active
- Collections marked 🔄 are planned/in development