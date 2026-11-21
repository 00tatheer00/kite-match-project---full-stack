'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Page-change loader: a thin brand-coloured bar at the top of the screen plus a small
 * "Loading…" pill, shown from the moment a link is clicked until the new page renders.
 *
 * Starts on: clicks on internal <a> links, and the `kite:navstart` event
 * (dispatched by RouterCompat's navigate()). Finishes when the URL changes.
 */
export const NAV_START_EVENT = 'kite:navstart';

export function startNavigationProgress() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NAV_START_EVENT));
}

function isInternalNavigation(anchor, event) {
  if (!anchor || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  let url;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  // Same page (only the #hash differs) → no page load.
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0); // 0 = hidden
  const [showPill, setShowPill] = useState(false);
  const timers = useRef([]);
  const active = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t) || clearInterval(t));
    timers.current = [];
  };

  const start = () => {
    if (active.current) return;
    active.current = true;
    clearTimers();
    setProgress(8);
    // Trickle towards 90% while waiting for the server.
    const trickle = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.08) : p));
    }, 200);
    // Only show the "Loading…" pill when the wait is noticeable.
    const pill = setTimeout(() => setShowPill(true), 450);
    // Safety: never leave the bar stuck (e.g. navigation cancelled).
    const safety = setTimeout(() => done(), 8000);
    timers.current.push(trickle, pill, safety);
  };

  const done = () => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setShowPill(false);
    setProgress(100);
    timers.current.push(setTimeout(() => setProgress(0), 300));
  };

  // URL changed → the new page is on screen.
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target?.closest?.('a');
      if (isInternalNavigation(anchor, event)) start();
    };
    const onStart = () => start();
    document.addEventListener('click', onClick, true);
    window.addEventListener(NAV_START_EVENT, onStart);
    window.addEventListener('popstate', onStart);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener(NAV_START_EVENT, onStart);
      window.removeEventListener('popstate', onStart);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (progress === 0) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[1000] h-[3px] pointer-events-none"
        role="progressbar"
        aria-label="Loading page"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#00AEEF] shadow-[0_0_8px_#00AEEF] transition-[width,opacity] duration-200 ease-out"
          style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
        />
      </div>
      {showPill && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none flex items-center gap-2 rounded-full bg-white/95 border border-slate-200 shadow-lg px-4 py-2 text-sm font-semibold text-slate-700">
          <span className="w-4 h-4 rounded-full border-2 border-[#00AEEF] border-t-transparent animate-spin" aria-hidden="true" />
          Loading…
        </div>
      )}
    </>
  );
}
