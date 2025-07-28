# Comprehensive Image Migration Analysis

## Key Findings from B2B Website Info

The B2B Website infos directory contains detailed product information for all brands in HTML format. This provides additional context but doesn't contain direct image URLs.

## Image Sources Summary

### 1. Brand Images (from brands.json)
- **Logos**: HTTP URLs from various CDNs
- **Hero Images**: Mix of HTTP URLs and local paths (/assets/)
- Total: ~25 brand-related images

### 2. Product Images
Based on analysis of multiple files:

#### The Cell Lab (thecelllab-products.json)
6 products with images from `ecimg.cafe24img.com`:
1. Pine Cica Celltone Cream 50ml
2. Pine Cica Celltone Soothing Mineral Sunscreen 70g
3. Pine Cica Celltone Mildly Acidic Foam Cleanser 100ml
4. Pine Cica Celltone Pore Mask Pack (5 sheets)
5. Carrot Toner Pad 70 sheets
6. Pore Care Mist 100ml

**All Cell Lab products need background removal**

#### Wismin (wismin_products_standard_format.json)
16 products with images from `cafe24.poxo.com` including:
- Cotton Seed products (Cleansing Ball, Toner, Cream)
- Bakuchiol products (Ampoule 15ml, 30ml, Set, Eye Cream)
- Sample Kits
- Sachets
- Sun Cream
- Mask Packs

#### Other Brands
- **LaLuCell**: Mix of sixshop.com URLs and local paths
- **Sunnicorn**: Local paths (/images/products/)
- **Vanhalla**: imweb.me URLs
- **BAO H. LAB**: cafe24img.com URLs

## Products Comparison

### products_backup.json
Contains products for:
- Wismin: 10 products
- LaLuCell: 2 products  
- Sunnicorn: 8 products
Total: 20 products

### wismin_products_standard_format.json
Contains 16 Wismin products (more comprehensive)

### Main products.json
Needs verification but likely contains all brands

## Recommended Approach

### Phase 1: Image Collection & Organization
1. Create a master list of all unique image URLs from:
   - brands.json (logos and hero images)
   - products_backup.json
   - Individual brand product files
   - wismin_products_standard_format.json (most complete for Wismin)

2. Categorize images:
   - Brand logos
   - Brand hero images
   - Product images (by brand)
   - Products needing background removal (Cell Lab)

### Phase 2: Download & Process
1. Download all HTTP images locally
2. Process Cell Lab products with Stability AI to remove backgrounds
3. Keep both versions (original and no-bg) for Cell Lab

### Phase 3: Firebase Upload
Structure:
```
/brands/{brandId}/
  logo.{ext}
  hero/
    image-1.{ext}
    image-2.{ext}
    
/products/{productId}/
  original/
    image-1.{ext}
    image-2.{ext}
  no-bg/  (Cell Lab only)
    image-1-no-bg.png
    image-2-no-bg.png
```

### Phase 4: Update Firestore
Update documents with new Firebase Storage URLs

## Next Steps

1. **Confirm source files**: Should we use products_backup.json + individual brand files?
2. **Background removal scope**: All Cell Lab images or just primary?
3. **Firebase credentials**: Ready to proceed with upload?

Would you like me to start creating the scripts for Phase 1 (collecting and organizing all image URLs)?
