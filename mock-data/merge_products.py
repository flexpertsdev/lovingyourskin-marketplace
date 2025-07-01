import json

# Read existing products
with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Read missing products
with open('missing_products.json', 'r', encoding='utf-8') as f:
    missing_products = json.load(f)

# Find insertion positions
lalucell_insert_pos = -1
sunnicorn_insert_pos = -1

for i, product in enumerate(products):
    if product['id'] == 'lalucell-mystic-light-cica-hydrogel-mask':
        lalucell_insert_pos = i + 1
    elif product['id'] == 'sunnicorn-bereum-microbiome-collagen-mask':
        sunnicorn_insert_pos = i + 1

# Separate missing products by brand
lalucell_missing = [p for p in missing_products if p['brandId'] == 'lalucell']
sunnicorn_missing = [p for p in missing_products if p['brandId'] == 'sunnicorn']

# Sort sunnicorn lip balms to be in order
sunnicorn_lip_balms = [p for p in sunnicorn_missing if 'butter-lip-balm' in p['id']]
other_sunnicorn = [p for p in sunnicorn_missing if 'butter-lip-balm' not in p['id']]

# Insert in reverse order to maintain positions
# First, insert Sunnicorn products
for product in reversed(other_sunnicorn):
    products.insert(sunnicorn_insert_pos, product)

# Insert lip balms after coral lip balm
coral_pos = -1
for i, product in enumerate(products):
    if product['id'] == 'sunnicorn-only-for-you-butter-lip-balm-coral':
        coral_pos = i + 1
        break

for product in reversed(sunnicorn_lip_balms):
    products.insert(coral_pos, product)

# Insert LaLuCell products
for product in reversed(lalucell_missing):
    products.insert(lalucell_insert_pos, product)

# Write the merged products back
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print("Successfully merged missing products into products.json")
print(f"Total products: {len(products)}")