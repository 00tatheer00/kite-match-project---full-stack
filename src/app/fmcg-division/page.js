import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import FMCGDivisionPage from "@/pages-source/FMCGDivisionPage";

export const metadata = {
  title: "FMCG Division | Kite Detergent, Soap & Cleaners Pakistan",
  description:
    "Kite FMCG Division manufactures high-efficacy laundry detergents, washing powders, and dishwash bars with modern European formulations.",
  alternates: {
    canonical: "/fmcg-division",
  },
  openGraph: {
    title: "FMCG Division | Kite Detergent, Soap & Cleaners Pakistan",
    description:
      "Kite FMCG Division manufactures high-efficacy laundry detergents, washing powders, and dishwash bars with modern European formulations.",
    url: "https://www.kitepk.com/fmcg-division",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "FMCG Division", path: "/fmcg-division" }])} />
      <FMCGDivisionPage />
    </>
  );
}
