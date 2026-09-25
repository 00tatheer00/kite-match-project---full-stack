'use client';

import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from '@/components/RouterCompat';
import { colors } from "../../theme";
import NotificationCenter from "./NotificationCenter";
import ThemeToggleBtn from "./ThemeToggleBtn";
import InstallAppBtn from "./InstallAppBtn";
import { AdminThemeContext, AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import { Menu, X } from "lucide-react";

const AdminLayoutContent = ({ children, darkOverride }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark: contextDark } = useAdminTheme();

  // If darkOverride is passed explicitly use it, otherwise use context
  const isDark = darkOverride !== undefined ? darkOverride : contextDark;

  const links = [
    { to: "/admin/dashboard", label: "Executive Dashboard", badge: "LIVE" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/promotions", label: "Promotions" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/analytics", label: "Traffic & Analytics" },
    { to: "/admin/settings", label: "Settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 text-base ${
        isDark
          ? "bg-[#080C14] text-slate-100 admin-dark-theme"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* ========================================================================= */}
      {/* MOBILE TOP BAR (Only visible on screens < md) */}
      {/* ========================================================================= */}
      <header
        className={`md:hidden sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isDark
            ? "border-[#1E293B] bg-[#0B0F19]/95"
            : "border-slate-200 bg-white/95 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-black text-lg tracking-tight" style={{ color: isDark ? "#38BDF8" : colors.primary.main }}>
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <InstallAppBtn variant="header" />
          <ThemeToggleBtn variant="header" />
          <NotificationCenter dark={isDark} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? "border-[#1E293B] bg-[#161D2E] text-slate-300 hover:text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER OVERLAY & MENU (Screens < md) */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over Drawer */}
          <div
            className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 flex flex-col justify-between p-5 border-r shadow-2xl overflow-y-auto animate-slide-in-left ${
              isDark ? "bg-[#0B0F19] border-[#1E293B] text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-black text-xl" style={{ color: isDark ? "#38BDF8" : colors.primary.main }}>
                    Admin Panel
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="py-4 space-y-1.5">
                {links.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        active
                          ? isDark
                            ? "bg-[#161D2E] text-sky-400 font-bold border border-sky-500/40"
                            : "bg-sky-50 text-[#0095CC] font-bold border border-sky-200"
                          : isDark
                            ? "hover:bg-[#161D2E] text-slate-300 hover:text-white"
                            : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* PWA Install Button in Drawer */}
              <div className="pt-2">
                <InstallAppBtn variant="sidebar" />
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-5 border-t border-inherit space-y-3">
              <ThemeToggleBtn variant="sidebar" />
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all font-medium text-sm flex items-center justify-between ${
                  isDark
                    ? "border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#161D2E]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Logout Admin</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Strictly Fixed 288px Width, Sticky Full Desktop Height) */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex md:w-72 md:min-w-[18rem] md:max-w-[18rem] flex-shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto flex-col justify-between border-r transition-colors duration-200 z-40 ${
          isDark
            ? "border-[#1E293B] bg-[#0B0F19]"
            : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`px-6 py-6 lg:py-7 border-b transition-colors ${
              isDark ? "border-[#1E293B]" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{ color: isDark ? "#38BDF8" : colors.primary.main }}
                >
                  Admin Panel
                </h1>
              </div>
            </div>
            <p
              className={`mt-1.5 text-xs font-medium tracking-wide uppercase ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Kite Matches &bull; Chemicals &bull; FMCG
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 lg:p-5 space-y-2 text-sm lg:text-base">
            {links.map((link) => {
              const active = location.pathname === link.to;
              if (isDark) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium ${
                      active
                        ? "bg-[#161D2E] text-sky-400 font-bold border border-sky-500/40 shadow-md shadow-sky-500/5 translate-x-1"
                        : "hover:bg-[#131823] text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="tracking-wide">{link.label}</span>
                    {link.badge && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium ${
                    active
                      ? "bg-sky-50 text-[#0095CC] font-bold border border-sky-200 shadow-sm translate-x-1"
                      : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span className="tracking-wide">{link.label}</span>
                  {link.badge && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-sky-100 text-[#0095CC] border border-sky-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: PWA Install App Option, Theme Toggle & Logout */}
        <div
          className={`p-4 lg:p-5 space-y-3.5 border-t transition-colors ${
            isDark ? "border-[#1E293B]" : "border-slate-200"
          }`}
        >
          {/* Option: Install App */}
          <InstallAppBtn variant="sidebar" />

          {/* Theme Toggle Button inside sidebar */}
          <ThemeToggleBtn variant="sidebar" />

          <button
            onClick={handleLogout}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all font-medium text-sm cursor-pointer flex items-center justify-between ${
              isDark
                ? "border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#131823] hover:border-slate-600"
                : "border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Logout Admin</span>
            <span className="text-xs opacity-60">&rarr;</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT VIEW (Expansive Wide Layout, Normal Desktop Scale) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header
          className={`hidden md:flex items-center justify-between px-6 sm:px-8 lg:px-10 py-4 border-b transition-colors duration-200 ${
            isDark
              ? "border-[#1E293B] bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30"
              : "border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30 shadow-xs"
          }`}
        >
          {/* Quick Breadcrumb / Context */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                isDark
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Kite Executive
            </span>
            <span className="hidden sm:inline text-xs font-medium text-slate-400">
              Live Factory &amp; Consumer Portal
            </span>
          </div>

          {/* Header Controls: Install App, Theme Toggle & Notification Bell */}
          <div className="flex items-center gap-3 sm:gap-4">
            <InstallAppBtn variant="header" />
            <div className={`h-6 w-px ${isDark ? "bg-[#1E293B]" : "bg-slate-200"}`}></div>
            <ThemeToggleBtn variant="header" />
            <div className={`h-6 w-px ${isDark ? "bg-[#1E293B]" : "bg-slate-200"}`}></div>
            <NotificationCenter dark={isDark} />
          </div>
        </header>

        {/* Page Children Container - 100% responsive on mobile, tablet & large desktop */}
        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0">
          <div className="w-full max-w-[1720px] mx-auto min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default function AdminLayout(props) {
  const themeCtx = useContext(AdminThemeContext);
  if (themeCtx && themeCtx.mounted !== undefined) {
    return <AdminLayoutContent {...props} />;
  }
  return (
    <AdminThemeProvider>
      <AdminLayoutContent {...props} />
    </AdminThemeProvider>
  );
}
