import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaFire, FaLayerGroup, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../services/api";

const placeholderImage =
  "https://via.placeholder.com/400x500/E0E0E0/666666?text=Product";

const getOrderValue = (product) => {
  if (typeof product?.carouselOrder === "number") return product.carouselOrder;
  if (typeof product?.displayOrder === "number") return product.displayOrder;
  return 0;
};

const ProductsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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
          .slice(0, 5);
        setAllProducts(visible);
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getIcon = (product) => {
    if (product.iconType === "fire") return <FaFire className="text-5xl" />;
    return <FaLayerGroup className="text-5xl" />;
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {allProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-[#E0E0E0] hover:border-[#00AEEF] transform hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative aspect-auto sm:aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shrink-0">
                    <img
                      src={
                        product.image ||
                        product.images?.[0] ||
                        placeholderImage
                      }
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover sm:object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-lg"
                      style={{ backgroundColor: product.color }}
                    >
                      {product.category || product.productType || "Product"}
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="mr-4 shrink-0" style={{ color: product.color }}>
                        {getIcon(product)}
                      </div>
                      <h3 className="text-[#222222] text-xl font-bold group-hover:text-[#00AEEF] transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                    </div>

                    <p className="text-[#666666] text-sm mb-4 line-clamp-3 min-h-[60px]">
                      {product.description}
                    </p>

                    {/* Features Preview */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4 min-h-[52px]">
                        <ul className="space-y-1">
                          {product.features
                            .slice(0, 2)
                            .map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-start text-[#666666] text-xs"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0"
                                  style={{ backgroundColor: product.color }}
                                ></span>
                                <span className="line-clamp-1">
                                  {feature}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-auto">
                      {/* View Details Button */}
                      <div className="flex items-center text-[#00AEEF] font-semibold group-hover:text-[#ED028C] transition-colors">
                        <span className="mr-2">View Details</span>
                        <FaArrowRight className="transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
              href="https://wa.me/+923008592829"
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
