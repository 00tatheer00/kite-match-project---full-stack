export const SITE_URL = "https://kitepk.com";
export const SITE_NAME = "Kite Brand Pakistan";
export const DEFAULT_DESCRIPTION =
  "Kite Brand by Aziz Group delivers trusted FMCG products, safety matches, detergents, and export services from Pakistan.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.ico`;

export function toAbsoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
