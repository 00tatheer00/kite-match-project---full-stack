// FMCG Division Product Data - Mohsin Match Factory & Kite Brand

export const companyInfo = {
  groupName: 'Aziz Group of Industries',
  brandName: 'Kite Brand',
  fmcgEntities: [
    'Mohsin Match Factory (Pvt.) Ltd. - Est. 1974',
    'Mohsin Enterprises (Pvt.) Ltd. - Est. 1990',
    'A.J Match Factory (Pvt.) Ltd. - Est. 2006',
  ],
  experience: 'Over 50 years of manufacturing excellence (established 1974)',
  globalPresence: 'Exporting to over 40 countries since 1995',
  employees: 'Over 10,000 employees across the nation',
  headOffice: 'Industrial Estate, Old Jamrud Road, Peshawar, Pakistan',
  contact: {
    fmcgTel: '+92-(0)91-5815056 / 5815057',
    sheikhupuraMill: '+92-(0)423-7332711-12',
    email: 'match.export@azizgrp.com',
    website: 'www.azizgrp.com',
  },
};

// Detergent Powder Products
export const detergentProducts = {
  kiteGlow: {
    name: 'Kite Glow',
    tier: 'Premium Brand',
    launchDate: 'March 2025',
    features: 'Triple enzyme technology for exceptional cleaning power, superior stain removal, fabric care, and long-lasting freshness. Setting the standard for excellence in the detergent industry.',
    benefits: [
      'Exceptional cleaning power',
      'Superior stain removal',
      'Fabric care and protection',
      'Long-lasting freshness',
      'Affordable pricing'
    ],
    skus: [
      { size: '2 KG', packing: 6, tradePrice: 511.50 },
      { size: '1 KG', packing: 12, tradePrice: 269.70 },
      { size: '500 GM', packing: 24, tradePrice: 139.50 },
      { size: 'RS. 99', packing: 48, tradePrice: 92.07 },
      { size: 'RS. 50', packing: 96, tradePrice: 46.50 },
      { size: 'RS. 20', packing: 96, tradePrice: 18.60 },
      { size: 'RS. 10', packing: 144, tradePrice: 9.30 },
    ],
  },
  burqAction: {
    name: 'BURQ Action',
    tier: 'Mid-Tier Brand',
    features: 'Advanced powder technology ensuring minimal variation, superior stain removal, color protection, and long-lasting freshness at competitive prices.',
    benefits: [
      'Color protection',
      'Skin safety formula',
      'Reliable cleaning',
      'Value for money'
    ],
    skus: [
      { size: '2.3 KG', packing: 6, tradePrice: 464.07 },
      { size: '1 KG', packing: 12, tradePrice: 213.90 },
      { size: 'RS. 99', packing: 24, tradePrice: 92.07 },
      { size: 'RS. 50', packing: 48, tradePrice: 46.50 },
      { size: 'RS. 20', packing: 96, tradePrice: 18.60 },
      { size: 'RS. 10', packing: 204, tradePrice: 9.30 },
    ],
  },
  vero: {
    name: 'Vero',
    tier: 'Economy/Bulk',
    features: 'Bulk detergent solution for industrial and commercial applications',
    skus: [
      { size: '20 KG', packing: null },
      { size: '5 KG', packing: 4 },
    ],
  },
};

// Dish Wash Bar Products
export const dishwashProducts = {
  kiteDishwash: {
    name: 'Kite Dish Wash Bar',
    features: 'Premium lemon fragrance, advanced cleaning formulation, and slow water dissolution for longevity. Beats market leaders while maintaining competitive pricing.',
    benefits: [
      'Premium lemon fragrance',
      'Slow dissolution for longevity',
      'Advanced cleaning formula',
      'Beats market leaders',
      'Competitive pricing',
      'Rapid market growth'
    ],
    skus: [
      { size: 'Super Bar', packing: 36, tradePrice: 44.63 },
      { size: 'Long Bar', packing: 36, tradePrice: 35.91 },
      { size: 'Large Bar', packing: 36, tradePrice: 17.96 },
      { size: 'Regular Bar', packing: 48, tradePrice: 8.98 },
    ],
  },
};

// Safety Match Products
export const matchProducts = {
  specifications: {
    description: "Pakistan's largest safety match manufacturer and exporter. Kite brand matches are carborised and damp-proof, manufactured with state-of-the-art production facility. Private labeling available for toll manufacturing with minimal variation.",
    features: [
      'Carborised and damp-proof',
      'Different striking surfaces (Dotted, Full Brush Coated, Plain Strip)',
      'International safety standards',
      'Coated board outer boxes and duplex board inner tray',
      'Export quality wooden sticks'
    ],
    sizes: [
      { size: 'Large', avgSticks: 58, brandExamples: ['Kite - Large'] },
      { size: 'Classic', avgSticks: 45, brandExamples: ['Kite - Classic'] },
      { size: 'Regular', avgSticks: 42, brandExamples: ['Kite - Regular', 'Olympia', 'Tanga'] },
      { size: 'Small', avgSticks: 32, brandExamples: ['Party'] },
    ],
    packingSizes: {
      local: 'Small (26 sticks), Regular (32 sticks), Classic (42 sticks), Large (45 & 56 sticks)',
      export: '2 sizes, small and regular wooden sticks, carborised and damp proof'
    }
  },
  exportBrands: ['Simba', 'Chinook', 'Helicopter'],
  localBrands: ['Kite', 'Olympia', 'Tanga', 'Bird', 'Party'],
};

// Product Categories for Navigation
export const productCategories = [
  {
    title: 'Safety Matches',
    slug: 'safety-matches',
    products: [
      { name: 'Kite Matches', slug: 'kite-matches', description: 'Premium quality matches' },
      { name: 'Olympia', slug: 'olympia', description: 'Reliable safety matches' },
      { name: 'Tanga', slug: 'tanga', description: 'Quality matches' },
      { name: 'Bird', slug: 'bird', description: 'Affordable matches' },
      { name: 'Party', slug: 'party', description: 'Special occasion matches' },
    ],
  },
  {
    title: 'Detergent Products',
    slug: 'detergent-products',
    products: [
      { name: 'Kite Glow', slug: 'kite-glow', description: 'Triple enzyme technology' },
      { name: 'BURQ Action', slug: 'burq-action', description: 'Color protection' },
      { name: 'Vero Detergent', slug: 'vero', description: 'Economy bulk detergent' },
    ],
  },
  {
    title: 'Dish Wash',
    slug: 'dish-wash',
    products: [
      { name: 'Kite Dishwash Bar', slug: 'kite-dishwash', description: 'Lemon fragrance formula' },
    ],
  },
  {
    title: 'Export Brands',
    slug: 'export-brands',
    products: [
      { name: 'Simba Matches', slug: 'simba', description: 'International quality' },
      { name: 'Chinook', slug: 'chinook', description: 'Export brand' },
      { name: 'Helicopter', slug: 'helicopter', description: 'Global distribution' },
    ],
  },
];

export default {
  companyInfo,
  detergentProducts,
  dishwashProducts,
  matchProducts,
  productCategories,
};
