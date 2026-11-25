import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import PromotionsPackagesPage from "@/pages-source/PromotionsPackagesPage";
import { fetchServerProducts, fetchServerPromotions } from "@/lib/server-products";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Order Online | Kite Detergent & Matches Price List Pakistan",
  description:
    "Browse prices and order Kite washing powders, dishwash bars, and matchboxes directly via WhatsApp with doorstep delivery across Pakistan.",
  alternates: {
    canonical: "/online-order",
  },
  openGraph: {
    title: "Order Online | Kite Detergent & Matches Price List Pakistan",
    description:
      "Browse prices and order Kite washing powders, dishwash bars, and matchboxes directly via WhatsApp with doorstep delivery across Pakistan.",
    url: "https://www.kitepk.com/online-order",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default async function Page() {
  const [products, packages] = await Promise.all([
    fetchServerProducts(),
    fetchServerPromotions(),
  ]);
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Order Online", path: "/online-order" }])} />
      <PromotionsPackagesPage
        initialProducts={products}
        initialPackages={packages}
      />
    </>
  );
}
