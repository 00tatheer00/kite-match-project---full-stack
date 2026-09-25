import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let authenticated = false;

    // Check local credentials if configured
    if (adminEmail && email === adminEmail) {
      if (adminPassword && password === adminPassword) {
        authenticated = true;
      } else if (adminPasswordHash) {
        try {
          if (await bcrypt.compare(password, adminPasswordHash)) {
            authenticated = true;
          }
        } catch {
          // bcrypt mismatch
        }
      }
    }

    if (authenticated) {
      const token = jwt.sign(
        { email },
        process.env.ADMIN_JWT_SECRET || 'kite-local-jwt-secret-key-12345',
        { expiresIn: '8h' }
      );
      return NextResponse.json({ token });
    }

    // Try remote fallback to live backend
    try {
      const { postRemoteFallback } = await import('@/lib/api-fallback');
      const remoteRes = await postRemoteFallback('/admin/login', { email, password });
      if (remoteRes?.token) {
        return NextResponse.json(remoteRes);
      }
    } catch (remoteErr) {
      return NextResponse.json(
        { message: remoteErr.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
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
