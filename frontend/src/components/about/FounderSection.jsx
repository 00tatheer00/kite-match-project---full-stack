import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const FounderSection = ({ founder }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-6">
              Our Founder
            </h2>
            <div className="space-y-4 text-lg text-[#666666] leading-relaxed">
              <p>
                Our founder, the late{" "}
                <strong className="text-[#222222]">Haji Aziz-Ur-Rehman</strong>,
                or <strong className="text-[#222222]">(Aziz Jan)</strong> as he
                was popularly known, was a man of great virtue, character, and
                principle. A visionary entrepreneur and philanthropist, he laid
                the foundation of what would become one of Pakistan's leading
                industrial conglomerates. His unwavering commitment to quality,
                integrity, and community service established the core values
                that continue to guide our group today.
              </p>
              <p>
                Born with an entrepreneurial spirit and driven by determination,
                Haji Aziz-Ur-Rehman started his journey with modest means but
                extraordinary vision. He established the group's first match
                manufacturing unit in 1974, setting new standards for quality
                and safety in the industry. Through decades of hard work,
                perseverance, and strategic thinking, he transformed a single
                factory into a multi-divisional business empire spanning FMCG,
                textiles, board manufacturing, and real estate development.
              </p>
              <p>
                Beyond his business acumen, Haji Aziz-Ur-Rehman was deeply
                committed to social responsibility and the welfare of his
                employees and community. He believed in creating opportunities
                for others and maintained the highest ethical standards in all
                business dealings. His teachings about honesty, hard work, and
                compassion remain the guiding principles of our group. His
                legacy lives on through our continued commitment to excellence,
                innovation, and serving the nation with quality products that
                touch millions of lives every day.
              </p>
            </div>
          </motion.div>

          {/* Placeholder Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <div className="relative max-w-sm sm:max-w-md mx-auto">
              {/* Placeholder - Replace with actual founder image */}
              {/* <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-semibold">Founder Image</p>
                  <p className="text-sm text-gray-500 mt-2">Placeholder</p>
                </div>
              </div>*/}
              {/* Decorative Border */}
              {/* <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-[#00AEEF] rounded-2xl -z-10"></div>  */}
              
              <img
                src={founder}
                alt="Founder"
                loading="lazy"
                decoding="async"
                className="w-full aspect-[3/4] object-cover object-top rounded-2xl shadow-xl"
              />
              <div
                className="absolute -bottom-3 right-3 md:-bottom-4 md:right-4 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl shadow-lg bg-[#00AEEF]"
              >
                <p className="font-bold">Founder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
