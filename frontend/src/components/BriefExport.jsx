import { FaGlobeAsia, FaShippingFast, FaCertificate } from "react-icons/fa";
import { Link } from "react-router-dom";

const BriefExport = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
              Global Reach
            </h2>
            <h3 className="text-[#222222]  text-justify text-4xl md:text-5xl font-bold mb-6">
              Mohsin Match Factory - Exporting Matches to 40+ Countries
            </h3>
            <p className="text-[#666666] text-lg leading-relaxed mb-8">
              Since 1995, Mohsin Match Factory has been Pakistan's largest
              safety match exporter, delivering matches across Europe, Asia,
              Africa, and the Middle East with uncompromising quality.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <FaGlobeAsia className="text-3xl text-[#00AEEF] mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-[#222222] text-xl font-bold mb-2">
                    International Presence
                  </h4>
                  <p className="text-[#666666]">
                    Established partnerships in Congo, South Africa, Saudi
                    Arabia,  Romania, UAE, Ukraine, Lebanon, Uzbekistan, Nigeria, Sudan, Kenya, Hungary, Honduras, Ethopia, Egypt, Tanzania and
                    more
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaShippingFast className="text-3xl text-[#ED028C] mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-[#222222] text-xl font-bold mb-2">
                    Reliable Logistics
                  </h4>
                  <p className="text-[#666666]">
                    Complete export services including documentation, shipping,
                    and customs clearance
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCertificate className="text-3xl text-[#00AEEF] mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-[#222222] text-xl font-bold mb-2">
                    Quality Assured
                  </h4>
                  <p className="text-[#666666]">
                    All products come with international certifications and
                    quality guarantees
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/export/safety-matches"
              className="inline-block bg-[#00AEEF] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#0095CC] transition-all duration-300 shadow-lg"
            >
              Explore Export Services
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br card-hover from-[#00AEEF] to-[#0095CC] rounded-2xl p-8 text-center text-white">
              <div className="text-5xl font-bold mb-2">40+</div>
              <div className="text-lg">Export Countries</div>
            </div>
            <div className="bg-gradient-to-br card-hover from-[#ED028C] to-[#d4027a] rounded-2xl p-8 text-center text-white">
              <div className="text-5xl font-bold mb-2">30+</div>
              <div className="text-lg">Years Experience</div>
            </div>
            <div className="bg-gradient-to-br card-hover from-[#ED028C] to-[#d4027a] rounded-2xl p-8 text-center text-white">
              <div className="text-5xl font-bold mb-2">#1</div>
              <div className="text-lg">Match Exporter</div>
            </div>
            <div className="bg-gradient-to-br card-hover from-[#00AEEF] to-[#0095CC] rounded-2xl p-8 text-center text-white">
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-lg">Quality Assured</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BriefExport;
