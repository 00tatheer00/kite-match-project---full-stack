import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import TangaMatchesPage from "@/pages-source/TangaMatchesPage";

export const metadata = {
  title: "Tanga Matches | Iconic Heritage Safety Matchbox Pakistan",
  description:
    "Pakistan's iconic Tanga Matches by Mohsin Match Factory. Premium quality poplar wood splints with uniform chemical ignition heads.",
  alternates: {
    canonical: "/products/tanga-matches",
  },
  openGraph: {
    title: "Tanga Matches | Iconic Heritage Safety Matchbox Pakistan",
    description:
      "Pakistan's iconic Tanga Matches by Mohsin Match Factory. Premium quality poplar wood splints with uniform chemical ignition heads.",
    url: "https://www.kitepk.com/products/tanga-matches",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Products", path: "/products" }, { name: "Tanga Safety Matches", path: "/products/tanga-matches" }])} />
      <TangaMatchesPage />
    </>
  );
}
