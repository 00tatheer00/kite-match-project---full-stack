import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import PartyMatchesPage from "@/pages-source/PartyMatchesPage";

export const metadata = {
  title: "Party Matches | High-Grade Matchbox | Mohsin Match",
  description:
    "Party brand safety matches by Mohsin Match Factory. Export-grade safety matchboxes with damp-proof chemical heads and strong poplar splints.",
  alternates: {
    canonical: "/products/party",
  },
  openGraph: {
    title: "Party Matches | High-Grade Matchbox | Mohsin Match",
    description:
      "Party brand safety matches by Mohsin Match Factory. Export-grade safety matchboxes with damp-proof chemical heads and strong poplar splints.",
    url: "https://www.kitepk.com/products/party",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Products", path: "/products" }, { name: "Party Safety Matches", path: "/products/party" }])} />
      <PartyMatchesPage />
    </>
  );
}
