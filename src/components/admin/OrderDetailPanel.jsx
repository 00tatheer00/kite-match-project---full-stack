'use client';

import { X, Package, User, MapPin, CreditCard, Hash, Clock } from "lucide-react";
import { FaShoppingBag } from "react-icons/fa";

const statuses = ["pending", "confirmed", "shipped", "cancelled"];

const statusColors = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100   text-blue-800   border-blue-200",
  shipped:   "bg-green-100  text-green-800  border-green-200",
  cancelled: "bg-red-100    text-red-800    border-red-200",
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0] bg-gradient-to-r from-[#00AEEF] to-[#0095CC] flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-xl">Order Detail</h2>
              {order.orderNumber && (
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-0.5 rounded-full">
                  {order.orderNumber}
                </span>
              )}
            </div>
            <p className="text-white/70 text-xs mt-0.5 font-mono">
              ID: {order._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close panel"
          >
            <X size={22} className="text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F0]">
          {/* Status & Meta */}
          <div className="px-6 py-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                  statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {order.status}
              </span>
              <span className="text-sm text-[#666666] flex items-center gap-1.5">
                <Clock size={14} />
                {formatDateTime(order.createdAt)}
              </span>
              <span className="text-sm font-medium text-[#00AEEF] capitalize">
                {order.type === "cart" ? "Cart Order" : order.type === "product" ? "Product Order" : "Promotion Order"}
              </span>
            </div>

            {/* Status Change Buttons */}
            <div>
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    disabled={updatingId === order._id || order.status === s}
                    onClick={() => onStatusChange(order._id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      ${order.status === s
                        ? "bg-[#00AEEF] text-white border-[#00AEEF]"
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
            <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wide flex items-center gap-2 mb-4">
              <Package size={16} className="text-[#00AEEF]" />
              Items Ordered
            </h3>
            <div className="space-y-4">
              {isCart && order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-[#F9F9F9] rounded-xl p-3 border border-[#E0E0E0]">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-[#E0E0E0] flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image?.src || item.image}
                          alt={item.itemType === "promotion" ? item.promotionId : item.productId}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <FaShoppingBag className="text-gray-300 text-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#222222]">
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
                        <p className="text-xs text-[#666666]">
                          Qty: <span className="font-bold text-[#222222]">{item.quantity}</span>
                        </p>
                        {item.price > 0 && (
                          <p className="text-sm font-bold text-[#222222]">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {item.price > 0 && (
                        <p className="text-xs text-[#888888] mt-0.5">
                          Unit price: Rs. {item.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* Single product / promotion order */
                <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#E0E0E0]">
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center flex-shrink-0">
                      <FaShoppingBag className="text-gray-300 text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#222222]">
                        {order.type === "product"
                          ? `Product ID: ${order.productId || "—"}`
                          : `Promotion ID: ${order.promotionId || "—"}`}
                      </p>
                      {order.selectedSkuOrSize && (
                        <p className="text-xs text-[#00AEEF] mt-0.5">{order.selectedSkuOrSize}</p>
                      )}
                      <p className="text-xs text-[#666666] mt-1">
                        Qty: <span className="font-bold text-[#222222]">{order.quantity || 1}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wide flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[#00AEEF]" />
              Amount Breakdown
            </h3>
            <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#E0E0E0] space-y-2">
              {order.totalAmount != null && (
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#222222]">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-[#666666]">
                <span>Shipping Cost</span>
                <span className="font-semibold text-[#222222]">
                  Rs. {(order.shippingCost ?? 0).toLocaleString()}
                </span>
              </div>
              {order.totalAmount != null && (
                <div className="flex justify-between items-center pt-2 border-t border-[#E0E0E0]">
                  <span className="font-bold text-[#222222]">Grand Total</span>
                  <span className="font-black text-[#00AEEF] text-xl">
                    Rs. {order.totalAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-[#666666] pt-1">
                <span>Payment Method</span>
                <span className="font-semibold text-[#222222]">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wide flex items-center gap-2 mb-4">
              <User size={16} className="text-[#00AEEF]" />
              Customer Details
            </h3>
            <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#E0E0E0] space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#666666]">Name</span>
                <span className="font-semibold text-[#222222] text-right">{order.customerName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#666666]">Phone</span>
                <span className="font-semibold text-[#222222]">{order.phone}</span>
              </div>
              {order.email && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#666666]">Email</span>
                  <span className="font-semibold text-[#222222] text-right break-all">{order.email}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-[#666666] flex-shrink-0">City</span>
                <span className="font-semibold text-[#222222] text-right">{order.city}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#666666] flex-shrink-0">Address</span>
                <span className="font-semibold text-[#222222] text-right">{order.address}</span>
              </div>
              {order.note && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#666666] flex-shrink-0">Note</span>
                  <span className="font-semibold text-[#222222] text-right">{order.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Reference IDs */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wide flex items-center gap-2 mb-4">
              <Hash size={16} className="text-[#00AEEF]" />
              Reference Numbers
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-2 bg-[#F9F9F9] rounded-lg px-4 py-2.5 border border-[#E0E0E0]">
                <span className="text-[#666666]">Order No.</span>
                <span className="font-bold text-[#00AEEF] font-mono">
                  {order.orderNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2 bg-[#F9F9F9] rounded-lg px-4 py-2.5 border border-[#E0E0E0]">
                <span className="text-[#666666]">MongoDB ID</span>
                <span className="font-mono text-xs text-[#888888] break-all text-right">{order._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPanel;
