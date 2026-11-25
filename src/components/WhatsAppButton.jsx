'use client';

import { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsAppButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const phoneNumber = '923018117666'; // Format: country code + number without spaces or special chars

  const handleChatClick = () => {
    const message = encodeURIComponent('Hello! I would like to get in touch.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-8 md:right-8 z-50">
      {/* CSS transitions instead of framer-motion: keeps ~40 KB of JS off every page. */}
      <div
        aria-hidden={!isMenuOpen}
        className={`absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-4 w-64 border border-gray-100 origin-bottom-right transition-all duration-300 ${
          isMenuOpen ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none invisible opacity-0 translate-y-5 scale-90"
        }`}
      >
            <div className="mb-3">
              <h3 className="text-lg font-bold text-[#222222] mb-1">Chat with us!</h3>
              <p className="text-sm text-[#666666]">We're here to help</p>
            </div>
            
            <button
              onClick={handleChatClick}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaWhatsapp className="text-xl" />
              <span>Start Chat on WhatsApp</span>
            </button>

            <div className="mt-3 text-center">
              <p className="text-xs text-[#666666]">0301 8117666</p>
            </div>
      </div>

      {/* Main WhatsApp Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:rotate-[360deg] active:scale-95"
        aria-label="WhatsApp Chat"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? (
          <FaTimes className="text-3xl" />
        ) : (
          <FaWhatsapp className="text-3xl" />
        )}
      </button>

      {/* Pulse Animation Ring */}
      {!isMenuOpen && (
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
      )}
    </div>
  );
};

export default WhatsAppButton;
