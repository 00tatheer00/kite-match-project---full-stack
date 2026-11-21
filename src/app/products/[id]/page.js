import ProductDetailPage from "@/pages-source/ProductDetailPage";
import { notFound } from "next/navigation";
import { fetchServerProductById } from "@/lib/server-products";
import { resolveProduct } from "@/lib/data";
import { toJsonLd } from "@/lib/json-ld";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await fetchServerProductById(id);
  if (!product) {
    return {
      title: "Product Details | Kite Brand Pakistan",
      description: "View specifications, packaging, and details of Kite Brand products.",
      alternates: { canonical: `/products/${id}` },
    };
  }

  const title = `${product.title} | Kite Brand Pakistan`;
  const description = (
    product.description ||
    `${product.title} - premium quality FMCG and safety match product manufactured in Pakistan by Kite Brand.`
  )
    .replace(/\r?\n|\r/g, " ")
    .trim()
    .slice(0, 155);

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.kitepk.com/products/${id}`,
      images: product.image ? [{ url: product.image }] : ["https://www.kitepk.com/logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : ["https://www.kitepk.com/logo.png"],
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;

  // Real 404 for unknown/inactive products (no "soft 404" pages in search results).
  // On a database error we still render and let the client retry.
  let product = null;
  let databaseError = false;
  try {
    product = await resolveProduct(id);
  } catch {
    databaseError = true;
  }
  if (!databaseError && (!product || product.isActive === false)) notFound();

  // All purchasable prices (product variants + brand variants), for an accurate AggregateOffer.
  const prices = product
    ? [
        ...(product.variants || []),
        ...(product.brands || []).flatMap((b) => b?.variants || []),
        ...(product.skus || []),
      ]
        .map((v) => Number(v?.price))
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        image: product.image || "https://www.kitepk.com/logo.png",
        description: product.description?.replace(/\s+/g, " ").trim() || undefined,
        sku: product.id,
        category: product.category || undefined,
        brand: {
          "@type": "Brand",
          name: "Kite Brand Pakistan",
        },
        ...(prices.length > 0 && {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "PKR",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            availability: "https://schema.org/InStock",
            url: `https://www.kitepk.com/products/${product.id}`,
          },
        }),
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(productSchema) }}
        />
      )}
      <ProductDetailPage initialProduct={product} productId={id} />
    </>
  );
}
