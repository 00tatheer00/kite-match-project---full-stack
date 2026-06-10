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

const BriefProductsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        const allProducts = data
          .filter((p) => p.showOnLanding !== false)
          .sort((a, b) => {
            const byOrder = getOrderValue(a) - getOrderValue(b);
            if (byOrder !== 0) return byOrder;
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime;
          })
          .slice(0, 5); // Take up to 5 products
        setFeaturedProducts(allProducts);
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getIcon = (product) => {
    if (product.iconType === "fire") return <FaFire className="text-4xl" />;
    return <FaLayerGroup className="text-4xl" />;
  };

  return (
    <section
      ref={ref}
      className="py-16 bg-gradient-to-b from-white to-[#F9F9F9]"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            Our Products
          </h2>
          <h3 className="text-[#222222] text-3xl md:text-4xl font-bold mb-4">
            Premium Quality Products You Can Trust
          </h3>
          <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-6"></div>
          <p className="text-[#666666] text-base max-w-2xl mx-auto">
            Discover our range of premium FMCG products trusted by households
            and businesses across Pakistan and 40+ countries worldwide.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`brief-product-skeleton-${index}`}
                  className="bg-white rounded-xl border-2 border-[#E0E0E0] p-4 animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[#F1F1F1] rounded-lg" />
                  <div className="mt-4 space-y-3">
                    <div className="h-4 bg-[#E5E5E5] rounded w-3/4" />
                    <div className="h-3 bg-[#EFEFEF] rounded w-full" />
                    <div className="h-3 bg-[#EFEFEF] rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-[#E0E0E0] hover:border-[#00AEEF] transform hover:-translate-y-1 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative aspect-auto sm:aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
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
                      className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
                      style={{ backgroundColor: product.color }}
                    >
                      {product.category || product.productType || "Product"}
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center mb-3">
                      <div className="mr-3 shrink-0" style={{ color: product.color }}>
                        {getIcon(product)}
                      </div>
                      <h4 className="text-[#222222] text-lg font-bold group-hover:text-[#00AEEF] transition-colors line-clamp-2">
                        {product.title}
                      </h4>
                    </div>

                    <p className="text-[#666666] text-sm mb-4 line-clamp-3 flex-1">
                      {product.description}
                    </p>

                    {/* View Details Link */}
                    <div className="flex items-center text-[#00AEEF] font-semibold text-sm group-hover:text-[#ED028C] transition-colors mt-auto pt-2">
                      <span className="mr-2">View Details</span>
                      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform text-xs" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* View All Products Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>View All Products</span>
            <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BriefProductsSection;
