import ProductsPage from "@/pages-source/ProductsPage";
import { fetchServerProducts } from "@/lib/server-products";

export const metadata = {
  title: "Products | Kite Brand Safety Matches & Detergents Pakistan",
  description:
    "Explore Kite Brand's complete range: Kite & Burq Action washing powders, Dish Wash Bar, and world-class safety match boxes manufactured in Pakistan.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products | Kite Brand Safety Matches & Detergents Pakistan",
    description:
      "Explore Kite Brand's complete range: Kite & Burq Action washing powders, Dish Wash Bar, and world-class safety match boxes manufactured in Pakistan.",
    url: "https://www.kitepk.com/products",
    images: ["https://www.kitepk.com/logo.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is the best washing powder in Pakistan for deep cleaning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kite Glow and Burq Action are recognized among Pakistan's top-performing washing powders. Formulated with European five-enzyme technology, they dissolve tough grease and dirt in both cold and warm water while preserving fabric color.",
      },
    },
    {
      "@type": "Question",
      name: "What makes Kite Dish Wash Bar unique in Pakistan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kite Dish Wash Bar features an advanced slow-dissolution formula ('Kam Ghulay, Ziada Chalay') with natural lemon extract for grease-free kitchenware.",
      },
    },
    {
      "@type": "Question",
      name: "Who is the largest safety match manufacturer and exporter in Pakistan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mohsin Match Factory (Pvt.) Ltd. (established in 1974 in Peshawar under Aziz Group of Industries) is Pakistan's largest safety match manufacturer, exporting matches to over 40 countries.",
      },
    },
  ],
};

export default async function Page() {
  const products = await fetchServerProducts();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kite Brand Products",
    itemListElement: products.map((prod, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: prod.title,
      url: `https://www.kitepk.com/products/${prod.id || prod._id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <ProductsPage initialProducts={products} />
    </>
  );
}
