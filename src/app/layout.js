import "./globals.css";
import ClientShell from "@/components/ClientShell";
import PwaRegister from "@/components/PwaRegister";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://kitepk.com"),
  title: {
    default: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan",
    template: "%s | Mohsin Match Factory & Kite Brand",
  },
  description:
    "Mohsin Match Factory (Pvt.) Ltd. & Kite Brand is Pakistan's #1 best match factory and largest exporter of premium safety matches, wooden splints, and FMCG detergents to 40+ countries. Established in 1974 in Peshawar under Aziz Group of Industries.",
  keywords: [
    "best match factory in pakistan",
    "match factory in pakistan",
    "nest match factory in pakistan",
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
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://kitepk.com",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://kitepk.com",
    siteName: "Mohsin Match Factory & Kite Brand Pakistan",
    title: "Mohsin Match Factory & Kite | Best Match Factory in Pakistan",
    description:
      "Pakistan's #1 best match factory and largest safety matches exporter since 1974. Mohsin Match Factory (Pvt.) Ltd. & Kite Brand.",
    images: [
      {
        url: "https://kitepk.com/logo.png",
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
    images: ["https://kitepk.com/logo.png"],
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
      "@id": "https://kitepk.com/#organization",
      name: "Mohsin Match Factory (Pvt.) Ltd.",
      alternateName: [
        "Mohsin Match Factory",
        "Kite Match",
        "Kite Match Factory",
        "Kite Brand Pakistan",
        "Mohsin Match Factory Peshawar",
        "Aziz Group Match Factory",
      ],
      url: "https://kitepk.com",
      logo: "https://kitepk.com/logo.png",
      image: "https://kitepk.com/logo.png",
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
      "@id": "https://kitepk.com/#website",
      url: "https://kitepk.com",
      name: "Mohsin Match Factory & Kite Brand",
      description:
        "Official portal for Mohsin Match Factory & Kite Brand - Best Match Factory and FMCG Manufacturer in Pakistan",
      publisher: {
        "@id": "https://kitepk.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://kitepk.com/products?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-ZBCNV5GV6C";

  return (
    <html lang="en">
      <head>
        {/* Performance Preconnect Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        />

        <link rel="icon" type="image/svg+xml" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00AEEF" />

        {/* Structured Data (JSON-LD) for #1 Google Rank for "best match factory in pakistan" & "mohsin match factory" */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
      </head>
      <body>
        <PwaRegister />
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
