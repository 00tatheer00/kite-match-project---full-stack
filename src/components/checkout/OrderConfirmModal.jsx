'use client';

import { X, CheckCircle } from "lucide-react";
import { FaShoppingBag } from "react-icons/fa";

const OrderConfirmModal = ({
  items,
  customerInfo,
  totals,
  onConfirm,
  onCancel,
  submitting,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0] bg-gradient-to-r from-[#00AEEF] to-[#0095CC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <FaShoppingBag className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Confirm Your Order
              </h2>
              <p className="text-white/80 text-xs">Please review before placing</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Items */}
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h3 className="text-sm font-semibold text-[#222222] mb-3 uppercase tracking-wide">
              Items ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-[#E0E0E0] flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image?.src || item.image}
                        alt={
                          item.itemType === "promotion"
                            ? item.promotionTitle
                            : item.productTitle || item.brandName
                        }
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <FaShoppingBag className="text-gray-300 text-xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#222222] leading-snug line-clamp-2">
                      {item.itemType === "promotion"
                        ? item.promotionTitle
                        : item.brandName || item.productTitle}
                    </p>
                    {item.itemType !== "promotion" && item.selectedVariant && (
                      <p className="text-xs text-[#00AEEF] mt-0.5 font-medium">
                        {item.selectedVariant}
                      </p>
                    )}
                    <p className="text-xs text-[#666666] mt-0.5">
                      Qty: <span className="font-semibold">{item.quantity}</span>
                      {item.price > 0 && (
                        <span className="ml-2 text-[#222222] font-semibold">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h3 className="text-sm font-semibold text-[#222222] mb-3 uppercase tracking-wide">
              Delivery Details
            </h3>
            <div className="bg-[#F9F9F9] rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#666666]">Name</span>
                <span className="font-semibold text-[#222222]">
                  {customerInfo.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Phone</span>
                <span className="font-semibold text-[#222222]">
                  {customerInfo.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">City</span>
                <span className="font-semibold text-[#222222]">
                  {customerInfo.city}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#666666] flex-shrink-0">Address</span>
                <span className="font-semibold text-[#222222] text-right">
                  {customerInfo.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Payment</span>
                <span className="font-semibold text-[#222222]">
                  Cash on Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-[#222222] mb-3 uppercase tracking-wide">
              Price Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="font-semibold">
                  Rs. {totals.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Shipping</span>
                <span className="font-semibold">
                  Rs. {totals.shipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E0E0E0]">
                <span className="font-bold text-[#222222] text-base">Total</span>
                <span className="font-black text-[#00AEEF] text-xl">
                  Rs. {totals.grand.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-[#E0E0E0] bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] text-[#444444] font-semibold hover:border-[#00AEEF] hover:text-[#00AEEF] transition-all duration-200 disabled:opacity-50"
          >
            Edit Order
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white font-bold hover:shadow-lg hover:shadow-[#00AEEF]/30 transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Placing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Confirm Order
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.25s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmModal;
