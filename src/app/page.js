import HomePage from "@/pages-source/HomePage";
import { toJsonLd } from "@/lib/json-ld";
import { homeFaqSchema } from "@/data/homeFaq";
import { fetchServerProducts } from "@/lib/server-products";
import { getSettings } from "@/lib/data";

export const revalidate = 300;

export const metadata = {
  title: { absolute: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan" },
  alternates: { canonical: "/" },
};

export default async function Page() {
  const [products, settings] = await Promise.all([
    fetchServerProducts(),
    getSettings().catch(() => null),
  ]);
  const heroSettings = settings
    ? {
        bannerType: settings.bannerType || null,
        bannerImage: settings.bannerImage || null,
        bannerMobileImage: settings.bannerMobileImage || null,
        bannerTitle: settings.bannerTitle || null,
        bannerLink: settings.bannerLink || null,
      }
    : null;
  const isImageBanner = heroSettings?.bannerType === "image" && Boolean(heroSettings.bannerImage);
  return (
    <>
      {/* Preload the hero (LCP) image the page will actually show */}
      {!isImageBanner && (
        <link rel="preload" as="image" type="image/webp" href="/videos/kite-hero-poster-1280.webp" fetchPriority="high" />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(homeFaqSchema) }} />
      <HomePage initialProducts={products} heroSettings={heroSettings} />
    </>
  );
}
