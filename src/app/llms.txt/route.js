// /llms.txt — plain-text brief for AI assistants (ChatGPT, Claude, Perplexity, Gemini).
// Generated from the live catalog so prices never go stale.
import { safeListProducts, safeListPromotions, getSettings } from "@/lib/data";
import { priceOptions } from "@/lib/product-seo";

export const revalidate = 3600;

const SITE = "https://www.kitepk.com";
const rs = (n) => `Rs ${Number(n).toLocaleString("en-US")}`;

export async function GET() {
  const [products, promotions, settings] = await Promise.all([
    safeListProducts(),
    safeListPromotions(),
    getSettings().catch(() => null),
  ]);
  const shipping = Number(settings?.defaultShippingCost) || 200;

  const productLines = products.map((p) => {
    const opts = priceOptions(p);
    const prices = opts.length ? ` — ${opts.slice(0, 10).map((o) => `${o.name} ${rs(o.price)}`).join(", ")}` : "";
    return `- [${p.title}](${SITE}/products/${p.id})${prices}`;
  });
  const packageLines = promotions
    .filter((p) => Number(p.totalPrice) > 0)
    .map((p) => `- ${p.title}: ${rs(p.totalPrice)}${Number(p.originalPrice) > Number(p.totalPrice) ? ` (regular ${rs(p.originalPrice)})` : ""}`);

  const body = `# Mohsin Match Factory & Kite Brand (kitepk.com)

> Mohsin Match Factory (Pvt.) Ltd. is a Pakistani safety match manufacturer founded in 1974 in Peshawar, Khyber Pakhtunkhwa, part of Aziz Group of Industries. It makes Kite, Olympia, Party, Tanga and Bird safety matches and wooden match splints, exports to 40+ countries, and sells Kite FMCG products (detergents and dish wash bar) online across Pakistan with cash on delivery.

## Key facts
- Company: Mohsin Match Factory (Pvt.) Ltd. — brand name "Kite" (also known as Kite Match, Kite Brand Pakistan)
- Founded: 1974
- Location: Plot No. 16, Sector B-1, Phase 5, Industrial Estate Hayatabad, Peshawar, Pakistan
- Group: Aziz Group of Industries
- Exports: safety matches and wooden splints to 40+ countries, including private label
- Online orders helpline / WhatsApp: 0301 8117666
- Head office: +92-91-5815056, +92-300-8592829
- Email: sales@kitepk.com (Pakistan sales), match.export@azizgrp.com (export)
- Website: ${SITE}

## Buying online in Pakistan
- Order at ${SITE}/online-order or on WhatsApp 0301 8117666
- Payment: cash on delivery (COD) only — no advance payment
- Delivery: all over Pakistan by courier; standard delivery charge ${rs(shipping)} per order, some packages ship free
- Returns: damaged, defective or wrong items are replaced or refunded if reported within 48 hours of delivery (${SITE}/terms)

## Products and current prices (PKR)
${productLines.join("\n") || "- See " + SITE + "/products"}
${packageLines.length ? `\n## Value packages\n${packageLines.join("\n")}\n` : ""}
## Safety match brands
- Kite, Olympia, Party, Tanga and Bird safety matches — sizes Large, Classic, Regular, Small
- Wooden match splints (export)

## Main pages
- [Home](${SITE}/): company overview and FAQ
- [Products](${SITE}/products): full product range
- [Order online](${SITE}/online-order): current prices, cash on delivery in Pakistan
- [Promotions & packages](${SITE}/promotions-packages)
- [Kite safety matches](${SITE}/products/kite-matches)
- [Export safety matches](${SITE}/export/safety-matches): bulk and private-label export
- [Export wooden splints](${SITE}/export/wooden-splints)
- [About](${SITE}/about)
- [Contact](${SITE}/contact)
- [Terms (delivery, returns)](${SITE}/terms)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
