'use client';

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
import world_map_export_destinations from "../assets/Kite-Export-Map1920x640.jpeg";
import world_map_export_destinations_mobile from "../assets/kite-Map-640x640.jpeg";

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

  const strikingSurfaces = [
    {
      id: "lines",
      name: "Lines Striking Surface",
      tag: "Linear Friction Grooves",
      description: "Evenly spaced parallel micro-ridges engineered for rapid, clean spark ignition with minimal phosphorus dust and extended box life.",
      feature: "Instant Spark • Zero Flaking",
      patternType: "lines",
    },
    {
      id: "dots",
      name: "Dotted Striking Surface",
      tag: "Honeycomb Stipple Matrix",
      description: "High-density embossed dot-matrix friction pattern delivering superior grip traction and reliable damp-proof lighting in humid conditions.",
      feature: "High Traction • Damp Proof",
      patternType: "dots",
    },
    {
      id: "plain",
      name: "Plain Strip Striking Surface",
      tag: "Solid Continuous Band",
      description: "Uniform, smooth dark red-phosphorus friction strip covering the entire matchbox sidewall edge-to-edge for maximum striking surface area.",
      feature: "Full Coverage • Classic Reliability",
      patternType: "plain",
    },
    {
      id: "vip",
      name: "VIP Patti Striking Surface",
      tag: "Export Premium Standard",
      description: "Specialized export formulation with decorative border and dual-friction compound engineered specifically for luxury and hospitality matchboxes.",
      feature: "Reinforced Edge • Dual Compound",
      patternType: "vip",
    },
  ];

  const otherCustomizationOptions = [
    {
      title: "Box Sizes & Stick Counts",
      options: [
        "Small boxes (26-32 sticks)",
        "Regular boxes (avg 42 sticks)",
        "Classic boxes (avg 45 sticks)",
        "Large boxes (avg 56 sticks)",
        "Customized sticks count per box available",
      ],
    },
    {
      title: "Outer Packing Material",
      options: [
        "Moisture-proof Cellophane wrapping",
        "Export Kraft Paper wrapping",
        "Poly-pack bundling",
        "Shrink-wrapped dozens & grosses",
      ],
    },
    {
      title: "Master Carton Packing",
      options: [
        "500 boxes per master carton",
        "1,000 boxes per master carton",
        "1,200 boxes per master carton",
        "Heavy-duty 5-ply export corrugation",
      ],
    },
  ];

  const exportDestinationsByRegion = [
    {
      region: "Middle East & Gulf",
      color: "#00AEEF",
      countries: [
        { name: "Saudi Arabia", flag: "🇸🇦", brand: "Football Match", note: "High Volume" },
        { name: "United Arab Emirates", flag: "🇦🇪", brand: "Al Felaij Match", note: "Gulf Hub" },
        { name: "Lebanon", flag: "🇱🇧", brand: "Zebra Match", note: "Levant Market" },
      ],
    },
    {
      region: "Africa",
      color: "#ED028C",
      countries: [
        { name: "Sudan", flag: "🇸🇩", brand: "Al Karaama & Al Moallam", note: "Major Partner" },
        { name: "South Africa", flag: "🇿🇦", brand: "Zippy Match", note: "Southern Africa" },
        { name: "DR Congo", flag: "🇨🇩", brand: "Simba Match", note: "Central Africa" },
        { name: "Nigeria", flag: "🇳🇬", brand: "The Goose Match", note: "West Africa" },
        { name: "Kenya", flag: "🇰🇪", brand: "Match Splints", note: "East Africa" },
        { name: "Egypt", flag: "🇪🇬", brand: "Match Splints", note: "North Africa" },
        { name: "Tanzania", flag: "🇹🇿", brand: "Match Supply", note: "East Africa" },
        { name: "Ethiopia", flag: "🇪🇹", brand: "Industrial Splints", note: "Horn of Africa" },
      ],
    },
    {
      region: "Europe",
      color: "#059669",
      countries: [
        { name: "Romania", flag: "🇷🇴", brand: "Wood Flowers & Magia Bunicii", note: "Eastern EU" },
        { name: "Ukraine", flag: "🇺🇦", brand: "ReD MaC Match", note: "Black Sea" },
        { name: "Hungary", flag: "🇭🇺", brand: "Industrial Splints", note: "Central Europe" },
      ],
    },
    {
      region: "Central Asia & Americas",
      color: "#6366F1",
      countries: [
        { name: "Uzbekistan", flag: "🇺🇿", brand: "Ziynat Match", note: "Central Asia" },
        { name: "Honduras", flag: "🇭🇳", brand: "Match Materials", note: "Latin America" },
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
              <source media="(max-width: 640px)" srcSet={heroMobile?.src || heroMobile} />
              <source media="(max-width: 1024px)" srcSet={heroMobile?.src || heroMobile} />
              <img
                src={hero?.src || hero}
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
              <source media="(max-width: 640px)" srcSet={world_map_export_destinations_mobile?.src || world_map_export_destinations_mobile} />
              <source media="(max-width: 1024px)" srcSet={world_map_export_destinations_mobile?.src || world_map_export_destinations_mobile} />
              <img
                src={world_map_export_destinations?.src || world_map_export_destinations}
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

        {/* Custom Striking Surface Visual Showcase (Point 2) */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#EAF8FE] text-[#0095CC] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span>Manufacturing Customization</span>
            </div>
            <h3 className="text-[#222222] text-3xl sm:text-4xl font-black mb-3">
              Custom <span className="text-[#00AEEF]">Striking Surface</span> Options
            </h3>
            <p className="text-[#666666] text-base max-w-2xl mx-auto">
              Visual friction band configurations engineered for superior spark sensitivity, all-weather damp proofing, and luxury box aesthetics.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {strikingSurfaces.map((surface) => (
              <div
                key={surface.id}
                className="bg-white rounded-2xl border-2 border-[#E5E5E5] hover:border-[#00AEEF] hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Matchbox Side Friction Visual Preview */}
                  <div className="bg-[#1A1A1A] p-3 rounded-xl mb-4 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-[#888888] font-mono uppercase mb-2">
                      <span>Friction Band</span>
                      <span className="text-amber-400 font-bold">{surface.feature.split('•')[0].trim()}</span>
                    </div>

                    {/* Simulated Matchbox Sidewall */}
                    <div className="w-full bg-[#E8DCB8] rounded border border-[#C5B48D] p-1.5 shadow-sm">
                      {/* Textured Friction Strip */}
                      {surface.patternType === "lines" && (
                        <div 
                          className="w-full h-11 rounded border border-[#301306] shadow-inner relative overflow-hidden"
                          style={{
                            background: "repeating-linear-gradient(90deg, #4A1F0D 0px, #4A1F0D 3px, #6B3016 3px, #6B3016 6px)"
                          }}
                        >
                          <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                      )}

                      {surface.patternType === "dots" && (
                        <div 
                          className="w-full h-11 rounded border border-[#301306] shadow-inner relative overflow-hidden bg-[#381607]"
                          style={{
                            backgroundImage: "radial-gradient(#D27D46 30%, transparent 31%)",
                            backgroundSize: "6px 6px"
                          }}
                        >
                          <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                      )}

                      {surface.patternType === "plain" && (
                        <div 
                          className="w-full h-11 rounded border border-[#301306] shadow-inner relative overflow-hidden bg-gradient-to-r from-[#4A1F0D] via-[#632B13] to-[#4A1F0D]"
                        >
                          <div className="absolute inset-0 bg-black/5"></div>
                        </div>
                      )}

                      {surface.patternType === "vip" && (
                        <div 
                          className="w-full h-11 rounded border-2 border-[#ED028C] shadow-inner relative overflow-hidden"
                          style={{
                            background: "repeating-linear-gradient(45deg, #2D1005 0px, #2D1005 5px, #52220E 5px, #52220E 10px)"
                          }}
                        >
                          <div className="absolute top-0 right-0 bg-[#ED028C] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-bl">
                            VIP
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00AEEF] bg-[#EAF8FE] px-2.5 py-0.5 rounded-full inline-block mb-2">
                    {surface.tag}
                  </span>

                  <h4 className="text-lg font-bold text-[#222222] mb-2 leading-tight">
                    {surface.name}
                  </h4>

                  <p className="text-xs text-[#666666] leading-relaxed mb-4">
                    {surface.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0F0F0]">
                  <div className="flex items-center text-xs font-semibold text-[#00AEEF]">
                    <FaCheckCircle className="text-[#ED028C] mr-2 flex-shrink-0" />
                    <span>{surface.feature}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Custom Order Options (Box Sizes, Packing, Carton) */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-2xl sm:text-3xl font-bold text-center mb-3">
            Box Sizes &amp; Packaging Specifications
          </h3>
          <p className="text-[#666666] text-center mb-10 max-w-xl mx-auto text-sm">
            Tailor-made packaging dimensions and export configurations to suit your destination market standards.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {otherCustomizationOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md p-6 border-2 border-[#E5E5E5] transition-all"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF8FE] text-[#00AEEF] flex items-center justify-center text-xl flex-shrink-0">
                    <FaCog />
                  </div>
                  <h4 className="text-[#222222] text-lg font-bold">
                    {option.title}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {option.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-xs sm:text-sm text-[#555555]"
                    >
                      <FaCheckCircle className="text-[#ED028C] mr-2.5 mt-0.5 flex-shrink-0 text-xs" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
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
                        src={match.image?.src || match.image}
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

        {/* Global Presence Map & Revised Country Sequence (Point 1) */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#EAF8FE] text-[#0095CC] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span>Worldwide Footprint</span>
            </div>
            <h3 className="text-[#222222] text-3xl sm:text-4xl font-black mb-3">
              Our <span className="text-[#00AEEF]">Global Presence</span> &amp; Export Map
            </h3>
            <p className="text-[#666666] text-base max-w-2xl mx-auto">
              Exporting reliable safety matches and premium wooden splints to over 40+ countries across 4 continents.
            </p>
          </div>

          {/* Authentic Export Map */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#00AEEF]/20 mb-10 bg-[#0F172A]">
            <picture>
              <source media="(max-width: 640px)" srcSet={world_map_export_destinations_mobile?.src || world_map_export_destinations_mobile} />
              <img
                src={world_map_export_destinations?.src || world_map_export_destinations}
                alt="Kite Group Worldwide Export Map"
                loading="lazy"
                decoding="async"
                width="1920"
                height="640"
                className="w-full h-auto object-cover hover:scale-102 transition-transform duration-700"
              />
            </picture>
            <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/20">
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">International Reach</p>
              <p className="text-sm font-black">40+ Active Destination Markets</p>
            </div>
          </div>

          {/* Regional Country Sequence */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exportDestinationsByRegion.map((regionGroup, rIdx) => (
              <div
                key={rIdx}
                className="bg-white rounded-2xl p-5 border-2 border-[#E5E5E5] shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0F0F0]">
                  <h4 
                    className="font-black text-sm uppercase tracking-wider"
                    style={{ color: regionGroup.color }}
                  >
                    {regionGroup.region}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#666666]">
                    {regionGroup.countries.length} Destinations
                  </span>
                </div>

                <div className="space-y-2.5">
                  {regionGroup.countries.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAFA] hover:bg-[#F2F2F2] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl flex-shrink-0">{c.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#222222] truncate">{c.name}</p>
                          <p className="text-[10px] text-[#777777] truncate">{c.brand}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-[#888888] bg-white px-1.5 py-0.5 rounded border border-[#E5E5E5] flex-shrink-0 ml-1">
                        {c.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>







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
                src={shipment?.src || shipment}
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
