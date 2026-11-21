'use client';

import toast from 'react-hot-toast';

/**
 * Admin toast helper. Uses the same react-hot-toast <Toaster> as the rest of the
 * site (mounted in ClientShell), so every message looks and behaves the same.
 *   import { notify } from '@/components/admin/AdminToast';
 *   notify.success('Saved'); notify.error('Could not save');
 */
export const notify = {
  success: (message) => message && toast.success(String(message)),
  // Errors stay longer so a non-technical user has time to read them.
  error: (message) => message && toast.error(String(message), { duration: 8000 }),
};

// Kept for compatibility with AdminLayout; the shared Toaster renders the messages.
export function AdminToaster() {
  return null;
}
