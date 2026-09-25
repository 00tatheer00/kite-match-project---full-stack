'use client';

import { Link, useLocation, useNavigate } from '@/components/RouterCompat';
import { colors } from "../../theme";
import NotificationCenter from "./NotificationCenter";
import ThemeToggleBtn from "./ThemeToggleBtn";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";

const AdminLayoutContent = ({ children, darkOverride }) => {
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
          ? "bg-[#080C14] text-slate-100"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION (Broad, Clear, Readable Desktop Scale) */}
      {/* ========================================================================= */}
      <aside
        className={`w-full md:w-72 lg:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r transition-colors duration-200 ${
          isDark
            ? "border-[#1E293B] bg-[#0B0F19]"
            : "border-slate-200 bg-white shadow-sm"
        }`}
      >
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
        <div className="p-4 lg:p-5 flex flex-col justify-between h-[calc(100%-95px)]">
          <nav className="space-y-2 text-sm lg:text-base">
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

          {/* Sidebar Footer: Mode Toggle & Logout */}
          <div className="pt-6 space-y-3 border-t border-slate-200/60 dark:border-slate-800">
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
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT VIEW (Expansive Wide Layout, Normal Desktop Scale) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header
          className={`flex items-center justify-between px-6 sm:px-8 lg:px-10 py-4 border-b transition-colors duration-200 ${
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

          {/* Header Controls: Theme Toggle & Notification Bell */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggleBtn variant="header" />
            <div className={`h-6 w-px ${isDark ? "bg-[#1E293B]" : "bg-slate-200"}`}></div>
            <NotificationCenter dark={isDark} />
          </div>
        </header>

        {/* Page Children Container - Normal wide desktop screen */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-[1720px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default function AdminLayout(props) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent {...props} />
    </AdminThemeProvider>
  );
}
