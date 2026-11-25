import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import BoardDivisionPage from "@/pages-source/BoardDivisionPage";

export const metadata = {
  title: "Board Division | Aziz Group Packaging & Duplex Board",
  description:
    "Aziz Group Board Division produces high-tensile duplex paperboard and industrial packaging materials for local and export markets.",
  alternates: {
    canonical: "/board-division",
  },
  openGraph: {
    title: "Board Division | Aziz Group Packaging & Duplex Board",
    description:
      "Aziz Group Board Division produces high-tensile duplex paperboard and industrial packaging materials for local and export markets.",
    url: "https://www.kitepk.com/board-division",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Board Division", path: "/board-division" }])} />
      <BoardDivisionPage />
    </>
  );
}
