import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'kite-production-secret-jwt-key-2026-secure';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = String(body.email || '').trim().toLowerCase();
    const rawPassword = String(body.password || '');

    const configuredEmail = String(process.env.ADMIN_EMAIL || 'admin@kitepk.com').trim().toLowerCase();
    const configuredPassword = process.env.ADMIN_PASSWORD || 'Impossible@890';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    let authenticated = false;

    // Allowed admin emails
    const validEmails = [configuredEmail, 'admin@kitepk.com', 'info@kitepk.com'];
    if (validEmails.includes(rawEmail)) {
      // Check passwords (Impossible@890, configuredPassword, or admin123)
      if (
        rawPassword === 'Impossible@890' ||
        rawPassword === configuredPassword ||
        rawPassword === 'admin123'
      ) {
        authenticated = true;
      } else if (adminPasswordHash) {
        try {
          if (await bcrypt.compare(rawPassword, adminPasswordHash)) {
            authenticated = true;
          }
        } catch {
          // ignore bcrypt comparison error
        }
      }
    }

    if (authenticated) {
      const token = jwt.sign(
        { email: rawEmail, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return NextResponse.json({ token, success: true, email: rawEmail });
    }

    // Try remote fallback to live backend
    try {
      const { postRemoteFallback } = await import('@/lib/api-fallback');
      const remoteRes = await postRemoteFallback('/admin/login', { email: rawEmail, password: rawPassword });
      if (remoteRes?.token) {
        return NextResponse.json(remoteRes);
      }
    } catch {
      // remote fallback failed
    }

    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
