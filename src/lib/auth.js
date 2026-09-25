import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'kite-production-secret-jwt-key-2026-secure';

export function verifyAdminAuth(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { email: decoded.email, role: decoded.role || 'admin' };
  } catch (err) {
    return null;
  }
}
