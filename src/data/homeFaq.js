// Homepage FAQ. Shown on the page AND emitted as FAQPage structured data (app/page.js),
// so Google and AI assistants (ChatGPT, Gemini, Perplexity) can quote direct answers.
// Keep every answer factual and consistent with the rest of the site.
export const HOME_FAQ = [
  {
    q: "Which is the best match factory in Pakistan?",
    a: "Mohsin Match Factory (Pvt.) Ltd., the maker of Kite safety matches, is one of Pakistan's leading and oldest match factories. It has manufactured safety matches in Peshawar since 1974 as part of Aziz Group of Industries and exports to 40+ countries.",
  },
  {
    q: "Where is Mohsin Match Factory located?",
    a: "Plot No. 16, Sector B-1, Phase 5, Industrial Estate Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan.",
  },
  {
    q: "Which safety match brands does Kite make?",
    a: "Kite Safety Matches, Olympia, Party, Tanga and Bird safety matches, available in Large, Classic, Regular and Small sizes.",
  },
  {
    q: "Do you export safety matches and wooden splints?",
    a: "Yes. Mohsin Match Factory exports safety matches and wooden match splints in bulk to buyers in 40+ countries, including private-label packaging. Contact the export team through the Contact page.",
  },
  {
    q: "Can I order Kite products online in Pakistan?",
    a: "Yes. Kite safety matches, Kite Glow and BURQ Action detergents, Vero detergent and Kite Dish Wash Bar can be ordered online at kitepk.com with cash on delivery across Pakistan.",
  },
  {
    q: "What other products does Kite make besides matches?",
    a: "Kite Glow Detergent, BURQ Action Detergent, Vero Detergent and Kite Dish Wash Bar, manufactured in Pakistan.",
  },
];

export const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};
