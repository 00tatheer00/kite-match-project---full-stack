'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/services/api';

/**
 * Picture of a safety-match brand as set in the admin panel
 * (Products & Prices → brand size → picture). Returns '' until loaded or if none is set,
 * so pages can fall back to their built-in picture.
 *   const img = useBrandImage('Bird');
 */
export default function useBrandImage(brandKeyword) {
  const [image, setImage] = useState('');

  useEffect(() => {
    let alive = true;
    getProducts({ forceRefresh: true })
      .then((products) => {
        const brands = (products || []).flatMap((p) => p?.brands || []);
        const key = String(brandKeyword || '').toLowerCase();
        const brand = brands.find((b) => String(b?.name || '').toLowerCase().includes(key));
        const src = brand?.image?.src || brand?.image || '';
        if (alive && src) setImage(src);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [brandKeyword]);

  return image;
}
