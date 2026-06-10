import { FaGift, FaBoxOpen, FaTruck, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const OffersPackagingSection = () => {
  const currentOffers = [
    {
      id: 1,
      title: "Bulk Order Discount",
      discount: "Up to 20% Off",
      description:
        "Special pricing for large quantity orders. Perfect for wholesalers and distributors.",
      icon: <FaGift className="text-4xl text-[#ED028C]" />,
      image: "bulk-order-offer.jpg", // Placeholder
    },
    {
      id: 2,
      title: "Export Packages",
      discount: "Competitive Rates",
      description:
        "Customized export packaging solutions with international shipping support.",
      icon: <FaTruck className="text-4xl text-[#00AEEF]" />,
      image: "export-package-offer.jpg", // Placeholder
    },
    {
      id: 3,
      title: "Premium Quality",
      discount: "Best Value",
      description:
        "Get premium certified products at competitive prices with quality assurance.",
      icon: <FaStar className="text-4xl text-[#ED028C]" />,
      image: "premium-quality-offer.jpg", // Placeholder
    },
  ];

  const packagingSolutions = [
    {
      title: "Custom Packaging",
      description:
        "Tailored packaging solutions to meet your specific requirements and branding needs.",
      image: "custom-packaging.jpg",
    },
    {
      title: "Bulk Packaging",
      description:
        "Efficient bulk packaging for large orders with secure and cost-effective solutions.",
      image: "bulk-packaging.jpg",
    },
    {
      title: "Export Packaging",
      description:
        "International standard packaging ensuring safe delivery across borders.",
      image: "export-packaging.jpg",
    },
    {
      title: "Retail Packaging",
      description:
        "Eye-catching retail packaging designed to enhance product appeal and shelf presence.",
      image: "retail-packaging.jpg",
    },
  ];

  return (
    <section id="offers-packaging" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Current Offers Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
              Special Offers
            </h2>
            <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
              Current Offers & Promotions
            </h3>
            <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8"></div>
            <p className="text-[#666666] text-lg max-w-3xl mx-auto">
              Take advantage of our limited-time offers and special pricing
              packages designed to deliver maximum value for your business.
            </p>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {currentOffers.map((offer) => (
              <div
                key={offer.id}
                className="card-hover bg-gradient-to-br from-white to-[#FFEFF9] rounded-2xl p-8 border-2 border-[#E0E0E0] text-center group"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {offer.icon}
                </div>

                {/* Discount Badge */}
                <div className="inline-block bg-[#ED028C] text-white px-6 py-2 rounded-full font-bold text-lg mb-4">
                  {offer.discount}
                </div>

                <h4 className="text-[#222222] text-2xl font-bold mb-4">
                  {offer.title}
                </h4>
                <p className="text-[#666666] leading-relaxed mb-6">
                  {offer.description}
                </p>

                {/* Image Placeholder */}
                <div className="h-48 bg-gray-500 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <FaBoxOpen className="text-4xl text-white mx-auto mb-2" />
                    <p className="text-sm text-white">📷 {offer.image}</p>
                  </div>
                </div>

                <Link
                  to="/contact"
                  className="inline-block w-full bg-[#00AEEF] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0095CC] transition-all duration-300 active:scale-95"
                >
                  Get This Offer
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging Solutions Section */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-[#00AEEF] text-lg font-semibold mb-2 uppercase tracking-wide">
              Packaging Solutions
            </h2>
            <h3 className="text-[#222222] text-4xl md:text-5xl font-bold mb-6">
              Comprehensive Packaging Services
            </h3>
            <div className="w-24 h-1 bg-[#ED028C] mx-auto mb-8"></div>
            <p className="text-[#666666] text-lg max-w-3xl mx-auto">
              Professional packaging solutions tailored to your needs, ensuring
              product safety, compliance with international standards, and
              enhanced brand presentation.
            </p>
          </div>

          {/* Packaging Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packagingSolutions.map((solution, index) => (
              <div
                key={index}
                className="card-hover bg-white rounded-xl overflow-hidden border-2 border-[#E0E0E0] group"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-500 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <FaBoxOpen className="text-4xl text-white mx-auto mb-2" />
                    <p className="text-xs text-white px-4">
                      📷 {solution.image}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-[#222222] text-xl font-bold mb-3">
                    {solution.title}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-white text-3xl md:text-4xl font-bold mb-6">
              Need Custom Packaging Solutions?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto">
              Our expert team can design and deliver packaging solutions that
              perfectly match your product requirements and brand identity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-[#F9F9F9] transition-all duration-300"
              >
                Request Quote
              </Link>
              <a
                href="tel:+92915202890"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#00AEEF] transition-all duration-300"
              >
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OffersPackagingSection;
