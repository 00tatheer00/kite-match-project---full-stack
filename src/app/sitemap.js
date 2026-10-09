import { fetchServerProducts } from "@/lib/server-products";

export default async function sitemap() {
  const baseUrl = "https://www.kitepk.com";
  const now = new Date();

  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: "daily" },
    { url: `${baseUrl}/products`, priority: 0.95, changeFrequency: "daily" },
    { url: `${baseUrl}/online-order`, priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/promotions-packages`, priority: 0.85, changeFrequency: "weekly" },
    { url: `${baseUrl}/export`, priority: 0.95, changeFrequency: "weekly" },
    { url: `${baseUrl}/export/safety-matches`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${baseUrl}/export/wooden-splints`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${baseUrl}/about`, priority: 0.85, changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`, priority: 0.85, changeFrequency: "monthly" },
    { url: `${baseUrl}/fmcg-division`, priority: 0.85, changeFrequency: "monthly" },
    { url: `${baseUrl}/textile-division`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/board-division`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/real-estate`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/products/kite-matches`, priority: 0.85, changeFrequency: "weekly" },
    { url: `${baseUrl}/products/tanga-matches`, priority: 0.85, changeFrequency: "weekly" },
    { url: `${baseUrl}/products/olympia`, priority: 0.85, changeFrequency: "weekly" },
    { url: `${baseUrl}/products/party`, priority: 0.85, changeFrequency: "weekly" },
    { url: `${baseUrl}/products/bird`, priority: 0.85, changeFrequency: "weekly" },
  ];

  let dynamicRoutes = [];
  try {
    const products = await fetchServerProducts();
    dynamicRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.id || product._id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch (e) {
    // fallback if error
  }

  return [
    ...staticRoutes.map((route) => ({
      ...route,
      lastModified: now,
    })),
    ...dynamicRoutes,
  ];
}
