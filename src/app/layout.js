import "./globals.css";
import ClientShell from "@/components/ClientShell";
import PwaRegister from "@/components/PwaRegister";
import Script from "next/script";

export const metadata = {
  title: "Kite Match - Leading Industries of Pakistan",
  description: "A modern, high-performance e-commerce storefront for Kite — Pakistan's trusted FMCG brand.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kite Admin",
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

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-ZBCNV5GV6C';

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00AEEF" />
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
