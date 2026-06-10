import { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-4 w-64 border border-gray-100"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp Button */}
      <motion.button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        aria-label="WhatsApp Chat"
      >
        {isMenuOpen ? (
          <FaTimes className="text-3xl" />
        ) : (
          <FaWhatsapp className="text-3xl" />
        )}
      </motion.button>

      {/* Pulse Animation Ring */}
      {!isMenuOpen && (
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
      )}
    </div>
  );
};

export default WhatsAppButton;
