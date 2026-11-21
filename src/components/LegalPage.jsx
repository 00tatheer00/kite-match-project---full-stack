// Shared layout for legal/policy pages (server component).
export default function LegalPage({ title, updated, children }) {
  return (
    <div className="bg-white py-12 md:py-16 px-4">
      <article className="max-w-3xl mx-auto text-[#333333] leading-relaxed">
        <h1 className="text-3xl md:text-4xl font-bold text-[#222222] mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {updated}</p>
        <div className="space-y-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#222222] [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#00AEEF] [&_a]:underline">
          {children}
        </div>
      </article>
    </div>
  );
}
