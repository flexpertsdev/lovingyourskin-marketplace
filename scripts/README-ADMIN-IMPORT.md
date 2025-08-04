# Firebase Admin Import Instructions

## Setting up the Service Account Key

To run the admin import script, you need to download a service account key from Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **lovingyourskinshop**
3. Click the **gear icon** next to "Project Overview" → **Project settings**
4. Navigate to the **Service accounts** tab
5. Click **"Generate new private key"** button
6. Click **"Generate key"** in the confirmation dialog
7. Save the downloaded JSON file as `serviceAccountKey.json` in the **root directory** of this project (same level as package.json)

**IMPORTANT**: 
- The `serviceAccountKey.json` file contains sensitive credentials
- It's already in `.gitignore` so it won't be committed
- Never share this file or commit it to version control

## Running the Import

Once you have the service account key in place:

```bash
npm run import:products:admin
```

This script will:
- Import all products from the JSON files in `/mock-data/firestore/`
- Convert date strings to proper Firestore Timestamps
- Handle The Cell Lab's different JSON structure (with underscores)
- Use Firebase Admin SDK for proper permissions (bypasses security rules)

## What Gets Imported

The script imports products from these brands:
- Baohlab
- Lalucell
- Sunnicorn
- The Cell Lab
- Wismin

Each product will have:
- All fields from the JSON files
- `createdAt` and `updatedAt` as Firestore Timestamps (not strings)
- Proper `brandId` association
- Original product IDs preserved

## Verifying the Import

After import, you can verify in Firebase Console:
1. Go to Firestore Database
2. Check the `products` collection
3. Verify that date fields show as timestamps (not strings)
4. Check that The Cell Lab products are included