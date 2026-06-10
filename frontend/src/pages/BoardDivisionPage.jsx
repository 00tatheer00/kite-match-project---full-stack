import {
  FaLayerGroup,
  FaCubes,
  FaPalette,
  FaCheckCircle,
} from "react-icons/fa";
import textile_img from "../assets/textile_hero.jpg";

const BoardDivisionPage = () => {
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
              Board Division
            </h1>
            <p className="text-text-white text-xl md:text-2xl mb-4">
              Premier Formica & Board Manufacturing
            </p>
            <p className="text-text-white text-lg md:text-xl max-w-3xl mx-auto">
              High-quality MDF, Particle Board, and Lamination solutions for
              diverse applications
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
              Production Excellence
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <p className="text-lg text-[#666666] leading-relaxed mb-6">
                The group has a sizable production of MDF, Particle Board, and
                Lamination of boards. Our board division comprises
                state-of-the-art manufacturing facilities that produce premium
                quality boards for furniture, interior design, and construction
                applications.
              </p>
              <p className="text-lg text-[#666666] leading-relaxed">
                With advanced technology and stringent quality control measures,
                we deliver products that meet international standards and cater
                to both domestic and export markets.
              </p>
            </div>
          </div>

          {/* Product Categories */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLayerGroup className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                MDF Boards
              </h3>
              <p className="text-[#666666]">
                Medium Density Fiberboard for superior finish and durability
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#0095CC] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCubes className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Particle Board
              </h3>
              <p className="text-[#666666]">
                Engineered wood products for versatile applications
              </p>
            </div>

            <div className="card-hover bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPalette className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                Lamination
              </h3>
              <p className="text-[#666666]">
                Premium laminated boards with aesthetic finishes
              </p>
            </div>
          </div>

          {/* Manufacturing Units */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Our Manufacturing Units
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Premier Formica</h3>
                <p className="text-lg mb-4">Leading lamination solutions</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Wide range of decorative laminates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Customized designs and patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Durable and aesthetic finishes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Interior design excellence</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#0095CC] to-[#007BA7] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Premier Chipboard</h3>
                <p className="text-lg mb-4">
                  Quality particle board production
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>High-density particle boards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Furniture-grade quality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Cost-effective solutions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Consistent quality standards</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#0095CC] to-[#007BA7] rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Premier MDF</h3>
                <p className="text-lg mb-4">Advanced MDF manufacturing</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Premium Medium Density Fiberboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Smooth surface finish</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Various thickness options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD700] mr-2">▸</span>
                    <span>Superior machining properties</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Applications & Uses
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  Furniture Industry
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Modular kitchen cabinets and wardrobes</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Office furniture and workstations</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Home furniture and decorative pieces</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Custom furniture manufacturing</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  Interior Design
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Wall paneling and decorative surfaces</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>False ceilings and partitions</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Flooring and laminated surfaces</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Commercial and residential interiors</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  Construction
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Structural and non-structural applications</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Door and window frames</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Building components and fixtures</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Architectural elements</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  Industrial Uses
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Packaging and crating materials</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Display stands and showcases</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Retail fixtures and fittings</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-[#ED028C] mr-2 mt-1 flex-shrink-0" />
                    <span>Specialized industrial components</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quality Assurance */}
          <div className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Quality Assurance
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-bold mb-3">
                  International Standards
                </h3>
                <p className="text-lg text-text-white">
                  Our products meet international quality standards and are
                  manufactured using advanced technology and best practices in
                  the industry.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Rigorous Testing</h3>
                <p className="text-lg text-text-white">
                  Every product undergoes rigorous quality testing to ensure
                  durability, strength, and performance in real-world
                  applications.
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
            Interested in Our Board Products?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Contact us to learn more about our MDF, Particle Board, and
            Lamination solutions
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

export default BoardDivisionPage;
