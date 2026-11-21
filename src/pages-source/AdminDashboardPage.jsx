'use client';

import { formatRelativeTime } from "@/utils/time";

import { useState, useEffect } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { adminGetDashboard, getPromotions } from "../services/api";
import { Link } from "@/components/RouterCompat";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { 
  FaUsers, 
  FaClipboardList, 
  FaCheckCircle, 
  FaClock, 
  FaWhatsapp, 
  FaGlobeAmericas, 
  FaMapMarkerAlt, 
  FaMobileAlt, 
  FaDesktop, 
  FaSyncAlt, 
  FaArrowRight, 
  FaFire,
  FaShieldAlt,
  FaBoxes,
  FaChartBar,
  FaTag
} from "react-icons/fa";
import { SkeletonDashboard } from "../components/admin/AdminSkeleton";

function DashboardContent() {
  const { isDark } = useAdminTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Clock for relative timestamps (kept in state so rendering stays pure).
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [promotionsList, setPromotionsList] = useState([]);

  const loadDashboard = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await adminGetDashboard();
      setData(res);
      if (res?.promotions && Array.isArray(res.promotions) && res.promotions.length > 0) {
        setPromotionsList(res.promotions);
      } else {
        const fallbackPromos = await getPromotions();
        if (Array.isArray(fallbackPromos) && fallbackPromos.length > 0) {
          setPromotionsList(fallbackPromos);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      try {
        const fallbackPromos = await getPromotions();
        if (Array.isArray(fallbackPromos) && fallbackPromos.length > 0) {
          setPromotionsList(fallbackPromos);
        }
      } catch {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(), 25000);
    return () => clearInterval(interval);
  }, []);

  const overview = data?.overview || {};
  const analytics = data?.analytics || {};
  const recentOrders = data?.recentOrders || [];
  const sources = analytics?.sources || {};
  const devices = analytics?.devices || {};
  const cities = analytics?.cities || {};
  const recentVisits = analytics?.recentVisits || [];

  const totalOrders = overview.totalOrders ?? 0;
  const pendingOrders = overview.pendingOrders ?? 0;
  const approvedOrders = overview.approvedOrders ?? 0;
  const totalVisitors = overview.totalVisitors ?? 0;
  const todayVisitors = overview.todayVisitors ?? 0;
  const totalPageviews = overview.totalPageviews ?? 0;
  const totalPromotions = overview.totalPromotions ?? promotionsList.length;
  const activePromotions = overview.activePromotions ?? promotionsList.length;
  const freeShippingPromotions = overview.freeShippingPromotions ?? promotionsList.filter((p) => Number(p.shippingCost) === 0).length;

  // ---- Real visitor data only (no estimates or placeholder numbers) ----
  const countOf = (obj, key) => Number(obj?.[key]) || 0;
  // Cities as recorded by the tracker ("City, CC"), biggest first; the rest grouped as "Other".
  const cityEntries = Object.entries(cities || {})
    .map(([name, count]) => [name, Number(count) || 0])
    .filter(([name, count]) => count > 0 && name && name !== "Unknown")
    .sort((a, b) => b[1] - a[1]);
  const unknownCityVisits = countOf(cities, "Unknown");
  const topCities = cityEntries.slice(0, 6);
  const otherCityVisits = cityEntries.slice(6).reduce((s, [, c]) => s + c, 0) + unknownCityVisits;
  const displayCities = Object.fromEntries(
    otherCityVisits > 0 ? [...topCities, ["Other / unknown location", otherCityVisits]] : topCities
  );
  const totalCityVisits = Object.values(displayCities).reduce((a, b) => a + Number(b), 0);

  // Pakistan vs other countries
  const countryEntries = Object.entries(analytics?.countries || {}).map(([k, v]) => [k, Number(v) || 0]);
  const totalCountryVisits = countryEntries.reduce((s, [, c]) => s + c, 0);
  const pakistanShare = totalCountryVisits > 0 ? Math.round((countOf(analytics?.countries, "PK") / totalCountryVisits) * 100) : 0;

  // Traffic sources
  const channelRows = [
    { key: "whatsapp", label: "WhatsApp", hint: "Links shared on WhatsApp", count: countOf(sources, "whatsapp"), color: "text-emerald-500", bg: "bg-emerald-500/15", icon: <FaWhatsapp /> },
    { key: "social", label: "Facebook / Instagram", hint: "Posts, pages and ads", count: countOf(sources, "facebook") + countOf(sources, "instagram") + countOf(sources, "tiktok"), color: "text-pink-500", bg: "bg-pink-500/15", icon: <FaBoxes /> },
    { key: "google", label: "Google search", hint: "People who searched and clicked", count: countOf(sources, "google"), color: "text-amber-500", bg: "bg-amber-500/15", icon: <FaGlobeAmericas /> },
    { key: "direct", label: "Direct / typed address", hint: "Typed kitepk.com or saved link", count: countOf(sources, "direct") + countOf(sources, "referral"), color: "text-blue-500", bg: "bg-blue-500/15", icon: <FaGlobeAmericas /> },
  ];

  // Devices
  const mobileCount = countOf(devices, "mobile") + countOf(devices, "tablet");
  const desktopCount = countOf(devices, "desktop");
  const deviceTotal = mobileCount + desktopCount;
  const mobilePct = deviceTotal > 0 ? Math.round((mobileCount / deviceTotal) * 100) : 0;
  const desktopPct = deviceTotal > 0 ? 100 - mobilePct : 0;

  // "Lahore, PK" -> 🇵🇰 (flag from the 2-letter country code)
  const flagFor = (name) => {
    const cc = /,\s*([A-Z]{2})$/.exec(name || "")?.[1];
    if (!cc) return "🌐";
    return String.fromCodePoint(...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
  };

  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);

  const getRelativeTime = (isoString) => formatRelativeTime(isoString, nowTs);

  // First load: show the page layout in grey instead of misleading zeros.
  if (loading && !data) return <SkeletonDashboard />;

  return (
    <div className="space-y-5 sm:space-y-6 font-sans selection:bg-[#8B5CF6] selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & FILTER PILLS */}
        {/* ========================================================================= */}
        <div
          className={`flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-4 border-b transition-colors ${
            isDark ? "border-[#1E293B]" : "border-slate-200"
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black tracking-widest uppercase text-sky-500">
                OVERVIEW &bull; OPERATIONS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE CONNECTED
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Executive Dashboard
            </h1>
            <p
              className={`text-xs sm:text-sm font-medium mt-1 max-w-3xl ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {totalOrders} Consumer Orders &bull; {totalPromotions} Value Packages &bull; 4 Industrial Divisions &bull; Edge Location Tracking
            </p>
          </div>

          {/* Filter Pills & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? isDark
                    ? "bg-[#1E293B] text-white border border-slate-500 shadow-sm"
                    : "bg-slate-900 text-white shadow-sm shadow-slate-900/10"
                  : isDark
                  ? "bg-[#131823] text-slate-400 hover:text-white border border-[#1E293B]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Divisions ({totalOrders + totalVisitors})
            </button>

            <button
              onClick={() => setActiveFilter("matches")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFilter === "matches"
                  ? isDark
                    ? "bg-[#1E293B] text-white border border-blue-500 shadow-sm shadow-blue-500/10"
                    : "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : isDark
                  ? "bg-[#131823] text-slate-400 hover:text-white border border-[#1E293B]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Matches (Kite &bull; Olympia)
            </button>

            <button
              onClick={() => setActiveFilter("detergents")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFilter === "detergents"
                  ? isDark
                    ? "bg-[#1E293B] text-white border border-emerald-500 shadow-sm shadow-emerald-500/10"
                    : "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : isDark
                  ? "bg-[#131823] text-slate-400 hover:text-white border border-[#1E293B]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Detergents (Burq &bull; Vero)
            </button>

            <Link
              to="/admin/promotions"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? "bg-pink-500/15 text-pink-300 border border-pink-500/30 hover:bg-pink-500/25"
                  : "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"
              }`}
            >
              <FaTag className="text-[10px]" />
              <span>Promotions ({totalPromotions})</span>
            </Link>

            <Link
              to="/admin/orders"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{pendingOrders} Pending Orders</span>
              <FaArrowRight className="text-[10px]" />
            </Link>

            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isDark
                  ? "bg-[#131823] border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-500"
                  : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Refresh Live Data"
            >
              <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin text-purple-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FOUR KPI METRIC STAT CARDS (Compact Executive Proportions) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Total Orders */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-slate-600 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-md"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm mb-3 ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
              }`}
            >
              <FaClipboardList />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {totalOrders > 0 ? formatNumber(totalOrders) : "0"}
            </div>
            <div className={`text-xs sm:text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Total Orders &amp; Inquiries
            </div>
            <div className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Customer submissions via Web &amp; WhatsApp
            </div>
          </div>

          {/* Card 2: Dispatched / Approved */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-emerald-500/40 shadow-md"
                : "bg-white border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-sm mb-3">
              <FaChartBar />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-emerald-500">
              {approvedOrders > 0 ? formatNumber(approvedOrders) : "0"}
            </div>
            <div className={`text-xs sm:text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Dispatched / Processed
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-500 font-bold mt-0.5">
              {totalOrders > 0 ? `${Math.round((approvedOrders / totalOrders) * 100)}% of orders confirmed or shipped` : "No orders yet"}
            </div>
          </div>

          {/* Card 3: Pending Review (Alert) */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all relative ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-amber-500/40 shadow-md"
                : "bg-white border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md"
            }`}
          >
            <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm mb-3">
              <FaClock />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-amber-500">
              {pendingOrders}
            </div>
            <div className={`text-xs sm:text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Pending Review
            </div>
            <div className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Awaiting dispatch &amp; payment confirmation
            </div>
          </div>

          {/* Card 4: Live Active Visitors */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all relative ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-purple-500/40 shadow-md"
                : "bg-white border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md"
            }`}
          >
            <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-sm mb-3">
              <FaUsers />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {formatNumber(totalVisitors)}
            </div>
            <div className={`text-xs sm:text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Live Active Visitors
            </div>
            <div className="text-[11px] sm:text-xs text-purple-500 font-bold mt-0.5">
              {todayVisitors} active sessions captured today
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RECENT CUSTOMER ORDERS TABLE (Instant visibility on Dashboard) */}
        {/* ========================================================================= */}
        <div
          className={`rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all ${
            isDark
              ? "bg-[#111726] border-[#1E293B] shadow-xl"
              : "bg-white border-slate-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                  REAL-TIME ORDER INBOX
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {pendingOrders} Pending
                </span>
              </div>
              <h3 className={`font-black text-lg sm:text-xl flex items-center gap-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                Recent Customer Orders &amp; Inquiries ({recentOrders.length} Recent)
              </h3>
              <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Orders placed from online store, checkout cart, and packages with customer contact details
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                to="/admin/orders"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00AEEF] hover:bg-[#0095cc] text-white shadow-md shadow-sky-500/20 inline-flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Full Orders Manager ({totalOrders})</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div
              className={`text-center py-10 px-4 rounded-xl border ${
                isDark ? "bg-[#161D2E] border-[#1E293B] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <FaClipboardList className="mx-auto text-3xl mb-2 text-slate-400" />
              <p className={`text-base font-bold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                No orders recorded yet
              </p>
              <p className="text-xs sm:text-sm">
                Orders placed on <a href="/online-order" target="_blank" className="text-sky-500 underline font-bold">Online Order</a> will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr
                    className={`border-b uppercase text-xs font-bold tracking-wider ${
                      isDark ? "border-[#1E293B] text-slate-400" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Phone / WhatsApp</th>
                    <th className="py-3.5 px-4">City / Address</th>
                    <th className="py-3.5 px-4">Items &amp; Type</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-[#1E293B]/70 text-slate-300" : "divide-slate-200 text-slate-700"
                  }`}
                >
                  {recentOrders.map((order, idx) => {
                    const cleanPhone = String(order.phone || "").replace(/[^0-9]/g, "");
                    const waPhone = cleanPhone.startsWith("0") ? "92" + cleanPhone.slice(1) : (cleanPhone.startsWith("92") ? cleanPhone : "92" + cleanPhone);
                    const isPending = order.status === "pending" || !order.status;
                    const isConfirmed = order.status === "confirmed";
                    const isShipped = order.status === "shipped";
                    const isCancelled = order.status === "cancelled";

                    const statusClass = isPending
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : isConfirmed
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                      : isShipped
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30";

                    return (
                      <tr
                        key={order._id || order.id || order.orderNumber || idx}
                        className={`transition-colors ${
                          isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-500">
                          {order.orderNumber || order._id || "KT-00" + (idx + 1)}
                          <div className={`text-[11px] font-sans font-normal mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {getRelativeTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {order.customerName || "Customer"}
                          {order.email && (
                            <div className={`text-[11px] font-normal truncate max-w-[140px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {order.email}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                            title="Chat on WhatsApp"
                          >
                            <FaWhatsapp className="text-emerald-500" />
                            <span>{order.phone || "—"}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {order.city || "Pakistan"}
                          </span>
                          <div className={`text-xs mt-0.5 truncate max-w-[180px] ${isDark ? "text-slate-400" : "text-slate-500"}`} title={order.address}>
                            {order.address || "—"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="capitalize font-bold text-slate-800 dark:text-slate-200">
                            {order.type || "product"}
                          </span>
                          {order.productId && <span className="block text-[11px] text-slate-500">{order.productId} ({order.selectedSkuOrSize || "1x"})</span>}
                          {order.promotionId && <span className="block text-[11px] text-pink-500 font-semibold">{order.promotionId}</span>}
                          {order.items?.length > 0 && <span className="block text-[11px] text-slate-500">{order.items.length} cart items</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[#00AEEF] whitespace-nowrap">
                          Rs. {order.totalAmount || order.totalPrice || "—"}
                          <div className={`text-[10px] font-normal uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {order.paymentMethod || "COD"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusClass}`}>
                            {order.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. REAL-TIME LOCATION & CITY TRACING (Large Map & City Breakdown) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Location Tracing (2 Columns) */}
          <div
            className={`lg:col-span-2 rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all space-y-6 ${
              isDark
                ? "bg-[#111726] border-[#1E293B] shadow-xl"
                : "bg-white border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg shadow-inner">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3
                    className={`font-black text-lg sm:text-xl flex items-center gap-2.5 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Visitor Cities
                    <span className="flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      LIVE
                    </span>
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Where your website visitors are (approximate city from their internet connection). Updates every 25 seconds.
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xl lg:text-2xl font-black text-emerald-500">
                  {formatNumber(totalVisitors)}
                </div>
                <div className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Visitors counted
                </div>
              </div>
            </div>

            {/* Share of visitors per city (real proportions) */}
            {totalCityVisits > 0 && (
              <div className="space-y-2 pt-2">
                <div
                  className={`flex justify-between text-xs sm:text-sm font-bold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <span>Visitors from Pakistan</span>
                  <span className="text-purple-600 dark:text-purple-400 font-black">{pakistanShare}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                  {Object.entries(displayCities).map(([name, count], i) => (
                    <div
                      key={name}
                      className={`h-full transition-all duration-500 ${["bg-emerald-500", "bg-sky-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-teal-500", "bg-slate-400"][i % 7]}`}
                      style={{ width: `${(Number(count) / totalCityVisits) * 100}%` }}
                      title={`${name}: ${count}`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {totalCityVisits === 0 && (
              <div className={`rounded-xl border border-dashed p-6 text-center text-sm font-medium ${
                isDark ? "border-slate-700 text-slate-400" : "border-slate-300 text-slate-500"
              }`}>
                No visitors recorded yet. Cities will appear here as people open kitepk.com.
              </div>
            )}

            {/* Cities Grid Breakdown (Clear, High Contrast Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {Object.entries(displayCities).map(([cityName, count], idx) => {
                const countNum = Number(count) || 0;
                const pct = totalCityVisits > 0 ? Math.round((countNum / totalCityVisits) * 100) : 0;
                const flag = flagFor(cityName);

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isDark
                        ? "bg-[#161D2E] border-[#1E293B] hover:border-slate-500"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {flag}
                      </span>
                      <div>
                        <div className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {cityName}
                        </div>
                        <div className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {formatNumber(countNum)} {countNum === 1 ? "visitor" : "visitors"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-500">{pct}%</div>
                      <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acquisition & Devices (1 Column) */}
          <div
            className={`rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all space-y-6 ${
              isDark
                ? "bg-[#111726] border-[#1E293B] shadow-xl"
                : "bg-white border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <div>
              <h3 className={`font-black text-lg sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Lead Channels &amp; Devices
              </h3>
              <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Inbound customer sources and hardware
              </p>
            </div>

            {/* Channels list (real counts from the visitor tracker) */}
            <div className="space-y-3.5">
              {channelRows.map((row) => (
                <div
                  key={row.key}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${row.bg} ${row.color} flex items-center justify-center text-lg`}>
                      {row.icon}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{row.label}</div>
                      <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{row.hint}</div>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${row.color}`}>
                    {formatNumber(row.count)} {row.count === 1 ? "visitor" : "visitors"}
                  </span>
                </div>
              ))}
            </div>

            {/* Hardware Split */}
            <div className={`pt-4 border-t ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Device Hardware Distribution
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <FaMobileAlt className="text-sky-500 mx-auto mb-1.5 text-lg" />
                  <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {mobilePct}% Mobile
                  </div>
                  <div className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {formatNumber(mobileCount)} phones / tablets
                  </div>
                </div>
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <FaDesktop className="text-purple-500 mx-auto mb-1.5 text-lg" />
                  <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {desktopPct}% Desktop
                  </div>
                  <div className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {formatNumber(desktopCount)} computers
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 5. PROMOTIONAL PACKAGES & VALUE BUNDLES (9 Official Rate-Sheet Bundles) */}
        {/* ========================================================================= */}
        <div
          className={`rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all ${
            isDark
              ? "bg-[#111726] border-[#1E293B] shadow-xl"
              : "bg-white border-slate-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-[11px] font-black uppercase tracking-wider text-pink-500">
                  CONSUMER VALUE PACKAGES
                </span>
              </div>
              <h3 className={`font-black text-lg sm:text-xl flex items-center gap-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                Active Promotional Bundles ({promotionsList.length || 9} Packages)
              </h3>
              <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Verified against client rate-sheet: Packages 1-6 standard delivery, bottom 3 premium bundles free shipping
              </p>
            </div>
            <Link
              to="/admin/promotions"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md shadow-pink-500/20 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
            >
              <span>Manage in Promotions</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotionsList.map((p, idx) => {
              const saveAmount = p.discount != null ? p.discount : (p.originalPrice && p.totalPrice ? p.originalPrice - p.totalPrice : null);
              const isFreeShipping = p.shippingCost === 0;

              return (
                <div
                  key={p.id || idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all group ${
                    isDark
                      ? "bg-[#161D2E] border-[#1E293B] hover:border-pink-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-pink-400 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center p-1">
                      {p.image ? (
                        <img src={p.id === 'pkg-kite-smart-starter' ? '/packages-image/kite-smart-starter-v3.jpeg' : p.image?.src || p.image} alt={p.title} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-gray-400">Pack {idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          #{idx + 1}
                        </span>
                        <h4 className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {p.title}
                        </h4>
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {p.totalQuantity || (p.items?.reduce((s, it) => s + (Number(it.quantity) || 0), 0) || 0)} items &bull; {p.category || 'Combo'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-inherit flex items-center justify-between">
                    <div>
                      {p.originalPrice && (
                        <span className="line-through text-xs text-gray-400 mr-1.5 font-medium">
                          Rs. {p.originalPrice}
                        </span>
                      )}
                      <span className="font-black text-base text-[#00AEEF]">
                        Rs. {p.totalPrice}
                      </span>
                      {saveAmount != null && saveAmount > 0 && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Save Rs. {saveAmount}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isFreeShipping
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-black"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                      }`}
                    >
                      {isFreeShipping ? "FREE Delivery" : "Rs. 200 Delivery"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. LIVE RECENT CUSTOMER ACTIVITY STREAM TABLE (High Readability) */}
        {/* ========================================================================= */}
        <div
          className={`rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all ${
            isDark
              ? "bg-[#111726] border-[#1E293B] shadow-xl"
              : "bg-white border-slate-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className={`font-black text-lg sm:text-xl flex items-center gap-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live Customer Activity Stream
              </h3>
              <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Real-time incoming customer visits with City location, product page, and acquisition source
              </p>
            </div>
            <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${isDark ? "bg-[#161D2E] text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              Auto-syncs every 25s
            </span>
          </div>

          {recentVisits.length === 0 ? (
            <div
              className={`text-center py-10 px-4 rounded-xl border ${
                isDark ? "bg-[#161D2E] border-[#1E293B] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <p className={`text-base font-bold mb-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                Awaiting real incoming visits...
              </p>
              <p className="text-xs sm:text-sm">
                Open <a href="https://www.kitepk.com" target="_blank" rel="noreferrer" className="text-sky-500 underline font-bold">kitepk.com</a> from your phone or browser to see live GPS/City entries stream in here!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead>
                  <tr
                    className={`border-b uppercase text-xs font-bold tracking-wider ${
                      isDark ? "border-[#1E293B] text-slate-400" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <th className="py-3.5 px-4">Location &bull; City</th>
                    <th className="py-3.5 px-4">Page Visited</th>
                    <th className="py-3.5 px-4">Source Channel</th>
                    <th className="py-3.5 px-4">Device</th>
                    <th className="py-3.5 px-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y font-mono ${
                    isDark ? "divide-[#1E293B]/70 text-slate-300" : "divide-slate-200 text-slate-700"
                  }`}
                >
                  {recentVisits.slice(0, 10).map((v, i) => {
                    const isUAE = v.country === "AE" || (v.city && (v.city.includes("Dubai") || v.city.includes("UAE")));
                    const isUK = v.country === "GB" || (v.city && v.city.includes("UK"));
                    const visitFlag = isUAE ? "🇦🇪" : isUK ? "🇬🇧" : "🇵🇰";

                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className={`py-3.5 px-4 font-bold flex items-center gap-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                          <span className="text-base">{visitFlag}</span>
                          <span>{v.city || "Pakistan"}</span>
                        </td>
                      <td className="py-3.5 px-4 text-sky-500 font-semibold">
                        {v.path || "/"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                            isDark
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {v.source || "direct"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-sans text-xs sm:text-sm">
                        {v.device || "mobile"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans text-xs sm:text-sm text-slate-400">
                        {getRelativeTime(v.timestamp)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
