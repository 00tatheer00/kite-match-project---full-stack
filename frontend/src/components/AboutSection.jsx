import { FaUsers, FaIndustry, FaGlobeAsia, FaAward } from "react-icons/fa";
import chairman from "../assets/people/chairman.jpg";
import ceo from "../assets/people/ceo.jpeg";
import aziz_group_logo from "../assets/ajlogo.png";
import waleed from "../assets/people/waleed.jpg";

const AboutSection = () => {
  const leaders = [
    {
      id: 1,
      name: "Mr. Mohsin Aziz",
      title: "Chairman",
      image: chairman,
      className:
        "h-[24rem]! md:h-[27rem]! lg:h-84! scale-100! group-hover:scale-105! transition-transform duration-500! object-center sm:object-[20%_5%]!",
      bio: "Senator in the Senate of Pakistan (2021-2027 & 2015-2021). Chairman of the Senate Standing Committee on Power. Former Director on the Board of the State Bank of Pakistan (2 terms), board member at HBL and PPL. Chairman of APTMA (2 terms) and President of Sarhad Chamber of Commerce & Industry.",
    },
    {
      id: 2,
      name: "Mr. Afan Aziz",
      title: "CEO",
      image: ceo,
      className:
        "h-[24rem]! md:h-[27rem]! lg:h-84! scale-105! group-hover:scale-110! transition-transform duration-500! object-center sm:object-[20%_4%]!",
      bio: "Leads the Textile and Real Estate Divisions. Graduate of the London School of Economics (First Class Honours). Honorary Consul of South Korea for KPK. Member of UNICEF Pakistan Advisory Council. President of Sarhad Chamber (2011-12), Vice President of APTMA.",
    },
    {
      id: 3,
      name: "Mr. Waleed Elahi",
      title: "Managing Director - FMCG",
      image: waleed,
      className:
        "h-[24rem]! md:h-[27rem]! lg:h-84! scale-120! group-hover:scale-125! transition-transform duration-500! object-center sm:object-[50%_25%]!",
      bio: "Over 20 years in Marketing, Sales, and Distribution. MD of FMCG Division for 10 years. Graduate of University of Wisconsin-Madison; MBA from LUMS (Bronze Medalist). Previous experience with Pakistan Tobacco Company.",
    },
  ];

  const stats = [
    {
      icon: <FaAward className="text-5xl text-[#ED028C]" />,
      number: "50+",
      label: "Years Legacy",
    },
    {
      icon: <FaUsers className="text-5xl text-[#00AEEF]" />,
      number: "10,000+",
      label: "Employees",
    },
    {
      icon: <FaIndustry className="text-5xl text-[#ED028C]" />,
      number: "#1",
      label: "Match Exporter",
    },
    {
      icon: <FaGlobeAsia className="text-5xl text-[#00AEEF]" />,
      number: "40+",
      label: "Export Countries",
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
            About Us
          </h2>
          <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
            Kite - FMCG Excellence
          </h3>
          <p className="text-[#666666] text-xl max-w-3xl mx-auto mb-4">
            Part of Aziz Group of Industries
          </p>
          <img
            src={aziz_group_logo}
            className="w-36 h-24 sm:w-44 sm:h-32 md:w-48 md:h-36 mx-auto mt-3 mb-6 object-contain"
            alt="Aziz Group of Industries"
            loading="lazy"
            decoding="async"
            width="192"
            height="144"
          />
          <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8"></div>
        </div>

        {/* Company Description */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-[#FFEFF9] to-white p-8 md:p-12 rounded-2xl border-2 border-[#FF8ACE] shadow-lg hover:shadow-2xl transition-all duration-300">
            <p className="text-[#222222] text-lg leading-relaxed mb-6">
              <span className="font-bold text-[#222222] text-2xl">
                Kite Brand
              </span>{" "}
              represents the pinnacle of FMCG excellence under
              <span className="font-bold text-[#222222]">
                {" "}
                Mohsin Match Factory (Pvt.) Limited
              </span>
              , part of the Aziz Group of Industries. With{" "}
              <span className="font-bold">
                over 50 years of manufacturing excellence
              </span>{" "}
              since 1974, we have become
              <span className="font-bold text-[#222222]">
                {" "}
                Pakistan's largest safety match manufacturer and exporter
              </span>
              .
            </p>
            <p className="text-[#222222] text-lg leading-relaxed mb-6">
              Our{" "}
              <span className="font-bold text-[#222222]">
                Kite Glow detergent
              </span>
              , launched in 2025, has rapidly gained market recognition due to
              its{" "}
              <span className="font-bold">
                exceptional cleaning power, superior stain removal, and fabric
                care
              </span>
              . Complementing{" "}
              <span className="font-bold text-[#222222]">Kite Glow</span>,{" "}
              <span className="text-[#222222]">BURQ Action</span> caters to our
              mid-tier market segment.
            </p>
            <p className="text-[#222222] text-lg leading-relaxed mb-6">
              <span className="font-bold text-[#222222]">
                Kite Dish Wash Bar
              </span>{" "}
              has rapidly achieved good market growth due to its
              <span className="font-bold">
                {" "}
                premium fragrance, advanced cleaning formulation, and slow water
                dissolution
              </span>{" "}
              that not only matches but beats market leaders while maintaining
              competitive pricing.
            </p>
            <p className="text-[#222222] text-lg leading-relaxed">
              We employ{" "}
              <span className="font-bold text-[#222222]">
                over 10,000 employees
              </span>{" "}
              across the nation and export to
              <span className="font-bold text-[#222222]">
                {" "}
                over 40 countries
              </span>{" "}
              since 1995. Our Kite brand matches are renowned for being{" "}
              <span className="font-bold">carborised and damp-proof</span>,
              meeting international safety standards.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-hover bg-white p-8 rounded-xl border-2 border-[#E0E0E0] text-center group"
            >
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-[#222222] text-3xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-[#666666] text-sm font-medium uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Leadership Team */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-[#222222] text-3xl md:text-4xl font-bold mb-4">
              Our Leadership
            </h3>
            <p className="text-[#666666] text-lg max-w-3xl mx-auto">
              Meet the visionary leaders driving our brand's success and FMCG
              excellence
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {leaders.map((leader) => (
              <div
                key={leader.id}
                className="card-hover bg-white rounded-2xl overflow-hidden border-2 border-[#E0E0E0] group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    loading="lazy"
                    decoding="async"
                    width="480"
                    height="600"
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 aspect-[4/5] sm:aspect-[3/4] ${leader.className}`}
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /> */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <h4 className="text-text-white text-2xl font-bold mb-1 drop-shadow-lg">
                      {leader.name}
                    </h4>
                    <p className="text-text-white text-lg font-semibold drop-shadow-lg">
                      {leader.title}
                    </p>
                  </div>
                </div>
                <div className="h-full text-justify p-6 bg-gradient-to-br from-white to-[#FFEFF9]">
                  <p className="text-[#666666] leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        {/* <div className="mt-20 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            Our Mission & Vision
          </h3>
          <p className="text-text-white-90 text-lg max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            We are committed to excellence in FMCG manufacturing and
            distribution, providing quality Kite brand products to households
            and businesses. Our vision is to make Kite the most trusted
            household brand in Pakistan and continue expanding our global
            presence, always maintaining our core values of quality, integrity,
            innovation, and customer satisfaction.
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default AboutSection;
