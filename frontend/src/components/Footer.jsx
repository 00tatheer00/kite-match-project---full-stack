import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { Link } from "react-router-dom";
import AJMatch from "../assets/divisions/ajmatch.png";
import MohsinEnterprises from "../assets/divisions/MohsinEnterprises.png";
import MohsinMatch from "../assets/divisions/MohsinMatch.png";

const Footer = () => {
  const primaryEmails = ["info@kitepk.com", "sales@kitepk.com"];
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Export", href: "/export/safety-matches" },
  ];

  const companyLogos = [
    {
      name: "Mohsin Match Factory - Peshawar",
      logo: MohsinMatch,
      alt: "Kite Brand",
    },
    {
      name: "A.J Match Factory",
      logo: AJMatch,
      alt: "Mohsin Match Factory",
    },
    {
      name: "Mohsin Enterprises - Hayatabad, Peshawar",
      logo: MohsinEnterprises,
      alt: "Mohsin Enterprises",
    },
  ];

  const contactInfo = [
    {
      title: "FMCG Division Head Office",
      address: "Industrial Estate, Old Jamrud Road, Peshawar, Pakistan",
      phone: "+92 91 5815056, 5815057",
      // email: "fd@kitematchpk.com",
      isHeadquarter: true,
    },
    {
      title: "Export Department",
      address: "Industrial Estate, Old Jamrud Road, Peshawar, Pakistan",
      phone: "+92 300 8592829",
      email: "match.export@azizgrp.com",
    },
    {
      title: "Mohsin Match Factory Pvt. Ltd.",
      address: "90-B, Industrial Estate, Old Jamrud Road, Peshawar, Pakistan",
      phone: "+92 91 5812787, 5812785",
      fax: "+92 91 5837646",
      // email: "fd@kitematchpk.com",
    },
    {
      title: "A.J Match Factory Pvt. Ltd.",
      address:
        "Mill Address: 26 KM Lahore Sheikhupura Road, Distt Sheikhupura Pakistan",
      phone: "+92 42 37332711-12",
      email: "aj.match@azizgrp.com",
    },
    {
      title: "Mohsin Enterprises Pvt. Ltd.",
      address: "W-21, 22 Industrial Estate, Jumrud Road, Hayatabad Peshawar",
      phone: "+92 91 5817416-17",
      // email: "fd@kitematchpk.com",
    },
  ];

  return (
    <footer className="bg-[#222222] text-white">
      {/* Company Logos Section */}
      <div className="bg-[#1a1a1a] border-b border-white/10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-center justify-center justify-items-center">
            {companyLogos.map((company, index) => (
              <div
                key={index}
                className="bg-white hover:bg-white/60 p-3 md:p-4 rounded-lg transition-all duration-300 w-full flex items-center justify-center min-h-[74px] md:min-h-[88px]"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  loading="lazy"
                  decoding="async"
                  width="224"
                  height="56"
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl flex flex-col gap-6 mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[#00AEEF]">
              Kite Brand
            </h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Pakistan's most trusted FMCG brand under Mohsin Match Factory.
              Premium detergents, safety matches, and dish wash products - over
              50 years of manufacturing excellence.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/kitematchpk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kite Brand on Facebook"
                className="bg-white/10 hover:bg-[#1877F2] p-3 rounded-full transition-all duration-300 active:scale-90 group w-12 h-12 flex items-center justify-center"
              >
                <FaFacebook className="text-lg text-white group-hover:text-white" />
              </a>
              <a
                href="https://www.instagram.com/kitematch/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kite Brand on Instagram"
                className="bg-white/10 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F56040] p-3 rounded-full transition-all duration-300 active:scale-90 group w-12 h-12 flex items-center justify-center"
              >
                <FaInstagram className="text-lg text-white group-hover:text-white" />
              </a>
              <a
                href="https://www.youtube.com/@kitematch"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kite Brand on YouTube"
                className="bg-white/10 hover:bg-[#FF0000] p-3 rounded-full transition-all duration-300 active:scale-90 group w-12 h-12 flex items-center justify-center"
              >
                <FaYoutube className="text-lg text-white group-hover:text-white" />
              </a>
              <a
                href="https://www.tiktok.com/@houseofkite"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kite Brand on TikTok"
                className="bg-white/10 hover:bg-black p-3 rounded-full transition-all duration-300 active:scale-90 group w-12 h-12 flex items-center justify-center"
              >
                <FaTiktok className="text-lg text-white group-hover:text-[#00F2EA]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="">
            <h3 className="text-xl font-bold mb-6 text-[#00AEEF]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-[#00AEEF] transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-[#00AEEF] rounded-full mr-3 group-hover:bg-[#0095CC] transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6 text-[#00AEEF]">
              Contact Us
            </h3>
            <div className="bg-white/5 p-4 rounded-lg border border-[#00AEEF]/20 mb-4">
              <h4 className="text-white font-semibold mb-2 text-sm uppercase tracking-wide">
                Email Contacts
              </h4>
              <ul className="space-y-2 text-sm">
                {primaryEmails.map((email) => (
                  <li key={email} className="flex items-center">
                    <FaEnvelope className="text-[#00AEEF] mr-3 flex-shrink-0" />
                    <a
                      href={`mailto:${email}`}
                      className="text-white/80 hover:text-[#00AEEF] transition-colors break-all"
                    >
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              {/* FMCG Headquarters - Full Width */}
              {contactInfo
                .filter((info) => info.isHeadquarter)
                .map((info, index) => (
                  <div
                    key={index}
                    className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-all duration-300 border border-[#00AEEF]/30"
                  >
                    <h4 className="text-white font-bold mb-3 text-lg">
                      {info.title}
                    </h4>
                    <ul className="space-y-2 text-sm flex flex-wrap justify-between gap-4">
                      <li className="flex items-start">
                        <FaMapMarkerAlt className="text-[#00AEEF] mt-1 mr-3 flex-shrink-0" />
                        <span className="text-white/80">{info.address}</span>
                      </li>
                      <li className="flex items-center">
                        <FaPhone className="text-[#00AEEF] mr-3 flex-shrink-0" />
                        <a
                          href={`tel:${info.phone.replace(/[^0-9+]/g, "")}`}
                          className="text-white/80 hover:text-[#00AEEF] transition-colors"
                        >
                          {info.phone}
                        </a>
                      </li>
                      {/* <li className="flex items-center">
                        <FaEnvelope className="text-[#00AEEF] mr-3 flex-shrink-0" />
                        <a
                          href={`mailto:${info.email}`}
                          className="text-white/80 hover:text-[#00AEEF] transition-colors"
                        >
                          {info.email}
                        </a>
                      </li> */}
                    </ul>
                  </div>
                ))}

              {/* Other Contact Locations - Three Column Grid */}
            </div>
          </div>
        </div>
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo
              .filter((info) => !info.isHeadquarter)
              .map((info, index) => (
                <div
                  key={index}
                  className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <h4 className="text-white font-bold mb-3 text-sm">
                    {info.title}
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start">
                      <FaMapMarkerAlt className="text-[#00AEEF] mt-1 mr-2 flex-shrink-0 text-xs" />
                      <span className="text-white/80">{info.address}</span>
                    </li>
                    <li className="flex items-center">
                      <FaPhone className="text-[#00AEEF] mr-2 flex-shrink-0 text-xs" />
                      <a
                        href={`tel:${info.phone.replace(/[^0-9+]/g, "")}`}
                        className="text-white/80 hover:text-[#00AEEF] transition-colors"
                      >
                        {info.phone}
                      </a>
                    </li>
                    {/* {info.fax && (
                        <li className="flex items-center">
                          <FaPhone className="text-[#00AEEF] mr-2 flex-shrink-0 text-xs" />
                          <span className="text-white/80">Fax: {info.fax}</span>
                        </li>
                      )} */}
                    {info.email && (
                      <li className="flex items-center">
                        <FaEnvelope className="text-[#00AEEF] mr-2 flex-shrink-0 text-xs" />
                        <a
                          href={`mailto:${info.email}`}
                          className="text-white/80 hover:text-[#00AEEF] transition-colors break-all"
                        >
                          {info.email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Kite Brand - Aziz Group of
              Industries. All Rights Reserved.
            </p>
            {/* <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-white/60 hover:text-[#00AEEF] text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-white/60 hover:text-[#00AEEF] text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
