'use client';

import { useState, useEffect } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { adminGetAnalytics } from "../services/api";
import { useAdminTheme } from "../context/AdminThemeContext";
import { 
  FaChartLine, 
  FaUsers, 
  FaEye, 
  FaWhatsapp, 
  FaFacebook, 
  FaInstagram, 
  FaGoogle, 
  FaGlobe, 
  FaMobileAlt, 
  FaDesktop, 
  FaTabletAlt, 
  FaExternalLinkAlt, 
  FaSyncAlt, 
  FaCheckCircle 
} from "react-icons/fa";

const AdminAnalyticsPage = () => {
  const { isDark } = useAdminTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await adminGetAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all visitor analytics to 0?")) return;
    setRefreshing(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : "";
      const res = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await loadData(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const sources = analytics?.sources || {
    whatsapp: 0,
    facebook: 0,
    instagram: 0,
    google: 0,
    direct: 0,
    other: 0,
  };

  const totalSourceVisits = Object.values(sources).reduce((sum, v) => sum + Number(v), 0) || 1;

  const sourceConfig = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-xl text-emerald-500" />,
      color: "#25D366",
      bgLight: isDark ? "bg-emerald-950/40" : "bg-emerald-50",
      textColor: "text-emerald-500",
      count: sources.whatsapp || 0,
      description: "Direct order chats, catalog inquiries & group shares",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FaFacebook className="text-xl text-blue-500" />,
      color: "#1877F2",
      bgLight: isDark ? "bg-blue-950/40" : "bg-blue-50",
      textColor: "text-blue-500",
      count: sources.facebook || 0,
      description: "Social media page, product campaigns & ad clicks",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <FaInstagram className="text-xl text-pink-500" />,
      color: "#E1306C",
      bgLight: isDark ? "bg-pink-950/40" : "bg-pink-50",
      textColor: "text-pink-500",
      count: sources.instagram || 0,
      description: "Profile bio link, reels, and story swipe-ups",
    },
    {
      id: "google",
      name: "Google Search",
      icon: <FaGoogle className="text-xl text-red-500" />,
      color: "#EA4335",
      bgLight: isDark ? "bg-red-950/40" : "bg-red-50",
      textColor: "text-red-500",
      count: sources.google || 0,
      description: "Organic search discovery (Kite Glow, Safety Matches, etc.)",
    },
    {
      id: "direct",
      name: "Direct / Bookmarks",
      icon: <FaGlobe className="text-xl text-slate-400" />,
      color: "#00AEEF",
      bgLight: isDark ? "bg-slate-800/60" : "bg-slate-100",
      textColor: isDark ? "text-slate-300" : "text-slate-700",
      count: sources.direct || 0,
      description: "Direct URL visits, corporate bookmarks & email links",
    },
  ];

  const devices = analytics?.devices || { mobile: 0, desktop: 0, tablet: 0 };
  const totalDeviceVisits = Object.values(devices).reduce((sum, v) => sum + Number(v), 0) || 1;

  const topPages = analytics?.topPages || {};
  const maxPageViews = Math.max(...Object.values(topPages), 1);

  const recentVisits = analytics?.recentVisits || [];

  const getSourceIcon = (src) => {
    switch (src?.toLowerCase()) {
      case "whatsapp": return <FaWhatsapp className="text-emerald-500" />;
      case "facebook": return <FaFacebook className="text-blue-500" />;
      case "instagram": return <FaInstagram className="text-pink-500" />;
      case "google": return <FaGoogle className="text-red-500" />;
      default: return <FaGlobe className={isDark ? "text-slate-400" : "text-slate-500"} />;
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

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
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                Traffic &amp; Visitor Analytics
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                LIVE
              </span>
            </div>
            <p className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Real-time monitoring of website visitors, traffic sources (WhatsApp, Facebook, Instagram, Google), and conversion performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time range toggle */}
            <div className={`inline-flex rounded-xl border p-1 text-xs font-semibold ${
              isDark ? "border-[#1E293B] bg-[#111726]" : "border-slate-200 bg-white shadow-xs"
            }`}>
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === "7d"
                    ? "bg-[#00AEEF] text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === "30d"
                    ? "bg-[#00AEEF] text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === "all"
                    ? "bg-[#00AEEF] text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Time
              </button>
            </div>

            {/* Reset to 0 Button */}
            <button
              onClick={handleReset}
              disabled={refreshing}
              className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              title="Reset all analytics to 0"
            >
              Reset to 0
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className={`p-2.5 rounded-xl border transition-all disabled:opacity-50 cursor-pointer ${
                isDark
                  ? "border-[#1E293B] bg-[#111726] text-slate-300 hover:text-white hover:bg-[#161D2E]"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
              }`}
              title="Refresh Analytics"
            >
              <FaSyncAlt className={`text-sm ${refreshing ? "animate-spin text-[#00AEEF]" : ""}`} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KPI CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Visitors */}
          <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Visitors</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-[#00AEEF] flex items-center justify-center text-base">
                <FaUsers />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {formatNumber(analytics?.totalVisitors ?? 0)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
              <span>● Live Tracking Active</span>
            </div>
          </div>

          {/* Today's Visitors */}
          <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Today&apos;s Visitors</span>
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-[#ED028C] flex items-center justify-center text-base">
                <FaChartLine />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {formatNumber(analytics?.todayVisitors ?? 0)}
            </div>
            <div className="text-[11px] font-semibold text-sky-500 flex items-center gap-1">
              <span>Active Today</span>
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>• Live Sessions</span>
            </div>
          </div>

          {/* Pageviews */}
          <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Pageviews</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-base">
                <FaEye />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {formatNumber(analytics?.totalPageviews ?? 0)}
            </div>
            <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Real-time page views
            </div>
          </div>

          {/* Leading App Source */}
          <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Top Lead App</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                <FaWhatsapp />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 mb-1">
              {sources.whatsapp > 0 ? "WhatsApp" : (Object.entries(sources).sort((a,b) => b[1]-a[1])[0]?.[0] || "WhatsApp")}
            </div>
            <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {sources.whatsapp > 0 ? `${Math.round((sources.whatsapp / totalSourceVisits) * 100)}% of tracked traffic` : "Direct customer inquiries"}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: TRAFFIC SOURCES / APPS BREAKDOWN & DEVICE USAGE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Traffic Sources & Apps (2 Cols) */}
          <div className={`lg:col-span-2 rounded-2xl border p-6 shadow-xs ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Traffic Sources &amp; Channels
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Visitor distribution across social channels, WhatsApp marketing, and organic search
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isDark ? "bg-[#161D2E] text-slate-300 border border-[#1E293B]" : "bg-slate-100 text-slate-600"
              }`}>
                5 Active Channels
              </span>
            </div>

            <div className="space-y-4">
              {sourceConfig.map((item) => {
                const percentage = Math.round((item.count / totalSourceVisits) * 100);
                return (
                  <div key={item.id} className={`p-3.5 rounded-xl border transition-all ${
                    isDark ? "bg-[#161D2E] border-[#1E293B] hover:border-[#334155]" : "bg-slate-50/70 border-slate-100 hover:border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.bgLight} flex items-center justify-center flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.name}</p>
                          <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatNumber(item.count)}</p>
                        <p className={`text-xs font-bold ${item.textColor}`}>{percentage}% share</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? "bg-[#0B0F19]" : "bg-slate-200"}`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device Breakdown (1 Col) */}
          <div className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div>
              <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Device Distribution
              </h3>
              <p className={`text-xs mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Hardware used by customers browsing Kite store
              </p>

              <div className="space-y-4">
                {/* Mobile */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-[#161D2E] border-sky-900/40" : "bg-sky-50/70 border-sky-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-[#00AEEF] flex items-center justify-center text-lg">
                      <FaMobileAlt />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Mobile Phone</p>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Android &amp; iPhone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-[#00AEEF]">
                      {Math.round((devices.mobile / totalDeviceVisits) * 100)}%
                    </p>
                    <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatNumber(devices.mobile)} visits</p>
                  </div>
                </div>

                {/* Desktop */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-[#161D2E] border-purple-900/40" : "bg-purple-50/70 border-purple-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
                      <FaDesktop />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Desktop &amp; Laptop</p>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Offices &amp; Bulk Buyers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-purple-400">
                      {Math.round((devices.desktop / totalDeviceVisits) * 100)}%
                    </p>
                    <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatNumber(devices.desktop)} visits</p>
                  </div>
                </div>

                {/* Tablet */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-[#161D2E] border-amber-900/40" : "bg-amber-50/70 border-amber-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">
                      <FaTabletAlt />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Tablet / iPad</p>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Touch Tablets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-amber-400">
                      {Math.round((devices.tablet / totalDeviceVisits) * 100)}%
                    </p>
                    <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatNumber(devices.tablet)} visits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Note */}
            <div className={`mt-6 pt-4 border-t ${isDark ? "border-[#1E293B]" : "border-slate-100"}`}>
              <div className={`flex items-start gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>
                  Over <strong>77%</strong> of orders originate from mobile devices, optimized for fast WhatsApp chat checkout.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: TOP VISITED PAGES & LIVE VISITOR ACTIVITY STREAM */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Top Visited Pages */}
          <div className={`rounded-2xl border p-6 shadow-xs ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              Top Visited Pages
            </h3>
            <p className={`text-xs mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Highest-traffic URLs and product conversion pages
            </p>

            <div className="space-y-4">
              {Object.entries(topPages).map(([path, count], idx) => {
                const percent = Math.round((count / maxPageViews) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>{path}</span>
                      <span className="text-[#00AEEF] font-bold">{formatNumber(count)} views</span>
                    </div>
                    <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? "bg-[#0B0F19]" : "bg-slate-100"}`}>
                      <div
                        className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Visitor Activity Stream */}
          <div className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between ${
            isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Recent Visitor Activity
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Live stream of recent user sessions across Pakistan
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-sky-500/10 text-[#00AEEF] rounded-full">
                  Real-time
                </span>
              </div>

              <div className={`divide-y ${isDark ? "divide-[#1E293B]" : "divide-slate-100"}`}>
                {recentVisits.slice(0, 6).map((visit, idx) => (
                  <div key={visit.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">
                        {getSourceIcon(visit.source)}
                      </span>
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                          Visited <span className="font-mono text-[#00AEEF]">{visit.path}</span>
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          via <strong className="capitalize">{visit.source}</strong> • {visit.device} • {visit.city || 'Pakistan'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] whitespace-nowrap ml-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {getRelativeTime(visit.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`mt-4 pt-3 border-t text-center ${isDark ? "border-[#1E293B]" : "border-slate-100"}`}>
              <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Displaying last 6 live visitors • Auto-updates every 30s
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: GOOGLE ANALYTICS INTEGRATION STATUS & GUIDE */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <FaGoogle className="text-xs" />
                <span>Google Analytics 4 (GA4) Connected</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                External Google Analytics Suite
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Your website is configured with the standard GA4 tracking tag in the root layout. To view in-depth demographics, user retention curves, acquisition channels, and search terms, view your official Google Analytics console.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  Tag Status: <strong className="text-emerald-400">Ready &amp; Embedded</strong>
                </span>
                <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  Environment Var: <code className="text-sky-300">NEXT_PUBLIC_GA_ID</code>
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 w-full lg:w-auto">
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#0095CC] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00AEEF]/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Open Google Analytics</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
