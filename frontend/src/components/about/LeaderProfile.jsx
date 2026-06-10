import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const LeaderProfile = ({
  name,
  title,
  stitle,
  image,
  imgcls,
  message,
  positions,
  backgroundColor = "bg-white",
  imagePosition = "left", // 'left' or 'right'
  accentColor = "#00AEEF",
  universities = [], // Array of university logos
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const isLeft = imagePosition === "left";

  return (
    <section ref={ref} className={`py-16 md:py-24 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start mb-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className={`space-y-6 ${isLeft ? "order-1" : "order-1 md:order-2"}`}
          >
            <div className="relative">
              <img
                src={image}
                alt={`${name} - ${title}`}
                loading="lazy"
                decoding="async"
                width="640"
                height="853"
                className={`w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-2xl shadow-2xl aspect-[3/4] object-cover ${imgcls ? imgcls : ""}`}
              />
              <div
                className={`absolute -bottom-4 ${isLeft ? "right-4 sm:right-8 md:right-12" : "left-4 sm:left-8 md:left-12"} text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg`}
                style={{
                  background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor}dd)`,
                }}
              >
                <p className="font-bold">{stitle}</p>
              </div>
            </div>

            {/* University Logos (if any) */}
            {universities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-6 mt-8"
              >
                {universities.map((uni, index) => (
                  <img
                    key={index}
                    src={uni}
                    alt="University"
                    loading="lazy"
                    decoding="async"
                    width="160"
                    height="80"
                    className="h-16 md:h-20 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${isLeft ? "order-2" : "order-2 md:order-1"}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-4">
              {name}
            </h2>
            <p
              className="text-xl font-semibold mb-6"
              style={{ color: accentColor }}
            >
              {title}
            </p>

            {/* Message/Bio */}
            <div className="space-y-4 text-[#666666] leading-relaxed">
              {message.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Key Positions - Below everything, horizontal layout */}
        {positions && positions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 pt-12 border-t border-gray-200"
          >
            <h3 className="text-2xl font-bold text-[#222222] mb-8 text-center">
              Key Positions
            </h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {positions.map((position, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                    className="flex flex-col items-center text-center group w-32 md:w-40"
                  >
                    {/* Logo */}
                    <div className="mb-3 h-20 md:h-24 flex items-center justify-center">
                      <img
                        src={position.logo}
                        alt={position.title}
                        loading="lazy"
                        decoding="async"
                        width="96"
                        height="96"
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Title */}
                    <h4 className="text-base md:text-lg font-bold text-[#222222] mb-1">
                      {position.title}
                    </h4>

                    {/* Description */}
                    {position.description && (
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {position.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LeaderProfile;
