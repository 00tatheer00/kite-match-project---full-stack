// Input validation & sanitization helpers for customer-facing endpoints.

// Pakistani mobile numbers: 03XXXXXXXXX, 923XXXXXXXXX, +923XXXXXXXXX
export const PK_PHONE_REGEX = /^(?:\+92|92|0)3\d{9}$/;
const EMAIL_REGEX = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

// Strip control characters (except newline/tab) and trim.
export function cleanText(value, maxLength) {
  const str = String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
  return maxLength ? str.slice(0, maxLength) : str;
}

export function normalizePhone(value) {
  return String(value ?? '').replace(/[\s()-]/g, '');
}

/**
 * Canonical Pakistani format: 03XXXXXXXXX
 */
export function canonicalPhone(value) {
  const p = normalizePhone(value);
  if (p.startsWith('+92')) return '0' + p.slice(3);
  if (p.startsWith('92')) return '0' + p.slice(2);
  return p;
}

export function isValidEmail(value) {
  const v = String(value ?? '').trim();
  return v.length > 3 && v.length <= 254 && EMAIL_REGEX.test(v);
}

/**
 * Validate customer details. Returns { ok, errors, value }.
 */
export function validateCustomer(input = {}) {
  const errors = [];
  const name = cleanText(input.customerName, 100);
  const phoneRaw = normalizePhone(input.phone);
  const email = cleanText(input.email, 254).toLowerCase();
  const address = cleanText(input.address, 500);
  const city = cleanText(input.city, 100);
  const note = cleanText(input.note, 1000);

  if (name.length < 2) errors.push('Please enter your full name.');
  if (!PK_PHONE_REGEX.test(phoneRaw)) errors.push('Enter a valid Pakistani mobile number (03xxxxxxxxx).');
  if (!isValidEmail(email)) errors.push('Enter a valid email address.');
  if (address.length < 5) errors.push('Please enter your complete delivery address.');
  if (city.length < 2) errors.push('Please enter your city.');

  return {
    ok: errors.length === 0,
    errors,
    value: {
      customerName: name,
      phone: canonicalPhone(phoneRaw),
      email,
      address,
      city,
      note: note || null,
    },
  };
}

export function parseQuantity(value, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > max) return null;
  return n;
}
