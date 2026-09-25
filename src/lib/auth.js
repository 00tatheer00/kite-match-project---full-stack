import jwt from 'jsonwebtoken';

export function verifyAdminAuth(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'change-me');
    return { email: decoded.email };
  } catch (err) {
    return null;
  }
}
