'use client';

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaArrowRight } from "react-icons/fa";
import { Link } from '@/components/RouterCompat';
import { useEffect, useState } from "react";
import { getProducts } from "../services/api";

const placeholderImage =
  "/logo.png";

const getOrderValue = (product) => {
  if (typeof product?.carouselOrder === "number") return product.carouselOrder;
  if (typeof product?.displayOrder === "number") return product.displayOrder;
  return 0;
};

// Real purchasable prices: product sizes, or each brand's sizes for products sold per brand.
const priceList = (p) =>
  [
    ...((p?.brands?.length ? [] : p?.variants) || []),
    ...((p?.brands || []).flatMap((b) => b?.variants || [])),
  ]
    .map((v) => Number(v?.price))
    .filter((n) => Number.isFinite(n) && n > 0);

const sizeNames = (p) => {
  const list = p?.brands?.length ? (p.brands || []).map((b) => b?.name) : (p?.variants || []).map((v) => v?.name);
  return [...new Set(list.filter(Boolean).map((n) => String(n).replace(/ Safety Matches$/i, "")))];
};

const ProductsSection = ({ initialProducts = [] }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [allProducts, setAllProducts] = useState(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts
        .filter((p) => p.showInProductsPage !== false)
        .sort((a, b) => {
          const byOrder = getOrderValue(a) - getOrderValue(b);
          if (byOrder !== 0) return byOrder;
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        })
        ;
    }
    return [];
  });
  const [loading, setLoading] = useState(allProducts.length === 0);

  useEffect(() => {
    const load = async () => {
      try {
        if (!initialProducts?.length) setLoading(true);
        const data = await getProducts();
        const visible = data
          .filter((p) => p.showInProductsPage !== false)
          .sort((a, b) => {
            const byOrder = getOrderValue(a) - getOrderValue(b);
            if (byOrder !== 0) return byOrder;
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime;
          })
          ;
        setAllProducts(visible);
      } catch {
        // Keep server-rendered products if the background refresh fails.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-white via-[#F9F9F9] to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            Our Products
          </h2>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
            Kite Brand - Quality Products You Can Trust
          </h3>
          <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8"></div>
          <p className="text-[#666666] text-lg max-w-3xl mx-auto">
            With over 50 years of manufacturing excellence, Kite brand delivers
            premium FMCG products that meet international quality standards.
            From detergents to safety matches and dish wash bars - trusted by
            households and businesses across Pakistan and 40+ countries
            worldwide.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`product-skeleton-${index}`}
                  className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-4 h-[460px] animate-pulse"
                >
                  <div className="h-52 bg-[#F1F1F1] rounded-xl" />
                  <div className="mt-4 space-y-3">
                    <div className="h-4 bg-[#E5E5E5] rounded w-3/4" />
                    <div className="h-4 bg-[#E5E5E5] rounded w-1/2" />
                    <div className="h-3 bg-[#EFEFEF] rounded w-full" />
                    <div className="h-3 bg-[#EFEFEF] rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {allProducts.map((product) => {
                const accent = product.color || "#00AEEF";
                const prices = priceList(product);
                const fromPrice = prices.length ? Math.min(...prices) : null;
                const sizes = sizeNames(product);
                const image =
                  (product.image?.src || product.image) || (product.images?.[0]?.src || product.images?.[0]) || placeholderImage;
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    aria-label={`${product.title}: view details and prices`}
                  >
                    {/* Image on a soft brand-coloured backdrop */}
                    <div
                      className="relative aspect-[4/3] overflow-hidden flex items-center justify-center"
                      style={{ background: `radial-gradient(circle at 50% 40%, ${accent}22 0%, ${accent}0d 45%, #f8fafc 80%)` }}
                    >
                      <img
                        src={image}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="max-h-[78%] max-w-[78%] object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                      />
                      <span
                        className="absolute top-2 left-2 sm:top-4 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-[10px] sm:text-xs font-bold tracking-wide shadow-md"
                        style={{ backgroundColor: accent }}
                      >
                        {product.category || product.productType || "Product"}
                      </span>
                      {fromPrice != null && (
                        <span className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur px-2 sm:px-3.5 py-1 sm:py-2 shadow-lg text-right leading-tight">
                          <span className="block text-[9px] sm:text-[11px] font-semibold text-slate-500">From</span>
                          <span className="block text-sm sm:text-lg font-black text-slate-900">Rs {fromPrice.toLocaleString("en-PK")}</span>
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3 sm:p-6 flex-1 flex flex-col">
                      <h3 className="text-slate-900 text-sm sm:text-xl md:text-2xl font-extrabold leading-snug group-hover:text-[#00AEEF] transition-colors">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="hidden sm:block mt-2 text-slate-600 text-sm leading-relaxed line-clamp-2">{product.description}</p>
                      )}

                      {sizes.length > 0 && (
                        <div className="hidden sm:flex mt-4 flex-wrap gap-1.5">
                          {sizes.slice(0, 4).map((name) => (
                            <span key={name} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                              {name}
                            </span>
                          ))}
                          {sizes.length > 4 && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold">
                              +{sizes.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-3 sm:pt-6">
                        <span
                          className="flex items-center justify-center gap-2 w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-xs sm:text-base font-bold text-white shadow-md group-hover:shadow-lg transition-all"
                          style={{ backgroundColor: accent }}
                        >
                          <span className="sm:hidden">View</span>
                          <span className="hidden sm:inline">View details &amp; prices</span>
                          <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-3xl p-8 md:p-12 text-center shadow-2xl"
        >
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            Interested in Kite Brand Products?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto drop-shadow-md">
            Contact us for product inquiries, bulk orders, private labeling
            services, or export opportunities for Kite detergents, matches, and
            dish wash products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-[#F9F9F9] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
            >
              Request Quote
            </Link>
            <a
              href="https://wa.me/923008592829"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#00AEEF] transition-all duration-300 active:scale-95"
            >
              Call Us Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
