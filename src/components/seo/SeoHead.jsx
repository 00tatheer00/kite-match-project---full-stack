'use client';

import { useEffect } from 'react';

/**
 * Legacy per-page SEO helper.
 *
 * Titles, descriptions, canonical URLs and OpenGraph tags are now rendered on the
 * server through each route's `metadata` export, so this component no longer
 * overwrites them from the browser (that used to replace good server titles with
 * generic ones like "Product Details" after hydration).
 *
 * It only adds a robots `noindex` tag for client-side states that must not be
 * indexed (e.g. "Product Not Found", checkout).
 */
const SeoHead = ({ noindex = false }) => {
  useEffect(() => {
    if (!noindex) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.setAttribute('data-seohead', 'true');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [noindex]);

  return null;
};

export default SeoHead;
