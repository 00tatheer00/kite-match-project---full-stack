import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo-schema";
import ContactPage from "@/pages-source/ContactPage";

export const metadata = {
  title: "Contact Us | Mohsin Match Factory & Kite Brand Pakistan",
  description:
    "Get in touch with Mohsin Match Factory & Kite Brand. Factory address in Hayatabad Industrial Estate Peshawar, official phone numbers, and inquiry details.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Mohsin Match Factory & Kite Brand Pakistan",
    description:
      "Get in touch with Mohsin Match Factory & Kite Brand. Factory address in Hayatabad Industrial Estate Peshawar, official phone numbers, and inquiry details.",
    url: "https://www.kitepk.com/contact",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Contact", path: "/contact" }])} />
      <ContactPage />
    </>
  );
}
