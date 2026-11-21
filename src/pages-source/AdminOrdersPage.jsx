'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import OrderDetailPanel from "../components/admin/OrderDetailPanel";
import { adminGetOrders, adminGetOrder, adminUpdateOrderStatus, adminDeleteOrder } from "../services/api";
import { SkeletonTable } from "../components/admin/AdminSkeleton";

import toast from "react-hot-toast";
import { Search, RefreshCw, Download, Phone, MessageCircle, Check, Truck, Inbox, ChevronRight } from "lucide-react";
import { downloadCSV, escapeCSV } from "@/utils/csvHelper";
import {
  ALL_STATUSES, STATUS_META, NEXT_STEP, orderKeyOf, rs, formatDateTime, relativeTime,
  karachiDay, whatsappNumber, initials, itemCount, orderSummaryLine,
} from "../components/admin/orderUi";
import { useAdminTheme } from "../context/AdminThemeContext";
import Pusher from "pusher-js";


const AdminOrdersPage = () => {
  const { isDark } = useAdminTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState("all"); // all | today | 7d | 30d
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Detail panel
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const data = await adminGetOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!silent) setError(err.message || "Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + periodic polling every 15 seconds
  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [load]);

  // Real-time Pusher listener for new orders
  useEffect(() => {
    // Public (non-secret) Pusher key; the server secret is never sent to the browser.
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || 'd14edc647970149caa98';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    if (!pusherKey) return;

    let pusher = null;
    try {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      const channel = pusher.subscribe('admin-notifications');

      channel.bind('new-order', (newOrderData) => {
        if (!newOrderData) return;

        toast.success(
          `🔔 New Order Received #${newOrderData.orderNumber || newOrderData.orderId || ''} from ${newOrderData.customerName || 'Customer'}!`,
          { duration: 6000 }
        );

        // The Pusher payload only carries a summary; fetch full order details from the server.
        load(true);
      });
    } catch (e) {
      console.warn("Pusher subscription error:", e);
    }

    return () => {
      if (pusher) {
        try {
          pusher.unsubscribe('admin-notifications');
          pusher.disconnect();
        } catch {}
      }
    };
  }, [load]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await load(true);
    toast.success("Orders list updated!");
  };

  const handleRowClick = async (order) => {
    // Open panel immediately with list data, then fetch full detail
    setSelectedOrder(order);
    setPanelLoading(true);
    try {
      const orderLookupId = orderKeyOf(order);
      const full = await adminGetOrder(orderLookupId);
      if (full) setSelectedOrder(full);
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
      toast.success(`${orders.find((x) => orderKeyOf(x) === orderId)?.orderNumber || "Order"} marked as ${STATUS_META[status]?.label || status}`);
      // Update in list + panel
      setOrders((prev) => prev.map((o) => (orderKeyOf(o) === orderId ? { ...o, ...updated, status } : o)));
      if (orderKeyOf(selectedOrder) === orderId) setSelectedOrder({ ...selectedOrder, ...updated, status });
      if (updated?.customerNotified === false && updated?.email) toast("Status saved, but the customer email could not be sent.", { icon: "⚠️" });
    } catch (err) {
      toast.error(err.message || "Failed to update status");
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (order) => {
    const key = orderKeyOf(order);
    const label = order.orderNumber || key;
    if (!window.confirm(`Permanently delete order ${label}${order.customerName ? ` (${order.customerName})` : ""}?

Use this only for test or duplicate orders. For real orders, set the status to "cancelled" instead.`)) return;
    setUpdatingId(key);
    try {
      await adminDeleteOrder(key);
      setOrders((prev) => prev.filter((o) => orderKeyOf(o) !== key));
      setSelectedOrder(null);
      toast.success(`Order ${label} deleted.`);
    } catch (err) {
      toast.error(err.message || "Could not delete the order.");
    } finally {
      setUpdatingId("");
    }
  };

  // ---------------- Filtering ----------------
  const todayKey = karachiDay(nowTs);
  const inRange = (o) => {
    if (dateRange === "all") return true;
    if (dateRange === "today") return karachiDay(o.createdAt) === todayKey;
    const days = dateRange === "7d" ? 7 : 30;
    return o.createdAt && nowTs - new Date(o.createdAt).getTime() <= days * 86400000;
  };
  const baseFiltered = orders.filter((o) => {
    if (filterType && o.type !== filterType) return false;
    if (!inRange(o)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [o.orderNumber, o.customerName, o.phone, o.email, o.address, o.city, o.note, o.selectedSkuOrSize,
      ...(Array.isArray(o.items) ? o.items.map((it) => `${it.title || ""} ${it.brandName || ""} ${it.selectedVariant || ""}`) : [])]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  });
  const countFor = (status) => baseFiltered.filter((o) => (o.status || "pending") === status).length;
  const filteredOrders = filterStatus ? baseFiltered.filter((o) => (o.status || "pending") === filterStatus) : baseFiltered;

  // ---------------- Summary numbers ----------------
  const ordersToday = orders.filter((o) => karachiDay(o.createdAt) === todayKey).length;
  const pendingList = orders.filter((o) => (o.status || "pending") === "pending");
  const pendingValue = pendingList.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const confirmedSales = orders
    .filter((o) => o.status === "confirmed" || o.status === "shipped")
    .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);

  const exportCsv = () => {
    const header = ["Order", "Date", "Status", "Customer", "Phone", "Email", "City", "Address", "Items", "Quantity", "Delivery", "Total", "Note"];
    const rows = filteredOrders.map((o) => [
      o.orderNumber, formatDateTime(o.createdAt), STATUS_META[o.status]?.label || o.status, o.customerName, o.phone, o.email,
      o.city, o.address, orderSummaryLine(o), itemCount(o), o.shippingCost ?? "", o.totalAmount ?? "", o.note || "",
    ]);
    downloadCSV(`kite-orders-${todayKey}.csv`, [header.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\r\n"));
    toast.success(`${rows.length} order(s) exported`);
  };

  // ---------------- Styles ----------------
  const card = isDark ? "bg-[#111726] border-white/5" : "bg-white border-slate-200";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const strong = isDark ? "text-white" : "text-slate-900";
  const field = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00AEEF] ${
    isDark ? "bg-[#0B0F19] border-white/10 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
  }`;

  const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] || STATUS_META.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${isDark ? m.dark : m.light}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
        {m.label}
      </span>
    );
  };

  const QuickAction = ({ o }) => {
    const next = NEXT_STEP[o.status || "pending"];
    if (!next) return null;
    const key = orderKeyOf(o);
    return (
      <button
        type="button"
        disabled={updatingId === key}
        onClick={(e) => {
          e.stopPropagation();
          handleStatusChange(key, next.status);
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 ${
          next.status === "confirmed"
            ? "bg-[#00AEEF] text-white hover:bg-[#0095CC]"
            : isDark ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {next.status === "confirmed" ? <Check size={13} /> : <Truck size={13} />}
        {updatingId === key ? "Saving…" : next.status === "confirmed" ? "Confirm" : "Ship"}
      </button>
    );
  };

  const ContactIcons = ({ o }) => (
    <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <a href={`tel:${o.phone}`} title="Call" className={`p-1.5 rounded-lg ${isDark ? "text-slate-400 hover:bg-white/10 hover:text-sky-300" : "text-slate-400 hover:bg-sky-50 hover:text-sky-600"}`}>
        <Phone size={15} />
      </a>
      <a href={`https://wa.me/${whatsappNumber(o.phone)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className={`p-1.5 rounded-lg ${isDark ? "text-slate-400 hover:bg-white/10 hover:text-emerald-300" : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"}`}>
        <MessageCircle size={15} />
      </a>
    </span>
  );

  const tabs = [{ id: "", label: "All", count: baseFiltered.length }, ...ALL_STATUSES.map((s) => ({ id: s, label: STATUS_META[s].label, count: countFor(s) }))];

  return (
    <RequireAdminAuth>
      <AdminLayout>
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${strong}`}>Orders</h1>
              <p className={`mt-1 text-sm ${sub}`}>Confirm, ship and track customer orders. New orders appear automatically.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCsv} disabled={filteredOrders.length === 0} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${isDark ? "border-white/10 text-slate-200 hover:bg-white/5" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Download size={15} /> Export Excel
              </button>
              <button onClick={handleManualRefresh} disabled={refreshing} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 ${isDark ? "border-white/10 text-slate-200 hover:bg-white/5" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Orders today", value: ordersToday, tone: "text-sky-500" },
              { label: "Waiting for confirmation", value: pendingList.length, tone: "text-amber-500", onClick: () => setFilterStatus("pending") },
              { label: "Pending value", value: rs(pendingValue), tone: "text-amber-500" },
              { label: "Confirmed sales", value: rs(confirmedSales), tone: "text-emerald-500" },
            ].map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={k.onClick}
                className={`text-left rounded-2xl border p-4 transition-shadow ${card} ${k.onClick ? "cursor-pointer hover:shadow-md" : "cursor-default"}`}
              >
                <p className={`text-[11px] font-bold uppercase tracking-wider ${sub}`}>{k.label}</p>
                <p className={`mt-1.5 text-2xl font-black ${k.tone}`}>{k.value}</p>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className={`rounded-2xl border p-3 sm:p-4 space-y-3 ${card}`}>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {tabs.map((t) => {
                const active = filterStatus === t.id;
                return (
                  <button
                    key={t.id || "all"}
                    type="button"
                    onClick={() => setFilterStatus(t.id)}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-[#00AEEF] text-white shadow-sm"
                        : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.id && <span className={`w-2 h-2 rounded-full ${STATUS_META[t.id].dot}`} />}
                    {t.label}
                    <span className={`rounded-md px-1.5 text-xs font-bold ${active ? "bg-white/25" : isDark ? "bg-white/10" : "bg-slate-100"}`}>{t.count}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2.5">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, KT-001, city, product…" className={`${field} pl-9`} />
              </div>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={field} aria-label="Date range">
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={field} aria-label="Order type">
                <option value="">All order types</option>
                <option value="cart">Cart</option>
                <option value="product">Single product</option>
                <option value="promotion">Package</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          {loading ? (
            <SkeletonTable rows={6} label="Loading orders" />
          ) : filteredOrders.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${card}`}>
              <span className={`mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-400"}`}>
                <Inbox size={26} />
              </span>
              <p className={`font-bold ${strong}`}>{orders.length === 0 ? "No orders yet" : "No orders match these filters"}</p>
              <p className={`mt-1 text-sm ${sub}`}>
                {orders.length === 0 ? "New orders from the website will appear here automatically." : "Try another status tab, date range or search."}
              </p>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`text-left text-[11px] font-bold uppercase tracking-wider ${isDark ? "bg-white/[0.03] text-slate-400" : "bg-slate-50 text-slate-500"}`}>
                      <th className="py-3 pl-5 pr-3">Order</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">City</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 pl-3 pr-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                    {filteredOrders.map((o) => (
                      <tr key={orderKeyOf(o)} onClick={() => handleRowClick(o)} className={`cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-sky-50/50"}`}>
                        <td className="py-3.5 pl-5 pr-3">
                          <p className="font-mono font-bold text-[#00AEEF]">{o.orderNumber || String(orderKeyOf(o)).slice(-6)}</p>
                          <p className={`text-xs ${sub}`} title={formatDateTime(o.createdAt)}>{relativeTime(o.createdAt, nowTs)}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-600"}`}>{initials(o.customerName)}</span>
                            <div className="min-w-0">
                              <p className={`font-semibold truncate max-w-[180px] ${strong}`}>{o.customerName}</p>
                              <div className={`flex items-center gap-1 text-xs ${sub}`}>
                                <span>{o.phone}</span>
                                <ContactIcons o={o} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <p className={`truncate max-w-[220px] ${isDark ? "text-slate-200" : "text-slate-700"}`}>{orderSummaryLine(o)}</p>
                          <p className={`text-xs ${sub}`}>{itemCount(o)} item{itemCount(o) === 1 ? "" : "s"}</p>
                        </td>
                        <td className={`py-3.5 px-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{o.city}</td>
                        <td className={`py-3.5 px-3 text-right font-bold whitespace-nowrap ${strong}`}>{rs(o.totalAmount)}</td>
                        <td className="py-3.5 px-3"><StatusBadge status={o.status || "pending"} /></td>
                        <td className="py-3.5 pl-3 pr-5">
                          <div className="flex items-center justify-end gap-2">
                            <QuickAction o={o} />
                            <ChevronRight size={16} className="text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <ul className={`lg:hidden divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                {filteredOrders.map((o) => (
                  <li key={orderKeyOf(o)} onClick={() => handleRowClick(o)} className={`p-4 cursor-pointer ${isDark ? "active:bg-white/5" : "active:bg-slate-50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#00AEEF]">{o.orderNumber}</span>
                          <span className={`text-xs ${sub}`}>· {relativeTime(o.createdAt, nowTs)}</span>
                        </div>
                        <p className={`mt-0.5 font-semibold truncate ${strong}`}>{o.customerName}</p>
                        <p className={`text-xs truncate ${sub}`}>{o.city} · {orderSummaryLine(o)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-black ${strong}`}>{rs(o.totalAmount)}</p>
                        <div className="mt-1"><StatusBadge status={o.status || "pending"} /></div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <ContactIcons o={o} />
                      <QuickAction o={o} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className={`px-5 py-3 text-xs border-t ${isDark ? "border-white/5" : "border-slate-100"} ${sub}`}>
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
          )}
        </div>

        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            updatingId={updatingId}
          />
        )}
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminOrdersPage;
