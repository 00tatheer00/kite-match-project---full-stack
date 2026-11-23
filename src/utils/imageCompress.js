/**
 * Shrinks pictures in the browser BEFORE upload.
 *
 * Why: Vercel rejects any request over ~4.5 MB with "413 Payload Too Large" before it
 * reaches our server, and phone/camera photos are often 3-12 MB. Every admin upload
 * (product, size, brand, package, banner) goes through compressImage first.
 *
 * Result: WebP (or JPEG where WebP encoding is unsupported), longest side <= maxSide,
 * usually 150 KB - 1 MB. Small images are left untouched.
 */
const SKIP_BELOW_BYTES = 450 * 1024;
const TARGET_BYTES = 1.2 * 1024 * 1024;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> decoding */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode failed'));
    };
    img.src = url;
  });
}

export async function compressImage(file, { maxSide = 2000 } = {}) {
  if (typeof window === 'undefined' || !(file instanceof Blob)) return file;
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type || '')) return file; // leave other types to the server checks

  let source;
  try {
    source = await decode(file);
  } catch {
    return file;
  }
  const w = source.width || source.naturalWidth;
  const h = source.height || source.naturalHeight;
  if (!w || !h) return file;
  if (file.size <= SKIP_BELOW_BYTES && Math.max(w, h) <= maxSide) return file;

  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  if (typeof source.close === 'function') source.close();

  let type = 'image/webp';
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, type, quality);
  if (!blob || blob.type !== 'image/webp') {
    type = 'image/jpeg';
    blob = await canvasToBlob(canvas, type, quality);
  }
  while (blob && blob.size > TARGET_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, type, quality);
  }
  if (!blob || blob.size >= file.size) return file;

  const base = (file.name || 'image').replace(/\.[^.]+$/, '');
  return new File([blob], `${base}.${type === 'image/webp' ? 'webp' : 'jpg'}`, { type, lastModified: Date.now() });
}

const isFile = (v) => typeof File !== 'undefined' && v instanceof File;

/** Compress every File inside a plain object (top-level File or arrays of Files/nulls). */
export async function compressFilesIn(data, options) {
  const out = { ...data };
  for (const [key, value] of Object.entries(out)) {
    if (isFile(value)) out[key] = await compressImage(value, options);
    else if (Array.isArray(value) && value.some(isFile)) {
      out[key] = await Promise.all(value.map((v) => (isFile(v) ? compressImage(v, options) : v)));
    }
  }
  return out;
}

/** Same for a FormData (used by the settings banner upload). */
export async function compressFormData(fd, options) {
  const next = new FormData();
  for (const [key, value] of fd.entries()) {
    next.append(key, isFile(value) ? await compressImage(value, options) : value);
  }
  return next;
}

// Vercel's request limit is 4.5 MB; keep a margin for the other form fields.
export const MAX_REQUEST_FILE_BYTES = 4 * 1024 * 1024;

export function totalFileBytes(data) {
  let total = 0;
  const add = (v) => {
    if (isFile(v)) total += v.size;
  };
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    for (const [, v] of data.entries()) add(v);
  } else {
    Object.values(data || {}).forEach((v) => (Array.isArray(v) ? v.forEach(add) : add(v)));
  }
  return total;
}
