import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import BirdMatchesPage from "@/pages-source/BirdMatchesPage";

export const metadata = {
  title: "Bird Matches | Quality Safety Matchboxes Pakistan",
  description:
    "Bird brand safety matchboxes by Mohsin Match Factory. Durable wooden splints with dependable ignition for households across Pakistan.",
  alternates: {
    canonical: "/products/bird",
  },
  openGraph: {
    title: "Bird Matches | Quality Safety Matchboxes Pakistan",
    description:
      "Bird brand safety matchboxes by Mohsin Match Factory. Durable wooden splints with dependable ignition for households across Pakistan.",
    url: "https://www.kitepk.com/products/bird",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Products", path: "/products" }, { name: "Bird Safety Matches", path: "/products/bird" }])} />
      <BirdMatchesPage />
    </>
  );
}
