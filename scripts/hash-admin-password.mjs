#!/usr/bin/env node
/**
 * Generate a bcrypt hash for the admin password and a random JWT secret.
 *
 * Usage:
 *   node scripts/hash-admin-password.mjs "YourNewStrongPassword"
 *
 * Then set in Vercel → Project → Settings → Environment Variables:
 *   ADMIN_PASSWORD_HASH=<printed hash>     (and DELETE the old ADMIN_PASSWORD variable)
 *   ADMIN_JWT_SECRET=<printed secret>
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Please pass a password with at least 12 characters:');
  console.error('  node scripts/hash-admin-password.mjs "YourNewStrongPassword"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log('\nADMIN_PASSWORD_HASH=' + hash);
console.log('ADMIN_JWT_SECRET=' + crypto.randomBytes(48).toString('base64url'));
console.log('\nTip: in .env files, wrap the hash in single quotes because it contains "$" characters.\n');
