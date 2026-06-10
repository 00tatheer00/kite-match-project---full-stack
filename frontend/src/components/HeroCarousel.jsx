import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Link } from "react-router-dom";
import { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import carousel1 from "../assets/heroCarousel/1920x640allproducts.jpg";
import carousel2 from "../assets/heroCarousel/1920x640allmatches.webp";
import carousel3 from "../assets/heroCarousel/1920x640burq.jpeg";
import carousel4 from "../assets/heroCarousel/1920x640glow.jpg";
import carousel5 from "../assets/heroCarousel/1920x640dishwash.jpg";
import carousel6 from "../assets/heroCarousel/1920x640vero.jpg";
import carousel7 from "../assets/Shippment-1920x640.jpeg";

import carousel1Mobile from "../assets/heroCarousel/all-matchesr-640x640.jpeg";
import carousel2Mobile from "../assets/heroCarousel/kite-detergents-640x640.jpeg";
import carousel3Mobile from "../assets/heroCarousel/burqaction-640x640.jpeg";
import carousel4Mobile from "../assets/heroCarousel/DWB-640x640.jpg";
import carousel5Mobile from "../assets/heroCarousel/vero-640x640.jpeg";
import carousel6Mobile from "../assets/heroCarousel/Matches-640x640.jpeg";
import carousel7Mobile from "../assets/Shippment-640x640.jpeg";

const HeroCarousel = () => {
  const [, setActiveIndex] = useState(0);
  const slides = [
    {
      id: 1,
      title: "Complete Product Portfolio",
      subtitle: "Discover all categories in one place",
      description:
        "Explore safety matches, household essentials, and FMCG lines designed for quality, consistency, and value.",
      image: carousel1,
      mobileImage: carousel1Mobile,
      link: "/products",
      gradient: "from-blue-900/50 via-blue-800/30 to-transparent",
      accentColor: "#1E3A8A",
    },
    {
      id: 2,
      title: "Premium Safety Matches",
      subtitle: "Trusted brands for every market",
      description:
        "From local favorites to export-ready lines, our safety matches deliver reliable ignition and consistent quality.",
      image: carousel2,
      mobileImage: carousel6Mobile,
      link: "/products",
      gradient: "from-orange-900/50 via-orange-700/30 to-transparent",
      accentColor: "#EA580C",
    },
    {
      id: 3,
      title: "Glow Product Range",
      subtitle: "Everyday care with trusted quality",
      description:
      "A dependable household range built for routine performance, consistent results, and customer satisfaction.",
      image: carousel4,
      mobileImage: carousel2Mobile,
      link: "/products/kite-glow",
      gradient: "from-purple-900/50 via-purple-700/30 to-transparent",
      accentColor: "#7C3AED",
    },
    {
      id: 4,
      title: "Kite Dishwash Bar",
      subtitle: "Extra strength for sparkling dishes",
      description:
        "Cuts through grease with ease, offers lemon freshness, and stays gentle on hands for everyday dish care.",
      image: carousel5,
      mobileImage: carousel4Mobile,
      link: "/products/dish-wash-bar",
      gradient: "from-emerald-900/50 via-emerald-700/30 to-transparent",
      accentColor: "#047857",
    },
    {
      id: 5,
      title: "Burq Detergent Action",
      subtitle: "Color guard with deep cleaning power",
      description:
        "Advanced stain removal and color protection technology to keep fabrics fresh and bright, wash after wash.",
      image: carousel3,
      mobileImage: carousel3Mobile,
      link: "/products/burq-action",
      gradient: "from-green-800/50 via-green-600/30 to-transparent",
      accentColor: "#059669",
    },
    
    {
      id: 6,
      title: "Vero Care Essentials",
      subtitle: "Reliable quality for modern homes",
      description:
        "Built for practical daily use, Vero products combine performance, quality control, and dependable value.",
      image: carousel6,
      mobileImage: carousel5Mobile,
      link: "/products/vero",
      gradient: "from-cyan-900/50 via-cyan-700/30 to-transparent",
      accentColor: "#0E7490",
    },
    {
      id: 7,
      title: "Swift Delivery Services",
      subtitle: "Fast, Reliable, and Nationwide Coverage",
      description:
        "Experience the speed and reliability of Swift Delivery Services. We ensure your packages reach their destination on time, every time, with our extensive nationwide coverage.",
      image: carousel7,
      mobileImage: carousel7Mobile,
      link: "/export/safety-matches",
      gradient: "from-purple-900/50 via-purple-700/30 to-transparent",
      accentColor: "#7C3AED",
    },
  ];

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Animated Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div> */}

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
            <div className="relative min-h-[55vh] sm:min-h-[65vh] md:min-h-[78vh] lg:min-h-[90vh] w-full overflow-hidden">
              {/* Background Image - Responsive */}
              <div className="absolute inset-0 bg-white">
                <Link to={slide.link} className="block w-full h-full">
                  <picture className="block w-full h-full! ">
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
                </Link>
                {/* Subtle Gradient Overlay for Text Readability */}
                {/* <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" /> */}
              </div>

              {/* Decorative Elements - Hidden for cleaner look */}
              {/* <div className="absolute top-20 right-10 w-64 h-64 border-2 border-white/10 rounded-full animate-spin-slow"></div>
              <div className="absolute bottom-32 left-10 w-48 h-48 border-2 border-white/10 rounded-full animate-spin-slow-reverse"></div> */}

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-20">
                <div className="max-w-3xl space-y-6 animate-fade-in-up">
                  {/* Decorative Line */}
                  {/* <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent animate-pulse"></div>
                    <span className="text-white text-sm font-bold tracking-[0.3em] uppercase drop-shadow-lg">
                      Trusted Quality Since 1975
                    </span>
                  </div> */}

                  {/* Title with Glowing Effect */}
                  {/* <h1
                    className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-[1.1] tracking-tight"
                    style={{
                      textShadow: `0 0 30px ${slide.accentColor}40, 0 10px 40px rgba(0,0,0,0.9), 0 5px 15px rgba(0,0,0,0.8)`,
                      animation: "glow 2s ease-in-out infinite alternate",
                    }}
                  >
                    {slide.title}
                  </h1> */}

                  {/* Subtitle with Glass Effect */}
                  {/* <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-white text-lg sm:text-xl md:text-2xl font-semibold mb-3 leading-relaxed">
                      {slide.subtitle}
                    </h2>
                    <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                      {slide.description}
                    </p>
                  </div> */}

                  {/* CTA Button with Premium Design */}
                  {/* <div className="flex flex-wrap gap-4 mt-8">
                      
                      <button
                        onClick={() => navigate(slide.link)}
                        className="group relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-all duration-500 hover:shadow-primary/50 hover:scale-105 active:scale-95"
                        style={{
                          boxShadow: `0 10px 40px ${slide.accentColor}40`,
                        }}
                      > */}
                  {/* Button Shine Effect */}
                  {/* <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                        <span className="relative flex items-center gap-3">
                          View Products
                          <svg
                            className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </span>
                      </button>

                  
                  
                      <button
                      onClick={() => navigate("/contact")}
                      className="group backdrop-blur-md bg-white/10 border-2 border-white/30 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 active:scale-95">
                        <span className="flex items-center gap-3">
                          Contact Us
                          <svg
                            className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                      </button>
                    </div> */}
                </div>
              </div>

              {/* Bottom Accent Line */}
              {/* <div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ backgroundColor: slide.accentColor }}
              ></div> */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        /* Hero carousel image - responsive and not constrained */
        .hero-carousel-img {
          max-height: none !important;
          height: 100% !important;
          width: 100% !important;
        }

        @keyframes ken-burns {
          0% {
            transform: scale(1.1) translateX(0) translateY(0);
          }
          100% {
            transform: scale(1.2) translateX(-20px) translateY(-20px);
          }
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

        @keyframes glow {
          from {
            text-shadow:
              0 0 20px rgba(0, 174, 239, 0.3),
              0 10px 40px rgba(0, 0, 0, 0.9);
          }
          to {
            text-shadow:
              0 0 40px rgba(0, 174, 239, 0.6),
              0 10px 40px rgba(0, 0, 0, 0.9);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite alternate;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Swiper Navigation Buttons - Premium Design */
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

        /* Pagination - Modern Glass Design */
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

        .hero-swiper :global(.swiper-pagination-bullet:hover) {
          transform: scale(1.2);
          border-color: rgba(255, 255, 255, 0.6);
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
    </section>
  );
};

export default HeroCarousel;
