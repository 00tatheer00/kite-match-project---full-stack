'use client';

import { useAdminTheme } from '@/context/AdminThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggleBtn({ variant = 'header' }) {
  const { isDark, toggleTheme } = useAdminTheme();

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer font-medium text-sm ${
          isDark
            ? 'bg-[#131823] border-[#1E293B] text-slate-200 hover:text-white hover:border-slate-600'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
        }`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <FaMoon className="text-purple-400 text-base" />
          ) : (
            <FaSun className="text-amber-500 text-base" />
          )}
          <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
        </div>
        <div
          className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors ${
            isDark ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
        </div>
      </button>
    );
  }

  // Header pill variant (default)
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all cursor-pointer shadow-sm ${
        isDark
          ? 'bg-[#161D2E] hover:bg-[#1E293B] border-[#1E293B] hover:border-slate-500 text-slate-200 hover:text-white'
          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
      }`}
      title={`Click to switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Light and Dark Mode"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-100 text-amber-600'
        }`}
      >
        {isDark ? <FaMoon className="text-xs" /> : <FaSun className="text-xs" />}
      </div>
      <span className="text-xs font-bold tracking-wide">
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </span>
      <span
        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
          isDark
            ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
