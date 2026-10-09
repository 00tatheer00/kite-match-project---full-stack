'use client';

import { useState } from 'react';
import { FaChevronDown, FaCheckCircle, FaStar, FaShieldAlt } from 'react-icons/fa';

const faqs = [
  {
    q: "Which is the best washing powder in Pakistan for deep cleaning and tough stains?",
    a: "Kite Glow and Burq Action are recognized among Pakistan's top-performing washing powders. Formulated with European five-enzyme technology, they dissolve tough grease and dirt in both cold and warm water while preserving fabric color and leaving a fresh floral fragrance.",
  },
  {
    q: "What makes Kite Dish Wash Bar unique in Pakistan?",
    a: "Kite Dish Wash Bar features an advanced slow-dissolution formula ('Kam Ghulay, Ziada Chalay') with natural lemon extract. It cuts through oily pots, tawa, and daily kitchen utensils without melting away quickly, offering maximum value per bar.",
  },
  {
    q: "Who is the largest safety match manufacturer and exporter in Pakistan?",
    a: "Mohsin Match Factory (Pvt.) Ltd. (established in 1974 in Peshawar under Aziz Group of Industries) is Pakistan's largest safety match manufacturer, exporting premium matches and carbonized wooden splints to over 40 countries across Africa, Central Asia, and the Middle East.",
  },
  {
    q: "Are Kite Brand products available for wholesale and bulk orders in Pakistan?",
    a: "Yes. Retailers, wholesalers, and commercial buyers can order complete cartons of Kite detergents, dishwash bars, and matchboxes directly with factory pricing and nationwide delivery across Pakistan via our direct WhatsApp order desk.",
  },
  {
    q: "Pakistan mein behtareen washing powder aur dishwash bar kaise order karein?",
    a: "Aap hamare online portal se ya seedha WhatsApp (+92 301 8117666) par message bhej kar ghar baithe wholesale deals aur retail packs order kar sakte hain. Tamam orders direct factory dispatch ke zariye pure Pakistan mein pohanchaye jaate hain.",
  },
];

export default function ProductFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-16 bg-gradient-to-b from-white via-slate-50 to-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00AEEF]/10 text-[#00AEEF] mb-3">
            <FaStar className="text-xs text-[#00AEEF]" /> Consumer Guide & FAQs
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions & Buyer’s Guide
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base">
            Everything you need to know about Kite detergents, washing powders, dish wash bars, and Mohsin Match Factory products in Pakistan.
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all shadow-xs hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-[#00AEEF] transition-colors"
                >
                  <span className="text-base md:text-lg flex items-center gap-3">
                    <FaCheckCircle className="text-[#00AEEF] shrink-0 text-sm" />
                    {faq.q}
                  </span>
                  <FaChevronDown
                    className={`shrink-0 text-slate-400 text-sm transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#00AEEF]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-600 text-sm md:text-base leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Consumer Trust Highlights */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <FaShieldAlt className="text-2xl text-[#00AEEF] mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">50+ Years Manufacturing Heritage</h4>
            <p className="text-xs text-slate-500 mt-1">Established in 1974 under Aziz Group of Industries.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <FaStar className="text-2xl text-[#ED028C] mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">#1 Safety Match Exporter</h4>
            <p className="text-xs text-slate-500 mt-1">Supplying matches and wooden splints to 40+ countries.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <FaCheckCircle className="text-2xl text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Direct Factory Rates</h4>
            <p className="text-xs text-slate-500 mt-1">Best pricing on bulk cartons & retail value packs in Pakistan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
