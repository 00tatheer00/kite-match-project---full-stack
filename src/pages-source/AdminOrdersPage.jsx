'use client';

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import OrderDetailPanel from "../components/admin/OrderDetailPanel";
import { adminGetOrders, adminGetOrder, adminUpdateOrderStatus } from "../services/api";
import { colors } from "../theme";
import toast from "react-hot-toast";
import { Search, SlidersHorizontal } from "lucide-react";

const statuses = ["pending", "confirmed", "shipped", "cancelled"];

const statusColors = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50   text-blue-700   border-blue-200",
  shipped:   "bg-green-50  text-green-700  border-green-200",
  cancelled: "bg-red-50    text-red-700    border-red-200",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Detail panel
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminGetOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRowClick = async (order) => {
    // Open panel immediately with list data, then fetch full detail
    setSelectedOrder(order);
    setPanelLoading(true);
    try {
      const full = await adminGetOrder(order._id);
      setSelectedOrder(full);
    } catch {
      // fallback: keep list data
    } finally {
      setPanelLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    try {
      const updated = await adminUpdateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      // Update in list + panel
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder({ ...selectedOrder, ...updated, status });
    } catch (err) {
      toast.error(err.message || "Failed to update status");
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    });
  };

  const filteredOrders = orders.filter((o) => {
    // Type filter
    if (filterType && o.type !== filterType) return false;
    // Status filter
    if (filterStatus && o.status !== filterStatus) return false;
    // Text search
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      o._id,
      o.orderNumber,          // KT-001 searchable
      o.type,
      o.productId,
      o.promotionId,
      o.selectedSkuOrSize,
      o.quantity,
      o.customerName,
      o.phone,
      o.email,
      o.address,
      o.city,
      o.note,
      o.paymentMethod,
      o.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <RequireAdminAuth>
      <AdminLayout>
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
              Orders
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
              Click any row to view full order details. Update status directly from the detail panel.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#444444]">
              <SlidersHorizontal size={16} className="text-[#00AEEF]" />
              Filter Orders
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Text search */}
              <div className="relative sm:col-span-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, phone, KT-001, city…"
                  className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              {/* Type dropdown */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
              >
                <option value="">All Types</option>
                <option value="product">Product</option>
                <option value="promotion">Promotion</option>
                <option value="cart">Cart</option>
              </select>
              {/* Status dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-[#666666]">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {loading ? (
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Loading orders...
            </div>
          ) : (
            <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#F9F9F9]">
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Order No.</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">City</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#444]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr
                        key={o._id}
                        onClick={() => handleRowClick(o)}
                        className="border-b border-[#F0F0F0] hover:bg-[#F0FAFF] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-[#00AEEF]">
                          {o.orderNumber || <span className="text-[#CCC] text-xs">{o._id?.slice(-6)}</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#666666] whitespace-nowrap">
                          {formatDateTime(o.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FAFF] border border-[#B3E5FC] text-[#0095CC]">
                            {o.type === "cart" ? "Cart" : o.type === "product" ? "Product" : "Promotion"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#222222]">{o.customerName}</p>
                          <p className="text-xs text-[#666666]">{o.phone}</p>
                        </td>
                        <td className="py-3 px-4 text-[#444444]">{o.city}</td>
                        <td className="py-3 px-4 text-[#444444]">{o.paymentMethod}</td>
                        <td className="py-3 px-4 font-semibold text-[#222222]">
                          {o.totalAmount != null ? `Rs. ${o.totalAmount.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[o.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td className="py-10 text-center text-[#666666]" colSpan={8}>
                          No orders match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[#F0F0F0]">
                {filteredOrders.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => handleRowClick(o)}
                    className="p-4 hover:bg-[#F0FAFF] cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono font-bold text-[#00AEEF]">
                          {o.orderNumber || `#${o._id?.slice(-6)}`}
                        </p>
                        <p className="text-sm font-semibold text-[#222222] mt-0.5">{o.customerName}</p>
                        <p className="text-xs text-[#666666]">{formatDateTime(o.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusColors[o.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666666]">
                      <span>📍 {o.city}</span>
                      <span>💳 {o.paymentMethod}</span>
                      {o.totalAmount != null && <span>💰 Rs. {o.totalAmount.toLocaleString()}</span>}
                      <span className="capitalize">📦 {o.type}</span>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <p className="text-center text-sm text-[#666666] py-10">
                    No orders match your filters.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        )}
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminOrdersPage;
