// Server-side JSON-LD builders shared by route pages.
export const SITE = "https://www.kitepk.com";
export const ORG_ID = `${SITE}/#organization`;
export const WHATSAPP_NUMBER = "923018117666"; // online-order helpline 0301 8117666
export const RETURN_DAYS = 2; // terms: report damaged/incorrect items within 48 hours

const abs = (path) => (/^https?:\/\//i.test(path) ? path : `${SITE}${path.startsWith("/") ? path : `/${path}`}`);

/** crumbs: [{ name, path }] — "Home" is added automatically. */
export function breadcrumbSchema(crumbs = []) {
  const list = [{ name: "Home", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/** qa: [{ q, a }] */
export function faqSchema(qa = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "PK",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: RETURN_DAYS,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
  merchantReturnLink: `${SITE}/terms`,
};

export function shippingDetails(cost) {
  const value = Number(cost);
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: Number.isFinite(value) && value >= 0 ? value : 200, currency: "PKR" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
  };
}

export { abs as absoluteUrl };
