import {
  FaGlobeAsia,
  FaShippingFast,
  FaCertificate,
  FaHandshake,
  FaFileContract,
  FaAward,
  FaCheckCircle,
} from "react-icons/fa";

import shipment from "../assets/heroCarousel/1920x640shipment.jpg";

const ExportSection = () => {
  const safetyMatches = [
    {
      brand: "Simba",
      country: "Congo",
      flag: "🇨🇬",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Simba",
    },
    {
      brand: "Wood Flower",
      country: "Romania",
      flag: "🇷🇴",
      image:
        "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Wood+Flower",
    },
    {
      brand: "Al Felaij",
      country: "UAE",
      flag: "🇦🇪",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Al+Felaij",
    },
    {
      brand: "The Gosse",
      country: "Nigeria",
      flag: "🇳🇬",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=The+Gosse",
    },
    {
      brand: "Football",
      country: "Saudi Arabia",
      flag: "🇸🇦",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Football",
    },
    {
      brand: "Magia bunicii",
      country: "Romania",
      flag: "🇷🇴",
      image:
        "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Magia+bunicii",
    },
    {
      brand: "Zebra",
      country: "Lebanon",
      flag: "🇱🇧",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Zebra",
    },
    {
      brand: "Zippy",
      country: "South Africa",
      flag: "🇿🇦",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Zippy",
    },
    {
      brand: "Al Karama",
      country: "Sudan",
      flag: "🇸🇩",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Al+Karama",
    },
    {
      brand: "Al Moallam",
      country: "Sudan",
      flag: "🇸🇩",
      image:
        "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Al+Moallam",
    },
    {
      brand: "Ziynat",
      country: "Uzbekistan",
      flag: "🇺🇿",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=Ziynat",
    },
    {
      brand: "ReD Mac",
      country: "Ukraine",
      flag: "🇺🇦",
      image: "https://via.placeholder.com/300x400/ED028C/FFFFFF?text=ReD+Mac",
    },
  ];

  const woodenSplints = [
    { country: "Kenya", flag: "🇰🇪", color: "#00AEEF" },
    { country: "Hungary", flag: "🇭🇺", color: "#ED028C" },
    { country: "Honduras", flag: "🇭🇳", color: "#00AEEF" },
    { country: "Ethiopia", flag: "🇪🇹", color: "#ED028C" },
    { country: "Egypt", flag: "🇪🇬", color: "#00AEEF" },
    { country: "Tanzania", flag: "🇹🇿", color: "#ED028C" },
  ];

  const exportServices = [
    {
      icon: <FaShippingFast className="text-5xl" />,
      title: "Complete Logistics",
      description:
        "End-to-end shipping solutions including container booking, cargo handling, and delivery tracking to over 40 countries.",
      points: [
        "Sea freight management",
        "Air cargo services",
        "Door-to-door delivery",
        "Real-time tracking",
      ],
    },
    {
      icon: <FaFileContract className="text-5xl" />,
      title: "Documentation Support",
      description:
        "Full assistance with export documentation, permits, certificates of origin, and regulatory compliance.",
      points: ["Export licenses", "Customs clearance", "Certificate of origin"],
    },
    {
      icon: <FaCertificate className="text-5xl" />,
      title: "Quality Certifications",
      description:
        "All products come with international quality certifications meeting global standards and buyer requirements.",
      points: [
        "ISO certified",
        "Lab test reports",
        "Quality assurance",
        "Compliance certificates",
      ],
    },
    {
      icon: <FaHandshake className="text-5xl" />,
      title: "Partnership Programs",
      description:
        "Long-term partnerships with dedicated account managers, competitive pricing, and flexible payment terms.",
      points: [
        "Dedicated support",
        "Flexible terms",
        "Volume discounts",
        "Private labeling",
      ],
    },
  ];

  const statistics = [
    { number: "40+", label: "Export Countries", sublabel: "Global Reach" },
    { number: "30+", label: "Years Experience", sublabel: "Since 1995" },
    { number: "#1", label: "Match Exporter", sublabel: "In Pakistan" },
    {
      number: "100%",
      label: "Quality Assured",
      sublabel: "Certified Products",
    },
  ];

  const achievements = [
    "Pakistan's largest safety match exporter",
    "Exporting since 1995 with established presence",
    "Premium quality products trusted internationally",
    "State-of-the-art manufacturing facilities",
    "Comprehensive export support services",
    "Competitive pricing with flexible terms",
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            Global Reach
          </h2>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
            Export Excellence Worldwide
          </h3>
          <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8"></div>
          <p className="text-[#666666] text-lg max-w-3xl mx-auto">
            Since 1995, Aziz Group has been Pakistan's largest safety match
            exporter, serving markets across Europe, Asia, Africa, and the
            Middle East with premium quality products.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="card-hover bg-gradient-to-br from-[#00AEEF] to-[#0095CC] p-8 rounded-2xl text-center text-white shadow-xl"
            >
              <div className="text-5xl font-bold mb-2 drop-shadow-lg">
                {stat.number}
              </div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-white/80">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Safety Matches Export Menu */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-4">
            Our Export Brands
          </h3>
          <p className="text-[#666666] text-center mb-12 max-w-2xl mx-auto">
            Premium quality safety matches exported to countries worldwide
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {safetyMatches.map((match, index) => (
              <div
                key={index}
                className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#E0E0E0]"
              >
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={match.image}
                    alt={match.brand}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain p-3 md:p-4"
                  />
                </div>
                <div className="p-4 text-center border-t-2 border-[#E0E0E0]">
                  <h4 className="text-[#222222] font-bold text-lg mb-2">
                    {match.brand}
                  </h4>
                  <div className="flex items-center justify-center gap-2 text-[#666666]">
                    <span className="text-2xl">{match.flag || "🌍"}</span>
                    <span className="font-medium">{match.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wooden Splints Export Section */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-4">
            Wooden Splints Export
          </h3>
          <p className="text-[#666666] text-center mb-12 max-w-2xl mx-auto">
            High-quality wooden splints delivered to multiple countries across
            Africa, Europe, and Central America
          </p>

          <div className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative">
                {/* Map Visualization */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🌍</div>
                    <h4 className="text-white text-2xl font-bold drop-shadow-lg">
                      Global Splint Distribution
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {woodenSplints.map((splint, index) => (
                      <div
                        key={index}
                        className="card-hover bg-white rounded-xl p-4 text-center shadow-lg border-4 border-transparent"
                      >
                        <div className="text-[#222222] text-lg font-semibold">
                          {splint.country}
                        </div>
                        <div className="text-4xl mb-2 text-md!">
                          {splint.flag}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-white">
                <h4 className="text-3xl font-bold mb-6 drop-shadow-lg">
                  Premium Wooden Splints
                </h4>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  We export high-quality wooden splints to our partners across
                  multiple continents. Our splints meet international standards
                  and are trusted by manufacturers worldwide.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-semibold text-lg mb-1">
                        Quality Assured
                      </h5>
                      <p className="text-white/80">
                        Premium wood selection and processing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-semibold text-lg mb-1">
                        Reliable Supply
                      </h5>
                      <p className="text-white/80">
                        Consistent delivery to 6+ countries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-semibold text-lg mb-1">
                        Global Standards
                      </h5>
                      <p className="text-white/80">
                        Meets international quality requirements
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Countries */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Our Global Presence
          </h3>

          {/* Map Placeholder */}
          <div className="relative bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-3xl flex items-center justify-center mb-12 overflow-hidden group h-64 sm:h-80 md:h-96">
            <img
              src="https://via.placeholder.com/1200x600/00AEEF/FFFFFF?text=Global+Export+Map"
              alt="Global Export Map"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Countries Grid */}
          {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(exportCountries).map(([region, data]) => (
              <div
                key={region}
                className="bg-white p-6 rounded-xl border-2 border-[#E0E0E0] hover:border-[#FF8ACE] hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4 text-center">{data.icon}</div>
                <h4
                  className="text-[#222222] text-xl font-bold mb-4 text-center"
                  style={{ color: data.color }}
                >
                  {region}
                </h4>
                <ul className="space-y-2">
                  {data.countries.map((country, idx) => (
                    <li key={idx} className="flex items-center text-[#666666]">
                      <span
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: data.color }}
                      ></span>
                      {country}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div> */}
        </div>

        {/* Export Services */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Comprehensive Export Services
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {exportServices.map((service, index) => (
              <div
                key={index}
                className="card-hover bg-gradient-to-br group from-[#00AEEF] to-[#0095CC] rounded-2xl p-8 text-white border-4 border-transparent"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0 text-white group-hover:text-[#ED028C]">
                    {service.icon}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-3 drop-shadow-md">
                      {service.title}
                    </h4>
                    <p className="text-text-white-90 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 pl-6">
                  {service.points.map((point, idx) => (
                    <li key={idx} className="flex items-center text-white/90">
                      <FaCheckCircle className="mr-3 flex-shrink-0 text-white group-hover:text-[#ED028C]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Why Choose Us for Export?
          </h3>

          <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-8 md:p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <FaAward className="text-2xl text-[#ED028C] mr-4 flex-shrink-0 mt-1" />
                  <p className="text-[#666666] font-medium">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#ED028C] to-[#d4027a] rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
                Ready to Start Exporting with Us?
              </h3>
              <p className="text-text-white-90 text-lg leading-relaxed mb-8 drop-shadow-md">
                Join our network of international partners and benefit from our
                extensive export experience, reliable logistics, and commitment
                to quality. We handle everything from documentation to delivery.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:match.export@azizgrp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#ED028C] px-8 py-4 rounded-full font-semibold hover:bg-[#F9F9F9] transition-all duration-300 shadow-lg active:scale-95"
                >
                  Email Us
                </a>
                <a
                  href="https://wa.me/+923008592829"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#ED028C] transition-all duration-300 active:scale-95"
                >
                  Call Now
                </a>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className="h-56 sm:h-72 md:h-80 bg-gradient-to-br from-[#ED028C] to-[#d4027a] overflow-hidden rounded-2xl flex items-center justify-center">
              <img
                src={shipment}
                alt="Export Shipping Container"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain object-center"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-16 bg-white rounded-2xl border-2 border-[#E0E0E0] p-8">
          <h4 className="text-[#222222] text-2xl font-bold mb-6 text-center">
            Export Department Contact
          </h4>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[#666666]">
                <strong className="text-[#222222]">Email:</strong>{" "}
                match.export@azizgrp.com
              </p>
            </div>
            <div>
              <p className="text-[#666666]">
                <strong className="text-[#222222]">Phone:</strong>{" "}
                +92-300-8592829
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExportSection;
