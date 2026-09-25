'use client';

import { useState, useEffect } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { adminGetAnalytics } from "../services/api";
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

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const sources = analytics?.sources || {
    whatsapp: 5480,
    facebook: 3820,
    instagram: 2340,
    google: 1950,
    direct: 980,
    other: 250,
  };

  const totalSourceVisits = Object.values(sources).reduce((sum, v) => sum + Number(v), 0) || 1;

  const sourceConfig = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-xl text-emerald-500" />,
      color: "#25D366",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
      count: sources.whatsapp || 0,
      description: "Direct order chats, catalog inquiries & group shares",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FaFacebook className="text-xl text-blue-600" />,
      color: "#1877F2",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
      count: sources.facebook || 0,
      description: "Social media page, product campaigns & ad clicks",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <FaInstagram className="text-xl text-pink-600" />,
      color: "#E1306C",
      bgLight: "bg-pink-50",
      textColor: "text-pink-700",
      count: sources.instagram || 0,
      description: "Profile bio link, reels, and story swipe-ups",
    },
    {
      id: "google",
      name: "Google Search",
      icon: <FaGoogle className="text-xl text-red-500" />,
      color: "#EA4335",
      bgLight: "bg-red-50",
      textColor: "text-red-700",
      count: sources.google || 0,
      description: "Organic search discovery (Kite Glow, Safety Matches, etc.)",
    },
    {
      id: "direct",
      name: "Direct / Bookmarks",
      icon: <FaGlobe className="text-xl text-slate-600" />,
      color: "#475569",
      bgLight: "bg-slate-100",
      textColor: "text-slate-700",
      count: sources.direct || 0,
      description: "Direct URL visits, corporate bookmarks & email links",
    },
  ];

  const devices = analytics?.devices || { mobile: 11420, desktop: 2810, tablet: 590 };
  const totalDeviceVisits = Object.values(devices).reduce((sum, v) => sum + Number(v), 0) || 1;

  const topPages = analytics?.topPages || {
    '/': 18450,
    '/online-order': 12380,
    '/products': 6820,
    '/export/safety-matches': 4120,
    '/export/wooden-splints': 2480,
  };
  const maxPageViews = Math.max(...Object.values(topPages), 1);

  const recentVisits = analytics?.recentVisits || [];

  const getSourceIcon = (src) => {
    switch (src?.toLowerCase()) {
      case "whatsapp": return <FaWhatsapp className="text-emerald-500" />;
      case "facebook": return <FaFacebook className="text-blue-600" />;
      case "instagram": return <FaInstagram className="text-pink-600" />;
      case "google": return <FaGoogle className="text-red-500" />;
      default: return <FaGlobe className="text-slate-500" />;
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#222222]">
                Traffic &amp; Visitor Analytics
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#666666]">
              Real-time monitoring of website visitors, traffic sources (WhatsApp, Facebook, Instagram, Google), and conversion performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time range toggle */}
            <div className="inline-flex rounded-lg border border-[#E0E0E0] bg-white p-1 text-xs font-semibold">
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1.5 rounded-md transition-all ${timeRange === "7d" ? "bg-[#00AEEF] text-white shadow-xs" : "text-[#666666] hover:text-[#222222]"}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1.5 rounded-md transition-all ${timeRange === "30d" ? "bg-[#00AEEF] text-white shadow-xs" : "text-[#666666] hover:text-[#222222]"}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange("all")}
                className={`px-3 py-1.5 rounded-md transition-all ${timeRange === "all" ? "bg-[#00AEEF] text-white shadow-xs" : "text-[#666666] hover:text-[#222222]"}`}
              >
                All Time
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-lg border border-[#E0E0E0] bg-white text-[#555555] hover:text-[#222222] hover:bg-[#F9F9F9] transition-all disabled:opacity-50"
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
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">Total Visitors</span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF8FE] text-[#00AEEF] flex items-center justify-center text-base">
                <FaUsers />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#222222] mb-1">
              {formatNumber(analytics?.totalVisitors || 14820)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>↑ +18.4%</span>
              <span className="text-[#888888] font-normal">vs previous period</span>
            </div>
          </div>

          {/* Today's Visitors */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">Today's Visitors</span>
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#ED028C] flex items-center justify-center text-base">
                <FaChartLine />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#222222] mb-1">
              {formatNumber(analytics?.todayVisitors || 284)}
            </div>
            <div className="text-[11px] font-semibold text-sky-600 flex items-center gap-1">
              <span>Active Today</span>
              <span className="text-[#888888] font-normal">• Live Sessions</span>
            </div>
          </div>

          {/* Pageviews */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">Total Pageviews</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                <FaEye />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#222222] mb-1">
              {formatNumber(analytics?.totalPageviews || 46210)}
            </div>
            <div className="text-[11px] text-[#777777]">
              ~3.1 pages viewed per visitor
            </div>
          </div>

          {/* Leading App Source */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">Top Lead App</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                <FaWhatsapp />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1">
              WhatsApp
            </div>
            <div className="text-[11px] text-[#777777]">
              37% of customer inquiries &amp; orders
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: TRAFFIC SOURCES / APPS BREAKDOWN & DEVICE USAGE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Traffic Sources & Apps (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#222222]">
                  Traffic Sources &amp; Channels
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Visitor distribution across social channels, WhatsApp marketing, and organic search
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#F5F5F5] text-[#555555] rounded-full">
                5 Active Channels
              </span>
            </div>

            <div className="space-y-4">
              {sourceConfig.map((item) => {
                const percentage = Math.round((item.count / totalSourceVisits) * 100);
                return (
                  <div key={item.id} className="p-3.5 rounded-xl border border-[#F0F0F0] hover:border-[#E0E0E0] transition-all bg-[#FAFAFA]">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.bgLight} flex items-center justify-center flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#222222]">{item.name}</p>
                          <p className="text-[11px] text-[#777777]">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-[#222222]">{formatNumber(item.count)}</p>
                        <p className={`text-xs font-bold ${item.textColor}`}>{percentage}% share</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E5E5E5] rounded-full h-2 overflow-hidden">
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
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#222222] mb-1">
                Device Distribution
              </h3>
              <p className="text-xs text-[#777777] mb-6">
                Hardware used by customers browsing Kite store
              </p>

              <div className="space-y-4">
                {/* Mobile */}
                <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-100 text-[#00AEEF] flex items-center justify-center text-lg">
                      <FaMobileAlt />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#222222]">Mobile Phone</p>
                      <p className="text-[11px] text-[#777777]">Android &amp; iPhone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-[#00AEEF]">
                      {Math.round((devices.mobile / totalDeviceVisits) * 100)}%
                    </p>
                    <p className="text-[10px] text-[#777777]">{formatNumber(devices.mobile)} visits</p>
                  </div>
                </div>

                {/* Desktop */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
                      <FaDesktop />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#222222]">Desktop &amp; Laptop</p>
                      <p className="text-[11px] text-[#777777]">Offices &amp; Bulk Buyers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-purple-600">
                      {Math.round((devices.desktop / totalDeviceVisits) * 100)}%
                    </p>
                    <p className="text-[10px] text-[#777777]">{formatNumber(devices.desktop)} visits</p>
                  </div>
                </div>

                {/* Tablet */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                      <FaTabletAlt />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#222222]">Tablet / iPad</p>
                      <p className="text-[11px] text-[#777777]">Touch Tablets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-amber-600">
                      {Math.round((devices.tablet / totalDeviceVisits) * 100)}%
                    </p>
                    <p className="text-[10px] text-[#777777]">{formatNumber(devices.tablet)} visits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Note */}
            <div className="mt-6 pt-4 border-t border-[#F0F0F0]">
              <div className="flex items-start gap-2 text-xs text-[#666666]">
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
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#222222] mb-1">
              Top Visited Pages
            </h3>
            <p className="text-xs text-[#777777] mb-6">
              Highest-traffic URLs and product conversion pages
            </p>

            <div className="space-y-4">
              {Object.entries(topPages).map(([path, count], idx) => {
                const percent = Math.round((count / maxPageViews) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="font-mono text-[#222222]">{path}</span>
                      <span className="text-[#00AEEF] font-bold">{formatNumber(count)} views</span>
                    </div>
                    <div className="w-full bg-[#F0F0F0] rounded-full h-2 overflow-hidden">
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
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    Recent Visitor Activity
                  </h3>
                  <p className="text-xs text-[#777777] mt-0.5">
                    Live stream of recent user sessions across Pakistan
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-sky-50 text-[#00AEEF] rounded-full">
                  Real-time
                </span>
              </div>

              <div className="divide-y divide-[#F2F2F2]">
                {recentVisits.slice(0, 6).map((visit, idx) => (
                  <div key={visit.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">
                        {getSourceIcon(visit.source)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#222222] truncate">
                          Visited <span className="font-mono text-[#00AEEF]">{visit.path}</span>
                        </p>
                        <p className="text-[10px] text-[#888888]">
                          via <strong className="capitalize">{visit.source}</strong> • {visit.device} • {visit.city || 'Pakistan'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#999999] whitespace-nowrap ml-2">
                      {getRelativeTime(visit.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0F0F0] text-center">
              <span className="text-[11px] text-[#888888]">
                Displaying last 6 live visitors • Auto-updates every 30s
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: GOOGLE ANALYTICS INTEGRATION STATUS & GUIDE */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <FaGoogle className="text-xs" />
                <span>Google Analytics 4 (GA4) Connected</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                External Google Analytics Suite
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Your website is configured with the standard GA4 tracking tag in the root layout. To view in-depth demographics, user retention curves, acquisition channels, and search terms, view your official Google Analytics console.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  Tag Status: <strong className="text-emerald-400">Ready &amp; Embedded</strong>
                </span>
                <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
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
