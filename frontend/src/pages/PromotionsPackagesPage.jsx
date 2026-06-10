import PromotionsPackagesSection from '../components/PromotionsPackagesSection';
import SeoHead from "../components/seo/SeoHead";

const PromotionsPackagesPage = () => {
  return (
    <>
      <SeoHead
        title="Promotions & Packages"
        description="Browse Kite Brand promotions and bundled packages designed for value, quality, and convenience."
        path="/promotions-packages"
      />
      <div className="min-h-screen bg-gradient-to-b from-white via-[#F9F9F9] to-white">
        <div className="relative overflow-hidden">
        {/* Hero Section */}
        {/* <div className="relative bg-gradient-to-r from-[#00AEEF] via-[#0095CC] to-[#00AEEF] py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl"
            >
              Promotions & Packages
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-lg"
            >
              Special offers and bulk packages designed to save you money
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex justify-center"
            >
              <div className="w-32 h-1 bg-[#ED028C] rounded-full"></div>
            </motion.div>
          </div>
        </div> */}
        </div>
        <PromotionsPackagesSection />
      </div>
    </>
  );
};

export default PromotionsPackagesPage;
