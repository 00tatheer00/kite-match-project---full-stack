import { toJsonLd } from "@/lib/json-ld";

/** Server-rendered JSON-LD block (visible to crawlers in the initial HTML). */
export default function JsonLd({ data }) {
  if (!data) return null;
  const list = Array.isArray(data) ? data.filter(Boolean) : [data];
  return list.map((item, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(item) }} />
  ));
}
