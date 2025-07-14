#!/bin/bash

# Add all changes
git add -A

# Commit with message
git commit -m "Update mock auth passwords and fix Cell Lab pricing display

- Updated Cell Lab password to c311Lab07!
- Updated Wismin password to W15m1nKskin07!
- Fixed pricing display issue in ProductDetail component to handle both flat (item/carton) and nested (wholesale.offer.price) price structures
- Added MSRP display for products with msrp field (Cell Lab products)"

# Push to origin
git push origin main