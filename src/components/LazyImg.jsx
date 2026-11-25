'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * <img> for pictures below the fold. Chrome's native loading="lazy" still starts
 * downloads up to ~2500 px away on slow connections, which competes with the hero
 * image (LCP) on phones. This only sets `src` once the image is close to the
 * viewport. A <noscript> copy keeps the picture visible to non-JS crawlers.
 */
export default function LazyImg({ src, srcSet, sizes, rootMargin = '300px', ...props }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <>
      <img
        ref={ref}
        src={show ? src : undefined}
        srcSet={show ? srcSet : undefined}
        sizes={sizes}
        decoding="async"
        {...props}
      />
      <noscript>
        <img src={src} alt={props.alt || ''} className={props.className} />
      </noscript>
    </>
  );
}
