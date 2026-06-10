import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FloatingCartButton = () => {
  const { cartItems, openCart } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
          className="fixed right-5 bottom-24 z-40 sm:bottom-28" // positioned above WhatsApp button
        >
          <button
            onClick={openCart}
            className="relative w-14 h-14 bg-gradient-to-br from-[#00AEEF] to-[#0095CC] text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
            aria-label="Open Cart"
          >
            <FaShoppingCart className="text-2xl group-hover:animate-pulse" />
            
            <motion.div 
              key={itemCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-[#ED028C] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white"
            >
              {itemCount}
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartButton;
