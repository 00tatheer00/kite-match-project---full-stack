import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Timeline = ({ timeline }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-[#222222] text-center mb-12"
        >
          Our Journey
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="card-hover bg-white p-6 rounded-xl shadow-md border-l-4 border-[#00AEEF]"
            >
              <span className="inline-block bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white font-bold px-4 py-2 rounded-full text-sm mb-3">
                {item.year}
              </span>
              <p className="text-[#666666] leading-relaxed">{item.event}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
