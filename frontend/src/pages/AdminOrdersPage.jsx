import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { adminGetOrders, adminUpdateOrderStatus } from "../services/api";
import { colors } from "../theme";
import toast from "react-hot-toast";

const statuses = ["pending", "confirmed", "shipped", "cancelled"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    try {
      await adminUpdateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      o._id,
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
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Orders
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: colors.text.secondary }}
            >
              Check all product and promotion orders, then update order status.
            </p>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4">
            <label className="block text-sm font-medium mb-2">
              Search Orders
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, city, product/promotion id, status, order id..."
              className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
            />
            <p className="text-xs text-[#666666] mt-2">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {loading ? (
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Loading orders...
            </div>
          ) : (
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 md:p-6">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="text-left py-3 pr-4">Date</th>
                      <th className="text-left py-3 pr-4">Type</th>
                      <th className="text-left py-3 pr-4">Name</th>
                      <th className="text-left py-3 pr-4">Phone</th>
                      <th className="text-left py-3 pr-4">City</th>
                      <th className="text-left py-3 pr-4">Payment</th>
                      <th className="text-left py-3 pr-4">Status</th>
                      <th className="text-right py-3 pl-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr
                        key={o._id}
                        className="border-b border-[#F0F0F0] align-top"
                      >
                        <td className="py-3 pr-4 text-xs text-[#666666]">
                          {formatDateTime(o.createdAt)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-[#F9F9F9] border border-[#E0E0E0]">
                            {o.type === "product" ? "Product" : "Promotion"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{o.customerName}</td>
                        <td className="py-3 pr-4">{o.phone}</td>
                        <td className="py-3 pr-4">{o.city}</td>
                        <td className="py-3 pr-4">{o.paymentMethod}</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-[#F9F9F9] border border-[#E0E0E0]">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right space-y-2">
                          <div className="text-xs text-[#666666] space-y-1 text-left md:text-right">
                            <span className="block">Order ID: {o._id}</span>
                            {o.type === "product" && o.productId && (
                              <span>Product: {o.productId}</span>
                            )}
                            {o.type === "promotion" && o.promotionId && (
                              <span>Promotion: {o.promotionId}</span>
                            )}
                            {o.selectedSkuOrSize && (
                              <span className="block">
                                Variant: {o.selectedSkuOrSize}
                              </span>
                            )}
                            <span className="block">
                              Quantity: {o.quantity || 1}
                            </span>
                            {o.email && (
                              <span className="block">Email: {o.email}</span>
                            )}
                            <span className="block">Address: {o.address}</span>
                            {o.note && (
                              <span className="block">Note: {o.note}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap justify-end gap-1">
                            {statuses.map((status) => (
                              <button
                                key={status}
                                disabled={
                                  updatingId === o._id || o.status === status
                                }
                                onClick={() =>
                                  handleStatusChange(o._id, status)
                                }
                                className="px-2 py-1 rounded-lg text-xs border border-[#E0E0E0] hover:border-[#00AEEF] disabled:opacity-50"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          className="py-6 text-center text-[#666666]"
                          colSpan={8}
                        >
                          No orders match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {filteredOrders.map((o) => (
                  <div
                    key={o._id}
                    className="border border-[#E0E0E0] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {o.customerName || "-"}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {formatDateTime(o.createdAt)}
                        </p>
                      </div>
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-[#F9F9F9] border border-[#E0E0E0]">
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-[#666666] space-y-1">
                      <span className="block">
                        Type: {o.type === "product" ? "Product" : "Promotion"}
                      </span>
                      <span className="block">Phone: {o.phone || "-"}</span>
                      <span className="block">City: {o.city || "-"}</span>
                      <span className="block">
                        Payment: {o.paymentMethod || "-"}
                      </span>
                      <span className="block">Order ID: {o._id}</span>
                      {o.type === "product" && o.productId && (
                        <span className="block">Product: {o.productId}</span>
                      )}
                      {o.type === "promotion" && o.promotionId && (
                        <span className="block">
                          Promotion: {o.promotionId}
                        </span>
                      )}
                      {o.selectedSkuOrSize && (
                        <span className="block">
                          Variant: {o.selectedSkuOrSize}
                        </span>
                      )}
                      <span className="block">Quantity: {o.quantity || 1}</span>
                      {o.email && (
                        <span className="block">Email: {o.email}</span>
                      )}
                      {o.address && (
                        <span className="block">Address: {o.address}</span>
                      )}
                      {o.note && <span className="block">Note: {o.note}</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          disabled={updatingId === o._id || o.status === status}
                          onClick={() => handleStatusChange(o._id, status)}
                          className="px-2.5 py-1 rounded-lg text-xs border border-[#E0E0E0] hover:border-[#00AEEF] disabled:opacity-50"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <p className="text-center text-sm text-[#666666] py-6">
                    No orders match your search.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminOrdersPage;
