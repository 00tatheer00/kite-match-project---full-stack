'use client';

import { useAdminTheme } from '@/context/AdminThemeContext';

/**
 * Skeleton placeholders for the admin panel: grey shapes in the layout of the real
 * content, shown while data loads, so the page never looks empty or broken.
 */
function useBlock() {
  const { isDark } = useAdminTheme();
  return {
    isDark,
    block: isDark ? 'bg-slate-800/80' : 'bg-slate-200/80',
    card: isDark ? 'bg-[#111726] border-[#1E293B]' : 'bg-white border-slate-200',
  };
}

const Bar = ({ className = '', cls }) => <div className={`rounded-md animate-pulse ${cls} ${className}`} />;

/** A list/table: image + text lines + action buttons per row. */
export function SkeletonTable({ rows = 6, label = 'Loading…' }) {
  const { block, card } = useBlock();
  return (
    <div className={`border rounded-2xl p-5 md:p-6 shadow-sm ${card}`} aria-busy="true" aria-label={label}>
      <div className="flex flex-wrap gap-2 mb-6">
        <Bar cls={block} className="h-10 w-44 rounded-xl" />
        <Bar cls={block} className="h-10 w-40 rounded-xl" />
        <div className="flex-1" />
        <Bar cls={block} className="h-9 w-56 rounded-xl" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Bar cls={block} className="h-11 w-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Bar cls={block} className="h-3.5 w-1/3" />
              <Bar cls={block} className="h-3 w-1/5" />
            </div>
            <Bar cls={block} className="hidden md:block h-6 w-20 rounded-full" />
            <Bar cls={block} className="hidden md:block h-4 w-16" />
            <Bar cls={block} className="h-8 w-16 rounded-lg" />
            <Bar cls={block} className="hidden sm:block h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** A grid of stat cards (dashboard / analytics). */
export function SkeletonStatCards({ count = 4 }) {
  const { block, card } = useBlock();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`p-5 rounded-2xl border ${card}`}>
          <Bar cls={block} className="h-10 w-10 rounded-xl mb-4" />
          <Bar cls={block} className="h-8 w-16 mb-3" />
          <Bar cls={block} className="h-3.5 w-2/3 mb-2" />
          <Bar cls={block} className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Two big panels (charts / city lists). */
export function SkeletonPanels() {
  const { block, card } = useBlock();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" aria-busy="true">
      <div className={`lg:col-span-2 rounded-2xl border p-6 space-y-4 ${card}`}>
        <Bar cls={block} className="h-5 w-1/3" />
        <Bar cls={block} className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} cls={block} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className={`rounded-2xl border p-6 space-y-3 ${card}`}>
        <Bar cls={block} className="h-5 w-1/2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} cls={block} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Dashboard / analytics page while loading. */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <SkeletonStatCards />
      <SkeletonPanels />
    </div>
  );
}

/** A settings-style form. */
export function SkeletonForm({ fields = 6 }) {
  const { block, card } = useBlock();
  return (
    <div className={`border rounded-2xl p-6 space-y-5 ${card}`} aria-busy="true">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bar cls={block} className="h-3.5 w-40" />
          <Bar cls={block} className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Bar cls={block} className="h-11 w-36 rounded-xl" />
    </div>
  );
}

/** Whole admin screen (used while the login session is being checked). */
export function SkeletonAdminScreen() {
  const { isDark, block } = useBlock();
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#080C14]' : 'bg-slate-50'}`} aria-busy="true" aria-label="Opening admin panel">
      <div className={`hidden md:flex w-64 flex-col gap-3 p-5 border-r ${isDark ? 'border-[#1E293B]' : 'border-slate-200 bg-white'}`}>
        <Bar cls={block} className="h-8 w-32 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} cls={block} className="h-9 rounded-xl" />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-6">
        <Bar cls={block} className="h-8 w-64" />
        <SkeletonDashboard />
      </div>
    </div>
  );
}
