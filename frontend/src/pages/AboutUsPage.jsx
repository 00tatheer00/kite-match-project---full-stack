import chairmanImg from "../assets/people/chairman.jpg";
import ceoImg from "../assets/people/ceo.jpeg";
import waleedImg from "../assets/people/waleed.jpg";
import azizgrp from "../assets/azizgrp.jpg";
import founder from "../assets/people/founder.jpeg";

// Import logos
import senateImg from "../assets/logos/senate.png";
import sbpImg from "../assets/logos/sbp.png";
import hblImg from "../assets/logos/hbl.png";
import pplImg from "../assets/logos/ppl.png";
import pakpImg from "../assets/logos/pakp.png";
import scciImg from "../assets/logos/scci.png";
import aptmaImg from "../assets/logos/aptma.png";
import lseImg from "../assets/logos/lse.png";
import hcskImg from "../assets/logos/hcsk.png";
import akcsImg from "../assets/logos/akcs.png";
import ntuImg from "../assets/logos/ntu.png";
import unicefImg from "../assets/logos/unicef.png";
import eoImg from "../assets/logos/eo.png";
import wisconsinImg from "../assets/logos/wisconsin.webp";
import lumsImg from "../assets/logos/lums.png";
import tobaccoImg from "../assets/logos/tobacco.png";

// Import new components
import HeroSection from "../components/about/HeroSection";
import CompanyOverview from "../components/about/CompanyOverview";
import FounderSection from "../components/about/FounderSection";
import MissionVisionValues from "../components/about/MissionVisionValues";
import Timeline from "../components/about/Timeline";
import LeaderProfile from "../components/about/LeaderProfile";
import MembershipAchievements from "../components/about/MembershipAchievements";
import SeoHead from "../components/seo/SeoHead";

const AboutUsPage = () => {
  const timeline = [
    {
      year: "1974",
      event:
        "Mohsin Match Factory Pvt. Ltd.",
    },
    {
      year: "1990",
      event: "Mohsin Enterprises Pvt. Ltd.",
    },
    {
      year: "1995",
      event: "Started Exporting Safety Matches - Pakistan's Largest Exporter",
    },
    {
      year: "2006",
      event: "AJ Match Factory Pvt. Ltd.",
    },
    {
      year: "2024",
      event: "Kite Dish Wash Bar - Rapid Market Growth with Premium Formula",
    },
    {
      year: "2025",
      event:
        "Kite Glow Detergent Launch - Premium Detergent with Triple Enzyme Technology",
    },
  ];

  const chairmanPositions = [
    {
      logo: senateImg,
      title: "Senate",
      description:
        "Senator for two terms, Senate of Pakistan, the Upper House of the Parliament. (2021-2027 & 2015 to 2021)",
    },
    {
      logo: sbpImg,
      title: "SBP",
      description: "Board member of State Bank of Pakistan (2 terms)",
    },
    {
      logo: hblImg,
      title: "HBL",
      description: "Board member of Habib Bank Limited",
    },
    {
      logo: pplImg,
      title: "PPL",
      description: "Chairman Standing Committee of Petroleum.",
    },
    {
      logo: pakpImg,
      title: "PAKP",
      description:
        "Provincial Minister (Provincial Assembly Of Khyber Pakhtunkhwa) in 2002.",
    },
    {
      logo: pplImg,
      title: "PPL",
      description: "Board member Pakistan Petroleum Limited.",
    },
    {
      logo: scciImg,
      title: "SCCI",
      description: "President Sarhad Chamber of Commerce & Industry.",
    },
    {
      logo: aptmaImg,
      title: "APTMA",
      description: "Chairman All Pakistan Textile Mills Association (2 terms)",
    },
  ];

  const ceoPositions = [
    {
      logo: lseImg,
      title: "LSE",
      description:
        "Graduate of the London School of Economics (with 1st class Honors)",
    },
    {
      logo: hcskImg,
      title: "HCSK - KPK",
      description: "Honorary Consul of South Korea for KPK.",
    },
    {
      logo: scciImg,
      title: "SCCI",
      description: "President Sarhad Chamber of Commerce & Industry",
    },
    { logo: aptmaImg, title: "APTMA", description: "Vice-Chairman APTMA" },
    {
      logo: akcsImg,
      title: "AKCS-P",
      description: "Director of Agha Khan Cultural Services Pakistan",
    },
    {
      logo: ntuImg,
      title: "NTU",
      description: "Board member National Textile University.",
    },
    {
      logo: unicefImg,
      title: "UNICEF",
      description: "Member of the UNICEF Pakistan Advisory Council (UPAC).",
    },
    {
      logo: eoImg,
      title: "EO",
      description: "President & Founding Member of EO Islamabad Chapter",
    },
  ];

  const managingDirectorPositions = [
    { logo: wisconsinImg, title: "University of Wisconsin", description: "" },
    { logo: tobaccoImg, title: "Pakistan Tobacco Company", description: "" },
    {
      logo: lumsImg,
      title: "LUMS",
      description: "MBA Degree from LUMS, awarded the Bronze Medal",
    },
  ];

  const companies = [
    {
      division: "FMCG Division",
      color: "#00AEEF",
      companies: [
        "Mohsin Match Factory (Pvt.) Ltd.",
        "A.J Match Factory (Pvt.) Ltd.",
        "Mohsin Enterprises (Pvt.) Ltd.",
        "Aziz Ice Factory and Cold Storage",
      ],
    },
    {
      division: "Board Division",
      color: "#ED028C",
      companies: ["Premier Formica"],
    },
    {
      division: "Textile Division",
      color: "#00AEEF",
      companies: ["AJ Textile Mills Ltd"],
    },
    {
      division: "Real Estate Development Division",
      color: "#ED028C",
      companies: ["AJ Towers", "AJ Corporate Avenue", "Links Enterprises"],
    },
  ];

  const chairmanMessage = [
    "We at Aziz group of Industries have over several generations consistently followed the principles of hard work, commitment and perseverance, and these efforts by the grace of Allah have been rewarded for the organizations within the group which have been going from strength to strength, achieving a consistent and sturdy growth over the past several decades.",
    "Our group's core principles are based on our traditional family values of fairness, honesty, trust and commitment handed down to us by the founder of our group, my father Haji Aziz ur Rehman. These values coupled with the desire to change and innovate has led to a formulating sustainable business environment.",
    "As successful entrepreneurs and good corporate citizens, we hope to continue playing a positive role in the economic development of our society, our community and above all our beloved country Pakistan.",
  ];

  const ceoMessage = [
    "We at Aziz Group of Industries believe in striving to achieve the very best, by learning from others and challenging ourselves to struggle for excellence. We strongly believe in attention to details and to evolve our organization for the advancement of all stakeholders by innovating and improving our systems, services and quality of our products.",
    "Our journey started in the 1950's. Now Alhamdullilah the group comprises the largest safety match manufacturing operation in Pakistan, one of the largest textile-spinning mills in the country, a sizable particle and MDF board division, cold storages and a multipurpose real estate project in Islamabad.",
    "Today each of our businesses are cultivating a spirit of enterprise starting with the management on to all stakeholders, aspiring to achieve our vision of being a positive agent of change in our community and helping achieve new goals across a multitude of facets of life.",
  ];

  const managingDirectorMessage = [
    "Mr. Waleed brings over 20 years of experience in Marketing, Sales, and Distribution. A graduate of the University of Wisconsin–Madison and LUMS (Bronze Medal), his professional journey includes valuable experience with Pakistan Tobacco Company, shaping his expertise in structured operations and brand building.",
    "As Managing Director – FMCG Division for the past decade, Mr. Waleed leads the Kite brand with a focus on consumer needs and quality. Our flagship Kite Glow detergent (launched March 2025) has gained rapid market recognition, while Kite Dish Wash Bar and Kite Safety Matches strengthen our position as Pakistan's most trusted FMCG brand.",
    "With 10,000+ employees and presence in 40+ countries, the Kite brand continues delivering trusted everyday products to households across Pakistan and internationally.",
  ];

  return (
    <>
      <SeoHead
        title="About Kite Brand"
        description="Learn about Kite Brand and Aziz Group's legacy, leadership, manufacturing strength, and mission across FMCG and exports."
        path="/about"
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <HeroSection backgroundImage={azizgrp} />

      {/* Company Overview */}
      <CompanyOverview companies={companies} />

      {/* Founder Section */}
      <FounderSection founder={founder} />

      {/* Mission & Vision */}
      <MissionVisionValues />

      {/* Timeline */}
      <Timeline timeline={timeline} />

      {/* Chairman Section */}
      <LeaderProfile
        name="Mr. Mohsin Aziz"
        title="Chairman"
        stitle="Chairman"
        image={chairmanImg}
        message={chairmanMessage}
        positions={chairmanPositions}
        backgroundColor="bg-white"
        imagePosition="left"
        accentColor="#00AEEF"
      />

      {/* CEO Section */}
      <LeaderProfile
        name="Mr. Afan Aziz"
        title="Chief Executive Officer"
        stitle="CEO"
        image={ceoImg}
        message={ceoMessage}
        positions={ceoPositions}
        backgroundColor="bg-gray-50"
        imagePosition="right"
        accentColor="#00AEEF"
      />

      {/* Managing Director FMCG Division Section */}
      <LeaderProfile
        name="Mr. Waleed Elahi"
        title="Managing Director"
        stitle="MD"
        imgcls="object-[center_30%]!"
        image={waleedImg}
        message={managingDirectorMessage}
        positions={managingDirectorPositions}
        backgroundColor="bg-white"
        imagePosition="left"
        accentColor="#00AEEF"
      />

      {/* Membership & Achievements - Commented Out */}
        {/* <MembershipAchievements /> */}
      </div>
    </>
  );
};

export default AboutUsPage;
