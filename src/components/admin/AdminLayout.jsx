'use client';

import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from '@/components/RouterCompat';
import { colors } from "../../theme";
import NotificationCenter from "./NotificationCenter";
import ThemeToggleBtn from "./ThemeToggleBtn";
import InstallAppBtn from "./InstallAppBtn";
import { AdminThemeContext, AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import { Menu, X } from "lucide-react";
import { adminLogout } from "@/services/api";
import { AdminToaster } from "./AdminToast";
import AdminSidebar from "./AdminSidebar";
import toast from "react-hot-toast";

const AdminLayoutContent = ({ children, darkOverride }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark: contextDark } = useAdminTheme();

  // If darkOverride is passed explicitly use it, otherwise use context
  const isDark = darkOverride !== undefined ? darkOverride : contextDark;

  const PAGE_TITLES = {
    "/admin/dashboard": "Dashboard",
    "/admin/analytics": "Visitors & Analytics",
    "/admin/orders": "Orders",
    "/admin/products": "Products & Prices",
    "/admin/promotions": "Packages & Deals",
    "/admin/settings": "Settings",
  };
  const pageTitle = PAGE_TITLES[location.pathname] || "Admin";

  const handleLogout = async () => {
    await adminLogout();
    toast.success("You have been logged out.", { id: "admin-logout" });
    navigate("/admin/login");
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 text-sm ${
        isDark
          ? "bg-[#080C14] text-slate-100 admin-dark-theme dark"
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
            className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl animate-slide-in-left ${
              isDark ? "bg-[#0B0F19] text-white" : "bg-white text-slate-900"
            }`}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <AdminSidebar
              pathname={location.pathname}
              isDark={isDark}
              onNavigate={() => setMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR: Sticky, Flex Sibling, Never Overlaps Main View */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col w-[270px] shrink-0 sticky top-0 h-screen border-r transition-colors duration-200 z-30 select-none ${
          isDark ? "border-white/5 bg-[#0B0F19]" : "border-slate-200/80 bg-white"
        }`}
      >
        <AdminSidebar pathname={location.pathname} isDark={isDark} onLogout={handleLogout} />
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT VIEW: Natural Flex Sibling, Zero Overlap, Perfect Fit */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar */}
        <header
          className={`hidden md:flex items-center justify-between px-4 sm:px-6 py-3 border-b transition-colors duration-200 sticky top-0 z-20 backdrop-blur ${
            isDark
              ? "border-[#1E293B] bg-[#0B0F19]/90"
              : "border-slate-200 bg-white/90 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>Kite Admin</span>
            <span className={isDark ? "text-slate-600" : "text-slate-300"}>/</span>
            <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <InstallAppBtn variant="header" />
            <div className={`h-6 w-px ${isDark ? "bg-[#1E293B]" : "bg-slate-200"}`}></div>
            <ThemeToggleBtn variant="header" />
            <div className={`h-6 w-px ${isDark ? "bg-[#1E293B]" : "bg-slate-200"}`}></div>
            <NotificationCenter dark={isDark} />
          </div>
        </header>

        {/* Page Children Container */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 min-w-0">
          <div className="w-full max-w-[1720px] mx-auto min-w-0">{children}</div>
        </div>
        <AdminToaster />
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
