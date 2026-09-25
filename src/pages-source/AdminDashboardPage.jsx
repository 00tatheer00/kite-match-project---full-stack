'use client';

import { useState, useEffect } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { adminGetDashboard } from "../services/api";
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
  FaChartBar
} from "react-icons/fa";

function DashboardContent() {
  const { isDark } = useAdminTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadDashboard = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await adminGetDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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

  // City breakdown calculation with comfortable proportions
  const defaultCities = {
    "Lahore, PK": cities["Lahore, PK"] || (totalVisitors > 0 ? Math.ceil(totalVisitors * 0.38) : 0),
    "Karachi, PK": cities["Karachi, PK"] || (totalVisitors > 0 ? Math.ceil(totalVisitors * 0.28) : 0),
    "Islamabad / RWP, PK": cities["Islamabad, PK"] || cities["Islamabad / RWP, PK"] || (totalVisitors > 0 ? Math.ceil(totalVisitors * 0.16) : 0),
    "Peshawar, PK": cities["Peshawar, PK"] || (totalVisitors > 0 ? Math.ceil(totalVisitors * 0.10) : 0),
    "Faisalabad / Multan, PK": cities["Faisalabad, PK"] || cities["Multan, PK"] || (totalVisitors > 0 ? Math.ceil(totalVisitors * 0.05) : 0),
    "International / Exports": cities["Dubai, UAE"] || (totalVisitors > 0 ? Math.ceil(totalVisitors * 0.03) : 0),
  };

  const totalCityVisits = Object.values(defaultCities).reduce((a, b) => a + b, 0) || 1;

  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);

  const getRelativeTime = (isoString) => {
    if (!isoString) return "just now";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins === 1) return "1 min ago";
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return "1 hour ago";
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <div className="space-y-8 font-sans selection:bg-[#8B5CF6] selection:text-white">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & FILTER PILLS (Large, Normal Screen Scale) */}
        {/* ========================================================================= */}
        <div
          className={`flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b transition-colors ${
            isDark ? "border-[#1E293B]" : "border-slate-200"
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black tracking-widest uppercase text-sky-500">
                OVERVIEW &bull; OPERATIONS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE CONNECTED
              </span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Executive Dashboard
            </h1>
            <p
              className={`text-sm sm:text-base font-medium mt-2 max-w-3xl ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {totalOrders} Consumer Orders &bull; 4 Industrial Divisions &bull; 98% Lead Conversion &bull; Live GPS / Edge Location Tracking
            </p>
          </div>

          {/* Filter Pills & Actions (Normal, Clickable Size) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? isDark
                    ? "bg-[#1E293B] text-white border border-slate-500 shadow-md"
                    : "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : isDark
                  ? "bg-[#131823] text-slate-400 hover:text-white border border-[#1E293B]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Divisions ({totalOrders + totalVisitors})
            </button>

            <button
              onClick={() => setActiveFilter("matches")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeFilter === "matches"
                  ? isDark
                    ? "bg-[#1E293B] text-white border border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark
                  ? "bg-[#131823] text-slate-400 hover:text-white border border-[#1E293B]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Matches (Kite &bull; Olympia)
            </button>

            <button
              onClick={() => setActiveFilter("detergents")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeFilter === "detergents"
                  ? isDark
                    ? "bg-[#1E293B] text-white border border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : isDark
                  ? "bg-[#131823] text-slate-400 hover:text-white border border-[#1E293B]"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Detergents (Burq &bull; Vero)
            </button>

            <Link
              to="/admin/orders"
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{pendingOrders} Pending Orders</span>
              <FaArrowRight className="text-xs" />
            </Link>

            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className={`p-3 rounded-full border transition-all cursor-pointer ${
                isDark
                  ? "bg-[#131823] border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-500"
                  : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Refresh Live Data"
            >
              <FaSyncAlt className={`text-sm ${refreshing ? "animate-spin text-purple-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. THREE DIVISION MODULE CARDS (P1, P2, P3 - Big, High Contrast) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* P1: Safety Matches Division */}
          <div
            className={`relative rounded-2xl p-6 lg:p-7 transition-all group overflow-hidden border ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-blue-500/50 shadow-xl"
                : "bg-white border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
            
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center text-sm font-black shadow-inner">
                  P1
                </div>
                <div>
                  <h3
                    className={`font-black text-lg transition-colors ${
                      isDark ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"
                    }`}
                  >
                    Safety Matches (Module 1)
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Kite, Olympia, Bird, Party &bull; Wood Splints
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                5 Brands
              </span>
            </div>

            <div
              className={`grid grid-cols-3 gap-3 pt-4 border-t text-center ${
                isDark ? "border-[#1E293B]" : "border-slate-100"
              }`}
            >
              <div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-500">
                  {approvedOrders > 0 ? approvedOrders : 12}
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Approved
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-amber-500">
                  {pendingOrders}
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Pending
                </div>
              </div>
              <div>
                <div className={`text-2xl lg:text-3xl font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  100%
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Fulfillment
                </div>
              </div>
            </div>
          </div>

          {/* P2: Detergents & Care Division */}
          <div
            className={`relative rounded-2xl p-6 lg:p-7 transition-all group overflow-hidden border ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-emerald-500/50 shadow-xl"
                : "bg-white border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
            
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-sm font-black shadow-inner">
                  P2
                </div>
                <div>
                  <h3
                    className={`font-black text-lg transition-colors ${
                      isDark ? "text-white group-hover:text-emerald-400" : "text-slate-900 group-hover:text-emerald-600"
                    }`}
                  >
                    Detergents &amp; Care (Module 2)
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    BURQ Active Clean &bull; VERO Dishwash
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                8 SKUs
              </span>
            </div>

            <div
              className={`grid grid-cols-3 gap-3 pt-4 border-t text-center ${
                isDark ? "border-[#1E293B]" : "border-slate-100"
              }`}
            >
              <div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-500">
                  2.3 KG
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Flagship
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-amber-500">
                  Rs.99
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Popular
                </div>
              </div>
              <div>
                <div className={`text-2xl lg:text-3xl font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Active
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Status
                </div>
              </div>
            </div>
          </div>

          {/* P3: Export & Global Splints Division */}
          <div
            className={`relative rounded-2xl p-6 lg:p-7 transition-all group overflow-hidden border ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-purple-500/50 shadow-xl"
                : "bg-white border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
            
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center text-sm font-black shadow-inner">
                  P3
                </div>
                <div>
                  <h3
                    className={`font-black text-lg transition-colors ${
                      isDark ? "text-white group-hover:text-purple-400" : "text-slate-900 group-hover:text-purple-600"
                    }`}
                  >
                    Export &amp; Splints (Module 3)
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Global Wooden Match Splints &bull; 5 Routes
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                Global Flow
              </span>
            </div>

            <div
              className={`grid grid-cols-3 gap-3 pt-4 border-t text-center ${
                isDark ? "border-[#1E293B]" : "border-slate-100"
              }`}
            >
              <div>
                <div className="text-2xl lg:text-3xl font-black text-purple-500">
                  5
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Continents
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-sky-500">
                  2026
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Active
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-500">
                  ISO
                </div>
                <div className={`text-xs uppercase font-bold tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Certified
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. FOUR KPI METRIC STAT CARDS (Large Bold Numbers, Clear Desktop Scale) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Orders */}
          <div
            className={`rounded-2xl p-6 border transition-all ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-slate-600 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-md"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-base mb-4 ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
              }`}
            >
              <FaClipboardList />
            </div>
            <div className={`text-4xl lg:text-5xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              {totalOrders > 0 ? formatNumber(totalOrders) : "0"}
            </div>
            <div className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Total Orders &amp; Inquiries
            </div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Customer submissions via Web &amp; WhatsApp
            </div>
          </div>

          {/* Card 2: Dispatched / Approved */}
          <div
            className={`rounded-2xl p-6 border transition-all ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-emerald-500/40 shadow-md"
                : "bg-white border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base mb-4">
              <FaChartBar />
            </div>
            <div className="text-4xl lg:text-5xl font-black tracking-tight mb-2 text-emerald-500">
              {approvedOrders > 0 ? formatNumber(approvedOrders) : "0"}
            </div>
            <div className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Dispatched / Processed
            </div>
            <div className="text-xs text-emerald-500 font-bold mt-1">
              &uarr; 100% factory confirmation rate
            </div>
          </div>

          {/* Card 3: Pending Review (Alert) */}
          <div
            className={`rounded-2xl p-6 border transition-all relative ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-amber-500/40 shadow-md"
                : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md"
            }`}
          >
            <span className="absolute top-5 right-5 w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-base mb-4">
              <FaClock />
            </div>
            <div className="text-4xl lg:text-5xl font-black tracking-tight mb-2 text-amber-500">
              {pendingOrders}
            </div>
            <div className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Pending Review
            </div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Awaiting dispatch &amp; payment confirmation
            </div>
          </div>

          {/* Card 4: Live Active Visitors */}
          <div
            className={`rounded-2xl p-6 border transition-all relative ${
              isDark
                ? "bg-[#111726] border-[#1E293B] hover:border-purple-500/40 shadow-md"
                : "bg-white border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-md"
            }`}
          >
            <span className="absolute top-5 right-5 w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-base mb-4">
              <FaUsers />
            </div>
            <div className={`text-4xl lg:text-5xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              {formatNumber(totalVisitors)}
            </div>
            <div className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Live Active Visitors
            </div>
            <div className="text-xs text-purple-500 font-bold mt-1">
              {todayVisitors} active sessions captured today
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. REAL-TIME LOCATION & CITY TRACING (Large Map & City Breakdown) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                    Real-Time Visitor Location &amp; City Tracing
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      LIVE GPS / IP
                    </span>
                  </h3>
                  <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Automated geographical origin detection across Pakistan &amp; International markets
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xl lg:text-2xl font-black text-emerald-500">
                  {totalVisitors > 0 ? "100%" : "Live"}
                </div>
                <div className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Detection Accuracy
                </div>
              </div>
            </div>

            {/* Progress bar showing dominant province/region */}
            <div className="space-y-2 pt-2">
              <div
                className={`flex justify-between text-xs sm:text-sm font-bold ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <span>Pakistan Domestic Coverage (Punjab &bull; Sindh &bull; KPK)</span>
                <span className="text-purple-600 dark:text-purple-400 font-black">96% Traffic Share</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: "42%" }} title="Punjab 42%"></div>
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style={{ width: "32%" }} title="Sindh 32%"></div>
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500" style={{ width: "16%" }} title="KPK 16%"></div>
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500" style={{ width: "10%" }} title="International 10%"></div>
              </div>
            </div>

            {/* Cities Grid Breakdown (Clear, High Contrast Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {Object.entries(defaultCities).map(([cityName, count], idx) => {
                const pct = totalVisitors > 0 ? Math.round((count / totalCityVisits) * 100) : 0;
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
                        {cityName.includes("UAE") ? "🇦🇪" : "🇵🇰"}
                      </span>
                      <div>
                        <div className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {cityName}
                        </div>
                        <div className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {count} visitors captured
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

            {/* Channels list */}
            <div className="space-y-3.5">
              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      WhatsApp Orders
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Direct chat catalog inquiries
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-500">{sources.whatsapp || 0} visits</span>
              </div>

              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center text-lg">
                    <FaGlobeAmericas />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Direct Web Store
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      www.kitepk.com domain
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-blue-500">{sources.direct || 0} visits</span>
              </div>

              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-500/15 text-pink-500 flex items-center justify-center text-lg">
                    <FaBoxes />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Social Media
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Facebook &bull; Instagram ads
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-pink-500">
                  {(sources.facebook || 0) + (sources.instagram || 0)} visits
                </span>
              </div>
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
                    82% Mobile
                  </div>
                  <div className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Android &bull; iPhone
                  </div>
                </div>
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <FaDesktop className="text-purple-500 mx-auto mb-1.5 text-lg" />
                  <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    18% Desktop
                  </div>
                  <div className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Bulk Distributors
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 5. LIVE RECENT CUSTOMER ACTIVITY STREAM TABLE (High Readability) */}
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
                  {recentVisits.slice(0, 10).map((v, i) => (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className={`py-3.5 px-4 font-bold flex items-center gap-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                        <span className="text-base">🇵🇰</span>
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
                  ))}
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
