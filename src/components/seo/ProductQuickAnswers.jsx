import { priceOptions, productFaq, makerOf, shippingFor } from "@/lib/product-seo";

const fmt = (n) => `Rs ${Number(n).toLocaleString("en-US")}`;

/**
 * Server-rendered "key facts + quick answers" block under each product.
 * Plain HTML (no JS needed) so Google featured snippets and AI assistants can quote it.
 */
export default function ProductQuickAnswers({ product, settings }) {
  if (!product) return null;
  const options = priceOptions(product);
  const prices = options.map((o) => o.price);
  const faq = productFaq(product, settings);
  const shipping = shippingFor(product, settings);

  const facts = [
    ["Brand", "Kite"],
    ["Made by", makerOf(product)],
    product.category && ["Category", product.category],
    prices.length > 0 && ["Price", prices.length === 1 ? fmt(prices[0]) : `${fmt(Math.min(...prices))} – ${fmt(Math.max(...prices))}`],
    options.length > 0 && ["Sizes", [...new Set(options.map((o) => o.name))].slice(0, 10).join(", ")],
    ["Payment", "Cash on delivery"],
    ["Delivery", shipping > 0 ? `All over Pakistan, ${fmt(shipping)}` : "All over Pakistan, free"],
    ["Returns", "Replacement or refund within 48 hours for damaged or wrong items"],
  ].filter(Boolean);

  return (
    <section aria-labelledby="quick-answers" className="bg-white border-t border-[#E0E0E0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 id="quick-answers" className="text-2xl sm:text-3xl font-bold text-[#222222] mb-6">
          {product.title}: key facts &amp; quick answers
        </h2>

        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-10 text-sm sm:text-base">
          {facts.map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b border-[#F0F0F0] pb-2">
              <dt className="w-28 shrink-0 font-semibold text-[#222222]">{k}</dt>
              <dd className="text-[#555555]">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3">
          {faq.map(({ q, a }, i) => (
            <details key={q} className="group rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] open:bg-white" open={i === 0}>
              <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-[#222222] flex justify-between gap-4">
                <h3 className="text-base">{q}</h3>
                <span aria-hidden="true" className="text-[#006DA8] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-5 pb-5 text-[#555555] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
