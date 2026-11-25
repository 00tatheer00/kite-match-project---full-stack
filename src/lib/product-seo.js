// Builds factual SEO / answer-engine content for a product page from catalog data only.
// Nothing here is invented: prices, sizes and shipping come from the database,
// policies come from the Terms page.
import { SITE, ORG_ID, returnPolicy, shippingDetails } from "./seo-schema";

const imgSrc = (v) => (typeof v === "string" ? v : v?.src || v?.url || v?.image || null);
const fmt = (n) => `Rs ${Number(n).toLocaleString("en-US")}`;

/** Every purchasable option: [{ name, price }] */
export function priceOptions(product) {
  if (!product) return [];
  const hasBrands = (product.brands || []).length > 0;
  const own = hasBrands ? [] : [...(product.variants || []), ...(product.skus || []).map((s) => ({ ...s, name: s.name || s.size }))];
  const branded = (product.brands || []).flatMap((b) =>
    (b?.variants || []).map((v) => ({ ...v, name: [b?.name, v?.name].filter(Boolean).join(" – ") }))
  );
  return [...own, ...branded]
    .map((v) => ({ name: String(v?.name || "").trim(), price: Number(v?.price), detail: v?.detail, packing: v?.packing }))
    .filter((v) => v.name && Number.isFinite(v.price) && v.price > 0);
}

export function productImages(product) {
  const list = [
    imgSrc(product?.image),
    ...(product?.images || []).map(imgSrc),
    ...(product?.variantImages || []).map(imgSrc),
  ].filter(Boolean);
  const unique = [...new Set(list)].slice(0, 8);
  return unique.length ? unique : [`${SITE}/logo.png`];
}

const isMatches = (p) => p?.productType === "matches" || /match/i.test(p?.category || "");
export const makerOf = (p) =>
  isMatches(p)
    ? "Mohsin Match Factory (Pvt.) Ltd., the maker of Kite safety matches, in Peshawar, Pakistan (since 1974, Aziz Group of Industries)"
    : "Kite Brand, part of Aziz Group of Industries, Pakistan";

export function shippingFor(product, settings) {
  if (product?.shippingCost !== null && product?.shippingCost !== undefined && product?.shippingCost !== "") {
    return Number(product.shippingCost);
  }
  return Number(settings?.defaultShippingCost) || 200;
}

export function productSchema(product, settings) {
  const url = `${SITE}/products/${product.id}`;
  const shipping = shippingFor(product, settings);
  const options = priceOptions(product);
  const description = String(product.description || "").replace(/\s+/g, " ").trim();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    url,
    image: productImages(product),
    description: description || `${product.title} by Kite Brand Pakistan.`,
    sku: product.id,
    category: product.category || undefined,
    brand: { "@type": "Brand", name: "Kite" },
    manufacturer: { "@id": ORG_ID },
    countryOfOrigin: "PK",
    ...(options.length > 0 && {
      offers: options.map((o) => ({
        "@type": "Offer",
        name: o.name,
        url,
        price: o.price,
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORG_ID },
        shippingDetails: shippingDetails(shipping),
        hasMerchantReturnPolicy: returnPolicy,
      })),
    }),
  };
}

/** Short, direct Q&A for the visible "Quick answers" block and FAQPage schema. */
export function productFaq(product, settings) {
  const title = product.title;
  const options = priceOptions(product);
  const prices = options.map((o) => o.price);
  const shipping = shippingFor(product, settings);
  const qa = [];

  if (prices.length === 1) {
    qa.push({ q: `What is the price of ${title} in Pakistan?`, a: `${title} (${options[0].name}) costs ${fmt(prices[0])} on kitepk.com, the official Kite website. Delivery charges are shown at checkout.` });
  } else if (prices.length > 1) {
    const list = options.slice(0, 8).map((o) => `${o.name}: ${fmt(o.price)}`).join("; ");
    qa.push({ q: `What is the price of ${title} in Pakistan?`, a: `${title} prices on kitepk.com range from ${fmt(Math.min(...prices))} to ${fmt(Math.max(...prices))}. ${list}.` });
  }

  const names = [...new Set(options.map((o) => o.name))];
  if (names.length > 0) {
    qa.push({ q: `Which sizes of ${title} are available?`, a: `${title} is available in: ${names.slice(0, 12).join(", ")}.` });
  }

  qa.push(
    {
      q: `How can I order ${title} online?`,
      a: `Choose a size on this page and tap "Add to Cart", then check out with your name, phone number and address. You can also order on WhatsApp at 0301 8117666. Payment is cash on delivery.`,
    },
    {
      q: `Is cash on delivery available for ${title}?`,
      a: `Yes. Every order on kitepk.com is cash on delivery (COD) anywhere in Pakistan: you pay the courier when the parcel arrives.`,
    },
    {
      q: `What is the delivery charge for ${title}?`,
      a: shipping > 0
        ? `Standard delivery is ${fmt(shipping)} per order in Pakistan. Some promotional packages include free delivery. The exact amount is shown before you place the order.`
        : `Delivery is free for this product in Pakistan.`,
    },
    {
      q: `Can I return or replace ${title}?`,
      a: `Damaged, defective or incorrect items are replaced or refunded if reported within 48 hours of delivery with photos of the product and packaging. See the Terms page for details.`,
    },
    { q: `Who makes ${title}?`, a: `${title} is made by ${makerOf(product)}.` }
  );
  return qa;
}
