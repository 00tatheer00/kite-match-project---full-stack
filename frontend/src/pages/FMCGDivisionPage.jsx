import { FaFire, FaGlobeAsia, FaDollarSign, FaIndustry } from "react-icons/fa";
import fmgc_img from "../assets/matches_hero.jpg";

const FMCGDivisionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-20"
        style={{
          backgroundImage: `url(${fmgc_img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-black/50 p-4 filter backdrop-blur-xs rounded-xl">
            <h1 className="text-text-white text-4xl md:text-6xl font-bold mb-6">
              Kite Brand - FMCG Division
            </h1>
            <p className="text-text-white text-xl md:text-2xl mb-4">
              Pakistan's Most Trusted FMCG Brand
            </p>
            <p className="text-text-white text-lg md:text-xl max-w-3xl mx-auto">
              Premium detergents, safety matches, and dish wash products - 50+
              years of manufacturing excellence
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-6 text-center">
              Kite Brand - Quality You Can Trust
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <p className="text-lg text-[#666666] leading-relaxed mb-6">
                <strong className="text-[#00AEEF]">Kite</strong> is the flagship
                brand of Mohsin Match Factory (Pvt.) Limited, part of the
                prestigious Aziz Group. With over 50 years of manufacturing
                excellence, we have established ourselves as Pakistan's largest
                and most trusted FMCG manufacturer, employing over 10,000 people
                across the nation.
              </p>
              <p className="text-lg text-[#666666] leading-relaxed mb-6">
                Our{" "}
                <strong className="text-[#00AEEF]">Kite Glow detergent</strong>,
                launched in March 2025, features triple enzyme technology for
                exceptional cleaning power and superior stain removal.{" "}
                <strong className="text-[#ED028C]">Kite Dish Wash Bar</strong>
                has rapidly captured market share with its premium lemon
                fragrance and advanced formula that beats market leaders.
              </p>
              <p className="text-lg text-[#666666] leading-relaxed">
                <strong className="text-[#00AEEF]">Kite Safety Matches</strong>{" "}
                are renowned worldwide, exporting to over 40 countries since
                1995. Our matches are carborised, damp-proof, and manufactured
                with different striking surfaces to meet diverse customer needs.
                We also offer private labeling for toll manufacturing with
                minimal variation.
              </p>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaIndustry className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                50+ Years
              </h3>
              <p className="text-[#666666]">
                Manufacturing excellence since 1974
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGlobeAsia className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                40+ Countries
              </h3>
              <p className="text-[#666666]">
                Global presence across continents
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#0095CC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDollarSign className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                #1 in Pakistan
              </h3>
              <p className="text-[#666666]">
                Largest match manufacturer & exporter
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFire className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                10,000+ Staff
              </h3>
              <p className="text-[#666666]">Employees across the nation</p>
            </div>
          </div>

          {/* Product Brands */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Kite Product Portfolio
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-primary to-primary-600 rounded-xl shadow-lg p-8 text-text-white">
                <h3 className="text-2xl font-bold mb-4">Kite Glow Detergent</h3>
                <p className="text-lg text-text-white mb-4">
                  Premium detergent with triple enzyme technology for
                  exceptional cleaning, superior stain removal, and fabric care
                </p>
                <ul className="text-sm space-y-2">
                  <li>
                    • Available: 2KG, 1KG, 500GM, RS.99, RS.50, RS.20, RS.10
                  </li>
                  <li>• Launched: March 2025</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-text-white">
                <h3 className="text-2xl font-bold mb-4">Kite Safety Matches</h3>
                <p className="text-lg text-text-white mb-4">
                  Pakistan's most trusted matches - carborised, damp-proof, and
                  exported to 40+ countries
                </p>
                <ul className="text-sm space-y-2">
                  <li>
                    • Sizes: Large (58 sticks), Classic (45 sticks), Regular (42
                    sticks)
                  </li>
                  <li>• Different striking surfaces available</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-text-white">
                <h3 className="text-2xl font-bold mb-4">Kite Dish Wash Bar</h3>
                <p className="text-lg text-text-white mb-4">
                  Premium lemon fragrance with slow dissolution - beats market
                  leaders at competitive prices
                </p>
                <ul className="text-sm space-y-2">
                  <li>• Sizes: Super Bar, Long Bar, Large Bar, Regular Bar</li>
                  <li>• Rapid market growth achieved</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-xl shadow-lg p-8 text-text-white">
                <h3 className="text-2xl font-bold mb-4">BURQ Action</h3>
                <p className="text-lg text-text-white">
                  Mid-tier detergent with advanced technology, color protection,
                  and skin safety formula
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-xl shadow-lg p-8 text-text-white">
                <h3 className="text-2xl font-bold mb-4">Export Match Brands</h3>
                <p className="text-lg text-text-white">
                  Simba, Chinook, Helicopter - Premium brands for international
                  markets
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl shadow-lg p-8 text-text-white">
                <h3 className="text-2xl font-bold mb-4">Local Match Brands</h3>
                <p className="text-lg text-text-white">
                  Olympia, Tanga, Bird, Party - Quality matches for diverse
                  domestic needs
                </p>
              </div>
            </div>
          </div>

          {/* Manufacturing Excellence */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Manufacturing Excellence
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  Detergent Manufacturing Unit
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <span className="text-[#ED028C] mr-2 font-bold">▸</span>
                    <span>
                      State-of-the-art facility delivering high-performance
                      cleaning solutions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ED028C] mr-2 font-bold">▸</span>
                    <span>
                      Triple enzyme technology in Kite Glow for superior stain
                      removal
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ED028C] mr-2 font-bold">▸</span>
                    <span>
                      Advanced powder technology with minimal variation
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ED028C] mr-2 font-bold">▸</span>
                    <span>
                      Private labeling available for toll manufacturing
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  Match Manufacturing Units
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <span className="text-[#00AEEF] mr-2 font-bold">▸</span>
                    <span>
                      Mohsin Match Factory (Peshawar) - Established 1974
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00AEEF] mr-2 font-bold">▸</span>
                    <span>Mohsin Enterprises (Peshawar) - Launched 1990</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00AEEF] mr-2 font-bold">▸</span>
                    <span>A.J Match Factory (Sheikhupura) - Started 2006</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#00AEEF] mr-2 font-bold">▸</span>
                    <span>
                      Carborised and damp-proof products with different striking
                      surfaces
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Future Expansion */}
          <div className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Our Commitment to Quality
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg leading-relaxed text-text-white mb-4">
                Renowned for our commitment to quality and professionalism, Kite
                brand has rapidly gained market recognition for exceptional
                cleaning power, fabric care, and affordability. Our flagship
                brand, Kite Glow, launched in March 2025, has set new standards
                of excellence in the detergent industry.
              </p>
              <p className="text-lg leading-relaxed text-text-white">
                With over 50 years of manufacturing experience and exporting to
                40+ countries, we continue to strengthen our position as
                Pakistan's most trusted FMCG brand, always maintaining our
                uncompromising commitment to quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Interested in Kite Brand Products?
          </h2>
          <p className="text-xl text-text-white mb-8 max-w-2xl mx-auto">
            Contact us to learn more about Kite detergents, matches, dish wash
            bars, and export opportunities
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default FMCGDivisionPage;
