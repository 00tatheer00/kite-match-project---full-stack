import Link from "next/link";
import { HOME_FAQ } from "@/data/homeFaq";

/** Visible page heading + short intro right under the hero (main keywords, real facts). */
export function HomeIntro() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-[#00AEEF] font-bold uppercase tracking-widest text-sm mb-3">
          Since 1974 · Peshawar, Pakistan
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#222222] leading-tight">
          Mohsin Match Factory &amp; Kite — Pakistan&apos;s Leading Safety Match Manufacturer
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
          Makers of <strong>Kite, Olympia, Party, Tanga and Bird safety matches</strong>, wooden match splints and
          Kite FMCG products (Kite Glow, BURQ Action, Vero detergents and Kite Dish Wash Bar). Part of Aziz Group of
          Industries, exporting to 40+ countries and delivering across Pakistan.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/online-order" className="px-6 py-3 rounded-full bg-[#00AEEF] text-white font-bold shadow-md hover:bg-[#0095CC] transition-colors">
            Order Online
          </Link>
          <Link href="/export/safety-matches" className="px-6 py-3 rounded-full border-2 border-[#00AEEF] text-[#00AEEF] font-bold hover:bg-sky-50 transition-colors">
            Export Enquiry
          </Link>
        </div>
      </div>
    </section>
  );
}

/** FAQ block (the same questions are published as FAQPage structured data). */
export function HomeFaq() {
  return (
    <section className="bg-[#F9FAFB] py-14 md:py-20" aria-labelledby="home-faq-title">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="home-faq-title" className="text-3xl md:text-4xl font-black text-[#222222] text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {HOME_FAQ.map(({ q, a }) => (
            <details key={q} className="group bg-white rounded-2xl border border-slate-200 shadow-sm open:shadow-md transition-shadow">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-6 py-5 font-bold text-[#222222] text-lg">
                <h3 className="text-lg font-bold">{q}</h3>
                <span className="shrink-0 text-[#00AEEF] text-2xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="px-6 pb-6 -mt-1 text-slate-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
