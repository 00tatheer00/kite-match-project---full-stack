/**
 * CSV Import / Export / Sample Generator utility for Kite Admin
 * Supports standard CSV parsing with quotes, commas, multiline values, and header mapping.
 */

export function parseCSV(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentVal.trim());
      if (row.some((val) => val.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((val) => val.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) =>
    h.toLowerCase().replace(/[^a-z0-9_]/g, '')
  );
  const records = [];

  for (let r = 1; r < lines.length; r++) {
    const values = lines[r];
    const record = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] !== undefined ? values[idx] : '';
    });
    records.push(record);
  }

  return records;
}

export function downloadCSV(filename, csvContent) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val) {
  if (val == null) return '""';
  let str = String(val);
  // Spreadsheet formula injection guard: a cell starting with = + - @ (or tab/CR) would be
  // executed as a formula by Excel/Sheets. Plain negative numbers are left untouched.
  if (/^[=+\-@\t\r]/.test(str) && !/^-?\d+(\.\d+)?$/.test(str)) {
    str = `'${str}`;
  }
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

// ---------------- PRODUCTS CSV ----------------
export function generateProductsSampleCSV() {
  const headers = [
    'id',
    'title',
    'category',
    'productType',
    'variantName',
    'weight',
    'packing',
    'price',
    'tagline',
    'description',
  ];
  const sampleRows = [
    [
      'dish-wash-bar',
      'Kite Dish Wash Bar',
      'Dish Wash',
      'dish-wash',
      'SUPER BAR',
      '200 g',
      '36 pcs/ctn',
      '60',
      'Kaifiyat aur taazgi ka behtareen bar',
      'High grade lemon dish wash bar that cuts grease effortlessly',
    ],
    [
      'dish-wash-bar',
      'Kite Dish Wash Bar',
      'Dish Wash',
      'dish-wash',
      'LONG BAR',
      '190 g',
      '36 pcs/ctn',
      '60',
      'Lamba chalay ziyada safai karay',
      'Long-lasting dish wash bar for everyday household use',
    ],
    [
      'dish-wash-bar',
      'Kite Dish Wash Bar',
      'Dish Wash',
      'dish-wash',
      'CLASSIC BAR',
      '80 g',
      '36 pcs/ctn',
      '30',
      'Classic Kite hygiene formula',
      'Compact dish wash bar for small families',
    ],
    [
      'kite-glow',
      'Kite Glow Detergent',
      'Detergents',
      'detergents',
      '1 KG',
      '1000 g',
      '12 pcs/ctn',
      '350',
      'Zabardast safai aur chamak',
      'Detergent powder with active color lock formula',
    ],
    [
      'kite-glow',
      'Kite Glow Detergent',
      'Detergents',
      'detergents',
      '2 KG',
      '2000 g',
      '6 pcs/ctn',
      '650',
      'Zabardast safai aur chamak',
      'Family size detergent pack for heavy washing',
    ],
    [
      'safety-matches',
      'Safety Matches Collection',
      'Safety Matches',
      'matches',
      'LARGE BOX',
      'Standard',
      '10 boxes/outer',
      '2000',
      'Har ghar ki zaroorat',
      'Premium carbonized splinter matches with steady flame',
    ],
  ];

  return [
    headers.join(','),
    ...sampleRows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');
}

export function exportProductsToCSV(products = []) {
  const headers = [
    'id',
    'title',
    'category',
    'productType',
    'variantName',
    'weight',
    'packing',
    'price',
    'tagline',
    'description',
  ];
  const rows = [];

  products.forEach((p) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      p.variants.forEach((v) => {
        rows.push([
          p.id || '',
          p.title || '',
          p.category || '',
          p.productType || 'general',
          v.name || '',
          v.detail || '',
          v.packing || '',
          v.price != null ? String(v.price) : '',
          p.tagline || '',
          p.description || '',
        ]);
      });
    } else {
      rows.push([
        p.id || '',
        p.title || '',
        p.category || '',
        p.productType || 'general',
        'Standard',
        '',
        '',
        '',
        p.tagline || '',
        p.description || '',
      ]);
    }
  });

  return [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');
}

export function parseProductsCSV(csvText, existingProducts = []) {
  const records = parseCSV(csvText);
  if (!records.length) return [];

  const productMap = new Map();

  // First seed with existing products
  existingProducts.forEach((p) => {
    productMap.set(p.id, JSON.parse(JSON.stringify(p)));
  });

  records.forEach((row) => {
    const rawId = (row.id || row.productid || row.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const title = (row.title || row.producttitle || row.name || '').trim();
    if (!rawId && !title) return;

    const id = rawId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = (row.category || 'Detergents').trim();
    const productType = (row.producttype || 'general').trim();
    const tagline = (row.tagline || '').trim();
    const description = (row.description || '').trim();

    const variantName = (
      row.variantname ||
      row.variant ||
      row.size ||
      row.sku ||
      title
    ).trim();
    const weight = (row.weight || row.detail || '').trim();
    const packing = (row.packing || row.cartonpacking || '').trim();
    const price =
      row.price !== '' && !isNaN(Number(row.price)) ? Number(row.price) : 0;

    let prod = productMap.get(id);
    if (!prod) {
      prod = {
        id,
        title: title || id,
        category,
        productType,
        tagline,
        description,
        isActive: true,
        showOnLanding: true,
        showInProductsPage: true,
        showInNavbar: true,
        variants: [],
        features: [],
        facilities: [],
        images: [],
        variantImages: [],
        brands: [],
        displayOrder: productMap.size + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      productMap.set(id, prod);
    } else {
      if (title) prod.title = title;
      if (category) prod.category = category;
      if (productType) prod.productType = productType;
      if (tagline) prod.tagline = tagline;
      if (description) prod.description = description;
      prod.updatedAt = new Date().toISOString();
    }

    if (variantName) {
      prod.variants = prod.variants || [];
      const existingVIdx = prod.variants.findIndex(
        (v) => (v.name || '').trim().toLowerCase() === variantName.toLowerCase()
      );
      if (existingVIdx >= 0) {
        prod.variants[existingVIdx] = {
          ...prod.variants[existingVIdx],
          name: variantName,
          detail: weight || prod.variants[existingVIdx].detail || '',
          packing: packing || prod.variants[existingVIdx].packing || '',
          price: price || prod.variants[existingVIdx].price || 0,
        };
      } else {
        prod.variants.push({
          name: variantName,
          detail: weight,
          packing,
          price,
        });
      }
    }
  });

  return Array.from(productMap.values());
}

// ---------------- PROMOTIONS CSV ----------------
export function generatePromotionsSampleCSV() {
  const headers = [
    'id',
    'title',
    'category',
    'originalPrice',
    'discount',
    'shippingCost',
    'displayOrder',
    'items',
    'description',
  ];
  const sampleRows = [
    [
      'kite-affordable-all',
      'Kite Affordable for All',
      'Value Pack',
      '470',
      '70',
      '200',
      '1',
      'Kite Glow Detergent 1kg:1:250|Kite Long Bar 190g:2:75',
      'Affordable bundle pack featuring 1kg Kite Glow Detergent and 2 Kite Long Bars (190g).',
    ],
    [
      'kite-family-super-saver',
      'Kite Family Super Saver Pack',
      'Family Bundle',
      '1100',
      '150',
      '0',
      '2',
      'Kite Glow Detergent 2kg:1:650|Kite Dish Wash Super Bar:3:100',
      'Mega saver grocery pack for the entire month with FREE nationwide delivery.',
    ],
    [
      'kite-match-wholesaler-box',
      'Safety Matches Master Carton',
      'Wholesale Pack',
      '2400',
      '200',
      '300',
      '3',
      'Large Matches Outer:10:220',
      'Special discounted wholesale package for regional shopkeepers and distributors.',
    ],
  ];

  return [
    headers.join(','),
    ...sampleRows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');
}

export function exportPromotionsToCSV(promotions = []) {
  const headers = [
    'id',
    'title',
    'category',
    'originalPrice',
    'discount',
    'finalPrice',
    'shippingCost',
    'displayOrder',
    'items',
    'description',
  ];
  const rows = [];

  promotions.forEach((p) => {
    const itemsFormatted = Array.isArray(p.items)
      ? p.items
          .map(
            (it) =>
              `${it.product || ''}:${it.quantity || 1}:${it.price || 0}`
          )
          .join('|')
      : '';

    rows.push([
      p.id || '',
      p.title || '',
      p.category || '',
      p.originalPrice != null ? String(p.originalPrice) : '',
      p.discount != null ? String(p.discount) : '',
      p.totalPrice != null ? String(p.totalPrice) : '',
      p.shippingCost != null ? String(p.shippingCost) : '',
      p.displayOrder != null ? String(p.displayOrder) : '0',
      itemsFormatted,
      p.description || '',
    ]);
  });

  return [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');
}

export function parsePromotionsCSV(csvText, existingPromotions = []) {
  const records = parseCSV(csvText);
  if (!records.length) return [];

  const promoMap = new Map();
  existingPromotions.forEach((p) => {
    promoMap.set(p.id, JSON.parse(JSON.stringify(p)));
  });

  records.forEach((row) => {
    const rawId = (row.id || row.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const title = (row.title || row.name || '').trim();
    if (!rawId && !title) return;

    const id = rawId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = (row.category || 'Special Packages').trim();
    const description = (row.description || '').trim();
    const originalPrice = !isNaN(Number(row.originalprice))
      ? Number(row.originalprice)
      : 0;
    const discount = !isNaN(Number(row.discount)) ? Number(row.discount) : 0;
    const shippingCost = !isNaN(Number(row.shippingcost))
      ? Number(row.shippingcost)
      : 150;
    const displayOrder = !isNaN(Number(row.displayorder))
      ? Number(row.displayorder)
      : promoMap.size + 1;

    const rawItemsStr = (row.items || row.products || '').trim();
    const items = [];
    if (rawItemsStr) {
      const parts = rawItemsStr.split('|');
      parts.forEach((part) => {
        const segs = part.split(':').map((s) => s.trim());
        if (segs[0]) {
          items.push({
            product: segs[0],
            quantity: segs[1] && !isNaN(Number(segs[1])) ? Number(segs[1]) : 1,
            price: segs[2] && !isNaN(Number(segs[2])) ? Number(segs[2]) : 0,
          });
        }
      });
    }

    const totalQuantity = items.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0),
      0
    );
    const calculatedPrice = items.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
      0
    );
    const finalPrice =
      calculatedPrice > 0
        ? calculatedPrice
        : originalPrice - discount > 0
          ? originalPrice - discount
          : originalPrice;

    let promo = promoMap.get(id);
    if (!promo) {
      promo = {
        id,
        title: title || id,
        category,
        description,
        originalPrice,
        discount,
        totalPrice: finalPrice,
        totalQuantity: totalQuantity || 1,
        shippingCost,
        displayOrder,
        items: items.length
          ? items
          : [{ product: title, quantity: 1, price: finalPrice }],
        isActive: true,
        imageUrls: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      promoMap.set(id, promo);
    } else {
      if (title) promo.title = title;
      if (category) promo.category = category;
      if (description) promo.description = description;
      if (originalPrice) promo.originalPrice = originalPrice;
      if (discount) promo.discount = discount;
      if (finalPrice) promo.totalPrice = finalPrice;
      if (shippingCost !== undefined) promo.shippingCost = shippingCost;
      if (displayOrder !== undefined) promo.displayOrder = displayOrder;
      if (items.length) {
        promo.items = items;
        promo.totalQuantity = totalQuantity;
      }
      promo.updatedAt = new Date().toISOString();
    }
  });

  return Array.from(promoMap.values());
}
