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
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";
import { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Import splints images
import splints from "../assets/splints.jpg";
import splints_2 from "../assets/splints_2.jpg";

import splintsHeroMobile from "../assets/heroCarousel/Wooden-Splints-banner-640x640.jpeg"
import splintsHero from "../assets/heroCarousel/Wooden-Splints-Banner.jpeg"

import shipment from "../assets/heroCarousel/1280x640shipment.jpg";
import shipmentWide from "../assets/heroCarousel/1920x640shipment.jpg";
import carousel7Mobile from "../assets/heroCarousel/Shippment-640x640.jpeg";

const WoodenSplintsExport = () => {
  const [, setActiveIndex] = useState(0);
  const woodenSplints = [
    { country: "Kenya", flag: "🇰🇪", size: "40x2.05x2.05 mm" },
    { country: "Hungary", flag: "🇭🇺", size: "42x2.1x2.1 mm" },
    { country: "Honduras", flag: "🇭🇳", size: "40x2.00x2.00 mm" },
    { country: "Ethiopia", flag: "🇪🇹", size: "40x2.1x2.1 mm" },
    { country: "Egypt", flag: "🇪🇬", size: "42x2.00x2.00" },
    { country: "Tanzania", flag: "🇹🇿", size: "40x2.02x2.02 mm" },
  ];

  const standardSizes = [
    "40 X 2.05 X 2.05 mm",
    "42 X 2.1 X 2.1 mm",
    "40 X 2.00 X 2.00 mm",
    "40 X 2.1 X 2.1 mm",
    "42 X 2.00 X 2.00 mm",
    "40 X 2.02 X 2.02 mm",
  ];

  const exportServices = [
    {
      icon: <FaShippingFast className="text-5xl" />,
      title: "Complete Logistics",
      description:
        "End-to-end shipping solutions including container booking, cargo handling, and delivery tracking to multiple countries.",
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
        "Custom specifications",
      ],
    },
  ];

  const statistics = [
    { number: "6+", label: "Export Countries", sublabel: "Global Reach" },
    { number: "30+", label: "Years Experience", sublabel: "Since 1995" },
    { number: "Premium", label: "Wood Quality", sublabel: "Certified" },
    {
      number: "Custom",
      label: "Sizes Available",
      sublabel: "Tailored Solutions",
    },
  ];

  const trustCards = [
    "High-quality wooden splints for match manufacturing",
    "Consistent supply to 6+ countries worldwide",
    "Premium wood selection and processing",
    "Meets international quality standards",
    "Custom sizes and specifications available",
    "Reliable delivery and logistics support",
  ];

  const customizationOptions = [
    {
      title: "Standard Sizes",
      description:
        "We provide multiple standard sizes to meet your manufacturing needs:",
      options: standardSizes,
    },
    {
      title: "Custom Specifications",
      description:
        "Need a specific size? We can manufacture custom dimensions:",
      options: [
        "Custom length",
        "Custom width",
        "Custom thickness",
        "Volume-based custom orders",
      ],
    },
  ];

  const slides = [
    {
      id: 1,
      title: "Premium Wooden Splints Export",
      image: splintsHero,
      mobileImage: splintsHeroMobile,
      link: "#",
    },
    // {
    //   id: 2,
    //   title: "Precision Processing",
    //   image: splints,
    //   mobileImage: splints,
    //   link: "#",
    // },
    // {
    //   id: 3,
    //   title: "Trusted Packaging & Dispatch",
    //   image: splints_2,
    //   mobileImage: splints_2,
    //   link: "#",
    // },
  ];

  return (
    <section className="py-5 sm:py-10 bg-gradient-to-b from-white to-[#F9F9F9]">
      <div className="w-full relative  mb-16">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={700}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="hero-swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <div className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[78vh] lg:min-h-[90vh] w-full overflow-hidden bg-white">
                <div className="absolute inset-0 bg-white">
                  <div className="block w-full h-full">
                    <picture className="block w-full h-full!">
                      <source
                        media="(max-width: 640px)"
                        srcSet={slide.mobileImage || slide.image}
                      />
                      <source
                        media="(max-width: 1024px)"
                        srcSet={slide.mobileImage || slide.image}
                      />
                      <img
                        src={slide.image}
                        alt={slide.title}
                        width="1920"
                        height="640"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                        className="hero-carousel-img absolute inset-0 w-full h-full object-contain object-center"
                      />
                    </picture>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style>{`
            .hero-carousel-img {
              max-height: none !important;
              height: 100% !important;
              width: 100% !important;
            }

            @keyframes fade-in-up {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-in-up {
              animation: fade-in-up 1s ease-out;
            }

            .hero-swiper :global(.swiper-button-next),
            .hero-swiper :global(.swiper-button-prev) {
              color: white;
              background: rgba(0, 174, 239, 0.2);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.3);
              width: 60px;
              height: 60px;
              border-radius: 50%;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .hero-swiper :global(.swiper-button-next:hover),
            .hero-swiper :global(.swiper-button-prev:hover) {
              background: rgba(0, 174, 239, 0.8);
              border-color: rgba(255, 255, 255, 0.5);
              transform: scale(1.15);
              box-shadow: 0 12px 48px rgba(0, 174, 239, 0.4);
            }

            .hero-swiper :global(.swiper-button-next:after),
            .hero-swiper :global(.swiper-button-prev:after) {
              font-size: 22px;
              font-weight: bold;
            }

            .hero-swiper :global(.swiper-pagination) {
              bottom: 20px !important;
              z-index: 30;
            }

            .hero-swiper :global(.swiper-pagination-bullet) {
              background: rgba(255, 255, 255, 0.4);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.3);
              opacity: 1;
              width: 14px;
              height: 14px;
              margin: 0 6px !important;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .hero-swiper :global(.swiper-pagination-bullet-active) {
              background: linear-gradient(135deg, #00aeef, #0095cc);
              border-color: rgba(0, 174, 239, 0.8);
              width: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0, 174, 239, 0.6);
            }

            @media (max-width: 1024px) {
              .hero-swiper :global(.swiper-button-next),
              .hero-swiper :global(.swiper-button-prev) {
                display: none !important;
              }
            }

            @media (max-width: 768px) {
              .hero-swiper :global(.swiper-button-next),
              .hero-swiper :global(.swiper-button-prev) {
                width: 40px;
                height: 40px;
              }

              .hero-swiper :global(.swiper-button-next:after),
              .hero-swiper :global(.swiper-button-prev:after) {
                font-size: 14px;
              }

              .hero-swiper :global(.swiper-pagination-bullet) {
                width: 10px;
                height: 10px;
              }

              .hero-swiper :global(.swiper-pagination-bullet-active) {
                width: 24px;
              }
            }
          `}</style>
        {/* Section Header */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            Wooden Splints Export
          </h2>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
            Premium Quality Wooden Splints
          </h3>
          <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8"></div>
          <p className="text-[#666666] text-lg max-w-3xl mx-auto">
            High-quality wooden splints delivered to multiple countries across
            Africa, Europe, and Central America. Trusted by manufacturers
            worldwide.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="card-hover bg-gradient-to-br from-[#00AEEF] to-[#0095CC] p-8 rounded-2xl text-center text-white shadow-xl"
            >
              <div className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">
                {stat.number}
              </div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-white/80">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Splints Images Showcase */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Our Wooden Splints
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#E0E0E0]">
              <div className="aspect-video overflow-hidden">
                <img
                  src={splints}
                  alt="Premium Wooden Splints"
                  loading="lazy"
                  decoding="async"
                  width="1280"
                  height="720"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-[#222222] font-bold text-xl mb-2">
                  Premium Quality Splints
                </h4>
                <p className="text-[#666666]">
                  Carefully selected wood for optimal match production
                </p>
              </div>
            </div>

            <div className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#E0E0E0]">
              <div className="aspect-video overflow-hidden">
                <img
                  src={splints_2}
                  alt="Wooden Splints Manufacturing"
                  loading="lazy"
                  decoding="async"
                  width="1280"
                  height="720"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-[#222222] font-bold text-xl mb-2">
                  Precision Manufacturing
                </h4>
                <p className="text-[#666666]">
                  State-of-the-art processing for consistent quality
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Countries */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-4">
            Global Splint Desitinations
          </h3>
          <p className="text-[#666666] text-center mb-12 max-w-2xl mx-auto">
            We export to 6+ countries across multiple continents
          </p>

          <div className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {woodenSplints.map((splint, index) => (
                <div
                  key={index}
                  className="card-hover bg-white rounded-xl p-6 text-center shadow-lg"
                >
                  <div className="text-5xl mb-3">{splint.flag}</div>
                  <div className="text-[#222222] text-xl font-bold mb-2">
                    {splint.country}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Order Options */}
        <div className="mb-20">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-4">
            Available Sizes & Custom Options
          </h3>
          <p className="text-[#666666] text-center mb-12 max-w-2xl mx-auto">
            We provide standard sizes and can accommodate custom specifications
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
                    <h4 className="text-[#222222] text-xl font-bold mb-3">
                      {option.title}
                    </h4>
                    <p className="text-[#666666] mb-4">{option.description}</p>
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

        {/* Trust Cards */}
        <div className="mb-16">
          <h3 className="text-[#222222] text-3xl font-bold text-center mb-12">
            Why Choose Our Wooden Splints?
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

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#ED028C] to-[#d4027a] rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
                Need Premium Wooden Splints?
              </h3>
              <p className="text-white/90 text-lg leading-relaxed mb-8 drop-shadow-md">
                Contact us for competitive pricing, reliable supply, and
                exceptional quality. We handle everything from custom
                specifications to international delivery.
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

        {/* Contact Information */}
        <div className="mt-16 bg-white rounded-2xl border-2 border-[#E0E0E0] p-8">
          <h4 className="text-[#222222] text-2xl font-bold mb-6 text-center">
            Export Department Contact
          </h4>
          <div className="grid md:grid-cols-2 gap-6 text-center">
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

export default WoodenSplintsExport;
