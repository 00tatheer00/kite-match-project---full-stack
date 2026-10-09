import ProductDetailPage from "@/pages-source/ProductDetailPage";
import { fetchServerProductById } from "@/lib/server-products";

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
  const product = await fetchServerProductById(id);

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        image: product.image || "https://www.kitepk.com/logo.png",
        description: product.description?.replace(/\r?\n|\r/g, " ")?.trim(),
        brand: {
          "@type": "Brand",
          name: "Kite Brand Pakistan",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "PKR",
          lowPrice: product.variants?.[0]?.price || 10,
          highPrice: product.variants?.[product.variants.length - 1]?.price || 500,
          offerCount: product.variants?.length || 1,
          availability: "https://schema.org/InStock",
        },
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <ProductDetailPage initialProduct={product} productId={id} />
    </>
  );
}
