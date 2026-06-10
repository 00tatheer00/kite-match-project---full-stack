import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import azizGroupLogo from "../../assets/ajlogo.png";

const CompanyOverview = ({ companies }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-6 ">
              Our Story
            </h2>
            <div className="space-y-8 text-[#666666] text-base sm:text-lg md:text-xl text-justify">
              <p className="leading-relaxed md:leading-8">
                Aziz group is a long-established, well-reputed, and
                multi-diversified business concern of Pakistan. It started in
                the 50s with the trading of commodities and after having
                established its name in trading, the group ventured into
                Manufacturing in the early sixties by setting up an ice factory
                & cold storage.
              </p>
              <p className="leading-relaxed md:leading-8">
                Now the group comprises a well-reputed textile-spinning mill,
                the largest safety match manufacturing operation in Pakistan, a
                laminate board (Formica) unit, a particle board (chipboard)
                unit, a cold storage, and a Real Estate Business.
              </p>
              <p className="leading-relaxed md:leading-8">
                The group is largely self-financed and has an impeccable record
                with the financial institutions of Pakistan, exporting to
                Europe, Asia & Africa.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card-hover bg-gradient-to-br from-[#FFEFF9] to-white p-8 md:p-12 rounded-2xl shadow-lg"
          >
            {/* Logo at the top */}
            <div className="flex justify-center mb-6">
              <img
                src={azizGroupLogo}
                alt="Aziz Group"
                loading="lazy"
                decoding="async"
                width="192"
                height="64"
                className="w-auto h-12! md:h-16! object-contain"
              />
            </div>

            <h3 className="text-2xl font-bold text-[#222222] mb-8 text-center">
              Aziz Group of Industries comprises
            </h3>
            <div className="space-y-6">
              {companies.map((division, divIndex) => (
                <motion.div
                  key={divIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + divIndex * 0.15 }}
                  className="relative"
                >
                  {/* Division Header */}
                  <div className="flex items-center mb-3">
                    <div
                      className="w-3 h-3 rounded-sm mr-3 flex-shrink-0"
                      style={{ backgroundColor: division.color }}
                    ></div>
                    <h4 className="text-lg font-bold text-[#222222]">
                      {division.division}
                    </h4>
                  </div>

                  {/* Companies under division */}
                  <div className="ml-6 border-l-[3px] border-gray-400 pl-6 space-y-2">
                    {division.companies.map((company, compIndex) => (
                      <motion.div
                        key={compIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.4,
                          delay: 0.4 + divIndex * 0.15 + compIndex * 0.1,
                        }}
                        className="relative flex items-start group"
                      >
                        {/* Connecting line */}
                        <div className="absolute -left-6 top-3 w-6 h-[3px] bg-gray-400"></div>
                        <span className="text-[#666666] group-hover:text-[#222222] transition-colors duration-300 text-sm md:text-base">
                          {company}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CompanyOverview;
