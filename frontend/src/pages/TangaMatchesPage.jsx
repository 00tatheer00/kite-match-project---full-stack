import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { FaFire, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import kite_img from "../assets/products/kite.jpeg";

const TangaMatchesPage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const product = {
    id: "tanga",
    category: "Safety Matches",
    title: "Tanga Safety Matches",
    icon: <FaFire className="text-6xl text-[#ED028C]" />,
    description:
      "Tanga is a trusted local brand of safety matches, manufactured with premium quality standards. Known for reliable performance and consistent quality across all sizes.",
    image: kite_img,
    color: "#ED028C",
    features: [
      "Damp proof technology",
      "Reliable ignition",
      "Premium quality",
      "Extra sticks per box",
      "Carborised and damp proof",
      "International safety standards",
    ],
    sizes: [
      { size: "LARGE", avgSticks: 58, matchesPerCotton: 500 },
      { size: "CLASSIC", avgSticks: 45, matchesPerCotton: 500 },
      { size: "REGULAR", avgSticks: 42, matchesPerCotton: 1000 },
      { size: "SMALL", avgSticks: 32, matchesPerCotton: 1000 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F9F9F9] to-white">
      <div
        className="relative py-16"
        style={{
          background: `linear-gradient(135deg, ${product.color}15 0%, ${product.color}05 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center text-[#666666] hover:text-[#00AEEF] mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="sticky top-24 h-fit"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#E0E0E0]">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="mr-4" style={{ color: product.color }}>
                {product.icon}
              </div>
              <div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold mb-2"
                  style={{ backgroundColor: product.color }}
                >
                  {product.category}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-2">
                  {product.title}
                </h1>
              </div>
            </div>

            <p className="text-[#666666] text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[#222222] mb-4">
                Key Features
              </h3>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <FaCheckCircle
                      className="mr-3 mt-1 flex-shrink-0"
                      style={{ color: product.color }}
                    />
                    <span className="text-[#666666]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#E0E0E0]">
            <h3 className="text-2xl font-bold text-[#222222] mb-6">
              Available Sizes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="text-white"
                    style={{
                      background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}dd 100%)`,
                    }}
                  >
                    <th className="px-6 py-4 text-left">SIZE</th>
                    <th className="px-6 py-4 text-center">
                      AVG STICKS PER BOX
                    </th>
                    <th className="px-6 py-4 text-center">
                      MATCHES PER COTTON
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.sizes.map((size, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-[#222222]">
                        {size.size}
                      </td>
                      <td className="px-6 py-4 text-center text-[#666666]">
                        {size.avgSticks}
                      </td>
                      <td className="px-6 py-4 text-center text-[#666666]">
                        {size.matchesPerCotton}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-3xl p-8 md:p-12 text-center shadow-2xl"
        >
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            Interested in {product.title}?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto drop-shadow-md">
            Contact us for product inquiries, bulk orders, private labeling
            services, or export opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-[#F9F9F9] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
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
    </div>
  );
};

export default TangaMatchesPage;
