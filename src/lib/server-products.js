import { getAllProducts as getStoreProducts, getProductById as getStoreProductById, getAllPromotions as getStorePromotions } from '@/lib/store';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function fetchServerProducts() {
  try {
    await connectToDatabase();
    const prods = await Product.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    if (prods && prods.length > 0) {
      return JSON.parse(JSON.stringify(prods));
    }
  } catch (e) {
    // MongoDB unavailable or offline
  }

  try {
    const prods = getStoreProducts();
    if (prods && prods.length > 0) {
      return JSON.parse(JSON.stringify(prods));
    }
  } catch (e) {
    // store error
  }

  return [];
}

export async function fetchServerProductById(id) {
  try {
    await connectToDatabase();
    const prod = await Product.findOne({ $or: [{ id }, { _id: id }] }).lean();
    if (prod) {
      return JSON.parse(JSON.stringify(prod));
    }
  } catch (e) {}

  try {
    const prod = getStoreProductById(id);
    if (prod) {
      return JSON.parse(JSON.stringify(prod));
    }
  } catch (e) {}

  return null;
}

export async function fetchServerPromotions() {
  try {
    const promos = getStorePromotions();
    if (promos && promos.length > 0) {
      return JSON.parse(JSON.stringify(promos));
    }
  } catch (e) {}
  return [];
}
