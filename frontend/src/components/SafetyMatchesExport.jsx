import {
  FaShippingFast,
  FaCertificate,
  FaHandshake,
  FaFileContract,
  FaAward,
  FaCheckCircle,
  FaCog,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import world_map_export_destinations from "../assets/KiteExportMap1920x640.jpeg";
import world_map_export_destinations_mobile from "../assets/Kite-Export-Map-640x640.jpeg";

// Import match images
import simba from "../assets/export/simba.png";
import football from "../assets/export/football.png";
import alMoallam from "../assets/export/al_moallam.png";
import redMac from "../assets/export/red_mac.png";
import woodFlower from "../assets/export/wood_flower.png";
import alKarama from "../assets/export/al_karama.png";
import theGosse from "../assets/export/the_gosse.png";
import ziynat from "../assets/export/ziynat.png";
import alFelaij from "../assets/export/al_felaij.png";
import magiaBunicii from "../assets/export/magia_bunicii.png";
import zebra from "../assets/export/zebra.png";
import zippy from "../assets/export/zippy.png";

import hero from "../assets/Shippment-1920x640.jpeg";
import heroMobile from "../assets/Shippment-640x640.jpeg";
import shipment from "../assets/delivery.jpeg";

const SafetyMatchesExport = () => {
  const safetyMatches = [
    { brand: "Simba", country: "Congo", image: simba },
    { brand: "Wood Flowers", country: "Romania", image: woodFlower },
    { brand: "Al Felaij", country: "UAE", image: alFelaij },
    { brand: "The Goose", country: "Nigeria", image: theGosse },
    { brand: "Football", country: "Saudi Arabia", image: football },
    { brand: "Magia Bunicii", country: "Romania", image: magiaBunicii },
    { brand: "Zebra", country: "Lebanon", image: zebra },
    { brand: "Zippy", country: "South Africa", image: zippy },
    { brand: "Al Karaama", country: "Sudan", image: alKarama },
    { brand: "Al Moallam", country: "Sudan", image: alMoallam },
    { brand: "Ziynat", country: "Uzbekistan", image: ziynat },
    { brand: "ReD MaC", country: "Ukraine", image: redMac },
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
        "Full assistance with export documentation, permits, certificate of origin, and regulatory compliance.",
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

  const trustCards = [
    "Pakistan's largest safety match exporter",
    "Exporting since 1995 with established presence",
    "Premium quality products trusted internationally",
    "State-of-the-art manufacturing facilities",
    "Comprehensive export support services",
    "Competitive pricing with flexible terms",
  ];

  const customizationOptions = [
    {
      title: "Custom Striking Surface",
      options: [
        // "Red phosphorus striking surface",
        // "Standard striking surface",
        // "Custom formulations available",
        "Lines Striking surface",
        "Dotted Striking surface",
        "Plain strip striking surface",
        "VIP Patti striking surface",
      ],
    },
    {
      title: "Box Sizes",
      options: [
        "Small boxes (26-32 sticks)",
        "Regular boxes (avg 42 sticks)",
        "Classic boxes (avg 45 sticks)",
        "Large boxes (avg 56 sticks)",
        "Customized number of sticks in boxes available",
      ],
    },
    {
      title: "Packing Material",
      options: [
        "Cellophane wrapping",
        "Paper wrapping",
        // "Dozen packing",
        // "Gross packing",
      ],
    },
    {
      title: "Carton Packing",
      options: [
        "500 boxes per carton",
        "1000 boxes per carton",
        "1200 boxes per carton",
      ],
    },
  ];

  return (
    <section className="pt-5 pb-20 bg-gradient-to-b from-white to-[#F9F9F9] px-6">
      <div className="relative w-full! mb-10 min-h-[48vh] sm:min-h-[58vh] md:min-h-[68vh] lg:min-h-[100vh] bg-white ">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full absolute inset-0"
        >
          <SwiperSlide>
            <picture className="block w-full h-full">
              <source media="(max-width: 640px)" srcSet={heroMobile} />
              <source media="(max-width: 1024px)" srcSet={heroMobile} />
              <img
                src={hero}
                alt="Safety matches export hero"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover object-center p-2 sm:p-3 md:p-0"
              />
            </picture>
          </SwiperSlide>
          <SwiperSlide>
            <picture className="block w-full h-full">
              <source media="(max-width: 640px)" srcSet={world_map_export_destinations_mobile} />
              <source media="(max-width: 1024px)" srcSet={world_map_export_destinations_mobile} />
              <img
                src={world_map_export_destinations}
                alt="Global Export Map"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover object-center p-2 sm:p-3 md:p-0"
              />
            </picture>
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Contact */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
              Export of Premium Quality Safety Matches
            </h3>
            <div className="w-24 h-1 bg-[#ED028C] mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl shadow-lg p-8 border-2 border-[#E0E0E0]">
            <div>
              <p className="text-[#666666] text-lg leading-relaxed">
                Since 1995, Aziz Group has been Pakistan's largest safety match
                exporter, serving markets across Europe, Asia, Africa, and the
                Middle East with premium quality products.
              </p>
            </div>
            <div className="md:border-l-2 md:border-[#E0E0E0] md:pl-8">
              <h4 className="text-[#222222] text-xl font-bold mb-4">Export Department Contact</h4>
              <div className="space-y-2">
                <p className="text-[#666666]">
                  <strong className="text-[#222222]">Email:</strong> match.export@azizgrp.com
                </p>
                <p className="text-[#666666]">
                  <strong className="text-[#222222]">Phone:</strong> +92-300-8592829
                </p>
              </div>
            </div>
          </div>
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

        {/* Trust Cards */}
        <div className="mb-16">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Why Choose Us for Export?
          </h3>

          <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-8 md:p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustCards.map((card, index) => (
                <div key={index} className="flex items-start">
                  <FaAward className="text-2xl text-[#ED028C] mr-4 flex-shrink-0 mt-1" />
                  <p className="text-[#666666] font-medium">{card}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Order Options */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-4">
            Custom Order Options
          </h3>
          <p className="text-[#666666] text-center mb-12 max-w-2xl mx-auto">
            Tailor-made solutions to meet your specific requirements
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {customizationOptions.map((option, index) => (
              <div
                key={index}
                className="card-hover bg-white rounded-2xl shadow-lg p-8 border-2 border-[#E0E0E0]"
              >
                <div className="flex items-start gap-4 mb-6">
                  <FaCog className="text-4xl text-[#00AEEF] flex-shrink-0" />
                  <div>
                    <h4 className="text-[#222222] text-xl font-bold mb-4">
                      {option.title}
                    </h4>
                    <ul className="space-y-3">
                      {option.options.map((opt, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-[#666666]"
                        >
                          <FaCheckCircle className="text-[#ED028C] mr-3 flex-shrink-0" />
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                    <p className="text-white/90 leading-relaxed mb-4">
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

        {/* Export Brands */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-4">
            Our Export Brands
          </h3>
          <p className="text-[#666666] text-center mb-12 max-w-2xl mx-auto">
            Premium quality safety matches exported to countries worldwide
          </p>

          <div className="export-brands-container">
            <Swiper
              modules={[Autoplay, Navigation]}
              slidesPerView={2}
              spaceBetween={16}
              breakpoints={{
                640: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              navigation
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              loop={true}
              className="export-brands-swiper pb-4 px-2"
            >
              {safetyMatches.map((match, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <div className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#E0E0E0] h-full flex flex-col">
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={match.image}
                        alt={match.brand}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <div className="p-4 text-center border-t-2 border-[#E0E0E0] mt-auto">
                      <h4 className="text-[#222222] font-bold text-lg mb-0">
                        {match.brand}
                      </h4>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Global Presence Map */}
        {/* <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Our Global Presence
          </h3>
          <div className="relative bg-gray-500 rounded-3xl flex items-center justify-center overflow-hidden">
            <img
              src={world_map_export_destinations}
              alt="Global Export Map"
              loading="lazy"
              decoding="async"
              width="1400"
              height="700"
              className="w-full object-cover"
            />
          </div>
        </div> */}







        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#ED028C] to-[#d4027a] rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
                Ready to Start Exporting with Us?
              </h3>
              <p className="text-white/90 text-lg leading-relaxed mb-8 drop-shadow-md">
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

            <div className=" overflow-hidden rounded-2xl flex items-center justify-center">
              <img
                src={shipment}
                alt="Export Shipping Container"
                loading="lazy"
                decoding="async"
                width="1280"
                height="640"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>

      </div>
      <style jsx>{`
        .export-brands-swiper .swiper-button-next,
        .export-brands-swiper .swiper-button-prev {
          color: #00aeef;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .export-brands-swiper .swiper-button-next:after,
        .export-brands-swiper .swiper-button-prev:after {
          font-size: 1.2rem;
        }
      `}</style>
    </section>
  );
};

export default SafetyMatchesExport;
