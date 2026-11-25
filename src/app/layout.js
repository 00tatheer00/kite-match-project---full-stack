import "./globals.css";
import ClientShell from "@/components/ClientShell";
import Script from "next/script";
import { toJsonLd } from "@/lib/json-ld";
import { Amiri } from "next/font/google";

// Self-hosted by Next (no render-blocking request to Google Fonts).
const amiri = Amiri({ subsets: ["latin", "arabic"], weight: ["400", "700"], style: ["normal", "italic"], display: "swap", variable: "--font-amiri", preload: false });

export const metadata = {
  metadataBase: new URL("https://www.kitepk.com"),
  title: {
    default: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan",
    // Page titles already name the brand; a suffix made them too long for Google (~60 chars).
    template: "%s",
  },
  description:
    "Mohsin Match Factory (Pvt.) Ltd. & Kite Brand is Pakistan's #1 best match factory and largest exporter of premium safety matches, wooden splints, and FMCG detergents to 40+ countries. Established in 1974 in Peshawar under Aziz Group of Industries.",
  keywords: [
    "best match factory in pakistan",
    "match factory in pakistan",
    "mohsin match factory",
    "mohsin match factory peshawar",
    "kite match",
    "kite match factory",
    "safety matches manufacturer in pakistan",
    "safety match export pakistan",
    "wooden splints factory pakistan",
    "match box manufacturer pakistan",
    "match factories in peshawar",
    "aziz group of industries",
    "aziz group match factory",
    "fmcg manufacturer pakistan",
    "kite detergent powder",
    "kite glow detergent",
    "burq action detergent",
    "kite dishwash bar",
    "safety matches peshawar",
    "top match company pakistan",
    "pakistan match export",
  ],
  authors: [{ name: "Mohsin Match Factory (Pvt.) Ltd. & Aziz Group of Industries" }],
  creator: "Mohsin Match Factory (Pvt.) Ltd.",
  publisher: "Mohsin Match Factory (Pvt.) Ltd.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://www.kitepk.com",
    siteName: "Mohsin Match Factory & Kite Brand Pakistan",
    title: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan",
    description:
      "Pakistan's #1 best match factory and largest safety matches exporter since 1974. Mohsin Match Factory (Pvt.) Ltd. & Kite Brand.",
    images: [
      {
        url: "https://www.kitepk.com/logo.png",
        width: 800,
        height: 600,
        alt: "Mohsin Match Factory & Kite Brand Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan",
    description:
      "Pakistan's #1 Safety Match Manufacturer & Largest Exporter to 40+ Countries since 1974.",
    images: ["https://www.kitepk.com/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kite & Mohsin Match",
  },
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#00AEEF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLdStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ManufacturingBusiness", "LocalBusiness"],
      "@id": "https://www.kitepk.com/#organization",
      name: "Mohsin Match Factory (Pvt.) Ltd.",
      alternateName: [
        "Mohsin Match Factory",
        "Kite Match",
        "Kite Match Factory",
        "Kite Brand Pakistan",
        "Mohsin Match Factory Peshawar",
        "Aziz Group Match Factory",
      ],
      url: "https://www.kitepk.com",
      logo: "https://www.kitepk.com/logo.png",
      image: "https://www.kitepk.com/logo.png",
      description:
        "Mohsin Match Factory (Pvt.) Ltd. is the #1 best match factory in Pakistan and the largest exporter of safety matches, wooden splints, and FMCG products since 1974. Operating under Aziz Group of Industries in Industrial Estate Hayatabad, Peshawar, Pakistan.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Plot No. 16, Sector B-1, Phase 5, Industrial Estate, Hayatabad",
        addressLocality: "Peshawar",
        addressRegion: "Khyber Pakhtunkhwa",
        postalCode: "25000",
        addressCountry: "PK",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 33.987,
        longitude: 71.433,
      },
      telephone: ["+92-91-5815056", "+92-300-8592829"],
      email: "match.export@azizgrp.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+92-301-8117666",
          areaServed: "PK",
          availableLanguage: ["English", "Urdu"],
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: "+92-91-5815056",
          email: "sales@kitepk.com",
          areaServed: "PK",
          availableLanguage: ["English", "Urdu"],
        },
        {
          "@type": "ContactPoint",
          contactType: "export sales",
          telephone: "+92-300-8592829",
          email: "match.export@azizgrp.com",
          availableLanguage: ["English"],
        },
      ],
      areaServed: { "@type": "Country", name: "Pakistan" },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 2,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        merchantReturnLink: "https://www.kitepk.com/terms",
      },
      priceRange: "$$",
      foundingDate: "1974",
      founder: {
        "@type": "Person",
        name: "Senator Mohsin Aziz",
        jobTitle: "Chairman",
      },
      parentOrganization: {
        "@type": "Organization",
        name: "Aziz Group of Industries",
      },
      slogan: "Pakistan's Largest & Best Match Factory Since 1974",
      award: "#1 Safety Match Manufacturer & Exporter in Pakistan",
      knowsAbout: [
        "Best Match Factory in Pakistan",
        "Safety Matches Manufacturing",
        "Match Box Production",
        "Wooden Splints for Matches",
        "Export Quality Safety Matches",
        "Kite Safety Matches",
        "Olympia Safety Matches",
        "Party Matches",
        "Tanga Matches",
        "FMCG Laundry Detergents",
      ],
      sameAs: [
        "https://www.facebook.com/kitematchpk/",
        "https://www.instagram.com/kitematch/?hl=en",
        "https://www.youtube.com/@kitematch",
        "https://www.tiktok.com/@houseofkite",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.kitepk.com/#website",
      url: "https://www.kitepk.com",
      name: "Mohsin Match Factory & Kite Brand",
      description:
        "Official portal for Mohsin Match Factory & Kite Brand - Best Match Factory and FMCG Manufacturer in Pakistan",
      publisher: {
        "@id": "https://www.kitepk.com/#organization",
      },
      inLanguage: "en-PK",
    },
  ],
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-ZBCNV5GV6C";

  return (
    <html lang="en" className={amiri.variable}>
      <head>
        {/* Performance Preconnect Resource Hints */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Structured Data (JSON-LD) for #1 Google Rank for "best match factory in pakistan" & "mohsin match factory" */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLdStructuredData) }}
        />
      </head>
      <body>
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                    allow_google_signals: false,
                    allow_ad_personalization_signals: false,
                    restricted_data_processing: true
                  });
                `,
              }}
            />
          </>
        )}
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
