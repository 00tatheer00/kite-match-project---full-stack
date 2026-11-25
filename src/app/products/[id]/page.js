import ProductDetailPage from "@/pages-source/ProductDetailPage";
import { notFound } from "next/navigation";
import { fetchServerProductById } from "@/lib/server-products";
import { resolveProduct, getSettings } from "@/lib/data";
import JsonLd from "@/components/seo/JsonLd";
import ProductQuickAnswers from "@/components/seo/ProductQuickAnswers";
import { productSchema, productFaq, productImages, priceOptions } from "@/lib/product-seo";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-schema";

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

  // "<product> Price in Pakistan" is how people search; price + COD in the snippet lifts click-through.
  const title = `${product.title} Price in Pakistan | Order Online – Kite`;
  const prices = priceOptions(product).map((o) => o.price);
  const priceText = prices.length ? ` From Rs ${Math.min(...prices).toLocaleString("en-US")}.` : "";
  const tail = `${priceText} Cash on delivery all over Pakistan.`;
  const base = String(
    product.description ||
      `${product.title} - premium quality product manufactured in Pakistan by Kite Brand.`
  )
    .replace(/\s+/g, " ")
    .trim();
  const room = 158 - tail.length;
  const description = (base.length > room ? `${base.slice(0, room - 1).replace(/\s+\S*$/, "")}…` : base) + tail;
  const canonical = `/products/${product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: `https://www.kitepk.com${canonical}`,
      type: "website",
      images: productImages(product).slice(0, 4).map((url) => ({ url, alt: product.title })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: productImages(product).slice(0, 1),
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

  const settings = await getSettings().catch(() => null);

  const schemas = product
    ? [
        productSchema(product, settings),
        breadcrumbSchema([
          { name: "Products", path: "/products" },
          { name: product.title, path: `/products/${product.id}` },
        ]),
        faqSchema(productFaq(product, settings)),
      ]
    : null;

  return (
    <>
      <JsonLd data={schemas} />
      <ProductDetailPage initialProduct={product} productId={id} />
      <ProductQuickAnswers product={product} settings={settings} />
    </>
  );
}
