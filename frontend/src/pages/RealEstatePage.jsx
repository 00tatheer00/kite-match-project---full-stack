import { FaBuilding, FaLeaf, FaMapMarkerAlt, FaAward } from "react-icons/fa";
import textile_img from "../assets/textile_hero.jpg";

const RealEstatePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-20"
        style={{
          backgroundImage: `url(${textile_img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-black/50 p-4 filter backdrop-blur-xs rounded-xl">
            <h1 className="text-text-white text-4xl md:text-6xl font-bold mb-6">
              Real Estate Development
            </h1>
            <p className="text-text-white text-xl md:text-2xl mb-4">
              Building Tomorrow's Landmarks Today
            </p>
            <p className="text-text-white text-lg md:text-xl max-w-3xl mx-auto">
              Premium mixed-use developments with sustainable and innovative
              design
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
              Real Estate Excellence Since 2019
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <p className="text-lg text-[#666666] leading-relaxed mb-6">
                The group has started a real estate project with the name of AJ
                Tower at Gulberg Green Islamabad. Our real estate division
                focuses on developing premium mixed-use properties that combine
                corporate, residential, and commercial spaces with cutting-edge
                design and sustainability.
              </p>
              <p className="text-lg text-[#666666] leading-relaxed">
                With a commitment to quality, innovation, and environmental
                responsibility, we are creating landmarks that redefine urban
                living and working spaces in Pakistan's major cities.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Mixed-Use Spaces
              </h3>
              <p className="text-[#666666]">
                Corporate, residential, and commercial in one location
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                LEED Certified
              </h3>
              <p className="text-[#666666]">
                Sustainable and environmentally responsible design
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#0095CC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Prime Locations
              </h3>
              <p className="text-[#666666]">
                Strategic locations in Islamabad's premium areas
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAward className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Premium Quality
              </h3>
              <p className="text-[#666666]">
                World-class construction and finishing standards
              </p>
            </div>
          </div>

          {/* Featured Projects */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Our Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* AJ Towers */}
              <div className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 md:p-10 text-white">
                <h3 className="text-3xl font-bold mb-4">AJ Towers</h3>
                <p className="text-lg mb-4 font-semibold">
                  Gulberg Green, Islamabad
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      600,000 sq ft mixed-use complex
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      Corporate, residential & commercial spaces
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      70% leased with premium tenants
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">Telenor as anchor tenant</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      State-of-the-art facilities and amenities
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      Modern architecture and design
                    </span>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">
                    Status: Completed & Operational
                  </p>
                  <p className="text-sm text-black">
                    A landmark development in Islamabad's premium Gulberg Green
                    area, offering world-class facilities for businesses and
                    residents.
                  </p>
                </div>
              </div>

              {/* AJ Corporate Avenue */}
              <div className="bg-gradient-to-br from-[#0095CC] to-[#007BA7] rounded-xl shadow-lg p-8 md:p-10 text-white">
                <h3 className="text-3xl font-bold mb-4">AJ Corporate Avenue</h3>
                <p className="text-lg mb-4 font-semibold">
                  Upcoming Development
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      LEED Certified green building
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">Premium office spaces</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      Sustainable design principles
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">Energy-efficient systems</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">Smart building technology</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[#FFD700] mr-2 font-bold">▸</span>
                    <span className="text-lg">
                      Premium location in Islamabad
                    </span>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">
                    Status: Under Development
                  </p>
                  <p className="text-sm text-black">
                    Pakistan's first LEED certified office building, setting new
                    standards for sustainable corporate architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* City Scape */}
          <div className="mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <h3 className="text-3xl font-bold text-[#222222] mb-6 text-center">
                City Scape
              </h3>
              <p className="text-lg text-[#666666] text-center leading-relaxed max-w-3xl mx-auto">
                Another prestigious development in our real estate portfolio,
                offering modern urban living spaces with contemporary design and
                premium amenities.
              </p>
            </div>
          </div>

          {/* Development Philosophy */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Our Development Philosophy
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="bg-[#00AEEF] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FaLeaf className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-[#222222] mb-3">
                  Sustainability
                </h3>
                <p className="text-[#666666]">
                  We prioritize environmentally responsible design and
                  construction, incorporating LEED standards and green building
                  practices.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="bg-[#0095CC] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FaAward className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-[#222222] mb-3">
                  Quality
                </h3>
                <p className="text-[#666666]">
                  World-class construction standards, premium materials, and
                  attention to detail in every aspect of development.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="bg-[#00AEEF] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-[#222222] mb-3">
                  Innovation
                </h3>
                <p className="text-[#666666]">
                  Cutting-edge architectural design, smart building technology,
                  and modern amenities for contemporary urban living.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Why Choose Our Developments
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">Prime locations in Islamabad</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">
                    LEED certified green buildings
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">Mixed-use developments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">World-class amenities</span>
                </li>
              </ul>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">Premium construction quality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">Sustainable design principles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">Smart building technology</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-3 text-xl">✓</span>
                  <span className="text-lg">Proven track record</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Interested in Our Real Estate Projects?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Contact us to learn more about investment opportunities and
            available spaces
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

export default RealEstatePage;
