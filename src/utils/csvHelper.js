/**
 * CSV (Excel) import / export for the Kite admin.
 *
 * Products file: one row per size. Columns:
 *   product_id, product_name, category, brand, size_name, weight, packing, price
 * - "brand" is only used for products sold per brand (Safety Matches: Kite, Bird, ...).
 * - Existing sizes are matched by name and updated; new names are added.
 * - Import never deletes anything (delete sizes in the admin panel).
 * - The downloaded file is always the CURRENT catalogue, so importing it unchanged changes nothing.
 *
 * Packages file: one row per package. "items" = "Product name:quantity:price | ..."
 * Empty cells keep the current value (they never turn into 0).
 */

export function parseCSV(text) {
  if (!text || typeof text !== 'string') return [];
  // Excel adds a BOM to UTF-8 files.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
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
      if (row.some((val) => val.length > 0)) lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((val) => val.length > 0)) lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  const records = [];
  for (let r = 1; r < lines.length; r++) {
    const values = lines[r];
    const record = { __row: r + 1 };
    headers.forEach((h, idx) => {
      record[h] = unguard(values[idx] !== undefined ? values[idx] : '');
    });
    records.push(record);
  }
  return records;
}

// Export prefixes risky cells with ' (spreadsheet formula guard); remove it on import.
function unguard(value) {
  const v = String(value ?? '');
  return /^'[=+\-@]/.test(v) ? v.slice(1) : v;
}

export function downloadCSV(filename, csvContent) {
  if (typeof window === 'undefined') return;
  // BOM so Excel opens Urdu text and "Rs" values correctly.
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
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

export function escapeCSV(val) {
  if (val == null) return '""';
  let str = String(val);
  // Spreadsheet formula injection guard: a cell starting with = + - @ (or tab/CR) would be
  // executed as a formula by Excel/Sheets. Plain negative numbers are left untouched.
  if (/^[=+\-@\t\r]/.test(str) && !/^-?\d+(\.\d+)?$/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

const toRows = (headers, rows) => [headers.join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join('\r\n');
const norm = (v) => String(v || '').trim().toLowerCase();
const pick = (row, ...keys) => {
  for (const k of keys) if (row[k] !== undefined && String(row[k]).trim() !== '') return String(row[k]).trim();
  return '';
};

// ---------------- PRODUCTS ----------------
const PRODUCT_HEADERS = ['product_id', 'product_name', 'category', 'brand', 'size_name', 'weight', 'packing', 'price'];

export function exportProductsToCSV(products = []) {
  const rows = [];
  products.forEach((p) => {
    const base = [p.id || '', p.title || '', p.category || ''];
    const brands = Array.isArray(p.brands) ? p.brands : [];
    if (brands.length > 0) {
      brands.forEach((b) => {
        (b.variants || []).forEach((v) => {
          rows.push([...base, b.name || '', v.name || '', v.detail || '', v.packing || '', v.price ?? '']);
        });
      });
    } else if (Array.isArray(p.variants) && p.variants.length > 0) {
      p.variants.forEach((v) => {
        rows.push([...base, '', v.name || '', v.detail || '', v.packing || '', v.price ?? '']);
      });
    } else {
      rows.push([...base, '', '', '', '', '']);
    }
  });
  return toRows(PRODUCT_HEADERS, rows);
}

// The sample is the current catalogue: edit a price in Excel and upload it again.
export function generateProductsSampleCSV(products = []) {
  if (products.length > 0) return exportProductsToCSV(products);
  return toRows(PRODUCT_HEADERS, [
    ['kite-glow', 'Kite Glow Detergent', 'Detergents', '', '1 KG', '1000 g', '12 pcs/ctn', '350'],
    ['safety-matches', 'Safety Matches Collection', 'Safety Matches', 'Kite Safety Matches', 'LARGE', '58 Sticks', '500 pcs/ctn', '2000'],
  ]);
}

/**
 * @returns {{ changed: object[], summary: string[], problems: string[] }}
 *   changed  — only products that actually change (minimal fields to send)
 *   summary  — human readable lines for the confirmation dialog
 *   problems — row-level errors; nothing should be saved when this is not empty
 */
export function parseProductsCSV(csvText, existingProducts = []) {
  const records = parseCSV(csvText);
  const problems = [];
  const working = new Map(existingProducts.map((p) => [p.id, JSON.parse(JSON.stringify(p))]));
  const stats = new Map(); // id -> { updated, added, created }

  records.forEach((row) => {
    const line = `Row ${row.__row}`;
    const rawId = pick(row, 'product_id', 'id', 'productid', 'slug');
    const name = pick(row, 'product_name', 'title', 'producttitle', 'name');
    if (!rawId && !name) return;
    const id = (rawId || name).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    const brandName = pick(row, 'brand', 'brandname');
    const sizeName = pick(row, 'size_name', 'variantname', 'variant', 'size', 'sku');
    const weight = pick(row, 'weight', 'detail');
    const packing = pick(row, 'packing', 'cartonpacking');
    const priceText = pick(row, 'price').replace(/^rs\.?\s*/i, '').replace(/,/g, '');
    const price = priceText === '' ? null : Number(priceText);
    if (priceText !== '' && (!Number.isFinite(price) || price < 0)) {
      problems.push(`${line}: price "${priceText}" is not a number`);
      return;
    }

    let prod = working.get(id);
    const st = stats.get(id) || { updated: 0, added: 0, created: false };
    if (!prod) {
      const category = pick(row, 'category');
      if (!name || !category) {
        problems.push(`${line}: new product "${id}" needs product_name and category`);
        return;
      }
      prod = {
        id, title: name, category, productType: 'general', isActive: true,
        showOnLanding: true, showInProductsPage: true, showInNavbar: true,
        variants: [], brands: [], features: [], images: [], variantImages: [], facilities: [],
      };
      working.set(id, prod);
      st.created = true;
    }
    stats.set(id, st);
    if (!sizeName) return;

    let list;
    if (brandName) {
      prod.brands = Array.isArray(prod.brands) ? prod.brands : [];
      let brand = prod.brands.find((b) => norm(b.name) === norm(brandName));
      if (!brand) {
        brand = { name: brandName, variants: [] };
        prod.brands.push(brand);
      }
      brand.variants = Array.isArray(brand.variants) ? brand.variants : [];
      list = brand.variants;
    } else {
      if (Array.isArray(prod.brands) && prod.brands.length > 0) {
        problems.push(`${line}: "${prod.title}" is sold per brand — fill in the brand column`);
        return;
      }
      prod.variants = Array.isArray(prod.variants) ? prod.variants : [];
      list = prod.variants;
    }

    const existing = list.find((v) => norm(v.name) === norm(sizeName));
    if (existing) {
      const before = JSON.stringify(existing);
      if (weight) existing.detail = weight;
      if (packing) existing.packing = packing;
      if (price != null) existing.price = price;
      if (JSON.stringify(existing) !== before) st.updated++;
    } else {
      if (price == null || price <= 0) {
        problems.push(`${line}: new size "${sizeName}" needs a price`);
        return;
      }
      list.push({ name: sizeName, detail: weight, packing, price });
      st.added++;
    }
  });

  const changed = [];
  const summary = [];
  for (const [id, st] of stats) {
    if (!st.created && !st.updated && !st.added) continue;
    const p = working.get(id);
    const payload = st.created
      ? p
      : { title: p.title, category: p.category, variants: p.variants || [], brands: p.brands || [] };
    changed.push({ id, ...payload });
    const parts = [];
    if (st.created) parts.push('NEW product');
    if (st.updated) parts.push(`${st.updated} size(s) changed`);
    if (st.added) parts.push(`${st.added} new size(s)`);
    summary.push(`• ${p.title}: ${parts.join(', ')}`);
  }
  return { changed, summary, problems };
}

// ---------------- PACKAGES (promotions) ----------------
const PROMO_HEADERS = ['package_id', 'package_name', 'category', 'items', 'original_price', 'discount', 'delivery_charge', 'display_order', 'description', 'final_price_auto'];

const formatItems = (items) =>
  Array.isArray(items) ? items.map((it) => `${it.product || ''}:${it.quantity || 1}:${it.price ?? 0}`).join(' | ') : '';

export function exportPromotionsToCSV(promotions = []) {
  const rows = promotions.map((p) => [
    p.id || '',
    p.title || '',
    p.category || '',
    formatItems(p.items),
    p.originalPrice ?? '',
    p.discount ?? '',
    p.shippingCost ?? '',
    p.displayOrder ?? '',
    p.description || '',
    p.totalPrice ?? '',
  ]);
  return toRows(PROMO_HEADERS, rows);
}

export function generatePromotionsSampleCSV(promotions = []) {
  if (promotions.length > 0) return exportPromotionsToCSV(promotions);
  return toRows(PROMO_HEADERS, [
    ['kite-value-pack', 'Kite Value Pack', 'Value Pack', 'Kite Glow Detergent 1kg:1:250 | Kite Long Bar 190g:2:75', '470', '70', '', '1', 'Example package', ''],
  ]);
}

/** @returns {{ changed: object[], summary: string[], problems: string[] }} */
export function parsePromotionsCSV(csvText, existingPromotions = []) {
  const records = parseCSV(csvText);
  const problems = [];
  const changed = [];
  const summary = [];
  const byId = new Map(existingPromotions.map((p) => [p.id, p]));

  const num = (row, line, label, ...keys) => {
    const t = pick(row, ...keys).replace(/^rs\.?\s*/i, '').replace(/,/g, '');
    if (t === '') return undefined; // empty cell = keep current value
    const n = Number(t);
    if (!Number.isFinite(n) || n < 0) {
      problems.push(`${line}: ${label} "${t}" is not a number`);
      return undefined;
    }
    return n;
  };

  records.forEach((row) => {
    const line = `Row ${row.__row}`;
    const rawId = pick(row, 'package_id', 'id', 'slug');
    const title = pick(row, 'package_name', 'title', 'name');
    if (!rawId && !title) return;
    const id = (rawId || title).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    const existing = byId.get(id);

    const items = [];
    const itemsText = pick(row, 'items', 'products');
    if (itemsText) {
      itemsText.split('|').forEach((part) => {
        const segs = part.split(':').map((s) => s.trim());
        if (!segs[0]) return;
        const quantity = segs[1] === undefined || segs[1] === '' ? 1 : Number(segs[1]);
        const price = segs[2] === undefined || segs[2] === '' ? 0 : Number(segs[2]);
        if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
          problems.push(`${line}: item "${part.trim()}" must look like Name:quantity:price`);
          return;
        }
        items.push({ product: segs[0], quantity, price });
      });
    }

    const update = {};
    if (title) update.title = title;
    const category = pick(row, 'category');
    if (category) update.category = category;
    const description = pick(row, 'description');
    if (description) update.description = description;
    const originalPrice = num(row, line, 'original price', 'original_price', 'originalprice');
    if (originalPrice !== undefined) update.originalPrice = originalPrice;
    const discount = num(row, line, 'discount', 'discount');
    if (discount !== undefined) update.discount = discount;
    const shipping = num(row, line, 'delivery charge', 'delivery_charge', 'shippingcost');
    if (shipping !== undefined) update.shippingCost = shipping;
    const displayOrder = num(row, line, 'display order', 'display_order', 'displayorder');
    if (displayOrder !== undefined) update.displayOrder = displayOrder;
    if (items.length) {
      update.items = items;
      update.totalQuantity = items.reduce((s, it) => s + it.quantity, 0);
      update.totalPrice = items.reduce((s, it) => s + it.quantity * it.price, 0);
    }

    if (!existing) {
      if (!title || !category || !items.length) {
        problems.push(`${line}: new package "${id}" needs package_name, category and items`);
        return;
      }
      changed.push({ id, isActive: true, ...update });
      summary.push(`• ${title}: NEW package`);
      return;
    }

    // Items in the database can carry extra fields (images, notes): compare only what the file has.
    const comparable = (k, v) =>
      k === 'items' && Array.isArray(v)
        ? v.map((it) => ({ product: String(it?.product || '').trim(), quantity: Number(it?.quantity) || 1, price: Number(it?.price) || 0 }))
        : k === 'totalPrice' || k === 'totalQuantity' ? Number(v) || 0 : v ?? null;
    const diff = {};
    for (const [k, v] of Object.entries(update)) {
      if (JSON.stringify(comparable(k, v)) !== JSON.stringify(comparable(k, existing[k]))) diff[k] = v;
    }
    // Keep the items' extra fields when only quantities/prices are re-sent unchanged.
    if (diff.items === undefined) {
      delete diff.totalPrice;
      delete diff.totalQuantity;
    }
    if (diff.totalQuantity !== undefined && diff.items === undefined) delete diff.totalQuantity;
    if (Object.keys(diff).length === 0) return;
    changed.push({ id, ...diff });
    summary.push(`• ${existing.title}: ${Object.keys(diff).filter((k) => k !== 'totalQuantity').join(', ')} changed`);
  });

  return { changed, summary, problems };
}
