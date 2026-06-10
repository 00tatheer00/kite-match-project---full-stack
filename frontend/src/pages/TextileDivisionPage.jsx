import { FaIndustry, FaCertificate, FaBolt, FaLeaf } from "react-icons/fa";
import textile_img from "../assets/textile_hero.jpg";

const TextileDivisionPage = () => {
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
              Textile Division
            </h1>
            <h2 className="text-text-white text-xl md:text-2xl mb-4">
              A.J Textile Mills Limited
            </h2>
            <h3 className="text-text-white-90 text-lg md:text-xl max-w-3xl mx-auto">
              One of Pakistan's largest spinning mills with over 100,000
              spindles
            </h3>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-6 text-center">
              Company Overview
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <p className="text-lg text-[#666666] leading-relaxed mb-6">
                A.J Textile Mills Ltd. has over 100,000 spindles, which are
                operationally organized into 2 ring spinning units (with a
                combined capacity of 80,000 spindles), 1 doubling unit (with
                20,000 spindles), and 2 Murata vortex spinning units (with 4 MVS
                units).
              </p>
              <p className="text-lg text-[#666666] leading-relaxed">
                The company's strategic focus on quality and innovation has
                positioned it as a leading textile manufacturer in Pakistan,
                serving both domestic and international markets with premium
                yarn products.
              </p>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaIndustry className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                100,000+ Spindles
              </h3>
              <p className="text-[#666666]">
                Massive production capacity with advanced spinning technology
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#ED028C] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBolt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                10 MW Power
              </h3>
              <p className="text-[#666666]">
                In-house power generation for sustainable operations
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCertificate className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Certified Quality
              </h3>
              <p className="text-[#666666]">
                Oeko-Tex, Control Union, and Inditex certified
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#ED028C] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Sustainable
              </h3>
              <p className="text-[#666666]">
                Eco-friendly production with international standards
              </p>
            </div>
          </div>

          {/* Facilities & Technology */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Facilities & Technology
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ring Spinning Units</h3>
                <p className="text-lg mb-4">80,000 spindles across 2 units</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>State-of-the-art ring spinning technology</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>High-quality yarn production</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Consistent output and quality control</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#ED028C] to-[#C40270] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Murata Vortex Spinning
                </h3>
                <p className="text-lg mb-4">4 MVS units for advanced yarn</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Latest Murata vortex spinning technology</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>High-speed production capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Superior yarn characteristics</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#0095CC] to-[#007BA7] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Doubling Unit</h3>
                <p className="text-lg mb-4">20,000 spindles capacity</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Enhanced yarn strength and quality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Specialized doubling processes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Value-added yarn products</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#C40270] to-[#9B0158] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Power Generation</h3>
                <p className="text-lg mb-4">10 MW in-house capacity</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Self-sustained power generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Uninterrupted production operations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Cost-effective and reliable energy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              International Certifications
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-[#FFEFF9] rounded-lg p-6 mb-4">
                  <FaCertificate className="text-[#ED028C] text-5xl mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-[#222222] mb-2">
                  Oeko-Tex
                </h3>
                <p className="text-[#666666]">
                  International certification for textile safety and
                  environmental responsibility
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[#E6F7FF] rounded-lg p-6 mb-4">
                  <FaCertificate className="text-[#00AEEF] text-5xl mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-[#222222] mb-2">
                  Control Union
                </h3>
                <p className="text-[#666666]">
                  Global certification for sustainable and organic textile
                  production
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[#FFEFF9] rounded-lg p-6 mb-4">
                  <FaCertificate className="text-[#ED028C] text-5xl mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-[#222222] mb-2">
                  Inditex
                </h3>
                <p className="text-[#666666]">
                  Compliance with international fashion industry standards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Interested in Our Textile Products?
          </h2>
          <p className="text-xl text-text-white mb-8 max-w-2xl mx-auto">
            Contact us to learn more about our premium yarn and textile
            solutions
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

export default TextileDivisionPage;
