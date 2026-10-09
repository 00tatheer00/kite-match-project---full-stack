import AboutUsPage from "@/pages-source/AboutUsPage";

export const metadata = {
  title: "About Us | Mohsin Match Factory & Aziz Group Pakistan",
  description:
    "Founded in 1974 by Senator Mohsin Aziz, Mohsin Match Factory is Pakistan's largest match manufacturer and leading FMCG conglomerate under Aziz Group.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Mohsin Match Factory & Aziz Group Pakistan",
    description:
      "Founded in 1974 by Senator Mohsin Aziz, Mohsin Match Factory is Pakistan's largest match manufacturer and leading FMCG conglomerate under Aziz Group.",
    url: "https://www.kitepk.com/about",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

export default function Page() {
  return <AboutUsPage />;
}
