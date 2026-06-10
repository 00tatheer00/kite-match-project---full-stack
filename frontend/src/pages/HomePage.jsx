import HomePageContent from "../components/HomePageContent";
import SeoHead from "../components/seo/SeoHead";
import StructuredData from "../components/seo/StructuredData";
import { SITE_URL } from "../utils/seo";

const HomePage = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kite Brand Pakistan",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-91-5815056",
      contactType: "customer support",
      areaServed: "PK",
    },
    sameAs: [
      "https://www.facebook.com/kitematchpk/",
      "https://www.instagram.com/kitematch/?hl=en",
      "https://www.youtube.com/@kitematch",
      "https://www.tiktok.com/@houseofkite",
    ],
  };

  return (
    <>
      <SeoHead
        title="Pakistan's Trusted FMCG Brand"
        description="Discover Kite Brand's premium FMCG products, safety matches, detergents, and global export excellence from Pakistan."
        path="/"
      />
      <StructuredData data={organizationSchema} />
      <HomePageContent />
    </>
  );
};

export default HomePage;
