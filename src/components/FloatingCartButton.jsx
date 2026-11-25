'use client';

import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";

// CSS-only animation (no framer-motion) so this always-mounted button adds no heavy JS.
const FloatingCartButton = () => {
  const { cartItems, openCart } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div
      aria-hidden={itemCount === 0}
      className={`hidden md:block fixed right-5 bottom-24 z-40 sm:bottom-28 transition-all duration-300 ease-out ${
        itemCount > 0 ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none invisible opacity-0 scale-90 translate-y-12"
      }`}
    >
      <button
        onClick={openCart}
        tabIndex={itemCount > 0 ? 0 : -1}
        className="relative w-14 h-14 bg-gradient-to-br from-[#00AEEF] to-[#0095CC] text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        aria-label="Open Cart"
      >
        <FaShoppingCart className="text-2xl group-hover:animate-pulse" />
        <span
          key={itemCount}
          className="cart-badge-pop absolute -top-2 -right-2 bg-[#C70275] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white"
        >
          {itemCount}
        </span>
      </button>
    </div>
  );
};

export default FloatingCartButton;
