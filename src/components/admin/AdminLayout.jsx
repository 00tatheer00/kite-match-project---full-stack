'use client';

import { Link, useLocation, useNavigate } from '@/components/RouterCompat';
import { colors } from "../../theme";
import NotificationCenter from "./NotificationCenter";

const AdminLayout = ({ children, dark }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDark = dark !== undefined ? dark : (location.pathname === '/admin' || location.pathname.startsWith('/admin/dashboard'));

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
    <div className={`min-h-screen flex flex-col md:flex-row ${
      isDark ? "bg-[#080C14] text-slate-100" : "bg-gradient-to-br from-white via-[#F9F9F9] to-white text-[#222222]"
    }`}>
      <aside className={`w-full md:w-68 border-b md:border-b-0 md:border-r ${
        isDark ? "border-[#1E293B] bg-[#0B0F19]" : "border-[#E0E0E0] bg-white/80 backdrop-blur"
      }`}>
        <div className={`px-7 py-6 border-b ${isDark ? "border-[#1E293B]" : "border-[#E0E0E0]"}`}>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: isDark ? "#38BDF8" : colors.primary.main }}>
              Admin Panel
            </h1>
            {isDark && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </div>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : ""}`} style={isDark ? {} : { color: colors.text.secondary }}>
            Kite Products &amp; Promotions
          </p>
        </div>
        <nav className="px-4 py-5 grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
          {links.map((link) => {
            const active = location.pathname === link.to;
            if (isDark) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    active 
                      ? "bg-[#161D2E] text-sky-400 font-semibold border border-sky-500/30 shadow-sm" 
                      : "hover:bg-[#131823] text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors ${
                  active ? "bg-[#EAF8FE] text-[#0095CC] font-semibold" : "hover:bg-[#F9F9F9] text-[#222222]"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className={`md:mt-3 w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors ${
              isDark 
                ? "border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#131823]" 
                : "border-[#E0E0E0] text-[#222222] hover:bg-[#F9F9F9]"
            }`}
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className={`flex-1 flex flex-col ${isDark ? "bg-[#080C14]" : ""}`}>
        <div className={`flex justify-end p-4 md:px-8 border-b ${
          isDark 
            ? "border-[#1E293B] bg-[#0B0F19]/90 backdrop-blur" 
            : "border-transparent md:border-[#E0E0E0] bg-white/50 backdrop-blur"
        }`}>
          <NotificationCenter dark={isDark} />
        </div>
        <div className={`flex-1 ${isDark ? "p-4 sm:p-6 lg:p-8" : "p-6 md:p-8"}`}>
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

