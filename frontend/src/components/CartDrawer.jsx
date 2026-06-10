import React from 'react';
import { useCart } from '../context/CartContext';
import { colors } from '../theme';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout?type=cart');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#E0E0E0]">
          <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>Your Cart</h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} style={{ color: colors.text.secondary }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <Trash2 size={32} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Your cart is empty</h3>
                <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={closeCart}
                className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold border-2 border-[#00AEEF] text-[#00AEEF] hover:bg-[#F0FAFF] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-[#E0E0E0] rounded-xl bg-gray-50/50">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.itemType === 'promotion' ? item.promotionTitle : item.productTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      Img
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm line-clamp-2" style={{ color: colors.text.primary }}>
                        {item.itemType === 'promotion' ? item.promotionTitle : (item.brandName ? item.brandName : item.productTitle)}
                      </h4>
                      <button onClick={() => removeFromCart(idx)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.itemType !== 'promotion' && (
                      <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>Variant: {item.selectedVariant}</p>
                    )}
                    {item.price > 0 && <p className="text-xs font-semibold mt-1" style={{ color: colors.text.primary }}>Rs. {item.price}</p>}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-[#E0E0E0] rounded-lg bg-white">
                      <button 
                        onClick={() => updateQuantity(idx, -1)}
                        className="p-1 hover:bg-gray-50 rounded-l-lg transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(idx, 1)}
                        className="p-1 hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 md:p-6 border-t border-[#E0E0E0] bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-600">Subtotal</span>
              <span className="font-bold text-lg" style={{ color: colors.text.primary }}>
                Rs. {cartTotal.toLocaleString()}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-full text-white font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] hover:shadow-lg transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
