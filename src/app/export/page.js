import ExportPage from "@/pages-source/ExportPage";

export const metadata = {
  title: "Safety Match & Splints Export | Mohsin Match Factory",
  description:
    "Pakistan's #1 exporter of safety matches and wooden splints to 40+ countries across Africa, Middle East, Europe & Central Asia since 1974.",
  alternates: {
    canonical: "/export",
  },
  openGraph: {
    title: "Safety Match & Splints Export | Mohsin Match Factory",
    description:
      "Pakistan's #1 exporter of safety matches and wooden splints to 40+ countries across Africa, Middle East, Europe & Central Asia since 1974.",
    url: "https://www.kitepk.com/export",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return <ExportPage />;
}
