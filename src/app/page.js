import HomePage from "@/pages-source/HomePage";
import { toJsonLd } from "@/lib/json-ld";
import { homeFaqSchema } from "@/data/homeFaq";

export const metadata = {
  title: { absolute: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan" },
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(homeFaqSchema) }} />
      <HomePage />
    </>
  );
}
