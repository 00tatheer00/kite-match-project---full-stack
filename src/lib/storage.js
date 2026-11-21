import sharp from 'sharp';
import { getSupabaseAdmin } from './supabase';

/**
 * Image uploads → Supabase Storage bucket `kite-images`.
 * Images are re-encoded to WebP (max 1280px wide), which also strips metadata
 * and neutralizes malformed/malicious files. SVG and other vector formats are rejected.
 */

const BUCKET = 'kite-images';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export class UploadError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function slugify(name) {
  return (
    String(name || 'image')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'image'
  );
}

export async function uploadImageBuffer(file, { folder = 'products' } = {}) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new UploadError('Invalid file upload.');
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Image is too large (max 8 MB).');
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    throw new UploadError('Unsupported image type. Use JPG, PNG, WebP, AVIF or GIF.');
  }

  const sb = getSupabaseAdmin();
  if (!sb) throw new UploadError('Image storage is not configured.', 503);

  let optimized;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
    if (!meta.format || meta.format === 'svg') throw new Error('unsupported format');
    optimized = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1280, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new UploadError('The uploaded file is not a valid image.');
  }

  const safeFolder = String(folder).replace(/[^a-zA-Z0-9-_/]/g, '').replace(/^\/+|\/+$/g, '') || 'products';
  const storagePath = `${safeFolder}/${Date.now()}-${slugify(file.name)}.webp`;

  const { error } = await sb.storage.from(BUCKET).upload(storagePath, optimized, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.error('[storage] Upload failed:', error.message);
    throw new UploadError('Image upload failed. Please try again.', 502);
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
  if (!data?.publicUrl) throw new UploadError('Image upload failed. Please try again.', 502);
  return data.publicUrl;
}
