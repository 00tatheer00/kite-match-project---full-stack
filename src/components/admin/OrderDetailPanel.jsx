'use client';

import { X, Package, User, MapPin, CreditCard, Hash, Clock } from "lucide-react";
import { FaShoppingBag } from "react-icons/fa";
import { useAdminTheme } from "../../context/AdminThemeContext";

const statuses = ["pending", "confirmed", "shipped", "cancelled"];

const statusColors = {
  pending:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-blue-500/10   text-blue-500   border-blue-500/30",
  shipped:   "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  cancelled: "bg-red-500/10    text-red-500    border-red-500/30",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });
};

const OrderDetailPanel = ({ order, onClose, onStatusChange, updatingId }) => {
  const { isDark } = useAdminTheme();

  if (!order) return null;

  const isCart = order.type === "cart";

  const subtotal =
    order.totalAmount != null && order.shippingCost != null
      ? order.totalAmount - order.shippingCost
      : order.totalAmount ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-xl z-50 shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isDark ? "bg-[#111726] border-l border-[#1E293B] text-slate-100" : "bg-white text-slate-900"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] flex-shrink-0 text-white">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-xl">Order Detail</h2>
              {order.orderNumber && (
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-0.5 rounded-full">
                  {order.orderNumber}
                </span>
              )}
            </div>
            <p className="text-white/80 text-xs mt-0.5 font-mono">
              ID: {order._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X size={22} className="text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className={`flex-1 overflow-y-auto divide-y ${isDark ? "divide-[#1E293B]" : "divide-slate-100"}`}>
          {/* Status & Meta */}
          <div className="px-6 py-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                  statusColors[order.status] || (isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-gray-100 text-gray-700 border-gray-200")
                }`}
              >
                {order.status}
              </span>
              <span className={`text-sm flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>
                <Clock size={14} />
                {formatDateTime(order.createdAt)}
              </span>
              <span className="text-sm font-bold text-[#00AEEF] capitalize">
                {order.type === "cart" ? "Cart Order" : order.type === "product" ? "Product Order" : "Promotion Order"}
              </span>
            </div>

            {/* Status Change Buttons */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    disabled={updatingId === order._id || order.status === s}
                    onClick={() => onStatusChange(order._id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                      ${order.status === s
                        ? "bg-[#00AEEF] text-white border-[#00AEEF] shadow-sm"
                        : isDark
                          ? "bg-[#161D2E] text-slate-300 border-[#1E293B] hover:border-[#00AEEF] hover:text-[#00AEEF]"
                          : "bg-white text-[#444] border-[#E0E0E0] hover:border-[#00AEEF] hover:text-[#00AEEF]"
                      } disabled:opacity-50`}
                  >
                    {updatingId === order._id && order.status !== s ? "..." : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-5">
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${isDark ? "text-white" : "text-[#222222]"}`}>
              <Package size={16} className="text-[#00AEEF]" />
              Items Ordered
            </h3>
            <div className="space-y-4">
              {isCart && order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className={`flex gap-4 items-start rounded-xl p-3 border ${
                    isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-[#F9F9F9] border-[#E0E0E0]"
                  }`}>
                    <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border ${
                      isDark ? "bg-[#0B0F19] border-[#1E293B]" : "bg-white border-[#E0E0E0]"
                    }`}>
                      {item.image ? (
                        <img
                          src={item.image?.src || item.image}
                          alt={item.itemType === "promotion" ? item.promotionId : item.productId}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <FaShoppingBag className="text-gray-400 text-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-[#222222]"}`}>
                        {item.itemType === "promotion"
                          ? `Promotion: ${item.promotionId}`
                          : item.brandName
                            ? `${item.brandName}`
                            : `Product: ${item.productId}`}
                      </p>
                      {item.itemType !== "promotion" && item.selectedVariant && (
                        <p className="text-xs text-[#00AEEF] mt-0.5 font-medium">{item.selectedVariant}</p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-[#666666]"}`}>
                          Qty: <span className={`font-bold ${isDark ? "text-white" : "text-[#222222]"}`}>{item.quantity}</span>
                        </p>
                        {item.price > 0 && (
                          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[#222222]"}`}>
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {item.price > 0 && (
                        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-[#888888]"}`}>
                          Unit price: Rs. {item.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* Single product / promotion order */
                <div className={`rounded-xl p-4 border ${
                  isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-[#F9F9F9] border-[#E0E0E0]"
                }`}>
                  <div className="flex gap-3 items-center">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                      isDark ? "bg-[#0B0F19] border-[#1E293B]" : "bg-white border-[#E0E0E0]"
                    }`}>
                      <FaShoppingBag className="text-gray-400 text-xl" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-[#222222]"}`}>
                        {order.type === "product"
                          ? `Product ID: ${order.productId || "—"}`
                          : `Promotion ID: ${order.promotionId || "—"}`}
                      </p>
                      {order.selectedSkuOrSize && (
                        <p className="text-xs text-[#00AEEF] mt-0.5">{order.selectedSkuOrSize}</p>
                      )}
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>
                        Qty: <span className={`font-bold ${isDark ? "text-white" : "text-[#222222]"}`}>{order.quantity || 1}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="px-6 py-5">
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${isDark ? "text-white" : "text-[#222222]"}`}>
              <CreditCard size={16} className="text-[#00AEEF]" />
              Amount Breakdown
            </h3>
            <div className={`rounded-xl p-4 border space-y-2.5 ${
              isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-[#F9F9F9] border-[#E0E0E0]"
            }`}>
              {order.totalAmount != null && (
                <div className={`flex justify-between text-sm ${isDark ? "text-slate-300" : "text-[#666666]"}`}>
                  <span>Subtotal</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-[#222222]"}`}>
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
              )}
              <div className={`flex justify-between text-sm ${isDark ? "text-slate-300" : "text-[#666666]"}`}>
                <span>Shipping Cost</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-[#222222]"}`}>
                  Rs. {(order.shippingCost ?? 0).toLocaleString()}
                </span>
              </div>
              {order.totalAmount != null && (
                <div className={`flex justify-between items-center pt-2.5 border-t ${
                  isDark ? "border-[#1E293B]" : "border-[#E0E0E0]"
                }`}>
                  <span className={`font-bold ${isDark ? "text-white" : "text-[#222222]"}`}>Grand Total</span>
                  <span className="font-black text-[#00AEEF] text-xl">
                    Rs. {order.totalAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className={`flex justify-between text-sm pt-1 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>
                <span>Payment Method</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-[#222222]"}`}>{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-6 py-5">
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${isDark ? "text-white" : "text-[#222222]"}`}>
              <User size={16} className="text-[#00AEEF]" />
              Customer Details
            </h3>
            <div className={`rounded-xl p-4 border space-y-2 text-sm ${
              isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-[#F9F9F9] border-[#E0E0E0]"
            }`}>
              <div className="flex justify-between gap-2">
                <span className={isDark ? "text-slate-400" : "text-[#666666]"}>Name</span>
                <span className={`font-semibold text-right ${isDark ? "text-white" : "text-[#222222]"}`}>{order.customerName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={isDark ? "text-slate-400" : "text-[#666666]"}>Phone</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-[#222222]"}`}>{order.phone}</span>
              </div>
              {order.email && (
                <div className="flex justify-between gap-2">
                  <span className={isDark ? "text-slate-400" : "text-[#666666]"}>Email</span>
                  <span className={`font-semibold text-right break-all ${isDark ? "text-white" : "text-[#222222]"}`}>{order.email}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className={`flex-shrink-0 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>City</span>
                <span className={`font-semibold text-right ${isDark ? "text-white" : "text-[#222222]"}`}>{order.city}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={`flex-shrink-0 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>Address</span>
                <span className={`font-semibold text-right ${isDark ? "text-white" : "text-[#222222]"}`}>{order.address}</span>
              </div>
              {order.note && (
                <div className="flex justify-between gap-2">
                  <span className={`flex-shrink-0 ${isDark ? "text-slate-400" : "text-[#666666]"}`}>Note</span>
                  <span className={`font-semibold text-right ${isDark ? "text-white" : "text-[#222222]"}`}>{order.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Reference IDs */}
          <div className="px-6 py-5">
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${isDark ? "text-white" : "text-[#222222]"}`}>
              <Hash size={16} className="text-[#00AEEF]" />
              Reference Numbers
            </h3>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between gap-2 rounded-lg px-4 py-2.5 border ${
                isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-[#F9F9F9] border-[#E0E0E0]"
              }`}>
                <span className={isDark ? "text-slate-400" : "text-[#666666]"}>Order No.</span>
                <span className="font-bold text-[#00AEEF] font-mono">
                  {order.orderNumber || "—"}
                </span>
              </div>
              <div className={`flex justify-between gap-2 rounded-lg px-4 py-2.5 border ${
                isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-[#F9F9F9] border-[#E0E0E0]"
              }`}>
                <span className={isDark ? "text-slate-400" : "text-[#666666]"}>MongoDB ID</span>
                <span className={`font-mono text-xs break-all text-right ${isDark ? "text-slate-400" : "text-[#888888]"}`}>{order._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPanel;
