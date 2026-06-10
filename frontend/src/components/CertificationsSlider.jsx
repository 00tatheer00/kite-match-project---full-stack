import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import efs from "../assets/certificates/efs.jpeg";
import fbr from "../assets/certificates/fbr.jpeg";
import iaf from "../assets/certificates/iaf.jpeg";
import iso900 from "../assets/certificates/iso900.jpeg";
import ps from "../assets/certificates/ps.jpeg";
import secp from "../assets/certificates/secp.jpeg";
import ukas from "../assets/certificates/ukas.jpeg";

const CertificationsSlider = () => {
  const certifications = [
    {
      id: 1,
      title: "Export Excellence Score",
      image: efs,
      bgColor: "#00AEEF",
    },
    {
      id: 2,
      title: "Federal Board of Revenue",
      image: fbr,
      bgColor: "#4CAF50",
    },
    {
      id: 3,
      title: "International Accreditation Forum",
      image: iaf,
      bgColor: "#003366",
    },
    {
      id: 4,
      title: "ISO 9001",
      image: iso900,
      bgColor: "#FF9800",
    },
    {
      id: 5,
      title: "Pakistan Standards",
      image: ps,
      bgColor: "#4CAF50",
    },
    {
      id: 6,
      title: "SECP",
      image: secp,
      bgColor: "#00BCD4",
    },
    {
      id: 7,
      title: "UKAS Management Systems",
      image: ukas,
      bgColor: "#8B1538",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            Quality Assurance
          </h2>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
            Our Certifications
          </h3>
          <div className="w-24 h-1 bg-[#00AEEF] mx-auto mb-8"></div>
          <p className="text-[#666666] text-lg max-w-3xl mx-auto">
            We are proud to hold multiple international certifications that
            demonstrate our commitment to quality, safety, sustainability, and
            ethical business practices.
          </p>
        </div>

        {/* Certifications Slider */}
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          className="certifications-swiper pb-12"
        >
          {certifications.map((cert) => (
            <SwiperSlide key={cert.id}>
              <div className="card-hover relative bg-white rounded-xl overflow-x-hidden border border-gray-200 group h-full">
                <div className="relative flex items-center justify-center overflow-hidden bg-white p-2 sm:p-8">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    loading="lazy"
                    decoding="async"
                    width="320"
                    height="240"
                    className="h-18 sm:h-44 md:h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style>{`
          .certifications-swiper {
            padding-bottom: 40px;
          }

          .certifications-swiper :global(.swiper-button-next),
          .certifications-swiper :global(.swiper-button-prev) {
            color: white;
            background: #00aeef;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 2px solid #00aeef;
          }

          .certifications-swiper :global(.swiper-button-next:hover),
          .certifications-swiper :global(.swiper-button-prev:hover) {
            background: #0095cc;
            border-color: #0095cc;
          }

          .certifications-swiper :global(.swiper-button-next:after),
          .certifications-swiper :global(.swiper-button-prev:after) {
            font-size: 18px;
          }

          .swiper-pagination {
            bottom: -0px !important;
          }

          .certifications-swiper :global(.swiper-pagination-bullet) {
            background: #666666;
            opacity: 0.4;
            width: 10px;
            height: 10px;
          }

          .certifications-swiper :global(.swiper-pagination-bullet-active) {
            background: #00aeef;
            opacity: 1;
            width: 30px;
            border-radius: 5px;
          }

          @media (max-width: 1024px) {
            .certifications-swiper :global(.swiper-button-next),
            .certifications-swiper :global(.swiper-button-prev) {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default CertificationsSlider;
