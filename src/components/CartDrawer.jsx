'use client';

import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { colors } from '../theme';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from '@/components/RouterCompat';

const itemTitle = (item) =>
  item.itemType === 'promotion' ? item.promotionTitle : item.brandName || item.productTitle;

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, cartTotal, hasUnavailableItems } = useCart();
  const navigate = useNavigate();

  // Escape closes the drawer; lock page scroll while it is open.
  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout?type=cart');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform animate-slide-in-right"
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#E0E0E0]">
          <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
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
                <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>Looks like you haven&apos;t added anything yet.</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold border-2 border-[#00AEEF] text-[#00AEEF] hover:bg-[#F0FAFF] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const title = itemTitle(item);
              const lineTotal = (Number(item.price) || 0) * item.quantity;
              return (
                <div
                  key={`${item.itemType || 'product'}-${item.productId || item.promotionId}-${item.brandName || ''}-${item.selectedVariant || ''}`}
                  className={`flex gap-4 p-4 border rounded-xl ${item.unavailable ? 'border-red-200 bg-red-50/60' : 'border-[#E0E0E0] bg-gray-50/50'}`}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0">
                    {item.image ? (
                      <img src={item.image?.src || item.image} alt={title || 'Cart item'} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2" style={{ color: colors.text.primary }}>
                          {title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          aria-label={`Remove ${title || 'item'} from cart`}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {item.itemType !== 'promotion' && item.selectedVariant && (
                        <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>Variant: {item.selectedVariant}</p>
                      )}
                      {item.unavailable ? (
                        <p className="text-xs font-semibold mt-1 text-red-600">No longer available — please remove it.</p>
                      ) : (
                        item.price > 0 && (
                          <p className="text-xs font-semibold mt-1" style={{ color: colors.text.primary }}>
                            Rs. {Number(item.price).toLocaleString()}
                            {item.quantity > 1 && (
                              <span className="font-normal text-gray-500"> × {item.quantity} = Rs. {lineTotal.toLocaleString()}</span>
                            )}
                          </p>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-[#E0E0E0] rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, -1)}
                          aria-label={item.quantity <= 1 ? `Remove ${title || 'item'}` : 'Decrease quantity'}
                          className="p-1 hover:bg-gray-50 rounded-l-lg transition-colors cursor-pointer"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, 1)}
                          disabled={item.quantity >= 1000 || item.unavailable}
                          aria-label="Increase quantity"
                          className="p-1 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 md:p-6 border-t border-[#E0E0E0] bg-gray-50">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-600">Subtotal</span>
              <span className="font-bold text-lg" style={{ color: colors.text.primary }}>
                Rs. {cartTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Delivery charges are calculated at checkout.</p>
            {hasUnavailableItems && (
              <p role="alert" className="text-xs text-red-600 mb-3">
                Some items are no longer available. Remove them to continue.
              </p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={hasUnavailableItems}
              className="w-full py-3.5 rounded-full text-white font-semibold flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#0095CC] transition-all shadow-md text-sm active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
