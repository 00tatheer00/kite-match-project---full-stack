export function toImgSrc(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.src) return val.src;
  return String(val);
}

export default toImgSrc;
