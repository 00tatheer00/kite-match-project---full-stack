import { Link } from "react-router-dom";
import carousel2 from "../assets/heroCarousel/AllMatches-1280x640.jpeg";
import carousel3 from "../assets/heroCarousel/burqaction-1280x640.jpeg";
import carousel4 from "../assets/heroCarousel/kite-detergents-1280x640.jpeg";
import carousel5 from "../assets/heroCarousel/DWB-1280x640.jpeg";
import carousel6 from "../assets/heroCarousel/vero-1280x640.jpeg";

import carousel1Mobile from "../assets/heroCarousel/640x640kite.jpg";
import carousel2Mobile from "../assets/heroCarousel/640x640glow.jpg";
import carousel3Mobile from "../assets/heroCarousel/640x640burq.jpg";
import carousel4Mobile from "../assets/heroCarousel/640x640dishwash.jpg";
import carousel5Mobile from "../assets/heroCarousel/640x640vero.jpg";

const brandRows = [
  {
    id: 1,
    desktopImage: carousel2,
    squareImage: carousel1Mobile,
    desktopAlt: "All safety matches",
    squareAlt: "Kite brand",
    link: "/products/safety-matches",
  },
  {
    id: 3,
    desktopImage: carousel4,
    squareImage: carousel2Mobile,
    desktopAlt: "Glow product range",
    squareAlt: "Glow logo",
    link: "/products",
  },
  {
    id: 2,
    desktopImage: carousel3,
    squareImage: carousel3Mobile,
    desktopAlt: "Burq detergent action",
    squareAlt: "Burq logo",
    link: "/products/burq-action",
  },
  {
    id: 5,
    desktopImage: carousel6,
    squareImage: carousel5Mobile,
    desktopAlt: "Vero care essentials",
    squareAlt: "Vero logo",
    link: "/products",
  },
  {
    id: 4,
    desktopImage: carousel5,
    squareImage: carousel4Mobile,
    desktopAlt: "Kite dishwash bar",
    squareAlt: "Dishwash logo",
    link: "/products/dish-wash-bar",
  },
];

const BrandsShowcaseSection = () => {
  return (
    <section className="bg-neutral-100 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-rose-700 sm:text-4xl lg:text-5xl">
            Discover Our Brands
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-4 lg:space-y-5">
          {brandRows.map((brand, index) => (
            <div
              key={brand.id}
              className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-5"
            >
              <Link
                to={brand.link}
                className={`group relative col-span-4 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 sm:col-span-4 ${
                  index % 2 === 0 ? "order-1" : "order-2"
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={brand.squareImage}
                    alt={brand.squareAlt}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="640"
                    sizes="(max-width: 640px) 40vw, 25vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>

              <Link
                to={brand.link}
                className={`group relative col-span-8 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 sm:col-span-8 ${
                  index % 2 === 0 ? "order-2" : "order-1"
                }`}
              >
                <div className="aspect-2/1">
                  <img
                    src={brand.desktopImage}
                    alt={brand.desktopAlt}
                    loading="lazy"
                    decoding="async"
                    width="1280"
                    height="640"
                    sizes="(max-width: 640px) 60vw, 70vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsShowcaseSection;
