import { FaGift, FaAward, FaHandshake } from "react-icons/fa";
import { Link } from "react-router-dom";

const BriefPromotion = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-[#00AEEF] to-[#0095CC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">
            Why Choose Kite Brand?
          </h2>
          <p className="text-text-white-90 text-lg max-w-3xl mx-auto">
            Premium quality products with competitive pricing - from matches to
            detergents and dish wash bars
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card-hover relative bg-white backdrop-blur-sm rounded-2xl p-8 text-center border-4 border-transparent group">
            <FaAward className="text-5xl text-[#ED028C] mx-auto mb-4 group-hover:text-[#00AEEF]" />
            <h3 className="text-2xl font-bold mb-3">Premium Quality</h3>
            <p className="text-black">
              Kite Matches meeting international safety standards. Kite Glow
              Detergent with Triple enzymes Formula.
            </p>
          </div>

          <div className="card-hover relative bg-white backdrop-blur-sm rounded-2xl p-8 text-center border-4 border-transparent group">
            <FaGift className="text-5xl text-[#ED028C] mx-auto mb-4 group-hover:text-[#00AEEF]" />
            <h3 className="text-2xl font-bold mb-3">Value for Money</h3>
            <p className="text-black">
              Competitive pricing with bulk order discounts for wholesalers and
              distributors across Pakistan.
            </p>
          </div>

          <div className="card-hover relative bg-white backdrop-blur-sm rounded-2xl p-8 text-center border-4 border-transparent group">
            <FaHandshake className="text-5xl text-[#ED028C] mx-auto mb-4 group-hover:text-[#00AEEF]" />
            <h3 className="text-2xl font-bold mb-3">Trusted Brand</h3>
            <p className="text-black">
              50+ years of manufacturing excellence. Exporting to 40+ countries
              with proven reliability.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="inline-block bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-[#F9F9F9] transition-all duration-300 shadow-lg"
          >
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BriefPromotion;
