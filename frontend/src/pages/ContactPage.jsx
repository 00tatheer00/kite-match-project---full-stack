import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
} from "react-icons/fa";
import SeoHead from "../components/seo/SeoHead";
import StructuredData from "../components/seo/StructuredData";
import { SITE_URL } from "../utils/seo";

const ContactPage = () => {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kite Brand Pakistan",
    url: `${SITE_URL}/contact`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+92-91-5815056",
        contactType: "customer service",
        email: "info@kitepk.com",
        areaServed: "PK",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "sales@kitepk.com",
        areaServed: "PK",
      },
    ],
  };

  return (
    <>
      <SeoHead
        title="Contact Kite Brand"
        description="Get in touch with Kite Brand for FMCG product inquiries, export opportunities, and business partnerships."
        path="/contact"
      />
      <StructuredData data={contactSchema} />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact Information
            </h1>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* FMCG Division Head Office */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              FMCG Division
            </h2>

            {/* FMCG Division Head Office */}
            <div className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    FMCG Head Office
                  </h3>
                  <div className="text-white/95 space-y-2">
                    <p className="flex items-start">
                      <FaMapMarkerAlt className="mr-3 mt-1 flex-shrink-0" />
                      <span>
                        Industrial Estate, Old Jamrud Road, Peshawar, Pakistan
                      </span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="mr-3 flex-shrink-0" />
                      <span>Tel. No: +92-91-5815056, 5815057</span>
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="mr-3 flex-shrink-0" />
                      <a
                        href="mailto:info@kitepk.com"
                        className="text-white! visited:text-white! hover:text-white/90 transition-colors"
                      >
                        E-Mail: info@kitepk.com
                      </a>
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="mr-3 flex-shrink-0" />
                      <a
                        href="mailto:sales@kitepk.com"
                        className="text-white! visited:text-white! hover:text-white/90 transition-colors"
                      >
                        E-Mail: sales@kitepk.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mohsin Match Factory */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#00AEEF] mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-[#00AEEF] w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#222222] mb-3">
                    Mohsin Match Factory Pvt. Ltd.
                  </h3>
                  <p className="text-sm text-[#00AEEF] font-semibold mb-3">
                    Earliest Private Sector Match Manufacturer in KPK
                  </p>
                  <div className="text-[#666666] space-y-2">
                    <p className="flex items-start">
                      <FaMapMarkerAlt className="text-[#ED028C] mr-3 mt-1 flex-shrink-0" />
                      <span>
                        Industrial Estate, Old Jamrud Road, Peshawar, Pakistan
                      </span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="text-[#ED028C] mr-3 flex-shrink-0" />
                      <span>Tel. No: +92-91-5817787, 5817795</span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="text-[#ED028C] mr-3 flex-shrink-0" />
                      <span>Fax No: +92-91-5837648</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* A.J Match Factory */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#0095CC] mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-[#0095CC] w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#222222] mb-3">
                    A.J Match Factory Pvt. Ltd.
                  </h3>
                  <p className="text-sm text-[#0095CC] font-semibold mb-3">
                    Sheikhupura Manufacturing Unit
                  </p>
                  <div className="text-[#666666] space-y-2">
                    <p className="flex items-start">
                      <FaMapMarkerAlt className="text-[#ED028C] mr-3 mt-1 flex-shrink-0" />
                      <span>
                        Mill Address: 26 KM Lahore Sheikhupura Road, Distt
                        Sheikhupura, Pakistan
                      </span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="text-[#ED028C] mr-3 flex-shrink-0" />
                      <span>Tel. No: +92-42-37332711-12</span>
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="text-[#ED028C] mr-3 flex-shrink-0" />
                      <a
                        href="mailto:aj.match@azizgrp.com"
                        className="hover:text-[#00AEEF] transition-colors underline-none!"
                      >
                        E-Mail: aj.match@azizgrp.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mohsin Enterprises */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#00AEEF] mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-[#00AEEF] w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#222222] mb-3">
                    Mohsin Enterprises Pvt. Ltd.
                  </h3>
                  <p className="text-sm text-[#00AEEF] font-semibold mb-3">
                    Detergent and DishWash Bar Manufacturing Unit
                  </p>
                  <div className="text-[#666666] space-y-2">
                    <p className="flex items-start">
                      <FaMapMarkerAlt className="text-[#ED028C] mr-3 mt-1 flex-shrink-0" />
                      <span>
                        Address: W-21, 22 Industrial Estate, Jamrud Road,
                        Hayatabad, Peshawar
                      </span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="text-[#ED028C] mr-3 flex-shrink-0" />
                      <span>Tel. No: +92 91 5817416-17</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Divisions */}
          {/* <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Other Business Units
            </h2>
            <div className="grid md:grid-cols-2 gap-6"> */}
          {/* Premier Formica */}
          {/* <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-[#222222] mb-3">Premier Formica</h3>
                <div className="text-sm text-[#666666] space-y-2">
                  <p className="flex items-start">
                    <FaMapMarkerAlt className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Address: 92-E, Industrial Estate, Jamrud Road, Peshawar, Pakistan</span>
                  </p>
                  <p className="flex items-start">
                    <FaPhone className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Tel. No: +92-(0)91-5813051, 5817785, 5815057</span>
                  </p>
                  <p className="flex items-start">
                    <FaPhone className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Fax No: +92-(0)91-5812787</span>
                  </p>
                  <p className="flex items-start">
                    <FaEnvelope className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <a href="mailto:formica@azizgrp.net.pk" className="hover:text-[#00AEEF] transition-colors">
                      E-Mail: formica@azizgrp.net.pk
                    </a>
                  </p>
                </div>
              </div> */}

          {/* A.J Textile Mills */}
          {/* <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-[#222222] mb-3">A.J Textile Mills Limited</h3>
                <div className="text-sm text-[#666666] space-y-2">
                  <p className="flex items-start">
                    <FaMapMarkerAlt className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Mill Address: Plot No 209 Industrial Estate, Gadoon Amazai, Swabi-Pakistan</span>
                  </p>
                  <p className="flex items-start">
                    <FaPhone className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Tel. No: +92-(0)938-270109, 270093, 270603</span>
                  </p>
                  <p className="flex items-start">
                    <FaPhone className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Fax No: +92-(0)938-270201</span>
                  </p>
                  <p className="flex items-start">
                    <FaEnvelope className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <a href="mailto:ajtm.gdn@azizgrp.com" className="hover:text-[#00AEEF] transition-colors">
                      E-Mail: ajtm.gdn@azizgrp.com
                    </a>
                  </p>
                </div>
              </div> */}

          {/* AJ Towers */}
          {/* <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 md:col-span-2">
                <h3 className="text-xl font-bold text-[#222222] mb-3">AJ Towers</h3>
                <div className="text-sm text-[#666666] space-y-2">
                  <p className="flex items-start">
                    <FaMapMarkerAlt className="text-[#00AEEF] mr-2 mt-1 flex-shrink-0" />
                    <span>Address: Plot No. 6, Main Expressway, Gulberg Green, Islamabad</span>
                  </p>
                  <p className="flex items-center">
                    <FaPhone className="text-[#00AEEF] mr-2 flex-shrink-0" />
                    <span>Cell No: +92 311 333 5550</span>
                  </p>
                  <p className="flex items-center">
                    <FaEnvelope className="text-[#00AEEF] mr-2 flex-shrink-0" />
                    <a href="mailto:info@ajtowers.com" className="hover:text-[#00AEEF] transition-colors">
                      E-Mail: info@ajtowers.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Business Hours */}
          <div className="mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center">
              <div className="bg-[#00AEEF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-[#222222] mb-4">
                Business Hours
              </h3>
              <div className="space-y-2 text-[#666666]">
                <p className="text-lg">
                  <strong className="text-[#222222]">Monday - Saturday:</strong>{" "}
                  9:00 AM - 5:00 PM
                </p>
                <p className="text-lg">
                  <strong className="text-[#222222]">Sunday:</strong> Closed
                </p>
              </div>
            </div>
          </div>

          {/* Google Map - Peshawar Head Office */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-8 text-center">
              Find Us on the Map
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13232.858554352488!2d71.41792789616898!3d33.98702021911197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9105461e898f5%3A0xb2fcd597d83cf69a!2sMohsin%20Match%20Factory%20Pvt%20Ltd!5e0!3m2!1sen!2s!4v1771568110439!5m2!1sen!2s"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FMCG Division Head Office - Industrial Estate, Peshawar"
                className="w-full h-[320px] sm:h-[400px] md:h-[500px]"
              ></iframe>
            </div>
            <p className="text-center text-[#666666] mt-4 text-sm">
              90-B Industrial estate, Jamrud Road, Hayatabad, Peshawar, Khyber
              Pakhtunkhwa, Peshawar, Pakistan, 25000
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Connect with Kite Brand?
          </h2>
          <p className="text-xl text-text-white mb-8 max-w-2xl mx-auto">
            Contact us for product inquiries, bulk orders, private labeling, or
            export opportunities
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/+923018117666"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              <FaPhone className="inline mr-2" />
              Call FMCG Division
            </a>
            <a
              href="mailto:info@kitepk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#00AEEF] transition-all duration-300 active:scale-95"
            >
              <FaEnvelope className="inline mr-2" />
              Email: info@kitepk.com
            </a>
            <a
              href="mailto:sales@kitepk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#00AEEF] transition-all duration-300 active:scale-95"
            >
              <FaEnvelope className="inline mr-2" />
              Email: sales@kitepk.com
            </a>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default ContactPage;
