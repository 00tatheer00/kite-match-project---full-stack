import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaShoppingCart, FaCheckCircle, FaGift } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getPromotions } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const PromotionsPackagesSection = () => {
  const navigate = useNavigate();
  const { addPromotionToCart } = useCart();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPromotions();
        setPackages(data || []);
      } catch {
        setPackages([]);
      }
    };
    load();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getComputedTotals = (pkg) => {
    const items = pkg.items || [];
    const totalQuantity = items.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 0),
      0
    );
    const totalPrice = items.reduce(
      (sum, item) =>
        sum + ((Number(item?.quantity) || 0) * (Number(item?.price) || 0)),
      0
    );
    return {
      totalQuantity: totalQuantity || Number(pkg.totalQuantity) || 0,
      totalPrice: totalPrice || Number(pkg.totalPrice) || 0,
    };
  };

  const handleBuyPromotion = (pkg) => {
    const totals = getComputedTotals(pkg);
    addPromotionToCart(pkg, totals.totalPrice, 1);
  };

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative text-center mb-16 pt-6"
        >
          <div className="pointer-events-none absolute -top-2 right-0 sm:right-2 z-10">
            <div className="relative inline-flex items-center bg-gradient-to-r from-[#ED028C] via-[#FF4DB2] to-[#D8017E] text-white px-4 sm:px-5 py-2 rounded-md shadow-xl shadow-[#ED028C]/35 rotate-20">
              <span className="absolute -bottom-2 right-2 w-4 h-4 bg-[#8F0054]/50 rotate-45 rounded-sm" />
              <FaGift className="text-xs sm:text-sm mr-1.5" />
              <span className="text-[10px] sm:text-xs tracking-[0.16em] font-bold uppercase whitespace-nowrap">
                Promotion & Packages
              </span>
            </div>
          </div>
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <FaGift className="text-[#ED028C] text-2xl" />
            <h2 className="text-[#00AEEF] text-lg font-semibold uppercase tracking-wider">
              Exclusive Offers
            </h2>
          </div>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Special Packages & Promotions
          </h3>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#ED028C]"></div>
            <div className="w-2 h-2 bg-[#ED028C] rounded-full"></div>
            <div className="w-24 h-0.5 bg-[#ED028C]"></div>
            <div className="w-2 h-2 bg-[#ED028C] rounded-full"></div>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#ED028C]"></div>
          </div>
          <p className="text-[#666666] text-lg max-w-3xl mx-auto leading-relaxed">
            Carefully curated packages designed to provide exceptional value for families and businesses. 
            Discover savings with our thoughtfully assembled combinations.
          </p>
        </motion.div>

        {/* Packages - Clean Sections */}
        <div className="space-y-16">
          {[...packages].reverse().map((pkg, index) => (
            (() => {
              const totals = getComputedTotals(pkg);
              return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Package Title - At the top, smaller */}
              <div className="mb-10">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] leading-tight">
                  {pkg.title}
                </h3>
              </div>

              {/* Content Layout - Image Left, Details Right */}
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Image Section - Left */}
                <div className="lg:w-2/5">
                  <div className="relative aspect-square h-72 lg:h-120 bg-gradient-to-br from-[#F9F9F9] to-[#F0F0F0] rounded-lg overflow-hidden border border-[#E0E0E0]">
                    {pkg.image ? (
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        loading="lazy"
                        decoding="async"
                        width="640"
                        height="640"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaGift className="text-7xl text-[#999999]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Section - Right */}
                <div className="lg:w-3/5 flex flex-col justify-between">
                  {/* Package Items - Better styled */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-[#222222] mb-5">What's Included:</h4>
                    <div className="space-y-4">
                      {(pkg.items || []).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-start gap-4 p-3 rounded-lg bg-[#F9F9F9] hover:bg-[#F5F5F5] transition-colors"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            <FaCheckCircle className="text-[#ED028C] text-lg" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#222222] font-medium text-base leading-relaxed">
                              {item.product}
                            </p>
                            <p className="text-[#666666] text-sm mt-1.5">
                              Quantity: <span className="font-semibold">{item.quantity}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Package Summary & CTA */}
                  <div className="pt-6 border-t border-[#E0E0E0]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div>
                        <div className="mb-3">
                          <span className="text-[#666666] text-base">Total Items: </span>
                          <span className="text-[#222222] font-bold text-lg">
                            {totals.totalQuantity} {totals.totalQuantity === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#666666] text-base">Package Price: </span>
                          <span className="text-[#00AEEF] text-3xl font-bold">
                            {formatPrice(totals.totalPrice)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyPromotion(pkg)}
                        className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white px-6 md:px-8 py-3.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00AEEF]/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart className="text-sm" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider between sections (except last) */}
              {index < packages.length - 1 && (
                <div className="mt-16 pt-16 border-t border-[#E0E0E0]"></div>
              )}
            </motion.div>
              );
            })()
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionsPackagesSection;
