import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const MissionVisionValues = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cards = [
    {
      letter: "V",
      title: "Vision",
      description:
        "To serve as a transformative agent of positive change for our stakeholders and the wider community by relentlessly pursuing ethical practices and sustainable values. We aim to redefine industry standards through a legacy of responsibility, ensuring that our long-term growth serves the greater good and inspires a more conscious, value-driven global marketplace.",
      gradient: "from-[#ED028C] to-[#FF8ACE]",
      border: "border-[#ED028C]",
    },
    {
      letter: "M",
      title: "Mission",
      description:
        "To build the Company on sound value systems, being steadfast on all commitments and striving to achieve excellence in productivity, quality and efficiency, creating an ecosystem that encourages positivity amongst all stakeholders and is a harbinger for growth.",
      gradient: "from-[#00AEEF] to-[#0095CC]",
      border: "border-[#00AEEF]",
    },
    {
      letter: "V",
      title: "Values",
      description:
        "Our foundation is built upon the pillars of Commitment, Integrity, and Honesty, which guide every decision we make. We believe in the power of Nurture and Care to foster a supportive environment, while Respect forms the basis of our interactions. By choosing to Innovate and Excel, we ensure that our collective efforts deliver exceptional results and lasting impact.",
      gradient: "from-[#FF8ACE] to-[#FFEFF9]",
      border: "border-[#FF8ACE]",
      textColor: "text-[#ED028C]",
    },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`card-hover bg-white p-8 rounded-2xl shadow-lg border-2 ${card.border}`}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-6`}
              >
                <span
                  className={`text-3xl ${card.textColor || "text-white"} font-bold`}
                >
                  {card.letter}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#222222] mb-4">
                {card.title}
              </h3>
              <p className="text-[#666666] leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionValues;
