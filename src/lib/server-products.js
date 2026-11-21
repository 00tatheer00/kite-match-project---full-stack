// Server-side catalog loaders for Server Components (pages, sitemap, metadata).
// Backed by Supabase via lib/data.js. They never throw: on a DB hiccup the page
// renders with empty data and the client components re-fetch from the API.
import { safeGetProduct, safeListProducts, safeListPromotions } from './data';

export const fetchServerProducts = safeListProducts;
export const fetchServerPromotions = safeListPromotions;
export const fetchServerProductById = safeGetProduct;
