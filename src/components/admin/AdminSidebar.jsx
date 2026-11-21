'use client';

import { Link } from '@/components/RouterCompat';
import {
  LayoutDashboard,
  Package,
  Gift,
  ShoppingBag,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import ThemeToggleBtn from './ThemeToggleBtn';
import InstallAppBtn from './InstallAppBtn';
import DeveloperCredit from '../DeveloperCredit';

/**
 * Admin navigation (shared by the desktop sidebar and the mobile drawer).
 * Clean, soft style: grouped sections, icons, gradient "pill" for the active page.
 */
const GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/analytics', label: 'Visitors & Analytics', icon: BarChart3, live: true },
    ],
  },
  {
    label: 'Store',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/admin/products', label: 'Products & Prices', icon: Package },
      { to: '/admin/promotions', label: 'Packages & Deals', icon: Gift },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/admin/settings', label: 'Settings', icon: Settings }],
  },
];

export default function AdminSidebar({ pathname, isDark, onNavigate, onLogout }) {
  const muted = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <Link to="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3 group">
          <span className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#ED028C] p-[2px] shadow-lg shadow-sky-500/20">
            <span className={`flex items-center justify-center w-full h-full rounded-[14px] ${isDark ? 'bg-[#0B0F19]' : 'bg-white'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
            </span>
          </span>
          <span className="min-w-0">
            <span className={`block text-[15px] font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Kite Admin
            </span>
            <span className={`flex items-center gap-1.5 text-[11px] font-medium ${muted}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Business panel · Online
            </span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-3" aria-label="Admin">
        {GROUPS.map((group) => (
          <div key={group.label} className="mt-3 first:mt-1">
            <p className={`px-3 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] ${muted}`}>{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all ${
                        active
                          ? isDark
                            ? 'bg-gradient-to-r from-sky-500/15 to-pink-500/10 text-white'
                            : 'bg-gradient-to-r from-sky-50 to-pink-50 text-slate-900 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.15)]'
                          : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-white/5'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-[#00AEEF] to-[#ED028C]" />}
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          active
                            ? 'bg-gradient-to-br from-[#00AEEF] to-[#0090C8] text-white shadow-md shadow-sky-500/25'
                            : isDark
                              ? 'bg-white/5 text-slate-400'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon size={16} strokeWidth={2.2} />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.live && (
                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500">
                          LIVE
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-4 px-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold border border-dashed transition-colors ${
              isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'
            }`}
          >
            <ExternalLink size={15} />
            <span>View live website</span>
          </a>
        </div>
      </nav>

      {/* Footer: app + theme, profile, credit */}
      <div className={`shrink-0 px-3 pt-3 pb-4 space-y-2.5 border-t ${isDark ? 'border-white/5' : 'border-slate-200/80'}`}>
        <InstallAppBtn variant="sidebar" />
        <ThemeToggleBtn variant="sidebar" />

        <div className={`flex items-center gap-3 rounded-2xl p-2.5 ${isDark ? 'bg-white/5' : 'bg-slate-100/80'}`}>
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#00AEEF] to-[#ED028C] text-white text-sm font-black">
            K
          </span>
          <span className="flex-1 min-w-0">
            <span className={`block text-[13px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Administrator</span>
            <span className={`block text-[11px] truncate ${muted}`}>kitepk.com</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut size={17} />
          </button>
        </div>

        <DeveloperCredit className={`px-1 ${muted}`} />
      </div>
    </div>
  );
}
