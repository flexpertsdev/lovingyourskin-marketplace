ethyl Dimethicone',
        '2,3-Butanediol', 'Niacinamide', 'Propanediol', 'Polyglyceryl-3 Polydimethylsiloxyethyl Dimethicone',
        'Dimethicone', 'Disteardimonium Hectorite', 'Polyhydroxystearic Acid', 'Magnesium Sulfate',
        'Triethoxycaprylylsilane', 'Silica', 'Dimethicone/Vinyl Dimethicone Crosspolymer',
        '1,2-Hexanediol', 'Sorbitan Sesquioleate', 'Polymethylsilsesquioxane', 'Caprylyl Glycol',
        'Isododecane', 'Ethylhexylglycerin', 'CI 77492', 'Acrylates/Dimethicone Copolymer',
        'Adenosine', 'CI 77491', 'Tocopherol', 'Butylene Glycol', 'Glycerin', 'Centella Asiatica Extract',
        'Sodium DNA', 'Hydrogenated Lecithin', 'Sodium Hyaluronate', 'Dipropylene Glycol',
        'Beta-Sitosterol', 'Acetyl Hexapeptide-8', 'Copper Tripeptide-1', 'Tripeptide-1',
        'Palmitoyl Pentapeptide-4', 'Palmitoyl Tripeptide-1', 'Hexapeptide-9', 'Nonapeptide-1'
      ]
    },
    status: 'active',
    categories: ['sun-care'],
    tags: ['mineral', 'gentle', 'tone-correcting']
  }
];

// Summary report for data extraction
export const EXTRACTION_SUMMARY = {
  totalProducts: 0, // To be calculated after all extractions
  totalBrands: 5,
  brandsSummary: {
    'the-cell-lab': {
      name: 'The Cell Lab',
      productCount: 15, // Including sample sizes
      categories: ['cleansers', 'toners', 'serums-ampoules', 'moisturizers', 'sun-care', 'masks', 'body-care'],
      priceRange: {
        retail: { min: 1.00, max: 37.00 },
        wholesale: { min: 0.47, max: 16.00 }
      },
      isShippingFree: true,
      additionalSupport: ['Display stands and additional samples depending on the stock outstanding']
    },
    'wismin': {
      name: 'Wismin',
      isShippingFree: false,
      shippingNote: 'Shipping not included. Estimated additional cost: +$1.30 per item'
    }
    // Other brands to be added after extraction
  }
};

// Export function to get all products
export function getAllProducts(): Product[] {
  // This will combine all extracted products from all brands
  return [
    ...THE_CELL_LAB_PRODUCTS,
    // ...LALUCELL_PRODUCTS,
    // ...SUNNICORN_PRODUCTS,
    // ...BAOHLAB_PRODUCTS,
    // ...WISMIN_PRODUCTS
  ];
}

// Export function to get products by brand
export function getProductsByBrand(brandId: string): Product[] {
  return getAllProducts().filter(p => p.brandId === brandId);
}

// Export function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter(p => p.categories.includes(category));
}

// Categories available
export const PRODUCT_CATEGORIES = [
  { id: 'cleansers', name: 'Cleansers', count: 0 },
  { id: 'toners', name: 'Toners', count: 0 },
  { id: 'serums-ampoules', name: 'Serums & Ampoules', count: 0 },
  { id: 'moisturizers', name: 'Moisturizers', count: 0 },
  { id: 'sun-care', name: 'Sun Care', count: 0 },
  { id: 'masks', name: 'Masks', count: 0 },
  { id: 'body-care', name: 'Body Care', count: 0 },
  { id: 'other', name: 'Other', count: 0 }
];
