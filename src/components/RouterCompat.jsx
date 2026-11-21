'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useParams as useNextParams } from 'next/navigation';
import { startNavigationProgress } from '@/components/NavigationProgress';

// Next.js default prefetching (visible links are fetched in the background) so page changes
// feel instant; pass prefetch={false} to opt a link out.
export function Link({ to, href, children, prefetch, ...props }) {
  const target = href || to || '#';
  return (
    <NextLink href={target} prefetch={prefetch} {...props}>
      {children}
    </NextLink>
  );
}

// Navigation state (react-router style) is scoped to the destination path, so state meant
// for one page (e.g. order details for /order-success/x) never leaks into another page.
let inMemoryNavigationState = null; // { path, state }
const STATE_KEY = '__router_compat_state';
const pathOf = (to) => String(to || '').split('?')[0].split('#')[0];

export function useNavigate() {
  const router = useRouter();
  return (to, options) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      return;
    }

    const entry = options?.state ? { path: pathOf(to), state: options.state } : null;
    inMemoryNavigationState = entry;
    if (typeof window !== 'undefined') {
      try {
        if (entry) sessionStorage.setItem(STATE_KEY, JSON.stringify(entry));
        else sessionStorage.removeItem(STATE_KEY);
      } catch {
        // ignore storage quota issues
      }
    }

    startNavigationProgress();
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const [search, setSearch] = useState('');
  const [hash, setHash] = useState('');
  const [state, setState] = useState(() =>
    inMemoryNavigationState?.path === pathname ? inMemoryNavigationState.state : null
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search);
      setHash(window.location.hash);
      let entry = inMemoryNavigationState;
      if (!entry) {
        try {
          const stored = sessionStorage.getItem(STATE_KEY);
          entry = stored ? JSON.parse(stored) : null;
        } catch {
          entry = null;
        }
      }
      setState(entry && entry.path === pathname ? entry.state : null);
    }
  }, [pathname]);

  return {
    pathname,
    search,
    hash,
    state,
  };
}

export function useParams() {
  return useNextParams() || {};
}

export function Navigate({ to, replace = true }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

export default Link;
