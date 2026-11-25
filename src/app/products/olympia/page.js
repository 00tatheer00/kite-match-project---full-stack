import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import OlympiaMatchesPage from "@/pages-source/OlympiaMatchesPage";

export const metadata = {
  title: "Olympia Matches | Premium Safety Matches Pakistan",
  description:
    "Olympia safety matches manufactured by Mohsin Match Factory Peshawar. Superior friction striking surface and long-lasting steady flame.",
  alternates: {
    canonical: "/products/olympia",
  },
  openGraph: {
    title: "Olympia Matches | Premium Safety Matches Pakistan",
    description:
      "Olympia safety matches manufactured by Mohsin Match Factory Peshawar. Superior friction striking surface and long-lasting steady flame.",
    url: "https://www.kitepk.com/products/olympia",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Products", path: "/products" }, { name: "Olympia Safety Matches", path: "/products/olympia" }])} />
      <OlympiaMatchesPage />
    </>
  );
}
