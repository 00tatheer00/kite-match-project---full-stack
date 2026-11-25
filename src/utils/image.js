export function toImgSrc(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.src) return val.src;
  return String(val);
}

export default toImgSrc;

// Supabase Storage pictures are uploaded at full size. Route them through Next's
// image optimizer (Vercel) so phones get a resized WebP/AVIF instead of the original.
// Widths must be in Next's default imageSizes/deviceSizes.
const OPTIMIZABLE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\//i;

export function optimizedSrc(val, width = 640, quality = 75) {
  const url = toImgSrc(val);
  if (!OPTIMIZABLE.test(url)) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}

/** srcSet for a Supabase picture, e.g. optimizedSrcSet(url, [384, 640, 828]) */
export function optimizedSrcSet(val, widths = [384, 640, 828]) {
  const url = toImgSrc(val);
  if (!OPTIMIZABLE.test(url)) return undefined;
  return widths.map((w) => `${optimizedSrc(url, w)} ${w}w`).join(", ");
}
