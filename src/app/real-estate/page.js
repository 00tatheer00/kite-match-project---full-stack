import RealEstatePage from "@/pages-source/RealEstatePage";

export const metadata = {
  title: "Real Estate Division | Aziz Group Developments Pakistan",
  description:
    "Commercial, industrial, and residential real estate development projects by Aziz Group of Industries across prime locations in Pakistan.",
  alternates: {
    canonical: "/real-estate",
  },
  openGraph: {
    title: "Real Estate Division | Aziz Group Developments Pakistan",
    description:
      "Commercial, industrial, and residential real estate development projects by Aziz Group of Industries across prime locations in Pakistan.",
    url: "https://www.kitepk.com/real-estate",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return <RealEstatePage />;
}
