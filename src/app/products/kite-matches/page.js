import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import KiteMatchesPage from "@/pages-source/KiteMatchesPage";

export const metadata = {
  title: "Kite Matches | Premium Safety Matches by Mohsin Match",
  description:
    "Buy Kite Matches manufactured by Mohsin Match Factory. Carbonized wooden splints, moisture resistant striking friction, and reliable flame.",
  alternates: {
    canonical: "/products/kite-matches",
  },
  openGraph: {
    title: "Kite Matches | Premium Safety Matches by Mohsin Match",
    description:
      "Buy Kite Matches manufactured by Mohsin Match Factory. Carbonized wooden splints, moisture resistant striking friction, and reliable flame.",
    url: "https://www.kitepk.com/products/kite-matches",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Products", path: "/products" }, { name: "Kite Safety Matches", path: "/products/kite-matches" }])} />
      <KiteMatchesPage />
    </>
  );
}
