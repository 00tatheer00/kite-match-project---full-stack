import PromotionsPackagesPage from "@/pages-source/PromotionsPackagesPage";
import { fetchServerProducts, fetchServerPromotions } from "@/lib/server-products";

export const metadata = {
  title: "Promotions & Deals | Kite Detergent & Matches Bundles",
  description:
    "Save with Kite Brand value packs, wholesale cartons, and combination deals on Kite Glow, Burq Action washing powders, and dishwash bars.",
  alternates: {
    canonical: "/promotions-packages",
  },
  openGraph: {
    title: "Promotions & Deals | Kite Detergent & Matches Bundles",
    description:
      "Save with Kite Brand value packs, wholesale cartons, and combination deals on Kite Glow, Burq Action washing powders, and dishwash bars.",
    url: "https://www.kitepk.com/promotions-packages",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default async function Page() {
  const [products, packages] = await Promise.all([
    fetchServerProducts(),
    fetchServerPromotions(),
  ]);
  return (
    <PromotionsPackagesPage
      initialProducts={products}
      initialPackages={packages}
    />
  );
}
