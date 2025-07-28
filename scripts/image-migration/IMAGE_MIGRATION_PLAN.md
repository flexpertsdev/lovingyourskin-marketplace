# Image Migration Plan for LovingYourSkin

## Summary of Findings

### Product Count Comparison
Based on my analysis:

**products_backup.json vs products.json**
- Both files exist but need detailed comparison
- Wismin has 16 products in wismin_products_standard_format.json
- Need to verify all brands are properly represented

### Images to Process

#### From brands.json:
- **Logos**: 5 brands with HTTP URLs
- **Hero Images**: Mix of HTTP URLs and local paths
- **Total brand images**: ~20-25 images

#### From products:
- **Wismin**: All products have HTTP URLs (cafe24.poxo.com)
- **The Cell Lab**: All products have HTTP URLs (ecimg.cafe24img.com)
- **Other brands**: Mix of HTTP URLs and local paths
- **Total product images**: ~100-150 images

### Cell Lab Products for Background Removal
Products from thecelllab-products.json that need background removal:
1. Pine Cica Celltone Cream 50ml
2. Pine Cica Celltone Soothing Mineral Sunscreen 70g
3. Pine Cica Celltone Mildly Acidic Foam Cleanser 100ml
4. Pine Cica Celltone Pore Mask Pack (5 sheets)
5. Carrot Toner Pad 70 sheets
6. Pore Care Mist 100ml

## Proposed Solution Structure

### 1. Image Processing Pipeline
```
1. Download all HTTP images locally
2. Process Cell Lab images to remove backgrounds
3. Upload all images to Firebase Storage
4. Update Firebase documents with new URLs
```

### 2. Firebase Storage Structure
```
/brands/
  /{brandId}/
    /logo/
      logo.{ext}
    /hero/
      hero-1.{ext}
      hero-2.{ext}
      ...
/products/
  /{productId}/
    /original/
      image-1.{ext}
      image-2.{ext}
    /no-bg/ (for Cell Lab products)
      image-1-no-bg.png
      image-2-no-bg.png
```

### 3. Scripts to Create
1. `download-images.js` - Download all HTTP images
2. `remove-backgrounds.js` - Process Cell Lab images with Stability AI
3. `upload-to-firebase.js` - Upload to Firebase Storage
4. `update-firestore.js` - Update Firestore documents with new URLs

## Questions Before Proceeding:

1. **Starting Point**: Should we use `products_backup.json` as the source of truth for products?

2. **Background Removal**: 
   - Should I remove backgrounds from ALL Cell Lab product images or just the main image?
   - Do you want to keep both versions (with and without background)?

3. **Firebase Setup**:
   - Do you have Firebase Admin SDK credentials ready?
   - Should I create the scripts to be run with your credentials?

4. **Image Quality**:
   - Any specific requirements for image compression or format conversion?
   - Should we optimize images for web (convert to WebP)?

5. **Error Handling**:
   - How should we handle failed downloads or processing?
   - Should we create a log of processed/failed images?

Please confirm these details so I can create the appropriate scripts for your image migration.
