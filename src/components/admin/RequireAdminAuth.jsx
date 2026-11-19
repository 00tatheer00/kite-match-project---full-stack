'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RequireAdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : null;
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
      if (match) {
        try {
          token = decodeURIComponent(match[1]);
          localStorage.setItem("adminToken", token);
        } catch {}
      }
    }
    if (!token) {
      router.replace("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, [router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-500 text-sm">
        Verifying admin session...
      </div>
    );
  }

  return children;
};

export default RequireAdminAuth;
