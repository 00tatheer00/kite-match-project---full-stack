'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCheckSession } from '@/services/api';
import { SkeletonAdminScreen } from './AdminSkeleton';

/**
 * Client-side guard for admin pages. The real protection is server-side:
 * every /api/admin/* route verifies the httpOnly session cookie.
 */
const RequireAdminAuth = ({ children }) => {
  const [status, setStatus] = useState('checking'); // checking | ok
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    adminCheckSession().then((ok) => {
      if (cancelled) return;
      if (ok) setStatus('ok');
      else router.replace('/admin/login');
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status !== 'ok') {
    return <SkeletonAdminScreen />;
  }

  return children;
};

export default RequireAdminAuth;
