'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useParams as useNextParams } from 'next/navigation';

export function Link({ to, href, children, ...props }) {
  const target = href || to || '#';
  return (
    <NextLink href={target} {...props}>
      {children}
    </NextLink>
  );
}

let inMemoryNavigationState = null;

export function useNavigate() {
  const router = useRouter();
  return (to, options) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      return;
    }

    if (options?.state) {
      inMemoryNavigationState = options.state;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('__router_compat_state', JSON.stringify(options.state));
        } catch {
          // ignore storage quota issues
        }
      }
    }

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
  const [state, setState] = useState(() => inMemoryNavigationState);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search);
      setHash(window.location.hash);
      if (inMemoryNavigationState != null) {
        setState(inMemoryNavigationState);
      } else {
        try {
          const stored = sessionStorage.getItem('__router_compat_state');
          if (stored) {
            setState(JSON.parse(stored));
          }
        } catch {
          // ignore
        }
      }
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
